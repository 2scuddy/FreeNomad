import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/user";

// Utility function to validate and normalize URLs with stricter validation
function validateAndNormalizeUrl(url: string | undefined): string | undefined {
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
    console.error("Invalid URL provided:", url, error);
    return undefined;
  }
}

// Get the base URL for NextAuth with proper validation
function getNextAuthUrl(): string | undefined {
  // In Vercel, NEXTAUTH_URL is automatically set, but we should validate it
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const nodeEnv = process.env.NODE_ENV;

  console.log("NextAuth URL detection:", {
    nextAuthUrl: nextAuthUrl
      ? `${nextAuthUrl.substring(0, 20)}...`
      : "undefined",
    vercelUrl: vercelUrl ? `${vercelUrl.substring(0, 20)}...` : "undefined",
    nodeEnv,
  });

  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost fallback
  if (nextAuthUrl) {
    const validated = validateAndNormalizeUrl(nextAuthUrl);
    if (validated) {
      console.log("Using NEXTAUTH_URL:", validated);
      return validated;
    }
    console.warn("NEXTAUTH_URL is invalid:", nextAuthUrl);
  }

  if (vercelUrl) {
    const validated = validateAndNormalizeUrl(vercelUrl);
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

// Get the validated URL for NextAuth
const authUrl = getNextAuthUrl();

// Enhanced NextAuth configuration with robust URL handling
const nextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  // Set the URL explicitly if we have a valid one
  ...(authUrl && { url: authUrl }),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User | AdapterUser }) {
      if (user) {
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }: { user: User }) {
      console.log("User signed in:", { userId: user.id, email: user.email });
    },
    async signOut() {
      console.log("User signed out");
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);
export const { GET, POST } = handlers;

// Helper function to get current user
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// Helper function to check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser();
  return (user as any)?.role === "ADMIN";
}

// Helper function to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

// Helper function to require admin access
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user as any).role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}
