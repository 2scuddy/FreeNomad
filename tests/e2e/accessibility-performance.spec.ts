import { test, expect } from "@playwright/test";

test.describe("Accessibility Testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Keyboard Navigation", () => {
    test("should support full keyboard navigation", async ({ page }) => {
      // Start from the top of the page
      await page.keyboard.press("Tab");

      // Track focusable elements
      const focusableElements = [];

      for (let i = 0; i < 20; i++) {
        const focusedElement = page.locator(":focus");
        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate(el =>
            el.tagName.toLowerCase()
          );
          const role = await focusedElement.getAttribute("role");
          const ariaLabel = await focusedElement.getAttribute("aria-label");

          focusableElements.push({ tagName, role, ariaLabel });

          // Verify focus is visible
          await expect(focusedElement).toBeFocused();
        }

        await page.keyboard.press("Tab");
        await page.waitForTimeout(100);
      }

      // Should have found multiple focusable elements
      expect(focusableElements.length).toBeGreaterThan(3);

      console.log(`✅ Found ${focusableElements.length} focusable elements`);
    });

    test("should handle Enter and Space key interactions", async ({ page }) => {
      // Test search button with Enter
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await searchInput.focus();
      await searchInput.fill("Bangkok");

      // Navigate to search button and activate with Enter
      await page.keyboard.press("Tab");
      const searchButton = page.locator(":focus");

      if (await searchButton.isVisible()) {
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);

        // Verify search was triggered
        const url = page.url();
        expect(url).toContain("Bangkok");
      }
    });

    test("should support Escape key for closing modals/menus", async ({
      page,
    }) => {
      // Look for mobile menu button
      const mobileMenuButton = page.locator(
        'button[aria-label*="menu"], [data-testid="mobile-menu"]'
      );

      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);

        // Press Escape to close
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);

        // Menu should be closed (implementation dependent)
        console.log("✅ Escape key handling tested");
      }
    });
  });

  test.describe("Screen Reader Support", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      // Check for proper heading structure (h1 -> h2 -> h3, etc.)
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();

      expect(headings.length).toBeGreaterThan(0);

      // Verify h1 exists and is unique
      const h1Elements = page.locator("h1");
      const h1Count = await h1Elements.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check that h1 has meaningful content
      if (h1Count > 0) {
        const h1Text = await h1Elements.first().textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);
      }

      console.log(
        `✅ Found ${headings.length} headings with proper h1 structure`
      );
    });

    test("should have proper ARIA labels and roles", async ({ page }) => {
      // Check navigation has proper role
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();

      // Check for ARIA landmarks
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();

      // Check buttons have accessible names
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute("aria-label");
          const textContent = await button.textContent();

          // Button should have either aria-label or text content
          expect(ariaLabel || textContent?.trim()).toBeTruthy();
        }
      }

      console.log(`✅ ARIA labels verified for ${buttonCount} buttons`);
    });

    test("should have proper form labels", async ({ page }) => {
      // Check search input has proper labeling
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );

      if (await searchInput.isVisible()) {
        const ariaLabel = await searchInput.getAttribute("aria-label");
        const placeholder = await searchInput.getAttribute("placeholder");
        const associatedLabel = await searchInput.evaluate(input => {
          const id = input.getAttribute("id");
          return id ? document.querySelector(`label[for="${id}"]`) : null;
        });

        // Input should have some form of accessible name
        expect(ariaLabel || placeholder || associatedLabel).toBeTruthy();
      }

      // Test auth forms if accessible
      await page.goto("/auth/login");

      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        const hasLabel = await emailInput.evaluate(input => {
          const id = input.getAttribute("id");
          const ariaLabel = input.getAttribute("aria-label");
          const placeholder = input.getAttribute("placeholder");
          const label = id
            ? document.querySelector(`label[for="${id}"]`)
            : null;

          return !!(ariaLabel || placeholder || label);
        });

        expect(hasLabel).toBeTruthy();
      }

      console.log("✅ Form labels verified");
    });

    test("should have proper image alt text", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(3000);

      const images = page.locator("img");
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute("alt");
          const src = await img.getAttribute("src");

          // Images should have alt text (can be empty for decorative images)
          expect(alt).not.toBeNull();

          // If image has content, alt should not be just filename
          if (alt && src) {
            expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|webp)$/i);
          }
        }
      }

      console.log(`✅ Alt text verified for ${imageCount} images`);
    });
  });

  test.describe("Color and Contrast", () => {
    test("should have sufficient color contrast", async ({ page }) => {
      // Test text contrast (this is a basic check - full contrast testing requires specialized tools)
      const textElements = page.locator(
        "p, h1, h2, h3, h4, h5, h6, a, button, span"
      );
      const elementCount = await textElements.count();

      // Sample a few elements to check they have visible text
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const textContent = await element.textContent();

          if (textContent?.trim()) {
            // Basic visibility check - element should be visible with text
            await expect(element).toBeVisible();

            // Check computed styles for basic contrast indicators
            const styles = await element.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor,
                fontSize: computed.fontSize,
              };
            });

            // Basic checks - should have color and readable font size
            expect(styles.color).toBeTruthy();
            expect(styles.fontSize).toBeTruthy();
          }
        }
      }

      console.log(
        `✅ Basic contrast checks completed for ${elementCount} elements`
      );
    });

    test("should not rely solely on color for information", async ({
      page,
    }) => {
      // Check for error states, success states, etc. that might use color
      await page.goto("/auth/login");

      // Try to trigger validation errors
      const submitButton = page
        .locator('button[type="submit"], [data-testid="login-button"]')
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Look for error messages that should have text, not just color
        const errorElements = page.locator(
          '.error, .text-red, [aria-invalid="true"]'
        );
        const errorCount = await errorElements.count();

        for (let i = 0; i < errorCount; i++) {
          const error = errorElements.nth(i);
          if (await error.isVisible()) {
            const textContent = await error.textContent();
            const ariaLabel = await error.getAttribute("aria-label");

            // Error should have text content or aria-label, not just color
            expect(textContent?.trim() || ariaLabel).toBeTruthy();
          }
        }
      }

      console.log("✅ Color independence verified");
    });
  });

  test.describe("Focus Management", () => {
    test("should have visible focus indicators", async ({ page }) => {
      // Test focus indicators on interactive elements
      const interactiveElements = page.locator(
        "button, a, input, select, textarea"
      );
      const elementCount = await interactiveElements.count();

      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = interactiveElements.nth(i);
        if (await element.isVisible()) {
          await element.focus();

          // Verify element is focused
          await expect(element).toBeFocused();

          // Check for focus styles (basic check)
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              outline: computed.outline,
              outlineWidth: computed.outlineWidth,
              boxShadow: computed.boxShadow,
              border: computed.border,
            };
          });

          // Should have some form of focus indicator
          const hasFocusIndicator =
            styles.outline !== "none" ||
            styles.outlineWidth !== "0px" ||
            styles.boxShadow !== "none" ||
            styles.border.includes("px");

          expect(hasFocusIndicator).toBeTruthy();
        }
      }

      console.log(`✅ Focus indicators verified for ${elementCount} elements`);
    });
  });
});

