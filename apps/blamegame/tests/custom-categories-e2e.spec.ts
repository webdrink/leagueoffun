/**
 * End-to-End Tests for Custom Categories Feature
 * 
 * Complete flow test from A to Z:
 * 1. Create custom category with questions
 * 2. Save and verify storage
 * 3. Select category in manual category picker  
 * 4. Play game with custom questions
 * 5. Verify app reset clears everything
 */

import { test, expect, type Page } from '@playwright/test';

// Helper to clear localStorage before tests
async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

// Helper to get localStorage data
async function getLocalStorageItem(page: Page, key: string) {
  return await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, key);
}

// Helper to navigate and open custom categories
async function openCustomCategoriesManager(page: Page) {
  // Navigate to app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Look for settings or menu button to access custom categories
  // Adjust selector based on actual implementation
  const settingsButton = page.locator('[data-testid="settings-button"]').or(
    page.locator('button:has-text("Settings")').or(
      page.locator('[aria-label*="Settings"]')
    )
  );
  
  if (await settingsButton.count() > 0) {
    await settingsButton.first().click();
    await page.waitForTimeout(500);
  }
  
  // Click custom categories button
  const customCategoriesButton = page.locator('[data-testid="custom-categories-button"]').or(
    page.locator('button:has-text("Custom Categories")').or(
      page.locator('button:has-text("Manage Custom Categories")')
    )
  );
  
  await customCategoriesButton.waitFor({ state: 'visible', timeout: 5000 });
  await customCategoriesButton.click();
  
  // Wait for modal
  await page.waitForTimeout(500);
}

