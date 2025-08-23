/**
 * React hook for fetching and caching city images from Unsplash
 * Implements client-side caching and optimistic loading
 */

import { useState, useEffect, useCallback } from "react";
import { CityImageResult } from "@/lib/unsplash";

interface UseCityImageOptions {
  enabled?: boolean;
  fallbackImage?: string;
  priority?: boolean;
}

interface UseCityImageReturn {
  imageUrl: string | null;
  imageAttribution: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

// In-memory cache for client-side image data
const imageCache = new Map<string, CityImageResult & { timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Custom hook to fetch city images with caching
 */
export function useCityImage(
  cityName: string,
  countryName: string,
  options: UseCityImageOptions = {}
): UseCityImageReturn {
  const { enabled = true, fallbackImage, priority = false } = options;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAttribution, setImageAttribution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${cityName}-${countryName}`.toLowerCase();

  const fetchImage = useCallback(async () => {
    if (!enabled || !cityName || !countryName) {
      return;
    }

    // Check cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      if (cached.success) {
        setImageUrl(cached.imageUrl);
        setImageAttribution(cached.imageAttribution);
        setError(null);
      } else {
        setError(cached.error || "Failed to load image");
        setImageUrl(fallbackImage || null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        cityName,
        countryName,
      });

      const response = await fetch(`/api/cities/images?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add priority hint for important images
        ...(priority && { priority: "high" }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const result: CityImageResult = {
          imageUrl: data.data.imageUrl,
          imageAttribution: data.data.imageAttribution,
          imageId: data.data.imageId,
          success: true,
        };

        // Cache the successful result
        imageCache.set(cacheKey, {
          ...result,
          timestamp: Date.now(),
        });

        setImageUrl(result.imageUrl);
        setImageAttribution(result.imageAttribution);
        setError(null);
      } else {
        const errorMessage = data.error || "Failed to fetch image";

        // Cache the error to avoid repeated failed requests
        imageCache.set(cacheKey, {
          imageUrl: "",
          imageAttribution: "",
          imageId: "",
          success: false,
          error: errorMessage,
          timestamp: Date.now(),
        });

        setError(errorMessage);
        setImageUrl(fallbackImage || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      setError(errorMessage);
      setImageUrl(fallbackImage || null);

      // Cache network errors with shorter duration
      imageCache.set(cacheKey, {
        imageUrl: "",
        imageAttribution: "",
        imageId: "",
        success: false,
        error: errorMessage,
        timestamp: Date.now() - CACHE_DURATION * 0.9, // Shorter cache for errors
      });
    } finally {
      setIsLoading(false);
    }
  }, [cityName, countryName, enabled, fallbackImage, priority, cacheKey]);

  const retry = useCallback(() => {
    // Clear cache for this city and retry
    imageCache.delete(cacheKey);
    fetchImage();
  }, [cacheKey, fetchImage]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  return {
    imageUrl,
    imageAttribution,
    isLoading,
    error,
    retry,
  };
}

/**
 * Hook for batch fetching multiple city images
 */
export function useCityImages(
  cities: Array<{ id: string; name: string; country: string }>,
  enabled: boolean = true
) {
  const [images, setImages] = useState<Record<string, CityImageResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!enabled || cities.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cities/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cities }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const imageMap: Record<string, CityImageResult> = {};

        data.data.forEach((item: any) => {
          imageMap[item.cityId] = {
            imageUrl: item.imageUrl,
            imageAttribution: item.imageAttribution,
            imageId: item.imageId,
            success: item.success,
            error: item.error,
          };

          // Cache individual results
          const cacheKey = `${item.cityName}-${item.countryName}`.toLowerCase();
          imageCache.set(cacheKey, {
            ...imageMap[item.cityId],
            timestamp: Date.now(),
          });
        });

        setImages(imageMap);
      } else {
        setError(data.error || "Failed to fetch images");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cities, enabled]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    isLoading,
    error,
    retry: fetchImages,
  };
}

/**
 * Utility function to preload images for better performance
 */
export function preloadCityImage(cityName: string, countryName: string) {
  const cacheKey = `${cityName}-${countryName}`.toLowerCase();

  // Check if already cached
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached);
  }

  // Preload in background
  const params = new URLSearchParams({ cityName, countryName });
  return fetch(`/api/cities/images?${params}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data) {
        const result: CityImageResult = {
          imageUrl: data.data.imageUrl,
          imageAttribution: data.data.imageAttribution,
          imageId: data.data.imageId,
          success: true,
        };

        imageCache.set(cacheKey, {
          ...result,
          timestamp: Date.now(),
        });

        return result;
      }
      return null;
    })
    .catch(() => null);
}

/**
 * Clear the image cache (useful for testing or memory management)
 */
export function clearImageCache() {
  imageCache.clear();
}
