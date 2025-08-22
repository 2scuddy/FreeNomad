import { TestDataSeeder, TestDataConfig, SeededData } from "./test-data-seeder";
import { TimeoutManager } from "../config/timeout-config";
import { Page } from "@playwright/test";

export interface DatabaseTestConfig {
  useSeededData: boolean;
  seedConfig: Partial<TestDataConfig>;
  cleanupAfterTest: boolean;
  verifyIntegrity: boolean;
  isolateTests: boolean;
}

export interface TestDatabaseSession {
  id: string;
  seeder: TestDataSeeder;
  data: SeededData | null;
  startTime: Date;
  config: DatabaseTestConfig;
}

export class TestDatabaseManager {
  private static instance: TestDatabaseManager;
  private sessions: Map<string, TestDatabaseSession> = new Map();
  private globalSeeder?: TestDataSeeder;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TestDatabaseManager {
    if (!TestDatabaseManager.instance) {
      TestDatabaseManager.instance = new TestDatabaseManager();
    }
    return TestDatabaseManager.instance;
  }

  /**
   * Initialize the database manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.globalSeeder = new TestDataSeeder();
      await this.globalSeeder.initialize();
      this.isInitialized = true;
      console.log("🗄️ Test database manager initialized");
    } catch (error) {
      console.error("❌ Failed to initialize test database manager:", error);
      throw error;
    }
  }

  /**
   * Setup database for a test session
   */
  async setupTestSession(
    sessionId: string,
    config: Partial<DatabaseTestConfig> = {}
  ): Promise<TestDatabaseSession> {
    await this.initialize();

    const fullConfig: DatabaseTestConfig = {
      useSeededData: true,
      seedConfig: {
        cities: 10,
        users: 5,
        reviews: 20,
        clearExisting: true,
        useFixedSeed: true,
        seedValue: 12345,
      },
      cleanupAfterTest: true,
      verifyIntegrity: true,
      isolateTests: true,
      ...config,
    };

    console.log(`🚀 Setting up test session: ${sessionId}`);

    // Create dedicated seeder for this session if isolation is enabled
    const seeder = fullConfig.isolateTests
      ? new TestDataSeeder()
      : this.globalSeeder!;

    if (fullConfig.isolateTests) {
      await seeder.initialize();
    }

    let data: SeededData | null = null;

    if (fullConfig.useSeededData) {
      console.log("🌱 Seeding test data for session...");
      data = await seeder.seedTestData(fullConfig.seedConfig);

      if (fullConfig.verifyIntegrity) {
        try {
          const isValid = await seeder.verifyDataIntegrity();
          if (!isValid) {
            console.warn(
              "⚠️ Data integrity verification failed, but continuing with test"
            );
          }
        } catch (error) {
          console.warn(
            "⚠️ Data integrity verification error:",
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }

    const session: TestDatabaseSession = {
      id: sessionId,
      seeder,
      data,
      startTime: new Date(),
      config: fullConfig,
    };

    this.sessions.set(sessionId, session);
    console.log(`✅ Test session ${sessionId} setup completed`);

    return session;
  }

  /**
   * Get test session
   */
  getSession(sessionId: string): TestDatabaseSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Cleanup test session
   */
  async cleanupTestSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ Session ${sessionId} not found for cleanup`);
      return;
    }

    console.log(`🧹 Cleaning up test session: ${sessionId}`);

    try {
      if (session.config.cleanupAfterTest) {
        await session.seeder.clearAllData();
      }

      if (session.config.isolateTests) {
        await session.seeder.disconnect();
      }

      this.sessions.delete(sessionId);
      console.log(`✅ Test session ${sessionId} cleanup completed`);
    } catch (error) {
      console.error(`❌ Failed to cleanup session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup all sessions
   */
  async cleanupAllSessions(): Promise<void> {
    console.log("🧹 Cleaning up all test sessions...");

    const cleanupPromises = Array.from(this.sessions.keys()).map(sessionId =>
      this.cleanupTestSession(sessionId)
    );

    await Promise.allSettled(cleanupPromises);

    if (this.globalSeeder) {
      await this.globalSeeder.cleanup();
    }

    this.isInitialized = false;
    console.log("✅ All test sessions cleaned up");
  }

  /**
   * Get session data summary
   */
  async getSessionSummary(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return await session.seeder.generateDataSummary();
  }

  /**
   * Verify all sessions integrity
   */
  async verifyAllSessionsIntegrity(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [sessionId, session] of this.sessions.entries()) {
      try {
        const isValid = await session.seeder.verifyDataIntegrity();
        results.set(sessionId, isValid);
      } catch (error) {
        console.error(`❌ Failed to verify session ${sessionId}:`, error);
        results.set(sessionId, false);
      }
    }

    return results;
  }
}

/**
 * Test database setup utilities for Playwright tests
 */
export class PlaywrightDatabaseUtils {
  private static manager = TestDatabaseManager.getInstance();

  /**
   * Setup database for Playwright test with timeout configuration
   */
  static async setupForTest(
    page: Page,
    testName: string,
    config: Partial<DatabaseTestConfig> = {}
  ): Promise<{
    session: TestDatabaseSession;
    data: SeededData | null;
  }> {
    // Configure extended timeouts for database operations
    await TimeoutManager.configureOperationTimeout(page, "databaseOperation", {
      workflowType: "complex",
      complexityMultiplier: 2,
    });

    const sessionId = `test-${testName}-${Date.now()}`;
    const session = await this.manager.setupTestSession(sessionId, config);

    return {
      session,
      data: session.data,
    };
  }

  /**
   * Setup for authentication workflow tests
   */
  static async setupForAuthTest(
    page: Page,
    testName: string
  ): Promise<{
    session: TestDatabaseSession;
    data: SeededData | null;
    adminUser: any;
    regularUser: any;
  }> {
    // Configure extended timeouts for auth workflows
    await TimeoutManager.configureAuthPage(page, "login");

    const { session, data } = await this.setupForTest(page, testName, {
      seedConfig: {
        users: 5, // Ensure we have enough users for auth tests
        cities: 3,
        reviews: 5,
      },
    });

    // Get specific users for auth testing
    const users = await session.seeder.getSeededUsers();
    const adminUser = users.find(u => u.role === "ADMIN");
    const regularUser = users.find(u => u.role === "USER");

    return {
      session,
      data,
      adminUser,
      regularUser,
    };
  }

  /**
   * Setup for city discovery workflow tests
   */
  static async setupForCityTest(
    page: Page,
    testName: string
  ): Promise<{
    session: TestDatabaseSession;
    data: SeededData | null;
    featuredCities: any[];
    verifiedCities: any[];
  }> {
    const { session, data } = await this.setupForTest(page, testName, {
      seedConfig: {
        cities: 15, // More cities for discovery tests
        users: 3,
        reviews: 30,
      },
    });

    // Get specific cities for testing
    const cities = await session.seeder.getSeededCities();
    const featuredCities = cities.filter(c => c.featured);
    const verifiedCities = cities.filter(c => c.verified);

    return {
      session,
      data,
      featuredCities,
      verifiedCities,
    };
  }

  /**
   * Cleanup after test
   */
  static async cleanupAfterTest(sessionId: string): Promise<void> {
    await this.manager.cleanupTestSession(sessionId);
  }

  /**
   * Get test data for assertions
   */
  static async getTestData(sessionId: string): Promise<{
    cities: any[];
    users: any[];
    reviews: any[];
  }> {
    const session = this.manager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const [cities, users, reviews] = await Promise.all([
      session.seeder.getSeededCities(),
      session.seeder.getSeededUsers(),
      session.seeder.getSeededReviews(),
    ]);

    return { cities, users, reviews };
  }

  /**
   * Wait for database operation with timeout
   */
  static async waitForDatabaseOperation(
    page: Page,
    operation: () => Promise<void>,
    timeoutMs?: number
  ): Promise<void> {
    const timeout =
      timeoutMs || TimeoutManager.getBaseTimeout("databaseOperation");

    const originalTimeout = 30000; // Default timeout
    page.setDefaultTimeout(timeout);

    try {
      await operation();
    } finally {
      page.setDefaultTimeout(originalTimeout);
    }
  }

  /**
   * Verify test data consistency
   */
  static async verifyDataConsistency(sessionId: string): Promise<boolean> {
    const session = this.manager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return await session.seeder.verifyDataIntegrity();
  }
}

/**
 * Global setup and teardown functions for test suites
 */
export async function globalDatabaseSetup(): Promise<void> {
  const manager = TestDatabaseManager.getInstance();
  await manager.initialize();
  console.log("🌍 Global database setup completed");
}

export async function globalDatabaseTeardown(): Promise<void> {
  const manager = TestDatabaseManager.getInstance();
  await manager.cleanupAllSessions();
  console.log("🌍 Global database teardown completed");
}

/**
 * Utility functions for test configuration
 */
export const TEST_CONFIGS = {
  MINIMAL: {
    seedConfig: {
      cities: 3,
      users: 2,
      reviews: 5,
    },
  },
  STANDARD: {
    seedConfig: {
      cities: 10,
      users: 5,
      reviews: 20,
    },
  },
  COMPREHENSIVE: {
    seedConfig: {
      cities: 25,
      users: 10,
      reviews: 50,
    },
  },
  AUTH_FOCUSED: {
    seedConfig: {
      cities: 5,
      users: 8, // More users for auth testing
      reviews: 15,
    },
  },
  CITY_FOCUSED: {
    seedConfig: {
      cities: 20, // More cities for discovery testing
      users: 3,
      reviews: 40,
    },
  },
} as const;

export type TestConfigType = keyof typeof TEST_CONFIGS;

export function getTestConfig(
  type: TestConfigType
): Partial<DatabaseTestConfig> {
  return TEST_CONFIGS[type];
}
