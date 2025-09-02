/**
 * Rate Limiting Configuration for Test Execution
 * Centralized configuration for preventing API rate limit violations
 */

export interface TestEnvironmentConfig {
  name: string;
  rateLimits: {
    maxRequestsPerMinute: number;
    delayBetweenRequests: number;
    burstLimit: number;
    cooldownPeriod: number;
  };
  mocking: {
    enabled: boolean;
    simulateLatency: boolean;
    latencyRange: [number, number];
    simulateErrors: boolean;
    errorRate: number;
  };
  caching: {
    enabled: boolean;
    defaultTtl: number;
    maxCacheSize: number;
  };
  parallelism: {
    maxWorkers: number;
    testTimeout: number;
    retryAttempts: number;
  };
}

export const TEST_ENVIRONMENTS: Record<string, TestEnvironmentConfig> = {
  // Development environment - most permissive
  development: {
    name: 'development',
    rateLimits: {
      maxRequestsPerMinute: 60,
      delayBetweenRequests: 1000, // 1 second
      burstLimit: 10,
      cooldownPeriod: 5000 // 5 seconds
    },
    mocking: {
      enabled: true,
      simulateLatency: true,
      latencyRange: [50, 200],
      simulateErrors: false,
      errorRate: 0
    },
    caching: {
      enabled: true,
      defaultTtl: 300000, // 5 minutes
      maxCacheSize: 1000
    },
    parallelism: {
      maxWorkers: 4,
      testTimeout: 30000,
      retryAttempts: 2
    }
  },

  // CI environment - more conservative
  ci: {
    name: 'ci',
    rateLimits: {
      maxRequestsPerMinute: 30,
      delayBetweenRequests: 2000, // 2 seconds
      burstLimit: 5,
      cooldownPeriod: 10000 // 10 seconds
    },
    mocking: {
      enabled: true,
      simulateLatency: true,
      latencyRange: [100, 300],
      simulateErrors: true,
      errorRate: 0.02 // 2% error rate
    },
    caching: {
      enabled: true,
      defaultTtl: 600000, // 10 minutes
      maxCacheSize: 500
    },
    parallelism: {
      maxWorkers: 1, // Single worker to prevent rate limits
      testTimeout: 45000,
      retryAttempts: 3
    }
  },

  // Production testing - most conservative
  production: {
    name: 'production',
    rateLimits: {
      maxRequestsPerMinute: 15,
      delayBetweenRequests: 4000, // 4 seconds
      burstLimit: 3,
      cooldownPeriod: 15000 // 15 seconds
    },
    mocking: {
      enabled: false, // Use real APIs in production testing
      simulateLatency: false,
      latencyRange: [0, 0],
      simulateErrors: false,
      errorRate: 0
    },
    caching: {
      enabled: true,
      defaultTtl: 1800000, // 30 minutes
      maxCacheSize: 200
    },
    parallelism: {
      maxWorkers: 1,
      testTimeout: 60000,
      retryAttempts: 5
    }
  },

  // Load testing - special configuration
  load: {
    name: 'load',
    rateLimits: {
      maxRequestsPerMinute: 120,
      delayBetweenRequests: 500, // 0.5 seconds
      burstLimit: 20,
      cooldownPeriod: 2000 // 2 seconds
    },
    mocking: {
      enabled: true,
      simulateLatency: true,
      latencyRange: [10, 100],
      simulateErrors: true,
      errorRate: 0.05 // 5% error rate
    },
    caching: {
      enabled: true,
      defaultTtl: 60000, // 1 minute
      maxCacheSize: 2000
    },
    parallelism: {
      maxWorkers: 8,
      testTimeout: 20000,
      retryAttempts: 1
    }
  }
};

/**
 * Get configuration for current environment
 */
export function getCurrentEnvironmentConfig(): TestEnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  const isCI = process.env.CI === 'true';
  const isLoadTest = process.env.TEST_TYPE === 'load';
  const isProduction = process.env.TEST_ENVIRONMENT === 'production';

  if (isLoadTest) {
    return TEST_ENVIRONMENTS.load;
  }
  
  if (isProduction) {
    return TEST_ENVIRONMENTS.production;
  }
  
  if (isCI) {
    return TEST_ENVIRONMENTS.ci;
  }
  
  return TEST_ENVIRONMENTS.development;
}

/**
 * API endpoint specific configurations
 */
