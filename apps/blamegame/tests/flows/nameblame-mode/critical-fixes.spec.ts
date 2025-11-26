/**
 * Comprehensive NameBlame Flow Tests
 * 
 * Purpose: Test critical NameBlame fixes implemented based on the attached plans:
 * - 3-player minimum requirement
 * - Auto-advance bug prevention
 * - Forced setup screen navigation
 * - Blame acknowledgement workflow
 * - Player rotation integrity
 * 
 * These tests validate the specific issues addressed in the NameBlame flow fixes.
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame Critical Flow Tests', () => {
  
  test('should enforce 3-player minimum requirement for NameBlame mode', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-3-player-minimum');
    
    // Step 1: Navigate and enable NameBlame mode
    tracker.logUserAction('Navigate to app and enable NameBlame mode');
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode via toggle/switch
    const nameBlameModeToggle = page.getByRole('switch')
      .or(page.locator('input[type="checkbox"]'))
      .or(page.getByTestId('nameblame-toggle'));
    
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.first().isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.first().click();
        tracker.logUserAction('Enabled NameBlame mode');
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 2: Navigate to player setup (should be forced)
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButton.count() > 0) {
      await startButton.first().click();
      tracker.logUserAction('Clicked start button');
      await page.waitForTimeout(2000);
    }
    
    // Step 3: Verify we're on player setup screen (forced navigation)
    const playerSetupIndicator = page.getByText(/spieler.*einrichten|player.*setup|add.*player/i);
    const onPlayerSetup = await playerSetupIndicator.count() > 0;
    tracker.logGameEvent('Player setup screen forced navigation', { success: onPlayerSetup });
    expect(onPlayerSetup).toBe(true);
    
    await tracker.takeScreenshot('player-setup-forced');
    
    // Step 4: Test with insufficient players (less than 3)
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).or(page.getByRole('button', { name: /add/i }));
    
    // Add only 2 players
    if (await playerInput.count() > 0 && await addButton.count() > 0) {
      // Add Player 1
      await playerInput.first().fill('TestPlayer1');
      await addButton.first().click();
      tracker.logUserAction('Added Player 1');
      await page.waitForTimeout(500);
      
      // Add Player 2
      await playerInput.first().fill('TestPlayer2');
      await addButton.first().click();
      tracker.logUserAction('Added Player 2');
      await page.waitForTimeout(500);
      
      await tracker.takeScreenshot('two-players-added');
      
      // Step 5: Try to start with only 2 players - should be blocked
      const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
      
      if (await startGameButton.count() > 0) {
        const buttonEnabled = await startGameButton.first().isEnabled();
        tracker.logGameEvent('Start button state with 2 players', { enabled: buttonEnabled });
        
        // Button should be disabled with less than 3 players
        expect(buttonEnabled).toBe(false);
        
        // Check for hint message about 3-player minimum
        const hintMessage = page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i);
        const hintVisible = await hintMessage.count() > 0;
        tracker.logGameEvent('3-player minimum hint display', { visible: hintVisible });
        expect(hintVisible).toBe(true);
        
        await tracker.takeScreenshot('three-player-requirement-shown');
      }
      
      // Step 6: Add third player to meet requirement
      await playerInput.first().fill('TestPlayer3');
      await addButton.first().click();
      tracker.logUserAction('Added Player 3 to meet minimum requirement');
      await page.waitForTimeout(500);
      
      // Step 7: Verify start button is now enabled
      if (await startGameButton.count() > 0) {
        const buttonNowEnabled = await startGameButton.first().isEnabled();
        tracker.logGameEvent('Start button state with 3 players', { enabled: buttonNowEnabled });
        expect(buttonNowEnabled).toBe(true);
        
        await tracker.takeScreenshot('three-players-requirement-met');
        
        // Step 8: Start the game successfully
        await startGameButton.first().click();
        tracker.logUserAction('Started NameBlame game with 3 players');
        await page.waitForTimeout(3000);
        
        // Verify game started
        const progressIndicator = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
        const gameStarted = await progressIndicator.count() > 0;
        tracker.logGameEvent('NameBlame game start verification', { success: gameStarted });
        expect(gameStarted).toBe(true);
        
        await tracker.takeScreenshot('nameblame-game-started-3-players');
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should prevent auto-advance bug in blame acknowledgement', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-auto-advance-fix');
    
    // Step 1: Set up NameBlame game with 3 players
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
    
    // Navigate to setup and add 3 players
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    // Add 3 players quickly
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    tracker.logUserAction('Started NameBlame game with 3 players');
    await page.waitForTimeout(3000);
    
    // Step 2: Monitor console for auto-advance behavior
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('advanceToNextPlayer') || text.includes('blamed') || text.includes('phase')) {
        consoleMessages.push(text);
      }
    });
    
    await tracker.takeScreenshot('game-ready-for-blame-test');
    
    // Step 3: Perform blame action and verify no auto-advance
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    const buttonCount = await playerButtons.count();
    
    if (buttonCount > 0) {
      // Find the non-disabled button (current player can't blame themselves)
      let availableButton = null;
      for (let i = 0; i < buttonCount; i++) {
        const button = playerButtons.nth(i);
        const isDisabled = await button.isDisabled();
        if (!isDisabled) {
          availableButton = button;
          break;
        }
      }
      
      if (availableButton) {
        const buttonText = await availableButton.textContent();
        tracker.logUserAction(`Blaming player: ${buttonText}`);
        
        // Click to blame the player
        await availableButton.click();
        await page.waitForTimeout(2000);
        
        await tracker.takeScreenshot('after-blame-action');
        
        // Step 4: Verify we're in "blamed" phase (not auto-advanced)
        // Look for acknowledgement interface or "Continue" button
        const continueButton = page.getByRole('button', { name: /continue|weiter|next|acknowledge/i });
        const ackButton = page.getByRole('button', { name: /ok|verstanden|got it/i });
        
        const inBlamedPhase = (await continueButton.count() > 0) || (await ackButton.count() > 0);
        tracker.logGameEvent('Blamed phase verification', { 
          inBlamedPhase,
          continueButtonExists: await continueButton.count() > 0,
          ackButtonExists: await ackButton.count() > 0
        });
        
        // The fix should prevent auto-advance, so we should be in blame acknowledgement
        expect(inBlamedPhase).toBe(true);
        
        // Step 5: Check console logs for proper behavior
        const hasAutoAdvanceCall = consoleMessages.some(msg => msg.includes('advanceToNextPlayer'));
        tracker.logGameEvent('Auto-advance prevention check', { 
          autoAdvanceCalled: hasAutoAdvanceCall,
          consoleMessages: consoleMessages.slice(-5) // Last 5 messages
        });
        
        // Should NOT have auto-advance for NameBlame mode
        expect(hasAutoAdvanceCall).toBe(false);
        
        // Step 6: Manually advance to next player
        if (await continueButton.count() > 0) {
          await continueButton.first().click();
          tracker.logUserAction('Manually advanced after blame acknowledgement');
          await page.waitForTimeout(2000);
          
          await tracker.takeScreenshot('after-manual-advance');
          
          // Verify we moved to next question/turn
          const nextQuestion = page.getByText(/frage.*\d+|question.*\d+/i);
          const advancedSuccessfully = await nextQuestion.count() > 0;
          tracker.logGameEvent('Manual advance verification', { success: advancedSuccessfully });
          expect(advancedSuccessfully).toBe(true);
        }
      }
    }
    
    const report = tracker.generateReport();
    tracker.logGameEvent('Auto-advance bug test completed', {
      totalConsoleMessages: consoleMessages.length,
      errors: report.errors.length
    });
    
    expect(report.errors.length).toBeLessThan(2);
  });
  
  test('should maintain proper player rotation integrity', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-rotation-integrity');
    
    // Step 1: Set up game with known player order
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Enable NameBlame mode and set up players
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
    
    // Add players in specific order to track rotation
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const playersInOrder = ['Player1', 'Player2', 'Player3', 'Player4'];
    for (const playerName of playersInOrder) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    tracker.logUserAction('Started NameBlame game with 4 players');
    await page.waitForTimeout(3000);
    
    // Step 2: Track player rotation through multiple turns
    const rotationData: Array<{turn: number, currentPlayer: string, blameableCount: number}> = [];
    
    for (let turn = 1; turn <= 3; turn++) {
      tracker.logUserAction(`Testing turn ${turn} rotation`);
      
      // Identify current player (disabled button = current player)
      const playerButtons = page.getByRole('button').filter({ hasText: /player\d/i });
      let currentPlayer = '';
      let blameableCount = 0;
      
      for (let i = 0; i < await playerButtons.count(); i++) {
        const button = playerButtons.nth(i);
        const buttonText = await button.textContent() || '';
        const isDisabled = await button.isDisabled();
        
        if (isDisabled) {
          currentPlayer = buttonText;
        } else {
          blameableCount++;
        }
      }
      
      rotationData.push({ turn, currentPlayer, blameableCount });
      tracker.logGameEvent(`Turn ${turn} state`, { currentPlayer, blameableCount });
      
      // Verify proper blame options (should be total players - 1)
      expect(blameableCount).toBe(playersInOrder.length - 1);
      
      await tracker.takeScreenshot(`turn-${turn}-rotation`);
      
      // Blame a random available player
      const availableButtons = await playerButtons.all();
      let blamedPlayer = '';
      
      for (const button of availableButtons) {
        const isDisabled = await button.isDisabled();
        if (!isDisabled) {
          blamedPlayer = await button.textContent() || '';
          await button.click();
          tracker.logUserAction(`Turn ${turn}: ${currentPlayer} blamed ${blamedPlayer}`);
          break;
        }
      }
      
      await page.waitForTimeout(1500);
      
      // Continue to next turn
      const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
      if (await continueButton.count() > 0) {
        await continueButton.first().click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Step 3: Verify rotation integrity
    tracker.logGameEvent('Rotation integrity analysis', { rotationData });
    
    // Each turn should have exactly 3 blameable players (4 total - 1 current)
    for (const turnData of rotationData) {
      expect(turnData.blameableCount).toBe(3);
    }
    
    // Verify different players had turns
    const uniqueCurrentPlayers = new Set(rotationData.map(data => data.currentPlayer));
    tracker.logGameEvent('Unique players with turns', { 
      count: uniqueCurrentPlayers.size,
      players: Array.from(uniqueCurrentPlayers)
    });
    
    // Should have proper rotation (at least 2 different players had turns in 3 rounds)
    expect(uniqueCurrentPlayers.size).toBeGreaterThanOrEqual(2);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(2);
  });
  
  test('should handle blame acknowledgement workflow correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-acknowledgement-workflow');
    
    // Set up NameBlame game
    await page.goto('/');
    await tracker.measurePageLoad();
    
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
    
    // Quick setup with 3 players
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    await playerInput.fill('Alice');
    await addButton.click();
    await page.waitForTimeout(300);
    
    await playerInput.fill('Bob');
    await addButton.click();
    await page.waitForTimeout(300);
    
    await playerInput.fill('Charlie');
    await addButton.click();
    await page.waitForTimeout(300);
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Test blame acknowledgement workflow
    const phases: string[] = [];
    
    // Step 1: Initial question phase
    const questionVisible = await page.getByText(/frage|question/i).count() > 0;
    if (questionVisible) {
      phases.push('question_phase');
      tracker.logGameEvent('Phase: Question display');
    }
    
    await tracker.takeScreenshot('initial-question-phase');
    
    // Step 2: Blame selection phase
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    let availableButton = null;
    
    for (let i = 0; i < await playerButtons.count(); i++) {
      const button = playerButtons.nth(i);
      const isDisabled = await button.isDisabled();
      if (!isDisabled) {
        availableButton = button;
        break;
      }
    }
    
    if (availableButton) {
      phases.push('blame_selection_phase');
      tracker.logGameEvent('Phase: Blame selection available');
      
      const blamedPlayerName = await availableButton.textContent();
      await availableButton.click();
      tracker.logUserAction(`Blamed player: ${blamedPlayerName}`);
      await page.waitForTimeout(2000);
      
      await tracker.takeScreenshot('after-blame-selection');
      
      // Step 3: Blame acknowledgement phase (critical fix test)
      phases.push('blame_acknowledgement_phase');
      
      // Look for acknowledgement elements
      const ackElements = [
        page.getByRole('button', { name: /continue|weiter|next|ok|verstanden/i }),
        page.getByText(/blamed|beschuldigt/i),
        page.getByText(/acknowledge|anerkennen/i)
      ];
      
      let ackElementFound = false;
      for (const element of ackElements) {
        if (await element.count() > 0) {
          ackElementFound = true;
          tracker.logGameEvent('Acknowledgement element found', { 
            element: await element.first().textContent() 
          });
          break;
        }
      }
      
      expect(ackElementFound).toBe(true);
      tracker.logGameEvent('Phase: Blame acknowledgement phase active');
      
      // Step 4: Verify we don't auto-advance from acknowledgement
      await page.waitForTimeout(1500); // Wait to see if auto-advance occurs
      
      // Should still be in acknowledgement phase
      const stillInAck = await page.getByRole('button', { name: /continue|weiter|next|ok/i }).count() > 0;
      expect(stillInAck).toBe(true);
      tracker.logGameEvent('Auto-advance prevention verified');
      
      // Step 5: Manual acknowledgement
      const continueButton = page.getByRole('button', { name: /continue|weiter|next|ok/i }).first();
      if (await continueButton.count() > 0) {
        await continueButton.click();
        tracker.logUserAction('Manually acknowledged blame');
        await page.waitForTimeout(2000);
        
        phases.push('post_acknowledgement_phase');
        
        await tracker.takeScreenshot('after-manual-acknowledgement');
        
        // Step 6: Verify proper transition to next state
        const nextQuestion = await page.getByText(/frage.*\d+|question.*\d+/i).count() > 0;
        const nextPlayerTurn = await page.getByRole('button').filter({ hasText: /alice|bob|charlie/i }).count() > 0;
        
        const properTransition = nextQuestion && nextPlayerTurn;
        expect(properTransition).toBe(true);
        tracker.logGameEvent('Proper transition after acknowledgement', { 
          nextQuestion, 
          nextPlayerTurn 
        });
      }
    }
    
    // Final verification
    tracker.logGameEvent('Blame acknowledgement workflow completed', { 
      phasesCompleted: phases,
      totalPhases: phases.length
    });
    
    // Should complete all critical phases
    expect(phases).toContain('blame_selection_phase');
    expect(phases).toContain('blame_acknowledgement_phase');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(2);
  });
  
  test('should validate forced setup screen navigation for NameBlame mode', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-forced-setup');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Step 1: Enable NameBlame mode
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        tracker.logUserAction('Enabled NameBlame mode');
        await page.waitForTimeout(1000);
      }
    }
    
    await tracker.takeScreenshot('nameblame-mode-enabled');
    
    // Step 2: Click start and verify forced navigation to setup
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    expect(await startButton.count()).toBeGreaterThan(0);
    
    await startButton.click();
    tracker.logUserAction('Clicked start button with NameBlame mode enabled');
    await page.waitForTimeout(2000);
    
    // Step 3: Verify we're forced to player setup screen
    const setupIndicators = [
      page.getByText(/spieler.*einrichten|player.*setup/i),
      page.getByPlaceholder(/spielername|player name/i),
      page.getByText(/add.*player|spieler.*hinzufügen/i)
    ];
    
    let onSetupScreen = false;
    for (const indicator of setupIndicators) {
      if (await indicator.count() > 0) {
        onSetupScreen = true;
        break;
      }
    }
    
    expect(onSetupScreen).toBe(true);
    tracker.logGameEvent('Forced navigation to setup screen', { success: onSetupScreen });
    
    await tracker.takeScreenshot('forced-setup-screen');
    
    // Step 4: Verify we cannot bypass setup (no direct game start)
    const gameElements = [
      page.getByText(/frage.*\d+|question.*\d+/i),
      page.getByText(/current.*player|aktueller.*spieler/i)
    ];
    
    let inGameDirectly = false;
    for (const element of gameElements) {
      if (await element.count() > 0) {
        inGameDirectly = true;
        break;
      }
    }
    
    expect(inGameDirectly).toBe(false);
    tracker.logGameEvent('Setup bypass prevention', { cannotBypass: !inGameDirectly });
    
    // Step 5: Test that classic mode doesn't force setup
    // Go back and test classic mode
    const backButton = page.getByRole('button', { name: /back|zurück|home/i });
    if (await backButton.count() > 0) {
      await backButton.click();
      await page.waitForTimeout(1000);
    } else {
      // Navigate back to home
      await page.goto('/');
      await page.waitForTimeout(1000);
    }
    
    // Disable NameBlame mode
    const nameBlameModeToggleAgain = page.getByRole('switch').first();
    if (await nameBlameModeToggleAgain.count() > 0) {
      const isChecked = await nameBlameModeToggleAgain.isChecked();
      if (isChecked) {
        await nameBlameModeToggleAgain.click();
        tracker.logUserAction('Disabled NameBlame mode for comparison');
        await page.waitForTimeout(1000);
      }
    }
    
    // Try start in classic mode
    const startButtonClassic = page.getByRole('button', { name: /start|spiel starten/i });
    if (await startButtonClassic.count() > 0) {
      await startButtonClassic.click();
      tracker.logUserAction('Started in classic mode');
      await page.waitForTimeout(2000);
      
      // Classic mode should not force setup (should go to game directly)
      const classicGameStarted = await page.getByText(/frage.*\d+|question.*\d+/i).count() > 0;
      tracker.logGameEvent('Classic mode direct start', { directStart: classicGameStarted });
      
      // This validates that the forcing is specific to NameBlame mode
      expect(classicGameStarted).toBe(true);
      
      await tracker.takeScreenshot('classic-mode-direct-start');
    }
    
    const report = tracker.generateReport();
    tracker.logGameEvent('Forced setup navigation test completed', {
      errors: report.errors.length,
      duration: report.duration
    });
    
    expect(report.errors.length).toBeLessThan(2);
  });
});