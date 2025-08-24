import "server-only";

import { StackServerApp } from "@stackframe/stack";

// Stack Auth configuration with fallback for CI/CD environments
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  // Use environment variable or fallback for CI/CD builds
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "ci-test-project-id",
});
