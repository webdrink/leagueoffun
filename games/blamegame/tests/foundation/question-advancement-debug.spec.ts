import { test, expect } from '@playwright/test';

test.describe('Question Advancement - Debug Test', () => {
  test('should advance through questions when clicking next button', async ({ page }) => {
    console.log('🧪 Testing question advancement...');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Wait for framework to initialize
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/advancement-1-initial.png' });
    
    // Click start button to enter the game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    
    console.log('✅ Clicked start button');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/advancement-2-after-start.png' });
    
    // Check if we're in loading/preparing phase
    const preparingText = await page.textContent('body');
    if (preparingText?.includes('vorbereitet') || preparingText?.includes('preparing')) {
      console.log('🔄 In preparing phase, waiting for questions to load...');
      // Wait for loading to finish - look for question screen to appear
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-results/advancement-2b-after-loading.png' });
    }
    
    // Should eventually reach question screen
    // Look for question indicators
    const questionIndicators = [
      page.getByText(/frage \d+ von \d+/i),
      page.getByText(/question \d+ of \d+/i),
      page.locator('[class*="question"]'),
      page.locator('text=/wer.*würde/i'),
      page.locator('text=/who.*would/i'),
      page.getByText(/wen.*beschuldigen/i),
      page.getByText(/who.*blame/i)
    ];
    
    let questionFound = false;
    for (const indicator of questionIndicators) {
      if (await indicator.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        questionFound = true;
        console.log('✅ Question screen detected');
        break;
      }
    }
    
    if (!questionFound) {
      console.log('⚠️ No question screen found, checking what is displayed...');
      const bodyText = await page.textContent('body');
      console.log('Page content:', bodyText?.slice(0, 500));
      await page.screenshot({ path: 'test-results/advancement-no-questions.png' });
      return;
    }
    
    await page.screenshot({ path: 'test-results/advancement-3-question-screen.png' });
    
    // Get initial question state
    const initialText = await page.textContent('body');
    const initialProgress = initialText?.match(/frage (\d+) von (\d+)/i) || initialText?.match(/question (\d+) of (\d+)/i);
    console.log('📊 Initial progress:', initialProgress ? `${initialProgress[1]}/${initialProgress[2]}` : 'Not found');
    
    // Test question advancement
    const maxAttempts = 5;
    let advancementWorking = false;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`🔄 Advancement attempt ${attempt + 1}...`);
      
      // Look for next button with multiple selectors
      const nextButtons = [
        page.getByRole('button', { name: /next|weiter|nächste|→/i }),
        page.locator('button').filter({ hasText: /next|weiter|nächste|→/i }),
        page.locator('button[class*="next"]'),
        page.getByRole('button', { name: /zusammenfassung|summary/i })
      ];
      
      let nextButton = null;
      for (const btn of nextButtons) {
        if (await btn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
          nextButton = btn.first();
          break;
        }
      }
      
      if (!nextButton) {
        console.log(`❌ No next button found on attempt ${attempt + 1}`);
        await page.screenshot({ path: `test-results/advancement-no-button-${attempt}.png` });
        break;
      }
      
      // Record current state before clicking
      const preClickText = await page.textContent('body');
      const preClickProgress = preClickText?.match(/frage (\d+) von (\d+)/i);
      console.log(`📝 Before click ${attempt + 1}: ${preClickProgress ? preClickProgress[0] : 'No progress found'}`);
      
      // Click the button
      await nextButton.click();
      console.log(`🖱️ Clicked next button (attempt ${attempt + 1})`);
      
      // Wait for potential change
      await page.waitForTimeout(2000);
      
      // Check if anything changed
      const postClickText = await page.textContent('body');
      const postClickProgress = postClickText?.match(/frage (\d+) von (\d+)/i);
      console.log(`📝 After click ${attempt + 1}: ${postClickProgress ? postClickProgress[0] : 'No progress found'}`);
      
      // Compare progress
      if (preClickProgress && postClickProgress) {
        const preCurrent = parseInt(preClickProgress[1]);
        const postCurrent = parseInt(postClickProgress[1]);
        
        if (postCurrent > preCurrent) {
          console.log(`✅ SUCCESS: Question advanced from ${preCurrent} to ${postCurrent}`);
          advancementWorking = true;
          break;
        } else if (postCurrent === preCurrent) {
          console.log(`⚠️ Question did NOT advance: still at ${preCurrent} (attempt ${attempt + 1})`);
        } else {
          console.log(`❓ Unexpected progress change: ${preCurrent} → ${postCurrent}`);
        }
      }
      
      // Check if we reached summary screen
      const summaryMarkers = [
        /zusammenfassung|summary/i,
        /spiel.*beendet|game.*over/i,
        /wieder.*spielen|play.*again/i
      ];
      
      const onSummary = await Promise.all(
        summaryMarkers.map(marker => page.getByText(marker).isVisible().catch(() => false))
      ).then(results => results.some(r => r));
      
      if (onSummary) {
        console.log(`✅ Reached summary screen after ${attempt + 1} clicks`);
        advancementWorking = true;
        break;
      }
      
      await page.screenshot({ path: `test-results/advancement-attempt-${attempt + 1}.png` });
    }
    
    console.log(`📊 Question advancement test completed. Working: ${advancementWorking}`);
    
    // Test result should be that advancement works
    expect(advancementWorking).toBe(true);
    
    // Now test the "new game" issue by going to summary and starting again
    console.log('🔄 Testing new game after completion...');
    
    // Continue until we reach summary screen
    let summaryReached = false;
    for (let i = 0; i < 10; i++) {
      const summaryCheck = await Promise.all([
        page.getByText(/zusammenfassung|summary/i).isVisible().catch(() => false),
        page.getByText(/spiel.*beendet|game.*over/i).isVisible().catch(() => false),
        page.getByText(/wieder.*spielen|play.*again/i).isVisible().catch(() => false)
      ]).then(results => results.some(r => r));
      
      if (summaryCheck) {
        console.log('✅ Reached summary screen');
        summaryReached = true;
        break;
      }
      
      // Try to advance
      const nextBtn = page.getByRole('button', { name: /next|weiter|nächste|zusammenfassung/i }).first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      } else {
        break;
      }
    }
    
    if (summaryReached) {
      await page.screenshot({ path: 'test-results/advancement-summary.png' });
      
      // Try to start a new game
      const playAgainButton = page.getByRole('button', { name: /wieder.*spielen|play.*again|nochmal/i });
      if (await playAgainButton.isVisible()) {
        console.log('🔄 Starting new game...');
        await playAgainButton.click();
        await page.waitForTimeout(3000);
        
        // Check if we immediately see summary or end state (this would be the bug)
        const newGameText = await page.textContent('body');
        const immediateEndState = /frage \d+ von \d+/.test(newGameText || '');
        const immediateSummary = /zusammenfassung|summary/i.test(newGameText || '');
        
        if (immediateSummary) {
          console.log('❌ BUG CONFIRMED: New game immediately shows summary');
          await page.screenshot({ path: 'test-results/bug-immediate-summary.png' });
        } else if (immediateEndState) {
          const endMatch = newGameText?.match(/frage (\d+) von (\d+)/i);
          if (endMatch && endMatch[1] !== '1') {
            console.log(`❌ BUG CONFIRMED: New game shows ${endMatch[0]} instead of Frage 1 von 5`);
            await page.screenshot({ path: 'test-results/bug-wrong-question.png' });
          } else {
            console.log('✅ New game starts correctly');
          }
        } else {
          console.log('✅ New game appears to start correctly (no immediate end state)');
        }
        
        await page.screenshot({ path: 'test-results/advancement-new-game.png' });
      }
    }
    
    console.log('📊 Full test completed successfully');
  });
});