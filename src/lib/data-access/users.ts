import { prisma } from "@/lib/prisma";
import { DatabaseError, safeDbOperation } from "@/lib/db-utils";
import {
  validateUserQuery,
  validateUser,
  validateUpdateUserProfile,
} from "@/lib/validations/user";

// Get user profile by ID
export async function getUserProfile(id: string) {
  return safeDbOperation(async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
                country: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate user statistics
    const totalReviews = user._count.reviews;
    const averageRating =
      user.reviews.length > 0
        ? user.reviews.reduce((sum, review) => sum + review.rating, 0) /
          user.reviews.length
        : null;

    // Transform reviews for frontend
    const transformedReviews = user.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      internetRating: review.internetRating,
      costRating: review.costRating,
      safetyRating: review.safetyRating,
      funRating: review.funRating,
      helpful: review.helpful,
      verified: review.verified,
      createdAt: review.createdAt.toISOString(),
      city: review.city,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      location: user.location,
      website: user.website,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      reviews: transformedReviews,
      stats: {
        totalReviews,
        averageRating,
      },
    };
  });
}

// Update user profile
export async function updateUserProfile(id: string, data: any) {
  return safeDbOperation(async () => {
    const validatedData = validateUpdateUserProfile(data);

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        location: validatedData.location,
        website: validatedData.website,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    return user;
  });
}

// Get users with pagination and filtering
export async function getUsers(query: any = {}) {
  return safeDbOperation(async () => {
    const validatedQuery = validateUserQuery(query);
    const { page, limit, search, sortBy, sortOrder } = validatedQuery;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filtering can be added here if needed

    // Build order by clause
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    };
  });
}

// Delete user account
export async function deleteUser(id: string) {
  return safeDbOperation(async () => {
    // Delete user and all related data (cascade)
    await prisma.user.delete({
      where: { id },
    });

    return { success: true };
  });
}

// Get user by email
export async function getUserByEmail(email: string) {
  return safeDbOperation(async () => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return user;
  });
}
