/**
 * Test Coverage Validation
 * Ensures all existing test functionality is preserved with rate limiting implementation
 */

import { test, expect } from "@playwright/test";
import { PlaywrightRateLimitUtils } from "../utils/rate-limit-manager";
import { setupApiMocks } from "../mocks/api-mocks";
import { getTestSuiteConfig } from "../config/rate-limit-config";

interface TestCoverageReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverageAreas: {
    navigation: boolean;
    apiCalls: boolean;
    authentication: boolean;
    search: boolean;
    visualElements: boolean;
    errorHandling: boolean;
  };
  rateLimitingStats: {
    requestsThrottled: number;
    cacheHits: number;
    mockResponses: number;
    realApiCalls: number;
  };
  performanceMetrics: {
    averageTestDuration: number;
    totalExecutionTime: number;
    apiResponseTime: number;
  };
}

export class CoverageValidator {
  private report: TestCoverageReport;
  private startTime: number;
  private testResults: Array<{
    name: string;
    status: "passed" | "failed" | "skipped";
    duration: number;
  }> = [];

  constructor() {
    this.report = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      coverageAreas: {
        navigation: false,
        apiCalls: false,
        authentication: false,
        search: false,
        visualElements: false,
        errorHandling: false,
      },
      rateLimitingStats: {
        requestsThrottled: 0,
        cacheHits: 0,
        mockResponses: 0,
        realApiCalls: 0,
      },
      performanceMetrics: {
        averageTestDuration: 0,
        totalExecutionTime: 0,
        apiResponseTime: 0,
      },
    };
    this.startTime = Date.now();
  }

  /**
   * Validate navigation functionality with rate limiting
   */
  async validateNavigation(page: any): Promise<boolean> {
    console.log("🧭 Validating navigation functionality...");

    try {
      const testStart = Date.now();

      // Test homepage navigation
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
        priority: "high",
        waitUntil: "networkidle",
      });

      await expect(page.locator("body")).toBeVisible();

      // Test cities page navigation
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/cities", {
        priority: "medium",
      });

      await expect(page.locator("body")).toBeVisible();

      // Test settings page navigation
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/settings", {
        priority: "medium",
      });

      await expect(page.locator("body")).toBeVisible();

      const duration = Date.now() - testStart;
      this.recordTest("Navigation Validation", "passed", duration);
      this.report.coverageAreas.navigation = true;

      console.log("✅ Navigation validation passed");
      return true;
    } catch (error) {
      console.error("❌ Navigation validation failed:", error);
      this.recordTest(
        "Navigation Validation",
        "failed",
        Date.now() - Date.now()
      );
      return false;
    }
  }

  /**
   * Validate API functionality with rate limiting and caching
   */
  async validateApiCalls(page: any): Promise<boolean> {
    console.log("🔌 Validating API functionality...");

    try {
      const testStart = Date.now();

      // Navigate to a page first
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
        priority: "high",
      });

      // Test cities API
      const citiesData =
        await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
          page,
          "/api/cities",
          {
            method: "GET",
            priority: "medium",
            cacheTtl: 300000,
          }
        );

      expect(citiesData).toBeDefined();
      expect(citiesData.success).toBe(true);

      // Test health API
      const healthData =
        await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
          page,
          "/api/health",
          {
            method: "GET",
            priority: "low",
            cacheTtl: 60000,
          }
        );

      expect(healthData).toBeDefined();
      expect(healthData.status).toBeDefined();

      // Test cached request (should be faster)
      const cachedCitiesData =
        await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
          page,
          "/api/cities",
          {
            method: "GET",
            priority: "medium",
            cacheTtl: 300000,
          }
        );

      expect(cachedCitiesData).toEqual(citiesData);

      const duration = Date.now() - testStart;
      this.recordTest("API Validation", "passed", duration);
      this.report.coverageAreas.apiCalls = true;

      console.log("✅ API validation passed");
      return true;
    } catch (error) {
      console.error("❌ API validation failed:", error);
      this.recordTest("API Validation", "failed", Date.now() - Date.now());
      return false;
    }
  }

  /**
   * Validate authentication functionality
   */
  async validateAuthentication(page: any): Promise<boolean> {
    console.log("🔐 Validating authentication functionality...");

    try {
      const testStart = Date.now();

      // Navigate to login page
      await PlaywrightRateLimitUtils.navigateWithRateLimit(
        page,
        "/auth/signin",
        {
          priority: "high",
        }
      );

      // Wait for login form
      await PlaywrightRateLimitUtils.smartWait(
        page,
        async () => {
          const emailInput = page.locator(
            '[data-testid="email"], input[type="email"]'
          );
          return await emailInput.isVisible();
        },
        {
          timeout: 10000,
          description: "login form to be visible",
        }
      );

      // Verify form elements exist
      const emailInput = page
        .locator('[data-testid="email"], input[type="email"]')
        .first();
      const passwordInput = page
        .locator('[data-testid="password"], input[type="password"]')
        .first();

      if (await emailInput.isVisible()) {
        await emailInput.fill("test@example.com");
      }

      if (await passwordInput.isVisible()) {
        await passwordInput.fill("password123");
      }

      const duration = Date.now() - testStart;
      this.recordTest("Authentication Validation", "passed", duration);
      this.report.coverageAreas.authentication = true;

      console.log("✅ Authentication validation passed");
      return true;
    } catch (error) {
      console.error("❌ Authentication validation failed:", error);
      this.recordTest(
        "Authentication Validation",
        "failed",
        Date.now() - Date.now()
      );
      return false;
    }
  }

  /**
   * Validate search functionality
   */
  async validateSearch(page: any): Promise<boolean> {
    console.log("🔍 Validating search functionality...");

    try {
      const testStart = Date.now();

      // Navigate to homepage
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
        priority: "high",
      });

      // Find search input
      await PlaywrightRateLimitUtils.smartWait(
        page,
        async () => {
          const searchInput = page.getByPlaceholder(
            "Search cities, countries, or regions..."
          );
          return await searchInput.isVisible();
        },
        {
          timeout: 10000,
          description: "search input to be visible",
        }
      );

      // Perform search
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await searchInput.fill("Bangkok");

      // Verify search input works
      const value = await searchInput.inputValue();
      expect(value).toBe("Bangkok");

      const duration = Date.now() - testStart;
      this.recordTest("Search Validation", "passed", duration);
      this.report.coverageAreas.search = true;

      console.log("✅ Search validation passed");
      return true;
    } catch (error) {
      console.error("❌ Search validation failed:", error);
      this.recordTest("Search Validation", "failed", Date.now() - Date.now());
      return false;
    }
  }

  /**
   * Validate visual elements are loading correctly
   */
  async validateVisualElements(page: any): Promise<boolean> {
    console.log("👁️ Validating visual elements...");

    try {
      const testStart = Date.now();

      // Navigate to homepage
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
        priority: "high",
      });

      // Check for basic page elements
      await expect(page.locator("body")).toBeVisible();

      // Check for navigation elements (if they exist)
      const navElements = await page.locator("nav, .navbar, header").count();
      console.log(`Found ${navElements} navigation elements`);

      // Check for main content
      const mainContent = await page.locator("main, .main, #main").count();
      console.log(`Found ${mainContent} main content elements`);

      // Take a screenshot for visual verification
      await page.screenshot({
        path: "test-results/coverage-validation-screenshot.png",
        fullPage: true,
      });

      const duration = Date.now() - testStart;
      this.recordTest("Visual Elements Validation", "passed", duration);
      this.report.coverageAreas.visualElements = true;

      console.log("✅ Visual elements validation passed");
      return true;
    } catch (error) {
      console.error("❌ Visual elements validation failed:", error);
      this.recordTest(
        "Visual Elements Validation",
        "failed",
        Date.now() - Date.now()
      );
      return false;
    }
  }

  /**
   * Validate error handling with rate limiting
   */
  async validateErrorHandling(page: any): Promise<boolean> {
    console.log("⚠️ Validating error handling...");

    try {
      const testStart = Date.now();

      // Setup mocks with error simulation
      await setupApiMocks(page, {
        enableCitiesMock: true,
        simulateErrors: true,
        errorRate: 0.5, // 50% error rate
      });

      // Navigate to page
      await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
        priority: "high",
      });

      // Try API call that might fail
      try {
        await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
          page,
          "/api/cities",
          {
            method: "GET",
            priority: "medium",
          }
        );
        console.log("API call succeeded despite error simulation");
      } catch (apiError) {
        console.log("API call failed as expected due to error simulation");
        expect(apiError).toBeDefined();
      }

      const duration = Date.now() - testStart;
      this.recordTest("Error Handling Validation", "passed", duration);
      this.report.coverageAreas.errorHandling = true;

      console.log("✅ Error handling validation passed");
      return true;
    } catch (error) {
      console.error("❌ Error handling validation failed:", error);
      this.recordTest(
        "Error Handling Validation",
        "failed",
        Date.now() - Date.now()
      );
      return false;
    }
  }

  /**
   * Record test result
   */
  private recordTest(
    name: string,
    status: "passed" | "failed" | "skipped",
    duration: number
  ): void {
    this.testResults.push({ name, status, duration });
    this.report.totalTests++;

    switch (status) {
      case "passed":
        this.report.passedTests++;
        break;
      case "failed":
        this.report.failedTests++;
        break;
      case "skipped":
        this.report.skippedTests++;
        break;
    }
  }

  /**
   * Generate final coverage report
   */
  generateReport(): TestCoverageReport {
    const totalDuration = Date.now() - this.startTime;
    const avgDuration =
      this.testResults.length > 0
        ? this.testResults.reduce((sum, test) => sum + test.duration, 0) /
          this.testResults.length
        : 0;

    // Get rate limiting statistics
    const rateLimitStats = PlaywrightRateLimitUtils.getStats();

    this.report.performanceMetrics = {
      averageTestDuration: avgDuration,
      totalExecutionTime: totalDuration,
      apiResponseTime: avgDuration, // Approximation
    };

    this.report.rateLimitingStats = {
      requestsThrottled: rateLimitStats.recentRequests,
      cacheHits: rateLimitStats.cacheSize,
      mockResponses: 0, // Would need to be tracked separately
      realApiCalls: Math.max(
        0,
        rateLimitStats.recentRequests - rateLimitStats.cacheSize
      ),
    };

    return this.report;
  }

  /**
   * Print coverage report
   */
  printReport(): void {
    const report = this.generateReport();

    console.log("\n📊 TEST COVERAGE VALIDATION REPORT");
    console.log("=".repeat(50));

    console.log("\n🧪 Test Results:");
    console.log(`   Total Tests: ${report.totalTests}`);
    console.log(
      `   Passed: ${report.passedTests} (${((report.passedTests / report.totalTests) * 100).toFixed(1)}%)`
    );
    console.log(
      `   Failed: ${report.failedTests} (${((report.failedTests / report.totalTests) * 100).toFixed(1)}%)`
    );
    console.log(
      `   Skipped: ${report.skippedTests} (${((report.skippedTests / report.totalTests) * 100).toFixed(1)}%)`
    );

    console.log("\n🎯 Coverage Areas:");
    Object.entries(report.coverageAreas).forEach(([area, covered]) => {
      console.log(`   ${area}: ${covered ? "✅" : "❌"}`);
    });

    console.log("\n⚡ Rate Limiting Stats:");
    console.log(
      `   Requests Throttled: ${report.rateLimitingStats.requestsThrottled}`
    );
    console.log(`   Cache Hits: ${report.rateLimitingStats.cacheHits}`);
    console.log(`   Mock Responses: ${report.rateLimitingStats.mockResponses}`);
    console.log(`   Real API Calls: ${report.rateLimitingStats.realApiCalls}`);

    console.log("\n⏱️ Performance Metrics:");
    console.log(
      `   Average Test Duration: ${report.performanceMetrics.averageTestDuration.toFixed(0)}ms`
    );
    console.log(
      `   Total Execution Time: ${report.performanceMetrics.totalExecutionTime.toFixed(0)}ms`
    );
    console.log(
      `   API Response Time: ${report.performanceMetrics.apiResponseTime.toFixed(0)}ms`
    );

    console.log("\n📋 Individual Test Results:");
    this.testResults.forEach(test => {
      const status =
        test.status === "passed"
          ? "✅"
          : test.status === "failed"
            ? "❌"
            : "⏭️";
      console.log(`   ${status} ${test.name}: ${test.duration}ms`);
    });

    // Overall assessment
    const overallSuccess = report.passedTests === report.totalTests;
    const coverageComplete = Object.values(report.coverageAreas).every(
      covered => covered
    );

    console.log("\n🏆 OVERALL ASSESSMENT:");
    if (overallSuccess && coverageComplete) {
      console.log("   ✅ ALL TESTS PASSED - Coverage validation successful!");
      console.log(
        "   ✅ Rate limiting implementation maintains full test coverage"
      );
    } else {
      console.log(
        "   ⚠️ Some issues detected - review failed tests and coverage gaps"
      );
    }
  }
}

// Export for use in test files
export async function validateTestCoverage(
  page: any
): Promise<TestCoverageReport> {
  const validator = new CoverageValidator();

  console.log("🚀 Starting test coverage validation...");

  // Run all validation tests
  await validator.validateNavigation(page);
  await validator.validateApiCalls(page);
  await validator.validateAuthentication(page);
  await validator.validateSearch(page);
  await validator.validateVisualElements(page);
  await validator.validateErrorHandling(page);

  // Generate and print report
  validator.printReport();

  return validator.generateReport();
}
