import { z } from "zod";

// Base user validation schema
export const userSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),

  image: z.string().url("Image URL must be a valid URL").optional(),

  // Profile information
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),

  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional(),

  website: z.string().url("Website must be a valid URL").optional(),

  isAdmin: z.boolean().default(false),
});

// Schema for user registration
export const registerUserSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters")
      .toLowerCase()
      .trim(),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for user login
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),

  password: z.string().min(1, "Password is required"),
});

// Schema for updating user profile
export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),

  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .trim()
    .optional(),

  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .trim()
    .optional(),

  website: z
    .string()
    .url("Website must be a valid URL")
    .or(z.literal(""))
    .optional(),

  image: z
    .string()
    .url("Image URL must be a valid URL")
    .or(z.literal(""))
    .optional(),
});

// Schema for password change
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

// Schema for password reset request
export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

// Schema for password reset
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for user query parameters
export const userQuerySchema = z.object({
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

  location: z
    .string()
    .max(100, "Location filter must be less than 100 characters")
    .trim()
    .optional(),

  isAdmin: z
    .string()
    .transform(val => val === "true")
    .optional(),

  verified: z
    .string()
    .transform(val => val === "true")
    .optional(),

  // Sorting
  sortBy: z
    .enum(["name", "email", "location", "createdAt", "updatedAt"])
    .optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for user ID parameter
export const userIdSchema = z.object({
  id: z.string().cuid("Invalid user ID"),
});

// Schema for admin user operations
export const adminUserUpdateSchema = z
  .object({
    isAdmin: z.boolean(),
    emailVerified: z.date().optional(),
  })
  .merge(updateUserProfileSchema);

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Register schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports for use in API routes
export type User = z.infer<typeof userSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordRequestInput = z.infer<
  typeof resetPasswordRequestSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;

// Validation helper functions
export function validateUser(data: unknown): User {
  return userSchema.parse(data);
}

export function validateRegisterUser(data: unknown): RegisterUserInput {
  return registerUserSchema.parse(data);
}

export function validateLoginUser(data: unknown): LoginUserInput {
  return loginUserSchema.parse(data);
}

export function validateUpdateUserProfile(
  data: unknown
): UpdateUserProfileInput {
  return updateUserProfileSchema.parse(data);
}

export function validateChangePassword(data: unknown): ChangePasswordInput {
  return changePasswordSchema.parse(data);
}

export function validateResetPasswordRequest(
  data: unknown
): ResetPasswordRequestInput {
  return resetPasswordRequestSchema.parse(data);
}

export function validateResetPassword(data: unknown): ResetPasswordInput {
  return resetPasswordSchema.parse(data);
}

export function validateUserQuery(data: unknown): UserQuery {
  return userQuerySchema.parse(data);
}

export function validateUserId(data: unknown): UserId {
  return userIdSchema.parse(data);
}

export function validateAdminUserUpdate(data: unknown): AdminUserUpdateInput {
  return adminUserUpdateSchema.parse(data);
}
