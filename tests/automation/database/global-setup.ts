import { globalDatabaseSetup } from "./test-database-setup";

/**
 * Global setup for Playwright tests
 * Initializes test database and seeding infrastructure
 */
async function globalSetup() {
  console.log("🌍 Starting global test setup...");

  try {
    // Initialize database management
    await globalDatabaseSetup();

    console.log("✅ Global test setup completed successfully");
  } catch (error) {
    console.error("❌ Global test setup failed:", error);
    throw error;
  }
}

export default globalSetup;
