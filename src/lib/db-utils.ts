import { prisma } from "./prisma";
import { Prisma } from "../generated/prisma";

// Database connection utilities
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Transaction wrapper with error handling
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(
        `Database operation failed: ${error.message}`,
        error.code,
        error
      );
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw new DatabaseError(
        "Unknown database error occurred",
        "UNKNOWN_ERROR",
        error
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new DatabaseError(
        "Database validation error",
        "VALIDATION_ERROR",
        error
      );
    }

    throw error;
  }
}

// Safe database operation wrapper
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case "P2002":
          throw new DatabaseError(
            "A record with this information already exists",
            "UNIQUE_CONSTRAINT_VIOLATION",
            error
          );
        case "P2025":
          throw new DatabaseError(
            "Record not found",
            "RECORD_NOT_FOUND",
            error
          );
        case "P2003":
          throw new DatabaseError(
            "Foreign key constraint violation",
            "FOREIGN_KEY_VIOLATION",
            error
          );
        case "P2014":
          throw new DatabaseError(
            "Invalid relation data",
            "INVALID_RELATION",
            error
          );
        default:
          throw new DatabaseError(
            `Database error: ${error.message}`,
            error.code,
            error
          );
      }
    }

    throw error;
  }
}

// Pagination helper
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions,
  where?: any,
  orderBy?: any,
  include?: any
): Promise<PaginationResult<T>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      include,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasMore,
    },
  };
}

// Search helper for text fields
export function createSearchFilter(
  searchTerm: string,
  fields: string[]
): Prisma.StringFilter[] {
  if (!searchTerm.trim()) return [];

  return fields.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: "insensitive" as const,
    },
  }));
}

// Range filter helper
export function createRangeFilter(
  min?: number,
  max?: number
): Prisma.FloatFilter | Prisma.IntFilter | undefined {
  if (min === undefined && max === undefined) return undefined;

  const filter: any = {};
  if (min !== undefined) filter.gte = min;
  if (max !== undefined) filter.lte = max;

  return filter;
}

// Sorting helper
export function createSortOrder(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc"
): any {
  if (!sortBy) return { createdAt: sortOrder };

  return { [sortBy]: sortOrder };
}

// Bulk operation helper
export async function bulkCreate<T>(
  model: any,
  data: T[],
  batchSize: number = 100
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    await model.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

// Soft delete helper (if implementing soft deletes)
export async function softDelete(model: any, id: string): Promise<void> {
  await safeDbOperation(async () => {
    await model.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  });
}

// Restore soft deleted record
export async function restore(model: any, id: string): Promise<void> {
  await safeDbOperation(async () => {
    await model.update({
      where: { id },
      data: { deletedAt: null },
    });
  });
}

// Check if record exists
export async function recordExists(model: any, where: any): Promise<boolean> {
  const count = await model.count({ where });
  return count > 0;
}

// Get record or throw error
export async function getRecordOrThrow<T>(
  model: any,
  where: any,
  include?: any
): Promise<T> {
  const record = await model.findUnique({
    where,
    include,
  });

  if (!record) {
    throw new DatabaseError("Record not found", "RECORD_NOT_FOUND");
  }

  return record;
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      status: "healthy",
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;

    return {
      status: "unhealthy",
      latency,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Connection pool status
export async function getConnectionPoolStatus(): Promise<{
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
}> {
  // Note: This is a simplified version. In production, you might want to
  // implement more sophisticated connection pool monitoring
  try {
    // Simplified connection status - metrics API may not be available in all Prisma versions
    return {
      activeConnections: 1, // Simplified - would need actual pool monitoring
      idleConnections: 0,
      totalConnections: 1,
    };
  } catch (error) {
    return {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
    };
  }
}

// Cleanup function for graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
