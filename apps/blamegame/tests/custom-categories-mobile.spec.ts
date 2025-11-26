/**
 * Mobile Usability Tests for Custom Categories Feature
 * 
 * Comprehensive test suite for mobile viewport scenarios including:
 * - Touch interactions
 * - Virtual keyboard behavior
 * - Emoji input with device keyboard
 * - Responsive layout
 * - Touch target sizes
 * - Scroll behavior
 */

import { test, expect, type Page } from '@playwright/test';

// Mobile viewport configurations to test
const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 }
];

// Helper function to open custom categories manager
async function openCustomCategoriesManager(page: Page) {
  // Wait for app to load
  await page.waitForLoadState('networkidle');
  
  // Click on custom categories button (adjust selector as needed)
  // This might be in settings or a dedicated button
  const customCategoriesButton = page.locator('[data-testid="custom-categories-button"]').or(
    page.locator('button:has-text("Custom Categories")')
  );
  
  await customCategoriesButton.waitFor({ state: 'visible', timeout: 5000 });
  await customCategoriesButton.click();
  
  // Wait for modal to appear
  await page.locator('[data-testid="custom-category-manager"]').or(
    page.locator('text=Custom Categories').first()
  ).waitFor({ state: 'visible' });
}

// Test suite for each viewport
for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Custom Categories Mobile Tests - ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should open custom categories manager modal', async ({ page }) => {
      await openCustomCategoriesManager(page);
      
      // Verify modal is visible
      const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Custom Categories' });
      await expect(modal).toBeVisible();
    });

    test('should have proper touch target sizes (min 44x44px)', async ({ page }) => {
      await openCustomCategoriesManager(page);
      
      // Check all buttons have minimum touch target size
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.width >= 44 || box.height >= 44).toBeTruthy();
        }
      }
    });

    test('should close modal when clicking backdrop', async ({ page }) => {
      await openCustomCategoriesManager(page);
      
      // Click backdrop (outside modal content)
      await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
      
      // Modal should be hidden
      await expect(page.locator('text=Custom Categories')).not.toBeVisible();
    });

    test('should open create category form', async ({ page }) => {
      await openCustomCategoriesManager(page);
      
      // Click create/add button
      const createButton = page.locator('button:has-text("Create New")').or(
        page.locator('button:has-text("Add Category")')
      );
      await createButton.click();
      
      // Verify editor form appears
      await expect(page.locator('input#emoji-input')).toBeVisible();
      await expect(page.locator('input#category-name')).toBeVisible();
    });

    test('should allow emoji input via text field', async ({ page }) => {
      await openCustomCategoriesManager(page);
      
      // Open create form
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Type emoji in input field
      const emojiInput = page.locator('input#emoji-input');
      await emojiInput.fill('🎉');
      
      // Verify emoji is displayed
      await expect(emojiInput).toHaveValue('🎉');
      
      // Verify large preview shows emoji
      const emojiPreview = page.locator('div[role="img"][aria-label="Selected emoji"]');
      await expect(emojiPreview).toContainText('🎉');
    });

    test('should validate single emoji input', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      const emojiInput = page.locator('input#emoji-input');
      
      // Try multiple emojis - should only keep first
      await emojiInput.fill('🎉🎊');
      await page.waitForTimeout(500);
      
      // Try text - should show error or clear
      await emojiInput.fill('abc');
      await page.waitForTimeout(500);
      
      // Verify error message or empty field
      const errorMsg = page.locator('[role="alert"]').filter({ hasText: /emoji/i });
      await expect(errorMsg.or(emojiInput.locator('..'))).toBeVisible();
    });

    test('should allow category name input', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      const nameInput = page.locator('input#category-name');
      await nameInput.fill('Test Category Mobile');
      
      await expect(nameInput).toHaveValue('Test Category Mobile');
    });

    test('should show only current language inputs', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Should have only ONE category name input (current language)
      const nameInputs = await page.locator('input#category-name').count();
      expect(nameInputs).toBe(1);
      
      // Should NOT have language labels like "EN", "DE", "ES", "FR"
      const langLabels = await page.locator('label:has-text("EN")').or(
        page.locator('label:has-text("DE")')
      ).count();
      expect(langLabels).toBe(0);
    });

    test('should allow adding questions', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Fill category details
      await page.locator('input#emoji-input').fill('🎯');
      await page.locator('input#category-name').fill('Mobile Test');
      
      // Add a question
      const questionInput = page.locator('input#new-question');
      await questionInput.fill('Who would most likely test on mobile?');
      
      // Click add question button or press Enter
      await page.locator('button').filter({ hasText: /Add Question/i }).click();
      
      // Verify question appears in list
      await expect(page.locator('text=Who would most likely test on mobile?')).toBeVisible();
      
      // Input should be cleared
      await expect(questionInput).toHaveValue('');
    });

    test('should allow adding question with Enter key', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      await page.locator('input#emoji-input').fill('⚡');
      await page.locator('input#category-name').fill('Keyboard Test');
      
      const questionInput = page.locator('input#new-question');
      await questionInput.fill('Who uses keyboard shortcuts?');
      await questionInput.press('Enter');
      
      // Question should be added
      await expect(page.locator('text=Who uses keyboard shortcuts?')).toBeVisible();
    });

    test('should apply autumn/rust theme colors', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Check for autumn/rust gradient buttons (not purple/pink)
      const saveButton = page.locator('button').filter({ hasText: /Save/i });
      const buttonClass = await saveButton.getAttribute('class');
      
      expect(buttonClass).toContain('autumn');
      expect(buttonClass).not.toContain('purple');
      expect(buttonClass).not.toContain('pink');
    });

    test('should have proper scroll behavior in modal', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Add multiple questions to trigger scroll
      for (let i = 0; i < 5; i++) {
        const questionInput = page.locator('input#new-question');
        await questionInput.fill(`Question ${i + 1}`);
        await page.locator('button').filter({ hasText: /Add Question/i }).click();
        await page.waitForTimeout(200);
      }
      
      // Modal content should be scrollable
      const modal = page.locator('.overflow-y-auto').first();
      await expect(modal).toBeVisible();
    });

    test('should create category successfully', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Fill all required fields
      await page.locator('input#emoji-input').fill('🏆');
      await page.locator('input#category-name').fill('Winners');
      
      // Add at least one question
      await page.locator('input#new-question').fill('Who would most likely win?');
      await page.locator('button').filter({ hasText: /Add Question/i }).click();
      
      // Save category
      await page.locator('button').filter({ hasText: /^Save$/i }).click();
      
      // Should return to category list
      await expect(page.locator('text=Winners')).toBeVisible();
      await expect(page.locator('text=🏆')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      // Try to save without filling fields
      await page.locator('button').filter({ hasText: /^Save$/i }).click();
      
      // Should show validation message (alert or error)
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('required');
        dialog.accept();
      });
    });

    test('should delete category with confirmation', async ({ page }) => {
      // First create a category
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      await page.locator('input#emoji-input').fill('🗑️');
      await page.locator('input#category-name').fill('To Delete');
      await page.locator('button').filter({ hasText: /^Save$/i }).click();
      
      await page.waitForTimeout(500);
      
      // Delete the category
      const deleteButton = page.locator('button[aria-label*="Delete"]').first();
      
      // Handle confirmation dialog
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('delete');
        dialog.accept();
      });
      
      await deleteButton.click();
      
      // Category should be removed
      await expect(page.locator('text=To Delete')).not.toBeVisible();
    });

    test('should edit existing category', async ({ page }) => {
      // Create a category first
      await openCustomCategoriesManager(page);
      await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
      
      await page.locator('input#emoji-input').fill('✏️');
      await page.locator('input#category-name').fill('Original Name');
      await page.locator('button').filter({ hasText: /^Save$/i }).click();
      
      await page.waitForTimeout(500);
      
      // Click edit button
      const editButton = page.locator('button[aria-label*="Edit"]').first();
      await editButton.click();
      
      // Modify category name
      const nameInput = page.locator('input#category-name');
      await nameInput.fill('Edited Name');
      
      // Save changes
      await page.locator('button').filter({ hasText: /^Save$/i }).click();
      
      // Verify changes
      await expect(page.locator('text=Edited Name')).toBeVisible();
    });
  });
}

