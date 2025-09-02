/**
 * API Mocks for Test Execution
 * Prevents rate limiting by providing realistic mock responses for external services
 */

import { Page } from "@playwright/test";

// Mock data for Unsplash API
const MOCK_UNSPLASH_IMAGES = [
  {
    id: "mock-city-1",
    urls: {
      raw: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800",
      full: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800",
      regular:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
      small:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300",
      thumb:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150",
    },
    alt_description: "Beautiful city skyline at sunset",
    description: "A stunning view of the city during golden hour",
    user: {
      name: "Test Photographer",
      username: "testphotographer",
      links: {
        html: "https://unsplash.com/@testphotographer",
      },
    },
    links: {
      html: "https://unsplash.com/photos/mock-city-1",
    },
  },
  {
    id: "mock-city-2",
    urls: {
      raw: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800",
      full: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800",
      regular:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600",
      small:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300",
      thumb:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=150",
    },
    alt_description: "Modern city architecture",
    description: "Contemporary urban landscape with modern buildings",
    user: {
      name: "Urban Explorer",
      username: "urbanexplorer",
      links: {
        html: "https://unsplash.com/@urbanexplorer",
      },
    },
    links: {
      html: "https://unsplash.com/photos/mock-city-2",
    },
  },
  {
    id: "mock-city-3",
    urls: {
      raw: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&h=800",
      full: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&h=800",
      regular:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=600",
      small:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300",
      thumb:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=200&h=150",
    },
    alt_description: "Historic city center",
    description: "Charming old town with traditional architecture",
    user: {
      name: "Heritage Photographer",
      username: "heritagephoto",
      links: {
        html: "https://unsplash.com/@heritagephoto",
      },
    },
    links: {
      html: "https://unsplash.com/photos/mock-city-3",
    },
  },
];

