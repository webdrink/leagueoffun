/**
 * Debug test to see what's actually on the page
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../utils/debug-helpers';

test.describe('Debug Framework Content', () => {
  test('should show what is actually rendered', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'debug-actual-content');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for basic page load
    await page.waitForTimeout(3000);
    
    // Get actual page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.textContent?.substring(0, 500) || 'No body text',
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()),
        hasGameMain: !!document.querySelector('[data-testid="game-main"]'),
        hasSplitText: !!document.querySelector('.split-text'),
        allClasses: Array.from(document.body.classList),
        bodyInnerHTML: document.body.innerHTML.substring(0, 1000)
      };
    });
    
    console.log('ACTUAL PAGE CONTENT:', JSON.stringify(pageContent, null, 2));
    tracker.logGameEvent('Actual page content', pageContent);
    
    await tracker.takeScreenshot('actual-page-content');
    
    // Check if it's a framework error page or loading state
    const hasError = await page.evaluate(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('error') || text.includes('404') || text.includes('not found');
    });
    
    tracker.logGameEvent('Error check', { hasError });
    
    const report = tracker.generateReport();
    console.log('DEBUG REPORT:', JSON.stringify(report, null, 2));
    
    // This test is just for debugging, so let's make it pass
    expect(pageContent.bodyText.length).toBeGreaterThan(0);
  });
});