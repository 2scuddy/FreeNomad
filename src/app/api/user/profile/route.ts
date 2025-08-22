import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/data-access/users";
import { validateUpdateUserProfile } from "@/lib/validations/user";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  unauthorizedResponse,
  withErrorHandling,
} from "@/lib/api-response";
import { withApiMiddleware } from "@/lib/api-middleware";
import { ZodError } from "zod";

// PATCH /api/user/profile - Update user profile
export const PATCH = withApiMiddleware(
  withErrorHandling(async (request: NextRequest) => {
    try {
      // Check authentication
      const user = await getCurrentUser();
      if (!user || !user.id) {
        return unauthorizedResponse("Authentication required");
      }

      const body = await request.json();

      // Validate request body
      const validatedData = validateUpdateUserProfile(body);

      // Update user profile
      const updatedUser = await updateUserProfile(user.id, validatedData);

      return successResponse({
        user: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return validationErrorResponse(error);
      }

      console.error("Profile update error:", error);
      return serverErrorResponse("Failed to update profile");
    }
  }),
  {
    methods: ["PATCH"],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // 10 profile updates per 15 minutes
    },
  }
);
