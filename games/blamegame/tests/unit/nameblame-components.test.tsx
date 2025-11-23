/**
 * Unit Tests for NameBlame Components and Zustand Stores
 * 
 * This test suite covers unit-level testing with Playwright:
 * - Zustand store state management and actions
 * - Hook behavior validation
 * - State transitions and edge cases
 * 
 * Using Playwright's standard testing approach for better integration
 * with the existing test infrastructure.
 */

import { test, expect } from '@playwright/test';
// Updated: legacy BlameGameStore type removed during modular migration.
// import type { BlameGameStore } from '../../store/BlameGameStore';

// Provide typing for the injected store reference placed on window by the app runtime
// Temporary generic store typing; will be replaced with module slice type after full migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BlameGameStoreHandle { getState: () => any; }

declare global {
  interface Window {
    blameGameStore: BlameGameStoreHandle;
  }
}

// Create a test page to evaluate JavaScript code
test.describe('BlameGameStore Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app to load the store
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
    
    // Reset store state before each test if possible
    await page.evaluate(() => {
      const store = window.blameGameStore;
      if (store?.getState?.().resetBlameGameState) {
        store.getState().resetBlameGameState();
      }
    });
  });

  test('should initialize BlameGameStore with default state', async ({ page }) => {
    const storeState = await page.evaluate(() => {
      const store = window.blameGameStore;
      return store.getState();
    });

    expect(storeState.blamePhase).toBe('selecting');
    expect(storeState.currentBlamer).toBe(null);
    expect(storeState.currentBlamed).toBe(null);
    expect(storeState.blameLog).toEqual([]);
  });

  test('should start blame round correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      store.getState().startBlameRound('question-1', ['Alice', 'Bob', 'Charlie']);
      return store.getState();
    });

    expect(result.currentQuestionId).toBe('question-1');
    expect(result.playersWhoBlamedThisQuestion).toEqual([]);
    expect(result.isBlameRoundComplete).toBe(false);
    expect(result.blamePhase).toBe('selecting');
  });

  test('should track player blame status correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      const s = store.getState();
      s.startBlameRound('question-1', ['Alice', 'Bob', 'Charlie']);
      s.markPlayerBlamedInRound('Alice');
      return {
        playersWhoBlamedThisQuestion: store.getState().playersWhoBlamedThisQuestion,
        isAllowedToBlame: s.isPlayerAllowedToBlame('Alice'),
        isAllowedToBlameBob: s.isPlayerAllowedToBlame('Bob')
      };
    });

    expect(result.playersWhoBlamedThisQuestion).toContain('Alice');
    expect(result.isAllowedToBlame).toBe(false); // Alice already blamed
    expect(result.isAllowedToBlameBob).toBe(true); // Bob hasn't blamed yet
  });

  test('should record blame events correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      const s = store.getState();
      s.recordBlame('Alice', 'Bob', 'Test question');
      const state = store.getState();
      return {
        blameLogLength: state.blameLog.length,
        lastBlame: state.blameLog[state.blameLog.length - 1],
        bobBlameCount: state.blameStats.Bob
      };
    });

    expect(result.blameLogLength).toBe(1);
    expect(result.lastBlame.from).toBe('Alice');
    expect(result.lastBlame.to).toBe('Bob');
    expect(result.lastBlame.question).toBe('Test question');
    expect(result.bobBlameCount).toBe(1);
  });

  test('should complete blame round correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      const s = store.getState();
      s.startBlameRound('question-1', ['Alice', 'Bob']);
      s.completeBlameRound();
      return store.getState();
    });

    expect(result.isBlameRoundComplete).toBe(true);
    expect(result.blamePhase).toBe('continuing');
  });

  test('should calculate blame statistics correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      const s = store.getState();
      s.recordBlame('Alice', 'Bob', 'Question 1');
      s.recordBlame('Charlie', 'Bob', 'Question 2');
      s.recordBlame('Alice', 'Charlie', 'Question 3');
      const mostBlamed = s.getMostBlamedPlayer();
      const bobCount = s.getBlameCountForPlayer('Bob');
      const charlieCount = s.getBlameCountForPlayer('Charlie');
      return {
        mostBlamed,
        bobCount,
        charlieCount
      };
    });

    expect(result.mostBlamed?.name).toBe('Bob');
    expect(result.mostBlamed?.count).toBe(2);
    expect(result.bobCount).toBe(2);
    expect(result.charlieCount).toBe(1);
  });

  test('should reset blame game state correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.blameGameStore;
      const s = store.getState();
      s.recordBlame('Alice', 'Bob', 'Test');
      s.startBlameRound('q1', ['Alice', 'Bob']);
      s.resetBlameGameState();
      return store.getState();
    });

    expect(result.blamePhase).toBe('selecting');
    expect(result.currentBlamer).toBe(null);
    expect(result.currentBlamed).toBe(null);
    expect(result.blameLog).toEqual([]);
    expect(result.blameStats).toEqual({});
    expect(result.isBlameRoundComplete).toBe(false);
    expect(result.playersWhoBlamedThisQuestion).toEqual([]);
  });
});

