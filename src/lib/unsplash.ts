/**
 * Unsplash API service for fetching city images
 * Implements caching and error handling for optimal performance
 */

import { unstable_cache } from "next/cache";

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

interface CityImageResult {
  imageUrl: string;
  imageAttribution: string;
  imageId: string;
  success: boolean;
  error?: string;
}

class UnsplashService {
  private readonly accessKey: string;
  private readonly baseUrl = "https://api.unsplash.com";
  private readonly defaultParams = {
    per_page: "5",
    orientation: "landscape",
    content_filter: "high",
  };

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || "";

    if (!this.accessKey) {
      console.warn(
        "UNSPLASH_ACCESS_KEY not configured. City images will use fallbacks."
      );
    }
  }

  /**
   * Search for city images with caching
   * Cache duration: 24 hours for production, 1 hour for development
   */
  private searchImages = unstable_cache(
    async (query: string): Promise<UnsplashSearchResponse | null> => {
      if (!this.accessKey) {
        return null;
      }

      try {
        const searchParams = new URLSearchParams({
          query,
          ...this.defaultParams,
        });

        const response = await fetch(
          `${this.baseUrl}/search/photos?${searchParams}`,
          {
            headers: {
              Authorization: `Client-ID ${this.accessKey}`,
              "Accept-Version": "v1",
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000), // 10 seconds
          }
        );

        if (!response.ok) {
          console.error(
            `Unsplash API error: ${response.status} ${response.statusText}`
          );
          return null;
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching from Unsplash:", error);
        return null;
      }
    },
    ["unsplash-search"],
    {
      revalidate: process.env.NODE_ENV === "production" ? 86400 : 3600, // 24h prod, 1h dev
      tags: ["unsplash"],
    }
  );

  /**
   * Get optimized image URL for a city
   * Implements intelligent search terms and fallbacks
   */
  async getCityImage(
    cityName: string,
    countryName: string
  ): Promise<CityImageResult> {
    if (!this.accessKey) {
      return {
        imageUrl: "",
        imageAttribution: "",
        imageId: "",
        success: false,
        error: "Unsplash API not configured",
      };
    }

    try {
      // Create search queries with fallbacks
      const searchQueries = [
        `${cityName} ${countryName} skyline`,
        `${cityName} ${countryName} cityscape`,
        `${cityName} ${countryName} architecture`,
        `${cityName} ${countryName}`,
        `${countryName} city`,
      ];

      // Try each search query until we find results
      for (const query of searchQueries) {
        const searchResult = await this.searchImages(query);

        if (searchResult && searchResult.results.length > 0) {
          const image = searchResult.results[0]; // Get the first (most relevant) result

          return {
            imageUrl: image.urls.regular,
            imageAttribution: `Photo by ${image.user.name} on Unsplash`,
            imageId: image.id,
            success: true,
          };
        }
      }

      // No results found for any query
      return {
        imageUrl: "",
        imageAttribution: "",
        imageId: "",
        success: false,
        error: "No suitable images found",
      };
    } catch (error) {
      console.error(`Error getting city image for ${cityName}:`, error);
      return {
        imageUrl: "",
        imageAttribution: "",
        imageId: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Batch fetch images for multiple cities
   * Implements rate limiting and error handling
   */
  async getCityImages(
    cities: Array<{ name: string; country: string; id: string }>
  ): Promise<Record<string, CityImageResult>> {
    const results: Record<string, CityImageResult> = {};

    // Process cities in batches to respect rate limits
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < cities.length; i += batchSize) {
      batches.push(cities.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async city => {
        const result = await this.getCityImage(city.name, city.country);
        return { cityId: city.id, result };
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(promiseResult => {
        if (promiseResult.status === "fulfilled") {
          const { cityId, result } = promiseResult.value;
          results[cityId] = result;
        }
      });

      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return results;
  }

  /**
   * Preload images for better performance
   * Can be used in background jobs or during build time
   */
  async preloadCityImages(
    cities: Array<{ name: string; country: string; id: string }>
  ) {
    console.log(`Preloading images for ${cities.length} cities...`);

    const results = await this.getCityImages(cities);
    const successCount = Object.values(results).filter(r => r.success).length;

    console.log(
      `Successfully preloaded ${successCount}/${cities.length} city images`
    );
    return results;
  }
}

// Export singleton instance
export const unsplashService = new UnsplashService();

// Export types for use in other modules
export type { CityImageResult, UnsplashImage };
