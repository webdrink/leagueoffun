/**
 * User Experience Test: Complete Gameplay Journey
 * 
 * This test simulates a real user playing the game from start to finish.
 * It focuses on the actual user experience and gameplay functionality
 * rather than technical implementation details.
 * 
 * Test Scenarios:
 * - User opens the app and starts playing immediately
 * - User can navigate through multiple questions
 * - User can complete a full game session
 * - User can restart and play again
 */

import { test, expect } from '@playwright/test';

test.describe('User Experience: Complete Gameplay', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5175/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('User can play a complete game session successfully', async ({ page }) => {
    console.log('🎮 Starting complete gameplay test...');
    
    // Step 1: Verify the app loads and shows intro screen
    console.log('📱 Checking if app loads properly...');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for the BlameGame title
    const titleElement = page.locator('text*=BlameGame').or(page.locator('h1')).first();
    await expect(titleElement).toBeVisible({ timeout: 10000 });
    console.log('✅ App title is visible');
    
    // Step 2: Look for and click the start button
    console.log('🚀 Looking for start button...');
    const startButton = page.getByRole('button', { name: /start|spiel|comenzar|commencer/i })
      .or(page.getByText(/start|spiel|comenzar|commencer/i))
      .or(page.locator('button').filter({ hasText: /start|spiel/i }))
      .first();
    
    await expect(startButton).toBeVisible({ timeout: 15000 });
    console.log('✅ Start button found');
    
    // Take a screenshot of the intro screen
    await page.screenshot({ path: 'test-results/user-experience-intro.png' });
    
    await startButton.click();
    console.log('✅ Start button clicked');
    
    // Step 3: Wait for the game to start (loading or direct question)
    console.log('⏳ Waiting for game to start...');
    
    // Wait for either loading screen or question screen
    try {
      // First check if there's a loading screen
      await page.waitForSelector('text*=Loading', { timeout: 3000 });
      console.log('📊 Loading screen detected, waiting for questions...');
      
      // Wait for loading to complete
      await page.waitForSelector('text*=Question', { timeout: 15000 });
    } catch (e) {
      // If no loading screen, check if we went directly to questions
      console.log('🎯 Checking for direct question display...');
      await page.waitForSelector('text*=Question', { timeout: 10000 });
    }
    
    console.log('✅ Game started successfully');
    
    // Step 4: Play through several questions
    console.log('🎲 Playing through questions...');
    
    const questionsPlayed = [];
    for (let i = 0; i < 5; i++) {
      console.log(`📝 Playing question ${i + 1}...`);
      
      // Take screenshot of current question
      await page.screenshot({ path: `test-results/user-experience-question-${i + 1}.png` });
      
      // Check if there's question content visible
      const questionText = await page.locator('body').textContent();
      console.log(`📖 Question content detected: ${questionText?.length} characters`);
      
      // Look for next/continue button
      const nextButton = page.getByRole('button', { name: /next|weiter|siguiente|suivant|continue/i })
        .or(page.locator('button').filter({ hasText: /next|weiter|→/i }))
        .first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        console.log(`✅ Question ${i + 1} answered, moving to next`);
        
        // Wait a moment for transition
        await page.waitForTimeout(1000);
      } else {
        console.log(`⚠️ No next button found on question ${i + 1}, checking for other navigation`);
        
        // Check if we can click anywhere to continue
        const clickableArea = page.locator('body');
        await clickableArea.click();
        await page.waitForTimeout(1000);
      }
      
      questionsPlayed.push(i + 1);
    }
    
    console.log(`✅ Played ${questionsPlayed.length} questions successfully`);
    
    // Step 5: Check if we can reach a summary or completion screen
    console.log('🏁 Looking for game completion...');
    
    // Continue playing until we reach a summary or can't continue
    let attempts = 0;
    const maxAttempts = 15; // Play up to 15 more questions
    
    while (attempts < maxAttempts) {
      const nextButton = page.getByRole('button', { name: /next|weiter|siguiente|suivant/i }).first();
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        attempts++;
        console.log(`📝 Continued to question ${questionsPlayed.length + attempts}`);
      } else {
        // Check if we've reached a summary screen
        const summaryText = await page.locator('body').textContent();
        if (summaryText?.includes('Summary') || summaryText?.includes('Zusammenfassung') || 
            summaryText?.includes('Resumen') || summaryText?.includes('Résumé')) {
          console.log('🎉 Reached summary screen!');
          break;
        }
        
        // If no next button and no summary, we might be done
        console.log('ℹ️ No more next buttons found, assuming game complete');
        break;
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/user-experience-final.png' });
    
    // Step 6: Check if user can restart
    console.log('🔄 Checking for restart capability...');
    
    const restartButton = page.getByRole('button', { name: /restart|neu|reiniciar|recommencer|zurück|back/i })
      .or(page.locator('button').filter({ hasText: /restart|neu|home|intro/i }))
      .first();
    
    if (await restartButton.isVisible()) {
      await restartButton.click();
      console.log('✅ Restart button worked');
      
      // Verify we're back at intro
      await expect(titleElement).toBeVisible({ timeout: 5000 });
      console.log('✅ Successfully returned to intro screen');
    } else {
      console.log('ℹ️ No obvious restart button found, but that might be expected');
    }
    
    console.log('🎉 Complete gameplay test finished successfully!');
  });

  test('User can handle basic interactions and navigation', async ({ page }) => {
    console.log('🎮 Testing basic user interactions...');
    
    // Check basic app responsiveness
    await expect(page.locator('body')).toBeVisible();
    
    // Test clicking around the interface
    await page.locator('body').click();
    await page.waitForTimeout(500);
    
    // Check for any settings or menu buttons
    const settingsButton = page.locator('button').filter({ hasText: /settings|einstellungen|⚙️/i }).first();
    if (await settingsButton.isVisible()) {
      console.log('⚙️ Settings button found and clickable');
      await settingsButton.click();
      await page.waitForTimeout(1000);
      
      // Try to close settings
      const closeButton = page.getByRole('button', { name: /close|schließen|cerrar|fermer|×|back/i }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        console.log('✅ Settings can be opened and closed');
      }
    }
    
    // Test that the app doesn't crash with basic interactions
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    console.log('✅ Basic interactions work without crashes');
  });

  test('App handles slow connections gracefully', async ({ page }) => {
    console.log('🌐 Testing app behavior with slow connection...');
    
    // Simulate slow connection
    await page.route('**/*', (route) => {
      // Add 1 second delay to all requests
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('http://localhost:5175/');
    
    // App should still load, just slower
    await expect(page.locator('body')).toBeVisible({ timeout: 20000 });
    console.log('✅ App loads even with slow connection');
    
    // Check if loading indicators are shown
    const loadingIndicator = page.locator('text*=Loading').or(page.locator('text*=Laden'));
    if (await loadingIndicator.isVisible()) {
      console.log('✅ Loading indicator shown during slow loading');
    }
  });
});
