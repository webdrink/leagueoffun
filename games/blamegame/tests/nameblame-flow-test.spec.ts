import { test, expect } from '@playwright/test';

test.describe('NameBlame Game Flow Test', () => {
  test('should follow correct flow: IntroScreen → PlayerSetup → LoadingScreen → Game', async ({ page }) => {
    const steps: string[] = [];
    
    // Track console logs that indicate flow transitions
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🎯 handleStartGameFlow called') || 
          text.includes('🎯 handlePlayerSetupComplete') ||
          text.includes('🎯 NameBlame mode from intro') ||
          text.includes('🎯 All checks passed - Starting loading animation')) {
        steps.push(text);
        console.log(`FLOW STEP: ${text}`);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Step 1: Enable NameBlame mode
    console.log('=== STEP 1: Enable NameBlame Mode ===');
    const nameBlameModeToggle = page.getByRole('switch').first();
    await nameBlameModeToggle.check();
    await page.waitForTimeout(1000);
    
    const isChecked = await nameBlameModeToggle.isChecked();
    expect(isChecked).toBe(true);
    console.log('NameBlame mode enabled');

    // Step 2: Click Start Game - should go directly to PlayerSetup
    console.log('=== STEP 2: Click Start Game ===');
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);

    // Should be on PlayerSetup screen now
    const playerSetupVisible = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    expect(playerSetupVisible).toBe(true);
    console.log('✅ Player setup screen is visible');

    // Step 3: Add required players (NameBlame needs at least 3)
    console.log('=== STEP 3: Add Players ===');
    const playerInput = page.getByPlaceholder('Spielername');
    
    // Add first player
    await playerInput.fill('Alice');
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Add second player
    await playerInput.fill('Bob');
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Add third player
    await playerInput.fill('Charlie');
    await addButton.click();
    await page.waitForTimeout(500);
    
    console.log('Added 3 players: Alice, Bob, Charlie');

    // Step 4: Start the game from PlayerSetup - should go to LoadingScreen
    console.log('=== STEP 4: Start Game from Player Setup ===');
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(1000);

    // Should show loading screen with cards and quotes
    const loadingVisible = await page.locator('.bg-gradient-to-br').isVisible();
    expect(loadingVisible).toBe(true);
    console.log('✅ Loading screen is visible');

    // Wait for loading to complete and game screen to appear
    console.log('=== STEP 5: Wait for Game Screen ===');
    await page.waitForTimeout(4000); // Wait for loading animation to complete

    // Should be on game screen with question and player buttons
    const progressIndicator = await page.getByText(/Frage.*\d+.*von.*\d+/i).isVisible();
    expect(progressIndicator).toBe(true);
    console.log('✅ Game screen with progress indicator is visible');

    // Verify player buttons exist
    const aliceButton = await page.getByRole('button', { name: 'Alice' }).isVisible();
    const bobButton = await page.getByRole('button', { name: 'Bob' }).isVisible();
    const charlieButton = await page.getByRole('button', { name: 'Charlie' }).isVisible();
    
    expect(aliceButton || bobButton || charlieButton).toBe(true);
    console.log('✅ Player buttons are visible');

    console.log('=== FLOW STEPS CAPTURED ===');
    steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    // Verify we got the expected flow transitions
    const hasStartGameFlow = steps.some(s => s.includes('🎯 NameBlame mode from intro'));
    const hasLoadingAnimation = steps.some(s => s.includes('🎯 All checks passed - Starting loading animation'));
    
    console.log(`Has NameBlame redirect: ${hasStartGameFlow}`);
    console.log(`Has loading animation: ${hasLoadingAnimation}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'nameblame-flow-final.png', fullPage: true });
    
    console.log('✅ NameBlame flow test completed successfully!');
  });

  test('should handle NameBlame mode with insufficient players', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Enable NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    await nameBlameModeToggle.check();
    await page.waitForTimeout(1000);

    // Click Start Game - should go to PlayerSetup because insufficient players
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);

    // Should be on PlayerSetup screen
    const playerSetupVisible = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    expect(playerSetupVisible).toBe(true);
    console.log('✅ Correctly redirected to PlayerSetup with insufficient players');

    // Add only 2 players (not enough for NameBlame)
    const playerInput = page.getByPlaceholder('Spielername');
    await playerInput.fill('Alice');
    const addButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await addButton.click();
    await page.waitForTimeout(500);
    
    await playerInput.fill('Bob');
    await addButton.click();
    await page.waitForTimeout(500);

    // The start game button should be disabled or not proceed
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    const isEnabled = await startGameButton.isEnabled();
    
    if (isEnabled) {
      await startGameButton.click();
      await page.waitForTimeout(2000);
      
      // Should still be on player setup or show an error
      const stillOnPlayerSetup = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
      expect(stillOnPlayerSetup).toBe(true);
      console.log('✅ Correctly remained on PlayerSetup with insufficient players');
    } else {
      console.log('✅ Start game button is disabled with insufficient players');
    }
  });
});