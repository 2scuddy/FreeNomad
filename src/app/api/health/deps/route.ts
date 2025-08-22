import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    const depsHealth = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      dependencies: {
        nextAuth: {
          status: "unknown",
          responseTime: 0,
        },
        externalAPIs: {
          status: "unknown",
          responseTime: 0,
          services: {} as Record<string, any>,
        },
      },
      checks: {
        authentication: "unknown",
        externalServices: "unknown",
      },
    };

    // Check NextAuth configuration
    try {
      const authStart = Date.now();

      // Basic check - verify environment variables are set
      const hasAuthSecret = !!process.env.NEXTAUTH_SECRET;
      const hasAuthUrl = !!process.env.NEXTAUTH_URL;

      depsHealth.dependencies.nextAuth.responseTime = Date.now() - authStart;
      depsHealth.dependencies.nextAuth.status =
        hasAuthSecret && hasAuthUrl ? "healthy" : "unhealthy";
      depsHealth.checks.authentication =
        depsHealth.dependencies.nextAuth.status;

      if (!hasAuthSecret) {
        console.warn("NEXTAUTH_SECRET not configured");
      }
      if (!hasAuthUrl) {
        console.warn("NEXTAUTH_URL not configured");
      }
    } catch (error) {
      depsHealth.checks.authentication = "unhealthy";
      depsHealth.dependencies.nextAuth.status = "unhealthy";
      console.error("NextAuth health check failed:", error);
    }

    // Check external API services (if configured)
    try {
      const externalStart = Date.now();
      const services = {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        perplexity: !!process.env.PERPLEXITY_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY,
      };

      depsHealth.dependencies.externalAPIs.services = services;
      depsHealth.dependencies.externalAPIs.responseTime =
        Date.now() - externalStart;

      // Consider external services healthy if at least one is configured
      const hasAnyService = Object.values(services).some(Boolean);
      depsHealth.dependencies.externalAPIs.status = hasAnyService
        ? "healthy"
        : "warning";
      depsHealth.checks.externalServices =
        depsHealth.dependencies.externalAPIs.status;
    } catch (error) {
      depsHealth.checks.externalServices = "warning";
      depsHealth.dependencies.externalAPIs.status = "warning";
      console.error("External services health check failed:", error);
    }

    // Additional dependency checks can be added here
    // For example: Redis, S3, CDN, etc.

    // Determine overall status
    const hasUnhealthy = Object.values(depsHealth.checks).includes("unhealthy");
    const hasWarning = Object.values(depsHealth.checks).includes("warning");

    if (hasUnhealthy) {
      depsHealth.status = "unhealthy";
    } else if (hasWarning) {
      depsHealth.status = "warning";
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    const result = {
      ...depsHealth,
      responseTime: totalResponseTime,
    };

    const statusCode =
      result.status === "healthy"
        ? 200
        : result.status === "warning"
          ? 200
          : 503;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("Dependencies health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Dependencies health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        dependencies: {
          nextAuth: { status: "unknown" },
          externalAPIs: { status: "unknown" },
        },
      },
      { status: 503 }
    );
  }
}
