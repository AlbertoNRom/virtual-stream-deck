import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/')
    
    // Check if the login page elements are present
    await expect(page.locator('h1').getByText('Virtual Stream Deck')).toBeVisible()
    await expect(page.getByText('Professional sound board with customizable hotkeys')).toBeVisible()
    
    // Check for login button
    const loginButton = page.getByRole('button', { name: 'Sign in with Google' })
    await expect(loginButton).toBeVisible()
  })

  test('should show authentication options', async ({ page }) => {
    await page.goto('/')
    
    // Look for the auth button within the card
    const authButton = page.getByRole('button', { name: 'Sign in with Google' })
    await expect(authButton).toBeVisible()
    
    // Check that the auth button is within a card container
    const cardContainer = page.locator('.glassmorphism').filter({ has: authButton })
    await expect(cardContainer).toBeVisible()
  })

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    // Set a different User-Agent to avoid E2E test bypass
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    // Try to access dashboard directly without authentication
    await page.goto('/dashboard')
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1').getByText('Virtual Stream Deck')).toBeVisible()
  })

  test('should display proper meta tags and title', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle('Home - Professional Sound Board & Audio Control')
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Virtual Stream Deck.*professional sound board/i)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if main elements are still visible and properly arranged
    await expect(page.locator('h1').getByText('Virtual Stream Deck')).toBeVisible()
    
    // Check if the auth button is still visible on mobile
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
    
    // Check if main content is visible
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })
})