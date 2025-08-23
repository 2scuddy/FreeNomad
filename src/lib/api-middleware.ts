import { NextRequest, NextResponse } from "next/server";
import { errorResponse, rateLimitResponse } from "./api-response";

// CORS configuration
const CORS_HEADERS = {
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL || "https://freenomad.com"
      : "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Add CORS headers to response
export function withCors(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Handle OPTIONS requests for CORS preflight
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// Request logging middleware
export function logRequest(request: NextRequest): void {
  const { method, url, headers } = request;
  const userAgent = headers.get("user-agent") || "Unknown";
  const ip =
    headers.get("x-forwarded-for") || headers.get("x-real-ip") || "Unknown";

  console.log(`[API] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === "test" ? 10000 : 100, // High limit for tests
};

export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetTime: number } {
  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === "test") {
    return { allowed: true, remaining: 9999, resetTime: Date.now() + 900000 };
  }

  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const key = `${ip}:${request.nextUrl.pathname}`;

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // Reset or initialize
    const resetTime = now + options.windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: options.maxRequests - 1, resetTime };
  }

  if (current.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  // Increment count
  current.count++;
  rateLimitMap.set(key, current);

  return {
    allowed: true,
    remaining: options.maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

// Validate request method
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(request.method);
}

// Extract and validate pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function extractPaginationParams(
  request: NextRequest,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    maxLimit,
    Math.max(
      1,
      parseInt(searchParams.get("limit") || defaultLimit.toString(), 10)
    )
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// Extract search and filter parameters
export interface SearchParams {
  search?: string;
  country?: string;
  featured?: boolean;
  verified?: boolean;
  minCost?: number;
  maxCost?: number;
  minInternet?: number;
  minSafety?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function extractSearchParams(request: NextRequest): SearchParams {
  const { searchParams } = request.nextUrl;

  return {
    search: searchParams.get("search") || undefined,
    country: searchParams.get("country") || undefined,
    featured: searchParams.get("featured") === "true" || undefined,
    verified: searchParams.get("verified") === "true" || undefined,
    minCost: searchParams.get("minCost")
      ? parseInt(searchParams.get("minCost")!, 10)
      : undefined,
    maxCost: searchParams.get("maxCost")
      ? parseInt(searchParams.get("maxCost")!, 10)
      : undefined,
    minInternet: searchParams.get("minInternet")
      ? parseFloat(searchParams.get("minInternet")!)
      : undefined,
    minSafety: searchParams.get("minSafety")
      ? parseFloat(searchParams.get("minSafety")!)
      : undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  };
}

// Comprehensive API middleware wrapper
export function withApiMiddleware<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    methods?: string[];
    rateLimit?: RateLimitOptions;
    requireAuth?: boolean;
  } = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;

    // Log request
    logRequest(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCorsOptions();
    }

    // Validate method
    if (options.methods && !validateMethod(request, options.methods)) {
      return withCors(
        errorResponse(
          `Method ${request.method} not allowed`,
          405,
          "METHOD_NOT_ALLOWED"
        )
      );
    }

    // Check rate limit
    if (options.rateLimit) {
      const rateLimit = checkRateLimit(request, options.rateLimit);
      if (!rateLimit.allowed) {
        const response = rateLimitResponse(
          "Rate limit exceeded. Please try again later."
        );
        response.headers.set(
          "X-RateLimit-Limit",
          options.rateLimit.maxRequests.toString()
        );
        response.headers.set(
          "X-RateLimit-Remaining",
          rateLimit.remaining.toString()
        );
        response.headers.set(
          "X-RateLimit-Reset",
          new Date(rateLimit.resetTime).toISOString()
        );
        return withCors(response);
      }

      // Add rate limit headers to successful responses
      const response = await handler(...args);
      response.headers.set(
        "X-RateLimit-Limit",
        options.rateLimit.maxRequests.toString()
      );
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(rateLimit.resetTime).toISOString()
      );
      return withCors(response);
    }

    // Execute handler and add CORS headers
    const response = await handler(...args);
    return withCors(response);
  };
}

// Clean up expired rate limit entries (call periodically)
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Initialize cleanup interval (call once in your app)
export function initializeRateLimitCleanup(): void {
  // Clean up every 5 minutes
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}
