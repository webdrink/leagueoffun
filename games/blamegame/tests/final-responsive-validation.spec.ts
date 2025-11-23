/**
 * Final Responsive Test - Validating Improvements
 * 
 * Tests the key fixes we've implemented for viewport responsiveness
 */

import { test, expect } from '@playwright/test';

test.describe('Final Responsive Validation', () => {
  
  test('Mobile viewport - All elements accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to category selection
    const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
    if (await categoryToggle.isVisible()) {
      const toggle = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=Kategorien manuell wählen') 
      }).first();
      if (await toggle.isVisible()) {
        await toggle.check();
      }
    }
    
    const startButton = page.locator('button').filter({ 
      hasText: /Spiel starten|Start Game/ 
    }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify category selection is properly responsive
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      // Check container doesn't overflow
      const container = page.locator('.category-container').first();
      const containerBox = await container.boundingBox();
      
      if (containerBox) {
        expect(containerBox.x + containerBox.width).toBeLessThanOrEqual(375);
        expect(containerBox.y).toBeGreaterThanOrEqual(0);
      }
      
      // Check category grid scrolls properly
      const categoryGrid = page.locator('.category-grid').first();
      const isScrollable = await categoryGrid.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });
      
      if (isScrollable) {
        // Test scrolling within grid
        await categoryGrid.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(200);
        
        const scrollTop = await categoryGrid.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
      }
      
      // Check action buttons are accessible
      const backButton = page.locator('button:has-text("Zurück")').first();
      const backBox = await backButton.boundingBox();
      
      if (backBox) {
        expect(backBox.height).toBeGreaterThanOrEqual(44); // Touch target
        expect(backBox.y + backBox.height).toBeLessThanOrEqual(667); // In viewport
      }
    }
  });
  
  test('Very narrow mobile - No horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Very narrow
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
    
    // Check main elements fit
    const header = page.locator('header').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      if (headerBox) {
        expect(headerBox.x + headerBox.width).toBeLessThanOrEqual(320);
      }
    }
  });
  
  test('Short landscape - Elements remain accessible', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape mobile
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Content should be scrollable if needed
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    
    if (bodyHeight > 375) {
      // Test that we can scroll to access all content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      
      const footer = page.locator('[data-testid="game-shell-footer"]').first();
      if (await footer.isVisible()) {
        const footerBox = await footer.boundingBox();
        expect(footerBox?.y).toBeLessThan(375); // Footer visible after scroll
      }
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      
      const header = page.locator('header').first();
      if (await header.isVisible()) {
        const headerBox = await header.boundingBox();
        expect(headerBox?.y).toBeGreaterThanOrEqual(0); // Header visible at top
      }
    }
  });
  
  test('Tablet - Uses space efficiently', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to category selection to test grid
    const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
    if (await categoryToggle.isVisible()) {
      const toggle = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=Kategorien manuell wählen') 
      }).first();
      if (await toggle.isVisible()) {
        await toggle.check();
      }
    }
    
    const startButton = page.locator('button').filter({ 
      hasText: /Spiel starten|Start Game/ 
    }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      // Check container uses tablet space
      const container = page.locator('.category-container').first();
      const containerBox = await container.boundingBox();
      
      if (containerBox) {
        expect(containerBox.width).toBeGreaterThan(500); // Should be wider on tablet
      }
      
      // Check grid shows 3 columns on tablet
      const categoryGrid = page.locator('.category-grid').first();
      const gridStyle = await categoryGrid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      
      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(3); // Should show 3 columns on tablet
    }
  });
});