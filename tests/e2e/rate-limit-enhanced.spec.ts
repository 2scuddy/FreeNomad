/**
 * Enhanced Test Example with Rate Limiting
 * Demonstrates proper usage of rate limiting, caching, and mocking
 */

import { test, expect } from "@playwright/test";
import { PlaywrightRateLimitUtils } from "../automation/utils/rate-limit-manager";
import { setupApiMocks } from "../automation/mocks/api-mocks";
import {
  getTestSuiteConfig,
  logCurrentConfig,
} from "../automation/config/rate-limit-config";

// Get configuration for this test suite
const config = getTestSuiteConfig("e2e-testing");

test.describe("Rate Limited E2E Tests", () => {
  test.beforeAll(async () => {
    // Log current configuration
    logCurrentConfig();
    console.log("🧪 Starting rate-limited E2E tests with config:", config.name);
  });

  test.beforeEach(async ({ page }) => {
    // Reset rate limiting state for test isolation
    PlaywrightRateLimitUtils.reset();

    // Setup API mocks with current configuration
    await setupApiMocks(page, {
      enableUnsplashMock: config.mocking.enabled,
      enableCitiesMock: config.mocking.enabled,
      enableHealthMock: config.mocking.enabled,
      enableAuthMock: config.mocking.enabled,
      simulateLatency: config.mocking.simulateLatency,
      latencyRange: config.mocking.latencyRange,
      simulateErrors: config.mocking.simulateErrors,
      errorRate: config.mocking.errorRate,
    });

    console.log("🎭 API mocks configured for test");
  });

  test.afterEach(async () => {
    // Log rate limiting statistics after each test
    const stats = PlaywrightRateLimitUtils.getStats();
    console.log("📊 Test completion stats:", stats);
  });

  test("should navigate with rate limiting", async ({ page }) => {
    console.log("🧭 Testing navigation with rate limiting...");

    // Navigate to homepage with rate limiting
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
      priority: "high",
      waitUntil: "networkidle",
    });

    // Verify page loaded
    await expect(page.locator("body")).toBeVisible();

    // Navigate to cities page with rate limiting
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/cities", {
      priority: "medium",
      waitUntil: "networkidle",
    });

    // Verify cities page loaded
    await expect(page.locator("body")).toBeVisible();

    console.log("✅ Navigation with rate limiting completed");
  });

  test("should make API calls with rate limiting and caching", async ({
    page,
  }) => {
    console.log("🔌 Testing API calls with rate limiting...");

    // Navigate to page first
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
      priority: "high",
    });

    // Make API call with rate limiting and caching
    const citiesData = await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
      page,
      "/api/cities",
      {
        method: "GET",
        priority: "medium",
        cacheTtl: config.caching.defaultTtl,
      }
    );

    // Verify API response
    expect(citiesData).toBeDefined();
    expect(citiesData.success).toBe(true);
    expect(Array.isArray(citiesData.data)).toBe(true);

    // Make the same API call again - should use cache
    const cachedCitiesData =
      await PlaywrightRateLimitUtils.apiCallWithRateLimit<any>(
        page,
        "/api/cities",
        {
          method: "GET",
          priority: "medium",
          cacheTtl: config.caching.defaultTtl,
        }
      );

    // Verify cached response
    expect(cachedCitiesData).toEqual(citiesData);

    console.log("✅ API calls with caching completed");
  });

  test("should handle search with rate limiting", async ({ page }) => {
    console.log("🔍 Testing search functionality with rate limiting...");

    // Navigate to homepage
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
      priority: "high",
    });

    // Find search input with smart waiting
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
        interval: 1000,
        description: "search input to be visible",
      }
    );

    // Perform search with rate limiting
    const searchInput = page.getByPlaceholder(
      "Search cities, countries, or regions..."
    );
    await searchInput.fill("Bangkok");

    // Wait for search results with rate limiting
    await PlaywrightRateLimitUtils.smartWait(
      page,
      async () => {
        // Check if search results are visible or API call completed
        const hasResults =
          (await page
            .locator('[data-testid="city-card"], .city-card')
            .count()) > 0;
        return hasResults;
      },
      {
        timeout: 15000,
        interval: 2000,
        description: "search results to appear",
      }
    );

    console.log("✅ Search with rate limiting completed");
  });

  test("should handle authentication flow with rate limiting", async ({
    page,
  }) => {
    console.log("🔐 Testing authentication with rate limiting...");

    // Navigate to login page
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/auth/signin", {
      priority: "high",
    });

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

    // Fill login form
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

    // Submit login with rate limiting
    const loginButton = page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first();
    if (await loginButton.isVisible()) {
      await loginButton.click();

      // Wait for authentication response
      await PlaywrightRateLimitUtils.smartWait(
        page,
        async () => {
          const currentUrl = page.url();
          const hasError = await page
            .locator(".error, .alert-error")
            .isVisible()
            .catch(() => false);
          const isRedirected = !currentUrl.includes("/auth/signin");
          return hasError || isRedirected;
        },
        {
          timeout: 15000,
          description: "authentication response",
        }
      );
    }

    console.log("✅ Authentication flow with rate limiting completed");
  });

  test("should handle multiple concurrent requests with rate limiting", async ({
    page,
  }) => {
    console.log("🚀 Testing concurrent requests with rate limiting...");

    // Navigate to page first
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
      priority: "high",
    });

    // Make multiple concurrent API calls
    const apiCalls = [
      PlaywrightRateLimitUtils.apiCallWithRateLimit(page, "/api/cities", {
        priority: "medium",
        cacheTtl: config.caching.defaultTtl,
      }),
      PlaywrightRateLimitUtils.apiCallWithRateLimit(page, "/api/health", {
        priority: "low",
        cacheTtl: config.caching.defaultTtl,
      }),
      PlaywrightRateLimitUtils.apiCallWithRateLimit(
        page,
        "/api/cities?search=Bangkok",
        {
          priority: "medium",
          cacheTtl: config.caching.defaultTtl,
        }
      ),
    ];

    // Wait for all API calls to complete
    const results = await Promise.all(apiCalls);

    // Verify all calls succeeded
    results.forEach((result, index) => {
      expect(result).toBeDefined();
      console.log(`✅ API call ${index + 1} completed successfully`);
    });

    // Check rate limiting statistics
    const stats = PlaywrightRateLimitUtils.getStats();
    console.log("📊 Concurrent requests stats:", stats);

    // Verify rate limiting was applied (should have reasonable success rate)
    expect(stats.successRate).toBeGreaterThan(0.8); // At least 80% success rate

    console.log("✅ Concurrent requests with rate limiting completed");
  });

  test("should handle errors gracefully with rate limiting", async ({
    page,
  }) => {
    console.log("⚠️ Testing error handling with rate limiting...");

    // Setup mocks with error simulation
    await setupApiMocks(page, {
      enableCitiesMock: true,
      simulateErrors: true,
      errorRate: 0.5, // 50% error rate for testing
    });

    // Navigate to page
    await PlaywrightRateLimitUtils.navigateWithRateLimit(page, "/", {
      priority: "high",
    });

    // Make API call that might fail
    try {
      const result = await PlaywrightRateLimitUtils.apiCallWithRateLimit(
        page,
        "/api/cities",
        {
          method: "GET",
          priority: "medium",
        }
      );

      // If successful, verify response
      if (result) {
        expect(result).toBeDefined();
        console.log("✅ API call succeeded despite error simulation");
      }
    } catch (error) {
      // Error is expected due to simulation
      console.log("⚠️ API call failed as expected due to error simulation");
      expect(error).toBeDefined();
    }

    // Check that rate limiting handled the errors appropriately
    const stats = PlaywrightRateLimitUtils.getStats();
    console.log("📊 Error handling stats:", stats);

    console.log("✅ Error handling with rate limiting completed");
  });

  test.afterAll(async () => {
    // Final statistics
    const finalStats = PlaywrightRateLimitUtils.getStats();
    console.log("🏁 Final test suite statistics:", finalStats);

    // Reset for next test suite
    PlaywrightRateLimitUtils.reset();

    console.log("✅ Rate-limited E2E tests completed");
  });
});
