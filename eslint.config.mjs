import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores (must be first)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**",
      "**/*.d.ts",
      "coverage/**",
      "dist/**",
      ".turbo/**",
      "**/*.wasm.js",
      "**/runtime/**",
    ],
  },
  // Extend configurations
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  // Custom rules
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "warn", // Changed to warn
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off", // Disable for generated files
    },
  },
];

export default eslintConfig;
