/**
 * Simple debug test to check browser console output
 */
import { test } from '@playwright/test';

test('Debug console output', async ({ page }) => {
  // Listen to console messages and errors
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔧')) {
      console.log('CONSOLE:', text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('/');
  await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
  
  // Wait a bit to capture console messages
  await page.waitForTimeout(3000);
  
  // Check if footer exists
  const footer = page.locator('[data-testid="game-shell-footer"]');
  const footerExists = await footer.count();
  console.log('Footer exists:', footerExists > 0);
  
  // Check for the test element
  const footerTest = page.locator('[data-testid="footer-test"]');
  const footerTestExists = await footerTest.count();
  console.log('Footer test element exists:', footerTestExists > 0);
  
  if (footerExists > 0) {
    const footerVisible = await footer.isVisible();
    console.log('Footer visible:', footerVisible);
    
    // Check for dark mode toggle
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    const toggleExists = await darkModeToggle.count();
    const toggleVisible = toggleExists > 0 ? await darkModeToggle.isVisible() : false;
    console.log('Dark mode toggle exists:', toggleExists > 0, 'visible:', toggleVisible);
    
    // Check for language selector
    const langSelector = page.locator('[data-testid="language-selector"]');
    const langExists = await langSelector.count();
    const langVisible = langExists > 0 ? await langSelector.isVisible() : false;
    console.log('Language selector exists:', langExists > 0, 'visible:', langVisible);
  }
  
  // Click start button to trigger game loading
  const startButton = page.locator('button').filter({ hasText: /start/i });
  if (await startButton.count() > 0) {
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Check again after start
    const footerAfterStart = page.locator('[data-testid="game-shell-footer"]');
    const footerAfterStartExists = await footerAfterStart.count();
    console.log('Footer after start exists:', footerAfterStartExists > 0);
  }
});