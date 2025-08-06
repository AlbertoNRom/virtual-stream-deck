import { expect, test } from '@playwright/test'

// Skip authentication for now and test the home page functionality
test.use({
  storageState: {
    cookies: [],
    origins: []
  }
})

test.describe('Home Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase requests to return no authenticated user (testing home page)
    await page.route('**/*supabase*/**', async route => {
      const url = route.request().url()
      
      if (url.includes('/auth/v1/user')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { user: null },
            error: null
          })
        })
      } else {
        await route.continue()
      }
    })

    // Mock Supabase responses
    await page.route('**/rest/v1/sounds*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'sound-1',
            name: 'Test Sound',
            url: 'https://example.com/sound.mp3',
            user_id: 'test-user-id',
            duration: 5.5,
            tags: ['test'],
            category: 'effects',
            created_at: '2024-01-01T00:00:00Z'
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
            id: 'key-1',
            user_id: 'test-user-id',
            sound_id: 'sound-1',
            position: 0,
            label: 'Test Key',
            color: '#FF5733',
            icon: null,
            hotkey: null,
            created_at: '2024-01-01T00:00:00Z'
          }
        ])
      })
    })
  })

  test('should display home page layout', async ({ page }) => {
    await page.goto('/')
    
    // Check the page title
    const title = await page.title()
    console.log('Page title:', title)
    
    // Check main home page elements using more specific selectors
    await expect(page.locator('h1').getByText('Virtual Stream Deck')).toBeVisible()
    await expect(page.getByText('Professional sound board with customizable hotkeys')).toBeVisible()
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for navigation elements
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should display main features', async ({ page }) => {
    await page.goto('/')
    
    // Check for main feature descriptions
    await expect(page.locator('h1').getByText('Virtual Stream Deck')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Lightning Fast' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Professional Audio' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Fully Customizable' })).toBeVisible()
  })

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.getByText('Professional Sound Board')).toBeVisible()
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('Professional Sound Board')).toBeVisible()
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText('Professional Sound Board')).toBeVisible()
  })

  test('should display proper meta tags for home page', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    const title = await page.title()
    expect(title).toContain('Home')
  })
})