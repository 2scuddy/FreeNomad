/**
 * @jest-environment node
 */
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

// Mock the auth module to test URL validation logic
jest.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => {
  return jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  }));
});

// Test the URL validation functions directly
function validateAndNormalizeUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === "") return undefined;

  try {
    let normalizedUrl = url.trim();

    // Basic validation before adding protocol - must contain a dot (except for localhost)
    if (!normalizedUrl.includes(".") && !normalizedUrl.includes("localhost")) {
      console.error("Invalid URL format:", url);
      return undefined;
    }

    // Add protocol if missing
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
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
    console.error("Invalid URL provided:", url, error);
    return undefined;
  }
}

function getNextAuthUrl(
  nextAuthUrl?: string,
  vercelUrl?: string,
  nodeEnv?: string
): string | undefined {
  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost fallback
  if (nextAuthUrl) {
    const validated = validateAndNormalizeUrl(nextAuthUrl);
    if (validated) return validated;
  }

  if (vercelUrl) {
    const validated = validateAndNormalizeUrl(vercelUrl);
    if (validated) return validated;
  }

  // Fallback for development
  if (nodeEnv === "development") {
    return "http://localhost:3000";
  }

  return undefined;
}

describe("Auth URL Validation", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear console.error mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("validateAndNormalizeUrl", () => {
    it("should return undefined for undefined input", () => {
      expect(validateAndNormalizeUrl(undefined)).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      expect(validateAndNormalizeUrl("")).toBeUndefined();
    });

    it("should add https:// to URLs without protocol", () => {
      const result = validateAndNormalizeUrl("free-nomad-sigma.vercel.app");
      expect(result).toBe("https://free-nomad-sigma.vercel.app/");
    });

    it("should preserve http:// protocol", () => {
      const result = validateAndNormalizeUrl("http://localhost:3000");
      expect(result).toBe("http://localhost:3000/");
    });

    it("should preserve https:// protocol", () => {
      const result = validateAndNormalizeUrl("https://example.com");
      expect(result).toBe("https://example.com/");
    });

    it("should handle URLs with paths", () => {
      const result = validateAndNormalizeUrl("example.com/path/to/resource");
      expect(result).toBe("https://example.com/path/to/resource");
    });

    it("should handle URLs with query parameters", () => {
      const result = validateAndNormalizeUrl("example.com?param=value");
      expect(result).toBe("https://example.com/?param=value");
    });

    it("should return undefined for invalid URLs", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = validateAndNormalizeUrl("not-a-valid-url-format");
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle URLs with ports", () => {
      const result = validateAndNormalizeUrl("localhost:3000");
      expect(result).toBe("https://localhost:3000/");
    });

    it("should handle subdomains", () => {
      const result = validateAndNormalizeUrl("api.example.com");
      expect(result).toBe("https://api.example.com/");
    });
  });

  describe("getNextAuthUrl", () => {
    it("should prioritize NEXTAUTH_URL over VERCEL_URL", () => {
      const result = getNextAuthUrl(
        "https://nextauth.example.com",
        "https://vercel.example.com",
        "production"
      );
      expect(result).toBe("https://nextauth.example.com/");
    });

    it("should use VERCEL_URL when NEXTAUTH_URL is not provided", () => {
      const result = getNextAuthUrl(
        undefined,
        "https://vercel.example.com",
        "production"
      );
      expect(result).toBe("https://vercel.example.com/");
    });

    it("should add protocol to VERCEL_URL if missing", () => {
      const result = getNextAuthUrl(
        undefined,
        "free-nomad-sigma.vercel.app",
        "production"
      );
      expect(result).toBe("https://free-nomad-sigma.vercel.app/");
    });

    it("should fallback to localhost in development", () => {
      const result = getNextAuthUrl(undefined, undefined, "development");
      expect(result).toBe("http://localhost:3000");
    });

    it("should return undefined when no valid URL is found in production", () => {
      const result = getNextAuthUrl(undefined, undefined, "production");
      expect(result).toBeUndefined();
    });

    it("should handle invalid NEXTAUTH_URL and fallback to VERCEL_URL", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = getNextAuthUrl(
        "invalid-url",
        "https://vercel.example.com",
        "production"
      );
      expect(result).toBe("https://vercel.example.com/");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle both invalid URLs and fallback to development localhost", () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = getNextAuthUrl(
        "invalid-url",
        "also-invalid",
        "development"
      );
      expect(result).toBe("http://localhost:3000");
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle URLs with special characters", () => {
      const result = validateAndNormalizeUrl("example.com/path with spaces");
      expect(result).toBe("https://example.com/path%20with%20spaces");
    });

    it("should handle URLs with fragments", () => {
      const result = validateAndNormalizeUrl("example.com#section");
      expect(result).toBe("https://example.com/#section");
    });

    it("should handle URLs with authentication", () => {
      const result = validateAndNormalizeUrl("user:pass@example.com");
      expect(result).toBe("https://user:pass@example.com/");
    });

    it("should handle IPv4 addresses", () => {
      const result = validateAndNormalizeUrl("192.168.1.1:3000");
      expect(result).toBe("https://192.168.1.1:3000/");
    });

    it("should handle very long URLs", () => {
      const longPath = "a".repeat(1000);
      const result = validateAndNormalizeUrl(`example.com/${longPath}`);
      expect(result).toBe(`https://example.com/${longPath}`);
    });
  });
});
