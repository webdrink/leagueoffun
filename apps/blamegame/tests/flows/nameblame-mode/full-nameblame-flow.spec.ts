import { test, expect, Page } from '@playwright/test';

/**
 * Full NameBlame Mode Flow Test
 * Intro -> Preparing -> Player Setup -> Questions (each with player selection) -> Summary -> Restart -> First Question
 * Uses current always-visible next button, but still exercises player selection to future-proof gating.
 */

test.describe('NameBlame Mode: Full Game Flow', () => {
  async function addPlayers(page: Page, names: string[]) {
    for (const name of names) {
      await page.fill('input[placeholder*="Name" i]', name);
      const addBtn = page.locator('button:has-text("+")');
      await addBtn.click();
      await page.waitForTimeout(150); // small debounce
    }
  }

  async function ensureFirstQuestion(page: Page) {
    await page.waitForSelector('text=/Frage 1 von/i', { timeout: 20000 });
  }

  async function playThroughQuestions(page: Page) {
    const progressRegex = /frage (\d+) von (\d+)/i;
    for (let i = 0; i < 40; i++) { // generous upper bound
      const text = await page.textContent('body');
      const match = text?.match(progressRegex);
      if (!match) break;
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (current === total) break; // last question reached

      // Simulate a blame selection from available players (should exist)
      const playerButton = page.locator('button').filter({ hasText: /Alice|Bob|Charlie|Diana|Player/i }).first();
      if (await playerButton.isVisible().catch(() => false)) {
        await playerButton.click();
      }

      const nextBtn = page.getByRole('button', { name: /next|weiter|nächste|results|zusammenfassung/i }).first();
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();

      await page.waitForFunction((prev) => {
        const t = document.body.textContent || ''; const m = t.match(/frage (\d+) von (\d+)/i); return m ? parseInt(m[1]) > prev : false;
      }, current, { timeout: 5000 });
    }
  }

  test('should complete full flow and restart cleanly', async ({ page }) => {
    await page.goto('/');

    // Switch to NameBlame mode if mode selector exists (robust attempt)
    const modeButtons = page.locator('button', { hasText: /nameblame/i });
    if (await modeButtons.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await modeButtons.first().click();
    }

    const startButton = page.getByRole('button', { name: /start|spiel starten/i }).first();
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();

    // Wait for player setup screen by detecting the add players button or title
    await page.waitForSelector('text=/Spieler|Players|player/i', { timeout: 15000 });

    // Add required players (exactly 3 minimal for speed)
    await addPlayers(page, ['Alice', 'Bob', 'Charlie']);

    // Start game
    const startGameBtn = page.getByRole('button', { name: /spiel.*starten|start.*game|beginnen|los geht/i });
    const altStartBtn = page.getByRole('button', { name: /add.*players/i }); // fallback if translation mismatch
    if (await startGameBtn.first().isVisible().catch(() => false)) {
      await startGameBtn.first().click();
    } else if (await altStartBtn.first().isVisible().catch(() => false)) {
      await altStartBtn.first().click();
    } else {
      // Heuristic: click last large primary button
      await page.locator('button').last().click();
    }

    await ensureFirstQuestion(page);

    // Play through
    await playThroughQuestions(page);

    // Summary
    await page.waitForSelector('text=/zusammenfassung|summary|spiel.*beendet/i', { timeout: 15000 });

    // Restart
    const restartButton = page.getByRole('button', { name: /wieder.*spielen|play.*again|restart|nochmal/i }).first();
    await expect(restartButton).toBeVisible();
    await restartButton.click();

    // After restart we might return to intro or setup first; handle both
    const firstQuestionVisible = await page.waitForSelector('text=/Frage 1 von/i', { timeout: 15000 }).catch(() => null);
    if (!firstQuestionVisible) {
      // Possibly intro -> need to start again quickly (players not persisted maybe)
      const startAgain = page.getByRole('button', { name: /start|spiel starten/i }).first();
      if (await startAgain.isVisible().catch(() => false)) {
        await startAgain.click();
        // If player setup appears again, add players and proceed
        const setupVisible = await page.waitForSelector('text=/Spieler|Players|player/i', { timeout: 8000 }).catch(() => null);
        if (setupVisible) {
          await addPlayers(page, ['Alice', 'Bob', 'Charlie']);
          const startGameBtn2 = page.getByRole('button', { name: /spiel.*starten|start.*game|beginnen|los geht/i }).first();
          if (await startGameBtn2.isVisible().catch(() => false)) {
            await startGameBtn2.click();
          }
        }
        await ensureFirstQuestion(page);
      }
    }

    // Assert first question after restart
    const restartBody = await page.textContent('body');
    expect(restartBody).toMatch(/Frage 1 von \d+/i);
  });
});
