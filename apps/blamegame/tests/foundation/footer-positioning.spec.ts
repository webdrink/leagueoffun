import { test, expect } from '@playwright/test';

test.describe('Footer Positioning Tests', () => {
  test('footer should remain visible and positioned correctly across different screens', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Test 1: Footer should be visible on intro screen
    const footer = page.locator('[data-testid="game-shell-footer"]');
    await footer.waitFor({ state: 'visible', timeout: 5000 });
    const footerOnIntro = await footer.isVisible();
    expect(footerOnIntro).toBe(true);
    
    // Get viewport height and footer position on intro
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const footerBoundsIntro = await footer.boundingBox();
    
    expect(footerBoundsIntro).toBeTruthy();
    expect(footerBoundsIntro!.y + footerBoundsIntro!.height).toBeLessThanOrEqual(viewportHeight);
    
    // Test 2: Click "Manual Category Selection" to go to category screen
    const manualCategoryButton = page.locator('button:has-text("Manuelle Kategorieauswahl")');
    if (await manualCategoryButton.isVisible()) {
      await manualCategoryButton.click();
      
      // Wait for category screen to load
      await page.waitForSelector('.category-container', { timeout: 5000 });
      
      // Footer should still be visible on category screen
      const footerOnCategory = await footer.isVisible();
      expect(footerOnCategory).toBe(true);
      
      // Footer should still be within viewport
      const footerBoundsCategory = await footer.boundingBox();
      expect(footerBoundsCategory).toBeTruthy();
      expect(footerBoundsCategory!.y + footerBoundsCategory!.height).toBeLessThanOrEqual(viewportHeight);
      
      // Category grid should be scrollable, not the entire page
      const categoryGrid = await page.locator('.category-grid');
      const categoryGridScrollable = await categoryGrid.evaluate(el => {
        return el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto';
      });
      expect(categoryGridScrollable).toBe(true);
      
      // Body should not be scrollable
      const bodyScrollable = await page.evaluate(() => {
        const body = document.body;
        return body.scrollHeight > body.clientHeight && getComputedStyle(body).overflow !== 'hidden';
      });
      expect(bodyScrollable).toBe(false);
    }
  });

  test('footer should remain visible on narrow mobile viewports', async ({ page }) => {
    // Set to narrow mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for the framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const footer = page.locator('[data-testid="game-shell-footer"]');
    await footer.waitFor({ state: 'visible', timeout: 5000 });
    const footerVisible = await footer.isVisible();
    expect(footerVisible).toBe(true);
    
    // Footer should be within viewport
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const footerBounds = await footer.boundingBox();
    
    expect(footerBounds).toBeTruthy();
    expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(viewportHeight);
  });

  test('footer should remain visible on very tall desktop viewports', async ({ page }) => {
    // Set to tall desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Wait for the framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const footer = page.locator('[data-testid="game-shell-footer"]');
    await footer.waitFor({ state: 'visible', timeout: 5000 });
    const footerVisible = await footer.isVisible();
    expect(footerVisible).toBe(true);
    
    // Footer should be at the bottom of the viewport
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const footerBounds = await footer.boundingBox();
    
    expect(footerBounds).toBeTruthy();
    expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(viewportHeight);
  });

  test('page should not scroll vertically', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the framework to load
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check that body/html have no vertical scrollbar
    const hasVerticalScroll = await page.evaluate(() => {
      return document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasVerticalScroll).toBe(false);
    
    // Try to scroll the page and verify it doesn't move
    const initialScrollTop = await page.evaluate(() => document.documentElement.scrollTop);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    const afterScrollTop = await page.evaluate(() => document.documentElement.scrollTop);
    
    expect(afterScrollTop).toBe(initialScrollTop);
  });
});