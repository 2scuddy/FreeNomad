import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
} from "@playwright/test";
import axios from "axios";
import {
  BrowserConfig,
  DeviceProfile,
  TestExecutionConfig,
  PerformanceThresholds,
} from "../config/browser-config";
import { TestReporter } from "../reporting/test-reporter";
import {
  PerformanceMonitor,
  PerformanceMetrics,
} from "../monitoring/performance-monitor";
import {
  VisualRegressionTester,
  VisualDiffResult,
} from "../visual/visual-regression";
import { ErrorHandler } from "../utils/error-handler";
import { WaitStrategies } from "../utils/wait-strategies";

// Define Axios types locally to avoid import issues
type AxiosInstance = any;
type AxiosRequestConfig = any;
type AxiosResponse = any;

export interface TestCase {
  id: string;
  name: string;
  description: string;
  objective: string;
  steps: TestStep[];
  expectedOutcome: string;
  tags: string[];
  priority: "high" | "medium" | "low";
  timeout?: number;
}

export interface TestStep {
  action: string;
  target?: string;
  value?: string;
  expectedResult?: string;
  screenshot?: boolean;
  waitStrategy?: "networkIdle" | "domContentLoaded" | "load" | "custom";
  customWait?: number;
}

export interface TestResult {
  testId: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: Error;
  screenshots: string[];
  logs: string[];
  networkActivity: NetworkActivity[];
  performanceMetrics: PerformanceMetrics;
  visualDiff?: VisualDiffResult;
}

export interface NetworkActivity {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  size: number;
  timestamp: number;
}

export class TestFramework {
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  private axiosInstance: AxiosInstance;
  private reporter: TestReporter;
  private performanceMonitor: PerformanceMonitor;
  private visualTester: VisualRegressionTester;
  private errorHandler: ErrorHandler;
  private waitStrategies: WaitStrategies;

  constructor(
    private config: TestExecutionConfig,
    private performanceThresholds: PerformanceThresholds
  ) {
    this.axiosInstance = axios.create({
      timeout: 10000,
      validateStatus: () => true, // Don't throw on HTTP errors
    });

    this.reporter = new TestReporter();
    this.performanceMonitor = new PerformanceMonitor(performanceThresholds);
    this.visualTester = new VisualRegressionTester();
    this.errorHandler = new ErrorHandler(config.retryAttempts);
    this.waitStrategies = new WaitStrategies();

    this.setupAxiosInterceptors();
  }