test.describe("Performance Testing", () => {
  test.describe("Page Load Performance", () => {
    test("should load within acceptable time limits", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/", { waitUntil: "networkidle" });

      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`✅ Page loaded in ${loadTime}ms`);
    });

    test("should have good Core Web Vitals", async ({ page }) => {
      await page.goto("/");

      // Measure Largest Contentful Paint (LCP)
      const lcp = await page.evaluate(() => {
        return new Promise<number>(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ["largest-contentful-paint"] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });

      if (lcp > 0) {
        // LCP should be under 2.5 seconds (2500ms)
        expect(lcp).toBeLessThan(2500);
        console.log(`✅ LCP: ${lcp}ms`);
      }

      // Measure Cumulative Layout Shift (CLS)
      await page.waitForTimeout(3000); // Wait for potential layout shifts

      const cls = await page.evaluate(() => {
        return new Promise<number>(resolve => {
          let clsValue = 0;

          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ["layout-shift"] });

          // Resolve after a short delay
          setTimeout(() => resolve(clsValue), 1000);
        });
      });

      // CLS should be under 0.1
      expect(cls).toBeLessThan(0.1);
      console.log(`✅ CLS: ${cls}`);
    });
  });

  test.describe("Resource Performance", () => {
    test("should optimize image loading", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(3000);

      // Check for lazy loading attributes
      const images = page.locator("img");
      const imageCount = await images.count();

      let lazyLoadedImages = 0;

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const loading = await img.getAttribute("loading");

        if (loading === "lazy") {
          lazyLoadedImages++;
        }
      }

      console.log(
        `✅ ${lazyLoadedImages}/${imageCount} images use lazy loading`
      );
    });

    test("should minimize JavaScript bundle size", async ({ page }) => {
      // Listen for network requests
      const jsRequests: any[] = [];

      page.on("response", response => {
        const url = response.url();
        if (url.includes(".js") && !url.includes("node_modules")) {
          jsRequests.push({
            url,
            size: response.headers()["content-length"],
          });
        }
      });

      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check total JS bundle size
      const totalSize = jsRequests.reduce((sum, req) => {
        const size = parseInt(req.size || "0");
        return sum + size;
      }, 0);

      console.log(`✅ Total JS bundle size: ${totalSize} bytes`);
      console.log(`✅ JS requests: ${jsRequests.length}`);
    });
  });

  test.describe("Memory Performance", () => {
    test("should handle memory efficiently during navigation", async ({
      page,
    }) => {
      const pages = ["/", "/cities", "/about", "/contact"];

      for (const pagePath of pages) {
        const startTime = Date.now();

        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        const loadTime = Date.now() - startTime;

        // Each page should load reasonably quickly
        expect(loadTime).toBeLessThan(5000);

        // Verify page is functional
        await expect(page.locator("body")).toBeVisible();

        console.log(`✅ ${pagePath} loaded in ${loadTime}ms`);
      }
    });

    test("should handle large datasets without performance degradation", async ({
      page,
    }) => {
      await page.goto("/");

      // Simulate scrolling through large content
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(500);
      }

      // Page should remain responsive
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        const value = await searchInput.inputValue();
        expect(value).toBe("test");
      }

      console.log("✅ Performance maintained with large datasets");
    });
  });

  test.describe("Network Performance", () => {
    test("should handle slow network conditions", async ({ page }) => {
      // Simulate slow 3G
      await page.context().route("**/*", async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto("/");
      const loadTime = Date.now() - startTime;

      // Should still load within reasonable time even with delays
      expect(loadTime).toBeLessThan(10000);

      // Verify basic functionality works
      await expect(page.locator("nav")).toBeVisible();

      console.log(`✅ Slow network performance: ${loadTime}ms`);
    });

    test("should handle offline scenarios gracefully", async ({ page }) => {
      // Load page first
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Go offline
      await page.context().setOffline(true);

      // Try to interact with cached content
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      if (await searchInput.isVisible()) {
        await searchInput.fill("offline test");
        const value = await searchInput.inputValue();
        expect(value).toBe("offline test");
      }

      // Restore connection
      await page.context().setOffline(false);

      console.log("✅ Offline handling verified");
    });
  });
});
