import { Page } from "@playwright/test";
import { promises as fs } from "fs";
import * as path from "path";

export interface ErrorContext {
  testId: string;
  browserName: string;
  url: string;
  timestamp: string;
  screenshot?: string;
  stackTrace: string;
  consoleErrors: string[];
  networkErrors: string[];
  environmentInfo: EnvironmentInfo;
}

export interface EnvironmentInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  platform: string;
  browserVersion: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export class ErrorHandler {
  private retryConfig: RetryConfig;
  private errorLog: ErrorContext[] = [];

  constructor(maxRetries: number = 3) {
    this.retryConfig = {
      maxAttempts: maxRetries,
      delayMs: 1000,
      backoffMultiplier: 2,
      retryableErrors: [
        "TimeoutError",
        "NetworkError",
        "ProtocolError",
        "Target closed",
        "Navigation timeout",
        "Waiting for selector",
        "Element not found",
      ],
    };
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext> = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < this.retryConfig.maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        const isRetryable = this.isRetryableError(lastError);

        if (!isRetryable || attempt >= this.retryConfig.maxAttempts) {
          // Log the final error
          await this.logError(lastError, {
            ...context,
            testId: context.testId || "unknown",
            browserName: context.browserName || "unknown",
            url: context.url || "unknown",
            timestamp: new Date().toISOString(),
            stackTrace: lastError.stack || lastError.message,
          });

          throw lastError;
        }

        // Wait before retry with exponential backoff
        const delay =
          this.retryConfig.delayMs *
          Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        console.log(
          `Attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`
        );
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return this.retryConfig.retryableErrors.some(retryableError =>
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  async captureErrorContext(
    page: Page,
    error: Error,
    testId: string,
    browserName: string
  ): Promise<ErrorContext> {
    const timestamp = new Date().toISOString();
    const screenshotPath = await this.captureFailureScreenshot(
      page,
      testId,
      timestamp
    );

    // Get console errors
    const consoleErrors = await this.getConsoleErrors(page);

    // Get network errors
    const networkErrors = await this.getNetworkErrors(page);

    // Get environment info
    const environmentInfo = await this.getEnvironmentInfo(page);

    const context: ErrorContext = {
      testId,
      browserName,
      url: page.url(),
      timestamp,
      screenshot: screenshotPath,
      stackTrace: error.stack || error.message,
      consoleErrors,
      networkErrors,
      environmentInfo,
    };

    await this.logError(error, context);
    return context;
  }

  private async captureFailureScreenshot(
    page: Page,
    testId: string,
    timestamp: string
  ): Promise<string> {
    try {
      const screenshotDir = "test-results/error-screenshots";
      await fs.mkdir(screenshotDir, { recursive: true });

      const fileName = `${testId}-${timestamp.replace(/[:.]/g, "-")}.png`;
      const screenshotPath = path.join(screenshotDir, fileName);

      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      return screenshotPath;
    } catch (screenshotError) {
      console.warn("Failed to capture error screenshot:", screenshotError);
      return "";
    }
  }

  private async getConsoleErrors(page: Page): Promise<string[]> {
    try {
      return await page.evaluate(() => {
        // Get console errors from the page context
        return (window as any).consoleErrors || [];
      });
    } catch {
      return [];
    }
  }

  private async getNetworkErrors(page: Page): Promise<string[]> {
    try {
      return await page.evaluate(() => {
        // Get network errors from the page context
        return (window as any).networkErrors || [];
      });
    } catch {
      return [];
    }
  }

  private async getEnvironmentInfo(page: Page): Promise<EnvironmentInfo> {
    try {
      const info = await page.evaluate(() => ({
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        platform: navigator.platform,
      }));

      return {
        ...info,
        browserVersion: "unknown", // Would need to be passed from browser context
      };
    } catch {
      return {
        userAgent: "unknown",
        viewport: { width: 0, height: 0 },
        platform: "unknown",
        browserVersion: "unknown",
      };
    }
  }

  private async logError(
    error: Error,
    context: Partial<ErrorContext>
  ): Promise<void> {
    const fullContext: ErrorContext = {
      testId: context.testId || "unknown",
      browserName: context.browserName || "unknown",
      url: context.url || "unknown",
      timestamp: context.timestamp || new Date().toISOString(),
      stackTrace: context.stackTrace || error.stack || error.message,
      consoleErrors: context.consoleErrors || [],
      networkErrors: context.networkErrors || [],
      environmentInfo: context.environmentInfo || {
        userAgent: "unknown",
        viewport: { width: 0, height: 0 },
        platform: "unknown",
        browserVersion: "unknown",
      },
      screenshot: context.screenshot,
    };

    this.errorLog.push(fullContext);

    // Write to error log file
    try {
      const errorLogDir = "test-results/error-logs";
      await fs.mkdir(errorLogDir, { recursive: true });

      const logFileName = `error-log-${fullContext.timestamp.split("T")[0]}.json`;
      const logFilePath = path.join(errorLogDir, logFileName);

      // Read existing log or create new
      let existingLog: ErrorContext[] = [];
      try {
        const existingContent = await fs.readFile(logFilePath, "utf-8");
        existingLog = JSON.parse(existingContent);
      } catch {
        // File doesn't exist or is invalid, start fresh
      }

      existingLog.push(fullContext);
      await fs.writeFile(logFilePath, JSON.stringify(existingLog, null, 2));
    } catch (logError) {
      console.warn("Failed to write error log:", logError);
    }
  }

  async handleCommonFailures(page: Page, error: Error): Promise<boolean> {
    const errorMessage = error.message.toLowerCase();

    try {
      // Handle common failure scenarios
      if (
        errorMessage.includes("target closed") ||
        errorMessage.includes("page closed")
      ) {
        console.log("Page was closed, attempting to recover...");
        // Page recovery would need to be handled at a higher level
        return false;
      }

      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("waiting for")
      ) {
        console.log("Timeout occurred, attempting to refresh page...");
        await page.reload({ waitUntil: "networkidle" });
        return true;
      }

      if (
        errorMessage.includes("element not found") ||
        errorMessage.includes("selector")
      ) {
        console.log("Element not found, waiting for page to stabilize...");
        await page.waitForTimeout(2000);
        return true;
      }

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("connection")
      ) {
        console.log("Network error, waiting before retry...");
        await page.waitForTimeout(5000);
        return true;
      }
    } catch (recoveryError) {
      console.warn("Failed to handle common failure:", recoveryError);
    }

    return false;
  }

  getErrorSummary(): ErrorSummary {
    const totalErrors = this.errorLog.length;
    const errorsByType = new Map<string, number>();
    const errorsByBrowser = new Map<string, number>();

    this.errorLog.forEach(error => {
      const errorType = this.extractErrorType(error.stackTrace);
      errorsByType.set(errorType, (errorsByType.get(errorType) || 0) + 1);
      errorsByBrowser.set(
        error.browserName,
        (errorsByBrowser.get(error.browserName) || 0) + 1
      );
    });

    return {
      totalErrors,
      errorsByType: Object.fromEntries(errorsByType),
      errorsByBrowser: Object.fromEntries(errorsByBrowser),
      recentErrors: this.errorLog.slice(-10), // Last 10 errors
    };
  }

  private extractErrorType(stackTrace: string): string {
    const lines = stackTrace.split("\n");
    const firstLine = lines[0] || "";

    if (firstLine.includes("TimeoutError")) return "TimeoutError";
    if (firstLine.includes("NetworkError")) return "NetworkError";
    if (firstLine.includes("ProtocolError")) return "ProtocolError";
    if (firstLine.includes("Target closed")) return "TargetClosed";
    if (firstLine.includes("Element not found")) return "ElementNotFound";

    return "UnknownError";
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
}

export interface ErrorSummary {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByBrowser: Record<string, number>;
  recentErrors: ErrorContext[];
}
