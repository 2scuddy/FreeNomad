import { PrismaClient } from "../../../src/generated/prisma";
import { faker } from "@faker-js/faker";

export interface TestDataConfig {
  cities: number;
  users: number;
  reviews: number;
  clearExisting: boolean;
  useFixedSeed: boolean;
  seedValue?: number;
}

export interface SeededData {
  cities: Array<{
    id: string;
    name: string;
    country: string;
    costOfLiving: number | null;
    internetSpeed: number | null;
    safetyRating: number | null;
    walkability: number | null;
    featured: boolean;
    verified: boolean;
  }>;
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title: string;
    content: string;
    cityId: string;
    userId: string;
  }>;
}

export interface TestDataSnapshot {
  id: string;
  timestamp: string;
  config: TestDataConfig;
  data: SeededData;
  checksum: string;
}

export class TestDataSeeder {
  private prisma: PrismaClient;
  private snapshots: Map<string, TestDataSnapshot> = new Map();
  private currentSnapshot?: TestDataSnapshot;

  constructor(databaseUrl?: string) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            databaseUrl ||
            process.env.TEST_DATABASE_URL ||
            process.env.DATABASE_URL,
        },
      },
    });
  }

  /**
   * Initialize the seeder and connect to database
   */
  async initialize(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log("🌱 Test data seeder initialized");
    } catch (error) {
      console.error("❌ Failed to initialize test data seeder:", error);
      throw error;
    }
  }

  /**
   * Seed test data with specified configuration
   */
  async seedTestData(
    config: Partial<TestDataConfig> = {}
  ): Promise<SeededData> {
    const fullConfig: TestDataConfig = {
      cities: 20,
      users: 10,
      reviews: 50,
      clearExisting: true,
      useFixedSeed: true,
      seedValue: 12345,
      ...config,
    };

    console.log("🌱 Starting test data seeding...");
    console.log("📋 Configuration:", fullConfig);

    // Set fixed seed for reproducible data
    if (fullConfig.useFixedSeed && fullConfig.seedValue) {
      faker.seed(fullConfig.seedValue);
    }

    // Clear existing data if requested
    if (fullConfig.clearExisting) {
      await this.clearAllData();
    }

    // Seed data in order (respecting foreign key constraints)
    const users = await this.seedUsers(fullConfig.users);
    const cities = await this.seedCities(fullConfig.cities);
    const reviews = await this.seedReviews(fullConfig.reviews, cities, users);

    const seededData: SeededData = {
      cities,
      users,
      reviews,
    };

    // Create snapshot
    this.currentSnapshot = await this.createSnapshot(fullConfig, seededData);

    console.log("✅ Test data seeding completed");
    console.log(
      `📊 Seeded: ${cities.length} cities, ${users.length} users, ${reviews.length} reviews`
    );

    return seededData;
  }

  /**
   * Seed cities data
   */
  private async seedCities(count: number): Promise<SeededData["cities"]> {
    console.log(`🏙️ Seeding ${count} cities...`);

    const cities = [];
    const countries = [
      "Thailand",
      "Portugal",
      "Mexico",
      "Vietnam",
      "Indonesia",
      "Malaysia",
      "Philippines",
      "Colombia",
      "Peru",
      "Ecuador",
    ];

    for (let i = 0; i < count; i++) {
      const cityData = {
        name: `${faker.location.city()}-${i}-${Date.now()}`,
        country: faker.helpers.arrayElement(countries),
        region: faker.location.state(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        population: faker.number.int({ min: 50000, max: 10000000 }),
        timezone: faker.location.timeZone(),
        costOfLiving: faker.number.int({ min: 500, max: 3000 }),
        internetSpeed: parseFloat(
          faker.number
            .float({ min: 10, max: 100, fractionDigits: 1 })
            .toFixed(1)
        ),
        safetyRating: parseFloat(
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }).toFixed(1)
        ),
        walkability: parseFloat(
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }).toFixed(1)
        ),
        nightlife: parseFloat(
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }).toFixed(1)
        ),
        culture: parseFloat(
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }).toFixed(1)
        ),
        weather: parseFloat(
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }).toFixed(1)
        ),
        description: faker.lorem.paragraph(),
        shortDescription: faker.lorem.sentence(),
        imageUrl: `https://images.unsplash.com/photo-${faker.number.int({ min: 1500000000000, max: 1700000000000 })}?w=800&h=600&fit=crop`,
        featured: faker.datatype.boolean(0.3), // 30% chance of being featured
        verified: faker.datatype.boolean(0.8), // 80% chance of being verified
      };

      const city = await this.prisma.city.create({
        data: cityData,
      });

      cities.push({
        id: city.id,
        name: city.name,
        country: city.country,
        costOfLiving: city.costOfLiving,
        internetSpeed: city.internetSpeed,
        safetyRating: city.safetyRating,
        walkability: city.walkability,
        featured: city.featured,
        verified: city.verified,
      });
    }

    return cities;
  }

  /**
   * Seed users data
   */
  private async seedUsers(count: number): Promise<SeededData["users"]> {
    console.log(`👥 Seeding ${count} users...`);

    const users = [];
    const roles = ["USER", "ADMIN"];

    for (let i = 0; i < count; i++) {
      const userData = {
        email: `test-${i}-${Date.now()}-${faker.internet.email()}`,
        name: faker.person.fullName(),
        role: (i === 0 ? "ADMIN" : faker.helpers.arrayElement(roles)) as
          | "USER"
          | "ADMIN", // First user is admin
        image: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        location: faker.location.city(),
        website: faker.internet.url(),
        emailVerified: faker.datatype.boolean(0.9) ? new Date() : null, // 90% verified
      };

      const user = await this.prisma.user.create({
        data: userData,
      });

      users.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    }

    return users;
  }

  /**
   * Seed reviews data
   */
  private async seedReviews(
    count: number,
    cities: SeededData["cities"],
    users: SeededData["users"]
  ): Promise<SeededData["reviews"]> {
    console.log(`⭐ Seeding ${count} reviews...`);

    const reviews = [];
    const usedCombinations = new Set<string>();

    for (let i = 0; i < count; i++) {
      let city, user, combinationKey;
      let attempts = 0;

      // Find a unique user-city combination
      do {
        city = faker.helpers.arrayElement(cities);
        user = faker.helpers.arrayElement(users);
        combinationKey = `${user.id}-${city.id}`;
        attempts++;

        // Prevent infinite loop
        if (attempts > 100) {
          console.warn(
            `Skipping review ${i} - could not find unique user-city combination`
          );
          continue;
        }
      } while (usedCombinations.has(combinationKey));

      if (attempts > 100) continue;

      usedCombinations.add(combinationKey);
      const rating = faker.number.int({ min: 1, max: 5 });

      const reviewData = {
        rating,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        cityId: city.id,
        userId: user.id,
        internetRating: faker.number.int({ min: 1, max: 5 }),
        costRating: faker.number.int({ min: 1, max: 5 }),
        safetyRating: faker.number.int({ min: 1, max: 5 }),
        funRating: faker.number.int({ min: 1, max: 5 }),
        helpful: faker.number.int({ min: 0, max: 50 }),
        verified: faker.datatype.boolean(0.7), // 70% verified reviews
      };

      const review = await this.prisma.review.create({
        data: reviewData,
      });

      reviews.push({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        cityId: review.cityId,
        userId: review.userId,
      });
    }

    return reviews;
  }

  /**
   * Clear all test data
   */
  async clearAllData(): Promise<void> {
    console.log("🧹 Clearing existing test data...");

    try {
      // Delete in reverse order of dependencies
      await this.prisma.review.deleteMany({});
      await this.prisma.city.deleteMany({});
      await this.prisma.user.deleteMany({});

      console.log("✅ All test data cleared");
    } catch (error) {
      console.error("❌ Failed to clear test data:", error);
      throw error;
    }
  }

  /**
   * Create a snapshot of seeded data
   */
  private async createSnapshot(
    config: TestDataConfig,
    data: SeededData
  ): Promise<TestDataSnapshot> {
    const snapshot: TestDataSnapshot = {
      id: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      config,
      data,
      checksum: this.calculateChecksum(data),
    };

    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: SeededData): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return Buffer.from(dataString).toString("base64").slice(0, 16);
  }

  /**
   * Restore data from snapshot
   */
  async restoreFromSnapshot(snapshotId: string): Promise<SeededData> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    console.log(`🔄 Restoring data from snapshot ${snapshotId}...`);

    // Clear existing data
    await this.clearAllData();

    // Restore data
    return await this.seedTestData(snapshot.config);
  }

  /**
   * Get current snapshot
   */
  getCurrentSnapshot(): TestDataSnapshot | undefined {
    return this.currentSnapshot;
  }

  /**
   * Verify data integrity
   */
  async verifyDataIntegrity(): Promise<boolean> {
    if (!this.currentSnapshot) {
      console.warn("⚠️ No current snapshot to verify against");
      return false;
    }

    try {
      const currentCities = await this.prisma.city.count();
      const currentUsers = await this.prisma.user.count();
      const currentReviews = await this.prisma.review.count();

      const expectedCities = this.currentSnapshot.data.cities.length;
      const expectedUsers = this.currentSnapshot.data.users.length;
      const expectedReviews = this.currentSnapshot.data.reviews.length;

      const isValid =
        currentCities === expectedCities &&
        currentUsers === expectedUsers &&
        currentReviews === expectedReviews;

      if (isValid) {
        console.log("✅ Data integrity verified");
      } else {
        console.warn("⚠️ Data integrity check failed:");
        console.warn(
          `  Cities: expected ${expectedCities}, found ${currentCities}`
        );
        console.warn(
          `  Users: expected ${expectedUsers}, found ${currentUsers}`
        );
        console.warn(
          `  Reviews: expected ${expectedReviews}, found ${currentReviews}`
        );
      }

      return isValid;
    } catch (error) {
      console.error("❌ Failed to verify data integrity:", error);
      return false;
    }
  }

  /**
   * Get seeded data by type
   */
  async getSeededCities(limit?: number): Promise<SeededData["cities"]> {
    const cities = await this.prisma.city.findMany({
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        country: true,
        costOfLiving: true,
        internetSpeed: true,
        safetyRating: true,
        walkability: true,
        featured: true,
        verified: true,
      },
    });
    return cities;
  }

  async getSeededUsers(limit?: number): Promise<SeededData["users"]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return users;
  }

  async getSeededReviews(limit?: number): Promise<SeededData["reviews"]> {
    const reviews = await this.prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        cityId: true,
        userId: true,
      },
    });
    return reviews;
  }

  /**
   * Generate test data summary
   */
  async generateDataSummary(): Promise<{
    counts: { cities: number; users: number; reviews: number };
    snapshot: TestDataSnapshot | undefined;
    integrity: boolean;
  }> {
    const cities = await this.prisma.city.count();
    const users = await this.prisma.user.count();
    const reviews = await this.prisma.review.count();
    const integrity = await this.verifyDataIntegrity();

    return {
      counts: { cities, users, reviews },
      snapshot: this.currentSnapshot,
      integrity,
    };
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    try {
      await this.clearAllData();
      await this.prisma.$disconnect();
      console.log("🧹 Test data seeder cleanup completed");
    } catch (error) {
      console.error("❌ Failed to cleanup test data seeder:", error);
      throw error;
    }
  }

  /**
   * Disconnect without clearing data
   */
  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log("🔌 Test data seeder disconnected");
    } catch (error) {
      console.error("❌ Failed to disconnect test data seeder:", error);
      throw error;
    }
  }
}

// Export helper functions
export async function createTestDataSeeder(
  databaseUrl?: string
): Promise<TestDataSeeder> {
  const seeder = new TestDataSeeder(databaseUrl);
  await seeder.initialize();
  return seeder;
}

export async function seedQuickTestData(): Promise<SeededData> {
  const seeder = await createTestDataSeeder();
  try {
    return await seeder.seedTestData({
      cities: 5,
      users: 3,
      reviews: 10,
      clearExisting: true,
      useFixedSeed: true,
    });
  } finally {
    await seeder.disconnect();
  }
}

export async function clearTestDatabase(): Promise<void> {
  const seeder = await createTestDataSeeder();
  try {
    await seeder.clearAllData();
  } finally {
    await seeder.disconnect();
  }
}
