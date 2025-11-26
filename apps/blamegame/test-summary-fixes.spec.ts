import { test, expect } from '@playwright/test';

test.describe('Summary Screen Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('should display summary screen without cutoff and with proper translations', async ({ page }) => {
    // Navigate through a quick game to reach summary
    
    // 1. Start the game
    const startButton = page.getByRole('button', { name: /start|spiel|starten/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // 2. Check if we need to set up players for NameBlame mode
    const playerSetup = page.locator('[data-testid="player-setup-screen"]');
    if (await playerSetup.isVisible()) {
      // Add some test players
      const addPlayerInput = page.locator('input[placeholder*="Spielername"], input[placeholder*="player name"]');
      const addButton = page.getByRole('button', { name: /add|hinzufügen/i });

      // Add Alice
      await addPlayerInput.fill('Alice');
      await addButton.click();
      await page.waitForTimeout(500);

      // Add Bob
      await addPlayerInput.fill('Bob'); 
      await addButton.click();
      await page.waitForTimeout(500);

      // Add Charlie
      await addPlayerInput.fill('Charlie');
      await addButton.click();
      await page.waitForTimeout(500);

      // Continue to game
      const continueButton = page.getByRole('button', { name: /continue|weiter|start/i });
      await continueButton.click();
      await page.waitForTimeout(2000);
    }

    // 3. Navigate through questions quickly to reach summary
    let questionCount = 0;
    const maxQuestions = 5;

    while (questionCount < maxQuestions) {
      // Check if we're at a question screen
      const questionCard = page.locator('.question-card, [data-testid="question-card"]');
      const nextButton = page.getByRole('button', { name: /next|weiter|nächste|summary|zusammenfassung/i });
      
      if (await questionCard.isVisible() && await nextButton.isVisible()) {
        // If in NameBlame mode, select a player first
        const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
        if (await playerButtons.count() > 0) {
          await playerButtons.first().click();
          await page.waitForTimeout(500);
          
          // Look for Next Blame button
          const nextBlameButton = page.getByRole('button', { name: /next|weiter|continue/i });
          if (await nextBlameButton.isVisible()) {
            await nextBlameButton.click();
          }
        } else {
          // Classic mode - just click next
          await nextButton.click();
        }
        
        await page.waitForTimeout(1000);
        questionCount++;
      } else {
        // Check if we've reached summary
        const summaryMarkers = [
          /spiel.*beendet|game.*complete|game.*over/i,
          /zusammenfassung|summary/i,
          /wieder.*spielen|play.*again/i
        ];
        
        const onSummary = await Promise.all(
          summaryMarkers.map(marker => page.getByText(marker).isVisible().catch(() => false))
        ).then(results => results.some(r => r));
        
        if (onSummary) {
          console.log('✅ Reached summary screen');
          break;
        } else {
          console.log('❓ Unexpected screen state');
          break;
        }
      }
    }

    // 4. Test the summary screen fixes
    
    // Check that the summary screen is visible and not cut off
    const summaryScreen = page.locator('text*=Spiel beendet, text*=Game Complete, text*=Zusammenfassung');
    await expect(summaryScreen.first()).toBeVisible();

    // Check that translation placeholders are not showing
    const badTranslations = [
      '{activePlayersCount}',
      '{count}', 
      'questions.counter',
      'summary.team_message'
    ];

    for (const badTranslation of badTranslations) {
      const badText = page.locator(`text=${badTranslation}`);
      await expect(badText).not.toBeVisible();
    }

    // Check that the card content is properly visible (not cut off)
    const summaryCard = page.locator('.bg-white, .rounded-3xl').first();
    if (await summaryCard.isVisible()) {
      const cardBox = await summaryCard.boundingBox();
      if (cardBox) {
        // Check that the card height is reasonable (not extremely constrained)
        expect(cardBox.height).toBeGreaterThan(300);
      }
    }

    // Check for "Play Again" button visibility
    const playAgainButton = page.getByRole('button', { name: /play.*again|nochmal.*spielen|neues.*spiel/i });
    await expect(playAgainButton).toBeVisible();

    // Take screenshot for manual verification
    await page.screenshot({ path: 'test-results/summary-screen-fixed.png' });
    
    console.log('✅ Summary screen tests completed');
  });
});