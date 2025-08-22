import { prisma } from "@/lib/prisma";
import { safeDbOperation } from "@/lib/db-utils";

// Get admin dashboard statistics
export async function getAdminStats() {
  return safeDbOperation(async () => {
    const [userStats, cityStats, reviewStats] = await Promise.all([
      // User statistics
      prisma.user.aggregate({
        _count: {
          id: true,
        },
      }),

      // City statistics
      prisma.city.aggregate({
        _count: {
          id: true,
        },
      }),

      // Review statistics
      prisma.review.aggregate({
        _count: {
          id: true,
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    // Get recent activity
    const [recentUsers, recentCities, recentReviews] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),

      prisma.city.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          country: true,
          createdAt: true,
          featured: true,
          verified: true,
        },
      }),

      prisma.review.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
              country: true,
            },
          },
        },
      }),
    ]);

    // Get monthly growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        'users' as type
      FROM "users" 
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 6
    `;

    return {
      overview: {
        totalUsers: userStats._count.id,
        totalCities: cityStats._count.id,
        totalReviews: reviewStats._count.id,
        averageRating: reviewStats._avg.rating || 0,
      },
      recentActivity: {
        users: recentUsers.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        cities: recentCities.map(city => ({
          ...city,
          createdAt: city.createdAt.toISOString(),
        })),
        reviews: recentReviews.map(review => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
        })),
      },
      growth: monthlyGrowth,
    };
  });
}

// Get all users for admin management
export async function getAdminUsers(query: any = {}) {
  return safeDbOperation(async () => {
    const { page = 1, limit = 20, search, role } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
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
      data: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() || null,
      })),
      meta: {
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    };
  });
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
  return safeDbOperation(async () => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      updatedAt: user.updatedAt.toISOString(),
    };
  });
}

// Delete user (admin only)
export async function deleteUserAdmin(userId: string) {
  return safeDbOperation(async () => {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  });
}

// Get all cities for admin management
export async function getAdminCities(query: any = {}) {
  return safeDbOperation(async () => {
    const { page = 1, limit = 20, search, featured, verified } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (verified !== undefined) {
      where.verified = verified;
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      prisma.city.count({ where }),
    ]);

    return {
      data: cities.map(city => ({
        ...city,
        createdAt: city.createdAt.toISOString(),
        updatedAt: city.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    };
  });
}

// Toggle city featured status
export async function toggleCityFeaturedAdmin(cityId: string) {
  return safeDbOperation(async () => {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      select: { featured: true },
    });

    if (!city) {
      throw new Error("City not found");
    }

    const updatedCity = await prisma.city.update({
      where: { id: cityId },
      data: { featured: !city.featured },
      select: {
        id: true,
        name: true,
        featured: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedCity,
      updatedAt: updatedCity.updatedAt.toISOString(),
    };
  });
}

// Toggle city verified status
export async function toggleCityVerifiedAdmin(cityId: string) {
  return safeDbOperation(async () => {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      select: { verified: true },
    });

    if (!city) {
      throw new Error("City not found");
    }

    const updatedCity = await prisma.city.update({
      where: { id: cityId },
      data: { verified: !city.verified },
      select: {
        id: true,
        name: true,
        verified: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedCity,
      updatedAt: updatedCity.updatedAt.toISOString(),
    };
  });
}
