import { chromium } from "@playwright/test";
import { RateLimitManager } from "./automation/utils/rate-limit-manager";
import { ApiMockManager } from "./automation/mocks/api-mocks";

async function globalSetup() {
  console.log("🚀 Starting global test setup...");

  // Initialize rate limiting manager
  const rateLimitManager = RateLimitManager.getInstance();
  console.log("⚡ Rate limiting manager initialized");

  // Initialize API mock manager
  const apiMockManager = ApiMockManager.getInstance({
    enableUnsplashMock: true,
    enableCitiesMock: true,
    enableHealthMock: true,
    enableAuthMock: true,
    simulateLatency: true,
    latencyRange: [50, 200], // Reduced latency for tests
    simulateErrors: false, // Disable errors in global setup
    errorRate: 0
  });
  console.log("🎭 API mock manager initialized");

  // Setup test database if needed
  // await setupTestDatabase();

  // Pre-authenticate users for tests that need authentication
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Setup API mocks for pre-authentication
  await apiMockManager.setupMocks(page);

  // You can pre-authenticate a user here and save the storage state
  // await page.goto('/auth/login');
  // await page.fill('[data-testid="email"]', 'test@example.com');
  // await page.fill('[data-testid="password"]', 'password123');
  // await page.click('[data-testid="login-button"]');
  // await page.waitForURL('/dashboard');
  // await page.context().storageState({ path: 'tests/auth.json' });

  await browser.close();

  console.log("✅ Global test setup completed with rate limiting and mocking");
  console.log("📊 Rate limit stats:", rateLimitManager.getStats());
  console.log("🎭 Mock stats:", apiMockManager.getStats());
}

export default globalSetup;
