import { test, expect } from '@playwright/test';

// Uses the global Playwright webServer to auto-start the picker on port 999
// and verifies that both BlameGame and HookHunt show return buttons
// and navigate back to the picker when clicked.
// NOTE: These tests require BlameGame (port 9991) and HookHunt (port 9992) to be running separately

const pickerUrl = 'http://localhost:999';

test.describe('Return to Game Picker', () => {
  test('BlameGame shows return button and navigates back', async ({ page }) => {
    const returnTo = encodeURIComponent(pickerUrl);
    await page.goto(`${pickerUrl}/?playerId=test-user&returnUrl=${returnTo}`);

    // Click BlameGame card in the picker to navigate into game
    const blameGameHeading = page.getByRole('heading', { name: 'BlameGame', level: 2 });
    await expect(blameGameHeading).toBeVisible();
    
    // Get the first Play Now button (BlameGame is first)
    const playBtn = page.getByRole('button', { name: 'Play Now' }).first();
    await playBtn.click();

    // BlameGame should open on port 9991
    await page.waitForURL(/localhost:9991/, { timeout: 15000 });

    // Look for return button (Home icon with data-testid)
    const backButton = page.getByTestId('return-to-picker-button');
    await expect(backButton).toBeVisible({ timeout: 10000 });

    // Click and verify we are back on the picker
    await backButton.click();
    await page.waitForURL(/localhost:999/);
    
    // Sanity check: picker has the League of Fun text
    await expect(page.getByText('League of')).toBeVisible();
  });

  test('HookHunt shows return button and navigates back', async ({ page }) => {
    const returnTo = encodeURIComponent(pickerUrl);
    await page.goto(`${pickerUrl}/?playerId=test-user&returnUrl=${returnTo}`);

    // Click HookHunt card in the picker to navigate into game
    const hookHuntHeading = page.getByRole('heading', { name: 'HookHunt', level: 2 });
    await expect(hookHuntHeading).toBeVisible();
    
    // Get the second Play Now button (HookHunt is second)
    const playBtn = page.getByRole('button', { name: 'Play Now' }).nth(1);
    await playBtn.click();

    // HookHunt should open on port 9992
    await page.waitForURL(/localhost:9992/, { timeout: 15000 });

    // Look for return button (Back to League of Fun)
    const backButton = page.getByRole('button', { name: /Back to League of Fun/i });
    await expect(backButton).toBeVisible({ timeout: 10000 });

    // Click and verify we are back on the picker
    await backButton.click();
    await page.waitForURL(/localhost:999/);
    await expect(page.getByText('League of')).toBeVisible();
  });
});
