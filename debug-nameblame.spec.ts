import { test } from '@playwright/test';

test.describe('NameBlame Flow - Manual Debug', () => {
  test('debug NameBlame flow step by step', async ({ page }) => {
    // Listen to console logs
    page.on('console', (msg) => {
      console.log('PAGE LOG:', msg.text());
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    console.log('=== STEP 1: Check initial state ===');
    const titleVisible = await page.getByText('BlameGame').isVisible();
    console.log('Title visible:', titleVisible);

    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    const startButtonVisible = await startButton.isVisible();
    console.log('Start button visible:', startButtonVisible);

    // Check NameBlame toggle
    const nameBlameToggle = page.getByRole('switch').first();
    const isChecked = await nameBlameToggle.isChecked();
    console.log('NameBlame toggle checked:', isChecked);

    console.log('=== STEP 2: Enable NameBlame mode ===');
    if (!isChecked) {
      await nameBlameToggle.check();
      await page.waitForTimeout(1000);
      const isCheckedAfter = await nameBlameToggle.isChecked();
      console.log('NameBlame toggle checked after click:', isCheckedAfter);
    }

    console.log('=== STEP 3: Click Start Game ===');
    await startButton.click();
    await page.waitForTimeout(2000);

    // Check what screen we're on
    const isOnPlayerSetup = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    const isOnLoadingScreen = await page.locator('[class*="bg-gradient-to-br"]').count() > 0;
    const isOnGameScreen = await page.getByText(/frage.*\d+.*von.*\d+/i).isVisible();

    console.log('After start click:');
    console.log('- PlayerSetup visible:', isOnPlayerSetup);
    console.log('- Loading screen visible:', isOnLoadingScreen);
    console.log('- Game screen visible:', isOnGameScreen);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-after-start.png', fullPage: true });

    if (isOnPlayerSetup) {
      console.log('✅ SUCCESS: Correctly navigated to PlayerSetup');
    } else if (isOnLoadingScreen) {
      console.log('❌ FAILURE: Incorrectly went to loading screen');
    } else if (isOnGameScreen) {
      console.log('❌ FAILURE: Incorrectly went directly to game screen');
    } else {
      console.log('❓ UNKNOWN: Not on any expected screen');
    }
  });
});