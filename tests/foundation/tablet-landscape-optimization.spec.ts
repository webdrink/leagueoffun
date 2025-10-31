import { test, expect } from '@playwright/test';

test.describe('Tablet Landscape Optimization Tests', () => {
  test('should display optimized layout for iPad landscape', async ({ page }) => {
    // Set to iPad landscape dimensions
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto('/');
    
    // Wait for framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Check that elements are properly sized for tablet
    const footer = page.locator('[data-testid="game-shell-footer"]');
    await footer.waitFor({ state: 'visible' });
    
    // Verify footer is visible and positioned correctly
    const footerBounds = await footer.boundingBox();
    expect(footerBounds).toBeTruthy();
    expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(820);
    
    // Check if we can navigate to NameBlame mode
    const startButton = page.locator('button:has-text("Spiel starten")');
    if (await startButton.isVisible()) {
      await startButton.waitFor({ state: 'visible' });
      await startButton.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Look for a question screen or player setup
      const questionScreen = page.locator('[data-testid="question-container"]');
      const playerSelection = page.locator('[data-testid="player-selection"]');
      
      if (await questionScreen.isVisible()) {
        // Check question text sizing on tablet
        const questionText = page.locator('[data-testid="question-text"]');
        const textStyles = await questionText.evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight
          };
        });
        
        // Font should be appropriately sized for tablet
        const fontSize = parseFloat(textStyles.fontSize);
        expect(fontSize).toBeGreaterThan(20); // Should be larger than mobile
        expect(fontSize).toBeLessThan(60); // But not too large
      }
      
      if (await playerSelection.isVisible()) {
        // Check player button sizing
        const playerButtons = page.locator('[data-testid^="player-btn-"]');
        const buttonCount = await playerButtons.count();
        
        if (buttonCount > 0) {
          const firstButton = playerButtons.first();
          const buttonBounds = await firstButton.boundingBox();
          
          // Buttons should have adequate touch targets for tablet
          expect(buttonBounds!.height).toBeGreaterThanOrEqual(48);
          expect(buttonBounds!.width).toBeGreaterThanOrEqual(80);
        }
      }
    }
  });

  test('should handle different tablet orientations gracefully', async ({ page }) => {
    // Test both orientations
    const orientations = [
      { width: 1180, height: 820, name: 'landscape' },
      { width: 820, height: 1180, name: 'portrait' }
    ];
    
    for (const orientation of orientations) {
      await page.setViewportSize({ width: orientation.width, height: orientation.height });
      await page.goto('/');
      
      // Wait for framework to load
      await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Check that footer remains visible in both orientations
      const footer = page.locator('[data-testid="game-shell-footer"]');
      await footer.waitFor({ state: 'visible', timeout: 5000 });
      const footerVisible = await footer.isVisible();
      expect(footerVisible).toBe(true);
      
      // Verify no horizontal scrolling
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
      
      console.log(`✅ ${orientation.name} orientation (${orientation.width}x${orientation.height}) working correctly`);
    }
  });

  test('should use improved button colors for better readability', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto('/');
    
    // Wait for framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Look for primary buttons
    const startButton = page.locator('button:has-text("Spiel starten")');
    if (await startButton.isVisible()) {
      // Check button styling
      const buttonStyles = await startButton.evaluate(el => {
        const styles = getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage,
          color: styles.color
        };
      });
      
      // Should use gradient (backgroundImage) or autumn/rust fallback colors
      const hasGradient = buttonStyles.backgroundImage.includes('gradient');
      const hasAutumnBackground = buttonStyles.backgroundColor.includes('rgb(245, 158, 11)') || // autumn-500
                  buttonStyles.backgroundColor.includes('rgb(239, 68, 68)'); // rust-500
      
      expect(hasGradient || hasAutumnBackground).toBe(true);
      
      // Text should be white for good contrast
      expect(buttonStyles.color).toContain('rgb(255, 255, 255)');
    }
  });

  test('should properly scale player selection grid on tablets', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.goto('/');
    
    // Wait for framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Try to get to NameBlame mode with player selection
    const startButton = page.locator('button:has-text("Spiel starten")');
    if (await startButton.isVisible()) {
      await startButton.waitFor({ state: 'visible' });
      await startButton.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Look for player selection interface
      const playerSelection = page.locator('[data-testid="player-selection"]');
      if (await playerSelection.isVisible()) {
        // Check grid layout
        const gridStyles = await playerSelection.evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            display: styles.display,
            gridTemplateColumns: styles.gridTemplateColumns,
            gap: styles.gap
          };
        });
        
        expect(gridStyles.display).toBe('grid');
        
        // Gap should be reasonable for tablet
        const gapValue = parseFloat(gridStyles.gap);
        expect(gapValue).toBeGreaterThan(8); // At least 8px gap
        expect(gapValue).toBeLessThan(32); // But not too large
        
        console.log(`Player selection grid: ${gridStyles.gridTemplateColumns}, gap: ${gridStyles.gap}`);
      }
    }
  });
});