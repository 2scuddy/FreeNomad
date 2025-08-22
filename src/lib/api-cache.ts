import { NextRequest, NextResponse } from "next/server";

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // SWR time in seconds
  tags?: string[]; // Cache tags for invalidation
  vary?: string[]; // Headers to vary cache on
}

// Default cache configurations for different endpoints
export const cacheConfigs: Record<string, CacheConfig> = {
  "/api/cities": {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
    tags: ["cities"],
    vary: ["Accept-Encoding"],
  },
  "/api/cities/featured": {
    ttl: 600, // 10 minutes
    staleWhileRevalidate: 1200, // 20 minutes
    tags: ["cities", "featured"],
    vary: ["Accept-Encoding"],
  },
  "/api/cities/[id]": {
    ttl: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
    tags: ["cities", "city-detail"],
    vary: ["Accept-Encoding"],
  },
  "/api/user/profile": {
    ttl: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
    tags: ["user", "profile"],
    vary: ["Authorization"],
  },
};

// In-memory cache (for development - use Redis in production)
class MemoryCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private maxSize = 1000;

  set(key: string, data: any, ttl: number): void {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    });
  }

  get(key: string): { data: any; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl;
    const isStale = age > entry.ttl / 2; // Consider stale after half TTL

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      isStale,
    };
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Delete entries by tag
  invalidateByTag(tag: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

// Generate cache key from request
function generateCacheKey(request: NextRequest, config: CacheConfig): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // Sort search params for consistent keys
  const sortedParams = Array.from(searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  let cacheKey = `${pathname}${sortedParams ? `?${sortedParams}` : ""}`;

  // Add vary headers to cache key
  if (config.vary) {
    const varyValues = config.vary
      .map(header => {
        const headerValue = request.headers.get(header);
        return `${header}:${headerValue || ""}`;
      })
      .join("|");
    cacheKey += `|${varyValues}`;
  }

  return cacheKey;
}

// Set cache headers on response
function setCacheHeaders(
  response: NextResponse,
  config: CacheConfig,
  isStale = false
): NextResponse {
  const headers = new Headers(response.headers);

  // Set Cache-Control header
  const cacheControl = [
    `max-age=${config.ttl}`,
    config.staleWhileRevalidate
      ? `stale-while-revalidate=${config.staleWhileRevalidate}`
      : "",
    "public",
  ]
    .filter(Boolean)
    .join(", ");

  headers.set("Cache-Control", cacheControl);

  // Set ETag for validation
  const etag = `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
  headers.set("ETag", etag);

  // Set Vary header
  if (config.vary) {
    headers.set("Vary", config.vary.join(", "));
  }

  // Add custom headers for debugging
  headers.set("X-Cache", isStale ? "STALE" : "HIT");
  headers.set("X-Cache-Tags", config.tags?.join(",") || "");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Cache middleware wrapper
export function withCache(config?: CacheConfig) {
  return function cacheMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async function cachedHandler(
      request: NextRequest
    ): Promise<NextResponse> {
      // Skip caching for non-GET requests
      if (request.method !== "GET") {
        return handler(request);
      }

      // Get cache config
      const url = new URL(request.url);
      const pathname = url.pathname;
      const cacheConfig = config ||
        cacheConfigs[pathname] || {
          ttl: 300,
          staleWhileRevalidate: 600,
          tags: ["default"],
        };

      // Generate cache key
      const cacheKey = generateCacheKey(request, cacheConfig);

      // Check cache
      const cached = cache.get(cacheKey);

      if (cached) {
        console.log(
          `Cache ${cached.isStale ? "STALE" : "HIT"} for ${pathname}`
        );

        // If stale, trigger background revalidation
        if (cached.isStale) {
          // Background revalidation (fire and forget)
          handler(request)
            .then(response => response.json())
            .then(data => {
              cache.set(cacheKey, data, cacheConfig.ttl);
            })
            .catch(error => {
              console.error("Background revalidation failed:", error);
            });
        }

        // Return cached response
        const response = NextResponse.json(cached.data);
        return setCacheHeaders(response, cacheConfig, cached.isStale);
      }

      console.log(`Cache MISS for ${pathname}`);

      // Execute handler
      try {
        const response = await handler(request);

        // Only cache successful responses
        if (response.ok) {
          const data = await response.clone().json();
          cache.set(cacheKey, data, cacheConfig.ttl);

          // Set cache headers
          const cachedResponse = NextResponse.json(data);
          return setCacheHeaders(cachedResponse, cacheConfig);
        }

        return response;
      } catch (error) {
        console.error("Handler execution failed:", error);
        throw error;
      }
    };
  };
}

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate specific cache entry
  invalidate(key: string): void {
    cache.delete(key);
  },

  // Invalidate by tag
  invalidateByTag(tag: string): void {
    cache.invalidateByTag(tag);
  },

  // Clear all cache
  clear(): void {
    cache.clear();
  },

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: cache["cache"].size,
      keys: Array.from(cache["cache"].keys()),
    };
  },
};

// Preload cache for critical endpoints
export async function preloadCache(endpoints: string[]): Promise<void> {
  const promises = endpoints.map(async endpoint => {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        const config = cacheConfigs[endpoint] || {
          ttl: 300,
          tags: ["preload"],
        };
        cache.set(endpoint, data, config.ttl);
        console.log(`Preloaded cache for ${endpoint}`);
      }
    } catch (error) {
      console.error(`Failed to preload cache for ${endpoint}:`, error);
    }
  });

  await Promise.allSettled(promises);
}
