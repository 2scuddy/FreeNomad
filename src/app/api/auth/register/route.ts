import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/user";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/api-response";
import { withApiMiddleware } from "@/lib/api-middleware";
import { ZodError } from "zod";

// POST /api/auth/register - Register a new user
export const POST = withApiMiddleware(
  withErrorHandling(async (request: NextRequest) => {
    try {
      const body = await request.json();

      // Validate request body
      const validatedData = registerSchema.parse(body);
      const { name, email, password } = validatedData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return errorResponse("User with this email already exists", 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return successResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Account created successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }

      console.error("Registration error:", error);
      return serverErrorResponse("Failed to create account");
    }
  }),
  {
    methods: ["POST"],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 registration attempts per 15 minutes
    },
  }
);
