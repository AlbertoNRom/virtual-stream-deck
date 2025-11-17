import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests/e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build if you accidentally left test.only in the source code. */
	forbidOnly: false,
	/* Retry failed tests */
	retries: 1,
	/* Number of parallel workers */
	workers: undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
	},

	/* Configure projects for major browsers */
	projects: [
		// Setup project
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/,
		},
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				// Use signed-in state from setup
				storageState: 'playwright/.auth/user.json',
				// Set custom user agent to identify E2E tests
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36 Playwright-E2E-Test',
			},
			dependencies: ['setup'],
			testIgnore: '**/auth.spec.ts',
		},

		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				// Use signed-in state from setup
				storageState: 'playwright/.auth/user.json',
				// Set custom user agent to identify E2E tests
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36 Playwright-E2E-Test',
			},
			dependencies: ['setup'],
			testIgnore: '**/auth.spec.ts',
		},

		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				// Use signed-in state from setup
				storageState: 'playwright/.auth/user.json',
				// Set custom user agent to identify E2E tests
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36 Playwright-E2E-Test',
			},
			dependencies: ['setup'],
			testIgnore: '**/auth.spec.ts',
		},

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },

		/* Test against branded browsers. */
		// {
		//   name: 'Microsoft Edge',
		//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run dev',
	//   url: 'http://localhost:3000',
	//   reuseExistingServer: true,
	// },
});
