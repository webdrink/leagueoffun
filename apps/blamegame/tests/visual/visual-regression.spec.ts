/**
 * Visual Regression Tests for League of Fun Applications
 * 
 * These tests capture and compare screenshots across:
 * - BlameGame (primary application)
 * 
 * Run with: npx playwright test tests/visual/
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('BlameGame', () => {
    test('should display intro screen correctly', async ({ page }) => {
      await page.goto('/');
      
      // Wait for the intro screen
      await expect(page.getByRole('heading', { name: /BlameGame/i })).toBeVisible();
      
      // Check for start game button
      const startButton = page.getByRole('button', { name: /Start Game/i });
      await expect(startButton).toBeVisible();
    });

    test('should display game mode toggles', async ({ page }) => {
      await page.goto('/');
      
      // Check for NameBlame mode toggle
      await expect(page.getByText(/NameBlame Mode/i)).toBeVisible();
      
      // Check for category selection toggle
      await expect(page.getByText(/Manual category selection/i)).toBeVisible();
    });

    test('should have accessible controls', async ({ page }) => {
      await page.goto('/');
      
      // Check for language selector
      const languageSelector = page.getByRole('combobox', { name: /Language/i });
      await expect(languageSelector).toBeVisible();
      await expect(languageSelector).toBeEnabled();
    });

    test('visual: intro screen layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot('blamegame-intro.png', {
        maxDiffPixelRatio: 0.1,
        threshold: 0.2
      });
    });
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('buttons should be focusable', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first button and check focus
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Wait for any navigation or action to complete
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check that main content is visible
      await expect(page.getByRole('heading', { name: /BlameGame/i })).toBeVisible();
      
      // Take viewport-specific screenshot
      await expect(page).toHaveScreenshot(`blamegame-${viewport.name}.png`, {
        maxDiffPixelRatio: 0.15,
        threshold: 0.2
      });
    });
  }
});
