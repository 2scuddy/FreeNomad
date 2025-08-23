#!/usr/bin/env tsx
/**
 * Utility script to populate city images from Unsplash
 * Usage: npm run populate-images [--dry-run] [--batch-size=10] [--featured-only]
 */

import { PrismaClient } from "@prisma/client";
import { unsplashService } from "../src/lib/unsplash";

const prisma = new PrismaClient();

interface PopulateOptions {
  dryRun: boolean;
  batchSize: number;
  featuredOnly: boolean;
  force: boolean;
}

interface CityWithImage {
  id: string;
  name: string;
  country: string;
  imageUrl: string | null;
  imageAttribution: string | null;
  featured: boolean;
}

class CityImagePopulator {
  private options: PopulateOptions;
  private stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
  };

  constructor(options: PopulateOptions) {
    this.options = options;
  }

  async run() {
    console.log("🌍 FreeNomad City Image Populator\n");

    if (this.options.dryRun) {
      console.log("🔍 Running in DRY RUN mode - no changes will be made\n");
    }

    try {
      // Fetch cities from database
      const cities = await this.fetchCities();
      this.stats.total = cities.length;

      console.log(`Found ${cities.length} cities to process\n`);

      if (cities.length === 0) {
        console.log("No cities found. Exiting.");
        return;
      }

      // Process cities in batches
      await this.processCitiesInBatches(cities);

      // Display final statistics
      this.displayStats();
    } catch (error) {
      console.error("❌ Error during processing:", error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  private async fetchCities(): Promise<CityWithImage[]> {
    console.log("Fetching cities from database...");

    try {
      const whereClause: Record<string, unknown> = {};

      if (this.options.featuredOnly) {
        whereClause.featured = true;
      }

      if (!this.options.force) {
        // Only fetch cities without images
        whereClause.OR = [{ imageUrl: null }, { imageUrl: "" }];
      }

      const cities = await prisma.city.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          country: true,
          imageUrl: true,
          imageAttribution: true,
          featured: true,
        },
        orderBy: [
          { featured: "desc" }, // Featured cities first
          { name: "asc" },
        ],
      });

      console.log(`✅ Fetched ${cities.length} cities`);
      return cities;
    } catch (error) {
      console.log("❌ Failed to fetch cities");
      throw error;
    }
  }

  private async processCitiesInBatches(cities: CityWithImage[]) {
    const batches = this.createBatches(cities, this.options.batchSize);

    console.log(
      `Processing ${batches.length} batches of ${this.options.batchSize} cities each\n`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;

      console.log(`\n📦 Processing batch ${batchNumber}/${batches.length}`);

      await this.processBatch(batch, batchNumber);

      // Add delay between batches to respect rate limits
      if (i < batches.length - 1) {
        const delay = 2000; // 2 seconds
        console.log(`Waiting ${delay / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log("✅ Ready for next batch");
      }
    }
  }

  private async processBatch(cities: CityWithImage[], batchNumber: number) {
    console.log(`Fetching images for batch ${batchNumber}...`);

    try {
      // Fetch images from Unsplash
      const imageResults = await unsplashService.getCityImages(
        cities.map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
        }))
      );

      console.log(`✅ Fetched images for batch ${batchNumber}`);

      // Process each city in the batch
      for (const city of cities) {
        await this.processCity(city, imageResults[city.id]);
      }
    } catch (error) {
      console.log(`❌ Failed to process batch ${batchNumber}`);
      console.error(`Error in batch ${batchNumber}:`, error);

      // Mark all cities in this batch as failed
      this.stats.failed += cities.length;
      this.stats.processed += cities.length;
    }
  }

  private async processCity(
    city: CityWithImage,
    imageResult:
      | {
          success: boolean;
          imageUrl?: string;
          imageAttribution?: string;
          error?: string;
        }
      | undefined
  ) {
    const cityLabel = `${city.name}, ${city.country}`;

    try {
      if (!imageResult || !imageResult.success) {
        console.log(`⚠️  ${cityLabel}: No image found`);
        this.stats.failed++;
        this.stats.processed++;
        return;
      }

      if (!this.options.dryRun) {
        // Update city in database
        await prisma.city.update({
          where: { id: city.id },
          data: {
            imageUrl: imageResult.imageUrl,
            imageAttribution: imageResult.imageAttribution,
          },
        });
      }

      console.log(`✅ ${cityLabel}: Image updated`);
      if (this.options.dryRun) {
        console.log(`   Would set: ${imageResult.imageUrl}`);
      }

      this.stats.successful++;
      this.stats.processed++;
    } catch (error) {
      console.log(`❌ ${cityLabel}: Update failed`);
      console.error(`   Error: ${error}`);

      this.stats.failed++;
      this.stats.processed++;
    }
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private displayStats() {
    console.log("\n📊 Final Statistics:");
    console.log("─".repeat(40));
    console.log(`Total cities: ${this.stats.total}`);
    console.log(`Processed: ${this.stats.processed}`);
    console.log(`Successful: ${this.stats.successful}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Skipped: ${this.stats.skipped}`);

    if (this.stats.processed > 0) {
      const successRate = (
        (this.stats.successful / this.stats.processed) *
        100
      ).toFixed(1);
      console.log(`Success rate: ${successRate}%`);
    }

    console.log("─".repeat(40));

    if (this.options.dryRun) {
      console.log("\n🔍 This was a dry run - no changes were made");
      console.log("Run without --dry-run to apply changes");
    } else {
      console.log("\n✅ Image population completed!");
    }
  }
}

// Simple argument parsing without external dependencies
function parseArgs(): PopulateOptions {
  const args = process.argv.slice(2);
  const options: PopulateOptions = {
    dryRun: false,
    batchSize: 10,
    featuredOnly: false,
    force: false,
  };

  for (const arg of args) {
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg.startsWith("--batch-size=")) {
      const size = parseInt(arg.split("=")[1], 10);
      if (size >= 1 && size <= 20) {
        options.batchSize = size;
      }
    } else if (arg === "--featured-only" || arg === "-f") {
      options.featuredOnly = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Usage: npm run populate-images [options]

Options:
  -d, --dry-run          Run without making changes
  --batch-size=<number>  Number of cities per batch (1-20, default: 10)
  -f, --featured-only    Only process featured cities
  --force                Update cities that already have images
  -h, --help             Show this help message
`);
      process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();

  // Validate options
  if (options.batchSize < 1 || options.batchSize > 20) {
    console.error("❌ Batch size must be between 1 and 20");
    process.exit(1);
  }

  // Check for required environment variables
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error("❌ UNSPLASH_ACCESS_KEY environment variable is required");
    console.log("Please add your Unsplash API key to .env.local");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const populator = new CityImagePopulator(options);
  await populator.run();
}

// Handle uncaught errors
process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { CityImagePopulator };
