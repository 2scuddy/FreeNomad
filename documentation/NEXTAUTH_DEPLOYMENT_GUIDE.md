# NextAuth Deployment and URL Configuration Guide

## Overview

This guide provides comprehensive instructions for properly configuring NextAuth.js in production environments, specifically addressing URL validation issues and deployment best practices for Vercel.

## Problem Solved

This configuration resolves the critical production error:

```
TypeError: Invalid URL
at fx (.next/server/chunks/780.js:404:55084)
at b (.next/server/chunks/780.js:404:61139)
{ code: 'ERR_INVALID_URL', input: 'free-nomad-sigma.vercel.app' }
```

## Root Cause Analysis

The error occurred because NextAuth was receiving a URL without a protocol (`free-nomad-sigma.vercel.app`) and attempting to parse it as a valid URL. This commonly happens in Vercel deployments when:

1. **Hardcoded URL in `.env.example`**: The example file contained `free-nomad-sigma.vercel.app`
2. **Missing Protocol**: Vercel was passing URLs without `https://` protocol
3. **Inadequate URL Validation**: NextAuth couldn't handle protocol-less URLs
4. `NEXTAUTH_URL` environment variable is missing or malformed
5. `VERCEL_URL` is provided without the `https://` protocol
6. NextAuth's internal URL parsing doesn't handle protocol-less URLs gracefully

## Solution Implementation

### 1. Environment Variable Configuration

#### Production Environment (Vercel)

```env
# Vercel Production
NEXTAUTH_URL="https://freenomad.vercel.app"
NEXTAUTH_SECRET="your-production-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### Preview/Development Environment

```env
# Vercel Preview
NEXTAUTH_URL="https://your-preview-url.vercel.app"
NEXTAUTH_SECRET="your-preview-secret-here"

# Local Development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret-here"
```

### 2. Dynamic URL Resolution

Implement dynamic URL resolution in your NextAuth configuration:

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth";

// Dynamic URL resolution for different environments
function getBaseUrl() {
  // Production
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return "http://localhost:3000";
}

export const authOptions: NextAuthOptions = {
  // ... other configuration

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Ensure we use the correct base URL
      const resolvedBaseUrl = getBaseUrl();

      // If url is relative, prepend baseUrl
      if (url.startsWith("/")) {
        return `${resolvedBaseUrl}${url}`;
      }

      // If url is on the same origin, allow it
      if (new URL(url).origin === resolvedBaseUrl) {
        return url;
      }

      // Default to base URL
      return resolvedBaseUrl;
    },
  },
};
```

### 3. Vercel Configuration

#### vercel.json

```json
{
  "env": {
    "NEXTAUTH_URL": "https://freenomad.vercel.app",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "build": {
    "env": {
      "NEXTAUTH_URL": "https://freenomad.vercel.app"
    }
  }
}
```

#### Environment Variables in Vercel Dashboard

1. **Production Environment**:
   - `NEXTAUTH_URL`: `https://freenomad.vercel.app`
   - `NEXTAUTH_SECRET`: Your production secret

2. **Preview Environment**:
   - `NEXTAUTH_URL`: `https://$VERCEL_URL` (dynamic)
   - `NEXTAUTH_SECRET`: Your preview secret

3. **Development Environment**:
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `NEXTAUTH_SECRET`: Your development secret

### 4. URL Validation Middleware

Add URL validation to prevent invalid URL errors:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Validate and fix NEXTAUTH_URL for auth routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";

    // Ensure proper URL format
    if (host && !process.env.NEXTAUTH_URL?.startsWith("http")) {
      const baseUrl = `${protocol}://${host}`;
      // Set dynamic NEXTAUTH_URL if not properly configured
      process.env.NEXTAUTH_URL = baseUrl;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
```

### 5. Error Handling and Debugging

#### Debug Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.debug("NextAuth Debug:", code, metadata);
      }
    },
  },
  // ... rest of configuration
};
```

#### Error Boundary for Auth Routes

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

try {
  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };
} catch (error) {
  console.error("NextAuth configuration error:", error);

  // Fallback handler
  export function GET() {
    return new Response("Authentication service temporarily unavailable", {
      status: 503,
    });
  }

  export function POST() {
    return new Response("Authentication service temporarily unavailable", {
      status: 503,
    });
  }
}
```

## Testing and Validation

### 1. Local Testing

```bash
# Test local authentication
npm run dev
# Navigate to http://localhost:3000/api/auth/signin
```

### 2. Preview Testing

```bash
# Deploy to preview
vercel --target preview
# Test the preview URL authentication
```

### 3. Production Testing

```bash
# Deploy to production
vercel --prod
# Test production authentication flows
```

### 4. Validation Script

Create a validation script to test URL configuration:

```javascript
// scripts/validate-nextauth.js
const { URL } = require("url");

