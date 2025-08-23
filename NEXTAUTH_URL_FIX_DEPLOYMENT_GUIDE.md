# NextAuth URL Fix - Deployment Guide

## Problem Solved

This fix resolves the critical production error:

```
TypeError: Invalid URL
at fx (.next/server/chunks/780.js:404:55084)
at b (.next/server/chunks/780.js:404:61139)
{ code: 'ERR_INVALID_URL', input: 'free-nomad-sigma.vercel.app' }
```

## Root Cause

The error occurred because:

1. **Hardcoded URL in `.env.example`**: The example file contained `free-nomad-sigma.vercel.app`
2. **Missing Protocol**: Vercel was passing URLs without `https://` protocol
3. **Inadequate URL Validation**: NextAuth couldn't handle protocol-less URLs
4. **Poor Error Handling**: No fallback mechanisms for invalid URLs

## Solution Overview

The fix implements a comprehensive URL validation and detection system:

### 1. Enhanced URL Validation

- Automatically adds `https://` protocol to protocol-less URLs
- Uses `http://` for localhost development
- Validates URL format before processing
- Provides detailed error logging

### 2. Smart Environment Detection

- **Priority Order**: `NEXTAUTH_URL` → `VERCEL_URL` → `localhost:3000`
- Validates each environment variable before use
- Fallback to development mode when appropriate

### 3. Production-Ready Configuration

- Environment variable validation during build
- Enhanced logging for debugging
- Proper caching headers for auth endpoints
- Optimized function timeouts

## Deployment Instructions

### For Vercel Deployment

#### Option 1: Automatic Detection (Recommended)

Let Vercel handle URL detection automatically:

```bash
# Only set these in Vercel environment variables:
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=your-database-url

# NEXTAUTH_URL will be auto-detected from VERCEL_URL
```

#### Option 2: Explicit Configuration

Set explicit URLs for production:

```bash
# Vercel environment variables:
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=your-database-url
```

### Environment Variable Setup

#### 1. Required Variables

```bash
# Generate a secure secret:
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Database connection:
DATABASE_URL="postgresql://user:pass@host:port/db"
```

#### 2. Optional Variables

```bash
# Only set if you need explicit URL control:
NEXTAUTH_URL="https://your-domain.com"

# API keys (if needed):
UNSPLASH_ACCESS_KEY="your-key"
```

### Vercel Dashboard Setup

1. **Go to Project Settings** → Environment Variables
2. **Add Required Variables**:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `DATABASE_URL`: Your PostgreSQL connection string
3. **Optional**: Add `NEXTAUTH_URL` only if you need explicit control
4. **Deploy**: The system will auto-detect URLs if not explicitly set

## Validation and Testing

### Pre-Deployment Validation

The build process now includes environment validation:

```bash
# This runs automatically during Vercel build:
node vercel-env-validation.js && next build
```

### Manual Testing

Test the fix locally:

```bash
# Test URL validation logic:
node test-nextauth-fix.js

# Test environment validation:
node vercel-env-validation.js
```

### Production Verification

After deployment, check Vercel function logs for:

```
✅ NextAuth URL detection: {
  nextAuthUrl: "undefined",
  vercelUrl: "your-app-xyz.vercel.app...",
  nodeEnv: "production"
}
✅ Using VERCEL_URL: https://your-app-xyz.vercel.app/
```

## Troubleshooting

### Common Issues

#### 1. Still Getting "Invalid URL" Errors

**Check**: Ensure no hardcoded URLs in environment variables

```bash
# ❌ Wrong:
NEXTAUTH_URL=free-nomad-sigma.vercel.app

# ✅ Correct:
NEXTAUTH_URL=https://your-actual-domain.vercel.app
# OR leave unset for auto-detection
```

#### 2. Authentication Redirects to Wrong URL

**Check**: Verify `NEXTAUTH_URL` matches your actual domain

```bash
# View current environment in Vercel logs:
console.log("NextAuth URL detection:", { ... })
```

#### 3. Development Environment Issues

**Solution**: Ensure proper local environment:

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-string-for-development
```

### Debug Steps

1. **Check Vercel Function Logs**:
   - Look for "NextAuth URL detection" messages
   - Verify which URL source is being used
   - Check for validation warnings

2. **Validate Environment Variables**:

   ```bash
   # In Vercel dashboard, verify:
   echo $NEXTAUTH_SECRET  # Should be 32+ characters
   echo $NEXTAUTH_URL     # Should include https:// or be unset
   ```

3. **Test URL Validation**:
   ```bash
   # Run local test:
   node test-nextauth-fix.js
   ```

## Security Considerations

### Environment Variables

- **Never commit** actual secrets to version control
- **Use strong secrets**: Generate with `openssl rand -base64 32`
- **Rotate secrets** regularly in production

### URL Validation

- The fix validates all URLs before use
- Logs suspicious URL patterns for monitoring
- Prevents injection attacks through URL manipulation

## Monitoring

### Success Indicators

- ✅ No "Invalid URL" errors in logs
- ✅ Successful authentication flows
- ✅ Proper URL detection messages
- ✅ Environment validation passes

### Alert Conditions

- ❌ "Invalid URL" errors persist
- ❌ Authentication failures increase
- ❌ Missing environment variables
- ❌ URL validation warnings

## Files Modified

1. **`src/lib/auth.ts`**: Enhanced URL validation and detection
2. **`.env.example`**: Removed hardcoded URLs
3. **`vercel.json`**: Added validation and optimized configuration
4. **`vercel-env-validation.js`**: Environment validation script
5. **`test-nextauth-fix.js`**: Comprehensive test suite

## Rollback Plan

If issues occur, you can quickly rollback:

1. **Revert auth.ts** to previous version
2. **Set explicit NEXTAUTH_URL** in Vercel environment variables
3. **Remove validation** from build command temporarily
4. **Redeploy** with previous configuration

## Next Steps

1. **Deploy the fix** to production
2. **Monitor logs** for successful URL detection
3. **Verify authentication** works across all deployment domains
4. **Set up alerts** for any URL-related errors
5. **Document** any domain-specific configurations

---

**✅ This fix ensures reliable NextAuth operation across all Vercel deployment environments while maintaining security and providing comprehensive debugging capabilities.**
