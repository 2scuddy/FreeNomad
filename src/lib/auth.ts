import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/user";

// Utility function to validate and normalize URLs with stricter validation
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

// Get the base URL for NextAuth with proper validation
function getNextAuthUrl(): string | undefined {
  // In Vercel, NEXTAUTH_URL is automatically set, but we should validate it
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const vercelUrl = process.env.VERCEL_URL;

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
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  console.warn(
    "No valid NEXTAUTH_URL found. This may cause authentication issues."
  );
  return undefined;
}

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
  // Add the validated URL if available
  ...(getNextAuthUrl() && { url: getNextAuthUrl() }),
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
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }: { user: any }) {
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
