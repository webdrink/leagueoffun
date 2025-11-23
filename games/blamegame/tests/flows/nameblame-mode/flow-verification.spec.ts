import { test, expect } from '@playwright/test';

test.describe('NameBlame Flow - Automated Verification', () => {
  test('should follow correct flow: IntroScreen → PlayerSetup → LoadingScreen → Game', async ({ page }) => {
    const flowSteps: string[] = [];
    const gameSteps: string[] = [];
    
    // Track all console logs that indicate flow transitions
    page.on('console', (msg) => {
      const text = msg.text();
      // Track our flow markers
      if (text.includes('🎯 handleStartFromIntro') || 
          text.includes('🎯 handleStartAfterSetup') ||
          text.includes('🎯 NameBlame mode from intro') ||
          text.includes('🎯 NameBlame mode → playerSetup') ||
          text.includes('🎯 All checks passed - Starting loading animation') ||
          text.includes('🎯 FLOW: Proceeding to loading') ||
          text.includes('🎯 SAFEGUARD: NameBlame with insufficient players')) {
        flowSteps.push(text);
        console.log(`FLOW: ${text}`);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Step 1: Verify we're on IntroScreen
    console.log('=== STEP 1: Verify IntroScreen ===');
    await expect(page.getByText('BlameGame')).toBeVisible();
    await expect(page.getByRole('button', { name: /start|spiel starten/i })).toBeVisible();
    gameSteps.push('IntroScreen');

    // Step 2: Enable NameBlame mode
    console.log('=== STEP 2: Enable NameBlame Mode ===');
    const nameBlameModeToggle = page.getByRole('switch').first();
    await nameBlameModeToggle.check();
    await page.waitForTimeout(500);
    
    const isChecked = await nameBlameModeToggle.isChecked();
    expect(isChecked).toBe(true);
    console.log('✅ NameBlame mode enabled');

    // Step 3: Click Start Game - should go directly to PlayerSetup (NOT loading)
    console.log('=== STEP 3: Click Start Game (should go to PlayerSetup) ===');
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(1000);

    // Critical check: we should be on PlayerSetup, NOT loading screen
    const isOnPlayerSetup = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    const isOnLoadingScreen = await page.locator('[class*="bg-gradient-to-br"]').count() > 0 && 
                              await page.locator('[class*="animate"]').count() > 0 &&
                              !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();

    console.log(`After clicking Start: PlayerSetup visible: ${isOnPlayerSetup}, Loading screen: ${isOnLoadingScreen}`);
    
    // CRITICAL ASSERTION: We should be on PlayerSetup, NOT loading
    expect(isOnPlayerSetup).toBe(true);
    expect(isOnLoadingScreen).toBe(false);
    gameSteps.push('PlayerSetup');

    // Step 4: Add required players (NameBlame needs at least 3)
    console.log('=== STEP 4: Add 3 Players ===');
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    
    // Add first player
    await playerInput.fill('Alice');
    const addButton = page.locator('button').filter({ has: page.locator('svg[class*="plus"]') }).first();
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
    
    console.log('✅ Added 3 players: Alice, Bob, Charlie');

    // Step 5: Start the game from PlayerSetup - should go to LoadingScreen
    console.log('=== STEP 5: Start Game from PlayerSetup (should go to Loading) ===');
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await expect(startGameButton).toBeEnabled();
    await startGameButton.click();
    await page.waitForTimeout(1000);

    // Now we should see the loading screen
    const isNowOnLoadingScreen = await page.locator('[class*="bg-gradient-to-br"]').isVisible() && 
                                 !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    expect(isNowOnLoadingScreen).toBe(true);
    console.log('✅ Loading screen is now visible');
    gameSteps.push('LoadingScreen');

    // Step 6: Wait for loading to complete and game screen to appear
    console.log('=== STEP 6: Wait for Game Screen ===');
    await page.waitForTimeout(4000); // Wait for loading animation to complete

    // Should be on game screen with question and player buttons
    const progressIndicator = await page.getByText(/frage.*\d+.*von.*\d+/i).isVisible();
    expect(progressIndicator).toBe(true);
    console.log('✅ Game screen with progress indicator is visible');
    gameSteps.push('GameScreen');

    // Final verification: Check that player buttons exist
    const playerButtons = await page.getByRole('button').filter({ hasText: /alice|bob|charlie/i }).count();
    expect(playerButtons).toBeGreaterThan(0);
    console.log(`✅ Found ${playerButtons} player buttons`);

    // Report the complete flow
    console.log('=== COMPLETE FLOW VERIFICATION ===');
    console.log(`Expected: IntroScreen → PlayerSetup → LoadingScreen → GameScreen`);
    console.log(`Actual:   ${gameSteps.join(' → ')}`);
    
    console.log('=== FLOW STEPS CAPTURED ===');
    flowSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

    // Final assertion: The flow should be correct
    expect(gameSteps).toEqual(['IntroScreen', 'PlayerSetup', 'LoadingScreen', 'GameScreen']);
    
    console.log('✅ NameBlame flow test completed successfully!');
  });

  test('should handle Classic mode flow correctly', async ({ page }) => {
    const gameSteps: string[] = [];
    
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Step 1: Verify IntroScreen
    await expect(page.getByText('BlameGame')).toBeVisible();
    gameSteps.push('IntroScreen');

    // Step 2: Keep NameBlame mode disabled (Classic mode)
    const nameBlameModeToggle = page.getByRole('switch').first();
    const isChecked = await nameBlameModeToggle.isChecked();
    if (isChecked) {
      await nameBlameModeToggle.click(); // Disable if it's enabled
    }
    console.log('✅ Classic mode active');

    // Step 3: Click Start Game - should go directly to Loading (NOT PlayerSetup)
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(1000);

    // Should be on loading screen, NOT player setup
    const isOnLoadingScreen = await page.locator('[class*="bg-gradient-to-br"]').isVisible() && 
                              !await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();
    const isOnPlayerSetup = await page.getByText(/spieler.*einrichten|player.*setup/i).isVisible();

    console.log(`Classic mode after start: Loading: ${isOnLoadingScreen}, PlayerSetup: ${isOnPlayerSetup}`);
    
    expect(isOnLoadingScreen).toBe(true);
    expect(isOnPlayerSetup).toBe(false);
    gameSteps.push('LoadingScreen');

    // Wait for game to start
    await page.waitForTimeout(4000);
    
    const progressIndicator = await page.getByText(/frage.*\d+.*von.*\d+/i).isVisible();
    expect(progressIndicator).toBe(true);
    gameSteps.push('GameScreen');

    console.log(`Classic flow: ${gameSteps.join(' → ')}`);
    expect(gameSteps).toEqual(['IntroScreen', 'LoadingScreen', 'GameScreen']);
    
    console.log('✅ Classic mode flow test completed successfully!');
  });
});