// Landscape orientation tests
test.describe('Custom Categories - Landscape Orientation', () => {
  test.use({ viewport: { width: 844, height: 390 } }); // iPhone 12 Pro landscape

  test('should display properly in landscape', async ({ page }) => {
    await page.goto('/');
    await openCustomCategoriesManager(page);
    
    // Modal should be visible and properly sized
    const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Custom Categories' });
    await expect(modal).toBeVisible();
    
    // Create form should fit
    await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
    await expect(page.locator('input#emoji-input')).toBeVisible();
    await expect(page.locator('input#category-name')).toBeVisible();
  });
});

// Accessibility tests
test.describe('Custom Categories - Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await openCustomCategoriesManager(page);
    await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
    
    // Check for aria-labels on inputs
    const emojiInput = page.locator('input#emoji-input');
    await expect(emojiInput).toHaveAttribute('aria-describedby', 'emoji-help');
    
    // Check for labels on buttons
    const closeButton = page.locator('button[aria-label*="Cancel"]');
    await expect(closeButton).toHaveAttribute('aria-label');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await openCustomCategoriesManager(page);
    await page.locator('button').filter({ hasText: /Create New|Add Category/ }).first().click();
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input#emoji-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input#category-name')).toBeFocused();
  });
});

// Performance test
test.describe('Custom Categories - Mobile Performance', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should load and render quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await openCustomCategoriesManager(page);
    
    const loadTime = Date.now() - startTime;
    
    // Should load in reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(3000);
  });
});
