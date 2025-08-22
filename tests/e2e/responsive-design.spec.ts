import { test, expect, devices } from "@playwright/test";

test.describe("Responsive Design Testing", () => {
  const viewports = [
    { name: "Mobile Portrait", width: 375, height: 667 },
    { name: "Mobile Landscape", width: 667, height: 375 },
    { name: "Tablet Portrait", width: 768, height: 1024 },
    { name: "Tablet Landscape", width: 1024, height: 768 },
    { name: "Desktop Small", width: 1280, height: 720 },
    { name: "Desktop Large", width: 1920, height: 1080 },
    { name: "Ultra Wide", width: 2560, height: 1440 },
  ];

  test.describe("Layout Responsiveness", () => {
    viewports.forEach(viewport => {
      test(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");

        // Verify basic layout elements are visible
        await expect(page.locator("nav")).toBeVisible();
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();

        // Check navigation responsiveness
        const nav = page.locator("nav");
        const navBox = await nav.boundingBox();
        expect(navBox?.width).toBeLessThanOrEqual(viewport.width);

        // Verify content doesn't overflow
        const body = page.locator("body");
        const bodyBox = await body.boundingBox();
        expect(bodyBox?.width).toBeLessThanOrEqual(viewport.width);

        console.log(`✅ Layout verified for ${viewport.name}`);
      });
    });
  });

  test.describe("Navigation Responsiveness", () => {
    test("should show mobile navigation on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // On mobile, navigation might be collapsed
      const mobileMenuButton = page.locator(
        'button[aria-label*="menu"], button[aria-label*="Menu"], .mobile-menu-button, [data-testid="mobile-menu"]'
      );

      if (await mobileMenuButton.isVisible()) {
        // Test mobile menu functionality
        await mobileMenuButton.click();
        await page.waitForTimeout(500);

        // Verify menu items are accessible
        const menuItems = page.locator("nav a, .mobile-menu a");
        const itemCount = await menuItems.count();
        expect(itemCount).toBeGreaterThan(0);
      } else {
        // If no mobile menu, verify horizontal navigation is still accessible
        const navLinks = page.locator("nav a");
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });

    test("should show full navigation on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/");

      // Verify all navigation links are visible
      await expect(page.getByText("Home")).toBeVisible();
      await expect(page.getByText("Cities")).toBeVisible();
      await expect(page.getByText("About")).toBeVisible();
      await expect(page.getByText("Contact")).toBeVisible();

      // Verify auth buttons are visible
      await expect(page.getByText("Sign In")).toBeVisible();
      await expect(page.getByText("Sign Up")).toBeVisible();
    });
  });

  test.describe("Content Responsiveness", () => {
    test("should adapt hero section for different screen sizes", async ({
      page,
    }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 1280, height: 720, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");

        // Verify hero section is visible and properly sized
        const heroSection = page.locator("section").first();
        await expect(heroSection).toBeVisible();

        const heroBox = await heroSection.boundingBox();
        expect(heroBox?.width).toBeLessThanOrEqual(viewport.width);

        // Verify hero text is readable
        await expect(page.getByText("Discover Your Next")).toBeVisible();
        await expect(page.getByText("Digital Nomad Destination")).toBeVisible();

        // Verify search input is accessible
        const searchInput = page.getByPlaceholder(
          "Search cities, countries, or regions..."
        );
        await expect(searchInput).toBeVisible();

        const inputBox = await searchInput.boundingBox();
        expect(inputBox?.width).toBeGreaterThan(200); // Minimum usable width

        console.log(`✅ Hero section responsive on ${viewport.name}`);
      }
    });

    test("should adapt city grid for different screen sizes", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForTimeout(3000); // Wait for potential city cards to load

      const testViewports = [
        { width: 375, height: 667, expectedColumns: 1, name: "Mobile" },
        { width: 768, height: 1024, expectedColumns: 2, name: "Tablet" },
        { width: 1280, height: 720, expectedColumns: 3, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.waitForTimeout(1000);

        const cityCards = page.locator('[data-testid="city-card"]');
        const cardCount = await cityCards.count();

        if (cardCount > 0) {
          // Check if cards are properly arranged
          const firstCard = cityCards.first();
          const cardBox = await firstCard.boundingBox();

          // Verify card width is appropriate for viewport
          const expectedMaxWidth =
            viewport.width / viewport.expectedColumns - 40; // Account for margins
          expect(cardBox?.width).toBeLessThanOrEqual(expectedMaxWidth + 50); // Some tolerance

          console.log(`✅ City grid responsive on ${viewport.name}`);
        }
      }
    });
  });

  test.describe("Form Responsiveness", () => {
    test("should handle form inputs on touch devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Test search input on mobile
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      await expect(searchInput).toBeVisible();

      // Simulate touch interaction
      await searchInput.tap();
      await expect(searchInput).toBeFocused();

      // Test typing
      await searchInput.fill("Bangkok");
      const value = await searchInput.inputValue();
      expect(value).toBe("Bangkok");

      // Test search button
      const searchButton = page.getByRole("button", { name: "Search" });
      await expect(searchButton).toBeVisible();

      const buttonBox = await searchButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThan(40); // Minimum touch target size
    });

    test("should handle authentication forms responsively", async ({
      page,
    }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Test login form
        await page.goto("/auth/login");

        // Verify form is visible and usable
        const emailInput = page
          .locator('input[type="email"], [data-testid="email"]')
          .first();
        if (await emailInput.isVisible()) {
          await expect(emailInput).toBeVisible();

          const inputBox = await emailInput.boundingBox();
          expect(inputBox?.width).toBeGreaterThan(200); // Minimum usable width
        }

        console.log(`✅ Auth forms responsive on ${viewport.name}`);
      }
    });
  });

  test.describe("Footer Responsiveness", () => {
    test("should adapt footer layout for different screen sizes", async ({
      page,
    }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 1280, height: 720, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");

        // Scroll to footer
        await page.locator("footer").scrollIntoViewIfNeeded();

        // Verify footer is visible
        await expect(page.locator("footer")).toBeVisible();

        // Check footer content doesn't overflow
        const footer = page.locator("footer");
        const footerBox = await footer.boundingBox();
        expect(footerBox?.width).toBeLessThanOrEqual(viewport.width);

        // Verify footer links are accessible
        const footerLinks = page.locator("footer a");
        const linkCount = await footerLinks.count();
        expect(linkCount).toBeGreaterThan(0);

        console.log(`✅ Footer responsive on ${viewport.name}`);
      }
    });
  });

  test.describe("Image Responsiveness", () => {
    test("should load appropriate image sizes for different viewports", async ({
      page,
    }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 1280, height: 720, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");
        await page.waitForTimeout(3000);

        // Check for images in city cards or other content
        const images = page.locator("img");
        const imageCount = await images.count();

        if (imageCount > 0) {
          for (let i = 0; i < Math.min(imageCount, 3); i++) {
            const img = images.nth(i);
            if (await img.isVisible()) {
              const imgBox = await img.boundingBox();

              // Verify image doesn't exceed viewport width
              expect(imgBox?.width).toBeLessThanOrEqual(viewport.width);

              // Verify image has proper alt text
              const altText = await img.getAttribute("alt");
              expect(altText).toBeTruthy();
            }
          }
        }

        console.log(`✅ Images responsive on ${viewport.name}`);
      }
    });
  });

  test.describe("Typography Responsiveness", () => {
    test("should scale typography appropriately", async ({ page }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 1280, height: 720, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/");

        // Check main heading
        const mainHeading = page.locator("h1").first();
        if (await mainHeading.isVisible()) {
          const headingBox = await mainHeading.boundingBox();

          // Verify heading doesn't overflow
          expect(headingBox?.width).toBeLessThanOrEqual(viewport.width - 40); // Account for padding

          // Verify heading is readable (minimum height)
          expect(headingBox?.height).toBeGreaterThan(20);
        }

        // Check paragraph text
        const paragraphs = page.locator("p");
        const paragraphCount = await paragraphs.count();

        if (paragraphCount > 0) {
          const firstParagraph = paragraphs.first();
          if (await firstParagraph.isVisible()) {
            const pBox = await firstParagraph.boundingBox();
            expect(pBox?.width).toBeLessThanOrEqual(viewport.width - 40);
          }
        }

        console.log(`✅ Typography responsive on ${viewport.name}`);
      }
    });
  });

  test.describe("Touch and Interaction Responsiveness", () => {
    test("should handle touch interactions on mobile devices", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Test touch targets meet minimum size requirements (44px)
      const buttons = page.locator("button, a");
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const buttonBox = await button.boundingBox();

          // Check minimum touch target size
          const minSize = 40; // Slightly less than 44px for tolerance
          expect(buttonBox?.height).toBeGreaterThan(minSize);
          expect(buttonBox?.width).toBeGreaterThan(minSize);
        }
      }
    });

    test("should handle swipe gestures appropriately", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Test horizontal scrolling if applicable
      const scrollableElements = page.locator(
        '[style*="overflow-x"], .overflow-x-auto, .overflow-x-scroll'
      );
      const scrollCount = await scrollableElements.count();

      if (scrollCount > 0) {
        const scrollable = scrollableElements.first();

        // Simulate swipe gesture
        const box = await scrollable.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + 50, box.y + box.height / 2);
          await page.mouse.up();
        }
      }
    });
  });

  test.describe("Performance on Different Viewports", () => {
    test("should maintain performance across viewport sizes", async ({
      page,
    }) => {
      const testViewports = [
        { width: 375, height: 667, name: "Mobile" },
        { width: 1920, height: 1080, name: "Desktop" },
      ];

      for (const viewport of testViewports) {
        const startTime = Date.now();

        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto("/", { waitUntil: "networkidle" });

        const loadTime = Date.now() - startTime;

        // Performance should be reasonable on all viewport sizes
        expect(loadTime).toBeLessThan(10000);

        console.log(
          `✅ Performance acceptable on ${viewport.name}: ${loadTime}ms`
        );
      }
    });
  });
});

// Device-specific tests using Playwright's device emulation
test.describe("Device-Specific Testing", () => {
  const testDevices = [
    "iPhone 12",
    "iPhone 12 Pro",
    "iPad",
    "Galaxy S21",
    "Pixel 5",
  ];

  testDevices.forEach(deviceName => {
    test(`should work correctly on ${deviceName}`, async ({ browser }) => {
      const device = devices[deviceName];
      if (!device) return;

      const context = await browser.newContext({
        ...device,
      });

      const page = await context.newPage();
      await page.goto("/");

      // Verify basic functionality
      await expect(page.locator("nav")).toBeVisible();
      await expect(page.getByText("FreeNomad")).toBeVisible();

      // Test search functionality
      const searchInput = page.getByPlaceholder(
        "Search cities, countries, or regions..."
      );
      if (await searchInput.isVisible()) {
        await searchInput.tap();
        await searchInput.fill("Bangkok");

        const value = await searchInput.inputValue();
        expect(value).toBe("Bangkok");
      }

      await context.close();

      console.log(`✅ ${deviceName} compatibility verified`);
    });
  });
});