function validateNextAuthURL(url) {
  try {
    const parsed = new URL(url);
    console.log("✅ Valid URL:", parsed.href);
    return true;
  } catch (error) {
    console.error("❌ Invalid URL:", url, error.message);
    return false;
  }
}

// Test different URL formats
const testUrls = [
  process.env.NEXTAUTH_URL,
  "https://freenomad.vercel.app",
  "http://localhost:3000",
  "free-nomad-sigma.vercel.app", // This should fail
];

testUrls.forEach(url => {
  if (url) validateNextAuthURL(url);
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Invalid URL Error

**Problem**: `TypeError: Invalid URL`
**Solution**: Ensure NEXTAUTH_URL includes protocol (`https://` or `http://`)

#### 2. Redirect Mismatch

**Problem**: OAuth providers reject redirect URLs
**Solution**: Update OAuth app settings with correct callback URLs:

- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

#### 3. Session Issues

**Problem**: Sessions not persisting across requests
**Solution**: Check NEXTAUTH_SECRET configuration and cookie settings

#### 4. CSRF Token Mismatch

**Problem**: CSRF token validation failures
**Solution**: Ensure consistent URL configuration across all environments

### Debug Commands

```bash
# Check environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# Test authentication endpoint
curl https://yourdomain.com/api/auth/csrf

# Validate URL format
node -e "console.log(new URL(process.env.NEXTAUTH_URL))"
```

## Security Best Practices

### 1. Environment Variables

- Use different secrets for each environment
- Never commit secrets to version control
- Rotate secrets regularly
- Use Vercel's secret management for sensitive values

### 2. URL Configuration

- Always use HTTPS in production
- Validate redirect URLs
- Implement proper CORS policies
- Use environment-specific configurations

### 3. OAuth Configuration

- Restrict OAuth app domains
- Use environment-specific OAuth apps
- Implement proper scopes
- Validate OAuth responses

## Deployment Checklist

### Pre-deployment

- [ ] NEXTAUTH_URL configured with proper protocol
- [ ] NEXTAUTH_SECRET set for each environment
- [ ] OAuth providers configured with correct callback URLs
- [ ] Environment variables validated
- [ ] Local testing completed

### Post-deployment

- [ ] Authentication flows tested
- [ ] OAuth providers working
- [ ] Session persistence verified
- [ ] Error handling tested
- [ ] Performance monitoring enabled

## Monitoring and Maintenance

### 1. Error Monitoring

Implement error tracking for authentication issues:

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", user.email);
    },
    async signOut({ session, token }) {
      console.log("User signed out:", session?.user?.email);
    },
    async error({ error }) {
      console.error("NextAuth error:", error);
      // Send to error tracking service
    },
  },
};
```

### 2. Performance Monitoring

Monitor authentication performance:

```typescript
// Monitor auth response times
const authStart = Date.now();
// ... auth operation
const authDuration = Date.now() - authStart;
console.log("Auth operation took:", authDuration, "ms");
```

### 3. Health Checks

Implement health checks for authentication service:

```typescript
// app/api/health/auth/route.ts
export async function GET() {
  try {
    // Test NextAuth configuration
    const baseUrl = process.env.NEXTAUTH_URL;
    if (!baseUrl) {
      throw new Error("NEXTAUTH_URL not configured");
    }

    new URL(baseUrl); // Validate URL format

    return Response.json({
      status: "healthy",
      nextauth_url: baseUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

---

**Note**: This guide consolidates all NextAuth deployment and URL configuration information. Follow these practices to ensure reliable authentication in all environments.
