import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  // Ignorar directorios generados
  { ignores: ["build/**", "dist/**", "node_modules/**", "coverage/**", "playwright-report/**", "src/server/**", "scripts/**", "backend/**"] },

  // Base JS + TS strict
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // ── TypeScript estricto — prohibir any ──────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // ── Promesas flotantes — permitir void expr para fire-and-forget ────
      "@typescript-eslint/no-floating-promises": ["error", { "ignoreVoid": true }],

      // ── Variables y imports limpios ─────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-unused-vars": "off", // delegado a la regla de TS

      // ── React ───────────────────────────────────────────────────────────
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",        // No necesario con React 17+
      "react/prop-types": "off",                 // TypeScript ya tipea props
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // ── Buenas prácticas generales ──────────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // Relajar reglas en archivos de configuración/test
  {
    files: ["**/*.config.{js,ts,mjs}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-console": "off",
    },
  }
);
