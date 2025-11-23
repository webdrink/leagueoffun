/**
 * Quick Responsive Design Validation Test
 * 
 * Tests key responsive improvements made to the BlameGame UI
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Design Validation', () => {
  
  test('Mobile viewport - Basic layout works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check header is visible and properly sized
    const header = page.locator('[data-testid="game-shell-header"], header').first();
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBeLessThan(150); // Should not be too tall on mobile
    }
    
    // Check footer is accessible
    const footer = page.locator('[data-testid="game-shell-footer"], footer').first();
    if (await footer.isVisible()) {
      // Footer should either be in viewport or accessible via scroll
      const footerBox = await footer.boundingBox();
      const viewportHeight = page.viewportSize()!.height;
      
      if (footerBox && footerBox.y > viewportHeight) {
        // If footer is below fold, scroll to it
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(300);
        
        const footerAfterScroll = await footer.boundingBox();
        expect(footerAfterScroll?.y).toBeLessThan(viewportHeight);
      }
    }
    
    // Check no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
  
  test('Desktop viewport - Content is properly centered', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 }); // Standard desktop
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check main content container
    const main = page.locator('main').first();
    if (await main.isVisible()) {
      const mainBox = await main.boundingBox();
      const viewportWidth = page.viewportSize()!.width;
      
      if (mainBox) {
        // Content should be reasonably centered
        const centerX = viewportWidth / 2;
        const contentCenterX = mainBox.x + mainBox.width / 2;
        const centeringTolerance = 100;
        
        expect(Math.abs(contentCenterX - centerX)).toBeLessThan(centeringTolerance);
        
        // Content should not be too wide
        expect(mainBox.width).toBeLessThan(viewportWidth * 0.8);
      }
    }
  });
  
  test('Category selection screen - Responsive grid', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to category selection
    const categoryToggle = page.locator('text=Kategorien manuell wählen').first();
    if (await categoryToggle.isVisible()) {
      // Enable category selection if available
      const toggle = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=Kategorien manuell wählen') 
      }).first();
      if (await toggle.isVisible()) {
        await toggle.check();
      }
    }
    
    // Try to start game to reach category selection
    const startButton = page.locator('button').filter({ 
      hasText: /Spiel starten|Start Game|Mit .* Kategorien starten/ 
    }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check if we're on category selection
    const categoryTitle = page.locator('text=Kategorien auswählen').first();
    if (await categoryTitle.isVisible()) {
      // Check category grid exists and is responsive
      const categoryGrid = page.locator('.grid.grid-cols-2').first();
      if (await categoryGrid.isVisible()) {
        const gridStyle = await categoryGrid.evaluate((el) => {
          return window.getComputedStyle(el).gridTemplateColumns;
        });
        
        // Should have 2 columns on mobile
        const columnCount = gridStyle.split(' ').length;
        expect(columnCount).toBe(2);
        
        // Check that category cards fit properly
        const categoryCards = page.locator('.grid.grid-cols-2 > label');
        const cardCount = await categoryCards.count();
        
        if (cardCount > 0) {
          const firstCard = categoryCards.first();
          const cardBox = await firstCard.boundingBox();
          
          if (cardBox) {
            // Card should not overflow viewport width
            expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
            
            // Card should have reasonable height (not too small, not too large)
            expect(cardBox.height).toBeGreaterThan(60);
            expect(cardBox.height).toBeLessThan(200);
          }
        }
      }
    }
  });
  
  test('Narrow viewport - Still functional', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Very narrow
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check basic functionality
    const title = page.locator('h1').first();
    if (await title.isVisible()) {
      const titleBox = await title.boundingBox();
      if (titleBox) {
        // Title should fit within viewport width
        expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(320);
        
        // Title should still be readable
        expect(titleBox.height).toBeGreaterThan(20);
      }
    }
    
    // Check no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});