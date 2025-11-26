/**
 * Button Sizing Consistency Tests
 * Tests that buttons across the application have consistent sizing.
 */

import { test, expect } from '@playwright/test';

test.describe('Button Sizing Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to initialize and navigate to a screen with buttons
    await page.waitForSelector('[data-testid="game-shell-footer"]', { timeout: 10000 });
  });

  test('footer buttons should have consistent sizing', async ({ page }) => {
    // Wait for footer to be visible
    const footer = page.locator('[data-testid="game-shell-footer"]');
    await expect(footer).toBeVisible();
    
    // Get all buttons in the footer
    const footerButtons = footer.locator('button');
    const buttonCount = await footerButtons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check each button has consistent minimum dimensions
    for (let i = 0; i < buttonCount; i++) {
      const button = footerButtons.nth(i);
      const boundingBox = await button.boundingBox();
      
      if (boundingBox) {
        // All footer buttons should be at least 44px in height (accessibility standard)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        
        console.log(`Footer button ${i}: ${boundingBox.width}x${boundingBox.height}`);
      }
    }
  });

  test('footer buttons should have similar dimensions', async ({ page }) => {
    const footer = page.locator('[data-testid="game-shell-footer"]');
    const footerButtons = footer.locator('button');
    const buttonCount = await footerButtons.count();
    
    if (buttonCount > 1) {
      const dimensions: Array<{width: number; height: number}> = [];
      
      // Collect dimensions of all buttons
      for (let i = 0; i < buttonCount; i++) {
        const button = footerButtons.nth(i);
        const boundingBox = await button.boundingBox();
        
        if (boundingBox) {
          dimensions.push({
            width: boundingBox.width,
            height: boundingBox.height
          });
        }
      }
      
      // Check that dimensions are within reasonable tolerance (±8px)
      const tolerance = 8;
      const firstDim = dimensions[0];
      
      for (let i = 1; i < dimensions.length; i++) {
        const dim = dimensions[i];
        expect(Math.abs(dim.height - firstDim.height)).toBeLessThanOrEqual(tolerance);
        expect(Math.abs(dim.width - firstDim.width)).toBeLessThanOrEqual(tolerance);
      }
    }
  });

  test('buttons should have proper visual styling', async ({ page }) => {
    const footer = page.locator('[data-testid="game-shell-footer"]');
    const firstButton = footer.locator('button').first();
    
    // Check for consistent styling classes
    const className = await firstButton.getAttribute('class');
    expect(className).toBeTruthy();
    
    // Should have rounded corners
    expect(className).toContain('rounded');
    
    // Should have transition for hover effects
    expect(className).toContain('transition');
    
    // Should have proper padding/sizing
    expect(className).toMatch(/min-h-\[44px\]|min-h-\[36px\]|min-h-\[48px\]/);
  });

  test('dark mode toggle should be properly sized', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    if (await darkModeToggle.count() > 0) {
      const boundingBox = await darkModeToggle.boundingBox();
      
      if (boundingBox) {
        // Dark mode toggle should meet accessibility minimum size
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        
        console.log(`Dark mode toggle: ${boundingBox.width}x${boundingBox.height}`);
      }
    }
  });
});