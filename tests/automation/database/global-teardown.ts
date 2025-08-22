import { globalDatabaseTeardown } from "./test-database-setup";

/**
 * Global teardown for Playwright tests
 * Cleans up test database and closes connections
 */
async function globalTeardown() {
  console.log("🌍 Starting global test teardown...");

  try {
    // Cleanup database management
    await globalDatabaseTeardown();

    console.log("✅ Global test teardown completed successfully");
  } catch (error) {
    console.error("❌ Global test teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
    console.error("Continuing despite teardown error...");
  }
}

export default globalTeardown;
