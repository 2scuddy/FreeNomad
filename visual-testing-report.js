/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Create screenshots directory
const screenshotDir = path.join(__dirname, "visual-testing-screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function runVisualTests() {
  console.log("🎭 Starting Visual Inconsistency Testing...");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const findings = [];

  try {
    // Test 1: Filter accordion transparency and overlapping issues
    console.log(
      "\n📋 Test 1: Filter accordion transparency and overlapping issues"
    );
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: path.join(screenshotDir, "1-homepage-initial.png"),
      fullPage: true,
    });

    // Look for filter elements with multiple selectors
    const filterSelectors = [
      'button:has-text("Filter")',
      '[data-testid="filter-button"]',
      ".filter-button",
      "button[aria-expanded]",
      '[role="button"]:has-text("Filter")',
    ];

    let filterFound = false;
    for (const selector of filterSelectors) {
      const filterButton = page.locator(selector);
      if ((await filterButton.count()) > 0) {
        console.log(`✓ Found filter button with selector: ${selector}`);
        try {
          await filterButton.first().click({ timeout: 5000 });
          await page.waitForTimeout(1000);

          await page.screenshot({
            path: path.join(screenshotDir, "1-filters-open.png"),
            fullPage: true,
          });

          filterFound = true;
          findings.push({
            test: "Filter Accordion",
            status: "Found",
            details: `Filter button found with selector: ${selector}`,
            screenshot: "1-filters-open.png",
          });
          break;
        } catch (error) {
          console.log(
            `⚠️ Could not click filter with selector ${selector}: ${error.message}`
          );
        }
      }
    }

    if (!filterFound) {
      findings.push({
        test: "Filter Accordion",
        status: "Not Found",
        details: "No filter button found with any of the tested selectors",
        screenshot: "1-homepage-initial.png",
      });
    }

    // Test 2: Sign-in and sign-up buttons styling
    console.log("\n🔐 Test 2: Sign-in and sign-up buttons styling");

    // Try different auth page routes
    const authRoutes = ["/auth/signin", "/auth/login", "/login", "/signin"];
    let authPageFound = false;

    for (const route of authRoutes) {
      try {
        await page.goto(`http://localhost:3000${route}`);
        await page.waitForLoadState("networkidle", { timeout: 5000 });

        // Check if we're on an auth page (not redirected to 404)
        const pageTitle = await page.title();
        const pageContent = await page.textContent("body");

        if (
          !pageContent.includes("404") &&
          !pageContent.includes("Not Found")
        ) {
          console.log(`✓ Found auth page at: ${route}`);

          await page.screenshot({
            path: path.join(
              screenshotDir,
              `2-auth-page-${route.replace("/", "")}.png`
            ),
            fullPage: true,
          });

          // Check for auth buttons
          const authButtons = await page
            .locator('button, input[type="submit"]')
            .all();
          const buttonStyles = [];

          for (let i = 0; i < authButtons.length; i++) {
            const button = authButtons[i];
            const text = await button.textContent();
            const styles = await button.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                backgroundColor: computed.backgroundColor,
                color: computed.color,
                border: computed.border,
                borderRadius: computed.borderRadius,
                padding: computed.padding,
              };
            });

            buttonStyles.push({ text: text?.trim(), styles });
          }

          findings.push({
            test: "Auth Buttons Styling",
            status: "Found",
            details: `Auth page found at ${route}`,
            buttonStyles,
            screenshot: `2-auth-page-${route.replace("/", "")}.png`,
          });

          authPageFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${route}: ${error.message}`);
      }
    }

    if (!authPageFound) {
      findings.push({
        test: "Auth Buttons Styling",
        status: "Not Found",
        details: "No accessible auth pages found",
        screenshot: null,
      });
    }

    // Test 3: Color consistency
    console.log("\n🎨 Test 3: Color consistency across pages");

    // Homepage colors
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    const homepageColors = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });

    await page.screenshot({
      path: path.join(screenshotDir, "3-homepage-colors.png"),
      fullPage: true,
    });

    findings.push({
      test: "Color Consistency",
      status: "Documented",
      details: "Homepage colors captured",
      colors: homepageColors,
      screenshot: "3-homepage-colors.png",
    });

    // Test 4: Admin dashboard
    console.log("\n👑 Test 4: Admin dashboard accessibility");

    try {
      await page.goto("http://localhost:3000/admin");
      await page.waitForLoadState("networkidle", { timeout: 5000 });

      await page.screenshot({
        path: path.join(screenshotDir, "4-admin-dashboard.png"),
        fullPage: true,
      });

      // Basic accessibility checks
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];

        // Check for images without alt text
        const images = document.querySelectorAll("img");
        images.forEach((img, index) => {
          if (!img.alt) {
            issues.push(`Image ${index + 1} missing alt text`);
          }
        });

        // Check for form inputs without labels
        const inputs = document.querySelectorAll("input, textarea, select");
        inputs.forEach((input, index) => {
          const hasLabel =
            document.querySelector(`label[for="${input.id}"]`) ||
            input.closest("label") ||
            input.getAttribute("aria-label") ||
            input.getAttribute("aria-labelledby");
          if (!hasLabel) {
            issues.push(`Form input ${index + 1} missing label`);
          }
        });

        return issues;
      });

      findings.push({
        test: "Admin Dashboard Accessibility",
        status: "Tested",
        details: "Admin dashboard accessed and tested",
        accessibilityIssues,
        screenshot: "4-admin-dashboard.png",
      });
    } catch (error) {
      findings.push({
        test: "Admin Dashboard Accessibility",
        status: "Error",
        details: `Could not access admin dashboard: ${error.message}`,
        screenshot: null,
      });
    }

    // Test 5: Navigation bar
    console.log("\n🧭 Test 5: Navigation bar alignment");

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Look for navigation elements
    const navSelectors = ["nav", ".navbar", "header", '[role="navigation"]'];
    let navFound = false;

    for (const selector of navSelectors) {
      const nav = page.locator(selector);
      if ((await nav.count()) > 0) {
        console.log(`✓ Found navigation with selector: ${selector}`);

        const navStyles = await nav.first().evaluate(el => {
          const rect = el.getBoundingClientRect();
          const computed = window.getComputedStyle(el);
          return {
            width: rect.width,
            height: rect.height,
            display: computed.display,
            justifyContent: computed.justifyContent,
            alignItems: computed.alignItems,
            padding: computed.padding,
          };
        });

        await page.screenshot({
          path: path.join(screenshotDir, "5-navigation-bar.png"),
          fullPage: false,
        });

        findings.push({
          test: "Navigation Bar Alignment",
          status: "Found",
          details: `Navigation found with selector: ${selector}`,
          navStyles,
          screenshot: "5-navigation-bar.png",
        });

        navFound = true;
        break;
      }
    }

    if (!navFound) {
      findings.push({
        test: "Navigation Bar Alignment",
        status: "Not Found",
        details: "No navigation elements found",
        screenshot: null,
      });
    }

    // Test 6: Settings page navigation
    console.log("\n⚙️ Test 6: Settings page navigation options");

    const settingsRoutes = ["/settings", "/profile/settings", "/user/settings"];
    let settingsFound = false;

    for (const route of settingsRoutes) {
      try {
        await page.goto(`http://localhost:3000${route}`);
        await page.waitForLoadState("networkidle", { timeout: 5000 });

        const pageContent = await page.textContent("body");
        if (
          !pageContent.includes("404") &&
          !pageContent.includes("Not Found")
        ) {
          console.log(`✓ Found settings page at: ${route}`);

          await page.screenshot({
            path: path.join(
              screenshotDir,
              `6-settings-page-${route.replace(/\//g, "-")}.png`
            ),
            fullPage: true,
          });

          // Check for home navigation options
          const homeLinks = await page
            .locator('a[href="/"], a:has-text("Home")')
            .count();
          const breadcrumbs = await page
            .locator('.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"]')
            .count();
          const backButton = await page
            .locator('button:has-text("Back"), .back-button')
            .count();

          findings.push({
            test: "Settings Page Navigation",
            status: "Found",
            details: `Settings page found at ${route}`,
            navigationOptions: {
              homeLinks,
              breadcrumbs,
              backButton,
            },
            screenshot: `6-settings-page-${route.replace(/\//g, "-")}.png`,
          });

          settingsFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not access ${route}: ${error.message}`);
      }
    }

    if (!settingsFound) {
      findings.push({
        test: "Settings Page Navigation",
        status: "Not Found",
        details: "No accessible settings pages found",
        screenshot: null,
      });
    }
  } catch (error) {
    console.error("❌ Error during testing:", error);
  } finally {
    await browser.close();
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: findings.length,
      foundIssues: findings.filter(
        f => f.status === "Found" || f.status === "Tested"
      ).length,
      notFound: findings.filter(f => f.status === "Not Found").length,
      errors: findings.filter(f => f.status === "Error").length,
    },
    findings,
    screenshotDirectory: screenshotDir,
  };

  // Save report
  const reportPath = path.join(__dirname, "visual-testing-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\n📊 VISUAL TESTING SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Found/Tested: ${report.summary.foundIssues}`);
  console.log(`Not Found: ${report.summary.notFound}`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`\nScreenshots saved to: ${screenshotDir}`);
  console.log(`Report saved to: ${reportPath}`);

  // Print detailed findings
  console.log("\n📋 DETAILED FINDINGS");
  console.log("=".repeat(50));
  findings.forEach((finding, index) => {
    console.log(`\n${index + 1}. ${finding.test}`);
    console.log(`   Status: ${finding.status}`);
    console.log(`   Details: ${finding.details}`);
    if (finding.screenshot) {
      console.log(`   Screenshot: ${finding.screenshot}`);
    }
    if (finding.accessibilityIssues && finding.accessibilityIssues.length > 0) {
      console.log(
        `   Accessibility Issues: ${finding.accessibilityIssues.join(", ")}`
      );
    }
  });

  console.log("\n✅ Visual testing completed!");
}

runVisualTests().catch(console.error);
