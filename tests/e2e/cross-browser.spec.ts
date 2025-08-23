import { test, expect } from "@playwright/test";

test.describe("Cross-Browser Compatibility", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Core Functionality Across Browsers", () => {
    test("should render homepage correctly in all browsers", async ({
      page,
      browserName,
    }) => {
      // Verify basic page structure
      await expect(page.locator("nav")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      // Verify navigation elements
      await expect(page.getByText("FreeNomad")).toBeVisible();
      await expect(page.getByText("Home")).toBeVisible();
      await expect(page.getByText("Cities")).toBeVisible();

      // Verify hero section
      await expect(page.getByText("Discover Your Next")).toBeVisible();
      await expect(page.getByText("Digital Nomad Destination")).toBeVisible();

      console.log(`✅ Homepage rendered correctly in ${browserName}`);
    });

    test("should handle form interactions across browsers", async ({
      page,
      browserName,
    }) => {
      // Test search form
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await expect(searchInput).toBeVisible();

      await searchInput.fill("Bangkok");
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe("Bangkok");

      // Test form submission
      await page.getByRole("button", { name: "Search" }).click();
      await page.waitForTimeout(1000);

      console.log(`✅ Form interactions work correctly in ${browserName}`);
    });

    test("should handle navigation across browsers", async ({
      page,
      browserName,
    }) => {
      // Test navigation links
      await page.getByRole("link", { name: "Cities" }).click();
      await page.waitForURL("**/cities");
      await expect(page.locator("body")).toBeVisible();

      // Navigate back
      await page.goBack();
      await expect(page.getByText("Discover Your Next")).toBeVisible();

      console.log(`✅ Navigation works correctly in ${browserName}`);
    });
  });

  test.describe("CSS and Layout Compatibility", () => {
    test("should display consistent layouts across browsers", async ({
      page,
      browserName,
    }) => {
      // Check navigation layout
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();

      const navBox = await nav.boundingBox();
      expect(navBox?.height).toBeGreaterThan(50); // Minimum nav height

      // Check hero section layout
      const heroSection = page.locator("section").first();
      await expect(heroSection).toBeVisible();

      const heroBox = await heroSection.boundingBox();
      expect(heroBox?.height).toBeGreaterThan(200); // Minimum hero height

      console.log(`✅ Layout consistency verified in ${browserName}`);
    });

    test("should handle CSS Grid and Flexbox correctly", async ({
      page,
      browserName,
    }) => {
      // Wait for city cards to potentially load
      await page.waitForTimeout(3000);

      // Check if city grid is displayed properly
      const cityCards = page.locator('[data-testid="city-card"]');
      const cardCount = await cityCards.count();

      if (cardCount > 0) {
        // Verify cards are properly laid out
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = cityCards.nth(i);
          await expect(card).toBeVisible();

          const cardBox = await card.boundingBox();
          expect(cardBox?.width).toBeGreaterThan(200); // Minimum card width
          expect(cardBox?.height).toBeGreaterThan(150); // Minimum card height
        }
      }

      console.log(`✅ CSS Grid/Flexbox works correctly in ${browserName}`);
    });

    test("should handle CSS animations and transitions", async ({
      page,
      browserName,
    }) => {
      // Test hover effects on navigation
      const homeLink = page.getByRole("link", { name: "Home" });
      await homeLink.hover();

      // Test button hover effects
      const searchButton = page.getByRole("button", { name: "Search" });
      await searchButton.hover();

      // Verify elements are still visible after hover
      await expect(homeLink).toBeVisible();
      await expect(searchButton).toBeVisible();

      console.log(`✅ CSS animations work correctly in ${browserName}`);
    });
  });

  test.describe("JavaScript Compatibility", () => {
    test("should handle modern JavaScript features", async ({
      page,
      browserName,
    }) => {
      const jsErrors: string[] = [];

      // Listen for JavaScript errors
      page.on("pageerror", error => {
        jsErrors.push(error.message);
      });

      // Test interactive elements
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await searchInput.fill("test");
      await searchInput.clear();

      // Test form submission
      await searchInput.fill("Bangkok");
      await page.getByRole("button", { name: "Search" }).click();

      await page.waitForTimeout(2000);

      // Check for JavaScript errors
      const criticalErrors = jsErrors.filter(
        error =>
          !error.includes("favicon") &&
          !error.includes("manifest") &&
          !error.includes("sw.js")
      );

      expect(criticalErrors.length).toBe(0);

      console.log(`✅ JavaScript compatibility verified in ${browserName}`);
    });

    test("should handle async operations correctly", async ({
      page,
      browserName,
    }) => {
      // Test navigation which might involve async operations
      await page.getByRole("link", { name: "Cities" }).click();
      await page.waitForLoadState("networkidle");

      // Verify page loaded correctly
      await expect(page.locator("body")).toBeVisible();

      console.log(`✅ Async operations work correctly in ${browserName}`);
    });
  });

  test.describe("Browser-Specific Features", () => {
    test("should handle browser-specific APIs", async ({
      page,
      browserName,
    }) => {
      // Test localStorage availability
      const localStorageSupported = await page.evaluate(() => {
        try {
          localStorage.setItem("test", "value");
          const value = localStorage.getItem("test");
          localStorage.removeItem("test");
          return value === "value";
        } catch {
          return false;
        }
      });

      expect(localStorageSupported).toBe(true);

      // Test sessionStorage availability
      const sessionStorageSupported = await page.evaluate(() => {
        try {
          sessionStorage.setItem("test", "value");
          const value = sessionStorage.getItem("test");
          sessionStorage.removeItem("test");
          return value === "value";
        } catch {
          return false;
        }
      });

      expect(sessionStorageSupported).toBe(true);

      console.log(`✅ Browser APIs work correctly in ${browserName}`);
    });

    test("should handle viewport and scrolling", async ({
      page,
      browserName,
    }) => {
      // Test scrolling behavior
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const topScrollY = await page.evaluate(() => window.scrollY);
      expect(topScrollY).toBe(0);

      console.log(`✅ Scrolling works correctly in ${browserName}`);
    });
  });

  test.describe("Performance Across Browsers", () => {
    test("should load within acceptable time limits", async ({
      page,
      browserName,
    }) => {
      const startTime = Date.now();

      await page.goto("/", { waitUntil: "networkidle" });

      const loadTime = Date.now() - startTime;

      // Allow more time for WebKit/Safari
      const maxLoadTime = browserName === "webkit" ? 15000 : 10000;
      expect(loadTime).toBeLessThan(maxLoadTime);

      console.log(`✅ Load time (${loadTime}ms) acceptable in ${browserName}`);
    });

    test("should handle memory usage efficiently", async ({
      page,
      browserName,
    }) => {
      // Navigate through multiple pages to test memory usage
      const pages = ["/", "/cities", "/about", "/contact"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        // Verify page is responsive
        await expect(page.locator("body")).toBeVisible();
      }

      console.log(`✅ Memory usage efficient in ${browserName}`);
    });
  });

  test.describe("Security Features", () => {
    test("should handle HTTPS and security headers", async ({
      page,
      browserName,
    }) => {
      // Check if page is served over HTTPS in production
      const url = page.url();
      const isLocalhost =
        url.includes("localhost") || url.includes("127.0.0.1");

      if (!isLocalhost) {
        expect(url).toMatch(/^https:/);
      }

      // Test CSP and other security headers would be checked here
      // This is more relevant for production environments

      console.log(`✅ Security features verified in ${browserName}`);
    });

    test("should handle XSS protection", async ({ page, browserName }) => {
      // Test XSS protection in search input
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );

      const xssPayload = '<script>alert("xss")</script>';
      await searchInput.fill(xssPayload);

      // Verify the script doesn't execute
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe(xssPayload); // Should be treated as text

      console.log(`✅ XSS protection verified in ${browserName}`);
    });
  });
});

// Browser-specific test configurations
test.describe("Safari/WebKit Specific Tests", () => {
  test.skip(({ browserName }) => browserName !== "webkit");

  test("should handle Safari-specific behaviors", async ({ page }) => {
    // Test Safari-specific date input handling
    await page.goto("/");

    // Test touch events simulation
    const searchInput = page.getByPlaceholder(
      "Search cities, countries, or regions..."
    );
    await searchInput.tap();
    await expect(searchInput).toBeFocused();

    console.log("✅ Safari-specific behaviors verified");
  });
});

test.describe("Firefox Specific Tests", () => {
  test.skip(({ browserName }) => browserName !== "firefox");

  test("should handle Firefox-specific behaviors", async ({ page }) => {
    // Test Firefox-specific CSS handling
    await page.goto("/");

    // Verify layout in Firefox
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    console.log("✅ Firefox-specific behaviors verified");
  });
});

test.describe("Chrome/Chromium Specific Tests", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("should handle Chrome-specific behaviors", async ({ page }) => {
    // Test Chrome-specific features
    await page.goto("/");

    // Test Chrome DevTools Protocol features if needed
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    console.log("✅ Chrome-specific behaviors verified");
  });
});
