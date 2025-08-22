import { TestCase, TestStep } from "../framework/test-framework";
import {
  BrowserConfig,
  BROWSER_CONFIGS,
  DEVICE_PROFILES,
} from "../config/browser-config";
import { PipelineConfig, TestSuite } from "../ci-cd/pipeline-integration";
import { PipelineIntegration } from "../ci-cd/pipeline-integration";

// Example test cases for the FreeNomad application
export const EXAMPLE_TEST_CASES: TestCase[] = [
  {
    id: "homepage-load",
    name: "Homepage Load Test",
    description:
      "Verify that the homepage loads correctly and displays key elements",
    objective: "Ensure homepage accessibility and core functionality",
    steps: [
      {
        action: "navigate",
        target: "http://localhost:3000",
        expectedResult: "Page loads successfully",
        waitStrategy: "networkIdle",
        screenshot: true,
      },
      {
        action: "wait",
        waitStrategy: "custom",
        customWait: 2000,
      },
      {
        action: "screenshot",
        expectedResult: "Homepage elements are visible",
      },
    ],
    expectedOutcome:
      "Homepage loads within 5 seconds with all key elements visible",
    tags: ["smoke", "homepage", "critical"],
    priority: "high",
    timeout: 30000,
  },
  {
    id: "navigation-test",
    name: "Navigation Functionality",
    description: "Test main navigation links and ensure they work correctly",
    objective: "Verify navigation system functionality",
    steps: [
      {
        action: "navigate",
        target: "http://localhost:3000",
        waitStrategy: "networkIdle",
      },
      {
        action: "click",
        target: 'nav a[href="/cities"]',
        expectedResult: "Cities page loads",
        screenshot: true,
      },
      {
        action: "wait",
        waitStrategy: "networkIdle",
      },
      {
        action: "click",
        target: 'nav a[href="/about"]',
        expectedResult: "About page loads",
        screenshot: true,
      },
    ],
    expectedOutcome: "All navigation links work correctly and pages load",
    tags: ["navigation", "functional"],
    priority: "high",
  },
  {
    id: "search-functionality",
    name: "Search Feature Test",
    description: "Test the search functionality with various inputs",
    objective: "Ensure search feature works correctly",
    steps: [
      {
        action: "navigate",
        target: "http://localhost:3000",
        waitStrategy: "networkIdle",
      },
      {
        action: "fill",
        target: 'input[placeholder*="Search cities"]',
        value: "Bangkok",
        expectedResult: "Search input accepts text",
      },
      {
        action: "click",
        target: 'button:has-text("Search")',
        expectedResult: "Search is executed",
        screenshot: true,
      },
      {
        action: "wait",
        waitStrategy: "networkIdle",
        customWait: 3000,
      },
    ],
    expectedOutcome: "Search functionality works and returns relevant results",
    tags: ["search", "functional"],
    priority: "medium",
  },
  {
    id: "responsive-design",
    name: "Responsive Design Test",
    description: "Test responsive design across different viewport sizes",
    objective: "Ensure application works on mobile and tablet devices",
    steps: [
      {
        action: "navigate",
        target: "http://localhost:3000",
        waitStrategy: "networkIdle",
      },
      {
        action: "screenshot",
        expectedResult: "Desktop layout captured",
      },
      {
        action: "wait",
        customWait: 1000,
      },
      {
        action: "screenshot",
        expectedResult: "Mobile layout captured",
      },
    ],
    expectedOutcome: "Application displays correctly on all device sizes",
    tags: ["responsive", "ui"],
    priority: "medium",
  },
  {
    id: "api-health-check",
    name: "API Health Check",
    description: "Verify that API endpoints are responding correctly",
    objective: "Ensure backend services are operational",
    steps: [
      {
        action: "api_call",
        target: "http://localhost:3000/api/cities",
        value: "GET",
        expectedResult: "API responds with 200 status",
      },
      {
        action: "api_call",
        target: "http://localhost:3000/api/health",
        value: "GET",
        expectedResult: "Health check passes",
      },
    ],
    expectedOutcome: "All API endpoints respond correctly",
    tags: ["api", "health"],
    priority: "high",
  },
  {
    id: "performance-test",
    name: "Performance Validation",
    description: "Measure page load performance and Core Web Vitals",
    objective: "Ensure application meets performance standards",
    steps: [
      {
        action: "navigate",
        target: "http://localhost:3000",
        waitStrategy: "networkIdle",
      },
      {
        action: "wait",
        customWait: 5000,
        expectedResult: "Performance metrics collected",
      },
    ],
    expectedOutcome: "Page loads within performance thresholds",
    tags: ["performance", "metrics"],
    priority: "medium",
  },
];

