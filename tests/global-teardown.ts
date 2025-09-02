import { RateLimitManager } from "./automation/utils/rate-limit-manager";
import { ApiMockManager } from "./automation/mocks/api-mocks";

async function globalTeardown() {
  console.log("🧹 Starting global test teardown...");

  // Get final statistics before cleanup
  const rateLimitManager = RateLimitManager.getInstance();
  const apiMockManager = ApiMockManager.getInstance();

  console.log("📊 Final rate limit stats:", rateLimitManager.getStats());
  console.log("🎭 Final mock stats:", apiMockManager.getStats());

  // Reset rate limiting and mocking systems
  rateLimitManager.reset();
  apiMockManager.reset();
  console.log("🔄 Rate limiting and mocking systems reset");

  // Clean up test database if needed
  // await cleanupTestDatabase();

  // Clean up any test files or artifacts
  // await cleanupTestFiles();

  console.log("✅ Global test teardown completed with cleanup");
}

export default globalTeardown;
