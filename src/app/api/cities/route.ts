import { NextRequest } from "next/server";
import { getCities } from "@/lib/data-access/cities";
import { validateCityQuery } from "@/lib/validations/city";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
  paginatedResponse,
  withErrorHandling,
} from "@/lib/api-response";
import { withApiMiddleware } from "@/lib/api-middleware";
import { withCache } from "@/lib/api-cache";
import { ZodError } from "zod";

// GET /api/cities - Get cities with filtering and pagination
export const GET = withApiMiddleware(
  withCache({
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
    tags: ["cities"],
    vary: ["Accept-Encoding"],
  })(
    withErrorHandling(async (request: NextRequest) => {
      try {
        // Extract and validate query parameters
        const searchParams = Object.fromEntries(
          request.nextUrl.searchParams.entries()
        );
        const query = validateCityQuery(searchParams);

        // Fetch cities with the validated query
        const result = await getCities(query);

        // Return paginated response
        return paginatedResponse(
          result.data,
          result.meta.total,
          result.meta.page,
          result.meta.limit
        );
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }

        console.error("Error fetching cities:", error);
        return serverErrorResponse("Failed to fetch cities");
      }
    })
  ),
  {
    methods: ["GET"],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200, // 200 requests per 15 minutes
    },
  }
);
