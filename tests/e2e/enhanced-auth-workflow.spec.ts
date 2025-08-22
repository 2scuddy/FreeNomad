import { test, expect } from "@playwright/test";
import { TimeoutManager } from "../automation/config/timeout-config";
import {
  PlaywrightDatabaseUtils,
  TEST_CONFIGS,
} from "../automation/database/test-database-setup";

test.describe("Enhanced Authentication Workflow", () => {
  let sessionId: string;
  let testData: any;

  test.beforeEach(async ({ page }) => {
    // Setup test with enhanced timeout and database management
    const { session, data, adminUser, regularUser } =
      await PlaywrightDatabaseUtils.setupForAuthTest(page, "auth-workflow");

    sessionId = session.id;
    testData = {
      data,
      adminUser,
      regularUser,
    };

    console.log(`🧪 Test setup completed for session: ${sessionId}`);
    console.log(`👤 Admin user: ${adminUser?.email}`);
    console.log(`👤 Regular user: ${regularUser?.email}`);
  });

  test.afterEach(async () => {
    // Cleanup test session
    if (sessionId) {
      await PlaywrightDatabaseUtils.cleanupAfterTest(sessionId);
      console.log(`🧹 Cleanup completed for session: ${sessionId}`);
    }
  });

  test("should complete user registration workflow with extended timeouts", async ({
    page,
  }) => {
    // Configure extended timeouts for registration workflow
    await TimeoutManager.configureAuthPage(page, "registration");

    console.log("🚀 Starting registration workflow test...");

    // Navigate to registration page with dynamic timeout
    await TimeoutManager.navigateWithTimeout(page, "/auth/register", {
      workflowType: "complex",
      networkCondition: "slow",
    });

    // Verify registration page loaded
    await TimeoutManager.waitWithDynamicTimeout(
      page,
      'h1:has-text("Create Account")',
      {
        workflowType: "complex",
        state: "visible",
      }
    );

    // Fill registration form with extended timeouts
    const email = `test-${Date.now()}@example.com`;
    const password = "TestPassword123!";
    const name = "Test User";

    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.fill('[data-testid="name-input"]', name);

    // Submit form with dynamic timeout
    await TimeoutManager.submitFormWithTimeout(
      page,
      '[data-testid="register-button"]',
      {
        workflowType: "critical",
        complexityMultiplier: 2,
      }
    );

    // Wait for API response with timeout
    await TimeoutManager.waitForApiResponse(page, "/api/auth/register", {
      workflowType: "complex",
    });

    // Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({
      timeout: TimeoutManager.getAuthTimeout("registration"),
    });

    console.log("✅ Registration workflow completed successfully");
  });

  test("should complete user login workflow with seeded data", async ({
    page,
  }) => {
    // Configure extended timeouts for login workflow
    await TimeoutManager.configureAuthPage(page, "login");

    console.log("🔐 Starting login workflow test...");

    // Use seeded regular user for login
    const user = testData.regularUser;
    expect(user).toBeDefined();
    expect(user.email).toBeDefined();

    // Navigate to login page
    await TimeoutManager.navigateWithTimeout(page, "/auth/login", {
      workflowType: "complex",
    });

    // Verify login page loaded
    await TimeoutManager.waitWithDynamicTimeout(
      page,
      'h1:has-text("Sign In")',
      {
        workflowType: "complex",
        state: "visible",
      }
    );

    // Fill login form
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', "password123"); // Default test password

    // Submit login form with extended timeout
    await TimeoutManager.submitFormWithTimeout(
      page,
      '[data-testid="login-button"]',
      {
        workflowType: "critical",
        complexityMultiplier: 1.5,
      }
    );

    // Wait for authentication API response
    await TimeoutManager.waitForApiResponse(page, "/api/auth", {
      workflowType: "complex",
    });

    // Verify successful login (redirect to dashboard or profile)
    await expect(page).toHaveURL(/\/(dashboard|profile)/, {
      timeout: TimeoutManager.getAuthTimeout("login"),
    });

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({
      timeout: TimeoutManager.getBaseTimeout("elementWait"),
    });

    console.log("✅ Login workflow completed successfully");
  });

  test("should handle login validation errors with proper timeouts", async ({
    page,
  }) => {
    // Configure timeouts for error scenarios
    await TimeoutManager.configureOperationTimeout(page, "formSubmission", {
      workflowType: "complex",
    });

    console.log("❌ Testing login validation errors...");

    // Navigate to login page
    await TimeoutManager.navigateWithTimeout(page, "/auth/login");

    // Test invalid email format
    await page.fill('[data-testid="email-input"]', "invalid-email");
    await page.fill('[data-testid="password-input"]', "password123");

    // Submit form and expect validation error
    await TimeoutManager.submitFormWithTimeout(
      page,
      '[data-testid="login-button"]',
      {
        workflowType: "simple", // Validation errors are quick
      }
    );

    // Verify validation error appears
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible({
      timeout: TimeoutManager.getBaseTimeout("elementWait"),
    });

    // Test non-existent user
    await page.fill('[data-testid="email-input"]', "nonexistent@example.com");
    await page.fill('[data-testid="password-input"]', "password123");

    await TimeoutManager.submitFormWithTimeout(
      page,
      '[data-testid="login-button"]',
      {
        workflowType: "complex", // API call for authentication
      }
    );

    // Verify authentication error
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible({
      timeout: TimeoutManager.getAuthTimeout("login"),
    });

    console.log("✅ Login validation error handling verified");
  });

  test("should verify data consistency throughout test", async ({ page }) => {
    console.log("🔍 Verifying data consistency...");

    // Verify initial data integrity
    const isConsistent =
      await PlaywrightDatabaseUtils.verifyDataConsistency(sessionId);
    expect(isConsistent).toBe(true);

    // Get current test data
    const currentData = await PlaywrightDatabaseUtils.getTestData(sessionId);

    // Verify we have the expected data
    expect(currentData.users.length).toBeGreaterThan(0);
    expect(currentData.cities.length).toBeGreaterThan(0);
    expect(currentData.reviews.length).toBeGreaterThan(0);

    // Verify admin user exists
    const adminUser = currentData.users.find(u => u.role === "ADMIN");
    expect(adminUser).toBeDefined();

    // Verify regular users exist
    const regularUsers = currentData.users.filter(u => u.role === "USER");
    expect(regularUsers.length).toBeGreaterThan(0);

    console.log(`📊 Data verification completed:`);
    console.log(`   Users: ${currentData.users.length}`);
    console.log(`   Cities: ${currentData.cities.length}`);
    console.log(`   Reviews: ${currentData.reviews.length}`);
    console.log(`   Admin users: 1`);
    console.log(`   Regular users: ${regularUsers.length}`);

    console.log("✅ Data consistency verified");
  });

  test("should handle complex authentication flow with database operations", async ({
    page,
  }) => {
    // Configure maximum timeouts for complex workflow
    await TimeoutManager.configureAuthPage(page, "emailVerification");

    console.log("🔄 Testing complex authentication flow...");

    const user = testData.regularUser;
    expect(user).toBeDefined();

    // Navigate to login
    await TimeoutManager.navigateWithTimeout(page, "/auth/login", {
      workflowType: "critical",
    });

    // Perform login
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', "password123");

    // Submit with maximum timeout for complex flow
    await TimeoutManager.submitFormWithTimeout(
      page,
      '[data-testid="login-button"]',
      {
        workflowType: "critical",
        complexityMultiplier: 3,
        networkCondition: "slow",
      }
    );

    // Wait for multiple API calls that might occur during complex auth
    await Promise.all([
      TimeoutManager.waitForApiResponse(page, "/api/auth", {
        workflowType: "critical",
      }),
      TimeoutManager.waitForApiResponse(page, "/api/user", {
        workflowType: "complex",
      }),
    ]);

    // Verify successful authentication with extended timeout
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({
      timeout: TimeoutManager.getAuthTimeout("emailVerification"),
    });

    // Verify data consistency after complex operations
    await PlaywrightDatabaseUtils.waitForDatabaseOperation(
      page,
      async () => {
        const isConsistent =
          await PlaywrightDatabaseUtils.verifyDataConsistency(sessionId);
        expect(isConsistent).toBe(true);
      },
      TimeoutManager.getBaseTimeout("databaseOperation")
    );

    console.log("✅ Complex authentication flow completed successfully");
  });
});
