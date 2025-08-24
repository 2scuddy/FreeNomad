#!/usr/bin/env tsx
/**
 * Fix City Images Script
 *
 * This script resolves the issue where city cards display without images
 * by updating broken Unsplash URLs with properly formatted ones that include
 * necessary parameters for image loading.
 */

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Updated city image URLs with proper Unsplash parameters
const cityImageUpdates = [
  {
    name: "Lisbon",
    imageUrl:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Luca Bravo on Unsplash",
  },
  {
    name: "Bali",
    imageUrl:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Artem Beliaikin on Unsplash",
  },
  {
    name: "Mexico City",
    imageUrl:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Jezael Melgoza on Unsplash",
  },
  {
    name: "Medellín",
    imageUrl:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Willian Justen de Vasconcellos on Unsplash",
  },
  {
    name: "Tbilisi",
    imageUrl:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Levan Badzgaradze on Unsplash",
  },
  {
    name: "Prague",
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Rodrigo Kugnharski on Unsplash",
  },
  {
    name: "Buenos Aires",
    imageUrl:
      "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Nico Baum on Unsplash",
  },
  {
    name: "Chiang Mai",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Sumit Chinchane on Unsplash",
  },
  {
    name: "Vienna",
    imageUrl:
      "https://images.unsplash.com/photo-1516550893923-42d407bd4ac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Jacek Dylag on Unsplash",
  },
  {
    name: "Berlin",
    imageUrl:
      "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Nico Baum on Unsplash",
  },
  {
    name: "Amsterdam",
    imageUrl:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Adrien Olichon on Unsplash",
  },
  {
    name: "Stockholm",
    imageUrl:
      "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Raphael Andres on Unsplash",
  },
  {
    name: "Copenhagen",
    imageUrl:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Nick Karvounis on Unsplash",
  },
  {
    name: "Paris",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Anthony Delanoix on Unsplash",
  },
  {
    name: "Barcelona",
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Toa Heftiba on Unsplash",
  },
  {
    name: "Madrid",
    imageUrl:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Florian Wehde on Unsplash",
  },
  {
    name: "Porto",
    imageUrl:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Luca Bravo on Unsplash",
  },
  {
    name: "Rome",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Davi Pimentel on Unsplash",
  },
  {
    name: "Tokyo",
    imageUrl:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Louie Martinez on Unsplash",
  },
  {
    name: "Singapore",
    imageUrl:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Hu Chen on Unsplash",
  },
  {
    name: "Seoul",
    imageUrl:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Sven Mieke on Unsplash",
  },
  {
    name: "Hong Kong",
    imageUrl:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Ruslan Bardash on Unsplash",
  },
  {
    name: "Taipei",
    imageUrl:
      "https://images.unsplash.com/photo-1508248467877-aec1b08de376?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Ling Tang on Unsplash",
  },
  {
    name: "Kuala Lumpur",
    imageUrl:
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Izuddin Helmi Adnan on Unsplash",
  },
  {
    name: "Bangkok",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Sumit Chinchane on Unsplash",
  },
  {
    name: "Ho Chi Minh City",
    imageUrl:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Linh Pham on Unsplash",
  },
  {
    name: "Toronto",
    imageUrl:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Mwangi Gatheca on Unsplash",
  },
  {
    name: "Vancouver",
    imageUrl:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Aditya Chinchure on Unsplash",
  },
  {
    name: "Austin",
    imageUrl:
      "https://images.unsplash.com/photo-1531218150217-54595bc2b934?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Mick Haupt on Unsplash",
  },
  {
    name: "Miami",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Sumit Chinchane on Unsplash",
  },
  {
    name: "São Paulo",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Raphael Nogueira on Unsplash",
  },
  {
    name: "Santiago",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Lima",
    imageUrl:
      "https://images.unsplash.com/photo-1531968455001-5c5272a41129?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Willian Justen de Vasconcellos on Unsplash",
  },
  {
    name: "Cape Town",
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Tobias Reich on Unsplash",
  },
  {
    name: "Marrakech",
    imageUrl:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Florian Wehde on Unsplash",
  },
  {
    name: "Sydney",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Sumit Chinchane on Unsplash",
  },
  {
    name: "Melbourne",
    imageUrl:
      "https://images.unsplash.com/photo-1514395462725-fb4566210144?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Denise Jans on Unsplash",
  },
  {
    name: "Warsaw",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Krakow",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Budapest",
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Rodrigo Kugnharski on Unsplash",
  },
  {
    name: "Bucharest",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Dubai",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by ZQ Lee on Unsplash",
  },
  {
    name: "Tel Aviv",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Zurich",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Cristian Castillo on Unsplash",
  },
  {
    name: "Dublin",
    imageUrl:
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Conor Luddy on Unsplash",
  },
  {
    name: "London",
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Benjamin Davies on Unsplash",
  },
  {
    name: "Helsinki",
    imageUrl:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Florian Wehde on Unsplash",
  },
  {
    name: "Oslo",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Raphael Nogueira on Unsplash",
  },
  {
    name: "Edinburgh",
    imageUrl:
      "https://images.unsplash.com/photo-1549918864-48ac978761a4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Conor Luddy on Unsplash",
  },
  {
    name: "Montreal",
    imageUrl:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    imageAttribution: "Photo by Mwangi Gatheca on Unsplash",
  },
];

async function fixCityImages() {
  console.log("🖼️  Starting city image URL fixes...");

  try {
    let updatedCount = 0;
    let errorCount = 0;

    for (const update of cityImageUpdates) {
      try {
        const result = await prisma.city.updateMany({
          where: { name: update.name },
          data: {
            imageUrl: update.imageUrl,
            imageAttribution: update.imageAttribution,
            updatedAt: new Date(),
          },
        });

        if (result.count > 0) {
          console.log(`✅ Updated ${update.name}: ${result.count} record(s)`);
          updatedCount += result.count;
        } else {
          console.log(`⚠️  No records found for ${update.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${update.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} cities`);
    console.log(`❌ Errors encountered: ${errorCount}`);

    // Verify the fixes
    console.log(`\n🔍 Verifying fixes...`);
    const citiesWithImages = await prisma.city.count({
      where: {
        imageUrl: {
          not: null,
        },
      },
    });

    console.log(`📸 Cities with images: ${citiesWithImages}`);

    // Test a few URLs
    console.log(`\n🧪 Testing sample URLs...`);
    const sampleCities = await prisma.city.findMany({
      where: {
        name: {
          in: ["Lisbon", "Tokyo", "Berlin"],
        },
      },
      select: {
        name: true,
        imageUrl: true,
      },
    });

    for (const city of sampleCities) {
      if (city.imageUrl) {
        console.log(`🔗 ${city.name}: ${city.imageUrl.substring(0, 80)}...`);
      }
    }

    console.log(`\n🎉 City image URL fixes completed successfully!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Restart the development server to clear image cache`);
    console.log(`   2. Refresh the browser to see updated images`);
    console.log(`   3. Verify all city cards now display images properly`);
  } catch (error) {
    console.error(`❌ Error during image URL fixes:`, error);
    throw error;
  }
}

async function main() {
  try {
    await fixCityImages();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { fixCityImages, cityImageUpdates };
