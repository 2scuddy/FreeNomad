"use client";

import useSWR from "swr";
import { CityQuery } from "@/lib/validations/city";
import { ApiResponse } from "@/lib/api-response";

// City data type from API response
interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  imageUrl?: string;
  imageAttribution?: string;
  shortDescription?: string;
  description?: string;
  costOfLiving?: number;
  internetSpeed?: number;
  safetyRating?: number;
  walkability?: number;
  nightlife?: number;
  culture?: number;
  weather?: number;
  averageRating?: number;
  reviewCount?: number;
  featured?: boolean;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CitiesResponse {
  data: City[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<CitiesResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to fetch cities");
  }

  const result: ApiResponse<City[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || "API request failed");
  }

  return {
    data: result.data || [],
    meta: {
      total: result.meta?.total || 0,
      page: result.meta?.page || 1,
      limit: result.meta?.limit || 20,
      hasMore: result.meta?.hasMore || false,
    },
  };
};

// Build query string from parameters
function buildQueryString(params: Partial<CityQuery>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// Hook for fetching cities
export function useCities(query: Partial<CityQuery> = {}) {
  const queryString = buildQueryString(query);
  const url = `/api/cities${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<CitiesResponse>(url, fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    });

  return {
    cities: data?.data || [],
    meta: data?.meta,
    isLoading,
    isValidating,
    error: error?.message,
    refresh: mutate,
  };
}

// Hook for featured cities
export function useFeaturedCities(limit: number = 6) {
  const query: Record<string, string> = {
    featured: "true",
    limit: String(limit),
    sortBy: "createdAt",
    sortOrder: "desc",
  };
  return useCities(query);
}

// Hook for cities by country
export function useCitiesByCountry(country: string) {
  const query: Record<string, string> = {
    country,
    sortBy: "name",
    sortOrder: "asc",
  };
  return useCities(query);
}

// Hook for searching cities
export function useSearchCities(searchTerm: string, limit: number = 20) {
  const query: Record<string, string> = {
    search: searchTerm,
    limit: String(limit),
    sortBy: "name",
    sortOrder: "asc",
  };
  return useCities(query);
}

// Hook with advanced filtering
export function useCitiesWithFilters(filters: {
  search?: string;
  country?: string;
  featured?: boolean;
  verified?: boolean;
  minCost?: number;
  maxCost?: number;
  minInternet?: number;
  minSafety?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const query: Record<string, string | undefined> = {
    search: filters.search,
    country: filters.country,
    featured: filters.featured ? "true" : undefined,
    verified: filters.verified ? "true" : undefined,
    minCost: filters.minCost ? String(filters.minCost) : undefined,
    maxCost: filters.maxCost ? String(filters.maxCost) : undefined,
    minInternet: filters.minInternet ? String(filters.minInternet) : undefined,
    minSafety: filters.minSafety ? String(filters.minSafety) : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder || "desc",
    page: filters.page ? String(filters.page) : "1",
    limit: filters.limit ? String(filters.limit) : "20",
  };

  return useCities(query);
}

// Export types for use in components
export type { City, CitiesResponse };
