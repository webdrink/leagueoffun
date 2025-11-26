import { test, expect } from '@playwright/test';

/**
 * NameBlame Mode Round Completion Test
 *
 * Goals:
 * 1. Start fresh (clear localStorage players) and enable NameBlame mode.
 * 2. Ensure exactly 3 players are configured.
 * 3. (If category selection is enabled) pick exactly one random category.
 * 4. Start game, wait for loading animation, reach first question.
 * 5. Iterate through all players blaming (each can blame any other – pick first non-self).
 * 6. After last player's blame + continue, assert question index advanced (question progress text changes).
 */

test.describe('NameBlame Mode - Single Round Full Progression', () => {
  test('completes a full blame cycle on first question before advancing', async ({ page }) => {
    await page.goto('/');

    // Clear persisted data to avoid interference
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Enable NameBlame mode (assumes a toggle switch exists on intro screen)
    const modeSwitch = page.getByRole('switch').first();
    if (await modeSwitch.count() > 0 && !(await modeSwitch.isChecked())) {
      await modeSwitch.click();
    }

    // If a category select toggle exists and we want a single random category, enable & proceed
    // Try to find a button or checkbox that toggles category selection (best-effort; ignore if absent)
    const categoryToggle = page.getByRole('switch', { name: /category|kategorie/i });
    if (await categoryToggle.count() > 0) {
      const isCatChecked = await categoryToggle.isChecked();
      if (!isCatChecked) await categoryToggle.click();
    }

    // Click Start / Spiel starten to proceed to either category pick or player setup
    const startBtn = page.getByRole('button', { name: /start|spiel starten/i }).first();
    await startBtn.click();

    // If category pick screen appears, choose one random category (limit to 1) then confirm
    const categoryCards = page.locator('[data-category-id]');
    if (await categoryCards.count() > 0) {
      const randomIndex = Math.floor(Math.random() * (await categoryCards.count()));
      await categoryCards.nth(randomIndex).click();
      const confirmBtn = page.getByRole('button', { name: /confirm|bestätigen|weiter|ok/i }).first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
      }
    }

    // We should now be on player setup (if not already)
    // Ensure exactly 3 players: remove existing, then add new ones
    const playerNameInput = page.getByPlaceholder(/spielername|player name/i).first();

    // There might be existing player rows with delete buttons; try to remove extras beyond base
  // Attempted deletion of existing players not necessary after localStorage.clear().

    const players = ['Alpha', 'Beta', 'Gamma'];
    for (const p of players) {
      await playerNameInput.fill(p);
      // Add player button (search for + or Add)
      const addBtn = page.locator('button').filter({ hasText: /\+|add/i }).first();
      await addBtn.click();
    }

    // Start game from setup
    const startGameBtn = page.getByRole('button', { name: /start.*game|spiel.*starten/i }).first();
    await startGameBtn.click();

    // Wait for loading animation minimum time (rouletteDuration default ~3000ms). Give buffer.
    await page.waitForTimeout(3500);

    // Capture initial question progress text (e.g., Frage 1 von X / Question 1 of X)
    const progressLocator = page.getByText(/frage\s*1\s*von|question\s*1\s*of/i).first();
    await expect(progressLocator).toBeVisible();
    const initialProgress = await progressLocator.textContent();

    // Helper: perform a blame for current active player
  async function performBlameRoundStep() {
      // Player buttons show player names; find clickable (not disabled) that isn't current player's own button
      const playerButtons = page.getByRole('button').filter({ hasText: /alpha|beta|gamma/i });
      const enabledTargets: number[] = [];
      for (let i = 0; i < await playerButtons.count(); i++) {
        if (!(await playerButtons.nth(i).isDisabled())) enabledTargets.push(i);
      }
      expect(enabledTargets.length).toBeGreaterThan(0);
      // Click the first enabled target (not self due to disabled self rule)
      await playerButtons.nth(enabledTargets[0]).click();
      // Expect notification or context panel to appear (heuristic: look for blame wording or highlighted box)
      // Continue button text depends on remaining players
      const continueBtn = page.getByRole('button', { name: /continue|weiter|next/i }).first();
      await expect(continueBtn).toBeVisible();
      await continueBtn.click();
      // Small delay for state transition
      await page.waitForTimeout(500);
    }

    // Three players -> three blame steps before question advances
  await performBlameRoundStep();
  await performBlameRoundStep();
  await performBlameRoundStep();

    // After third continue, wait for potential question transition
    await page.waitForTimeout(2000);

    // Question should now be different (progress typically shows Question 2 of ...)
    const newProgress = await page.getByText(/frage\s*2\s*von|question\s*2\s*of/i).first();
    await expect(newProgress).toBeVisible();

    console.log(`Initial progress: ${initialProgress}`);
    console.log('Advanced to next question successfully after full blame round.');
  });
});