  private setupAxiosInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error: any) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: any) => {
        console.error("API Response Error:", error);
        return Promise.reject(error);
      }
    );
  }

  async initializeBrowser(browserConfig: BrowserConfig): Promise<string> {
    const browserId = `${browserConfig.name}-${Date.now()}`;

    let browser: Browser;
    switch (browserConfig.type) {
      case "chromium":
        browser = await chromium.launch({ headless: browserConfig.headless });
        break;
      case "firefox":
        browser = await firefox.launch({ headless: browserConfig.headless });
        break;
      case "webkit":
        browser = await webkit.launch({ headless: browserConfig.headless });
        break;
      default:
        throw new Error(`Unsupported browser type: ${browserConfig.type}`);
    }

    this.browsers.set(browserId, browser);

    const context = await browser.newContext({
      viewport: browserConfig.viewport,
      userAgent: browserConfig.userAgent,
      deviceScaleFactor: browserConfig.deviceScaleFactor,
      isMobile: browserConfig.isMobile,
      hasTouch: browserConfig.hasTouch,
      recordVideo: this.config.videoOnFailure
        ? { dir: "test-results/videos" }
        : undefined,
      recordHar: { path: `test-results/network/${browserId}.har` },
    });

    this.contexts.set(browserId, context);

    const page = await context.newPage();
    this.pages.set(browserId, page);

    // Setup page event listeners
    this.setupPageListeners(page, browserId);

    return browserId;
  }

  private setupPageListeners(page: Page, browserId: string): void {
    // Console logs
    page.on("console", msg => {
      this.reporter.addLog(browserId, `Console ${msg.type()}: ${msg.text()}`);
    });

    // Network requests
    page.on("request", request => {
      this.reporter.addNetworkActivity(browserId, {
        url: request.url(),
        method: request.method(),
        status: 0,
        responseTime: 0,
        size: 0,
        timestamp: Date.now(),
      });
    });

    // Network responses
    page.on("response", response => {
      const request = response.request();
      this.reporter.updateNetworkActivity(browserId, request.url(), {
        status: response.status(),
        responseTime:
          Date.now() -
          this.reporter.getRequestTimestamp(browserId, request.url()),
        size: parseInt(response.headers()["content-length"] || "0"),
      });
    });

    // Page errors
    page.on("pageerror", error => {
      this.reporter.addLog(browserId, `Page Error: ${error.message}`);
    });
  }

  async executeTestCase(
    testCase: TestCase,
    browserConfigs: BrowserConfig[]
  ): Promise<Map<string, TestResult>> {
    const results = new Map<string, TestResult>();

    // Execute test in parallel across browsers if configured
    if (this.config.parallel) {
      const promises = browserConfigs.map(config =>
        this.executeTestOnBrowser(testCase, config)
      );

      const browserResults = await Promise.allSettled(promises);

      browserResults.forEach((result, index) => {
        const browserConfig = browserConfigs[index];
        if (result.status === "fulfilled") {
          results.set(browserConfig.name, result.value);
        } else {
          results.set(browserConfig.name, {
            testId: testCase.id,
            status: "failed",
            duration: 0,
            error: new Error(result.reason),
            screenshots: [],
            logs: [],
            networkActivity: [],
            performanceMetrics: this.getEmptyPerformanceMetrics(),
          });
        }
      });
    } else {
      // Execute sequentially
      for (const config of browserConfigs) {
        const result = await this.executeTestOnBrowser(testCase, config);
        results.set(config.name, result);
      }
    }

    return results;
  }

  private async executeTestOnBrowser(
    testCase: TestCase,
    browserConfig: BrowserConfig
  ): Promise<TestResult> {
    const startTime = Date.now();
    let browserId: string | null = null;

    try {
      browserId = await this.initializeBrowser(browserConfig);
      const page = this.pages.get(browserId)!;

      // Start performance monitoring
      await this.performanceMonitor.startMonitoring(page);

      // Execute test steps
      for (const step of testCase.steps) {
        await this.executeTestStep(page, step, browserId);
      }

      // Get performance metrics
      const performanceMetrics = await this.performanceMonitor.getMetrics(page);

      // Take final screenshot
      const finalScreenshot = await this.takeScreenshot(
        page,
        `${testCase.id}-final`
      );

      const duration = Date.now() - startTime;

      return {
        testId: testCase.id,
        status: "passed",
        duration,
        screenshots: [
          finalScreenshot,
          ...this.reporter.getScreenshots(browserId),
        ],
        logs: this.reporter.getLogs(browserId),
        networkActivity: this.reporter.getNetworkActivity(browserId),
        performanceMetrics,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Take screenshot on failure
      let failureScreenshot = "";
      if (browserId && this.config.screenshotOnFailure) {
        const page = this.pages.get(browserId);
        if (page) {
          failureScreenshot = await this.takeScreenshot(
            page,
            `${testCase.id}-failure`
          );
        }
      }

      return {
        testId: testCase.id,
        status: "failed",
        duration,
        error: error as Error,
        screenshots: failureScreenshot ? [failureScreenshot] : [],
        logs: browserId ? this.reporter.getLogs(browserId) : [],
        networkActivity: browserId
          ? this.reporter.getNetworkActivity(browserId)
          : [],
        performanceMetrics: this.getEmptyPerformanceMetrics(),
      };
    } finally {
      if (browserId) {
        await this.cleanup(browserId);
      }
    }
  }

  private async executeTestStep(
    page: Page,
    step: TestStep,
    browserId: string
  ): Promise<void> {
    this.reporter.addLog(browserId, `Executing step: ${step.action}`);

    switch (step.action) {
      case "navigate":
        await this.waitStrategies.waitForNavigation(
          page,
          step.target!,
          step.waitStrategy
        );
        break;

      case "click":
        await this.waitStrategies.waitForElement(page, step.target!);
        await page.click(step.target!);
        break;

      case "fill":
        await this.waitStrategies.waitForElement(page, step.target!);
        await page.fill(step.target!, step.value!);
        break;

      case "wait":
        if (step.customWait) {
          await page.waitForTimeout(step.customWait);
        } else {
          await this.waitStrategies.waitForLoadState(
            page,
            step.waitStrategy || "networkIdle"
          );
        }
        break;

      case "screenshot":
        await this.takeScreenshot(page, `${step.action}-${Date.now()}`);
        break;

      case "api_call":
        await this.executeApiCall(step.target!, step.value);
        break;

      default:
        throw new Error(`Unknown test step action: ${step.action}`);
    }

    if (step.screenshot) {
      await this.takeScreenshot(page, `step-${step.action}-${Date.now()}`);
    }
  }

  private async executeApiCall(
    url: string,
    method: string = "GET"
  ): Promise<any> {
    const config: any = {
      method: method.toLowerCase(),
      url,
    };

    return await this.axiosInstance.request(config);
  }

  private async takeScreenshot(page: Page, name: string): Promise<string> {
    const screenshotPath = `test-results/screenshots/${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  private getEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }

  async cleanup(browserId: string): Promise<void> {
    const page = this.pages.get(browserId);
    const context = this.contexts.get(browserId);
    const browser = this.browsers.get(browserId);

    if (page) {
      await page.close();
      this.pages.delete(browserId);
    }

    if (context) {
      await context.close();
      this.contexts.delete(browserId);
    }

    if (browser) {
      await browser.close();
      this.browsers.delete(browserId);
    }
  }

  async cleanupAll(): Promise<void> {
    const browserIds = Array.from(this.browsers.keys());
    await Promise.all(browserIds.map(id => this.cleanup(id)));
  }
}
