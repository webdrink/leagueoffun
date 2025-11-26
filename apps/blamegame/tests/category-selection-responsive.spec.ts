/**
 * Category Selection Responsive Layout Test
 * Tests the responsiveness and viewport fitting of the category selection screen
 */

import { test, expect } from '@playwright/test';

test.describe('Category Selection Responsive Layout', () => {
  
  test('should properly fit within viewport on different screen sizes', async ({ page }) => {
    // Test multiple viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'Mobile Small (iPhone SE)' },
      { width: 390, height: 844, name: 'Mobile Medium (iPhone 12)' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 1280, height: 720, name: 'Desktop Small' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ];

    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Start the application
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Enable manual category selection
      const categoryToggle = page.getByRole('switch', { name: /kategorie|category/i });
      if (await categoryToggle.count() > 0) {
        const isChecked = await categoryToggle.isChecked();
        if (!isChecked) {
          await categoryToggle.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Start the game to get to category selection
      const startButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we're on the category selection screen
      const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
      const onCategoryScreen = await categoryScreen.count() > 0;
      
      if (onCategoryScreen) {
        // Take screenshot for this viewport
        await page.screenshot({ 
          path: `test-results/category-selection-${viewport.width}x${viewport.height}.png`,
          fullPage: false 
        });
        
        // Test 1: Check that the title is visible
        const title = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
        await expect(title).toBeVisible();
        
        // Test 2: Check that action buttons are visible and not cut off
        const backButton = page.getByRole('button', { name: /zurück|back/i });
        const confirmButton = page.getByRole('button', { name: /starten|start|confirm/i });
        
        await expect(backButton).toBeVisible();
        await expect(confirmButton).toBeVisible();
        
        // Test 3: Verify buttons are within viewport
        const backBoundingBox = await backButton.boundingBox();
        const confirmBoundingBox = await confirmButton.boundingBox();
        
        if (backBoundingBox) {
          expect(backBoundingBox.y + backBoundingBox.height).toBeLessThanOrEqual(viewport.height);
          expect(backBoundingBox.x).toBeGreaterThanOrEqual(0);
        }
        
        if (confirmBoundingBox) {
          expect(confirmBoundingBox.y + confirmBoundingBox.height).toBeLessThanOrEqual(viewport.height);
          expect(confirmBoundingBox.x + confirmBoundingBox.width).toBeLessThanOrEqual(viewport.width);
        }
        
        // Test 4: Check that at least some category items are visible
        const categoryItems = page.locator('label').filter({ hasText: /freunde|familie|arbeit|schule/i });
        const visibleCategories = await categoryItems.count();
        expect(visibleCategories).toBeGreaterThan(0);
        
        // Test 5: Test that category selection works without scrolling issues
        if (visibleCategories > 0) {
          const firstCategory = categoryItems.first();
          await firstCategory.click();
          await page.waitForTimeout(300);
          
          // Check if selection worked (button should be enabled)
          const isConfirmEnabled = await confirmButton.isEnabled();
          expect(isConfirmEnabled).toBe(true);
        }
        
        // Test 6: Verify no horizontal scrollbar
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
        
        console.log(`✅ ${viewport.name}: All layout tests passed`);
      } else {
        console.log(`❌ ${viewport.name}: Category selection screen not found`);
      }
    }
  });
  
  test('should handle small viewport heights gracefully', async ({ page }) => {
    // Test very constrained viewport heights
    const constrainedViewports = [
      { width: 390, height: 600, name: 'Short Mobile' },
      { width: 768, height: 600, name: 'Short Tablet' },
      { width: 1024, height: 600, name: 'Short Desktop' }
    ];

    for (const viewport of constrainedViewports) {
      console.log(`Testing constrained viewport: ${viewport.name}`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Enable category selection and navigate to screen
      const categoryToggle = page.getByRole('switch', { name: /kategorie|category/i });
      if (await categoryToggle.count() > 0) {
        const isChecked = await categoryToggle.isChecked();
        if (!isChecked) {
          await categoryToggle.click();
          await page.waitForTimeout(500);
        }
      }
      
      const startButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Verify essential elements are still accessible
      const backButton = page.getByRole('button', { name: /zurück|back/i });
      const confirmButton = page.getByRole('button', { name: /starten|start|confirm/i });
      
      if (await backButton.count() > 0 && await confirmButton.count() > 0) {
        // Both buttons should be visible even in constrained heights
        await expect(backButton).toBeVisible();
        await expect(confirmButton).toBeVisible();
        
        // Take screenshot to verify layout
        await page.screenshot({ 
          path: `test-results/category-selection-constrained-${viewport.width}x${viewport.height}.png`
        });
        
        console.log(`✅ ${viewport.name}: Constrained height handled correctly`);
      }
    }
  });
  
});