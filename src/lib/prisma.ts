import { PrismaClient } from "../generated/prisma";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Configure Neon for serverless environments
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Neon serverless adapter for better Vercel compatibility
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create connection pool with optimized settings for serverless
  const pool = new Pool({
    connectionString,
    // Optimize for serverless: fewer connections, faster timeouts
    max: 1, // Single connection for serverless functions
    idleTimeoutMillis: 1000, // Close idle connections quickly
    connectionTimeoutMillis: 5000, // 5 second connection timeout
  });

  const adapter = new PrismaNeon(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Connection management
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Note: Graceful shutdown handlers removed for Edge Runtime compatibility
// In production, connection cleanup is handled by the deployment platform

// Database health check optimized for serverless
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Use a simple query with timeout for serverless environments
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as health`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Health check timeout")), 3000)
      ),
    ]);
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Connection pool monitoring
export function getConnectionPoolStats() {
  // This would require Prisma metrics API in production
  return {
    activeConnections: "N/A (requires Prisma metrics)",
    idleConnections: "N/A (requires Prisma metrics)",
    totalConnections: "N/A (requires Prisma metrics)",
  };
}

// Database performance utilities
export class DatabasePerformanceMonitor {
  private static queryTimes: number[] = [];
  private static readonly MAX_SAMPLES = 100;

  static recordQueryTime(startTime: number): void {
    const duration = Date.now() - startTime;
    this.queryTimes.push(duration);

    // Keep only recent samples
    if (this.queryTimes.length > this.MAX_SAMPLES) {
      this.queryTimes.shift();
    }

    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected: ${duration}ms`);
    }
  }

  static getAverageQueryTime(): number {
    if (this.queryTimes.length === 0) return 0;
    return (
      this.queryTimes.reduce((sum, time) => sum + time, 0) /
      this.queryTimes.length
    );
  }

  static getSlowQueryCount(threshold = 1000): number {
    return this.queryTimes.filter(time => time > threshold).length;
  }

  static getStats() {
    return {
      averageQueryTime: this.getAverageQueryTime(),
      slowQueryCount: this.getSlowQueryCount(),
      totalQueries: this.queryTimes.length,
      recentQueries: this.queryTimes.slice(-10),
    };
  }
}

// Enhanced query wrapper with performance monitoring
export async function performanceQuery<T>(
  queryFn: () => Promise<T>,
  queryName?: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await queryFn();
    DatabasePerformanceMonitor.recordQueryTime(startTime);

    if (queryName && process.env.NODE_ENV === "development") {
      console.log(
        `Query ${queryName} completed in ${Date.now() - startTime}ms`
      );
    }

    return result;
  } catch (error) {
    DatabasePerformanceMonitor.recordQueryTime(startTime);
    console.error(
      `Query ${queryName || "unknown"} failed after ${Date.now() - startTime}ms:`,
      error
    );
    throw error;
  }
}

export default prisma;
export type PrismaClientType = typeof prisma;