// Example test suites
export const EXAMPLE_TEST_SUITES: TestSuite[] = [
  {
    name: "Smoke Tests",
    description: "Critical functionality tests that must pass",
    testCases: EXAMPLE_TEST_CASES.filter(
      tc => tc.tags.includes("smoke") || tc.priority === "high"
    ),
    tags: ["smoke", "critical"],
    priority: "high",
    parallel: false, // Run sequentially for smoke tests
  },
  {
    name: "Functional Tests",
    description: "Comprehensive functional testing suite",
    testCases: EXAMPLE_TEST_CASES.filter(tc => tc.tags.includes("functional")),
    tags: ["functional", "regression"],
    priority: "medium",
    parallel: true,
  },
  {
    name: "UI/UX Tests",
    description: "User interface and experience validation",
    testCases: EXAMPLE_TEST_CASES.filter(
      tc => tc.tags.includes("ui") || tc.tags.includes("responsive")
    ),
    tags: ["ui", "ux", "responsive"],
    priority: "medium",
    parallel: true,
  },
  {
    name: "API Tests",
    description: "Backend API and service validation",
    testCases: EXAMPLE_TEST_CASES.filter(tc => tc.tags.includes("api")),
    tags: ["api", "backend"],
    priority: "high",
    parallel: true,
  },
  {
    name: "Performance Tests",
    description: "Performance and load testing suite",
    testCases: EXAMPLE_TEST_CASES.filter(tc => tc.tags.includes("performance")),
    tags: ["performance", "load"],
    priority: "low",
    parallel: false,
  },
];

// Example pipeline configuration
export const EXAMPLE_PIPELINE_CONFIG: PipelineConfig = {
  projectName: "FreeNomad Test Automation",
  environment: "development",
  baseUrl: "http://localhost:3000",
  testSuites: EXAMPLE_TEST_SUITES,
  browsers: [
    BROWSER_CONFIGS[0], // Chrome Desktop
    BROWSER_CONFIGS[1], // Firefox Desktop
    BROWSER_CONFIGS[3], // Chrome Mobile
  ],
  notifications: {
    email: {
      enabled: false, // Disabled for example
      recipients: ["team@freenomad.com"],
    },
    slack: {
      enabled: false, // Disabled for example
    },
    webhook: {
      enabled: false, // Disabled for example
    },
  },
  scheduling: {
    enabled: true,
    cron: "0 */6 * * *", // Every 6 hours
    timezone: "UTC",
    retryFailedTests: true,
    maxRetries: 2,
  },
  reporting: {
    formats: ["html", "json", "junit"],
    outputDir: "test-results/reports",
    includeScreenshots: true,
    includeVideos: true,
    includeNetworkLogs: true,
    archiveAfterDays: 30,
  },
};

// Example runner class
export class ExampleTestRunner {
  private pipeline: PipelineIntegration;

  constructor(config: PipelineConfig = EXAMPLE_PIPELINE_CONFIG) {
    this.pipeline = new PipelineIntegration(config);
  }