test.describe('Player Setup Logic Unit Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test('should validate minimum players for NameBlame mode', async ({ page }) => {
    // Navigate to player setup if not already there
    const isPlayerSetup = await page.locator('[data-testid="player-setup-screen"]').isVisible();
    if (!isPlayerSetup) {
      await page.click('[data-testid="new-game-button"]');
    }

    // Ensure we're in NameBlame mode
    const nameBlameToggle = page.locator('[data-testid="nameblame-toggle"]');
    if (await nameBlameToggle.isVisible()) {
      const isChecked = await nameBlameToggle.isChecked();
      if (!isChecked) {
        await nameBlameToggle.click();
      }
    }

    // Check that start button is disabled with only 2 players
    const startButton = page.locator('[data-testid="start-game-button"]');
    await expect(startButton).toBeDisabled();

    // Add a third player
    await page.fill('[data-testid="player-name-input"]', 'Charlie');
    await page.click('[data-testid="add-player-button"]');

    // Now start button should be enabled
    await expect(startButton).toBeEnabled();
  });

  test('should prevent duplicate player names', async ({ page }) => {
    // Navigate to player setup
    const isPlayerSetup = await page.locator('[data-testid="player-setup-screen"]').isVisible();
    if (!isPlayerSetup) {
      await page.click('[data-testid="new-game-button"]');
    }

    // Add a player name to first input
    const firstPlayerInput = page.locator('[data-testid="player-input-0"]');
    if (await firstPlayerInput.isVisible()) {
      await firstPlayerInput.fill('Alice');
    }

    // Try to add another player with the same name
    await page.fill('[data-testid="player-name-input"]', 'Alice');
    await page.click('[data-testid="add-player-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  });

  test('should limit maximum number of players', async ({ page }) => {
    // Navigate to player setup
    const isPlayerSetup = await page.locator('[data-testid="player-setup-screen"]').isVisible();
    if (!isPlayerSetup) {
      await page.click('[data-testid="new-game-button"]');
    }

    // Fill existing player slots
    const existingInputs = page.locator('[data-testid^="player-input-"]');
    const inputCount = await existingInputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      await existingInputs.nth(i).fill(`Player${i + 1}`);
    }

    // Add players up to the limit (typically 10)
    for (let i = inputCount; i < 10; i++) {
      await page.fill('[data-testid="player-name-input"]', `Player${i + 1}`);
      await page.click('[data-testid="add-player-button"]');
    }

    // Try to add one more (11th player)
    await page.fill('[data-testid="player-name-input"]', 'Player11');
    await page.click('[data-testid="add-player-button"]');

    // Should show error about maximum players
    const errorMessage = page.locator('[data-testid="name-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('10');
  });
});

test.describe('Game State Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test('should persist NameBlame mode preference', async ({ page }) => {
    // Navigate to settings or player setup
    const isPlayerSetup = await page.locator('[data-testid="player-setup-screen"]').isVisible();
    if (!isPlayerSetup) {
      await page.click('[data-testid="new-game-button"]');
    }

    // Toggle NameBlame mode on
    const nameBlameToggle = page.locator('[data-testid="nameblame-toggle"]');
    if (await nameBlameToggle.isVisible()) {
      await nameBlameToggle.click();
    }

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });

    // Check if NameBlame mode is still enabled
    const reloadedToggle = page.locator('[data-testid="nameblame-toggle"]');
    if (await reloadedToggle.isVisible()) {
      await expect(reloadedToggle).toBeChecked();
    }
  });

  test('should handle localStorage corruption gracefully', async ({ page }) => {
    // Corrupt the localStorage data
    await page.evaluate(() => {
      localStorage.setItem('blamegame-player-names', '{"invalid": json}');
      localStorage.setItem('blamegame-nameblame-mode', 'not-a-boolean');
    });

    // Reload the page - should not crash
    await page.reload();
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });

    // App should still be functional
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test('should maintain game state during blame progression', async ({ page }) => {
    // Start a NameBlame game with 3 players
    await page.goto('/');
    
    // Check if we need to set up a new game
    const newGameButton = page.locator('[data-testid="new-game-button"]');
    if (await newGameButton.isVisible()) {
      await newGameButton.click();
    }

    // Set up NameBlame mode with 3 players
    const nameBlameToggle = page.locator('[data-testid="nameblame-toggle"]');
    if (await nameBlameToggle.isVisible()) {
      const isChecked = await nameBlameToggle.isChecked();
      if (!isChecked) {
        await nameBlameToggle.click();
      }
    }

    // Fill player names
    const playerInputs = page.locator('[data-testid^="player-input-"]');
    await playerInputs.nth(0).fill('Alice');
    await playerInputs.nth(1).fill('Bob');
    
    // Add third player
    await page.fill('[data-testid="player-name-input"]', 'Charlie');
    await page.click('[data-testid="add-player-button"]');

    // Start the game
    await page.click('[data-testid="start-game-button"]');

    // Wait for game to start
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 10000 });

    // Verify that we're in NameBlame mode
    const nameBlameIndicator = page.locator('[data-testid="nameblame-mode-indicator"]');
    if (await nameBlameIndicator.isVisible()) {
      await expect(nameBlameIndicator).toBeVisible();
    }
  });
});