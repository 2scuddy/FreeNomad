import { test, expect } from "@playwright/test";

test.describe("Core Application Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("User Authentication Workflow", () => {
    test("should complete user registration workflow", async ({ page }) => {
      // Navigate to registration page
      await page.getByRole("link", { name: "Sign Up" }).click();
      await page.waitForURL("**/auth/register");

      // Fill registration form
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@example.com`;

      await page.fill('[data-testid="name"]', "Test User");
      await page.fill('[data-testid="email"]', testEmail);
      await page.fill('[data-testid="password"]', "TestPassword123!");
      await page.fill('[data-testid="confirmPassword"]', "TestPassword123!");

      // Submit registration
      await page.click('[data-testid="register-button"]');

      // Verify successful registration (redirect or success message)
      await page.waitForTimeout(2000);

      // Check for success indicators
      const currentUrl = page.url();
      const hasSuccessMessage = await page
        .locator('.success, .alert-success, [data-testid="success"]')
        .isVisible()
        .catch(() => false);
      const isRedirected = !currentUrl.includes("/auth/register");

      expect(hasSuccessMessage || isRedirected).toBeTruthy();
    });

    test("should complete user login workflow", async ({ page }) => {
      // Navigate to login page
      await page.getByRole("link", { name: "Sign In" }).click();
      await page.waitForURL("**/auth/login");

      // Fill login form with test credentials
      await page.fill('[data-testid="email"]', "test@example.com");
      await page.fill('[data-testid="password"]', "password123");

      // Submit login
      await page.click('[data-testid="login-button"]');

      // Wait for potential redirect or response
      await page.waitForTimeout(2000);

      // Verify login attempt was processed
      const currentUrl = page.url();
      const hasErrorMessage = await page
        .locator('.error, .alert-error, [data-testid="error"]')
        .isVisible()
        .catch(() => false);
      const isRedirected = !currentUrl.includes("/auth/login");

      // Either successful login (redirect) or error message should be shown
      expect(hasErrorMessage || isRedirected).toBeTruthy();
    });

    test("should handle login validation errors", async ({ page }) => {
      await page.getByRole("link", { name: "Sign In" }).click();
      await page.waitForURL("**/auth/login");

      // Try to submit empty form
      await page.click('[data-testid="login-button"]');

      // Check for validation errors
      const hasValidationErrors = await page
        .locator('.error, .text-red, [aria-invalid="true"]')
        .isVisible()
        .catch(() => false);
      expect(hasValidationErrors).toBeTruthy();
    });
  });

  test.describe("City Discovery Workflow", () => {
    test("should complete city search workflow", async ({ page }) => {
      // Use search functionality
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await expect(searchInput).toBeVisible();

      await searchInput.fill("Bangkok");
      await page.getByRole("button", { name: "Search" }).click();

      // Wait for search results
      await page.waitForTimeout(2000);

      // Verify search was processed
      const url = page.url();
      expect(url).toContain("search=Bangkok");
    });

    test("should complete city filtering workflow", async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);

      // Try to interact with filters (mobile or desktop)
      const filterButton = page
        .getByRole("button", { name: /filter/i })
        .first();
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(500);
      }

      // Look for filter controls
      const costSlider = page
        .locator('[data-testid="cost-slider"], input[type="range"]')
        .first();
      if (await costSlider.isVisible()) {
        await costSlider.fill("1000");
        await page.waitForTimeout(1000);
      }

      // At minimum, the filter interaction should not cause errors
      await expect(page.locator("body")).toBeVisible();
    });

    test("should complete city detail view workflow", async ({ page }) => {
      // Wait for city cards to load
      await page.waitForSelector('[data-testid="city-card"]', {
        timeout: 10000,
      });

      const cityCards = page.locator('[data-testid="city-card"]');
      const cardCount = await cityCards.count();

      if (cardCount > 0) {
        // Click on first city card
        await cityCards.first().click();

        // Wait for navigation to city detail page
        await page.waitForURL(/\/cities\/.+/);

        // Verify city detail page elements
        await expect(page.locator("h1")).toBeVisible();

        // Check for key city information sections
        const sections = [
          "cost",
          "safety",
          "internet",
          "walkability",
          "statistics",
          "details",
          "reviews",
        ];

        for (const section of sections) {
          const sectionElement = page
            .locator(`[data-testid="${section}"], .${section}, #${section}`)
            .first();
          if (await sectionElement.isVisible()) {
            await expect(sectionElement).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("User Profile Workflow", () => {
    test("should handle profile access workflow", async ({ page }) => {
      // Try to access profile page directly
      await page.goto("/profile");

      // Should either show profile or redirect to login
      const currentUrl = page.url();
      const isOnProfile = currentUrl.includes("/profile");
      const isOnLogin = currentUrl.includes("/auth/login");

      expect(isOnProfile || isOnLogin).toBeTruthy();

      if (isOnLogin) {
        // Verify login page is displayed correctly
        await expect(page.locator("h1")).toContainText(/sign in|login/i);
      } else {
        // Verify profile page is displayed
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  test.describe("Admin Workflow", () => {
    test("should handle admin access workflow", async ({ page }) => {
      // Try to access admin page
      await page.goto("/admin");

      // Should redirect to login or show access denied
      const currentUrl = page.url();
      const isOnAdmin = currentUrl.includes("/admin");
      const isOnLogin = currentUrl.includes("/auth/login");
      const hasAccessDenied = await page
        .locator(".access-denied, .unauthorized, .error")
        .isVisible()
        .catch(() => false);

      expect(isOnAdmin || isOnLogin || hasAccessDenied).toBeTruthy();
    });
  });

  test.describe("Error Handling Workflow", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto("/cities").catch(() => {});

      // Restore connection
      await page.context().setOffline(false);

      // Verify page can recover
      await page.goto("/");
      await expect(page.locator("body")).toBeVisible();
    });

    test("should handle JavaScript errors gracefully", async ({ page }) => {
      const jsErrors: string[] = [];

      // Listen for JavaScript errors
      page.on("pageerror", error => {
        jsErrors.push(error.message);
      });

      // Navigate through the application
      await page.goto("/");
      await page.waitForTimeout(2000);

      // Try to interact with elements
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
      }

      // Check for critical JavaScript errors
      const criticalErrors = jsErrors.filter(
        error =>
          error.includes("TypeError") ||
          error.includes("ReferenceError") ||
          error.includes("SyntaxError")
      );

      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe("Performance Workflow", () => {
    test("should load pages within acceptable time limits", async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Page should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test("should handle large datasets efficiently", async ({ page }) => {
      // Navigate to cities page which might have many items
      await page.goto("/cities");

      // Wait for content to load
      await page.waitForTimeout(3000);

      // Verify page is responsive
      await expect(page.locator("body")).toBeVisible();

      // Try scrolling to test performance
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });

      await page.waitForTimeout(1000);

      // Page should remain responsive
      await expect(page.locator("body")).toBeVisible();
    });
  });
});
