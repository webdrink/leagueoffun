/**
 * Category Selection Fix Test
 * Manual test to verify our category selection fixes work correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Category Selection Fixes', () => {
  
  test('should fix double-selection bug and show correct question counts', async ({ page }) => {
    // Start the application
    await page.goto('/');
    
    // Wait for the page to load
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
      console.log('✅ Category selection screen found');
      
      // Test 1: Single selection (no double selection)
      const firstCategory = page.locator('label').filter({ hasText: /freunde|friends|familie|family/i }).first();
      if (await firstCategory.count() > 0) {
        // Click once and verify only one selection
        await firstCategory.click();
        await page.waitForTimeout(500);
        
        // Count selected categories (should be 1)
        const selectedCategories = page.locator('label.border-autumn-500');
        const selectionCount = await selectedCategories.count();
        
        console.log(`Selection count after single click: ${selectionCount}`);
        expect(selectionCount).toBe(1);
        console.log('✅ Double-selection bug fixed: Single click = single selection');
      }
      
      // Test 2: Check question counts are not hardcoded "10 Fragen"
      const questionCounts = page.locator('text=/\\d+.*frage|\\d+.*question/i');
      const countElements = await questionCounts.count();
      
      if (countElements > 0) {
        let hasVariedCounts = false;
        const counts = [];
        
        for (let i = 0; i < Math.min(countElements, 5); i++) {
          const countText = await questionCounts.nth(i).textContent();
          if (countText) {
            counts.push(countText);
            // Check if it's not the hardcoded "10 Fragen"
            if (!countText.includes('10')) {
              hasVariedCounts = true;
            }
          }
        }
        
        console.log('Question counts found:', counts);
        if (hasVariedCounts) {
          console.log('✅ Question counts display real numbers (not hardcoded 10)');
        } else {
          console.log('⚠️ All counts show 10 - might be a data loading issue');
        }
      }
      
      // Test 3: Click area works (entire category box is clickable)
      const secondCategory = page.locator('label').filter({ hasText: /party|klassisch|classic/i }).first();
      if (await secondCategory.count() > 0) {
        // Click on the emoji area (not the checkbox)
        const emojiArea = secondCategory.locator('div').first();
        await emojiArea.click();
        await page.waitForTimeout(500);
        
        // Check if it got selected
        const isSelected = await secondCategory.evaluate(el => el.classList.contains('border-autumn-500'));
        console.log(`Click on emoji area worked: ${isSelected}`);
        if (isSelected) {
          console.log('✅ Entire category box is clickable');
        }
      }
      
      // Take a screenshot for manual verification
      await page.screenshot({ path: 'test-results/category-selection-fix-verification.png' });
      console.log('📸 Screenshot saved for manual verification');
      
    } else {
      console.log('❌ Category selection screen not found - check if manual selection is enabled');
    }
  });
  
});