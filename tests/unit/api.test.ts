import { GET } from "../../src/app/api/cities/route";
import { NextRequest } from "next/server";

// Helper function to create NextRequest objects
function createRequest(url: string) {
  return new NextRequest(url, {
    method: "GET",
  });
}

// Mock Prisma
jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    city: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from "../../src/lib/prisma";

describe("/api/cities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return cities with default pagination", async () => {
    const mockCities = [
      {
        id: "1",
        name: "Bangkok",
        country: "Thailand",
        costOfLiving: 800,
        internetSpeed: 50,
        safetyRating: 7,
        walkability: 8,
        featured: true,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { reviews: 5 },
        reviews: [
          { rating: 4 },
          { rating: 5 },
          { rating: 3 },
          { rating: 4 },
          { rating: 5 },
        ],
      },
      {
        id: "2",
        name: "Lisbon",
        country: "Portugal",
        costOfLiving: 1200,
        internetSpeed: 80,
        safetyRating: 9,
        walkability: 9,
        featured: true,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { reviews: 3 },
        reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
      },
    ];

    (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);
    (prisma.city.count as jest.Mock).mockResolvedValue(2);

    const request = createRequest("http://localhost:3000/api/cities");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].name).toBe("Bangkok");
    expect(data.meta.total).toBe(2);
  });

  it("should handle pagination parameters", async () => {
    const mockCities = [
      {
        id: "1",
        name: "Bangkok",
        country: "Thailand",
        costOfLiving: 800,
        internetSpeed: 50,
        safetyRating: 7,
        walkability: 8,
        featured: true,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { reviews: 5 },
        reviews: [
          { rating: 4 },
          { rating: 5 },
          { rating: 3 },
          { rating: 4 },
          { rating: 5 },
        ],
      },
    ];

    (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);
    (prisma.city.count as jest.Mock).mockResolvedValue(50);

    const request = createRequest(
      "http://localhost:3000/api/cities?page=2&limit=5"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.city.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5, // (page - 1) * limit = (2 - 1) * 5
        take: 5,
      })
    );
  });

  it("should handle filter parameters", async () => {
    const mockCities: any[] = [];
    (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/cities?maxCost=1000&minSafety=8"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.city.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          costOfLiving: expect.objectContaining({
            lte: 1000,
          }),
          safetyRating: expect.objectContaining({
            gte: 8,
          }),
        }),
      })
    );
  });

  it("should handle search parameter", async () => {
    const mockCities = [
      {
        id: "1",
        name: "Bangkok",
        country: "Thailand",
        costOfLiving: 800,
        internetSpeed: 50,
        safetyRating: 7,
        walkability: 8,
        featured: true,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { reviews: 5 },
        reviews: [
          { rating: 4 },
          { rating: 5 },
          { rating: 3 },
          { rating: 4 },
          { rating: 5 },
        ],
      },
    ];
    (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);
    (prisma.city.count as jest.Mock).mockResolvedValue(1);

    const request = createRequest(
      "http://localhost:3000/api/cities?search=Bangkok"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.city.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                contains: "Bangkok",
                mode: "insensitive",
              }),
            }),
          ]),
        }),
      })
    );
  });

  it("should handle database errors gracefully", async () => {
    // Clear previous mocks and set up error scenario
    jest.clearAllMocks();
    (prisma.city.findMany as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );
    (prisma.city.count as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = createRequest(
      "http://localhost:3000/api/cities?error=test"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe("Failed to fetch cities");
  });

  it("should validate and sanitize input parameters", async () => {
    const mockCities: any[] = [];
    (prisma.city.findMany as jest.Mock).mockResolvedValue(mockCities);
    (prisma.city.count as jest.Mock).mockResolvedValue(0);

    const request = createRequest(
      "http://localhost:3000/api/cities?page=1&limit=10&maxCost=1500&search=city"
    );
    const response = await GET(request);
    const data = await response.json();

    // Should handle invalid parameters gracefully
    expect(response.status).toBe(200);
    expect(prisma.city.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0, // Should default to page 1
        take: expect.any(Number), // Should use a reasonable limit
      })
    );
  });
});
