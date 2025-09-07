/**
 * Comprehensive NameBlame Full Round Tests
 * 
 * This test suite covers complete NameBlame round scenarios:
 * - Full round progression: all players blame on same question
 * - Multiple rounds with different questions
 * - Notification visibility and timing
 * - Round advancement logic
 * - Game completion scenarios
 * - Player rotation and turn management
 */

import { test, expect, Page } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame Full Round Progression', () => {
  
  // Helper function to set up NameBlame game ready to play
  const setupFullNameBlameGame = async (page: Page, tracker: ReturnType<typeof createGameStateTracker>, playerNames = ['Alice', 'Bob', 'Charlie']) => {
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
    
    // Add players
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    for (const playerName of playerNames) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
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
    
    tracker.logUserAction(`Set up NameBlame game with players: ${playerNames.join(', ')}`);
    return playerNames;
  };
  
  test('should complete a full round with all players blaming on same question', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'full-round-completion');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const playerNames = await setupFullNameBlameGame(page, tracker);
    
    // Verify we're on the game screen
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameReached = await gameScreen.count() > 0;
    expect(gameReached).toBe(true);
    tracker.logGameEvent('Game screen reached', { success: gameReached });
    
    // Get initial question for tracking
    const initialQuestionText = await gameScreen.first().textContent();
    tracker.logGameEvent('Starting question', { question: initialQuestionText });
    
    await tracker.takeScreenshot('full-round-start');
    
    // Complete a full round - each player blames someone
    for (let playerTurn = 0; playerTurn < playerNames.length; playerTurn++) {
      tracker.logUserAction(`--- Player turn ${playerTurn + 1} of ${playerNames.length} ---`);
      
      // Identify current player
      const currentPlayerIndicator = page.getByText(/.*ist dran|.*turn/i);
      let currentPlayerName = '';
      if (await currentPlayerIndicator.count() > 0) {
        const indicatorText = await currentPlayerIndicator.first().textContent();
        currentPlayerName = indicatorText?.split(' ')[0] || 'Unknown';
        tracker.logGameEvent(`Current player: ${currentPlayerName}`);
      }
      
      // Get available player buttons (excluding current player)
      const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(playerNames.join('|'), 'i') });
      const buttonCount = await playerButtons.count();
      tracker.logGameEvent('Player buttons available', { count: buttonCount });
      
      // Find an enabled button (not the current player)
      let targetButton = null;
      let targetPlayerName = '';
      
      for (let i = 0; i < buttonCount; i++) {
        const button = playerButtons.nth(i);
        const isDisabled = await button.isDisabled();
        
        if (!isDisabled) {
          targetButton = button;
          targetPlayerName = await button.textContent() || 'Unknown';
          break;
        }
      }
      
      expect(targetButton).not.toBeNull();
      tracker.logUserAction(`${currentPlayerName} blaming ${targetPlayerName}`);
      
      // Perform blame action
      await targetButton!.click();
      await page.waitForTimeout(2000);
      
      await tracker.takeScreenshot(`blame-action-turn-${playerTurn + 1}`);
      
      // Check for blame notification
      const blameNotification = page.locator('.fixed.top-4, .notification, .toast')
        .or(page.getByText(/blamed|beschuldigt/i));
      const notificationVisible = await blameNotification.count() > 0;
      tracker.logGameEvent(`Blame notification visible (turn ${playerTurn + 1})`, { visible: notificationVisible });
      
      // Continue to next player (or question if last player)
      const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
      const continueButtonExists = await continueButton.count() > 0;
      expect(continueButtonExists).toBe(true);
      
      const continueButtonText = await continueButton.first().textContent();
      tracker.logGameEvent(`Continue button text (turn ${playerTurn + 1})`, { text: continueButtonText });
      
      await continueButton.first().click();
      await page.waitForTimeout(2000);
      
      await tracker.takeScreenshot(`after-continue-turn-${playerTurn + 1}`);
      
      // Check if we're still on the same question or advanced
      const currentQuestionText = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).first().textContent();
      const sameQuestion = currentQuestionText === initialQuestionText;
      
      if (playerTurn < playerNames.length - 1) {
        // Should still be on same question for intermediate players
        expect(sameQuestion).toBe(true);
        tracker.logGameEvent(`Same question maintained (turn ${playerTurn + 1})`, { same: sameQuestion });
      } else {
        // Last player - should advance to next question
        expect(sameQuestion).toBe(false);
        tracker.logGameEvent(`Question advanced after last player (turn ${playerTurn + 1})`, { 
          advanced: !sameQuestion,
          newQuestion: currentQuestionText
        });
      }
    }
    
    await tracker.takeScreenshot('full-round-completed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle multiple rounds with proper question advancement', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'multiple-rounds');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const playerNames = await setupFullNameBlameGame(page, tracker);
    
    // Track questions through multiple rounds
    const questionHistory: string[] = [];
    const maxRounds = 3;
    
    for (let round = 1; round <= maxRounds; round++) {
      tracker.logUserAction(`=== Starting Round ${round} ===`);
      
      // Get current question
      const questionElement = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
      const questionText = await questionElement.first().textContent();
      questionHistory.push(questionText || `Round ${round} question`);
      
      tracker.logGameEvent(`Round ${round} question`, { question: questionText });
      
      // Complete blame round (all players blame)
      for (let playerTurn = 0; playerTurn < playerNames.length; playerTurn++) {
        // Find available player button
        const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(playerNames.join('|'), 'i') });
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
          const targetName = await availableButton.textContent();
          await availableButton.click();
          tracker.logUserAction(`Round ${round}, Turn ${playerTurn + 1}: Blamed ${targetName}`);
          await page.waitForTimeout(1500);
          
          // Continue
          const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
          if (await continueButton.count() > 0) {
            await continueButton.first().click();
            await page.waitForTimeout(1500);
          }
        }
      }
      
      await tracker.takeScreenshot(`round-${round}-completed`);
      
      // Verify we advanced to a different question (except possibly on last round)
      if (round < maxRounds) {
        const newQuestionElement = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
        const newQuestionText = await newQuestionElement.first().textContent();
        
        const questionChanged = newQuestionText !== questionText;
        expect(questionChanged).toBe(true);
        tracker.logGameEvent(`Question changed after round ${round}`, { 
          changed: questionChanged,
          from: questionText,
          to: newQuestionText
        });
      }
    }
    
    // Verify all questions were different
    const uniqueQuestions = new Set(questionHistory);
    expect(uniqueQuestions.size).toBe(questionHistory.length);
    tracker.logGameEvent('Question uniqueness verification', {
      totalQuestions: questionHistory.length,
      uniqueQuestions: uniqueQuestions.size,
      allUnique: uniqueQuestions.size === questionHistory.length
    });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should show appropriate notifications and progress indicators', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'notifications-progress');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const playerNames = await setupFullNameBlameGame(page, tracker, ['Player1', 'Player2', 'Player3', 'Player4']);
    
    // Track notification behavior through a round
    for (let playerTurn = 0; playerTurn < playerNames.length; playerTurn++) {
      tracker.logUserAction(`--- Notification test: Player turn ${playerTurn + 1} ---`);
      
      // Perform blame action
      const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(playerNames.join('|'), 'i') });
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
        const targetName = await availableButton.textContent();
        await availableButton.click();
        await page.waitForTimeout(1000);
        
        // Check for blame notification
        const notificationSelectors = [
          '.fixed.top-4',
          '.notification',
          '.toast',
          '[data-testid="blame-notification"]',
          page.getByText(/blamed|beschuldigt/i)
        ];
        
        let notificationFound = false;
        let notificationText = '';
        
        for (const selector of notificationSelectors) {
          const element = typeof selector === 'string' ? page.locator(selector) : selector;
          if (await element.count() > 0) {
            notificationFound = true;
            notificationText = await element.first().textContent() || '';
            break;
          }
        }
        
        tracker.logGameEvent(`Blame notification (turn ${playerTurn + 1})`, {
          found: notificationFound,
          text: notificationText.substring(0, 100)
        });
        
        // Check for progress indicator
        const progressIndicators = [
          page.getByText(/\d+.*von.*\d+|\d+.*of.*\d+/),
          page.locator('.progress'),
          page.getByText(/progress/i)
        ];
        
        let progressFound = false;
        let progressText = '';
        
        for (const indicator of progressIndicators) {
          if (await indicator.count() > 0) {
            progressFound = true;
            progressText = await indicator.first().textContent() || '';
            break;
          }
        }
        
        tracker.logGameEvent(`Progress indicator (turn ${playerTurn + 1})`, {
          found: progressFound,
          text: progressText
        });
        
        await tracker.takeScreenshot(`notifications-turn-${playerTurn + 1}`);
        
        // Continue to next
        const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
        if (await continueButton.count() > 0) {
          // Check continue button text for contextual information
          const buttonText = await continueButton.first().textContent();
          const isLastPlayer = playerTurn === playerNames.length - 1;
          
          tracker.logGameEvent(`Continue button text (turn ${playerTurn + 1})`, {
            text: buttonText,
            isLastPlayer,
            expectingQuestionAdvance: isLastPlayer
          });
          
          await continueButton.first().click();
          await page.waitForTimeout(1500);
        }
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle blame round completion and game ending scenarios', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'game-completion');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const playerNames = await setupFullNameBlameGame(page, tracker);
    
    // Play through several rounds to test game completion
    let roundsCompleted = 0;
    const maxRounds = 10; // Limit to prevent infinite loops
    
    while (roundsCompleted < maxRounds) {
      tracker.logUserAction(`--- Round ${roundsCompleted + 1} ---`);
      
      // Check if we're still in the game or reached summary
      const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
      const summaryScreen = page.getByText(/zusammenfassung|summary|spiel.*beendet|game.*over/i);
      
      const inGame = await gameScreen.count() > 0;
      const inSummary = await summaryScreen.count() > 0;
      
      if (inSummary) {
        tracker.logGameEvent('Game reached summary screen', { roundsCompleted });
        break;
      }
      
      if (!inGame) {
        tracker.logGameEvent('Game ended without summary screen', { roundsCompleted });
        break;
      }
      
      // Complete a blame round
      let blameActionsCompleted = 0;
      for (let playerTurn = 0; playerTurn < playerNames.length; playerTurn++) {
        // Find available player button
        const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(playerNames.join('|'), 'i') });
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
          await availableButton.click();
          await page.waitForTimeout(1000);
          
          const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
          if (await continueButton.count() > 0) {
            await continueButton.first().click();
            await page.waitForTimeout(1000);
            blameActionsCompleted++;
          } else {
            // Might have reached end of game
            break;
          }
        } else {
          // No available buttons - might be end of game
          break;
        }
      }
      
      if (blameActionsCompleted === 0) {
        tracker.logGameEvent('No blame actions possible - game may have ended');
        break;
      }
      
      roundsCompleted++;
      
      // Take periodic screenshots
      if (roundsCompleted % 3 === 0) {
        await tracker.takeScreenshot(`round-${roundsCompleted}-progress`);
      }
    }
    
    await tracker.takeScreenshot('final-game-state');
    
    // Check final state
    const summaryScreen = page.getByText(/zusammenfassung|summary|spiel.*beendet|game.*over/i);
    const restartButton = page.getByRole('button', { name: /neustart|restart|new.*game/i });
    
    const reachedSummary = await summaryScreen.count() > 0;
    const hasRestartOption = await restartButton.count() > 0;
    
    tracker.logGameEvent('Game completion verification', {
      roundsCompleted,
      reachedSummary,
      hasRestartOption
    });
    
    // Either should reach summary or complete multiple rounds successfully
    expect(roundsCompleted > 0 || reachedSummary).toBe(true);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should maintain consistent player order and rotation', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'player-rotation-consistency');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const playerNames = await setupFullNameBlameGame(page, tracker, ['Alpha', 'Beta', 'Gamma', 'Delta']);
    
    // Track player turns for multiple rounds
    const turnHistory: Array<{round: number, turn: number, currentPlayer: string, availablePlayers: string[]}> = [];
    
    for (let round = 1; round <= 3; round++) {
      tracker.logUserAction(`=== Round ${round} rotation tracking ===`);
      
      for (let turn = 0; turn < playerNames.length; turn++) {
        // Identify current player
        const currentPlayerIndicator = page.getByText(/.*ist dran|.*turn/i);
        let currentPlayer = 'Unknown';
        
        if (await currentPlayerIndicator.count() > 0) {
          const indicatorText = await currentPlayerIndicator.first().textContent();
          currentPlayer = indicatorText?.split(' ')[0] || 'Unknown';
        }
        
        // Get available players (buttons that are enabled)
        const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(playerNames.join('|'), 'i') });
        const availablePlayers: string[] = [];
        
        for (let i = 0; i < await playerButtons.count(); i++) {
          const button = playerButtons.nth(i);
          const isDisabled = await button.isDisabled();
          
          if (!isDisabled) {
            const buttonText = await button.textContent();
            if (buttonText) {
              availablePlayers.push(buttonText);
            }
          }
        }
        
        turnHistory.push({
          round,
          turn,
          currentPlayer,
          availablePlayers
        });
        
        tracker.logGameEvent(`Round ${round}, Turn ${turn + 1}`, {
          currentPlayer,
          availableCount: availablePlayers.length,
          availablePlayers
        });
        
        // Perform blame action
        if (availablePlayers.length > 0) {
          const targetButton = playerButtons.filter({ hasText: availablePlayers[0] }).first();
          await targetButton.click();
          await page.waitForTimeout(1000);
          
          const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
          if (await continueButton.count() > 0) {
            await continueButton.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
    
    // Analyze rotation patterns
    tracker.logGameEvent('Turn history analysis', { totalTurns: turnHistory.length });
    
    // Verify rotation rules
    for (let i = 0; i < turnHistory.length; i++) {
      const turnData = turnHistory[i];
      
      // Rule 1: Current player should not be in available players
      const currentPlayerInAvailable = turnData.availablePlayers.includes(turnData.currentPlayer);
      expect(currentPlayerInAvailable).toBe(false);
      
      // Rule 2: Should have (total players - 1) available players
      const expectedAvailable = playerNames.length - 1;
      expect(turnData.availablePlayers.length).toBe(expectedAvailable);
      
      tracker.logGameEvent(`Rotation validation (${turnData.round}-${turnData.turn + 1})`, {
        currentPlayerExcluded: !currentPlayerInAvailable,
        correctAvailableCount: turnData.availablePlayers.length === expectedAvailable
      });
    }
    
    await tracker.takeScreenshot('rotation-consistency-completed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});