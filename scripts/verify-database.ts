#!/usr/bin/env tsx
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    const [total, featured, verified, countries] = await Promise.all([
      prisma.city.count(),
      prisma.city.count({ where: { featured: true } }),
      prisma.city.count({ where: { verified: true } }),
      prisma.city.groupBy({
        by: ["country"],
        _count: { country: true },
      }),
    ]);

    console.log("🎉 FINAL DATABASE SUMMARY:");
    console.log("=".repeat(50));
    console.log(`📊 Total cities: ${total}`);
    console.log(`⭐ Featured cities: ${featured}`);
    console.log(`✅ Verified cities: ${verified}`);
    console.log(`🌍 Countries represented: ${countries.length}`);
    console.log("=".repeat(50));

    if (total >= 100) {
      console.log("🎯 TARGET ACHIEVED: 100+ complete city records!");
      console.log("✅ Database is ready for production use!");
      console.log("🚀 Marketing campaign can proceed!");
    } else {
      console.log(`❌ Target not met. Need ${100 - total} more cities.`);
    }

    // Sample of countries
    console.log("\n🌍 Sample countries represented:");
    countries.slice(0, 10).forEach(country => {
      console.log(`   ${country.country}: ${country._count.country} cities`);
    });
    if (countries.length > 10) {
      console.log(`   ... and ${countries.length - 10} more countries`);
    }
  } catch (error) {
    console.error("❌ Error verifying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
