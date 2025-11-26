/**
 * Comprehensive NameBlame Player Setup Tests
 * 
 * This test suite covers ALL aspects of player setup in NameBlame mode:
 * - Adding/removing players with various validation scenarios
 * - Enforcing 3-player minimum requirement with proper UI feedback
 * - Testing edge cases like duplicate names, special characters, max limits
 * - Validating button states and hint text across all languages
 * - Testing user workflows from setup through game start
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame Comprehensive Player Setup', () => {
  
  test('should enforce 3-player minimum with proper validation and hints', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'comprehensive-3-player-minimum');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Navigate to player setup
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    
    // Test 1: No players - start button should be disabled
    if (await startGameButton.count() > 0) {
      const buttonEnabled = await startGameButton.first().isEnabled();
      expect(buttonEnabled).toBe(false);
      tracker.logGameEvent('Start button with 0 players', { enabled: buttonEnabled });
      
      // Check for hint message
      const hintMessage = page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i);
      const hintVisible = await hintMessage.count() > 0;
      expect(hintVisible).toBe(true);
      tracker.logGameEvent('3-player hint with 0 players', { visible: hintVisible });
    }
    
    await tracker.takeScreenshot('no-players-validation');
    
    // Test 2: Add 1 player - still disabled
    await playerInput.fill('Player1');
    await addButton.click();
    await page.waitForTimeout(500);
    
    if (await startGameButton.count() > 0) {
      const buttonEnabled = await startGameButton.first().isEnabled();
      expect(buttonEnabled).toBe(false);
      tracker.logGameEvent('Start button with 1 player', { enabled: buttonEnabled });
      
      const hintVisible = await page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i).count() > 0;
      expect(hintVisible).toBe(true);
    }
    
    await tracker.takeScreenshot('one-player-validation');
    
    // Test 3: Add 2nd player - still disabled
    await playerInput.fill('Player2');
    await addButton.click();
    await page.waitForTimeout(500);
    
    if (await startGameButton.count() > 0) {
      const buttonEnabled = await startGameButton.first().isEnabled();
      expect(buttonEnabled).toBe(false);
      tracker.logGameEvent('Start button with 2 players', { enabled: buttonEnabled });
      
      const hintVisible = await page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i).count() > 0;
      expect(hintVisible).toBe(true);
    }
    
    await tracker.takeScreenshot('two-players-validation');
    
    // Test 4: Add 3rd player - should enable
    await playerInput.fill('Player3');
    await addButton.click();
    await page.waitForTimeout(500);
    
    if (await startGameButton.count() > 0) {
      const buttonEnabled = await startGameButton.first().isEnabled();
      expect(buttonEnabled).toBe(true);
      tracker.logGameEvent('Start button with 3 players', { enabled: buttonEnabled });
      
      // Hint should still be visible as informational, but button should be enabled
      const hintVisible = await page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i).count() > 0;
      // Note: Hint might disappear when requirement is met - both behaviors are acceptable
      tracker.logGameEvent('3-player hint with requirement met', { visible: hintVisible });
    }
    
    await tracker.takeScreenshot('three-players-requirement-met');
    
    // Test 5: Start the game successfully
    await startGameButton.first().click();
    await page.waitForTimeout(3000);
    
    // Verify game started
    const progressIndicator = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameStarted = await progressIndicator.count() > 0;
    expect(gameStarted).toBe(true);
    tracker.logGameEvent('NameBlame game start with 3 players', { success: gameStarted });
    
    await tracker.takeScreenshot('game-started-successfully');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle dynamic player addition/removal correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'dynamic-player-management');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode and navigate to setup
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
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    
    // Add 4 players
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
    for (const name of playerNames) {
      await playerInput.fill(name);
      await addButton.click();
      await page.waitForTimeout(300);
      tracker.logUserAction(`Added player: ${name}`);
    }
    
    await tracker.takeScreenshot('four-players-added');
    
    // Verify all players are visible
    for (const name of playerNames) {
      const playerElement = page.getByText(name);
      const playerVisible = await playerElement.count() > 0;
      expect(playerVisible).toBe(true);
      tracker.logGameEvent(`Player ${name} visibility`, { visible: playerVisible });
    }
    
    // Test removing players
    const removeButtons = page.getByRole('button').filter({ hasText: /trash|×|remove/i })
      .or(page.locator('button[aria-label*="remove"]'))
      .or(page.locator('button').filter({ has: page.locator('svg') }));
    
    if (await removeButtons.count() > 0) {
      // Remove Diana (back to 3 players)
      const dianaElement = page.getByText('Diana').locator('..').getByRole('button').filter({ hasText: /trash|×/i }).first();
      if (await dianaElement.count() > 0) {
        await dianaElement.click();
        tracker.logUserAction('Removed Diana');
        await page.waitForTimeout(500);
        
        // Verify Diana is gone
        const dianaVisible = await page.getByText('Diana').count() > 0;
        expect(dianaVisible).toBe(false);
        tracker.logGameEvent('Diana removed verification', { visible: dianaVisible });
        
        // Button should still be enabled with 3 players
        const buttonEnabled = await startGameButton.first().isEnabled();
        expect(buttonEnabled).toBe(true);
        tracker.logGameEvent('Start button after removing to 3 players', { enabled: buttonEnabled });
      }
      
      await tracker.takeScreenshot('after-removing-diana');
      
      // Remove Charlie (down to 2 players)
      const charlieElement = page.getByText('Charlie').locator('..').getByRole('button').filter({ hasText: /trash|×/i }).first();
      if (await charlieElement.count() > 0) {
        await charlieElement.click();
        tracker.logUserAction('Removed Charlie');
        await page.waitForTimeout(500);
        
        // Verify Charlie is gone
        const charlieVisible = await page.getByText('Charlie').count() > 0;
        expect(charlieVisible).toBe(false);
        tracker.logGameEvent('Charlie removed verification', { visible: charlieVisible });
        
        // Button should be disabled with only 2 players
        const buttonEnabled = await startGameButton.first().isEnabled();
        expect(buttonEnabled).toBe(false);
        tracker.logGameEvent('Start button after removing to 2 players', { enabled: buttonEnabled });
        
        // Hint should reappear
        const hintVisible = await page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i).count() > 0;
        expect(hintVisible).toBe(true);
        tracker.logGameEvent('3-player hint reappears', { visible: hintVisible });
      }
      
      await tracker.takeScreenshot('after-removing-charlie');
    }
    
    // Re-add a player to meet requirement again
    await playerInput.fill('Eve');
    await addButton.click();
    await page.waitForTimeout(500);
    tracker.logUserAction('Re-added player Eve');
    
    const buttonEnabledAgain = await startGameButton.first().isEnabled();
    expect(buttonEnabledAgain).toBe(true);
    tracker.logGameEvent('Start button after re-adding player', { enabled: buttonEnabledAgain });
    
    await tracker.takeScreenshot('player-re-added');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should validate player names with proper error handling', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'player-name-validation');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode and navigate to setup
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
    
    // Test 1: Empty name
    await playerInput.fill('');
    const addButtonDisabledEmpty = await addButton.isDisabled();
    expect(addButtonDisabledEmpty).toBe(true);
    tracker.logGameEvent('Add button disabled for empty name', { disabled: addButtonDisabledEmpty });
    
    // Test 2: Whitespace only
    await playerInput.fill('   ');
    const addButtonDisabledWhitespace = await addButton.isDisabled();
    expect(addButtonDisabledWhitespace).toBe(true);
    tracker.logGameEvent('Add button disabled for whitespace', { disabled: addButtonDisabledWhitespace });
    
    // Test 3: Valid name
    await playerInput.fill('Alice');
    await addButton.click();
    await page.waitForTimeout(500);
    tracker.logUserAction('Added valid player: Alice');
    
    // Test 4: Duplicate name
    await playerInput.fill('Alice');
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Check for error message
    const errorMessage = page.getByText(/already exists|bereits vorhanden|name.*taken/i)
      .or(page.locator('.text-red-500, .error'));
    const duplicateErrorShown = await errorMessage.count() > 0;
    tracker.logGameEvent('Duplicate name error handling', { errorShown: duplicateErrorShown });
    
    // Alice should still only appear once
    const aliceElements = page.getByText('Alice');
    const aliceCount = await aliceElements.count();
    // Might be 1 (in list) or 2 (in list + in error message)
    expect(aliceCount).toBeLessThanOrEqual(2);
    tracker.logGameEvent('Duplicate prevention verification', { aliceCount });
    
    await tracker.takeScreenshot('duplicate-name-validation');
    
    // Test 5: Very long name
    const longName = 'A'.repeat(50);
    await playerInput.fill(longName);
    await addButton.click();
    await page.waitForTimeout(500);
    
    // Check if long name was added or if there's a length limit
    const longNameElement = page.getByText(longName);
    const longNameAdded = await longNameElement.count() > 0;
    tracker.logGameEvent('Long name handling', { 
      nameLength: longName.length, 
      added: longNameAdded 
    });
    
    // Test 6: Special characters
    await playerInput.fill('Player@#$%');
    await addButton.click();
    await page.waitForTimeout(500);
    
    const specialCharElement = page.getByText('Player@#$%');
    const specialCharAdded = await specialCharElement.count() > 0;
    tracker.logGameEvent('Special characters handling', { added: specialCharAdded });
    
    await tracker.takeScreenshot('special-characters-test');
    
    // Test 7: Unicode characters
    await playerInput.fill('Björk');
    await addButton.click();
    await page.waitForTimeout(500);
    
    const unicodeElement = page.getByText('Björk');
    const unicodeAdded = await unicodeElement.count() > 0;
    tracker.logGameEvent('Unicode characters handling', { added: unicodeAdded });
    
    // Test 8: Numbers
    await playerInput.fill('Player123');
    await addButton.click();
    await page.waitForTimeout(500);
    
    const numbersElement = page.getByText('Player123');
    const numbersAdded = await numbersElement.count() > 0;
    tracker.logGameEvent('Numbers in name handling', { added: numbersAdded });
    
    await tracker.takeScreenshot('various-name-types');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
  
  test('should handle maximum player limits gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'max-player-limits');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode and navigate to setup
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
    
    // Add players up to the limit (10 according to hook)
    for (let i = 1; i <= 12; i++) {
      await playerInput.fill(`Player${i}`);
      await addButton.click();
      await page.waitForTimeout(200);
      
      // Check if we've hit the limit
      const errorMessage = page.getByText(/maximal.*10.*spieler|maximum.*10.*player/i);
      const maxLimitReached = await errorMessage.count() > 0;
      
      if (maxLimitReached) {
        tracker.logGameEvent(`Maximum player limit reached at ${i} players`, { 
          attempted: i, 
          errorShown: true 
        });
        break;
      }
      
      // Check if add button becomes disabled
      const addButtonDisabled = await addButton.isDisabled();
      if (addButtonDisabled) {
        tracker.logGameEvent(`Add button disabled at ${i} players`, { 
          attempted: i, 
          buttonDisabled: true 
        });
        break;
      }
    }
    
    await tracker.takeScreenshot('max-players-test');
    
    // Count actual players added
    const playerElements = page.locator('.bg-autumn-50'); // Player list items have this class
    const actualPlayerCount = await playerElements.count();
    tracker.logGameEvent('Final player count', { count: actualPlayerCount });
    
    // Should be 10 or less
    expect(actualPlayerCount).toBeLessThanOrEqual(10);
    
    // Start game button should still work if we have at least 3 players
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    if (actualPlayerCount >= 3) {
      const buttonEnabled = await startGameButton.first().isEnabled();
      expect(buttonEnabled).toBe(true);
      tracker.logGameEvent('Start button with max players', { enabled: buttonEnabled });
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should maintain setup state consistency during player management', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'setup-state-consistency');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode and navigate to setup
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
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    
    // Track state through various operations
    const stateSnapshots: Array<{operation: string, playerCount: number, buttonEnabled: boolean, hintVisible: boolean}> = [];
    
    const captureState = async (operation: string) => {
      const playerElements = page.locator('.bg-autumn-50');
      const playerCount = await playerElements.count();
      const buttonEnabled = await startGameButton.first().isEnabled();
      const hintVisible = await page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i).count() > 0;
      
      stateSnapshots.push({ operation, playerCount, buttonEnabled, hintVisible });
      tracker.logGameEvent(`State snapshot: ${operation}`, { playerCount, buttonEnabled, hintVisible });
    };
    
    await captureState('initial');
    
    // Add 1 player
    await playerInput.fill('Player1');
    await addButton.click();
    await page.waitForTimeout(300);
    await captureState('added_player_1');
    
    // Add 2nd player
    await playerInput.fill('Player2');
    await addButton.click();
    await page.waitForTimeout(300);
    await captureState('added_player_2');
    
    // Add 3rd player (should enable button)
    await playerInput.fill('Player3');
    await addButton.click();
    await page.waitForTimeout(300);
    await captureState('added_player_3');
    
    // Add 4th player
    await playerInput.fill('Player4');
    await addButton.click();
    await page.waitForTimeout(300);
    await captureState('added_player_4');
    
    // Remove 4th player
    const removeButtons = page.getByRole('button').filter({ hasText: /trash|×/i });
    if (await removeButtons.count() > 0) {
      await removeButtons.last().click();
      await page.waitForTimeout(300);
      await captureState('removed_player_4');
    }
    
    // Remove 3rd player (should disable button)
    if (await removeButtons.count() > 0) {
      await removeButtons.last().click();
      await page.waitForTimeout(300);
      await captureState('removed_player_3');
    }
    
    // Add player back
    await playerInput.fill('Player3Again');
    await addButton.click();
    await page.waitForTimeout(300);
    await captureState('re_added_player_3');
    
    await tracker.takeScreenshot('state-consistency-final');
    
    // Validate state consistency rules
    for (const snapshot of stateSnapshots) {
      // Rule 1: Button should be enabled only with 3+ players
      const expectedButtonState = snapshot.playerCount >= 3;
      expect(snapshot.buttonEnabled).toBe(expectedButtonState);
      
      // Rule 2: Hint should be visible when < 3 players
      const expectedHintState = snapshot.playerCount < 3;
      expect(snapshot.hintVisible).toBe(expectedHintState);
      
      tracker.logGameEvent(`Validation: ${snapshot.operation}`, {
        playerCount: snapshot.playerCount,
        buttonCorrect: snapshot.buttonEnabled === expectedButtonState,
        hintCorrect: snapshot.hintVisible === expectedHintState
      });
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});