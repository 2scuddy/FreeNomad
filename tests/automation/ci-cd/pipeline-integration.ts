import {
  TestFramework,
  TestCase,
  TestResult,
} from "../framework/test-framework";
import {
  BrowserConfig,
  NotificationConfig,
  DEFAULT_EXECUTION_CONFIG,
  DEFAULT_PERFORMANCE_THRESHOLDS,
} from "../config/browser-config";
import { NotificationService } from "./notification-service";
import { TestScheduler } from "./test-scheduler";
import { ReportGenerator } from "../reporting/report-generator";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";

export interface PipelineConfig {
  projectName: string;
  environment: "development" | "staging" | "production";
  baseUrl: string;
  testSuites: TestSuite[];
  browsers: BrowserConfig[];
  notifications: NotificationConfig;
  scheduling: SchedulingConfig;
  reporting: ReportingConfig;
}

export interface TestSuite {
  name: string;
  description: string;
  testCases: TestCase[];
  tags: string[];
  priority: "high" | "medium" | "low";
  parallel: boolean;
}

export interface SchedulingConfig {
  enabled: boolean;
  cron: string; // Cron expression for scheduling
  timezone: string;
  retryFailedTests: boolean;
  maxRetries: number;
}

export interface ReportingConfig {
  formats: ("html" | "json" | "junit" | "pdf")[];
  outputDir: string;
  includeScreenshots: boolean;
  includeVideos: boolean;
  includeNetworkLogs: boolean;
  archiveAfterDays: number;
}

export interface PipelineResult {
  pipelineId: string;
  timestamp: string;
  environment: string;
  duration: number;
  status: "passed" | "failed" | "partial";
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    passRate: number;
  };
  suiteResults: Map<string, SuiteResult>;
  artifacts: string[];
}

export interface SuiteResult {
  suiteName: string;
  status: "passed" | "failed" | "partial";
  duration: number;
  browserResults: Map<string, Map<string, TestResult>>;
}

export class PipelineIntegration {
  private testFramework: TestFramework;
  private notificationService: NotificationService;
  private testScheduler: TestScheduler;
  private reportGenerator: ReportGenerator;

  constructor(private config: PipelineConfig) {
    this.testFramework = new TestFramework(
      DEFAULT_EXECUTION_CONFIG,
      DEFAULT_PERFORMANCE_THRESHOLDS
    );

    this.notificationService = new NotificationService(config.notifications);
    this.testScheduler = new TestScheduler(config.scheduling);
    this.reportGenerator = new ReportGenerator(config.reporting);
  }

  async initializePipeline(): Promise<void> {
    console.log(`Initializing CI/CD pipeline for ${this.config.projectName}`);

    // Create output directories
    await this.ensureDirectories();

    // Initialize scheduler if enabled
    if (this.config.scheduling.enabled) {
      await this.testScheduler.initialize();
      this.testScheduler.schedule(this.config.scheduling.cron, () => {
        this.runPipeline().catch(console.error);
      });
    }

    console.log("Pipeline initialized successfully");
  }

