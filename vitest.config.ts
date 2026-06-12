/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "build", "dist", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/app/stores/**/*.ts",
        "src/app/hooks/taskTypes.ts",
        "src/app/pages/Landing.tsx",
        "src/app/pages/Login.tsx",
        "src/app/pages/Register.tsx",
        "src/app/pages/Dashboard.tsx",
      ],
      exclude: [
        // axios.ts es infraestructura de red — sus interceptores requieren
        // un servidor HTTP real para testearse; se excluye del threshold
        "src/app/lib/axios.ts",
        "src/app/components/ui/**",
        "src/app/components/figma/**",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "dist/**",
        "build/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
