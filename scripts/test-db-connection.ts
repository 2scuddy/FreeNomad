import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...");

    // Test the connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database query test successful:", result);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("\n💡 Make sure to:");
    console.log("1. Set up your DATABASE_URL in .env file");
    console.log("2. Ensure your database server is running");
    console.log("3. Check your database credentials");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
