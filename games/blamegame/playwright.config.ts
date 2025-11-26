import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Timeout for each test */
    actionTimeout: 10000,
    
    /* Timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Global test timeout */
  timeout: 60000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'foundation-tests',
      testMatch: /foundation\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'classic-mode-flows',
      testMatch: /flows\/classic-mode\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },
    
    {
      name: 'nameblame-mode-flows',
      testMatch: /flows\/nameblame-mode\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },
    
    {
      name: 'component-tests',
      testMatch: /components\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },

    {
      name: 'edge-cases',
      testMatch: /edge-cases\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },

    {
      name: 'performance-tests',
      testMatch: /performance\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },

    {
      name: 'cross-browser-firefox',
      testMatch: /flows\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['foundation-tests'],
    },

    {
      name: 'cross-browser-webkit',
      testMatch: /flows\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['foundation-tests'],
    },

    /* Mobile testing */
    {
      name: 'mobile-chrome',
      testMatch: /flows\/.*\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
      dependencies: ['foundation-tests'],
    },
    
    {
      name: 'mobile-safari',
      testMatch: /flows\/.*\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
      dependencies: ['foundation-tests'],
    },

    /* Accessibility testing */
    {
      name: 'accessibility-tests',
      testMatch: /accessibility\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },

    {
      name: 'fixes-tests',
      testMatch: /fixes\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['foundation-tests'],
    },

    /* Visual regression tests */
    {
      name: 'visual-tests',
      testMatch: /visual\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    /* E2E game flow tests */
    {
      name: 'e2e-tests',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    /* Legacy browser support (optional) */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //   testMatch: /flows\/.*\.spec\.ts/,
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