export const API_ENDPOINT_CONFIGS = {
  // External APIs - most restrictive
  'api.unsplash.com': {
    maxRequestsPerHour: 50,
    priority: 'low',
    cacheTtl: 3600000, // 1 hour
    mockingRequired: true
  },
  
  // Internal APIs - moderate restrictions
  '/api/cities': {
    maxRequestsPerHour: 200,
    priority: 'medium',
    cacheTtl: 300000, // 5 minutes
    mockingRequired: false
  },
  
  '/api/health': {
    maxRequestsPerHour: 100,
    priority: 'high',
    cacheTtl: 60000, // 1 minute
    mockingRequired: false
  },
  
  '/api/auth': {
    maxRequestsPerHour: 50,
    priority: 'high',
    cacheTtl: 0, // No caching for auth
    mockingRequired: true // Always mock auth in tests
  }
};

/**
 * Test suite specific configurations
 */
export const TEST_SUITE_CONFIGS = {
  'visual-testing': {
    rateLimitMultiplier: 0.5, // Slower for visual tests
    mockingEnabled: true,
    cachingEnabled: true,
    parallelism: 1
  },
  
  'api-testing': {
    rateLimitMultiplier: 0.3, // Very slow for API tests
    mockingEnabled: true,
    cachingEnabled: true,
    parallelism: 1
  },
  
  'e2e-testing': {
    rateLimitMultiplier: 0.7,
    mockingEnabled: true,
    cachingEnabled: true,
    parallelism: 2
  },
  
  'unit-testing': {
    rateLimitMultiplier: 1.0, // Normal speed for unit tests
    mockingEnabled: true,
    cachingEnabled: false, // No caching needed
    parallelism: 4
  }
};

/**
 * Get configuration for specific test suite
 */
export function getTestSuiteConfig(suiteName: string) {
  const baseConfig = getCurrentEnvironmentConfig();
  const suiteConfig = (TEST_SUITE_CONFIGS as any)[suiteName] || TEST_SUITE_CONFIGS['e2e-testing'];
  
  return {
    ...baseConfig,
    rateLimits: {
      ...baseConfig.rateLimits,
      delayBetweenRequests: Math.floor(
        baseConfig.rateLimits.delayBetweenRequests / suiteConfig.rateLimitMultiplier
      )
    },
    mocking: {
      ...baseConfig.mocking,
      enabled: baseConfig.mocking.enabled && suiteConfig.mockingEnabled
    },
    caching: {
      ...baseConfig.caching,
      enabled: baseConfig.caching.enabled && suiteConfig.cachingEnabled
    },
    parallelism: {
      ...baseConfig.parallelism,
      maxWorkers: Math.min(baseConfig.parallelism.maxWorkers, suiteConfig.parallelism)
    }
  };
}

/**
 * Validate environment configuration
 */
export function validateConfig(config: TestEnvironmentConfig): string[] {
  const errors: string[] = [];
  
  if (config.rateLimits.maxRequestsPerMinute <= 0) {
    errors.push('maxRequestsPerMinute must be positive');
  }
  
  if (config.rateLimits.delayBetweenRequests < 0) {
    errors.push('delayBetweenRequests must be non-negative');
  }
  
  if (config.mocking.errorRate < 0 || config.mocking.errorRate > 1) {
    errors.push('errorRate must be between 0 and 1');
  }
  
  if (config.caching.defaultTtl <= 0) {
    errors.push('defaultTtl must be positive');
  }
  
  if (config.parallelism.maxWorkers <= 0) {
    errors.push('maxWorkers must be positive');
  }
  
  return errors;
}

/**
 * Log current configuration
 */
export function logCurrentConfig(): void {
  const config = getCurrentEnvironmentConfig();
  const errors = validateConfig(config);
  
  console.log('🔧 Current Test Configuration:');
  console.log(`   Environment: ${config.name}`);
  console.log(`   Rate Limits: ${config.rateLimits.maxRequestsPerMinute} req/min, ${config.rateLimits.delayBetweenRequests}ms delay`);
  console.log(`   Mocking: ${config.mocking.enabled ? 'enabled' : 'disabled'}`);
  console.log(`   Caching: ${config.caching.enabled ? 'enabled' : 'disabled'}`);
  console.log(`   Workers: ${config.parallelism.maxWorkers}`);
  
  if (errors.length > 0) {
    console.warn('⚠️ Configuration errors:', errors);
  } else {
    console.log('✅ Configuration is valid');
  }
}