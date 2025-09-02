/**
 * Rate Limit Manager for Test Execution
 * Prevents API rate limit violations while maintaining test coverage
 */

import { Page } from "@playwright/test";

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  delayBetweenRequests: number;
  burstLimit: number;
  cooldownPeriod: number;
  retryAttempts: number;
  backoffMultiplier: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RequestLog {
  timestamp: number;
  endpoint: string;
  method: string;
  success: boolean;
}

export class RateLimitManager {
  private static instance: RateLimitManager;
  private requestLog: RequestLog[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private lastRequestTime: number = 0;

  private readonly config: RateLimitConfig = {
    maxRequestsPerMinute: 30, // Conservative limit
    delayBetweenRequests: 2000, // 2 seconds between requests
    burstLimit: 5, // Max 5 requests in quick succession
    cooldownPeriod: 10000, // 10 seconds cooldown after burst
    retryAttempts: 3,
    backoffMultiplier: 1.5,
  };

  private constructor() {
    // Clean up old request logs every minute
    setInterval(() => this.cleanupRequestLog(), 60000);
    // Clean up expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 300000);
  }

  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }

  /**
   * Execute an API request with rate limiting
   */
  async executeRequest<T>(
    requestKey: string,
    requestFn: () => Promise<T>,
    options: {
      cacheTtl?: number;
      skipCache?: boolean;
      priority?: "high" | "medium" | "low";
      endpoint?: string;
      method?: string;
    } = {}
  ): Promise<T> {
    const {
      cacheTtl = 300000, // 5 minutes default
      skipCache = false,
      priority = "medium",
      endpoint = "unknown",
      method = "GET",
    } = options;

    // Check cache first (unless skipped)
    if (!skipCache) {
      const cached = this.getFromCache(requestKey);
      if (cached) {
        console.log(`📦 Cache hit for ${requestKey}`);
        return cached;
      }
    }

    // Check for pending identical requests (deduplication)
    if (this.pendingRequests.has(requestKey)) {
      console.log(`⏳ Waiting for pending request: ${requestKey}`);
      return await this.pendingRequests.get(requestKey)!;
    }

    // Apply rate limiting
    await this.applyRateLimit(priority);

    // Execute request with retry logic
    const requestPromise = this.executeWithRetry(
      requestFn,
      endpoint,
      method,
      requestKey
    );

    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful results
      if (!skipCache) {
        this.setCache(requestKey, result, cacheTtl);
      }

      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Apply rate limiting based on current request patterns
   */
  private async applyRateLimit(
    priority: "high" | "medium" | "low"
  ): Promise<void> {
    const now = Date.now();
    const recentRequests = this.getRecentRequests(60000); // Last minute
    const veryRecentRequests = this.getRecentRequests(10000); // Last 10 seconds

    // Check if we're hitting rate limits
    if (recentRequests.length >= this.config.maxRequestsPerMinute) {
      const oldestRequest = recentRequests[0];
      const waitTime = 60000 - (now - oldestRequest.timestamp);
      console.log(`⏱️ Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
    }

    // Check burst limit
    if (veryRecentRequests.length >= this.config.burstLimit) {
      console.log(
        `🚦 Burst limit reached, cooling down for ${this.config.cooldownPeriod}ms`
      );
      await this.delay(this.config.cooldownPeriod);
    }

    // Apply minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = this.getMinDelayForPriority(priority);

    if (timeSinceLastRequest < minDelay) {
      const waitTime = minDelay - timeSinceLastRequest;
      console.log(
        `⏳ Applying ${waitTime}ms delay for ${priority} priority request`
      );
      await this.delay(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Execute request with retry logic and exponential backoff
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    endpoint: string,
    method: string,
    requestKey: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(
          `🔄 Executing request ${requestKey} (attempt ${attempt}/${this.config.retryAttempts})`
        );

        const result = await requestFn();

        // Log successful request
        this.logRequest(endpoint, method, true);

        return result;
      } catch (error) {
        lastError = error as Error;

        // Log failed request
        this.logRequest(endpoint, method, false);

        // Check if it's a rate limit error
        if (this.isRateLimitError(error)) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          console.log(
            `🚫 Rate limit detected, backing off for ${backoffDelay}ms`
          );
          await this.delay(backoffDelay);
          continue;
        }

        // For non-rate-limit errors, apply standard backoff
        if (attempt < this.config.retryAttempts) {
          const backoffDelay = this.calculateBackoffDelay(attempt);
          console.log(`⚠️ Request failed, retrying in ${backoffDelay}ms`);
          await this.delay(backoffDelay);
        }
      }
    }

    throw (
      lastError ||
      new Error(`Request failed after ${this.config.retryAttempts} attempts`)
    );
  }

  /**
   * Check if error is related to rate limiting
   */
  private isRateLimitError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || "";
    const errorStatus = error.status || error.response?.status;

    return (
      errorStatus === 429 ||
      errorStatus === 503 ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("throttled")
    );
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = this.config.delayBetweenRequests;
    return Math.min(
      baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1),
      30000 // Max 30 seconds
    );
  }

  /**
   * Get minimum delay based on priority
   */
  private getMinDelayForPriority(priority: "high" | "medium" | "low"): number {
    switch (priority) {
      case "high":
        return this.config.delayBetweenRequests * 0.5; // 1 second
      case "medium":
        return this.config.delayBetweenRequests; // 2 seconds
      case "low":
        return this.config.delayBetweenRequests * 1.5; // 3 seconds
      default:
        return this.config.delayBetweenRequests;
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Request logging and monitoring
   */
  private logRequest(endpoint: string, method: string, success: boolean): void {
    this.requestLog.push({
      timestamp: Date.now(),
      endpoint,
      method,
      success,
    });
  }

  private getRecentRequests(timeWindow: number): RequestLog[] {
    const cutoff = Date.now() - timeWindow;
    return this.requestLog.filter(log => log.timestamp > cutoff);
  }

  private cleanupRequestLog(): void {
    const cutoff = Date.now() - 300000; // Keep last 5 minutes
    this.requestLog = this.requestLog.filter(log => log.timestamp > cutoff);
  }

  /**
   * Utility methods
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limiting statistics
   */
  getStats(): {
    recentRequests: number;
    cacheSize: number;
    successRate: number;
    pendingRequests: number;
  } {
    const recentRequests = this.getRecentRequests(60000);
    const successfulRequests = recentRequests.filter(r => r.success).length;

    return {
      recentRequests: recentRequests.length,
      cacheSize: this.cache.size,
      successRate:
        recentRequests.length > 0
          ? successfulRequests / recentRequests.length
          : 1,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clear all caches and reset state (useful for test isolation)
   */
  reset(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.requestLog = [];
    this.lastRequestTime = 0;
    console.log("🔄 Rate limit manager reset");
  }
}

/**
 * Playwright-specific rate limiting utilities
 */
export class PlaywrightRateLimitUtils {
  private static rateLimitManager = RateLimitManager.getInstance();

  /**
   * Execute a page navigation with rate limiting
   */
  static async navigateWithRateLimit(
    page: Page,
    url: string,
    options: {
      priority?: "high" | "medium" | "low";
      waitUntil?: "load" | "domcontentloaded" | "networkidle";
      timeout?: number;
    } = {}
  ): Promise<void> {
    const {
      priority = "medium",
      waitUntil = "networkidle",
      timeout = 30000,
    } = options;

    await this.rateLimitManager.executeRequest(
      `navigate:${url}`,
      async () => {
        await page.goto(url, { waitUntil, timeout });
        return true;
      },
      {
        priority,
        endpoint: url,
        method: "GET",
        skipCache: true, // Navigation shouldn't be cached
      }
    );
  }

  /**
   * Execute an API call through the page with rate limiting
   */
  static async apiCallWithRateLimit<T>(
    page: Page,
    url: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      priority?: "high" | "medium" | "low";
      cacheTtl?: number;
    } = {}
  ): Promise<T> {
    const {
      method = "GET",
      body,
      headers = {},
      priority = "medium",
      cacheTtl = 300000,
    } = options;

    const requestKey = `api:${method}:${url}:${JSON.stringify(body || {})}`;

    return await this.rateLimitManager.executeRequest(
      requestKey,
      async () => {
        const response = await page.evaluate(
          async ({ url, method, body, headers }) => {
            const response = await fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
                ...headers,
              },
              body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            return await response.json();
          },
          { url, method, body, headers }
        );

        return response;
      },
      {
        priority,
        endpoint: url,
        method,
        cacheTtl: method === "GET" ? cacheTtl : 0, // Only cache GET requests
      }
    );
  }

  /**
   * Wait with rate limiting considerations
   */
  static async smartWait(
    page: Page,
    condition: () => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      description?: string;
    } = {}
  ): Promise<void> {
    const {
      timeout = 30000,
      interval = 1000,
      description = "condition",
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (error) {
        console.log(`⚠️ Error checking ${description}:`, error);
      }

      // Apply rate limiting to polling
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  }

  /**
   * Get rate limiting statistics
   */
  static getStats() {
    return this.rateLimitManager.getStats();
  }

  /**
   * Reset rate limiting state (for test isolation)
   */
  static reset(): void {
    this.rateLimitManager.reset();
  }
}

// Export singleton instance
export const rateLimitManager = RateLimitManager.getInstance();
