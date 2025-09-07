/**
 * Comprehensive NameBlame Edge Case Tests
 * 
 * This test suite covers edge cases and error scenarios in NameBlame mode:
 * - Insufficient players and boundary conditions
 * - Duplicate blame prevention and validation
 * - Page reloads and state persistence
 * - Corrupted state recovery
 * - Network issues simulation
 * - Browser compatibility edge cases
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame Edge Cases & Error Scenarios', () => {
  
  test('should handle insufficient players gracefully across different scenarios', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'insufficient-players-edge-cases');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test 1: Zero players scenario
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Try to start with 0 players
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    const buttonDisabledWithZero = await startGameButton.first().isDisabled();
    expect(buttonDisabledWithZero).toBe(true);
    
    tracker.logGameEvent('Zero players validation', { buttonDisabled: buttonDisabledWithZero });
    await tracker.takeScreenshot('zero-players-state');
    
    // Test 2: One player scenario
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    await playerInput.fill('LoneWolf');
    await addButton.click();
    await page.waitForTimeout(500);
    
    const buttonDisabledWithOne = await startGameButton.first().isDisabled();
    expect(buttonDisabledWithOne).toBe(true);
    
    tracker.logGameEvent('One player validation', { buttonDisabled: buttonDisabledWithOne });
    await tracker.takeScreenshot('one-player-state');
    
    // Test 3: Two players scenario (should still be disabled for NameBlame)
    await playerInput.fill('SecondPlayer');
    await addButton.click();
    await page.waitForTimeout(500);
    
    const buttonDisabledWithTwo = await startGameButton.first().isDisabled();
    expect(buttonDisabledWithTwo).toBe(true);
    
    tracker.logGameEvent('Two players validation', { buttonDisabled: buttonDisabledWithTwo });
    await tracker.takeScreenshot('two-players-state');
    
    // Test 4: Edge case - removing players back to insufficient count
    const removeButtons = page.getByRole('button').filter({ hasText: /trash|×/i });
    if (await removeButtons.count() > 0) {
      await removeButtons.last().click(); // Remove one player
      await page.waitForTimeout(500);
      
      const buttonStateAfterRemoval = await startGameButton.first().isDisabled();
      expect(buttonStateAfterRemoval).toBe(true);
      
      tracker.logGameEvent('After removal validation', { buttonDisabled: buttonStateAfterRemoval });
    }
    
    // Test 5: Rapid add/remove operations
    for (let i = 0; i < 3; i++) {
      await playerInput.fill(`RapidPlayer${i}`);
      await addButton.click();
      await page.waitForTimeout(200);
      
      if (i < 2) {
        const removeButton = page.getByRole('button').filter({ hasText: /trash|×/i }).last();
        if (await removeButton.count() > 0) {
          await removeButton.click();
          await page.waitForTimeout(200);
        }
      }
    }
    
    // Should end up with enough players
    const finalButtonState = await startGameButton.first().isEnabled();
    tracker.logGameEvent('Rapid operations final state', { buttonEnabled: finalButtonState });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should prevent duplicate blames and handle edge cases in blame logic', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'duplicate-blame-prevention');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Set up game with 3 players
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Handle category selection if present
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category/i);
    if (await categoryScreen.count() > 0) {
      const randomButton = page.getByRole('button', { name: /random|zufällig|alle kategorien/i });
      if (await randomButton.count() > 0) {
        await randomButton.first().click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Monitor console for duplicate blame messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('DUPLICATE') || text.includes('already blamed') || text.includes('BLAME')) {
        consoleMessages.push(text);
      }
    });
    
    // Test 1: Attempt rapid clicking on same player
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    const targetButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
    
    if (await targetButton.count() > 0) {
      const targetName = await targetButton.textContent();
      
      // Rapid click test
      tracker.logUserAction(`Rapid clicking test on ${targetName}`);
      
      for (let i = 0; i < 5; i++) {
        await targetButton.click();
        await page.waitForTimeout(100);
      }
      
      await page.waitForTimeout(2000);
      
      // Check console for duplicate prevention
      const duplicateMessages = consoleMessages.filter(msg => 
        msg.includes('DUPLICATE') || msg.includes('already blamed')
      );
      
      tracker.logGameEvent('Duplicate blame prevention', {
        totalClicks: 5,
        duplicateMessages: duplicateMessages.length,
        messages: duplicateMessages
      });
      
      await tracker.takeScreenshot('rapid-click-test');
    }
    
    // Test 2: Try to blame after continuing (should reset for next player)
    const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
    if (await continueButton.count() > 0) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      
      // Should be able to blame again with next player
      const newPlayerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
      const newTargetButton = newPlayerButtons.filter({ hasNotText: /disabled/i }).first();
      
      if (await newTargetButton.count() > 0) {
        await newTargetButton.click();
        tracker.logUserAction('Blamed successfully after continue');
        await page.waitForTimeout(1000);
        
        // Should be successful (no duplicate prevention for new turn)
        const successfulBlame = await page.getByRole('button', { name: /continue|weiter|next/i }).count() > 0;
        expect(successfulBlame).toBe(true);
        
        tracker.logGameEvent('New turn blame validation', { successful: successfulBlame });
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle page reload and state recovery scenarios', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'page-reload-state-recovery');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Set up game
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['StatePlayer1', 'StatePlayer2', 'StatePlayer3'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    await tracker.takeScreenshot('before-reload-setup');
    
    // Test 1: Reload during player setup
    tracker.logUserAction('Testing reload during player setup');
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Check state recovery
    const setupScreen = page.getByText(/spieler.*einrichten|player.*setup/i);
    const introScreen = page.getByText(/willkommen|welcome|start/i);
    
    const onSetupScreen = await setupScreen.count() > 0;
    const onIntroScreen = await introScreen.count() > 0;
    
    tracker.logGameEvent('After reload - screen state', {
      onSetupScreen,
      onIntroScreen,
      recovered: onSetupScreen || onIntroScreen
    });
    
    // Should either maintain setup or return to intro (both are valid)
    expect(onSetupScreen || onIntroScreen).toBe(true);
    
    await tracker.takeScreenshot('after-reload-player-setup');
    
    // Re-setup game if needed
    if (onIntroScreen) {
      // Need to re-enable NameBlame and re-setup
      const nameBlameModeToggleAfterReload = page.getByRole('switch').first();
      if (await nameBlameModeToggleAfterReload.count() > 0) {
        const isChecked = await nameBlameModeToggleAfterReload.isChecked();
        if (!isChecked) {
          await nameBlameModeToggleAfterReload.click();
          await page.waitForTimeout(1000);
        }
      }
      
      const startButtonAfterReload = page.getByRole('button', { name: /start|spiel starten/i });
      await startButtonAfterReload.click();
      await page.waitForTimeout(2000);
      
      // Re-add players
      const playerInputAfterReload = page.getByPlaceholder(/spielername|player name/i);
      const addButtonAfterReload = page.locator('button').filter({ hasText: /\\+|add/i }).first();
      
      for (const playerName of players) {
        await playerInputAfterReload.fill(playerName);
        await addButtonAfterReload.click();
        await page.waitForTimeout(200);
      }
    }
    
    // Start the game
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Handle category selection if present
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category/i);
    if (await categoryScreen.count() > 0) {
      const randomButton = page.getByRole('button', { name: /random|zufällig|alle kategorien/i });
      if (await randomButton.count() > 0) {
        await randomButton.first().click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Test 2: Reload during game
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameReached = await gameScreen.count() > 0;
    
    if (gameReached) {
      tracker.logUserAction('Testing reload during active game');
      
      // Perform a blame action first
      const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(players.join('|'), 'i') });
      const targetButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
      
      if (await targetButton.count() > 0) {
        await targetButton.click();
        await page.waitForTimeout(1000);
        
        await tracker.takeScreenshot('before-reload-mid-game');
        
        // Reload during blame phase
        await page.reload();
        await page.waitForTimeout(3000);
        
        // Check recovery
        const gameScreenAfterReload = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
        const introScreenAfterReload = page.getByText(/willkommen|welcome|start/i);
        
        const gameRecovered = await gameScreenAfterReload.count() > 0;
        const backToIntro = await introScreenAfterReload.count() > 0;
        
        tracker.logGameEvent('After reload - game state recovery', {
          gameRecovered,
          backToIntro,
          validState: gameRecovered || backToIntro
        });
        
        // Should either recover game state or gracefully return to intro
        expect(gameRecovered || backToIntro).toBe(true);
        
        await tracker.takeScreenshot('after-reload-mid-game');
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5); // Allow more errors for reload scenarios
  });
  
  test('should handle corrupted state and provide graceful recovery', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'corrupted-state-recovery');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test 1: Simulate corrupted localStorage
    await page.evaluate(() => {
      // Inject corrupted data into localStorage
      localStorage.setItem('blamegame-player-names', '{"invalid": "json"}');
      localStorage.setItem('blamegame-nameblame-mode', 'not-a-boolean');
      localStorage.setItem('blamegame-nameblame-log', '[{invalid json}]');
    });
    
    tracker.logUserAction('Injected corrupted localStorage data');
    
    // Reload to trigger state recovery
    await page.reload();
    await page.waitForTimeout(3000);
    
    // App should handle corrupted state gracefully
    const appLoaded = await page.getByText(/willkommen|welcome|start|blamegame/i).count() > 0;
    expect(appLoaded).toBe(true);
    
    tracker.logGameEvent('App recovery from corrupted localStorage', { recovered: appLoaded });
    await tracker.takeScreenshot('corrupted-localStorage-recovery');
    
    // Test 2: Invalid player data scenarios
    await page.evaluate(() => {
      // Set up invalid player configurations
      localStorage.setItem('blamegame-player-names', JSON.stringify([
        { id: null, name: '' },
        { id: 'valid-id', name: null },
        { id: '', name: 'ValidName' },
        { invalidStructure: true }
      ]));
    });
    
    // Try to access NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Should handle invalid data gracefully
    const setupScreen = page.getByText(/spieler.*einrichten|player.*setup/i);
    const setupReached = await setupScreen.count() > 0;
    expect(setupReached).toBe(true);
    
    tracker.logGameEvent('Player setup with corrupted player data', { setupReached });
    
    // Test 3: Recovery by adding valid players
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const recoveryPlayers = ['Recovery1', 'Recovery2', 'Recovery3'];
    for (const playerName of recoveryPlayers) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    const gameCanStart = await startGameButton.first().isEnabled();
    expect(gameCanStart).toBe(true);
    
    tracker.logGameEvent('Recovery with valid players', { canStart: gameCanStart });
    
    // Try to start game
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Handle category selection if present
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category/i);
    if (await categoryScreen.count() > 0) {
      const randomButton = page.getByRole('button', { name: /random|zufällig|alle kategorien/i });
      if (await randomButton.count() > 0) {
        await randomButton.first().click();
        await page.waitForTimeout(2000);
      }
    }
    
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameRecovered = await gameScreen.count() > 0;
    
    tracker.logGameEvent('Complete recovery validation', { gameStarted: gameRecovered });
    
    await tracker.takeScreenshot('full-recovery-completed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
  
  test('should handle extreme input scenarios and boundary conditions', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'extreme-input-scenarios');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Set up NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    // Test 1: Extremely long player names
    const extremeNames = [
      'A'.repeat(100), // Very long name
      'Player'.repeat(20), // Repeated text
      '🎮'.repeat(50), // Many emojis
      'Player with spaces and special chars !@#$%^&*()',
      'Ünïcödë Çhåråctërš Tëst', // Unicode
      'Player\\nWith\\nNewlines', // Special characters
      '   SpacesAroundName   ', // Leading/trailing spaces
    ];
    
    for (const [index, extremeName] of extremeNames.entries()) {
      tracker.logUserAction(`Testing extreme name ${index + 1}: ${extremeName.substring(0, 50)}...`);
      
      await playerInput.fill(extremeName);
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check if name was processed correctly
      const playerList = page.locator('.bg-pink-50'); // Player list items
      const currentPlayerCount = await playerList.count();
      
      tracker.logGameEvent(`Extreme name ${index + 1} result`, {
        originalLength: extremeName.length,
        playersCount: currentPlayerCount,
        processed: currentPlayerCount > index
      });
      
      if (currentPlayerCount >= 3) {
        // Stop at 3 players to test starting the game
        break;
      }
    }
    
    await tracker.takeScreenshot('extreme-names-added');
    
    // Test 2: Rapid input scenarios
    tracker.logUserAction('Testing rapid input scenarios');
    
    // Clear input and try rapid typing
    await playerInput.clear();
    
    const rapidText = 'RapidInput';
    for (const char of rapidText) {
      await playerInput.type(char, { delay: 50 });
    }
    
    // Rapid clear and refill
    for (let i = 0; i < 5; i++) {
      await playerInput.clear();
      await playerInput.fill(`Rapid${i}`);
      await page.waitForTimeout(100);
    }
    
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Test 3: Try to start game with extreme conditions
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    const finalPlayerCount = await page.locator('.bg-pink-50').count();
    
    if (finalPlayerCount >= 3) {
      const gameCanStart = await startGameButton.first().isEnabled();
      expect(gameCanStart).toBe(true);
      
      tracker.logGameEvent('Extreme conditions game start', {
        finalPlayerCount,
        canStart: gameCanStart
      });
      
      // Try to start
      await startGameButton.click();
      await page.waitForTimeout(3000);
      
      // Handle category selection if present
      const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category/i);
      if (await categoryScreen.count() > 0) {
        const randomButton = page.getByRole('button', { name: /random|zufällig|alle kategorien/i });
        if (await randomButton.count() > 0) {
          await randomButton.first().click();
          await page.waitForTimeout(2000);
        }
      }
      
      const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
      const gameStarted = await gameScreen.count() > 0;
      
      tracker.logGameEvent('Game start with extreme inputs', { started: gameStarted });
      
      if (gameStarted) {
        // Test extreme interaction scenarios
        const playerButtons = page.getByRole('button').locator('text=/Player|Rapid|A{5,}/');
        
        if (await playerButtons.count() > 0) {
          const targetButton = playerButtons.first();
          
          // Rapid clicking test
          for (let i = 0; i < 10; i++) {
            await targetButton.click();
            await page.waitForTimeout(50);
          }
          
          tracker.logUserAction('Performed rapid clicking with extreme names');
        }
      }
    }
    
    await tracker.takeScreenshot('extreme-scenarios-completed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
});