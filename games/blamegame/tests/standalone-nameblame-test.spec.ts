import { test, expect } from '@playwright/test';

test.describe('NameBlame Flow Verification - Standalone', () => {
  test('should verify correct NameBlame flow: Intro → PlayerSetup → Loading → Game', async ({ page }) => {
    const flowEvents: string[] = [];
    
    // Capture console logs with flow markers
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🎯 handleStartFromIntro') ||
          text.includes('🎯 handleStartAfterSetup') ||
          text.includes('🎯 NameBlame mode from intro') ||
          text.includes('🎯 NameBlame mode → playerSetup') ||
          text.includes('🎯 FLOW: Proceeding to loading') ||
          text.includes('🎯 All checks passed - Starting loading animation') ||
          text.includes('🎯 SAFEGUARD: NameBlame with insufficient players')) {
        flowEvents.push(text);
        console.log(`LOG: ${text}`);
      }
    });

    // Navigate to the app
    await page.goto('/');
    await page.waitForTimeout(2000);

    console.log('=== TEST: Enable NameBlame and Start Game ===');
    
    // Enable NameBlame mode
    const toggle = page.getByRole('switch').first();
    await toggle.check();
    await page.waitForTimeout(500);
    
    // Verify toggle is checked
    const isChecked = await toggle.isChecked();
    expect(isChecked).toBe(true);
    console.log('✓ NameBlame toggle enabled');

    // Click Start Game - this should go to PlayerSetup, NOT loading
    console.log('=== Clicking Start Game (expecting PlayerSetup) ===');
    const startBtn = page.getByRole('button', { name: /start|spiel starten/i });
    await startBtn.click();
    await page.waitForTimeout(1500);

    // Check what screen we're on
    const playerSetupVisible = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    const loadingVisible = await page.locator('.bg-gradient-to-br').count() > 0 && 
                           !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible() &&
                           await page.locator('[class*="animate"]').count() > 0;

    console.log(`After Start Game click - PlayerSetup: ${playerSetupVisible}, Loading: ${loadingVisible}`);

    // CRITICAL: We should be on PlayerSetup, not loading
    expect(playerSetupVisible).toBe(true);
    expect(loadingVisible).toBe(false);
    console.log('✓ Correctly went to PlayerSetup (no loading screen)');

    // Add players
    console.log('=== Adding Players ===');
    const input = page.getByPlaceholder(/spielername|player name/i);
    const addBtn = page.locator('button').filter({ has: page.locator('svg[class*="plus"]') }).first();

    await input.fill('Alice');
    await addBtn.click();
    await page.waitForTimeout(300);

    await input.fill('Bob');
    await addBtn.click();
    await page.waitForTimeout(300);

    await input.fill('Charlie');
    await addBtn.click();
    await page.waitForTimeout(300);

    console.log('✓ Added 3 players');

    // Now start the game - should go to loading
    console.log('=== Starting Game from PlayerSetup (expecting Loading) ===');
    const gameStartBtn = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await gameStartBtn.click();
    await page.waitForTimeout(1000);

    // Should now be on loading screen
    const nowLoadingVisible = await page.locator('.bg-gradient-to-br').isVisible() &&
                              !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    
    expect(nowLoadingVisible).toBe(true);
    console.log('✓ Now showing loading screen');

    // Wait for game to start
    console.log('=== Waiting for Game Screen ===');
    await page.waitForTimeout(4000);

    const gameVisible = await page.getByText(/frage.*\d+.*von.*\d+/i).isVisible();
    expect(gameVisible).toBe(true);
    console.log('✓ Game screen is now visible');

    // Verify player buttons exist
    const playerBtnCount = await page.getByRole('button').filter({ 
      hasText: /alice|bob|charlie/i 
    }).count();
    expect(playerBtnCount).toBeGreaterThan(0);
    console.log(`✓ Found ${playerBtnCount} player buttons`);

    // Report the flow events
    console.log('=== FLOW EVENTS CAPTURED ===');
    flowEvents.forEach((event, i) => console.log(`${i + 1}. ${event}`));

    // Check if we got the expected flow markers
    const hasNameBlameRedirect = flowEvents.some(e => e.includes('NameBlame mode from intro') || e.includes('NameBlame mode → playerSetup'));
    const hasLoadingStart = flowEvents.some(e => e.includes('FLOW: Proceeding to loading') || e.includes('All checks passed - Starting loading'));

    console.log(`✓ Flow markers: NameBlame redirect = ${hasNameBlameRedirect}, Loading start = ${hasLoadingStart}`);

    console.log('✅ NameBlame flow test PASSED: Intro → PlayerSetup → Loading → Game');
  });

  test('should verify Classic mode flow: Intro → Loading → Game', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    console.log('=== TEST: Classic Mode Flow ===');

    // Ensure NameBlame is disabled
    const toggle = page.getByRole('switch').first();
    const isEnabled = await toggle.isChecked();
    if (isEnabled) {
      await toggle.click();
      await page.waitForTimeout(500);
    }
    console.log('✓ Classic mode active (NameBlame disabled)');

    // Click Start Game - should go to loading
    const startBtn = page.getByRole('button', { name: /start|spiel starten/i });
    await startBtn.click();
    await page.waitForTimeout(1000);

    // Should be on loading, NOT player setup
    const loadingVisible = await page.locator('.bg-gradient-to-br').isVisible() &&
                           !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    const playerSetupVisible = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();

    console.log(`Classic mode - Loading: ${loadingVisible}, PlayerSetup: ${playerSetupVisible}`);

    expect(loadingVisible).toBe(true);
    expect(playerSetupVisible).toBe(false);
    console.log('✓ Classic mode goes directly to loading');

    // Wait for game
    await page.waitForTimeout(4000);
    const gameVisible = await page.getByText(/frage.*\d+.*von.*\d+/i).isVisible();
    expect(gameVisible).toBe(true);
    console.log('✓ Classic game started successfully');

    console.log('✅ Classic mode flow test PASSED: Intro → Loading → Game');
  });
});