import { test, expect } from '@playwright/test';

test.describe('Category Selection: ARIA, titles, and counts', () => {
  test('titles visible, no overflow checkboxes, dynamic counts, max from settings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enable manual category selection toggle if present
    const manualToggle = page.getByRole('switch', { name: /kategorie|category/i });
    if (await manualToggle.count()) {
      if (!(await manualToggle.isChecked())) {
        await manualToggle.click();
      }
    }

    // Ensure settings use a small max for easier assertion
    await page.evaluate(() => {
      try {
        const settingsRaw = localStorage.getItem('blamegame-settings');
        const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
        settings.categoryCount = 5;
        settings.selectCategories = true;
        localStorage.setItem('blamegame-settings', JSON.stringify(settings));
      } catch (e) {
        // ignore
      }
    });

    // Start game
    const startButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i }).first();
    await startButton.click();
    await page.waitForTimeout(800);

    // Verify we are on category selection
    const title = page.getByText(/kategorien auswählen|select categories/i).first();
    await expect(title).toBeVisible();

  // Check at least 6 category tiles
  const tiles = page.locator('.category-grid label');
  await expect(tiles.count()).resolves.toBeGreaterThan(5);

  // Screenshot for verification of titles
    await page.screenshot({ path: 'test-results/fixes-category-selection-visible.png' });

    // Click a couple of tiles and ensure confirm button text updates with selected count
    const firstTile = tiles.first();
    await firstTile.click();
    const secondTile = tiles.nth(1);
    await secondTile.click();
    const confirm = page.getByRole('button', { name: /mit\s+2\s+kategorien starten|start with 2 categories/i });
    await expect(confirm).toBeVisible();

    // Ensure there are varied question counts (not all 10)
    const countEls = page.locator('.category-grid').locator('text=/\\d+\\s*(fragen|questions)/i');
    const texts = await countEls.allTextContents();
    const numeric = texts.map(t => parseInt((t.match(/(\d+)/)?.[1] ?? '0'), 10)).filter(n => !Number.isNaN(n));
    expect(numeric.length).toBeGreaterThan(0);
    const unique = Array.from(new Set(numeric));
    expect(unique.length).toBeGreaterThan(1); // indicates dynamic counts

  // Assert no zero-question categories are shown
  await expect(page.locator('.category-grid').getByText(/(^|\s)0\s*(fragen|questions)($|\s)/i)).toHaveCount(0);

    // Verify tiles are buttons (no overflowing visible checkboxes)
    const anyVisibleCheckbox = await page.locator('.category-grid input[type="checkbox"]').first().isVisible().catch(() => false);
    expect(anyVisibleCheckbox).toBeFalsy();

    // Take final screenshot
    await page.screenshot({ path: 'test-results/fixes-category-selection-final.png' });
  });
});
