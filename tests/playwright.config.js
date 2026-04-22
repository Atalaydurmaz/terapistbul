// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// ============================================================
// PRODUCTION DATABASE GUARD
// ------------------------------------------------------------
// Bu test suite'i gerçek Supabase production DB'sine yazar.
// Kazara canlı verilere bulaşmayı engellemek için açık onay ister.
// Test çalıştırmak için:  ALLOW_PROD_DB_TESTS=1 npx playwright test
// ============================================================
if (process.env.ALLOW_PROD_DB_TESTS !== '1' && !process.env.CI) {
  console.error('\n\x1b[31m[TEST GUARD] Bu suite production DB\'ye yazıyor.\x1b[0m');
  console.error('Onaylamak için: \x1b[33mALLOW_PROD_DB_TESTS=1\x1b[0m env var set et.');
  console.error('Örnek (PowerShell):   $env:ALLOW_PROD_DB_TESTS=1; npx playwright test');
  console.error('Örnek (bash):         ALLOW_PROD_DB_TESTS=1 npx playwright test\n');
  process.exit(1);
}

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 15000 },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3654',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