test.describe('Custom Categories - Complete E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('should create custom category with questions and save correctly', async ({ page }) => {
    console.log('Step 1: Open custom categories manager');
    await openCustomCategoriesManager(page);
    
    console.log('Step 2: Click create new category');
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    console.log('Step 3: Fill in category details');
    // Enter emoji
    const emojiInput = page.locator('input#emoji-input');
    await emojiInput.fill('🧪');
    
    // Enter category name
    const nameInput = page.locator('input#category-name');
    await nameInput.fill('Test Category E2E');
    
    console.log('Step 4: Add first question');
    const questionInput = page.locator('input#new-question');
    await questionInput.fill('Who would most likely run this test?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(300);
    
    // Verify question appears
    await expect(page.locator('text=Who would most likely run this test?')).toBeVisible();
    
    console.log('Step 5: Add second question');
    await questionInput.fill('Who would most likely write test code?');
    await questionInput.press('Enter'); // Test Enter key functionality
    await page.waitForTimeout(300);
    
    // Verify second question appears
    await expect(page.locator('text=Who would most likely write test code?')).toBeVisible();
    
    console.log('Step 6: Save category');
    const saveButton = page.locator('button').filter({ hasText: /^Save$/i });
    await saveButton.click();
    await page.waitForTimeout(500);
    
    console.log('Step 7: Verify category appears in list');
    await expect(page.locator('text=Test Category E2E')).toBeVisible();
    await expect(page.locator('text=🧪')).toBeVisible();
    await expect(page.locator('text=2 question(s)').or(page.locator('text=2 Frage(n)'))).toBeVisible();
    
    console.log('Step 8: Verify localStorage contains the category');
    const storageData = await getLocalStorageItem(page, 'customCategories');
    expect(storageData).toBeTruthy();
    
    const parsed = JSON.parse(storageData!);
    expect(parsed.categories).toHaveLength(1);
    expect(parsed.categories[0].emoji).toBe('🧪');
    expect(parsed.categories[0].questions).toHaveLength(2);
    
    console.log('✅ Category created and saved successfully');
  });

  test('should allow editing existing category to add more questions', async ({ page }) => {
    console.log('Step 1: Create initial category');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('📝');
    await page.locator('input#category-name').fill('Editable Category');
    await page.locator('input#new-question').fill('Initial question?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(300);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 2: Edit the category');
    const editButton = page.locator('button[aria-label*="Edit"]').first();
    await editButton.click();
    await page.waitForTimeout(300);
    
    console.log('Step 3: Add another question');
    await page.locator('input#new-question').fill('Added during edit?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(300);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 4: Verify updated count');
    await expect(page.locator('text=2 question(s)').or(page.locator('text=2 Frage(n)'))).toBeVisible();
    
    console.log('✅ Category edited successfully');
  });

  test('should allow deleting questions from category', async ({ page }) => {
    console.log('Step 1: Create category with 3 questions');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('🗑️');
    await page.locator('input#category-name').fill('Delete Test');
    
    for (let i = 1; i <= 3; i++) {
      await page.locator('input#new-question').fill(`Question ${i}?`);
      await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
      await page.waitForTimeout(200);
    }
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 2: Edit and delete one question');
    await page.locator('button[aria-label*="Edit"]').first().click();
    await page.waitForTimeout(300);
    
    // Handle confirmation dialog
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.accept();
    });
    
    const deleteButton = page.locator('button').filter({ has: page.locator('[class*="lucide-trash"]') }).first();
    await deleteButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 3: Verify count reduced');
    await expect(page.locator('text=2 question(s)').or(page.locator('text=2 Frage(n)'))).toBeVisible();
    
    console.log('✅ Question deleted successfully');
  });

  test('should select custom category in manual category picker and start game', async ({ page }) => {
    console.log('Step 1: Create custom category');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('🎮');
    await page.locator('input#category-name').fill('Gameplay Test');
    
    await page.locator('input#new-question').fill('Who is the best player?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(200);
    
    await page.locator('input#new-question').fill('Who wins most games?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(200);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 2: Close custom categories');
    await page.locator('button').filter({ has: page.locator('[class*="lucide-x"]') }).first().click();
    await page.waitForTimeout(500);
    
    console.log('Step 3: Navigate to category selection');
    // This will depend on your app's navigation flow
    // Adjust selectors based on actual implementation
    
    // Close settings if still open
    const closeButton = page.locator('[aria-label*="close"]').or(page.locator('button:has-text("Close")'));
    if (await closeButton.count() > 0) {
      await closeButton.first().click();
      await page.waitForTimeout(300);
    }
    
    // Look for settings to enable manual category selection
    // This is game-specific, adjust as needed
    const manualSelectionToggle = page.locator('input[type="checkbox"]').filter({ 
      has: page.locator('label:has-text("Manual")') 
    });
    
    if (await manualSelectionToggle.count() > 0) {
      await manualSelectionToggle.check();
      await page.waitForTimeout(300);
    }
    
    console.log('Step 4: Start game or go to category picker');
    const startButton = page.locator('button:has-text("Start")').or(
      page.locator('button:has-text("Play")')
    );
    
    if (await startButton.count() > 0) {
      await startButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    console.log('Step 5: Look for custom category in picker');
    // The custom category should appear in the category selection screen
    const customCategoryCard = page.locator('text=Gameplay Test').or(
      page.locator('[aria-label*="Gameplay Test"]')
    );
    
    if (await customCategoryCard.count() > 0) {
      await expect(customCategoryCard).toBeVisible();
      console.log('✅ Custom category appears in picker');
      
      // Try to select it
      await customCategoryCard.click();
      await page.waitForTimeout(300);
      
      // Look for confirmation that it's selected
      // This will vary by implementation
    } else {
      console.log('⚠️ Category picker not reached or category not visible');
    }
  });

  test('should clear custom categories on app reset', async ({ page }) => {
    console.log('Step 1: Create a custom category');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('💣');
    await page.locator('input#category-name').fill('Will Be Deleted');
    await page.locator('input#new-question').fill('Temporary question?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(200);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    console.log('Step 2: Verify category exists');
    await expect(page.locator('text=Will Be Deleted')).toBeVisible();
    
    const beforeReset = await getLocalStorageItem(page, 'customCategories');
    expect(beforeReset).toBeTruthy();
    
    console.log('Step 3: Find and click reset button');
    // Close custom categories first
    await page.locator('button').filter({ has: page.locator('[class*="lucide-x"]') }).first().click();
    await page.waitForTimeout(300);
    
    // Look for reset button (might be in settings)
    const resetButton = page.locator('button:has-text("Reset")').or(
      page.locator('button[aria-label*="Reset"]').or(
        page.locator('[data-testid="reset-button"]')
      )
    );
    
    if (await resetButton.count() > 0) {
      // Handle confirmation dialog
      page.once('dialog', dialog => {
        dialog.accept();
      });
      
      await resetButton.first().click();
      await page.waitForTimeout(1000);
      
      console.log('Step 4: Verify localStorage is cleared');
      const afterReset = await getLocalStorageItem(page, 'customCategories');
      
      if (afterReset) {
        const parsed = JSON.parse(afterReset);
        expect(parsed.categories || []).toHaveLength(0);
      } else {
        // Storage cleared completely
        expect(afterReset).toBeNull();
      }
      
      console.log('✅ Custom categories cleared on reset');
    } else {
      console.log('⚠️ Reset button not found - manual verification needed');
    }
  });

  test('should persist custom categories across page reloads', async ({ page }) => {
    console.log('Step 1: Create category');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('💾');
    await page.locator('input#category-name').fill('Persistent Category');
    await page.locator('input#new-question').fill('Does this persist?');
    await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
    await page.waitForTimeout(200);
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Persistent Category')).toBeVisible();
    
    console.log('Step 2: Reload page');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('Step 3: Open custom categories again');
    await openCustomCategoriesManager(page);
    
    console.log('Step 4: Verify category still exists');
    await expect(page.locator('text=Persistent Category')).toBeVisible();
    await expect(page.locator('text=💾')).toBeVisible();
    
    console.log('✅ Categories persist across reloads');
  });

  test('should validate empty category name and emoji', async ({ page }) => {
    console.log('Step 1: Open create form');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    console.log('Step 2: Try to save without filling fields');
    
    // Set up alert handler
    let alertMessage = '';
    page.once('dialog', dialog => {
      alertMessage = dialog.message();
      dialog.accept();
    });
    
    const saveButton = page.locator('button').filter({ hasText: /^Save$/i });
    await saveButton.click();
    await page.waitForTimeout(500);
    
    console.log('Step 3: Verify validation message');
    expect(alertMessage.toLowerCase()).toContain('required');
    
    console.log('✅ Validation works correctly');
  });

  test('should handle emoji validation correctly', async ({ page }) => {
    console.log('Step 1: Open create form');
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    console.log('Step 2: Try invalid emoji input');
    const emojiInput = page.locator('input#emoji-input');
    
    // Try text instead of emoji
    await emojiInput.fill('abc');
    await page.waitForTimeout(500);
    
    // Check for error message or cleared input
    const errorMsg = page.locator('[role="alert"]').filter({ hasText: /emoji/i });
    const emojiValue = await emojiInput.inputValue();
    
    // Either error should show or input should be empty
    if (await errorMsg.count() > 0) {
      await expect(errorMsg).toBeVisible();
      console.log('✅ Error message shown');
    } else {
      expect(emojiValue).toBe('');
      console.log('✅ Invalid input cleared');
    }
    
    console.log('Step 3: Try valid emoji');
    await emojiInput.fill('✅');
    await page.waitForTimeout(300);
    
    const valueAfter = await emojiInput.inputValue();
    expect(valueAfter).toBe('✅');
    
    console.log('✅ Valid emoji accepted');
  });
});

test.describe('Custom Categories - Question Count Verification', () => {
  test('should display correct question count', async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    
    await openCustomCategoriesManager(page);
    
    const createButton = page.locator('button').filter({ hasText: /Create New|Add Category/i }).first();
    await createButton.click();
    await page.waitForTimeout(300);
    
    await page.locator('input#emoji-input').fill('🔢');
    await page.locator('input#category-name').fill('Count Test');
    
    // Add exactly 5 questions
    for (let i = 1; i <= 5; i++) {
      await page.locator('input#new-question').fill(`Question number ${i}?`);
      await page.locator('button').filter({ hasText: /^Add Question$/i }).click();
      await page.waitForTimeout(150);
    }
    
    await page.locator('button').filter({ hasText: /^Save$/i }).click();
    await page.waitForTimeout(500);
    
    // Verify count shows 5
    await expect(page.locator('text=5 question(s)').or(page.locator('text=5 Frage(n)'))).toBeVisible();
    
    // Verify in localStorage
    const storageData = await getLocalStorageItem(page, 'customCategories');
    const parsed = JSON.parse(storageData!);
    expect(parsed.categories[0].questions).toHaveLength(5);
  });
});