  async runSmokeTests(): Promise<void> {
    console.log("🔥 Running Smoke Tests...");

    try {
      const result = await this.pipeline.triggerManualRun(["Smoke Tests"]);

      console.log(`✅ Smoke Tests Completed`);
      console.log(`Status: ${result.status}`);
      console.log(`Pass Rate: ${result.summary.passRate.toFixed(1)}%`);
      console.log(`Duration: ${this.formatDuration(result.duration)}`);

      if (result.status === "failed") {
        console.error(`❌ ${result.summary.failedTests} tests failed`);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Smoke Tests Failed:", error);
      process.exit(1);
    }
  }

  async runFullSuite(): Promise<void> {
    console.log("🚀 Running Full Test Suite...");

    try {
      await this.pipeline.initializePipeline();
      const result = await this.pipeline.runPipeline("manual-full-suite");

      console.log(`\n📊 Test Results Summary:`);
      console.log(`Status: ${result.status}`);
      console.log(`Total Tests: ${result.summary.totalTests}`);
      console.log(`Passed: ${result.summary.passedTests}`);
      console.log(`Failed: ${result.summary.failedTests}`);
      console.log(`Pass Rate: ${result.summary.passRate.toFixed(1)}%`);
      console.log(`Duration: ${this.formatDuration(result.duration)}`);

      if (result.artifacts.length > 0) {
        console.log(`\n📁 Generated Reports:`);
        result.artifacts.forEach(artifact => {
          console.log(`  - ${artifact}`);
        });
      }
    } catch (error) {
      console.error("❌ Full Test Suite Failed:", error);
      throw error;
    }
  }

  async runCrossBrowserTests(): Promise<void> {
    console.log("🌐 Running Cross-Browser Tests...");

    const crossBrowserConfig = {
      ...EXAMPLE_PIPELINE_CONFIG,
      browsers: BROWSER_CONFIGS, // All browsers
      testSuites: [EXAMPLE_TEST_SUITES[0]], // Just smoke tests
    };

    const crossBrowserPipeline = new PipelineIntegration(crossBrowserConfig);

    try {
      const result = await crossBrowserPipeline.runPipeline("cross-browser");

      console.log(`\n🌐 Cross-Browser Results:`);
      for (const [suiteName, suiteResult] of result.suiteResults.entries()) {
        console.log(`\nSuite: ${suiteName}`);
        for (const [
          browserName,
          testResults,
        ] of suiteResult.browserResults.entries()) {
          const passed = Array.from(testResults.values()).filter(
            t => t.status === "passed"
          ).length;
          const total = testResults.size;
          console.log(`  ${browserName}: ${passed}/${total} passed`);
        }
      }
    } catch (error) {
      console.error("❌ Cross-Browser Tests Failed:", error);
      throw error;
    }
  }

  async runPerformanceTests(): Promise<void> {
    console.log("⚡ Running Performance Tests...");

    try {
      const result = await this.pipeline.triggerManualRun([
        "Performance Tests",
      ]);

      console.log(`\n⚡ Performance Results:`);
      console.log(`Status: ${result.status}`);
      console.log(`Duration: ${this.formatDuration(result.duration)}`);

      // Performance metrics would be included in the detailed results
    } catch (error) {
      console.error("❌ Performance Tests Failed:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<void> {
    console.log("🏥 Running Health Check...");

    try {
      const health = await this.pipeline.healthCheck();
      console.log("✅ Pipeline Health:", health);
    } catch (error) {
      console.error("❌ Health Check Failed:", error);
      throw error;
    }
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async shutdown(): Promise<void> {
    await this.pipeline.shutdown();
  }
}

// CLI interface for running tests
if (require.main === module) {
  const runner = new ExampleTestRunner();

  const command = process.argv[2];

  async function main() {
    try {
      switch (command) {
        case "smoke":
          await runner.runSmokeTests();
          break;
        case "full":
          await runner.runFullSuite();
          break;
        case "cross-browser":
          await runner.runCrossBrowserTests();
          break;
        case "performance":
          await runner.runPerformanceTests();
          break;
        case "health":
          await runner.healthCheck();
          break;
        default:
          console.log(
            "Usage: npm run test:automation [smoke|full|cross-browser|performance|health]"
          );
          process.exit(1);
      }
    } catch (error) {
      console.error("Test execution failed:", error);
      process.exit(1);
    } finally {
      await runner.shutdown();
    }
  }

  main();
}
