import { test, expect } from '@playwright/test';

test.describe('BlameGame - Game Flow Debug', () => {
  test('Classic Mode: Complete question flow with proper state changes', async ({ page }) => {
    console.log('🧪 Testing Classic Mode game flow...');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/flow-1-initial.png' });
    
    // Start the game in Classic mode (should be default)
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    
    console.log('✅ Clicked start button');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/flow-2-after-start.png' });
    
    // Wait for and verify we reach the question screen
    const questionContent = page.locator('[data-testid="question-content"]')
      .or(page.getByText(/frage \d+ von \d+/i))
      .or(page.locator('.question'))
      .or(page.locator('text=/wer.*schuld/i'));
    
    await expect(questionContent.first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Question screen loaded');
    
    // Check initial question state
    const initialQuestionText = await page.textContent('body');
    const initialProgressMatch = initialQuestionText?.match(/Frage (\d+) von (\d+)/);
    console.log('📊 Initial progress:', initialProgressMatch ? `${initialProgressMatch[1]}/${initialProgressMatch[2]}` : 'Not found');
    
    await page.screenshot({ path: 'test-results/flow-3-first-question.png' });
    
    // Test question advancement
    const maxQuestions = 8; // Limit to prevent infinite loops
    let currentQuestion = 1;
    let advancementAttempts = 0;
    
    for (let i = 0; i < maxQuestions; i++) {
      console.log(`🔄 Attempting to advance from question ${currentQuestion}...`);
      
      // Find next button with multiple selectors
      const nextButton = page.getByRole('button', { name: /next|weiter|nächste|→/i })
        .or(page.locator('button').filter({ hasText: /next|weiter|nächste|→/i }))
        .or(page.locator('button[class*="next"]'))
        .first();
      
      if (!(await nextButton.isVisible())) {
        console.log('⚠️ No next button found, checking for summary');
        const summaryButton = page.getByRole('button', { name: /zusammenfassung|summary|finish/i });
        if (await summaryButton.isVisible()) {
          await summaryButton.click();
          console.log('✅ Clicked summary button, ending test');
          break;
        } else {
          console.log('❌ Neither next nor summary button found');
          await page.screenshot({ path: `test-results/flow-stuck-${i}.png` });
          break;
        }
      }
      
      // Record pre-click state
      const preClickText = await page.textContent('body');
      const preClickProgress = preClickText?.match(/Frage (\d+) von (\d+)/);
      console.log(`📝 Before click: ${preClickProgress ? preClickProgress[0] : 'No progress found'}`);
      
      await nextButton.click();
      advancementAttempts++;
      
      // Wait for potential state change
      await page.waitForTimeout(1500);
      
      // Check post-click state
      const postClickText = await page.textContent('body');
      const postClickProgress = postClickText?.match(/Frage (\d+) von (\d+)/);
      console.log(`📝 After click: ${postClickProgress ? postClickProgress[0] : 'No progress found'}`);
      
      // Verify if question actually advanced
      if (preClickProgress && postClickProgress) {
        const preCurrent = parseInt(preClickProgress[1]);
        const postCurrent = parseInt(postClickProgress[1]);
        
        if (postCurrent > preCurrent) {
          console.log(`✅ Question advanced: ${preCurrent} → ${postCurrent}`);
          currentQuestion = postCurrent;
        } else if (postCurrent === preCurrent) {
          console.log(`⚠️ Question did NOT advance: still at ${preCurrent}`);
          // This is the issue the user described!
        }
      }
      
      await page.screenshot({ path: `test-results/flow-question-${i + 2}.png` });
      
      // Check if we reached the summary screen
      const summaryMarkers = [
        /zusammenfassung|summary/i,
        /spiel.*beendet|game.*over/i,
        /wieder.*spielen|play.*again/i
      ];
      
      const onSummary = await Promise.all(
        summaryMarkers.map(marker => page.getByText(marker).isVisible().catch(() => false))
      ).then(results => results.some(r => r));
      
      if (onSummary) {
        console.log('✅ Reached summary screen');
        await page.screenshot({ path: 'test-results/flow-summary.png' });
        break;
      }
    }
    
    console.log(`📊 Test completed with ${advancementAttempts} advancement attempts`);
    
    // Now test the "new game" issue
    console.log('🔄 Testing new game after completion...');
    
    const playAgainButton = page.getByRole('button', { name: /wieder.*spielen|play.*again|nochmal/i });
    if (await playAgainButton.isVisible()) {
      await playAgainButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we immediately see summary screen (this would be the bug)
      const immediateText = await page.textContent('body');
      const immediateSummary = /zusammenfassung|summary/i.test(immediateText || '');
      const immediateEndState = /frage \d+ von \d+/.test(immediateText || '');
      
      if (immediateSummary) {
        console.log('❌ BUG CONFIRMED: New game immediately shows summary');
        await page.screenshot({ path: 'test-results/bug-immediate-summary.png' });
      } else if (immediateEndState) {
        console.log('❌ BUG CONFIRMED: New game shows end state immediately');
        await page.screenshot({ path: 'test-results/bug-immediate-endstate.png' });
      } else {
        console.log('✅ New game starts correctly');
        await page.screenshot({ path: 'test-results/flow-new-game-ok.png' });
      }
    }
  });

  test('NameBlame Mode: Question flow with player blame', async ({ page }) => {
    console.log('🧪 Testing NameBlame Mode game flow...');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Enable NameBlame mode if available
    const nameBlameModeToggle = page.getByText(/nameblame|name.*blame/i)
      .or(page.locator('input[type="checkbox"]').nth(0));
    
    if (await nameBlameModeToggle.isVisible()) {
      await nameBlameModeToggle.click();
      console.log('✅ Enabled NameBlame mode');
    }
    
    // Start the game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(3000);
    
    // Should go to player setup
    const playerSetup = page.getByText(/spieler|player|name/i);
    if (await playerSetup.isVisible()) {
      console.log('✅ Player setup screen loaded');
      
      // Add players
      const playerInput = page.getByPlaceholder(/name|spieler/i).first();
      if (await playerInput.isVisible()) {
        await playerInput.fill('Alice');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        await playerInput.fill('Bob');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        await playerInput.fill('Charlie');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        console.log('✅ Added 3 players');
      }
      
      // Continue to game
      const continueButton = page.getByRole('button', { name: /continue|weiter|start/i });
      if (await continueButton.isVisible()) {
        await continueButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Now in question screen with blame options
    const blameButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    if (await blameButtons.first().isVisible()) {
      console.log('✅ Blame selection available');
      
      // Test blame flow
      await blameButtons.first().click();
      await page.waitForTimeout(1500);
      
      // Should show reveal phase
      const nextBlameButton = page.getByRole('button', { name: /nächste|next.*frage/i });
      if (await nextBlameButton.isVisible()) {
        await nextBlameButton.click();
        console.log('✅ Blame flow working');
      }
    }
    
    await page.screenshot({ path: 'test-results/nameblame-flow.png' });
  });
});
