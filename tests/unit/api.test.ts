/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GET } from "../../src/app/api/cities/route";
import { NextRequest } from "next/server";

// Helper function to create NextRequest objects
function createRequest(url: string) {
  return new NextRequest(url, {
    method: "GET",
  });
}

// Mock Prisma
const mockPrisma = {
  city: {
    findMany: jest.fn() as any,
    count: jest.fn() as any,
    findUnique: jest.fn() as any,
  },
  $connect: jest.fn() as any,
  $disconnect: jest.fn() as any,
};

// Create mock city data that will be used consistently across tests
const mockCityData = [
  {
    id: "1",
    name: "Bangkok",
    country: "Thailand",
    costOfLiving: 800,
    internetSpeed: 50,
    safetyRating: 7.5,
    walkability: 6.8,
    weather: 8.2,
    culture: 9.0,
    nightlife: 9.5,
    averageRating: 4.2,
    reviewCount: 89,
    featured: true,
    verified: true,
    region: "Bangkok",
    shortDescription: "Vibrant city with great food and culture",
    description:
      "Bangkok offers an amazing blend of traditional and modern culture.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviews: [{ rating: 4.5 }, { rating: 4.0 }, { rating: 4.2 }],
    _count: { reviews: 3 },
  },
  {
    id: "2",
    name: "Chiang Mai",
    country: "Thailand",
    costOfLiving: 600,
    internetSpeed: 45,
    safetyRating: 8.0,
    walkability: 7.2,
    weather: 8.5,
    culture: 8.8,
    nightlife: 7.0,
    averageRating: 4.4,
    reviewCount: 67,
    featured: false,
    verified: true,
    region: "Chiang Mai",
    shortDescription: "Peaceful mountain city with digital nomad community",
    description:
      "Chiang Mai is perfect for digital nomads seeking tranquility.",
    imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviews: [{ rating: 4.4 }, { rating: 4.6 }],
    _count: { reviews: 2 },
  },
];

// Mock the prisma module before importing
jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock the Prisma client to prevent any real database connections
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock db-utils to use mocked prisma
jest.mock("../../src/lib/db-utils", () => {
  const originalModule = jest.requireActual("../../src/lib/db-utils") as any;
  return {
    ...originalModule,
    safeDbOperation: jest.fn().mockImplementation(async (operation: any) => {
      // In unit tests, we want to control the behavior explicitly
      // Check if we're in a test that should simulate database errors
      const testName = expect.getState().currentTestName;
      if (testName && testName.includes("database errors gracefully")) {
        // For the database error test, throw an error to trigger fallback
        throw new Error("Simulated database error for testing");
      }

      // For normal tests, always use the mocked operation result
      // This ensures consistent behavior regardless of database state
      return await operation();
    }),
    paginate: jest
      .fn()
      .mockImplementation(
        async (model: any, options: any, where?: any, orderBy?: any) => {
          // Always use mock data in tests to ensure consistent behavior
          // regardless of database connection status
          let filteredData = [...mockCityData];

          // Apply filtering logic
          if (where?.costOfLiving?.lte) {
            filteredData = filteredData.filter(
              city => city.costOfLiving <= where.costOfLiving.lte
            );
          }

          if (where?.safetyRating?.gte) {
            filteredData = filteredData.filter(
              city => city.safetyRating >= where.safetyRating.gte
            );
          }

          if (where?.OR) {
            const searchTerm = where.OR.find(
              (condition: any) => condition.name?.contains
            )?.name?.contains;
            if (searchTerm) {
              filteredData = filteredData.filter(
                city =>
                  city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  city.country.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }
          }

          // Apply pagination
          const page = options.page || 1;
          const limit = options.limit || 10;
          const skip = (page - 1) * limit;
          const paginatedData = filteredData.slice(skip, skip + limit);

          return {
            data: paginatedData,
            meta: {
              total: filteredData.length,
              page: page,
              limit: limit,
              totalPages: Math.ceil(filteredData.length / limit),
              hasMore: skip + limit < filteredData.length,
            },
          };
        }
      ),
    getRecordOrThrow: jest.fn(),
    createRangeFilter: jest.fn(),
    createSortOrder: jest.fn(),
    DatabaseError: jest.fn(),
  };
});

// Mocked imports - actual imports not needed in tests

describe("/api/cities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.city.findMany.mockClear();
    mockPrisma.city.count.mockClear();

    // Set default mock implementations to ensure data is returned
    // Use the consistent mockCityData instead of redefining it
    mockPrisma.city.findMany.mockResolvedValue(mockCityData);
    mockPrisma.city.count.mockResolvedValue(mockCityData.length);
  });

  it("should return cities with default pagination", async () => {
    // Mock Prisma to return data successfully
    mockPrisma.city.findMany.mockResolvedValue(mockCityData);
    mockPrisma.city.count.mockResolvedValue(mockCityData.length);

    const request = createRequest("http://localhost:3000/api/cities");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.meta).toBeDefined();
    expect(data.meta.total).toBeGreaterThan(0);
  });

  it("should handle pagination parameters", async () => {
    const request = createRequest(
      "http://localhost:3000/api/cities?page=2&limit=5"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.meta).toBeDefined();
    expect(data.meta.page).toBe(2);
    expect(data.meta.limit).toBe(5);
  });

  it("should handle filter parameters", async () => {
    const request = createRequest(
      "http://localhost:3000/api/cities?maxCost=1000&minSafety=8"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.meta).toBeDefined();
  });

  it("should handle search parameter", async () => {
    const request = createRequest(
      "http://localhost:3000/api/cities?search=Bangkok"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.meta).toBeDefined();
  });

  it("should handle database errors gracefully", async () => {
    // Mock safeDbOperation to throw an error to trigger fallback
    const { safeDbOperation } = require("../../src/lib/db-utils");
    safeDbOperation.mockRejectedValue(new Error("Database connection failed"));

    const request = createRequest("http://localhost:3000/api/cities");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    // Should return mock cities when database fails
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("should validate and sanitize input parameters", async () => {
    const request = createRequest(
      "http://localhost:3000/api/cities?page=invalid&limit=abc&maxCost=not-a-number"
    );
    const response = await GET(request);
    const data = await response.json();

    // Should reject invalid parameters with 400 status
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    // Error could be a string or object, just check it exists
    expect(
      typeof data.error === "string" || typeof data.error === "object"
    ).toBe(true);
  });
});
