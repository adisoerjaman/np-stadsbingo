import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e-config. Vereist een draaiende database (docker-compose up -d),
 * een ingevulde .env en geseede testdata (npm run db:seed).
 * Start: npm run test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Start de dev-server automatisch als die nog niet draait.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
