import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Connection management
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Note: Graceful shutdown handlers removed for Edge Runtime compatibility
// In production, connection cleanup is handled by the deployment platform

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
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
