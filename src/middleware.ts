import { NextRequest, NextResponse } from "next/server";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers configuration
const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // Content Security Policy
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https: wss:; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",
};

// HSTS header for production
const hstsHeader = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window
const API_RATE_LIMIT_MAX_REQUESTS = 60; // API requests per window

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return "unknown";
}

function checkRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / RATE_LIMIT_WINDOW)}`;

  const current = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW,
  };

  if (now > current.resetTime) {
    // Reset the counter
    current.count = 1;
    current.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    current.count++;
  }

  rateLimitStore.set(key, current);

  // Cleanup old entries
  for (const [storeKey, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(storeKey);
    }
  }

  return current.count <= maxRequests;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add HSTS in production
  if (process.env.NODE_ENV === "production") {
    Object.entries(hstsHeader).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

function createRateLimitResponse(): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "900", // 15 minutes
      },
    }
  );

  return addSecurityHeaders(response);
}

// Main middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // Apply rate limiting
  const isAPIRoute = pathname.startsWith("/api/");
  const maxRequests = isAPIRoute
    ? API_RATE_LIMIT_MAX_REQUESTS
    : RATE_LIMIT_MAX_REQUESTS;

  if (!checkRateLimit(ip, maxRequests)) {
    console.warn(`Rate limit exceeded for IP: ${ip} on ${pathname}`);
    return createRateLimitResponse();
  }

  // Create response
  const response = NextResponse.next();

  // Add security headers to all responses
  addSecurityHeaders(response);

  // Add rate limit headers
  const remaining = Math.max(
    0,
    maxRequests -
      (rateLimitStore.get(`${ip}:${Math.floor(Date.now() / RATE_LIMIT_WINDOW)}`)
        ?.count || 0)
  );
  response.headers.set("X-RateLimit-Limit", maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    (Date.now() + RATE_LIMIT_WINDOW).toString()
  );

  // Log security events
  if (isAPIRoute) {
    console.log(`API Request: ${request.method} ${pathname} from ${ip}`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|sw.js|manifest.json).*)",
  ],
};
