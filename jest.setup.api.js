require("@testing-library/jest-dom");

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    searchParams: new URLSearchParams(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock next-auth/next
jest.mock("next-auth/next", () => ({
  NextAuth: jest.fn(),
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock("./src/lib/prisma", () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    city: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Environment variables for testing
process.env.NODE_ENV = "test";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
// Use development branch database for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_PYrVHIoJL20c@ep-lively-darkness-ad0i53ph-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

// Polyfill TextEncoder/TextDecoder for Node environment
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill Web APIs for Node environment (API tests)
try {
  const { Request, Response, Headers } = require("undici");
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.fetch = require("undici").fetch;
} catch (error) {
  // Fallback for environments where undici isn't available
  console.warn("Undici not available, using mock implementations");
}

// Mock URL and URLSearchParams for Node environment
if (typeof global.URL === "undefined") {
  global.URL = require("url").URL;
  global.URLSearchParams = require("url").URLSearchParams;
}

// Mock fetch globally for API tests
global.fetch = jest.fn();

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
