import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  //
  // ────────────────────────────────
  // 1️⃣ Ignored paths (like .eslintignore)
  // ────────────────────────────────
  //
  {
    ignores: [
      "**/build/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
      // TODO: Revisit these sections later so that we can have linting across everything
      "examples/todo-server-tests/features/**",
      "plugins/**",
    ],
  },
  //
  // ────────────────────────────────
  // 2️⃣ Base recommended rules
  // ────────────────────────────────
  //
  js.configs.recommended,
  tseslint.configs.strict,
  //
  // ────────────────────────────────
  // 3️⃣ Import sorting
  // ────────────────────────────────
  //
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  //
  // ────────────────────────────────
  // 3️⃣ TypeScript (General - Base rules)
  // ────────────────────────────────
  //
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-extraneous-class": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  //
  // ────────────────────────────────
  // 8️⃣ Examples directory (relaxed rules)
  // ────────────────────────────────
  //
  {
    files: ["examples/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  //
  // ────────────────────────────────
  // 7️⃣ Test environment (Bun)
  // ────────────────────────────────
  //
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/naming-convention": "off",
    },
  },
]);
