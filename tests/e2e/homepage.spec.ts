import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the homepage with navigation and hero section", async ({
    page,
  }) => {
    // Check if the navigation is present
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("FreeNomad")).toBeVisible();

    // Check navigation links
    await expect(page.getByText("Home")).toBeVisible();
    await expect(page.getByText("Cities")).toBeVisible();
    await expect(page.getByText("About")).toBeVisible();
    await expect(page.getByText("Contact")).toBeVisible();

    // Check authentication buttons
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByText("Sign Up")).toBeVisible();
  });

  test("should display the hero section with search functionality", async ({
    page,
  }) => {
    // Check hero section
    await expect(page.getByText("Discover Your Next")).toBeVisible();
    await expect(page.getByText("Digital Nomad Destination")).toBeVisible();

    // Check search input
    const searchInput = page.getByPlaceholder(
      "Search cities, countries, or regions..."
    );
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill("Bangkok");
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for search results or URL change
    await page.waitForTimeout(1000);
  });

  test("should display city grid and cards", async ({ page }) => {
    // Wait for city cards to load
    await page.waitForSelector('[data-testid="city-card"]', { timeout: 10000 });

    // Check if city cards are present
    const cityCards = page.locator('[data-testid="city-card"]');
    await expect(cityCards.first()).toBeVisible();

    // Check if city card contains expected elements
    const firstCard = cityCards.first();
    await expect(firstCard.locator("img")).toBeVisible();
    await expect(firstCard.locator("h3")).toBeVisible();
  });

  test("should have working filter functionality", async ({ page }) => {
    // Wait for filters to load
    await page.waitForSelector('[data-testid="filter-sidebar"]', {
      timeout: 5000,
    });

    // Check if filter sidebar is present
    await expect(page.locator('[data-testid="filter-sidebar"]')).toBeVisible();

    // Test mobile filter toggle if on mobile
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      const filterButton = page.getByRole("button", { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await expect(
          page.locator('[data-testid="filter-sidebar"]')
        ).toBeVisible();
      }
    }
  });

  test("should navigate to city detail page when clicking a city card", async ({
    page,
  }) => {
    // Wait for city cards to load
    await page.waitForSelector('[data-testid="city-card"]', { timeout: 10000 });

    // Click on the first city card
    const firstCard = page.locator('[data-testid="city-card"]').first();
    await firstCard.click();

    // Wait for navigation to city detail page
    await page.waitForURL(/\/cities\/.+/);

    // Check if we're on a city detail page
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should be responsive on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if navigation is responsive
    await expect(page.locator("nav")).toBeVisible();

    // Check if hero section is responsive
    await expect(page.getByText("Discover Your Next")).toBeVisible();

    // Check if search input is responsive
    const searchInput = page.getByPlaceholder(
      "Search cities, countries, or regions..."
    );
    await expect(searchInput).toBeVisible();
  });

  test("should have proper SEO meta tags", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FreeNomad/);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /digital nomad/);

    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute("content", /digital nomad/);
  });

  test("should load without accessibility violations", async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    // Check for proper heading hierarchy
    await expect(page.locator("h1")).toBeVisible();

    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        await expect(img).toHaveAttribute("alt");
      }
    }
  });
});
