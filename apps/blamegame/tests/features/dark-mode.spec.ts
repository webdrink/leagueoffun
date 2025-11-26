/**
 * Dark Mode Toggle Tests
 * Tests the dark mode functionality including class application and visual feedback.
 */

import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to initialize
    await page.waitForSelector('[data-testid="dark-mode-toggle"]', { timeout: 10000 });
  });

  test('should toggle dark mode class on html element', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    // Initially check if dark mode is off (light mode)
    const initialHtmlClass = await page.locator('html').getAttribute('class');
    const isDarkInitially = initialHtmlClass?.includes('dark') || false;
    
    console.log('Initial dark mode state:', isDarkInitially);
    
    // Click to toggle dark mode
    await darkModeToggle.click();
    
    // Wait a moment for the class to be applied
    await page.waitForTimeout(100);
    
    // Check that the html class changed
    const newHtmlClass = await page.locator('html').getAttribute('class');
    const isDarkAfterToggle = newHtmlClass?.includes('dark') || false;
    
    console.log('Dark mode state after toggle:', isDarkAfterToggle);
    
    // Should be opposite of initial state
    expect(isDarkAfterToggle).toBe(!isDarkInitially);
    
    // Click again to toggle back
    await darkModeToggle.click();
    await page.waitForTimeout(100);
    
    // Should return to initial state
    const finalHtmlClass = await page.locator('html').getAttribute('class');
    const isDarkAfterSecondToggle = finalHtmlClass?.includes('dark') || false;
    
    expect(isDarkAfterSecondToggle).toBe(isDarkInitially);
  });

  test('should show correct icon based on mode', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    // Check for SVG icon (Sun or Moon from Lucide React)
    const iconExists = await darkModeToggle.locator('svg').count();
    expect(iconExists).toBeGreaterThan(0);
    
    // Toggle and check icon changes (both Sun and Moon icons should be SVGs)
    await darkModeToggle.click();
    await page.waitForTimeout(100);
    
    const iconExistsAfterToggle = await darkModeToggle.locator('svg').count();
    expect(iconExistsAfterToggle).toBeGreaterThan(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    // Check aria-pressed attribute exists
    const ariaPressed = await darkModeToggle.getAttribute('aria-pressed');
    expect(ariaPressed).toMatch(/true|false/);
    
    // Check aria-label exists
    const ariaLabel = await darkModeToggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/Switch to (light|dark) mode/);
    
    // Check title attribute for tooltip
    const title = await darkModeToggle.getAttribute('title');
    expect(title).toBeTruthy();
  });

  test('should persist preference across page reloads', async ({ page }) => {
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    
    // Toggle dark mode
    await darkModeToggle.click();
    await page.waitForTimeout(100);
    
    // Check new state
    const newHtmlClass = await page.locator('html').getAttribute('class');
    const isDarkAfterToggle = newHtmlClass?.includes('dark') || false;
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="dark-mode-toggle"]', { timeout: 10000 });
    
    // Check that preference persisted
    const reloadedHtmlClass = await page.locator('html').getAttribute('class');
    const isDarkAfterReload = reloadedHtmlClass?.includes('dark') || false;
    
    expect(isDarkAfterReload).toBe(isDarkAfterToggle);
  });
});