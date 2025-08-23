#!/usr/bin/env tsx
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Interface for city data
interface CityData {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
  costOfLiving: number;
  internetSpeed: number;
  safetyRating: number;
  walkability: number;
  nightlife: number;
  culture: number;
  weather: number;
  description: string;
  shortDescription: string;
  featured: boolean;
  verified: boolean;
}

// Comprehensive city dataset
const cityDataset: CityData[] = [
  {
    name: "Barcelona",
    country: "Spain",
    region: "Catalonia",
    latitude: 41.3851,
    longitude: 2.1734,
    population: 1620343,
    timezone: "Europe/Madrid",
    costOfLiving: 1400,
    internetSpeed: 78.5,
    safetyRating: 8.2,
    walkability: 9.1,
    nightlife: 9.5,
    culture: 9.8,
    weather: 8.7,
    description:
      "Barcelona combines stunning architecture, vibrant culture, and excellent infrastructure for digital nomads.",
    shortDescription: "Architectural marvel with vibrant nomad scene",
    featured: true,
    verified: true,
  },
  {
    name: "Berlin",
    country: "Germany",
    region: "Berlin",
    latitude: 52.52,
    longitude: 13.405,
    population: 3669491,
    timezone: "Europe/Berlin",
    costOfLiving: 1600,
    internetSpeed: 95.2,
    safetyRating: 8.8,
    walkability: 8.9,
    nightlife: 9.7,
    culture: 9.6,
    weather: 6.5,
    description:
      "Berlin offers a thriving tech scene, affordable living, and unmatched cultural diversity.",
    shortDescription: "Tech hub with rich history and culture",
    featured: true,
    verified: true,
  },
  {
    name: "Prague",
    country: "Czech Republic",
    region: "Prague",
    latitude: 50.0755,
    longitude: 14.4378,
    population: 1280000,
    timezone: "Europe/Prague",
    costOfLiving: 1000,
    internetSpeed: 82.1,
    safetyRating: 8.9,
    walkability: 8.7,
    nightlife: 8.8,
    culture: 9.4,
    weather: 7.2,
    description:
      "Prague enchants with medieval architecture, affordable costs, and growing digital nomad community.",
    shortDescription: "Medieval beauty with modern amenities",
    featured: false,
    verified: true,
  },
  {
    name: "Budapest",
    country: "Hungary",
    region: "Budapest",
    latitude: 47.4979,
    longitude: 19.0402,
    population: 1752000,
    timezone: "Europe/Budapest",
    costOfLiving: 900,
    internetSpeed: 76.8,
    safetyRating: 8.1,
    walkability: 8.3,
    nightlife: 8.9,
    culture: 9.2,
    weather: 7.1,
    description:
      "Budapest offers thermal baths, stunning architecture, and very affordable nomad lifestyle.",
    shortDescription: "Thermal baths and affordable elegance",
    featured: false,
    verified: true,
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    region: "North Holland",
    latitude: 52.3676,
    longitude: 4.9041,
    population: 821752,
    timezone: "Europe/Amsterdam",
    costOfLiving: 2200,
    internetSpeed: 112.4,
    safetyRating: 9.1,
    walkability: 9.3,
    nightlife: 8.6,
    culture: 9.1,
    weather: 6.8,
    description:
      "Amsterdam provides world-class infrastructure, bike-friendly streets, and progressive culture.",
    shortDescription: "Canals, bikes, and digital innovation",
    featured: true,
    verified: true,
  },
];

// Validation function
function validateCityData(city: CityData): boolean {
  const requiredFields = [
    "name",
    "country",
    "region",
    "latitude",
    "longitude",
    "population",
    "timezone",
  ];

  for (const field of requiredFields) {
    if (!city[field as keyof CityData]) {
      console.error(`Missing required field: ${field} for city: ${city.name}`);
      return false;
    }
  }

  // Validate coordinate ranges
  if (city.latitude < -90 || city.latitude > 90) {
    console.error(`Invalid latitude for ${city.name}: ${city.latitude}`);
    return false;
  }

  if (city.longitude < -180 || city.longitude > 180) {
    console.error(`Invalid longitude for ${city.name}: ${city.longitude}`);
    return false;
  }

  // Validate ratings (1-10 scale)
  const ratingFields = [
    "safetyRating",
    "walkability",
    "nightlife",
    "culture",
    "weather",
  ];
  for (const field of ratingFields) {
    const value = city[field as keyof CityData] as number;
    if (value < 1 || value > 10) {
      console.error(
        `Invalid ${field} for ${city.name}: ${value} (must be 1-10)`
      );
      return false;
    }
  }

  // Validate cost of living (reasonable range)
  if (city.costOfLiving < 300 || city.costOfLiving > 5000) {
    console.error(
      `Unrealistic cost of living for ${city.name}: ${city.costOfLiving}`
    );
    return false;
  }

  // Validate internet speed (reasonable range)
  if (city.internetSpeed < 1 || city.internetSpeed > 300) {
    console.error(
      `Unrealistic internet speed for ${city.name}: ${city.internetSpeed}`
    );
    return false;
  }

  return true;
}

// Main function to populate database
async function populateDatabase() {
  try {
    console.log("🚀 Starting city data generation...");

    // Check current city count
    const currentCount = await prisma.city.count();
    console.log(`📊 Current cities in database: ${currentCount}`);

    // Validate all city data
    console.log("🔍 Validating city data...");
    const validCities = cityDataset.filter(validateCityData);
    console.log(
      `✅ Validated ${validCities.length}/${cityDataset.length} cities`
    );

    if (validCities.length === 0) {
      console.log("❌ No valid cities to insert");
      return;
    }

    // Insert cities in batches
    console.log("📍 Inserting cities...");
    let insertedCount = 0;

    for (const city of validCities) {
      try {
        await prisma.city.create({
          data: city,
        });
        insertedCount++;
        console.log(`✅ Inserted: ${city.name}, ${city.country}`);
      } catch (error) {
        console.log(
          `⚠️ Skipped ${city.name} (likely duplicate):`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Final statistics
    const finalCount = await prisma.city.count();
    const featuredCount = await prisma.city.count({
      where: { featured: true },
    });
    const verifiedCount = await prisma.city.count({
      where: { verified: true },
    });
    const countryCount = await prisma.city.groupBy({
      by: ["country"],
      _count: { country: true },
    });

    console.log("\n🎉 City data generation completed!");
    console.log("=".repeat(50));
    console.log(`📊 Total cities: ${finalCount}`);
    console.log(`⭐ Featured cities: ${featuredCount}`);
    console.log(`✅ Verified cities: ${verifiedCount}`);
    console.log(`🌍 Countries represented: ${countryCount.length}`);
    console.log(`📈 Cities added this session: ${insertedCount}`);
  } catch (error) {
    console.error("❌ Error during city data generation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  populateDatabase();
}

export { populateDatabase, validateCityData, cityDataset };
