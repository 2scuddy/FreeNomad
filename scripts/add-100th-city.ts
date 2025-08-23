#!/usr/bin/env tsx
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function add100thCity() {
  try {
    const currentCount = await prisma.city.count();
    console.log(`📊 Current cities: ${currentCount}`);

    if (currentCount >= 100) {
      console.log("✅ Already have 100+ cities!");
      return;
    }

    await prisma.city.create({
      data: {
        name: "Quito",
        country: "Ecuador",
        region: "Pichincha",
        latitude: -0.1807,
        longitude: -78.4678,
        population: 2781641,
        timezone: "America/Guayaquil",
        costOfLiving: 600,
        internetSpeed: 42.8,
        safetyRating: 6.5,
        walkability: 7.0,
        nightlife: 7.5,
        culture: 8.5,
        weather: 9.0,
        description:
          "Quito offers high-altitude living, rich history, and affordable costs with year-round spring weather.",
        shortDescription: "High-altitude living with rich history",
        featured: false,
        verified: true,
      },
    });

    const finalCount = await prisma.city.count();
    console.log(`🎉 Final count: ${finalCount} cities!`);

    if (finalCount >= 100) {
      console.log("🎯 TARGET ACHIEVED: 100 cities in database!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

add100thCity();
