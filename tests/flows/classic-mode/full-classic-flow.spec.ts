import { test, expect } from '@playwright/test';

/**
 * Full Classic Mode Flow Test
 * Validates: Intro -> Preparing -> Questions (all) -> Summary -> Restart -> First Question
 * Assumptions: Classic mode is default or selectable via start screen without player setup.
 */

test.describe('Classic Mode: Full Game Flow', () => {
  async function advanceAllQuestions(page: import('@playwright/test').Page) {
    const progressRegex = /frage (\d+) von (\d+)/i;
    let lastProgress = 0;

    for (let i = 0; i < 30; i++) { // hard upper bound; typical game < 15
      const bodyText = await page.textContent('body');
      const match = bodyText?.match(progressRegex);
      if (!match) break;
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);

      // If on last question, next click should navigate to summary
      if (current === total) break;

      // Click next
      const nextBtn = page.getByRole('button', { name: /next|weiter|nächste|zusammenfassung|results|ergebnis/i }).first();
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();

      // Wait for progress increment
  await page.waitForFunction((prev: number) => {
        const t = document.body.textContent || '';
        const m = t.match(/frage (\d+) von (\d+)/i);
        return m ? parseInt(m[1]) > prev : false;
      }, lastProgress, { timeout: 5000 });

      lastProgress = current;
    }
  }

  test('should play through all questions and restart cleanly', async ({ page }) => {
    await page.goto('/');

    // Start game
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    // Wait for preparing/loading phase to resolve -> question screen
    await page.waitForSelector('text=/Frage 1 von/i', { timeout: 15000 });

    // Validate first question
    let bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Frage 1 von \d+/i);

    // Advance through all questions
    await advanceAllQuestions(page);

    // Reach summary (look for summary markers)
    await page.waitForSelector('text=/zusammenfassung|summary|spiel.*beendet|game.*over/i', { timeout: 10000 });

    // Restart
    const restartButton = page.getByRole('button', { name: /wieder.*spielen|play.*again|restart|nochmal/i }).first();
    await expect(restartButton).toBeVisible();
    await restartButton.click();

    // Wait for return to first question again
    await page.waitForSelector('text=/Frage 1 von/i', { timeout: 15000 });
    bodyText = await page.textContent('body');
    const restartMatch = bodyText?.match(/Frage 1 von (\d+)/i);
    expect(restartMatch).toBeTruthy();
  });
});