// Mock data for Cities API
const MOCK_CITIES_DATA = {
  success: true,
  data: [
    {
      id: "mock-city-bangkok",
      name: "Bangkok",
      country: "Thailand",
      continent: "Asia",
      costOfLiving: 800,
      safetyRating: 7.5,
      internetSpeed: 85,
      weatherScore: 8.2,
      featured: true,
      verified: true,
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600",
      description: "Vibrant capital city with amazing street food and culture",
    },
    {
      id: "mock-city-lisbon",
      name: "Lisbon",
      country: "Portugal",
      continent: "Europe",
      costOfLiving: 1200,
      safetyRating: 8.8,
      internetSpeed: 95,
      weatherScore: 9.1,
      featured: true,
      verified: true,
      imageUrl:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600",
      description: "Beautiful coastal city with rich history and great weather",
    },
    {
      id: "mock-city-mexico-city",
      name: "Mexico City",
      country: "Mexico",
      continent: "North America",
      costOfLiving: 600,
      safetyRating: 6.5,
      internetSpeed: 75,
      weatherScore: 7.8,
      featured: false,
      verified: true,
      imageUrl:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=600",
      description: "Massive metropolis with incredible culture and food scene",
    },
  ],
  meta: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

// Mock data for Health API
const MOCK_HEALTH_DATA = {
  status: "healthy",
  timestamp: new Date().toISOString(),
  uptime: 3600,
  version: "1.0.0",
  environment: "test",
  checks: {
    database: "healthy",
    externalServices: "healthy",
    memory: "healthy",
    disk: "healthy",
  },
  dependencies: {
    database: {
      status: "healthy",
      responseTime: 15,
      lastChecked: new Date().toISOString(),
    },
    externalAPIs: {
      status: "healthy",
      responseTime: 120,
      services: {
        unsplash: true,
        geocoding: true,
      },
    },
  },
};

// Mock data for Auth API
const MOCK_AUTH_RESPONSES = {
  login: {
    success: true,
    user: {
      id: "mock-user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      verified: true,
    },
    token: "mock-jwt-token-12345",
  },
  register: {
    success: true,
    message: "User registered successfully",
    user: {
      id: "mock-user-2",
      email: "newuser@example.com",
      name: "New User",
      role: "USER",
      verified: false,
    },
  },
  profile: {
    success: true,
    user: {
      id: "mock-user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      verified: true,
      preferences: {
        currency: "USD",
        language: "en",
        notifications: true,
      },
    },
  },
};

export interface MockConfig {
  enableUnsplashMock: boolean;
  enableCitiesMock: boolean;
  enableHealthMock: boolean;
  enableAuthMock: boolean;
  simulateLatency: boolean;
  latencyRange: [number, number]; // [min, max] in milliseconds
  simulateErrors: boolean;
  errorRate: number; // 0-1, percentage of requests that should fail
}

const DEFAULT_MOCK_CONFIG: MockConfig = {
  enableUnsplashMock: true,
  enableCitiesMock: true,
  enableHealthMock: true,
  enableAuthMock: true,
  simulateLatency: true,
  latencyRange: [100, 500],
  simulateErrors: false,
  errorRate: 0.05, // 5% error rate
};

export class ApiMockManager {
  private static instance: ApiMockManager;
  private config: MockConfig;
  private activeMocks: Set<string> = new Set();
  private requestCounts: Map<string, number> = new Map();

  private constructor(config: Partial<MockConfig> = {}) {
    this.config = { ...DEFAULT_MOCK_CONFIG, ...config };
  }

  static getInstance(config?: Partial<MockConfig>): ApiMockManager {
    if (!ApiMockManager.instance) {
      ApiMockManager.instance = new ApiMockManager(config);
    }
    return ApiMockManager.instance;
  }

  /**
   * Setup all API mocks for a Playwright page
   */
  async setupMocks(
    page: Page,
    customConfig?: Partial<MockConfig>
  ): Promise<void> {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    console.log("🎭 Setting up API mocks with config:", this.config);

    // Setup Unsplash API mock
    if (this.config.enableUnsplashMock) {
      await this.setupUnsplashMock(page);
    }

    // Setup Cities API mock
    if (this.config.enableCitiesMock) {
      await this.setupCitiesMock(page);
    }

    // Setup Health API mock
    if (this.config.enableHealthMock) {
      await this.setupHealthMock(page);
    }

    // Setup Auth API mock
    if (this.config.enableAuthMock) {
      await this.setupAuthMock(page);
    }

    console.log(
      `✅ API mocks setup complete. Active mocks: ${Array.from(this.activeMocks).join(", ")}`
    );
  }

  /**
   * Setup Unsplash API mock
   */
  private async setupUnsplashMock(page: Page): Promise<void> {
    await page.route("**/api.unsplash.com/**", async route => {
      const url = route.request().url();
      this.incrementRequestCount("unsplash");

      // Simulate latency
      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      // Simulate errors
      if (this.config.simulateErrors && Math.random() < this.config.errorRate) {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Rate limit exceeded",
            message: "Too many requests",
          }),
        });
        return;
      }

      // Parse query parameters
      const urlObj = new URL(url);
      const query = urlObj.searchParams.get("query") || "";
      const perPage = parseInt(urlObj.searchParams.get("per_page") || "5");

      // Filter images based on query
      let filteredImages = MOCK_UNSPLASH_IMAGES;
      if (query) {
        filteredImages = MOCK_UNSPLASH_IMAGES.filter(
          img =>
            img.alt_description?.toLowerCase().includes(query.toLowerCase()) ||
            img.description?.toLowerCase().includes(query.toLowerCase())
        );
      }

      const response = {
        results: filteredImages.slice(0, perPage),
        total: filteredImages.length,
        total_pages: Math.ceil(filteredImages.length / perPage),
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    this.activeMocks.add("unsplash");
  }

  /**
   * Setup Cities API mock
   */
  private async setupCitiesMock(page: Page): Promise<void> {
    await page.route("**/api/cities**", async route => {
      const url = route.request().url();
      this.incrementRequestCount("cities");

      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      if (this.config.simulateErrors && Math.random() < this.config.errorRate) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Internal server error",
          }),
        });
        return;
      }

      // Parse query parameters
      const urlObj = new URL(url);
      const search = urlObj.searchParams.get("search");
      const limit = parseInt(urlObj.searchParams.get("limit") || "10");
      const page = parseInt(urlObj.searchParams.get("page") || "1");

      let filteredCities = [...MOCK_CITIES_DATA.data];

      // Apply search filter
      if (search) {
        filteredCities = filteredCities.filter(
          city =>
            city.name.toLowerCase().includes(search.toLowerCase()) ||
            city.country.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCities = filteredCities.slice(startIndex, endIndex);

      const response = {
        ...MOCK_CITIES_DATA,
        data: paginatedCities,
        meta: {
          total: filteredCities.length,
          page,
          limit,
          totalPages: Math.ceil(filteredCities.length / limit),
        },
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    this.activeMocks.add("cities");
  }

  /**
   * Setup Health API mock
   */
  private async setupHealthMock(page: Page): Promise<void> {
    await page.route("**/api/health**", async route => {
      this.incrementRequestCount("health");

      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      const response = {
        ...MOCK_HEALTH_DATA,
        timestamp: new Date().toISOString(),
        dependencies: {
          ...MOCK_HEALTH_DATA.dependencies,
          database: {
            ...MOCK_HEALTH_DATA.dependencies.database,
            lastChecked: new Date().toISOString(),
          },
        },
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });

    this.activeMocks.add("health");
  }

  /**
   * Setup Auth API mock
   */
  private async setupAuthMock(page: Page): Promise<void> {
    // Login endpoint
    await page.route("**/api/auth/login", async route => {
      this.incrementRequestCount("auth-login");

      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      const requestBody = route.request().postDataJSON();

      // Simulate authentication logic
      if (
        requestBody?.email === "test@example.com" &&
        requestBody?.password === "password123"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_AUTH_RESPONSES.login),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Invalid credentials",
          }),
        });
      }
    });

    // Register endpoint
    await page.route("**/api/auth/register", async route => {
      this.incrementRequestCount("auth-register");

      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AUTH_RESPONSES.register),
      });
    });

    // Profile endpoint
    await page.route("**/api/auth/profile", async route => {
      this.incrementRequestCount("auth-profile");

      if (this.config.simulateLatency) {
        await this.simulateDelay();
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AUTH_RESPONSES.profile),
      });
    });

    this.activeMocks.add("auth");
  }

  /**
   * Simulate network latency
   */
  private async simulateDelay(): Promise<void> {
    const [min, max] = this.config.latencyRange;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Track request counts for monitoring
   */
  private incrementRequestCount(endpoint: string): void {
    const current = this.requestCounts.get(endpoint) || 0;
    this.requestCounts.set(endpoint, current + 1);
  }

  /**
   * Get mock statistics
   */
  getStats(): {
    activeMocks: string[];
    requestCounts: Record<string, number>;
    config: MockConfig;
  } {
    return {
      activeMocks: Array.from(this.activeMocks),
      requestCounts: Object.fromEntries(this.requestCounts),
      config: this.config,
    };
  }

  /**
   * Clear all mocks and reset state
   */
  reset(): void {
    this.activeMocks.clear();
    this.requestCounts.clear();
    console.log("🔄 API mocks reset");
  }

  /**
   * Update mock configuration
   */
  updateConfig(newConfig: Partial<MockConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ Mock configuration updated:", newConfig);
  }
}

// Export singleton instance
export const apiMockManager = ApiMockManager.getInstance();

// Convenience function for quick setup
export async function setupApiMocks(
  page: Page,
  config?: Partial<MockConfig>
): Promise<void> {
  const mockManager = ApiMockManager.getInstance(config);
  await mockManager.setupMocks(page, config);
}
