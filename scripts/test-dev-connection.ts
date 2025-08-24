#!/usr/bin/env tsx
/**
 * Development Database Connection Test
 *
 * This script tests the connection to the Neon development database
 * and verifies the configuration is correct.
 */

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function testConnection() {
  console.log(`🔍 Testing Neon Development Database Connection...`);
  console.log(`📅 ${new Date().toISOString()}`);

  try {
    // Test basic connection
    console.log(`\n🔌 Testing database connection...`);
    const result = await prisma.$queryRaw`SELECT 
      current_database() as database_name,
      current_user as user_name,
      version() as postgres_version,
      inet_server_addr() as server_address,
      inet_server_port() as server_port`;

    console.log(`✅ Connection successful!`);
    console.log(`📊 Connection Details:`, result);

    // Test schema
    console.log(`\n🏗️  Testing database schema...`);
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name`;

    console.log(`📋 Available tables:`);
    (tables as { table_name: string; table_type: string }[]).forEach(table => {
      console.log(`   - ${table.table_name} (${table.table_type})`);
    });

    // Test data access
    console.log(`\n📊 Testing data access...`);
    const [cityCount, userCount, reviewCount] = await Promise.all([
      prisma.city.count(),
      prisma.user.count(),
      prisma.review.count(),
    ]);

    console.log(`📈 Record counts:`);
    console.log(`   Cities: ${cityCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Reviews: ${reviewCount}`);

    // Test environment configuration
    console.log(`\n⚙️  Environment Configuration:`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
    console.log(
      `   NEON_PROJECT_ID: ${process.env.NEON_PROJECT_ID || "not set"}`
    );
    console.log(
      `   NEON_BRANCH_ID: ${process.env.NEON_BRANCH_ID || "not set"}`
    );
    console.log(
      `   DATABASE_URL: ${process.env.DATABASE_URL ? "configured" : "not set"}`
    );
    console.log(
      `   PRODUCTION_DATABASE_URL: ${process.env.PRODUCTION_DATABASE_URL ? "configured" : "not set"}`
    );

    // Performance test
    console.log(`\n⚡ Performance test...`);
    const startTime = Date.now();
    await prisma.city.findMany({ take: 10 });
    const endTime = Date.now();
    console.log(`   Query time: ${endTime - startTime}ms`);

    console.log(`\n🎉 All tests passed! Development database is ready.`);

    return true;
  } catch (error: unknown) {
    console.error(`❌ Connection test failed:`, error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const success = await testConnection();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

export { testConnection };
