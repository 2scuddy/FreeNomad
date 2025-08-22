import { test, expect } from "@playwright/test";

test.describe("Links Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should validate all navigation links", async ({ page }) => {
    // Test main navigation links
    const navLinks = [
      { text: "Home", expectedUrl: "/" },
      { text: "Cities", expectedUrl: "/cities" },
      { text: "About", expectedUrl: "/about" },
      { text: "Contact", expectedUrl: "/contact" },
    ];

    for (const link of navLinks) {
      const linkElement = page.getByRole("link", { name: link.text });
      await expect(linkElement).toBeVisible();

      // Check href attribute
      await expect(linkElement).toHaveAttribute("href", link.expectedUrl);

      // Test navigation
      await linkElement.click();
      await page.waitForURL(`**${link.expectedUrl}`);

      // Verify page loads successfully
      await expect(page.locator("body")).toBeVisible();

      // Return to homepage for next test
      if (link.expectedUrl !== "/") {
        await page.goto("/");
      }
    }
  });

  test("should validate authentication links", async ({ page }) => {
    // Test Sign In link
    const signInLink = page.getByRole("link", { name: "Sign In" });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/auth/login");

    await signInLink.click();
    await page.waitForURL("**/auth/login");
    await expect(page.locator("h1")).toContainText(/sign in|login/i);

    // Test Sign Up link
    await page.goto("/");
    const signUpLink = page.getByRole("link", { name: "Sign Up" });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/auth/register");

    await signUpLink.click();
    await page.waitForURL("**/auth/register");
    await expect(page.locator("h1")).toContainText(/sign up|register/i);
  });

  test("should validate footer links", async ({ page }) => {
    // Scroll to footer
    await page.locator("footer").scrollIntoViewIfNeeded();

    // Test footer navigation links
    const footerLinks = [
      "Browse Cities",
      "Featured Destinations",
      "Travel Guides",
      "Reviews",
      "About Us",
      "Careers",
      "Blog",
      "Press",
      "Help Center",
      "Contact Us",
      "FAQ",
      "Community",
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Disclaimer",
    ];

    for (const linkText of footerLinks) {
      const link = page.getByRole("link", { name: linkText });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href");
    }
  });

  test("should validate social media links", async ({ page }) => {
    // Scroll to footer where social links are located
    await page.locator("footer").scrollIntoViewIfNeeded();

    const socialLinks = [
      { name: "GitHub", expectedDomain: "github.com" },
      { name: "Twitter", expectedDomain: "twitter.com" },
      { name: "LinkedIn", expectedDomain: "linkedin.com" },
      { name: "Instagram", expectedDomain: "instagram.com" },
    ];

    for (const social of socialLinks) {
      const link = page.getByRole("link", { name: social.name });
      await expect(link).toBeVisible();

      const href = await link.getAttribute("href");
      expect(href).toContain(social.expectedDomain);

      // Verify external links open in new tab
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("should validate contact links", async ({ page }) => {
    await page.locator("footer").scrollIntoViewIfNeeded();

    // Test email link
    const emailLink = page.getByRole("link", { name: "hello@freenomad.com" });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:hello@freenomad.com"
    );

    // Test phone link
    const phoneLink = page.getByRole("link", { name: "+1 (555) 012-3456" });
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute("href", "tel:+1-555-0123");
  });

  test("should validate city card links", async ({ page }) => {
    // Wait for city cards to load
    await page.waitForSelector('[data-testid="city-card"]', { timeout: 10000 });

    const cityCards = page.locator('[data-testid="city-card"]');
    const cardCount = await cityCards.count();

    if (cardCount > 0) {
      // Test first few city cards
      const cardsToTest = Math.min(cardCount, 3);

      for (let i = 0; i < cardsToTest; i++) {
        const card = cityCards.nth(i);
        await expect(card).toBeVisible();

        // Get city name for URL validation
        const cityName = await card.locator("h3").textContent();

        // Click and verify navigation
        await card.click();
        await page.waitForURL(/\/cities\/.+/);

        // Verify we're on a city detail page
        await expect(page.locator("h1")).toBeVisible();

        // Go back to homepage
        await page.goto("/");
        await page.waitForSelector('[data-testid="city-card"]', {
          timeout: 5000,
        });
      }
    }
  });

  test("should handle broken links gracefully", async ({ page }) => {
    // Test navigation to non-existent page
    const response = await page.goto("/non-existent-page");
    expect(response?.status()).toBe(404);

    // Verify 404 page is displayed
    await expect(page.locator("body")).toBeVisible();
  });

  test("should validate external link security", async ({ page }) => {
    // Check all external links have proper security attributes
    const externalLinks = page.locator('a[href^="http"]');
    const linkCount = await externalLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = externalLinks.nth(i);

      // External links should open in new tab
      await expect(link).toHaveAttribute("target", "_blank");

      // External links should have security attributes
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });
});
