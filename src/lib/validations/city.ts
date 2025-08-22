import { z } from "zod";

// Base city validation schema
export const citySchema = z.object({
  name: z
    .string()
    .min(1, "City name is required")
    .max(100, "City name must be less than 100 characters")
    .trim(),

  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country name must be less than 100 characters")
    .trim(),

  region: z
    .string()
    .max(100, "Region name must be less than 100 characters")
    .trim()
    .optional(),

  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),

  population: z
    .number()
    .int("Population must be an integer")
    .min(0, "Population cannot be negative")
    .optional(),

  timezone: z
    .string()
    .max(50, "Timezone must be less than 50 characters")
    .optional(),

  // Nomad-specific metrics (1-10 scale or specific ranges)
  costOfLiving: z
    .number()
    .int("Cost of living must be an integer")
    .min(0, "Cost of living cannot be negative")
    .max(10000, "Cost of living seems unrealistic")
    .optional(),

  internetSpeed: z
    .number()
    .min(0, "Internet speed cannot be negative")
    .max(1000, "Internet speed seems unrealistic")
    .optional(),

  safetyRating: z
    .number()
    .min(0, "Safety rating must be between 0 and 10")
    .max(10, "Safety rating must be between 0 and 10")
    .optional(),

  walkability: z
    .number()
    .min(0, "Walkability rating must be between 0 and 10")
    .max(10, "Walkability rating must be between 0 and 10")
    .optional(),

  nightlife: z
    .number()
    .min(0, "Nightlife rating must be between 0 and 10")
    .max(10, "Nightlife rating must be between 0 and 10")
    .optional(),

  culture: z
    .number()
    .min(0, "Culture rating must be between 0 and 10")
    .max(10, "Culture rating must be between 0 and 10")
    .optional(),

  weather: z
    .number()
    .min(0, "Weather rating must be between 0 and 10")
    .max(10, "Weather rating must be between 0 and 10")
    .optional(),

  // Content fields
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim()
    .optional(),

  shortDescription: z
    .string()
    .max(200, "Short description must be less than 200 characters")
    .trim()
    .optional(),

  imageUrl: z.string().url("Image URL must be a valid URL").optional(),

  imageAttribution: z
    .string()
    .max(200, "Image attribution must be less than 200 characters")
    .trim()
    .optional(),

  // Metadata
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
});

// Schema for creating a new city
export const createCitySchema = citySchema;

// Schema for updating a city (all fields optional except id)
export const updateCitySchema = citySchema.partial().extend({
  id: z.string().cuid("Invalid city ID"),
});

// Schema for city query parameters
export const cityQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .refine(val => val > 0, "Page must be greater than 0"),

  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 20))
    .refine(val => val > 0 && val <= 100, "Limit must be between 1 and 100"),

  // Search and filters
  search: z
    .string()
    .max(100, "Search term must be less than 100 characters")
    .trim()
    .optional(),

  country: z
    .string()
    .max(100, "Country filter must be less than 100 characters")
    .trim()
    .optional(),

  featured: z
    .string()
    .transform(val => val === "true")
    .optional(),

  verified: z
    .string()
    .transform(val => val === "true")
    .optional(),

  // Cost range filters
  minCost: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0, "Minimum cost cannot be negative")
    .optional(),

  maxCost: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => val >= 0, "Maximum cost cannot be negative")
    .optional(),

  // Rating filters
  minInternet: z
    .string()
    .transform(val => parseFloat(val))
    .refine(
      val => val >= 0 && val <= 1000,
      "Internet speed filter must be between 0 and 1000"
    )
    .optional(),

  minSafety: z
    .string()
    .transform(val => parseFloat(val))
    .refine(
      val => val >= 0 && val <= 10,
      "Safety rating filter must be between 0 and 10"
    )
    .optional(),

  minWalkability: z
    .string()
    .transform(val => parseFloat(val))
    .refine(
      val => val >= 0 && val <= 10,
      "Walkability filter must be between 0 and 10"
    )
    .optional(),

  // Sorting
  sortBy: z
    .enum([
      "name",
      "country",
      "costOfLiving",
      "internetSpeed",
      "safetyRating",
      "walkability",
      "nightlife",
      "culture",
      "weather",
      "createdAt",
      "updatedAt",
    ])
    .optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for city ID parameter
export const cityIdSchema = z.object({
  id: z.string().cuid("Invalid city ID"),
});

// Schema for bulk city operations
export const bulkCitySchema = z.object({
  cities: z.array(citySchema).min(1, "At least one city is required"),
});

// Schema for city statistics
export const cityStatsSchema = z.object({
  country: z.string().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
});

// Type exports for use in API routes
export type City = z.infer<typeof citySchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
export type CityQuery = z.infer<typeof cityQuerySchema>;
export type CityId = z.infer<typeof cityIdSchema>;
export type BulkCityInput = z.infer<typeof bulkCitySchema>;
export type CityStatsQuery = z.infer<typeof cityStatsSchema>;

// Validation helper functions
export function validateCity(data: unknown): City {
  return citySchema.parse(data);
}

export function validateCreateCity(data: unknown): CreateCityInput {
  return createCitySchema.parse(data);
}

export function validateUpdateCity(data: unknown): UpdateCityInput {
  return updateCitySchema.parse(data);
}

export function validateCityQuery(data: unknown): CityQuery {
  return cityQuerySchema.parse(data);
}

export function validateCityId(data: unknown): CityId {
  return cityIdSchema.parse(data);
}

export function validateBulkCity(data: unknown): BulkCityInput {
  return bulkCitySchema.parse(data);
}

export function validateCityStats(data: unknown): CityStatsQuery {
  return cityStatsSchema.parse(data);
}
