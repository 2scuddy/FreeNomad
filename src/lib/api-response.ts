import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

// Success response helper
export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>["meta"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

// Error response helper
export function errorResponse(
  message: string,
  statusCode: number = 400,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

// Validation error response helper
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiResponse> {
  const details = error.issues.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details,
      },
    },
    { status: 400 }
  );
}

// Not found response helper
export function notFoundResponse(
  resource: string = "Resource"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: `${resource} not found`,
        code: "NOT_FOUND",
      },
    },
    { status: 404 }
  );
}

// Unauthorized response helper
export function unauthorizedResponse(
  message: string = "Unauthorized access"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "UNAUTHORIZED",
      },
    },
    { status: 401 }
  );
}

// Forbidden response helper
export function forbiddenResponse(
  message: string = "Access forbidden"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "FORBIDDEN",
      },
    },
    { status: 403 }
  );
}

// Internal server error response helper
export function serverErrorResponse(
  message: string = "Internal server error",
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "INTERNAL_ERROR",
        ...(details && { details }),
      },
    },
    { status: 500 }
  );
}

// Rate limit response helper
export function rateLimitResponse(
  message: string = "Rate limit exceeded"
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: "RATE_LIMIT_EXCEEDED",
      },
    },
    { status: 429 }
  );
}

// Paginated response helper
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<ApiResponse<T[]>> {
  const hasMore = page * limit < total;

  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      hasMore,
    },
  });
}

// Handle async API route with error catching
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }

      if (error instanceof Error) {
        return serverErrorResponse(error.message);
      }

      return serverErrorResponse("An unexpected error occurred");
    }
  };
}
