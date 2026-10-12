import { defineConfig, devices } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

dotenv.config();

function resolvePnpm(): string {
  if (process.platform !== "win32") return "pnpm";

  for (const dir of (process.env.PATH ?? "").split(";").filter(Boolean)) {
    for (const name of ["pnpm.exe", "pnpm.cmd"]) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return `"${candidate}"`;
    }
  }

  const packages = process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages")
    : undefined;

  if (packages && existsSync(packages)) {
    for (const entry of readdirSync(packages)) {
      if (!entry.toLowerCase().startsWith("pnpm.pnpm")) continue;
      const candidate = join(packages, entry, "pnpm.exe");
      if (existsSync(candidate)) return `"${candidate}"`;
    }
  }

  return "pnpm";
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `${resolvePnpm()} dev`,
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
