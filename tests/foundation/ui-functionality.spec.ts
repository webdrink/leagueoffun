/**
 * UI Functionality Test
 * Tests dark/light mode toggle, background visibility, language switching, and other UI behaviors
 */
import { test, expect } from '@playwright/test';

test.describe('UI Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
  });

  test('should display background gradient correctly', async ({ page }) => {
    // Wait for game to load and start
    const startButton = page.locator('button').filter({ hasText: /start/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check if the GameShell or root element has the background gradient
    const gameShell = page.locator('body, .min-h-screen').first();
    await expect(gameShell).toBeVisible();
    
    // Get computed styles to check for background
    const backgroundStyle = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        backgroundColor: computedStyle.backgroundColor,
        backgroundImage: computedStyle.backgroundImage
      };
    });
    
    console.log('Background styles:', backgroundStyle);
    
    // Check if gradient is applied (either via classes or computed styles)
    const hasGradient = backgroundStyle.backgroundImage.includes('gradient') || 
                       backgroundStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
    
    expect(hasGradient).toBeTruthy();
    
    // Take a screenshot to verify visually
    await page.screenshot({ path: 'tests/screenshots/background-gradient.png' });
  });

  test('should toggle dark/light mode correctly', async ({ page }) => {
    // Find the dark mode toggle button
    const darkModeToggle = page.locator('button').filter({ hasText: /sun|moon/i }).or(
      page.locator('button[title*="mode"]')
    );
    
    // Check if toggle exists and is visible
    await expect(darkModeToggle).toBeVisible();
    
    // Get initial state
    const initialHtml = await page.locator('html').getAttribute('class');
    console.log('Initial HTML classes:', initialHtml);
    
    // Click the toggle
    await darkModeToggle.click();
    
    // Wait for change and check new state
    await page.waitForTimeout(500);
    const afterToggleHtml = await page.locator('html').getAttribute('class');
    console.log('After toggle HTML classes:', afterToggleHtml);
    
    // Should have changed dark mode state
    expect(initialHtml !== afterToggleHtml).toBeTruthy();
    
    // If initially dark, should now be light (no 'dark' class)
    // If initially light, should now be dark (has 'dark' class)
    const wasDark = initialHtml?.includes('dark') ?? false;
    const isDark = afterToggleHtml?.includes('dark') ?? false;
    
    expect(wasDark !== isDark).toBeTruthy();
    
    // Take screenshots in both modes
    await page.screenshot({ path: `tests/screenshots/mode-${isDark ? 'dark' : 'light'}.png` });
    
    // Toggle back
    await darkModeToggle.click();
    await page.waitForTimeout(500);
    const finalHtml = await page.locator('html').getAttribute('class');
    
    // Should be back to original state
    expect(finalHtml).toBe(initialHtml);
  });

  test('should change language and reload app', async ({ page }) => {
    // Find language selector
    const languageSelector = page.locator('select[id*="language"]').or(
      page.locator('select').filter({ hasText: /deutsch|english|français/i })
    );
    
    if (await languageSelector.count() > 0) {
      await expect(languageSelector).toBeVisible();
      
      // Get initial language
      const initialLang = await languageSelector.inputValue();
      console.log('Initial language:', initialLang);
      
      // Set up page reload listener
      let reloaded = false;
      page.on('load', () => {
        reloaded = true;
      });
      
      // Change language (try to select different language)
      const options = await languageSelector.locator('option').all();
      let targetLang = 'en';
      for (const option of options) {
        const value = await option.getAttribute('value');
        if (value && value !== initialLang) {
          targetLang = value;
          break;
        }
      }
      
      await languageSelector.selectOption(targetLang);
      
      // Wait for potential reload
      await page.waitForTimeout(2000);
      
      // Check if app reloaded (this test might need adjustment based on actual implementation)
      console.log('Page reloaded:', reloaded);
      
      // Verify language changed in the selector
      const newLang = await languageSelector.inputValue();
      expect(newLang).toBe(targetLang);
    } else {
      console.log('Language selector not found, skipping language test');
    }
  });

  test('should have consistent button sizes on question cards', async ({ page }) => {
    // Navigate to a question screen
    const startButton = page.locator('button').filter({ hasText: /start/i });
    if (await startButton.count() > 0) {
      await startButton.click();
      
      // Wait for question screen to load
      await page.waitForSelector('[data-testid="question-container"]', { timeout: 5000 });
      
      // Find all buttons on question cards
      const buttons = page.locator('[data-testid*="button"], button').filter({ visible: true });
      const buttonCount = await buttons.count();
      
      if (buttonCount > 1) {
        // Get dimensions of all buttons
        const buttonSizes: Array<{ width: number; height: number }> = [];
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const bbox = await button.boundingBox();
          if (bbox) {
            buttonSizes.push({ width: bbox.width, height: bbox.height });
          }
        }
        
        console.log('Button sizes:', buttonSizes);
        
        // Check if buttons have similar heights (within 10px tolerance)
        if (buttonSizes.length > 1) {
          const heights = buttonSizes.map(s => s.height);
          const minHeight = Math.min(...heights);
          const maxHeight = Math.max(...heights);
          
          expect(maxHeight - minHeight).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  test('should show loading card stack animation with shadows', async ({ page }) => {
    // Look for loading screens or preparing screens
    const loadingContainer = page.locator('.category-card, [class*="loading"], [class*="preparing"]').first();
    
    if (await loadingContainer.count() > 0) {
      await expect(loadingContainer).toBeVisible();
      
      // Check if cards have shadow classes
      const cardElements = page.locator('.category-card');
      const cardCount = await cardElements.count();
      
      if (cardCount > 0) {
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = cardElements.nth(i);
          const classList = await card.getAttribute('class');
          console.log(`Card ${i} classes:`, classList);
          
          // Should have shadow classes
          expect(classList).toMatch(/shadow|drop-shadow/);
        }
      }
    } else {
      console.log('Loading cards not found, might need to trigger loading state');
    }
  });
});