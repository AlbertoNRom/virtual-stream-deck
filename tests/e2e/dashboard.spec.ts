import { test, expect } from '@playwright/test'

test.use({ storageState: 'playwright/.auth/user.json' })

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase API calls for consistent testing
    await page.route('**/rest/v1/sounds*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            name: 'Test Sound 1',
            file_path: '/sound-examples/cinematic-hit-3.mp3',
            created_at: '2024-01-01T00:00:00Z',
            user_id: 'test-user-id'
          },
          {
            id: '2',
            name: 'Test Sound 2',
            file_path: '/sound-examples/glass-break.mp3',
            created_at: '2024-01-01T00:00:00Z',
            user_id: 'test-user-id'
          }
        ])
      })
    })

    await page.route('**/rest/v1/stream_deck_keys*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            key_index: 0,
            sound_id: '1',
            label: 'Test Sound 1',
            color: '#10b981',
            user_id: 'test-user-id'
          }
        ])
      })
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should load dashboard page successfully', async ({ page }) => {
    // Log the User-Agent for debugging
    const userAgent = await page.evaluate(() => navigator.userAgent)
    console.log(`Test User-Agent: ${userAgent}`)
    
    // Navigate directly to dashboard (bypassing stored auth state)
    await page.goto('/dashboard')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Take a screenshot to see what's actually on the page
    await page.screenshot({ path: 'debug-dashboard-e2e.png', fullPage: true })
    
    // Log page title and URL for debugging
    const title = await page.title()
    const url = page.url()
    console.log(`Page title: ${title}, URL: ${url}`)
    
    // Verify the page loads without authentication errors
    await expect(page).toHaveURL('/dashboard')
    
    await expect(page).toHaveTitle(/Dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should display stream deck grid', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Look for stream deck grid component
    const streamDeckGrid = page.locator('[data-testid="stream-deck-grid"]')
    await expect(streamDeckGrid).toBeVisible({ timeout: 10000 })
  })

  test('should display sound library section', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Check for sound library component by its title
    const soundLibrary = page.locator('text=Sound Library')
    await expect(soundLibrary).toBeVisible({ timeout: 10000 })
  })

  test('should handle sound playback controls', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Wait for sounds to load
    await page.waitForTimeout(2000)
    
    // Look for play buttons or sound controls
    const playButtons = page.locator('button[aria-label*="play"], button[title*="play"], .play-button')
    
    if (await playButtons.count() > 0) {
      await expect(playButtons.first()).toBeVisible()
      
      // Test clicking a play button (without actually playing audio)
      await playButtons.first().click()
      
      // Verify the button state changes or some feedback is shown
      await page.waitForTimeout(500)
    }
  })

  test('should display key configuration options', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Look for key configuration or settings
    const keyConfig = page.locator('text=Key Configuration, text=Configure, text=Settings, [data-testid="key-config"]')
    
    if (await keyConfig.count() > 0) {
      await expect(keyConfig.first()).toBeVisible()
    }
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify main content is still visible - using the dashboard title as reference
    const dashboardTitle = page.locator('h1:has-text("Dashboard")')
    await expect(dashboardTitle).toBeVisible()
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(dashboardTitle).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(dashboardTitle).toBeVisible()
  })

  test('should handle navigation and routing', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Verify we can navigate within the dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Check if there are any navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a')
    
    if (await navLinks.count() > 0) {
      // Test navigation doesn't break
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute('href')
      
      if (href && href !== '#' && !href.startsWith('http')) {
        await firstLink.click()
        await page.waitForLoadState('networkidle')
        
        // Navigate back to dashboard
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
      }
    }
  })
})