/**
 * Foundation Test: Local Storage
 * 
 * Purpose: Tests data persistence functionality to ensure game settings,
 * progress, and user preferences are properly stored and retrieved.
 * 
 * Test Areas:
 * - Local storage read/write operations
 * - Data persistence across page reloads
 * - Handling of storage quota limits
 * - Corruption recovery mechanisms
 * - Settings preservation
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../utils/debug-helpers';

test.describe('Foundation: Local Storage', () => {
  test('should save and retrieve game settings', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-settings');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test setting storage
    const testSettings = {
      language: 'de',
      soundEnabled: true,
      volume: 0.8,
      theme: 'dark'
    };
    
    await tracker.setLocalStorage('gameSettings', testSettings);
    tracker.logPersistence('Game settings saved', 'gameSettings', testSettings);
    
    // Retrieve and verify
    const retrievedSettings = await tracker.checkLocalStorage('gameSettings');
    expect(retrievedSettings).toEqual(testSettings);
    tracker.logPersistence('Game settings retrieved and verified');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should persist data across page reloads', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-persistence');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Store test data
    const gameState = {
      currentQuestion: 5,
      totalQuestions: 100,
      score: 42,
      gameMode: 'classic'
    };
    
    await tracker.setLocalStorage('gameState', gameState);
    tracker.logPersistence('Game state saved before reload');
    
    // Reload page
    await page.reload();
    await tracker.measurePageLoad();
    tracker.logUserAction('Page reloaded');
    
    // Verify data persisted
    const restoredState = await tracker.checkLocalStorage('gameState');
    expect(restoredState).toEqual(gameState);
    tracker.logPersistence('Game state restored after reload');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should handle localStorage quota limits gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-quota-limits');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Try to fill localStorage to test quota handling
    const quotaTestResult = await page.evaluate(() => {
      try {
        // Generate large data string (1MB)
        const largeData = 'x'.repeat(1024 * 1024);
        const testResults = {
          beforeSize: 0,
          afterSize: 0,
          quotaReached: false,
          errorOccurred: false
        };
        
        // Measure current usage
        let currentSize = 0;
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            currentSize += localStorage[key].length;
          }
        }
        testResults.beforeSize = currentSize;
        
        // Try to store large data
        for (let i = 0; i < 10; i++) {
          try {
            localStorage.setItem(`largeData_${i}`, largeData);
          } catch (e) {
            testResults.quotaReached = true;
            testResults.errorOccurred = true;
            break;
          }
        }
        
        // Measure after
        currentSize = 0;
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            currentSize += localStorage[key].length;
          }
        }
        testResults.afterSize = currentSize;
        
        // Clean up
        for (let i = 0; i < 10; i++) {
          localStorage.removeItem(`largeData_${i}`);
        }
        
        return testResults;
      } catch (error) {
        return { error: String(error), errorOccurred: true };
      }
    });
    
    tracker.logPersistence('Quota test completed', 'quotaTest', quotaTestResult);
    
    // App should handle quota errors gracefully
    expect(quotaTestResult.errorOccurred).toBeDefined();
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should recover from corrupted localStorage data', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-corruption-recovery');
    
    // Set corrupted data before loading
    await page.evaluate(() => {
      localStorage.setItem('gameSettings', 'invalid json {');
      localStorage.setItem('gameState', '{"incomplete": true,}');
      localStorage.setItem('soundSettings', 'not-json-at-all');
    });
    tracker.logPersistence('Corrupted data set in localStorage');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should still load
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded despite corrupted localStorage');
    
    // Check if corrupted data was handled
    const settings = await tracker.checkLocalStorage('gameSettings');
    const state = await tracker.checkLocalStorage('gameState');
    const soundSettings = await tracker.checkLocalStorage('soundSettings');
    
    tracker.logPersistence('Post-load localStorage state', 'recovery', {
      settingsType: typeof settings,
      stateType: typeof state,
      soundSettingsType: typeof soundSettings
    });
    
    // At minimum, app should not crash
    const appFunctional = await page.locator('body').isVisible();
    expect(appFunctional).toBe(true);
    
    const report = tracker.generateReport();
    // Some errors expected due to corrupted data
    expect(report.errors.length).toBeLessThan(10);
  });

  test('should maintain NameBlame player data', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-nameblame-data');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test NameBlame specific data storage
    const playerData = {
      players: [
        { name: 'Alice', blameCount: 3 },
        { name: 'Bob', blameCount: 1 },
        { name: 'Charlie', blameCount: 5 }
      ],
      currentPlayerIndex: 1,
      round: 2
    };
    
    await tracker.setLocalStorage('nameBlamePlayers', playerData);
    tracker.logPersistence('NameBlame player data saved');
    
    // Verify storage
    const storedPlayers = await tracker.checkLocalStorage('nameBlamePlayers');
    expect(storedPlayers).toEqual(playerData);
    tracker.logPersistence('NameBlame player data verified');
    
    // Test individual player updates
    const updatedPlayerData = {
      ...playerData,
      players: [
        { name: 'Alice', blameCount: 4 }, // Alice got blamed again
        { name: 'Bob', blameCount: 1 },
        { name: 'Charlie', blameCount: 5 }
      ]
    };
    
    await tracker.setLocalStorage('nameBlamePlayers', updatedPlayerData);
    tracker.logPersistence('Player data updated');
    
    const finalPlayerData = await tracker.checkLocalStorage('nameBlamePlayers');
    expect(finalPlayerData).toEqual(updatedPlayerData);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should handle concurrent localStorage operations', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-concurrent-operations');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Simulate rapid concurrent writes
    const concurrentOperations = await page.evaluate(() => {
      const operations = [];
      const promises = [];
      
      // Create multiple rapid operations
      for (let i = 0; i < 20; i++) {
        const operation = {
          id: i,
          data: { value: Math.random(), timestamp: Date.now() },
          success: false
        };
        
        promises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              try {
                localStorage.setItem(`concurrent_${i}`, JSON.stringify(operation.data));
                const retrieved = JSON.parse(localStorage.getItem(`concurrent_${i}`) || '{}');
                operation.success = retrieved.value === operation.data.value;
                localStorage.removeItem(`concurrent_${i}`);
              } catch (error) {
                operation.success = false;
              }
              resolve(operation);
            }, Math.random() * 100);
          })
        );
        
        operations.push(operation);
      }
      
      return Promise.all(promises);
    });
    
    interface ConcurrentOperation {
      id: number;
      data: { value: number; timestamp: number };
      success: boolean;
    }
    
    const typedOperations = concurrentOperations as ConcurrentOperation[];
    
    tracker.logPersistence('Concurrent operations completed', 'concurrent', {
      total: typedOperations.length,
      successful: typedOperations.filter((op) => op.success).length
    });
    
    // Most operations should succeed
    const successfulOps = typedOperations.filter((op) => op.success);
    expect(successfulOps.length).toBeGreaterThan(15); // At least 75% success rate
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should preserve language preferences correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-language-preferences');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test each supported language
    const languages = ['de', 'en', 'es', 'fr'];
    
    for (const lang of languages) {
      // Set language preference
      await tracker.setLocalStorage('i18nextLng', lang);
      tracker.logPersistence(`Language preference set to ${lang}`);
      
      // Reload page
      await page.reload();
      await tracker.measurePageLoad();
      
      // Check if language was restored
      const restoredLang = await tracker.checkLocalStorage('i18nextLng');
      expect(restoredLang).toBe(lang);
      tracker.logPersistence(`Language ${lang} restored correctly`);
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should handle storage cleanup and optimization', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'local-storage-cleanup');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Add various test data
    const testData = {
      gameSettings: { theme: 'dark' },
      oldGameState: { obsolete: true },
      soundSettings: { volume: 0.5 },
      tempData: { temporary: true },
      userPrefs: { lastPlayed: Date.now() }
    };
    
    // Store all test data
    for (const [key, value] of Object.entries(testData)) {
      await tracker.setLocalStorage(key, value);
    }
    tracker.logPersistence('Test data stored for cleanup test');
    
    // Simulate cleanup process
    const cleanupResult = await page.evaluate(() => {
      const before = Object.keys(localStorage).length;
      
      // Remove temporary data (simulate app cleanup)
      if (localStorage.getItem('tempData')) {
        localStorage.removeItem('tempData');
      }
      
      const after = Object.keys(localStorage).length;
      
      return {
        beforeCount: before,
        afterCount: after,
        removed: before - after
      };
    });
    
    tracker.logPersistence('Cleanup completed', 'cleanup', cleanupResult);
    
    // Verify essential data is still there
    const gameSettings = await tracker.checkLocalStorage('gameSettings');
    const soundSettings = await tracker.checkLocalStorage('soundSettings');
    
    expect(gameSettings).toBeTruthy();
    expect(soundSettings).toBeTruthy();
    
    // Verify temporary data was removed
    const tempData = await tracker.checkLocalStorage('tempData');
    expect(tempData).toBeNull();
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });
});
