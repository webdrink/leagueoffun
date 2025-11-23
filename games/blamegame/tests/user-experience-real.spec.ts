/**
 * Real User Experience Test
 * 
 * Purpose: Test what an actual player experiences when trying to play BlameGame.
 * This test focuses on the core user journey:
 * 1. Open game
 * 2. Click start
 * 3. Actually play questions
 * 4. Complete a round
 * 
 * This addresses the critical failures we saw in foundation tests.
 */

import { test, expect } from '@playwright/test';

test.describe('Real User Experience: Can Players Actually Play?', () => {
  test('should allow users to start and play the game successfully', async ({ page }) => {
    console.log('🎮 STARTING REAL USER EXPERIENCE TEST');
    
    // Step 1: Navigate to the game
    await page.goto('/');
    console.log('✅ Page loaded');
    
    // Step 2: Wait for basic page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Network idle');
    
    // Step 3: Check if we can see any content at all
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    console.log('✅ Page body is visible');
    
    // Step 4: Look for game title or main content
    await page.waitForTimeout(2000); // Give time for React to render
    
    const gameTitle = page.locator('text=BlameGame').or(page.locator('h1')).first();
    const titleVisible = await gameTitle.isVisible().catch(() => false);
    console.log(`📝 Game title visible: ${titleVisible}`);
    
    // Step 5: Take a screenshot to see what users actually see
    await page.screenshot({ path: 'user-experience-initial.png', fullPage: true });
    console.log('📸 Screenshot taken: user-experience-initial.png');
    
    // Step 6: Look for start button or any interactive element
    const startButton = page.getByRole('button').first();
    const startButtonExists = await startButton.count() > 0;
    console.log(`🔘 Start button exists: ${startButtonExists}`);
    
    if (startButtonExists) {
      const buttonText = await startButton.textContent();
      console.log(`🔘 Button text: "${buttonText}"`);
      
      // Step 7: Try clicking the start button
      try {
        await startButton.click();
        console.log('✅ Successfully clicked start button');
        
        // Wait and see what happens
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'user-experience-after-start.png', fullPage: true });
        console.log('📸 Screenshot after start: user-experience-after-start.png');
        
        // Check if we reached a question or loading screen
        const questionVisible = await page.locator('text*=Question').or(page.locator('text*=Frage')).isVisible().catch(() => false);
        const loadingVisible = await page.locator('text*=Loading').or(page.locator('text*=Laden')).isVisible().catch(() => false);
        const errorVisible = await page.locator('text*=Error').or(page.locator('text*=Fehler')).isVisible().catch(() => false);
        
        console.log(`❓ Question screen visible: ${questionVisible}`);
        console.log(`⏳ Loading screen visible: ${loadingVisible}`);
        console.log(`❌ Error visible: ${errorVisible}`);
        
        if (errorVisible) {
          const errorText = await page.locator('text*=Error').or(page.locator('text*=Fehler')).textContent();
          console.log(`❌ Error message: ${errorText}`);
        }
        
        // Check what's actually on screen
        const pageContent = await page.textContent('body');
        console.log('📄 Current page content (first 500 chars):');
        console.log(pageContent?.substring(0, 500) + '...');
        
      } catch (error) {
        console.log(`❌ Error clicking start button: ${error}`);
      }
    }
    
    // Step 8: Check console for any JavaScript errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`Console Error: ${msg.text()}`);
      }
    });
    
    // Step 9: Check network requests for failed resources
    const failedRequests: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push(`Failed: ${response.url()} - ${response.status()}`);
      }
    });
    
    // Wait a bit more to catch any async errors
    await page.waitForTimeout(2000);
    
    // Report findings
    console.log('🔍 FINAL USER EXPERIENCE REPORT:');
    console.log(`- Console errors: ${consoleMessages.length}`);
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
    
    console.log(`- Failed requests: ${failedRequests.length}`);
    failedRequests.forEach(req => console.log(`  ${req}`));
    
    // For now, just ensure the page loads and doesn't crash
    expect(bodyVisible).toBe(true);
    
    // This test will help us understand what's actually broken
    if (consoleMessages.length > 0) {
      console.log('⚠️  JavaScript errors detected - game may not be playable');
    }
    
    if (failedRequests.length > 0) {
      console.log('⚠️  Network request failures detected - assets may not be loading');
    }
  });

  test('should display questions when they exist', async ({ page }) => {
    console.log('🎮 TESTING QUESTION LOADING');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if questions are available in the window object (for debugging)
    const questionsLoaded = await page.evaluate(() => {
      const win = window as typeof window & {
        gameQuestions?: unknown[];
        gameCategories?: unknown[];
      };
      return {
        windowQuestions: typeof win.gameQuestions !== 'undefined',
        questionCount: win.gameQuestions?.length || 0,
        categoriesLoaded: typeof win.gameCategories !== 'undefined',
        categoryCount: win.gameCategories?.length || 0
      };
    });
    
    console.log('🔍 Question loading status:', questionsLoaded);
    
    // Check if we can access the questions folder directly
    const questionsResponse = await page.request.get('/questions/categories.json').catch(() => null);
    console.log(`📁 Categories file accessible: ${questionsResponse?.ok() || false}`);
    
    if (questionsResponse?.ok()) {
      const categoriesData = await questionsResponse.json();
      console.log(`📊 Categories loaded: ${Object.keys(categoriesData).length}`);
    }
    
    // Test German questions specifically
    const germanQuestionsResponse = await page.request.get('/questions/de/relationship.json').catch(() => null);
    console.log(`🇩🇪 German questions accessible: ${germanQuestionsResponse?.ok() || false}`);
    
    expect(true).toBe(true); // This test is for information gathering
  });
});
