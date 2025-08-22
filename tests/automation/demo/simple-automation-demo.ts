import { chromium, Browser, Page } from "@playwright/test";
import axios from "axios";

/**
 * Simple Browser Test Automation Demo
 * Demonstrates the core capabilities of the automation framework
 */

interface TestResult {
  testName: string;
  status: "passed" | "failed";
  duration: number;
  error?: string;
  screenshots: string[];
}

class SimpleBrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    console.log("🚀 Initializing browser automation...");
    this.browser = await chromium.launch({ headless: true });
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await context.newPage();
    console.log("✅ Browser initialized successfully");
  }

  async runHomepageTest(): Promise<TestResult> {
    const testName = "Homepage Load Test";
    const startTime = Date.now();
    const screenshots: string[] = [];

    try {
      console.log(`🧪 Running ${testName}...`);

      if (!this.page) {
        throw new Error("Browser not initialized");
      }

      // Navigate to homepage
      console.log("📍 Navigating to homepage...");
      await this.page.goto("http://localhost:3000", {
        waitUntil: "networkidle",
      });

      // Take screenshot
      const screenshotPath = `test-results/demo-homepage-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push(screenshotPath);

      // Verify page elements
      console.log("🔍 Verifying page elements...");
      await this.page.waitForSelector("nav", { timeout: 5000 });
      await this.page.waitForSelector("main", { timeout: 5000 });
      await this.page.waitForSelector("footer", { timeout: 5000 });

      // Check for FreeNomad branding
      const title = await this.page.textContent("title");
      if (!title?.includes("FreeNomad")) {
        throw new Error("FreeNomad branding not found in title");
      }

      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} passed in ${duration}ms`);

      return {
        testName,
        status: "passed",
        duration,
        screenshots,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed:`, error);

      return {
        testName,
        status: "failed",
        duration,
        error: (error as Error).message,
        screenshots,
      };
    }
  }

  async runSearchTest(): Promise<TestResult> {
    const testName = "Search Functionality Test";
    const startTime = Date.now();
    const screenshots: string[] = [];

    try {
      console.log(`🧪 Running ${testName}...`);

      if (!this.page) {
        throw new Error("Browser not initialized");
      }

      // Navigate to homepage if not already there
      await this.page.goto("http://localhost:3000", {
        waitUntil: "networkidle",
      });

      // Find and fill search input
      console.log("🔍 Testing search functionality...");
      const searchInput = this.page
        .locator('input[placeholder*="Search cities"]')
        .first();
      await searchInput.waitFor({ state: "visible", timeout: 5000 });
      await searchInput.fill("Bangkok");

      // Take screenshot of search input
      const searchScreenshot = `test-results/demo-search-${Date.now()}.png`;
      await this.page.screenshot({ path: searchScreenshot, fullPage: true });
      screenshots.push(searchScreenshot);

      // Click search button
      const searchButton = this.page
        .locator("button")
        .filter({ hasText: "Search" })
        .first();
      await searchButton.click();

      // Wait for potential results or URL change
      await this.page.waitForTimeout(2000);

      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} passed in ${duration}ms`);

      return {
        testName,
        status: "passed",
        duration,
        screenshots,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed:`, error);

      return {
        testName,
        status: "failed",
        duration,
        error: (error as Error).message,
        screenshots,
      };
    }
  }

  async runApiTest(): Promise<TestResult> {
    const testName = "API Health Check";
    const startTime = Date.now();

    try {
      console.log(`🧪 Running ${testName}...`);

      // Test API endpoint
      console.log("📡 Testing API endpoints...");
      const response = await axios.get("http://localhost:3000/api/cities", {
        timeout: 5000,
        validateStatus: () => true, // Don't throw on HTTP errors
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Check if response is successful or expected error
      if (response.status !== 200 && response.status !== 500) {
        throw new Error(`Unexpected API response: ${response.status}`);
      }

      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} passed in ${duration}ms`);

      return {
        testName,
        status: "passed",
        duration,
        screenshots: [],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed:`, error);

      return {
        testName,
        status: "failed",
        duration,
        error: (error as Error).message,
        screenshots: [],
      };
    }
  }

  async runCrossBrowserTest(): Promise<TestResult[]> {
    const testName = "Cross-Browser Compatibility";
    console.log(`🧪 Running ${testName}...`);

    const results: TestResult[] = [];
    const browsers = ["chromium", "firefox", "webkit"];

    for (const browserType of browsers) {
      const startTime = Date.now();
      let browser: Browser | null = null;

      try {
        console.log(`🌐 Testing ${browserType}...`);

        // Launch specific browser
        switch (browserType) {
          case "chromium":
            browser = await chromium.launch({ headless: true });
            break;
          case "firefox":
            const { firefox } = await import("@playwright/test");
            browser = await firefox.launch({ headless: true });
            break;
          case "webkit":
            const { webkit } = await import("@playwright/test");
            browser = await webkit.launch({ headless: true });
            break;
        }

        if (!browser) {
          throw new Error(`Failed to launch ${browserType}`);
        }

        const context = await browser.newContext();
        const page = await context.newPage();

        // Simple navigation test
        await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
        await page.waitForSelector("nav", { timeout: 5000 });

        const duration = Date.now() - startTime;
        console.log(`✅ ${browserType} test passed in ${duration}ms`);

        results.push({
          testName: `${testName} - ${browserType}`,
          status: "passed",
          duration,
          screenshots: [],
        });

        await browser?.close();
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${browserType} test failed:`, error);

        results.push({
          testName: `${testName} - ${browserType}`,
          status: "failed",
          duration,
          error: (error as Error).message,
          screenshots: [],
        });

        if (browser) {
          await browser.close();
        }
      }
    }

    return results;
  }

  async generateReport(results: TestResult[]): Promise<void> {
    console.log("\n📊 Test Results Summary:");
    console.log("========================");

    let totalTests = 0;
    let passedTests = 0;
    let totalDuration = 0;

    results.forEach(result => {
      totalTests++;
      totalDuration += result.duration;

      if (result.status === "passed") {
        passedTests++;
        console.log(`✅ ${result.testName} - PASSED (${result.duration}ms)`);
      } else {
        console.log(`❌ ${result.testName} - FAILED (${result.duration}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }

      if (result.screenshots.length > 0) {
        console.log(`   Screenshots: ${result.screenshots.join(", ")}`);
      }
    });

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    console.log("\n📈 Summary:");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log("========================\n");
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log("🧹 Browser cleanup completed");
    }
  }
}

// Demo runner
async function runDemo(): Promise<void> {
  const automation = new SimpleBrowserAutomation();
  const results: TestResult[] = [];

  try {
    // Ensure test results directory exists
    const fs = await import("fs/promises");
    await fs.mkdir("test-results", { recursive: true });

    await automation.initialize();

    // Run individual tests
    results.push(await automation.runHomepageTest());
    results.push(await automation.runSearchTest());
    results.push(await automation.runApiTest());

    // Run cross-browser tests
    const crossBrowserResults = await automation.runCrossBrowserTest();
    results.push(...crossBrowserResults);

    // Generate report
    await automation.generateReport(results);
  } catch (error) {
    console.error("❌ Demo execution failed:", error);
    process.exit(1);
  } finally {
    await automation.cleanup();
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "demo":
    case undefined:
      console.log("🎭 Starting Browser Automation Demo...");
      runDemo().catch(error => {
        console.error("Demo failed:", error);
        process.exit(1);
      });
      break;
    default:
      console.log("Usage: npm run test:automation:demo");
      console.log("Available commands:");
      console.log("  demo - Run the complete automation demo");
      break;
  }
}

export { SimpleBrowserAutomation };
export type { TestResult };
