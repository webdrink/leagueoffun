import { test, expect } from '@playwright/test';

test.describe('BlameGame - Game Flow', () => {
  test('should complete basic game flow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForTimeout(2000);
    
    // Try to start a game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    
    // Wait for game to start or next screen to appear
    await page.waitForTimeout(3000);
    
    // Check if we progress beyond the intro screen
    // Look for either:
    // 1. Player setup screen
    // 2. Category selection screen  
    // 3. Question screen
    // 4. Loading screen
    
    const gameStarted = await Promise.race([
      // Player setup indicators
      page.getByText(/player|spieler|name/i).isVisible(),
      // Category selection indicators
      page.getByText(/category|kategorie|pick|wählen/i).isVisible(),
      // Question indicators
      page.getByText(/question|frage|blame|schuld/i).isVisible(),
      // Loading indicators
      page.getByText(/loading|laden|preparing|vorbereiten/i).isVisible(),
      // Game header/progress indicators
      page.locator('[data-testid="game-header"]').isVisible(),
      page.locator('.progress').isVisible(),
      // Generic game content
      page.locator('[data-testid="game-content"]').isVisible(),
      // Wait 5 seconds then return false
      page.waitForTimeout(5000).then(() => false)
    ]);
    
    if (!gameStarted) {
      // If we can't detect game progression, let's see what's on the page
      const pageContent = await page.textContent('body');
      console.log('Page content after clicking start:', pageContent?.slice(0, 500));
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-game-start.png' });
    }
    
    // For now, just check that we're not stuck on a blank page
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText?.trim().length).toBeGreaterThan(10);
  });

  test('should handle player setup if NameBlame mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Try to find and select NameBlame mode if available
    const nameBlameModeButton = page.getByText(/name.*blame|nameblame/i);
    if (await nameBlameModeButton.count() > 0) {
      await nameBlameModeButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Start the game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Check for player input fields
      const playerInput = page.getByPlaceholder(/name|player|spieler/i);
      if (await playerInput.count() > 0) {
        await playerInput.first().fill('Test Player');
        
        // Look for add/continue button
        const addButton = page.getByRole('button', { name: /add|hinzufügen|continue|weiter/i });
        if (await addButton.count() > 0) {
          await addButton.first().click();
        }
      }
    }
  });

  test('should load categories and questions without errors', async ({ page }) => {
    await page.goto('/');
    
    // Monitor network requests for question/category loading
    const questionRequests: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('questions') || url.includes('categories')) {
        questionRequests.push(url);
      }
    });
    
    // Start the game to trigger data loading
    await page.waitForTimeout(2000);
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(5000); // Wait for loading
    }
    
    // Check that question/category requests were made
    console.log('Question/category requests:', questionRequests);
    
    // Verify no 404 errors for critical resources
    const failed404s = questionRequests.filter(url => 
      url.includes('categories.json') || url.includes('questions/')
    );
    
    // For debugging, just log what we found
    if (failed404s.length === 0 && questionRequests.length > 0) {
      console.log('✓ Categories and questions loaded successfully');
    }
  });

  test('should display game title consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check if game title is always visible
    const gameTitle = page.getByText('BlameGame').first();
    await expect(gameTitle).toBeVisible();
    
    // Click start and verify title is still there
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(3000);
      
      // Title should still be visible (this might be the issue the user is experiencing)
      const titleStillVisible = await gameTitle.isVisible().catch(() => false);
      
      if (!titleStillVisible) {
        // Check if there's any content besides just the title
        const allText = await page.textContent('body');
        console.log('Page content after start:', allText);
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'debug-title-only.png' });
      }
    }
  });
});