  async runPipeline(triggeredBy: string = "manual"): Promise<PipelineResult> {
    const pipelineId = `pipeline-${Date.now()}`;
    const startTime = Date.now();

    console.log(
      `Starting pipeline ${pipelineId} (triggered by: ${triggeredBy})`
    );

    try {
      // Send start notification
      await this.notificationService.sendStartNotification({
        pipelineId,
        environment: this.config.environment,
        triggeredBy,
        timestamp: new Date().toISOString(),
      });

      const suiteResults = new Map<string, SuiteResult>();

      // Execute test suites
      for (const suite of this.config.testSuites) {
        console.log(`Executing test suite: ${suite.name}`);
        const suiteResult = await this.executeSuite(suite);
        suiteResults.set(suite.name, suiteResult);
      }

      const duration = Date.now() - startTime;
      const pipelineResult = this.calculatePipelineResult(
        pipelineId,
        duration,
        suiteResults
      );

      // Generate reports
      const artifacts = await this.generateReports(pipelineResult);
      pipelineResult.artifacts = artifacts;

      // Send completion notification
      await this.notificationService.sendCompletionNotification(pipelineResult);

      console.log(
        `Pipeline ${pipelineId} completed with status: ${pipelineResult.status}`
      );
      return pipelineResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult: PipelineResult = {
        pipelineId,
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        duration,
        status: "failed",
        summary: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          passRate: 0,
        },
        suiteResults: new Map(),
        artifacts: [],
      };

      // Send failure notification
      await this.notificationService.sendFailureNotification({
        pipelineId,
        error: error as Error,
        environment: this.config.environment,
        duration,
      });

      throw error;
    } finally {
      await this.testFramework.cleanupAll();
    }
  }

  private async executeSuite(suite: TestSuite): Promise<SuiteResult> {
    const startTime = Date.now();
    const browserResults = new Map<string, Map<string, TestResult>>();

    for (const browserConfig of this.config.browsers) {
      console.log(`Running suite '${suite.name}' on ${browserConfig.name}`);

      const testResults = new Map<string, TestResult>();

      if (suite.parallel) {
        // Run tests in parallel
        const promises = suite.testCases.map(testCase =>
          this.testFramework
            .executeTestCase(testCase, [browserConfig])
            .then(results => ({ testCase, results }))
        );

        const parallelResults = await Promise.allSettled(promises);

        parallelResults.forEach((result, index) => {
          const testCase = suite.testCases[index];
          if (result.status === "fulfilled") {
            const browserResult = result.value.results.get(browserConfig.name);
            if (browserResult) {
              testResults.set(testCase.id, browserResult);
            }
          } else {
            testResults.set(testCase.id, {
              testId: testCase.id,
              status: "failed",
              duration: 0,
              error: new Error(result.reason),
              screenshots: [],
              logs: [],
              networkActivity: [],
              performanceMetrics: {
                pageLoadTime: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                cumulativeLayoutShift: 0,
                firstInputDelay: 0,
                timeToInteractive: 0,
                memoryUsage: 0,
                cpuUsage: 0,
              },
            });
          }
        });
      } else {
        // Run tests sequentially
        for (const testCase of suite.testCases) {
          try {
            const results = await this.testFramework.executeTestCase(testCase, [
              browserConfig,
            ]);
            const browserResult = results.get(browserConfig.name);
            if (browserResult) {
              testResults.set(testCase.id, browserResult);
            }
          } catch (error) {
            testResults.set(testCase.id, {
              testId: testCase.id,
              status: "failed",
              duration: 0,
              error: error as Error,
              screenshots: [],
              logs: [],
              networkActivity: [],
              performanceMetrics: {
                pageLoadTime: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                cumulativeLayoutShift: 0,
                firstInputDelay: 0,
                timeToInteractive: 0,
                memoryUsage: 0,
                cpuUsage: 0,
              },
            });
          }
        }
      }

      browserResults.set(browserConfig.name, testResults);
    }

    const duration = Date.now() - startTime;
    const status = this.calculateSuiteStatus(browserResults);

    return {
      suiteName: suite.name,
      status,
      duration,
      browserResults,
    };
  }

  private calculateSuiteStatus(
    browserResults: Map<string, Map<string, TestResult>>
  ): "passed" | "failed" | "partial" {
    let totalTests = 0;
    let passedTests = 0;

    for (const testResults of browserResults.values()) {
      for (const result of testResults.values()) {
        totalTests++;
        if (result.status === "passed") {
          passedTests++;
        }
      }
    }

    if (passedTests === totalTests) {
      return "passed";
    } else if (passedTests === 0) {
      return "failed";
    } else {
      return "partial";
    }
  }

  private calculatePipelineResult(
    pipelineId: string,
    duration: number,
    suiteResults: Map<string, SuiteResult>
  ): PipelineResult {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    for (const suiteResult of suiteResults.values()) {
      for (const browserResults of suiteResult.browserResults.values()) {
        for (const testResult of browserResults.values()) {
          totalTests++;
          switch (testResult.status) {
            case "passed":
              passedTests++;
              break;
            case "failed":
              failedTests++;
              break;
            case "skipped":
              skippedTests++;
              break;
          }
        }
      }
    }

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    let status: "passed" | "failed" | "partial";
    if (failedTests === 0) {
      status = "passed";
    } else if (passedTests === 0) {
      status = "failed";
    } else {
      status = "partial";
    }

    return {
      pipelineId,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      duration,
      status,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        passRate,
      },
      suiteResults,
      artifacts: [],
    };
  }

  private async generateReports(
    pipelineResult: PipelineResult
  ): Promise<string[]> {
    const artifacts: string[] = [];

    for (const format of this.config.reporting.formats) {
      try {
        const reportPath = await this.reportGenerator.generateReport(
          pipelineResult,
          format
        );
        artifacts.push(reportPath);
      } catch (error) {
        console.error(`Failed to generate ${format} report:`, error);
      }
    }

    return artifacts;
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.reporting.outputDir,
      "test-results/screenshots",
      "test-results/videos",
      "test-results/network",
      "test-results/error-logs",
      "test-results/visual",
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // API endpoints for manual triggering
  async createApiEndpoints(): Promise<void> {
    // This would typically be implemented with Express.js or similar
    console.log(
      "API endpoints would be created here for manual test triggering"
    );
  }

  // Manual trigger method
  async triggerManualRun(
    suiteNames?: string[],
    browserNames?: string[]
  ): Promise<PipelineResult> {
    const filteredConfig = { ...this.config };

    if (suiteNames) {
      filteredConfig.testSuites = this.config.testSuites.filter(suite =>
        suiteNames.includes(suite.name)
      );
    }

    if (browserNames) {
      filteredConfig.browsers = this.config.browsers.filter(browser =>
        browserNames.includes(browser.name)
      );
    }

    const originalConfig = this.config;
    this.config = filteredConfig;

    try {
      return await this.runPipeline("manual-api");
    } finally {
      this.config = originalConfig;
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    config: any;
  }> {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      config: {
        projectName: this.config.projectName,
        environment: this.config.environment,
        suiteCount: this.config.testSuites.length,
        browserCount: this.config.browsers.length,
        schedulingEnabled: this.config.scheduling.enabled,
      },
    };
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down pipeline...");

    if (this.testScheduler) {
      await this.testScheduler.stop();
    }

    await this.testFramework.cleanupAll();

    console.log("Pipeline shutdown complete");
  }
}
