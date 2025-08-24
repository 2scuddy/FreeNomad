// Vercel environment validation script
// This script validates that required environment variables are properly set

function validateEnvironmentVariables() {
  const errors = [];
  const warnings = [];
  const isCI =
    process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
  // const isVercel = process.env.VERCEL === '1'; // Reserved for future use

  // Required environment variables
  const required = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  // Optional but recommended
  const optional = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  // CI/CD fallback values
  const ciFallbacks = {
    NEXTAUTH_SECRET: "ci-test-secret-32-characters-long",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    NEXTAUTH_URL: "http://localhost:3000",
  };

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      if (isCI && ciFallbacks[key]) {
        warnings.push(`Using CI fallback for missing ${key}`);
        process.env[key] = ciFallbacks[key];
      } else {
        errors.push(`Missing required environment variable: ${key}`);
      }
    } else if (key === "NEXTAUTH_SECRET" && value.length < 32) {
      if (isCI) {
        warnings.push(
          `${key} is shorter than recommended 32 characters (CI environment)`
        );
      } else {
        errors.push(
          `${key} should be at least 32 characters long for security`
        );
      }
    }
  });

  // Check optional variables
  Object.entries(optional).forEach(([key, value]) => {
    if (!value) {
      warnings.push(`Optional environment variable not set: ${key}`);
    } else if (key === "NEXTAUTH_URL" || key === "VERCEL_URL") {
      // Validate URL format
      try {
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          warnings.push(`${key} should include protocol (http:// or https://)`);
        } else {
          new URL(value); // This will throw if invalid
        }
      } catch {
        warnings.push(`${key} is not a valid URL: ${value}`);
      }
    }
  });

  // Log results
  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach(error => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment validation warnings:");
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ Environment validation passed");
  }

  // Return validation results
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
        ? `${process.env.VERCEL_URL.substring(0, 20)}...`
        : undefined,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL.substring(0, 20)}...`
        : undefined,
    },
  };
}

// Run validation if this script is executed directly
if (require.main === module) {
  const result = validateEnvironmentVariables();
  process.exit(result.valid ? 0 : 1);
}

module.exports = { validateEnvironmentVariables };
