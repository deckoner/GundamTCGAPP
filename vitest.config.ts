/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["tests/e2e/**/*"], // Exclude E2E tests from Vitest
  },
} as any);
