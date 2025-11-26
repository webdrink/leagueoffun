/**
 * Comprehensive NameBlame UI Feedback Tests
 * 
 * This test suite covers all UI feedback aspects in NameBlame mode:
 * - Button states (enabled/disabled) throughout the flow
 * - Visual feedback for user actions
 * - Loading states and transitions
 * - Error states and recovery
 * - Responsive design elements
 * - Accessibility features
 */

import { test, expect, Page } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame UI Feedback & States', () => {
  
  // Helper function to set up NameBlame game and capture initial state
  const setupGameAndCaptureState = async (page: Page, tracker: ReturnType<typeof createGameStateTracker>) => {
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
    
    // Add 3 players
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
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
    
    tracker.logUserAction('Set up NameBlame game for UI testing');
    return players;
  };
  
  test('should show correct button states throughout blame flow', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'button-states-flow');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const players = await setupGameAndCaptureState(page, tracker);
    
    // Verify initial game state
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameReached = await gameScreen.count() > 0;
    expect(gameReached).toBe(true);
    
    await tracker.takeScreenshot('initial-button-states');
    
    // Test 1: Initial blame selection state
    const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(players.join('|'), 'i') });
    const totalButtons = await playerButtons.count();
    let enabledButtons = 0;
    let disabledButtons = 0;
    
    const buttonStates: Array<{name: string, enabled: boolean}> = [];
    
    for (let i = 0; i < totalButtons; i++) {
      const button = playerButtons.nth(i);
      const buttonText = await button.textContent() || 'Unknown';
      const isEnabled = await button.isEnabled();
      
      buttonStates.push({ name: buttonText, enabled: isEnabled });
      
      if (isEnabled) {
        enabledButtons++;
      } else {
        disabledButtons++;
      }
    }
    
    tracker.logGameEvent('Initial button states', {
      total: totalButtons,
      enabled: enabledButtons,
      disabled: disabledButtons,
      states: buttonStates
    });
    
    // Should have exactly (total players - 1) enabled buttons (current player disabled)
    expect(enabledButtons).toBe(players.length - 1);
    expect(disabledButtons).toBe(1);
    
    // Test 2: Blame action and button state changes
    const enabledButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
    const targetPlayerName = await enabledButton.textContent();
    
    await enabledButton.click();
    tracker.logUserAction(`Blamed ${targetPlayerName} - checking button states`);
    await page.waitForTimeout(2000);
    
    await tracker.takeScreenshot('after-blame-button-states');
    
    // After blame, all player buttons should be disabled or hidden
    const playerButtonsAfterBlame = page.getByRole('button').filter({ hasText: new RegExp(players.join('|'), 'i') });
    const afterBlameCount = await playerButtonsAfterBlame.count();
    
    tracker.logGameEvent('Button states after blame', { 
      buttonCount: afterBlameCount,
      action: 'blame_completed'
    });
    
    // Should either have no player buttons or all disabled
    if (afterBlameCount > 0) {
      for (let i = 0; i < afterBlameCount; i++) {
        const button = playerButtonsAfterBlame.nth(i);
        const isEnabled = await button.isEnabled();
        expect(isEnabled).toBe(false);
      }
    }
    
    // Test 3: Continue button state
    const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
    const continueButtonExists = await continueButton.count() > 0;
    expect(continueButtonExists).toBe(true);
    
    const continueButtonEnabled = await continueButton.first().isEnabled();
    expect(continueButtonEnabled).toBe(true);
    
    tracker.logGameEvent('Continue button state', { 
      exists: continueButtonExists,
      enabled: continueButtonEnabled 
    });
    
    // Test 4: State after continue
    await continueButton.first().click();
    await page.waitForTimeout(2000);
    
    await tracker.takeScreenshot('after-continue-button-states');
    
    // Should be back to player selection state for next player
    const newPlayerButtons = page.getByRole('button').filter({ hasText: new RegExp(players.join('|'), 'i') });
    const newEnabledCount = await newPlayerButtons.count();
    
    if (newEnabledCount > 0) {
      let newEnabledButtons = 0;
      for (let i = 0; i < newEnabledCount; i++) {
        const button = newPlayerButtons.nth(i);
        const isEnabled = await button.isEnabled();
        if (isEnabled) newEnabledButtons++;
      }
      
      tracker.logGameEvent('Button states after continue', {
        totalButtons: newEnabledCount,
        enabledButtons: newEnabledButtons
      });
      
      // Should again have (total players - 1) enabled buttons
      expect(newEnabledButtons).toBe(players.length - 1);
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should provide proper visual feedback for user interactions', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'visual-feedback');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupGameAndCaptureState(page, tracker);
    
    // Test 1: Button hover states
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    const enabledButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
    
    if (await enabledButton.count() > 0) {
      // Hover over button
      await enabledButton.hover();
      await page.waitForTimeout(500);
      
      // Check for visual changes (hover effects)
      const buttonStyles = await enabledButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          transform: styles.transform,
          boxShadow: styles.boxShadow,
          cursor: styles.cursor
        };
      });
      
      tracker.logGameEvent('Button hover styles', buttonStyles);
      
      // Should have pointer cursor for enabled buttons
      expect(buttonStyles.cursor).toBe('pointer');
      
      await tracker.takeScreenshot('button-hover-state');
    }
    
    // Test 2: Click feedback and animations
    if (await enabledButton.count() > 0) {
      const targetName = await enabledButton.textContent();
      
      // Monitor for click animations/feedback
      const beforeClick = await page.screenshot({ type: 'png' });
      await enabledButton.click();
      await page.waitForTimeout(500);
      const afterClick = await page.screenshot({ type: 'png' });
      
      // Screenshots should be different (visual change occurred)
      const screenshotsIdentical = beforeClick.equals(afterClick);
      expect(screenshotsIdentical).toBe(false);
      
      tracker.logGameEvent('Click visual feedback', {
        targetPlayer: targetName,
        visualChangeDetected: !screenshotsIdentical
      });
      
      await tracker.takeScreenshot('after-click-feedback');
    }
    
    // Test 3: Loading and transition states
    const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
    if (await continueButton.count() > 0) {
      await continueButton.click();
      
      // Check for loading/transition indicators during navigation
      const loadingIndicators = [
        page.locator('.loading, .spinner'),
        page.getByText(/loading|laden/i),
        page.locator('[data-testid*="loading"]')
      ];
      
      let loadingDetected = false;
      for (const indicator of loadingIndicators) {
        if (await indicator.count() > 0) {
          loadingDetected = true;
          tracker.logGameEvent('Loading indicator detected during transition');
          break;
        }
      }
      
      await page.waitForTimeout(2000);
      
      tracker.logGameEvent('Transition feedback', { loadingDetected });
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle error states and provide recovery options', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'error-states-recovery');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test 1: Error handling in player setup
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
    
    // Try to start game without enough players
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    const initialButtonState = await startGameButton.first().isEnabled();
    
    tracker.logGameEvent('Initial start button state (no players)', { enabled: initialButtonState });
    expect(initialButtonState).toBe(false);
    
    // Check for error/hint message
    const hintMessage = page.getByText(/mindestens.*3.*spieler|minimum.*3.*player/i);
    const hintVisible = await hintMessage.count() > 0;
    expect(hintVisible).toBe(true);
    
    tracker.logGameEvent('Error state hint message', { visible: hintVisible });
    await tracker.takeScreenshot('error-state-insufficient-players');
    
    // Test 2: Recovery from error state
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    // Add players to recover from error
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
      
      // Check button state after each addition
      const buttonEnabled = await startGameButton.first().isEnabled();
      const expectedEnabled = players.indexOf(playerName) >= 2; // Should enable after 3rd player
      
      tracker.logGameEvent(`After adding ${playerName}`, {
        playersCount: players.indexOf(playerName) + 1,
        buttonEnabled,
        expectedEnabled
      });
      
      if (players.indexOf(playerName) >= 2) {
        expect(buttonEnabled).toBe(true);
      }
    }
    
    await tracker.takeScreenshot('recovered-from-error-state');
    
    // Test 3: Network/loading error simulation (if applicable)
    // Start the game and monitor for any error states
    await startGameButton.first().click();
    await page.waitForTimeout(5000); // Wait longer to catch potential errors
    
    // Check for error messages
    const errorMessages = [
      page.getByText(/fehler|error|problem/i),
      page.locator('.error, .alert-error'),
      page.getByText(/nicht.*laden|failed.*load/i)
    ];
    
    let errorDetected = false;
    let errorText = '';
    
    for (const errorMsg of errorMessages) {
      if (await errorMsg.count() > 0) {
        errorDetected = true;
        errorText = await errorMsg.first().textContent() || '';
        break;
      }
    }
    
    tracker.logGameEvent('Error detection during game start', {
      errorDetected,
      errorText: errorText.substring(0, 100)
    });
    
    // If no errors, should reach game screen
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameReached = await gameScreen.count() > 0;
    
    if (!errorDetected) {
      expect(gameReached).toBe(true);
      tracker.logGameEvent('Game started successfully without errors');
    } else {
      // Check for recovery options
      const retryButton = page.getByRole('button', { name: /wiederholen|retry|try.*again/i });
      const backButton = page.getByRole('button', { name: /zurück|back/i });
      
      const hasRecoveryOptions = (await retryButton.count() > 0) || (await backButton.count() > 0);
      tracker.logGameEvent('Error recovery options', { available: hasRecoveryOptions });
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5); // Allow more errors since we're testing error states
  });
  
  test('should maintain responsive design across different screen sizes', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'responsive-design');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const players = await setupGameAndCaptureState(page, tracker);
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 667, name: 'Mobile Small' },
      { width: 414, height: 896, name: 'Mobile Large' }
    ];
    
    for (const viewport of viewports) {
      tracker.logUserAction(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Check if game elements are visible and properly positioned
      const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
      const playerButtons = page.getByRole('button').filter({ hasText: new RegExp(players.join('|'), 'i') });
      
      const gameVisible = await gameScreen.count() > 0;
      const buttonsVisible = await playerButtons.count() > 0;
      
      // Check if elements are within viewport
      if (gameVisible) {
        const gameElement = gameScreen.first();
        const gameBoundingBox = await gameElement.boundingBox();
        const gameInViewport = gameBoundingBox && 
          gameBoundingBox.x >= 0 && 
          gameBoundingBox.y >= 0 && 
          gameBoundingBox.x + gameBoundingBox.width <= viewport.width &&
          gameBoundingBox.y + gameBoundingBox.height <= viewport.height;
        
        tracker.logGameEvent(`${viewport.name} - Game element visibility`, {
          visible: gameVisible,
          inViewport: gameInViewport,
          boundingBox: gameBoundingBox
        });
      }
      
      // Check button layout
      if (buttonsVisible) {
        const buttonCount = await playerButtons.count();
        let buttonsInViewport = 0;
        
        for (let i = 0; i < buttonCount; i++) {
          const button = playerButtons.nth(i);
          const buttonBox = await button.boundingBox();
          
          if (buttonBox && 
              buttonBox.x >= 0 && 
              buttonBox.y >= 0 && 
              buttonBox.x + buttonBox.width <= viewport.width &&
              buttonBox.y + buttonBox.height <= viewport.height) {
            buttonsInViewport++;
          }
        }
        
        tracker.logGameEvent(`${viewport.name} - Button layout`, {
          totalButtons: buttonCount,
          buttonsInViewport,
          allButtonsVisible: buttonsInViewport === buttonCount
        });
        
        // All buttons should be visible in viewport
        expect(buttonsInViewport).toBe(buttonCount);
      }
      
      await tracker.takeScreenshot(`responsive-${viewport.name.toLowerCase().replace(' ', '-')}`);
    }
    
    // Reset to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should provide accessible UI elements and keyboard navigation', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'accessibility-features');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupGameAndCaptureState(page, tracker);
    
    // Test 1: ARIA labels and roles
    const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
    const buttonCount = await playerButtons.count();
    
    let buttonsWithAriaLabels = 0;
    let buttonsWithRoles = 0;
    
    for (let i = 0; i < buttonCount; i++) {
      const button = playerButtons.nth(i);
      
      // Check for ARIA label or accessible name
      const ariaLabel = await button.getAttribute('aria-label');
      const accessibleName = await button.evaluate((el) => el.textContent || el.getAttribute('aria-label') || '');
      
      if (ariaLabel || accessibleName.trim()) {
        buttonsWithAriaLabels++;
      }
      
      // Check for proper role
      const role = await button.getAttribute('role');
      if (role === 'button' || await button.evaluate((el) => el.tagName.toLowerCase() === 'button')) {
        buttonsWithRoles++;
      }
    }
    
    tracker.logGameEvent('Accessibility - ARIA labels and roles', {
      totalButtons: buttonCount,
      buttonsWithAriaLabels,
      buttonsWithRoles,
      percentageAccessible: Math.round((buttonsWithAriaLabels / buttonCount) * 100)
    });
    
    expect(buttonsWithAriaLabels).toBe(buttonCount);
    expect(buttonsWithRoles).toBe(buttonCount);
    
    // Test 2: Keyboard navigation
    // Focus on first enabled button
    const enabledButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
    
    if (await enabledButton.count() > 0) {
      await enabledButton.focus();
      await page.waitForTimeout(500);
      
      // Check if button is properly focused
      const isFocused = await enabledButton.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
      
      tracker.logGameEvent('Keyboard navigation - Button focus', { focused: isFocused });
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
      
      // Should move focus to next interactive element
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      const focusedTagName = await focusedElement.evaluate((el) => el?.tagName.toLowerCase());
      
      tracker.logGameEvent('Keyboard navigation - Tab movement', { 
        focusedElement: focusedTagName 
      });
      
      // Test Enter key activation
      await enabledButton.focus();
      await page.waitForTimeout(300);
      
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Should trigger blame action
      const continueButton = page.getByRole('button', { name: /continue|weiter|next/i });
      const blameActionTriggered = await continueButton.count() > 0;
      expect(blameActionTriggered).toBe(true);
      
      tracker.logGameEvent('Keyboard activation - Enter key', { actionTriggered: blameActionTriggered });
    }
    
    // Test 3: Screen reader friendly content
    const gameContent = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    if (await gameContent.count() > 0) {
      const contentText = await gameContent.first().textContent();
      const hasStructuredContent = contentText && contentText.length > 0;
      
      tracker.logGameEvent('Screen reader content', {
        hasStructuredContent,
        contentLength: contentText?.length || 0
      });
      
      expect(hasStructuredContent).toBe(true);
    }
    
    await tracker.takeScreenshot('accessibility-features');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});