import { NextRequest, NextResponse } from "next/server";
import {
  prisma,
  checkDatabaseHealth,
  getConnectionPoolStats,
} from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Database health check
    const dbHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        responseTime: 0,
        version: "unknown",
        poolStats: null as Record<string, unknown> | null,
      },
      checks: {
        connectivity: "unknown",
        queryPerformance: "unknown",
        connectionPool: "unknown",
      },
    };

    // Test basic connectivity
    try {
      const connectivityStart = Date.now();
      const isConnected = await checkDatabaseHealth();
      const connectivityTime = Date.now() - connectivityStart;

      dbHealth.database.connected = isConnected;
      dbHealth.database.responseTime = connectivityTime;
      dbHealth.checks.connectivity = isConnected ? "healthy" : "unhealthy";

      if (connectivityTime > 1000) {
        dbHealth.checks.connectivity = "warning";
      }
    } catch (error) {
      dbHealth.checks.connectivity = "unhealthy";
      console.error("Database connectivity check failed:", error);
    }

    // Test query performance with a simple query
    try {
      const queryStart = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      const queryTime = Date.now() - queryStart;

      dbHealth.checks.queryPerformance =
        queryTime < 100 ? "healthy" : queryTime < 500 ? "warning" : "unhealthy";
    } catch (error) {
      dbHealth.checks.queryPerformance = "unhealthy";
      console.error("Database query performance check failed:", error);
    }

    // Check connection pool stats
    try {
      const poolStats = getConnectionPoolStats();
      dbHealth.database.poolStats = poolStats;

      // Simple pool health check (would need actual pool metrics)
      dbHealth.checks.connectionPool = "healthy";
    } catch (error) {
      dbHealth.checks.connectionPool = "warning";
      console.error("Connection pool check failed:", error);
    }

    // Get database version
    try {
      const versionResult =
        (await prisma.$queryRaw`SELECT version()`) as Array<{
          version?: string;
        }>;
      if (versionResult && versionResult[0]) {
        dbHealth.database.version = versionResult[0].version || "unknown";
      }
    } catch (error) {
      console.error("Database version check failed:", error);
    }

    // Calculate total response time
    dbHealth.database.responseTime = Date.now() - startTime;

    // Determine overall status
    const hasUnhealthy = Object.values(dbHealth.checks).includes("unhealthy");
    const hasWarning = Object.values(dbHealth.checks).includes("warning");

    if (hasUnhealthy) {
      dbHealth.status = "unhealthy";
    } else if (hasWarning) {
      dbHealth.status = "warning";
    }

    const statusCode =
      dbHealth.status === "healthy"
        ? 200
        : dbHealth.status === "warning"
          ? 200
          : 503;

    return NextResponse.json(dbHealth, { status: statusCode });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Database health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        database: {
          connected: false,
          responseTime: 0,
        },
      },
      { status: 503 }
    );
  }
}
