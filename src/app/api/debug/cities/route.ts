import { NextResponse } from "next/server";
import { getCities } from "@/lib/data-access/cities";
import { checkDatabaseHealth } from "@/lib/prisma";

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL
          ? `${process.env.DATABASE_URL.substring(0, 30)}...`
          : "undefined",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      database: {
        health: "unknown",
        connection: "unknown",
        error: null as string | null,
      },
      cities: {
        count: 0,
        source: "unknown",
        error: null as string | null,
      },
    };

    // Test database health
    try {
      const isHealthy = await checkDatabaseHealth();
      debugInfo.database.health = isHealthy ? "healthy" : "unhealthy";
      debugInfo.database.connection = "successful";
    } catch (error) {
      debugInfo.database.health = "unhealthy";
      debugInfo.database.connection = "failed";
      debugInfo.database.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    // Test cities query
    try {
      const result = await getCities({ page: 1, limit: 100, sortOrder: "asc" });
      debugInfo.cities.count = result.data.length;
      debugInfo.cities.source =
        result.data.length === 3 ? "mock_data" : "database";

      // Check if we're getting the specific mock cities
      const cityNames = result.data.map((city: any) => city.name);
      if (
        cityNames.includes("Lisbon") &&
        cityNames.includes("Bali") &&
        cityNames.includes("Mexico City")
      ) {
        debugInfo.cities.source = "mock_data_confirmed";
      }
    } catch (error) {
      debugInfo.cities.error =
        error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
