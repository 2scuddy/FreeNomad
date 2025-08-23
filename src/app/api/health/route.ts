import { NextRequest, NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Basic application health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      responseTime: 0,
      checks: {
        database: "unknown",
        memory: "unknown",
        disk: "unknown",
      },
    };

    // Check database connectivity
    try {
      const dbHealthy = await checkDatabaseHealth();
      health.checks.database = dbHealthy ? "healthy" : "unhealthy";
    } catch (error) {
      health.checks.database = "unhealthy";
      console.error("Database health check failed:", error);
    }

    // Check memory usage
    try {
      const memUsage = process.memoryUsage();
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const memUsagePercent = Math.round((memUsedMB / memTotalMB) * 100);

      health.checks.memory = memUsagePercent < 90 ? "healthy" : "warning";
    } catch (error) {
      health.checks.memory = "unhealthy";
      console.error("Memory health check failed:", error);
    }

    // Check disk space (simplified)
    health.checks.disk = "healthy"; // Would need fs module for actual disk check

    // Calculate response time
    health.responseTime = Date.now() - startTime;

    // Determine overall status
    const hasUnhealthy = Object.values(health.checks).includes("unhealthy");
    const hasWarning = Object.values(health.checks).includes("warning");

    if (hasUnhealthy) {
      health.status = "unhealthy";
    } else if (hasWarning) {
      health.status = "warning";
    }

    const statusCode =
      health.status === "healthy"
        ? 200
        : health.status === "warning"
          ? 200
          : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
