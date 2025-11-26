/**
 * Comprehensive NameBlame Category Selection Tests
 * 
 * This test suite covers category selection scenarios in NameBlame mode:
 * - Random category selection flow
 * - Manual category selection with multiple categories
 * - Category validation and loading states
 * - UI feedback during category selection process
 * - Integration with player setup and game flow
 */

import { test, expect, Page } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('NameBlame Category Selection', () => {
  
  // Helper function to set up NameBlame mode with 3 players
  const setupNameBlameWith3Players = async (page: Page, tracker: ReturnType<typeof createGameStateTracker>) => {
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
    
    // Add 3 players quickly
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    const players = ['Alice', 'Bob', 'Charlie'];
    for (const playerName of players) {
      await playerInput.fill(playerName);
      await addButton.click();
      await page.waitForTimeout(300);
    }
    
    tracker.logUserAction('Set up NameBlame mode with 3 players');
  };
  
  test('should handle random category selection flow in NameBlame mode', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-random-category');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupNameBlameWith3Players(page, tracker);
    
    // Start the game to see if we get category selection
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    tracker.logUserAction('Started game - checking for category selection');
    await page.waitForTimeout(3000);
    
    // Check if we land on category selection screen or game directly
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    
    const onCategoryScreen = await categoryScreen.count() > 0;
    const onGameScreen = await gameScreen.count() > 0;
    
    tracker.logGameEvent('Initial navigation after start', {
      onCategoryScreen,
      onGameScreen
    });
    
    if (onCategoryScreen) {
      await tracker.takeScreenshot('category-selection-screen');
      
      // Test random category selection
      const randomButton = page.getByRole('button', { name: /random|zufällig|surprise|überraschung/i })
        .or(page.getByRole('button', { name: /alle kategorien|all categories/i }));
      
      if (await randomButton.count() > 0) {
        await randomButton.first().click();
        tracker.logUserAction('Selected random categories');
        await page.waitForTimeout(2000);
        
        // Should proceed to game
        const gameStarted = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).count() > 0;
        expect(gameStarted).toBe(true);
        tracker.logGameEvent('Game started after random category selection', { success: gameStarted });
        
        await tracker.takeScreenshot('game-started-random-categories');
        
        // Verify NameBlame functionality works
        const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
        const hasPlayerButtons = await playerButtons.count() > 0;
        expect(hasPlayerButtons).toBe(true);
        tracker.logGameEvent('NameBlame interface active', { playerButtonsVisible: hasPlayerButtons });
      } else {
        tracker.logGameEvent('Random category button not found - might go directly to game');
      }
    } else if (onGameScreen) {
      tracker.logGameEvent('Game started directly without category selection');
      
      // Verify NameBlame functionality works
      const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
      const hasPlayerButtons = await playerButtons.count() > 0;
      expect(hasPlayerButtons).toBe(true);
      tracker.logGameEvent('NameBlame interface active in direct start', { playerButtonsVisible: hasPlayerButtons });
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle manual category selection with multiple categories', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-manual-categories');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupNameBlameWith3Players(page, tracker);
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Look for category selection screen
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
    const onCategoryScreen = await categoryScreen.count() > 0;
    
    if (onCategoryScreen) {
      await tracker.takeScreenshot('manual-category-selection');
      
      // Look for specific category buttons/checkboxes
      const categorySelectors = [
        page.getByRole('button').filter({ hasText: /freunde|friends/i }),
        page.getByRole('button').filter({ hasText: /familie|family/i }),
        page.getByRole('button').filter({ hasText: /party/i }),
        page.getByRole('button').filter({ hasText: /klassisch|classic/i }),
        page.getByRole('checkbox'),
        page.locator('[data-testid*="category"]'),
        page.locator('.category-button'),
        page.locator('.category-item')
      ];
      
      let selectedCategories = 0;
      const maxCategories = 3;
      
      for (const selector of categorySelectors) {
        const count = await selector.count();
        if (count > 0) {
          // Select first few categories found
          for (let i = 0; i < Math.min(count, maxCategories - selectedCategories); i++) {
            const element = selector.nth(i);
            const elementText = await element.textContent();
            
            // Skip if this is a random/all button
            if (elementText && !/random|zufällig|alle|all/i.test(elementText)) {
              await element.click();
              selectedCategories++;
              tracker.logUserAction(`Selected category: ${elementText}`);
              await page.waitForTimeout(500);
              
              if (selectedCategories >= maxCategories) break;
            }
          }
          if (selectedCategories >= maxCategories) break;
        }
      }
      
      tracker.logGameEvent('Manual category selection completed', { categoriesSelected: selectedCategories });
      
      // Look for continue/start button after category selection
      const continueButton = page.getByRole('button', { name: /weiter|continue|start.*spiel|begin/i });
      if (await continueButton.count() > 0) {
        await continueButton.first().click();
        tracker.logUserAction('Proceeded with selected categories');
        await page.waitForTimeout(2000);
        
        // Should reach the game
        const gameStarted = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).count() > 0;
        expect(gameStarted).toBe(true);
        tracker.logGameEvent('Game started after manual category selection', { success: gameStarted });
        
        await tracker.takeScreenshot('game-started-manual-categories');
      } else {
        // Maybe categories auto-start the game
        await page.waitForTimeout(2000);
        const gameStarted = await page.getByText(/frage.*\d+.*von|question.*\d+.*of/i).count() > 0;
        if (gameStarted) {
          tracker.logGameEvent('Game auto-started after category selection', { success: true });
        }
      }
    } else {
      tracker.logGameEvent('No category selection screen found - app may use default categories');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should validate category selection requirements and loading states', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'category-validation-loading');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupNameBlameWith3Players(page, tracker);
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(1000);
    
    // Monitor loading states
    const loadingIndicators = [
      page.getByText(/loading|laden|wird geladen/i),
      page.locator('.spinner, .loading'),
      page.getByRole('progressbar'),
      page.locator('[data-testid*="loading"]')
    ];
    
    let foundLoading = false;
    for (const indicator of loadingIndicators) {
      if (await indicator.count() > 0) {
        foundLoading = true;
        tracker.logGameEvent('Loading indicator detected');
        break;
      }
    }
    
    await page.waitForTimeout(3000); // Wait for loading to complete
    
    // Check final state
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const errorScreen = page.getByText(/fehler|error|problem/i);
    
    const onCategoryScreen = await categoryScreen.count() > 0;
    const onGameScreen = await gameScreen.count() > 0;
    const hasError = await errorScreen.count() > 0;
    
    tracker.logGameEvent('Final state after loading', {
      foundLoading,
      onCategoryScreen,
      onGameScreen,
      hasError
    });
    
    // Should either be on category screen or game screen, not error
    expect(hasError).toBe(false);
    expect(onCategoryScreen || onGameScreen).toBe(true);
    
    await tracker.takeScreenshot('post-loading-state');
    
    if (onCategoryScreen) {
      // Test category selection validation
      const continueButton = page.getByRole('button', { name: /weiter|continue|start/i });
      
      if (await continueButton.count() > 0) {
        // Try to continue without selecting categories
        const buttonEnabled = await continueButton.first().isEnabled();
        tracker.logGameEvent('Continue button initial state', { enabled: buttonEnabled });
        
        if (!buttonEnabled) {
          // Button should be disabled until categories are selected
          tracker.logGameEvent('Continue button properly disabled without category selection');
          
          // Select a category
          const categoryButtons = page.getByRole('button').filter({ hasText: /freunde|familie|party|klassisch/i });
          if (await categoryButtons.count() > 0) {
            await categoryButtons.first().click();
            tracker.logUserAction('Selected category for validation test');
            await page.waitForTimeout(500);
            
            // Button should now be enabled
            const buttonEnabledNow = await continueButton.first().isEnabled();
            expect(buttonEnabledNow).toBe(true);
            tracker.logGameEvent('Continue button enabled after category selection', { enabled: buttonEnabledNow });
          }
        } else {
          // If button is enabled, maybe random/all is pre-selected
          tracker.logGameEvent('Continue button enabled by default - may have default selection');
        }
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should integrate category selection with NameBlame game flow', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'category-nameblame-integration');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupNameBlameWith3Players(page, tracker);
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Go through category selection (if present) to reach the game
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
    if (await categoryScreen.count() > 0) {
      // Use random selection for speed
      const randomButton = page.getByRole('button', { name: /random|zufällig|alle kategorien|all categories/i });
      if (await randomButton.count() > 0) {
        await randomButton.first().click();
        tracker.logUserAction('Used random category selection for integration test');
        await page.waitForTimeout(2000);
      } else {
        // Manual selection fallback
        const categoryButtons = page.getByRole('button').filter({ hasText: /freunde|familie|party/i });
        if (await categoryButtons.count() > 0) {
          await categoryButtons.first().click();
          tracker.logUserAction('Manual category selection for integration test');
          await page.waitForTimeout(500);
          
          const continueButton = page.getByRole('button', { name: /weiter|continue|start/i });
          if (await continueButton.count() > 0) {
            await continueButton.first().click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }
    
    // Verify we reached the NameBlame game screen
    const gameScreen = page.getByText(/frage.*\d+.*von|question.*\d+.*of/i);
    const gameReached = await gameScreen.count() > 0;
    expect(gameReached).toBe(true);
    tracker.logGameEvent('NameBlame game reached after category selection', { success: gameReached });
    
    if (gameReached) {
      await tracker.takeScreenshot('nameblame-game-after-categories');
      
      // Test that NameBlame functionality works properly
      const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
      const hasPlayerButtons = await playerButtons.count() > 0;
      expect(hasPlayerButtons).toBe(true);
      tracker.logGameEvent('NameBlame player buttons available', { available: hasPlayerButtons });
      
      // Test current player indicator
      const currentPlayerIndicator = page.getByText(/alice.*ist dran|bob.*ist dran|charlie.*ist dran|alice.*turn|bob.*turn|charlie.*turn/i);
      const hasCurrentPlayerIndicator = await currentPlayerIndicator.count() > 0;
      tracker.logGameEvent('Current player indicator present', { present: hasCurrentPlayerIndicator });
      
      // Test question content
      const questionContent = page.locator('.question-text, .font-bold').filter({ hasText: /wer|who|was|what/i });
      const hasQuestionContent = await questionContent.count() > 0;
      expect(hasQuestionContent).toBe(true);
      tracker.logGameEvent('Question content loaded', { loaded: hasQuestionContent });
      
      // Perform a blame action to verify complete integration
      const enabledPlayerButton = playerButtons.filter({ hasNotText: /disabled/i }).first();
      if (await enabledPlayerButton.count() > 0) {
        const buttonText = await enabledPlayerButton.textContent();
        await enabledPlayerButton.click();
        tracker.logUserAction(`Blamed player: ${buttonText}`);
        await page.waitForTimeout(2000);
        
        // Should see blame notification or acknowledgement
        const blameNotification = page.locator('.fixed.top-4, .notification, .toast');
        const blameAck = page.getByRole('button', { name: /continue|weiter|next|ok/i });
        
        const hasBlameResponse = (await blameNotification.count() > 0) || (await blameAck.count() > 0);
        expect(hasBlameResponse).toBe(true);
        tracker.logGameEvent('Blame action produced proper response', { hasResponse: hasBlameResponse });
        
        await tracker.takeScreenshot('blame-action-after-categories');
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle category selection with different question counts', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'category-question-counts');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    await setupNameBlameWith3Players(page, tracker);
    
    const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
    await startGameButton.click();
    await page.waitForTimeout(3000);
    
    // Look for category selection with question counts
    const categoryScreen = page.getByText(/kategorie.*auswählen|choose.*category|select.*category/i);
    if (await categoryScreen.count() > 0) {
      await tracker.takeScreenshot('category-screen-with-counts');
      
      // Look for question count indicators
      const questionCounts = page.locator('text=/\\d+.*frage|\\d+.*question/i');
      const countElements = await questionCounts.count();
      
      tracker.logGameEvent('Question count indicators found', { count: countElements });
      
      if (countElements > 0) {
        // Test selecting categories with different question counts
        for (let i = 0; i < Math.min(countElements, 3); i++) {
          const countElement = questionCounts.nth(i);
          const countText = await countElement.textContent();
          
          // Find the associated category button
          const categoryButton = countElement.locator('xpath=..').getByRole('button').first();
          if (await categoryButton.count() > 0) {
            await categoryButton.click();
            tracker.logUserAction(`Selected category with count: ${countText}`);
            await page.waitForTimeout(300);
          }
        }
        
        // Continue to game
        const continueButton = page.getByRole('button', { name: /weiter|continue|start/i });
        if (await continueButton.count() > 0) {
          await continueButton.first().click();
          await page.waitForTimeout(2000);
        }
        
        // Verify total question count is displayed correctly in game
        const totalQuestions = page.getByText(/\d+.*von.*\d+|\d+.*of.*\d+/);
        if (await totalQuestions.count() > 0) {
          const totalText = await totalQuestions.first().textContent();
          tracker.logGameEvent('Total questions displayed in game', { text: totalText });
          
          // Should show reasonable total (not 0 or extremely high)
          const numbers = totalText?.match(/\d+/g);
          if (numbers && numbers.length >= 2) {
            const current = parseInt(numbers[0]);
            const total = parseInt(numbers[1]);
            
            expect(current).toBeGreaterThan(0);
            expect(total).toBeGreaterThan(0);
            expect(total).toBeLessThanOrEqual(200); // Reasonable upper limit
            
            tracker.logGameEvent('Question count validation', { current, total });
          }
        }
      }
    } else {
      tracker.logGameEvent('No category selection screen - using default questions');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});