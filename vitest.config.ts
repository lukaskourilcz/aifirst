import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
    reporters: process.env.CI ? ["default"] : ["default"],
  },
  resolve: {
    alias: { "@": new URL("./", import.meta.url).pathname },
  },
});
