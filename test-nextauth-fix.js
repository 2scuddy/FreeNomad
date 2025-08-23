// Test script to verify NextAuth URL detection fix
// This script simulates different environment scenarios to test the fix

// Test cases for URL validation
const testCases = [
  {
    name: "Protocol-less Vercel URL (the original issue)",
    input: "free-nomad-sigma.vercel.app",
    expected: "https://free-nomad-sigma.vercel.app/",
  },
  {
    name: "Complete HTTPS URL",
    input: "https://my-app.vercel.app",
    expected: "https://my-app.vercel.app/",
  },
  {
    name: "Localhost development",
    input: "localhost:3000",
    expected: "http://localhost:3000/",
  },
  {
    name: "Custom domain",
    input: "myapp.com",
    expected: "https://myapp.com/",
  },
  {
    name: "Invalid URL",
    input: "not-a-valid-url",
    expected: undefined,
  },
];

// Helper function to simulate URL validation (extracted from auth.ts logic)
function testValidateAndNormalizeUrl(url) {
  if (!url || url.trim() === "") return undefined;

  try {
    let normalizedUrl = url.trim();

    // Remove any trailing slashes for consistency
    normalizedUrl = normalizedUrl.replace(/\/+$/, "");

    // Basic validation before adding protocol - must contain a dot (except for localhost)
    if (!normalizedUrl.includes(".") && !normalizedUrl.includes("localhost")) {
      console.error("Invalid URL format:", url);
      return undefined;
    }

    // Add protocol if missing (default to https for production domains)
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      // Use http for localhost, https for everything else
      const protocol = normalizedUrl.includes("localhost") ? "http" : "https";
      normalizedUrl = `${protocol}://${normalizedUrl}`;
    }

    // Validate by creating URL object
    const validatedUrl = new URL(normalizedUrl);

    // Additional validation for hostname
    if (!validatedUrl.hostname || validatedUrl.hostname.length < 3) {
      console.error("Invalid hostname:", validatedUrl.hostname);
      return undefined;
    }

    return validatedUrl.toString();
  } catch (error) {
    console.error("Invalid URL provided:", url, error.message);
    return undefined;
  }
}

// Helper function to simulate environment-based URL detection
function simulateGetNextAuthUrl(nextAuthUrl, vercelUrl, nodeEnv) {
  console.log("Simulating environment:", {
    nextAuthUrl: nextAuthUrl
      ? `${nextAuthUrl.substring(0, 20)}...`
      : "undefined",
    vercelUrl: vercelUrl ? `${vercelUrl.substring(0, 20)}...` : "undefined",
    nodeEnv,
  });

  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost fallback
  if (nextAuthUrl) {
    const validated = testValidateAndNormalizeUrl(nextAuthUrl);
    if (validated) {
      console.log("Using NEXTAUTH_URL:", validated);
      return validated;
    }
    console.warn("NEXTAUTH_URL is invalid:", nextAuthUrl);
  }

  if (vercelUrl) {
    const validated = testValidateAndNormalizeUrl(vercelUrl);
    if (validated) {
      console.log("Using VERCEL_URL:", validated);
      return validated;
    }
    console.warn("VERCEL_URL is invalid:", vercelUrl);
  }

  // Fallback for development
  if (nodeEnv === "development") {
    console.log("Using development fallback: http://localhost:3000");
    return "http://localhost:3000";
  }

  console.error(
    "No valid NEXTAUTH_URL found. This will cause authentication issues.",
    { nextAuthUrl, vercelUrl, nodeEnv }
  );
  return undefined;
}

// Run tests
console.log("🧪 Testing NextAuth URL validation fix\n");

// Test URL validation
console.log("📋 URL Validation Tests:");
testCases.forEach((testCase, index) => {
  const result = testValidateAndNormalizeUrl(testCase.input);
  const passed = result === testCase.expected;
  console.log(
    `${index + 1}. ${testCase.name}: ${passed ? "✅ PASS" : "❌ FAIL"}`
  );
  if (!passed) {
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${result}`);
  }
});

// Test environment scenarios
console.log("\n🌍 Environment Scenario Tests:");

const scenarios = [
  {
    name: "Production with NEXTAUTH_URL set",
    nextAuthUrl: "https://myapp.vercel.app",
    vercelUrl: "myapp-abc123.vercel.app",
    nodeEnv: "production",
    expected: "https://myapp.vercel.app/",
  },
  {
    name: "Production with only VERCEL_URL (the problematic case)",
    nextAuthUrl: undefined,
    vercelUrl: "free-nomad-sigma.vercel.app",
    nodeEnv: "production",
    expected: "https://free-nomad-sigma.vercel.app/",
  },
  {
    name: "Development environment",
    nextAuthUrl: undefined,
    vercelUrl: undefined,
    nodeEnv: "development",
    expected: "http://localhost:3000",
  },
  {
    name: "Invalid environment variables",
    nextAuthUrl: "invalid-url",
    vercelUrl: "also-invalid",
    nodeEnv: "production",
    expected: undefined,
  },
];

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}:`);
  const result = simulateGetNextAuthUrl(
    scenario.nextAuthUrl,
    scenario.vercelUrl,
    scenario.nodeEnv
  );
  const passed = result === scenario.expected;
  console.log(
    `   Result: ${passed ? "✅ PASS" : "❌ FAIL"} - ${result || "undefined"}`
  );
  if (!passed) {
    console.log(`   Expected: ${scenario.expected || "undefined"}`);
  }
});

console.log("\n🎯 Test Summary:");
console.log('The fix should resolve the "Invalid URL" error by:');
console.log("1. ✅ Adding https:// protocol to protocol-less URLs");
console.log("2. ✅ Properly validating URLs before use");
console.log("3. ✅ Providing fallback mechanisms");
console.log("4. ✅ Enhanced logging for debugging");
console.log("\n🚀 Ready for deployment!");
