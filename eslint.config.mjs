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
      "public/sw.js",
      "**/*.min.js",
      "test-results/**",
      "playwright-report/**",
      "tests/automation/framework/**",
      "tests/automation/monitoring/**",
      "tests/automation/reporting/**",
    ],
  },
  // Extend configurations
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  // Custom rules for source files
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Rules for test and config files
  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "tests/**/*.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "jest.*.js",
      "*.config.{js,mjs}",
    ],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];

export default eslintConfig;
