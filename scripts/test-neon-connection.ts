#!/usr/bin/env tsx

/**
 * Neon Database Connection Test Script
 *
 * This script tests the connection to the Neon PostgreSQL database
 * and provides detailed information about the connection status.
 *
 * Usage:
 *   npx tsx scripts/test-neon-connection.ts
 *   npm run test:db:neon
 */

import { PrismaClient } from "../src/generated/prisma";
import { checkDatabaseHealth } from "../src/lib/prisma";

const prisma = new PrismaClient({
  log: ["info", "warn", "error"],
});

interface DatabaseInfo {
  version: string;
  currentDatabase: string;
  currentUser: string;
  serverVersion: string;
  connectionCount: number;
}

async function testNeonConnection(): Promise<void> {
  console.log("🔍 Testing Neon Database Connection...");
  console.log("=".repeat(50));

  try {
    // Test basic connection
    console.log("📡 Attempting to connect to database...");
    await prisma.$connect();
    console.log("✅ Successfully connected to Neon database!");

    // Test health check
    console.log("\n🏥 Running health check...");
    const isHealthy = await checkDatabaseHealth();
    console.log(
      `${isHealthy ? "✅" : "❌"} Database health check: ${isHealthy ? "PASSED" : "FAILED"}`
    );

    // Get database information
    console.log("\n📊 Gathering database information...");
    const dbInfo = await getDatabaseInfo();

    console.log("\n📋 Database Information:");
    console.log(`   Database Version: ${dbInfo.version}`);
    console.log(`   Current Database: ${dbInfo.currentDatabase}`);
    console.log(`   Current User: ${dbInfo.currentUser}`);
    console.log(`   Server Version: ${dbInfo.serverVersion}`);
    console.log(`   Active Connections: ${dbInfo.connectionCount}`);

    // Test query performance
    console.log("\n⚡ Testing query performance...");
    await testQueryPerformance();

    // Test schema access
    console.log("\n🗂️  Testing schema access...");
    await testSchemaAccess();

    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ Neon database is properly configured and accessible.");
  } catch (error) {
    console.error("\n❌ Database connection test failed:");
    console.error("Error details:", error);

    // Provide troubleshooting suggestions
    console.log("\n🔧 Troubleshooting suggestions:");
    console.log("1. Check your DATABASE_URL in .env.local");
    console.log("2. Verify your Neon project is active");
    console.log("3. Ensure your connection string includes ?sslmode=require");
    console.log("4. Check your internet connection");
    console.log("5. Verify your Neon credentials are correct");

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Disconnected from database.");
  }
}

async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const [versionResult, dbResult, userResult, serverResult, connectionResult] =
    await Promise.all([
      prisma.$queryRaw<[{ version: string }]>`SELECT version() as version`,
      prisma.$queryRaw<
        [{ current_database: string }]
      >`SELECT current_database()`,
      prisma.$queryRaw<[{ current_user: string }]>`SELECT current_user`,
      prisma.$queryRaw<[{ server_version: string }]>`SHOW server_version`,
      prisma.$queryRaw<
        [{ count: bigint }]
      >`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`,
    ]);

  return {
    version: versionResult[0].version,
    currentDatabase: dbResult[0].current_database,
    currentUser: userResult[0].current_user,
    serverVersion: serverResult[0].server_version,
    connectionCount: Number(connectionResult[0].count),
  };
}

async function testQueryPerformance(): Promise<void> {
  const startTime = Date.now();

  // Test a simple query
  await prisma.$queryRaw`SELECT 1 as test`;

  const endTime = Date.now();
  const queryTime = endTime - startTime;

  console.log(`   Query execution time: ${queryTime}ms`);

  if (queryTime < 100) {
    console.log("   ✅ Excellent query performance");
  } else if (queryTime < 500) {
    console.log("   ⚠️  Good query performance");
  } else {
    console.log("   ⚠️  Slow query performance - check network connection");
  }
}

async function testSchemaAccess(): Promise<void> {
  try {
    // Test if we can access the schema
    const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );

    console.log(`   Found ${tables.length} tables in the schema`);

    if (tables.length > 0) {
      console.log("   ✅ Schema access successful");
      console.log(`   Tables: ${tables.map(t => t.tablename).join(", ")}`);
    } else {
      console.log(
        "   ⚠️  No tables found - run 'npx prisma db push' to create schema"
      );
    }
  } catch (error) {
    console.log("   ❌ Schema access failed:", error);
  }
}

// Environment validation
function validateEnvironment(): void {
  const requiredEnvVars = ["DATABASE_URL"];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease check your .env.local file.");
    process.exit(1);
  }

  // Check if DATABASE_URL looks like a Neon URL
  const databaseUrl = process.env.DATABASE_URL!;
  if (
    !databaseUrl.includes("neon.tech") &&
    !databaseUrl.includes("localhost")
  ) {
    console.warn("⚠️  DATABASE_URL does not appear to be a Neon URL");
    console.warn("   Make sure you're using the correct connection string");
  }

  if (
    !databaseUrl.includes("sslmode=require") &&
    databaseUrl.includes("neon.tech")
  ) {
    console.warn("⚠️  Neon connection string should include ?sslmode=require");
  }
}

// Main execution
if (require.main === module) {
  console.log("🚀 Neon Database Connection Test");
  console.log("================================\n");

  // Validate environment first
  validateEnvironment();

  // Run the test
  testNeonConnection()
    .then(() => {
      console.log("\n✨ Test completed successfully!");
      process.exit(0);
    })
    .catch(error => {
      console.error("\n💥 Test failed with error:", error);
      process.exit(1);
    });
}

export { testNeonConnection, getDatabaseInfo };
