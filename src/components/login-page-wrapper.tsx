"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { loginSchema, type Login } from "@/lib/validations/user";
import { cn } from "@/lib/utils";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Login>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof Login]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: unknown) {
      const fieldErrors: Partial<Login> = {};
      if (error && typeof error === "object" && "errors" in error) {
        const validationError = error as {
          errors?: Array<{ path?: string[]; message: string }>;
        };
        validationError.errors?.forEach(err => {
          if (err.path) {
            fieldErrors[err.path[0] as keyof Login] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        // Provide more specific error messages
        if (result.error === "CredentialsSignin") {
          setErrors({ email: "Invalid email or password. Please check your credentials and try again." });
        } else {
          setErrors({ email: `Authentication failed: ${result.error}` });
        }
      } else if (result?.ok) {
        // Get the updated session
        const session = await getSession();
        if (session) {
          console.log("Sign-in successful, redirecting to:", callbackUrl);
          router.push(callbackUrl);
          router.refresh();
        } else {
          console.error("Session not found after successful sign-in");
          setErrors({ email: "Authentication succeeded but session creation failed. Please try again." });
        }
      } else {
        console.error("Unexpected sign-in result:", result);
        setErrors({ email: "An unexpected error occurred during sign-in. Please try again." });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "A network or server error occurred. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = () => {
    if (error === "CredentialsSignin") {
      return "Invalid email or password. Please try again.";
    }
    if (error === "OAuthAccountNotLinked") {
      return "This email is already associated with another account.";
    }
    if (error) {
      return "An error occurred during authentication.";
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center auth-page px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your FreeNomad account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Development Helper */}
            {process.env.NODE_ENV === "development" && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Test Accounts:</strong><br />
                  Admin: admin@freenomad.com<br />
                  User: sarah.nomad@example.com<br />
                  Password: Password123!
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "transition-colors",
                    errors.email &&
                      "border-destructive focus:border-destructive"
                  )}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={cn(
                      "pr-10 transition-colors",
                      errors.password &&
                        "border-destructive focus:border-destructive"
                    )}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons - Placeholder for future implementation */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                disabled 
                className="w-full h-11 font-medium border-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                disabled 
                className="w-full h-11 font-medium border-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.160 1.219-5.160s-.219-.438-.219-1.085c0-1.016.589-1.775 1.323-1.775.623 0 .924.466.924 1.025 0 .624-.397 1.557-.603 2.441-.171.725.363 1.315 1.077 1.315 1.295 0 2.291-1.364 2.291-3.333 0-1.742-1.252-2.962-3.043-2.962-2.073 0-3.292 1.554-3.292 3.16 0 .625.24 1.295.54 1.659.059.072.068.135.05.209-.055.227-.177.719-.2.82-.03.129-.098.157-.226.095-1.016-.474-1.652-1.963-1.652-3.159 0-2.296 1.668-4.403 4.811-4.403 2.526 0 4.486 1.801 4.486 4.204 0 2.508-1.581 4.529-3.777 4.529-.737 0-1.432-.383-1.67-.838l-.455 1.731c-.164.636-.606 1.435-.903 1.92.68.211 1.402.322 2.165.322 6.619 0 11.986-5.367 11.986-11.987C24.003 5.367 18.636.001 12.017.001z" />
                </svg>
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
