import { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global test teardown...");

  // Clean up test database if needed
  // await cleanupTestDatabase();

  // Clean up any test files or artifacts
  // await cleanupTestFiles();

  console.log("✅ Global test teardown completed");
}

export default globalTeardown;
