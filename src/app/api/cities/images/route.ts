/**
 * API route for fetching and caching city images from Unsplash
 * Implements server-side caching and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { unsplashService } from "@/lib/unsplash";
import { z } from "zod";

// Request validation schema
const imageRequestSchema = z.object({
  cityName: z.string().min(1, "City name is required"),
  countryName: z.string().min(1, "Country name is required"),
  cityId: z.string().optional(),
});

const batchImageRequestSchema = z.object({
  cities: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        country: z.string(),
      })
    )
    .min(1, "At least one city is required")
    .max(20, "Maximum 20 cities per request"),
});

/**
 * GET /api/cities/images
 * Fetch a single city image
 * Query params: cityName, countryName, cityId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = imageRequestSchema.safeParse({
      cityName: searchParams.get("cityName"),
      countryName: searchParams.get("countryName"),
      cityId: searchParams.get("cityId"),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { cityName, countryName } = validationResult.data;

    // Fetch image from Unsplash with caching
    const imageResult = await unsplashService.getCityImage(
      cityName,
      countryName
    );

    if (!imageResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: imageResult.error || "Failed to fetch city image",
          fallback: true,
        },
        { status: 404 }
      );
    }

    // Return successful result with caching headers
    const response = NextResponse.json(
      {
        success: true,
        data: {
          imageUrl: imageResult.imageUrl,
          imageAttribution: imageResult.imageAttribution,
          imageId: imageResult.imageId,
          cityName,
          countryName,
        },
      },
      { status: 200 }
    );

    // Set cache headers for client-side caching
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    response.headers.set("CDN-Cache-Control", "public, s-maxage=86400");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=86400");

    return response;
  } catch (error) {
    console.error("Error in city images API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cities/images
 * Batch fetch multiple city images
 * Body: { cities: [{ id, name, country }] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = batchImageRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { cities } = validationResult.data;

    // Fetch images for all cities
    const imageResults = await unsplashService.getCityImages(cities);

    // Transform results for response
    const responseData = cities.map(city => ({
      cityId: city.id,
      cityName: city.name,
      countryName: city.country,
      ...imageResults[city.id],
    }));

    const successCount = responseData.filter(result => result.success).length;

    const response = NextResponse.json(
      {
        success: true,
        data: responseData,
        summary: {
          total: cities.length,
          successful: successCount,
          failed: cities.length - successCount,
        },
      },
      { status: 200 }
    );

    // Set cache headers for batch requests (shorter cache time)
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    response.headers.set("CDN-Cache-Control", "public, s-maxage=3600");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=3600");

    return response;
  } catch (error) {
    console.error("Error in batch city images API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/cities/images
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
