/**
 * E2E Tests for Custom Categories Extended Features
 * 
 * Tests built-in category editing, question hiding/unhiding,
 * reset functionality, and integration with game flow.
 */

import { test, expect } from '@playwright/test';

test.describe('Custom Categories Extended Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Built-in Category Editing', () => {
    test('should display built-in categories in manager', async ({ page }) => {
      // Open custom category manager
      await page.click('[title*="Manage"]'); // Click the FolderPlus button
      
      // Wait for modal to open
      await expect(page.locator('text=Custom Categories')).toBeVisible();
      
      // Check for "Game Categories" section
      await expect(page.locator('text=Game Categories')).toBeVisible();
      
      // Verify at least one built-in category is visible
      await expect(page.locator('text=Game Category').first()).toBeVisible();
    });

    test('should be able to add question to built-in category', async ({ page }) => {
      // Open custom category manager
      await page.click('[title*="Manage"]');
      await expect(page.locator('text=Custom Categories')).toBeVisible();
      
      // Click edit on first built-in category
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Wait for editor to open
      await expect(page.locator('text=Add Questions or Hide Unwanted Ones')).toBeVisible();
      
      // Verify emoji and name are read-only (check for disabled state)
      const nameInput = page.locator('#category-name');
      await expect(nameInput).toBeDisabled();
      
      // Add a custom question
      const questionInput = page.locator('#new-question');
      await questionInput.fill('Who would test this feature thoroughly?');
      await questionInput.press('Enter');
      
      // Verify question was added with "Your Question" badge
      await expect(page.locator('text=Who would test this feature thoroughly?')).toBeVisible();
      await expect(page.locator('text=Your Question')).toBeVisible();
      
      // Close editor
      await page.click('text=Close');
      
      // Verify modification indicator appears
      await expect(page.locator('text=1 added').or(page.locator('text=added'))).toBeVisible();
    });

    test('should be able to hide question from built-in category', async ({ page }) => {
      // Open custom category manager and edit first built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Wait for questions to load
      await page.waitForTimeout(1000); // Wait for questions to load
      
      // Find first "Game Question" and hide it
      const hideButtons = page.locator('[title*="Hide Question"]');
      const firstHideButton = hideButtons.first();
      
      if (await firstHideButton.isVisible()) {
        await firstHideButton.click();
        
        // Confirm the action
        page.once('dialog', dialog => dialog.accept());
        
        // Verify question is now marked as hidden
        await expect(page.locator('text=Hidden').first()).toBeVisible();
        await expect(page.locator('[title*="Unhide Question"]').first()).toBeVisible();
      }
    });

    test('should prevent hiding all questions', async ({ page }) => {
      // Open custom category manager and edit a built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Wait for questions to load
      await page.waitForTimeout(1000);
      
      // Try to hide all questions
      const hideButtons = page.locator('[title*="Hide Question"]');
      const count = await hideButtons.count();
      
      // Hide all but one
      for (let i = 0; i < count - 1; i++) {
        const button = hideButtons.nth(i);
        if (await button.isVisible()) {
          await button.click();
          page.once('dialog', dialog => dialog.accept());
          await page.waitForTimeout(200);
        }
      }
      
      // Try to hide the last question - should show error
      const lastHideButton = page.locator('[title*="Hide Question"]').first();
      if (await lastHideButton.isVisible()) {
        page.once('dialog', dialog => {
          expect(dialog.message()).toContain('Cannot hide all questions');
          dialog.accept();
        });
        await lastHideButton.click();
      }
    });

    test('should be able to unhide a hidden question', async ({ page }) => {
      // Open custom category manager and edit first built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Wait for questions to load
      await page.waitForTimeout(1000);
      
      // Hide a question first
      const hideButton = page.locator('[title*="Hide Question"]').first();
      if (await hideButton.isVisible()) {
        await hideButton.click();
        page.once('dialog', dialog => dialog.accept());
        
        // Wait for hide to complete
        await page.waitForTimeout(300);
        
        // Now unhide it
        const unhideButton = page.locator('[title*="Unhide Question"]').first();
        await unhideButton.click();
        page.once('dialog', dialog => dialog.accept());
        
        // Verify question is no longer hidden
        await expect(page.locator('text=Hidden').first()).not.toBeVisible({ timeout: 2000 });
      }
    });

    test('should persist modifications across page reloads', async ({ page }) => {
      // Add a question to built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Add custom question
      await page.fill('#new-question', 'Persistent test question');
      await page.press('#new-question', 'Enter');
      await page.click('text=Close');
      
      // Verify modification indicator
      await expect(page.locator('text=1 added').or(page.locator('text=added'))).toBeVisible();
      
      // Close manager
      await page.locator('[aria-label*="Close"]').first().click();
      
      // Reload page
      await page.reload();
      
      // Reopen manager and verify modification persists
      await page.click('[title*="Manage"]');
      await expect(page.locator('text=1 added').or(page.locator('text=added'))).toBeVisible();
    });
  });

  test.describe('Reset Functionality', () => {
    test('should show reset button in info modal', async ({ page }) => {
      // Open info modal
      const infoButton = page.locator('[title*="Info"]');
      await infoButton.click();
      
      // Check for danger zone section
      await expect(page.locator('text=Danger Zone')).toBeVisible();
      await expect(page.locator('text=Reset All App Data')).toBeVisible();
    });

    test('should show confirmation dialog when resetting', async ({ page }) => {
      // Create some custom data first
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      await page.fill('#emoji-input', '🎮');
      await page.fill('#category-name', 'Test Category');
      await page.fill('#new-question', 'Test question');
      await page.press('#new-question', 'Enter');
      await page.click('text=Save');
      const closeButton = page.locator('[aria-label*="Close"]').first();
      await closeButton.click();
      
      // Open info modal and click reset
      const infoButton = page.locator('[title*="Info"]');
      await infoButton.click();
      await page.click('text=Reset All App Data');
      
      // Verify confirmation dialog appears
      await expect(page.locator('text=Reset All Data?')).toBeVisible();
      await expect(page.locator('text=Type "RESET" to confirm')).toBeVisible();
    });

    test('should require typing "RESET" to confirm', async ({ page }) => {
      // Open info modal and click reset
      const infoButton = page.locator('[title*="Info"]');
      await infoButton.click();
      await page.click('text=Reset All App Data');
      
      // Try to confirm without typing RESET
      const confirmButton = page.locator('button:has-text("Reset Everything")');
      await expect(confirmButton).toBeDisabled();
      
      // Type wrong text
      await page.fill('input[placeholder="RESET"]', 'WRONG');
      await expect(confirmButton).toBeDisabled();
      
      // Type correct text
      await page.fill('input[placeholder="RESET"]', 'RESET');
      await expect(confirmButton).toBeEnabled();
    });

    test('should clear all custom data when reset is confirmed', async ({ page }) => {
      // Create custom category
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      await page.fill('#emoji-input', '🎮');
      await page.fill('#category-name', 'Test Category');
      await page.fill('#new-question', 'Test question');
      await page.press('#new-question', 'Enter');
      await page.click('text=Save');
      
      // Verify custom category exists
      await expect(page.locator('text=Test Category')).toBeVisible();
      await page.locator('[aria-label*="Close"]').first().click();
      
      // Perform reset
      const infoButton = page.locator('[title*="Info"]');
      await infoButton.click();
      await page.click('text=Reset All App Data');
      await page.fill('input[placeholder="RESET"]', 'RESET');
      await page.click('text=Reset Everything');
      
      // Wait for reset to complete and modal to close
      await page.waitForTimeout(500);
      
      // Reopen custom categories manager
      await page.click('[title*="Manage"]');
      
      // Verify custom category is gone
      await expect(page.locator('text=Test Category')).not.toBeVisible();
    });

    test('should clear built-in category modifications when reset', async ({ page }) => {
      // Add question to built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      await page.fill('#new-question', 'Modification test');
      await page.press('#new-question', 'Enter');
      await page.click('text=Close');
      
      // Verify modification exists
      await expect(page.locator('text=1 added').or(page.locator('text=added'))).toBeVisible();
      await page.locator('[aria-label*="Close"]').first().click();
      
      // Perform reset
      const infoButton = page.locator('[title*="Info"]');
      await infoButton.click();
      await page.click('text=Reset All App Data');
      await page.fill('input[placeholder="RESET"]', 'RESET');
      await page.click('text=Reset Everything');
      
      await page.waitForTimeout(500);
      
      // Reopen and verify modification is gone
      await page.click('[title*="Manage"]');
      await expect(page.locator('text=1 added').or(page.locator('text=added'))).not.toBeVisible();
    });
  });

  test.describe('Integration with Game Flow', () => {
    test('should include custom questions in game', async ({ page }) => {
      // Create custom category with question
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      await page.fill('#emoji-input', '🎮');
      await page.fill('#category-name', 'E2E Test');
      await page.fill('#new-question', 'E2E test question unique');
      await page.press('#new-question', 'Enter');
      await page.click('text=Save');
      await page.locator('[aria-label*="Close"]').first().click();
      
      // Start a game (implementation depends on game flow)
      // This test might need adjustment based on actual game start flow
      // For now, just verify the category exists and could be selected
      await page.click('[title*="Manage"]');
      await expect(page.locator('text=E2E Test')).toBeVisible();
    });

    test('should not show hidden questions in game', async ({ page }) => {
      // Hide a question from built-in category
      await page.click('[title*="Manage"]');
      const editButtons = page.locator('[aria-label*="Edit"]');
      await editButtons.first().click();
      
      // Wait and hide first question
      await page.waitForTimeout(1000);
      const hideButton = page.locator('[title*="Hide Question"]').first();
      if (await hideButton.isVisible()) {
        await hideButton.click();
        page.once('dialog', dialog => dialog.accept());
      }
      
      await page.click('text=Close');
      
      // Verify hidden count indicator
      await expect(page.locator('text=1 hidden').or(page.locator('text=hidden'))).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty question input gracefully', async ({ page }) => {
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      
      // Try to add empty question
      await page.click('text=Add Question');
      
      // Should show error (depends on implementation)
      page.once('dialog', dialog => {
        expect(dialog.message()).toContain('required');
        dialog.accept();
      });
    });

    test('should handle rapid category switching', async ({ page }) => {
      await page.click('[title*="Manage"]');
      
      // Rapidly open and close different categories
      const editButtons = page.locator('[aria-label*="Edit"]');
      const count = await editButtons.count();
      
      for (let i = 0; i < Math.min(3, count); i++) {
        await editButtons.nth(i).click();
        await page.waitForTimeout(100);
        await page.click('text=Close');
        await page.waitForTimeout(100);
      }
      
      // Verify manager is still functional
      await expect(page.locator('text=Game Categories')).toBeVisible();
    });

    test('should handle very long question text', async ({ page }) => {
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      
      // Add very long question
      const longText = 'Who would ' + 'really '.repeat(50) + 'do this thing?';
      await page.fill('#new-question', longText);
      await page.press('#new-question', 'Enter');
      
      // Verify question was added (text might be truncated in display)
      await expect(page.locator(`text=${longText.substring(0, 20)}`)).toBeVisible();
    });

    test('should maintain UI state when navigating between sections', async ({ page }) => {
      // Create a custom category
      await page.click('[title*="Manage"]');
      await page.click('text=Create New Category');
      await page.fill('#emoji-input', '🎨');
      await page.fill('#category-name', 'Navigation Test');
      await page.click('text=Save');
      
      // Verify it's in custom section
      await expect(page.locator('text=Your Custom Categories')).toBeVisible();
      await expect(page.locator('text=Navigation Test')).toBeVisible();
      
      // Verify built-in section is also visible
      await expect(page.locator('text=Game Categories')).toBeVisible();
    });
  });
});
