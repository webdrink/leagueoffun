/**
 * Storage Adapter Unit Tests
 * Tests namespaced localStorage operations and versioning.
 */
import { test, expect } from '@playwright/test';

test.describe('Storage Adapter Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should store and retrieve data with namespacing', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate storage adapter functionality
      const NAMESPACE = 'lof';
      const VERSION = 'v1';
      
      function key(k: string) { return `${NAMESPACE}.${VERSION}.${k}`; }
      
      function storageSet<T>(k: string, value: T) {
        try {
          localStorage.setItem(key(k), JSON.stringify(value));
        } catch {
          // ignore quota
        }
      }
      
      function storageGet<T>(k: string): T | null {
        try {
          const raw = localStorage.getItem(key(k));
          if (!raw) return null;
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      }
      
      // Test data
      const testData = { game: 'nameblame', players: ['Alice', 'Bob', 'Charlie'] };
      
      storageSet('selectedGame', testData);
      const retrieved = storageGet<typeof testData>('selectedGame');
      
      // Check raw storage key
      const rawKey = key('selectedGame');
      const rawValue = localStorage.getItem(rawKey);
      
      return {
        stored: retrieved,
        keyCorrect: rawKey === 'lof.v1.selectedGame',
        rawValueExists: rawValue !== null
      };
    });
    
    expect(result.stored).toEqual({ game: 'nameblame', players: ['Alice', 'Bob', 'Charlie'] });
    expect(result.keyCorrect).toBe(true);
    expect(result.rawValueExists).toBe(true);
  });

  test('should handle storage errors gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      function storageGet<T>(k: string): T | null {
        try {
          const raw = localStorage.getItem(`lof.v1.${k}`);
          if (!raw) return null;
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      }
      
      // Test with invalid JSON
      localStorage.setItem('lof.v1.corruptedData', '{"invalid": json}');
      
      const result1 = storageGet('corruptedData');
      const result2 = storageGet('nonExistentKey');
      
      return { 
        corruptedDataResult: result1,
        nonExistentResult: result2
      };
    });
    
    expect(result.corruptedDataResult).toBe(null);
    expect(result.nonExistentResult).toBe(null);
  });

  test('should clear namespace correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Setup test data
      localStorage.setItem('lof.v1.selectedGame', 'nameblame');
      localStorage.setItem('lof.v1.session.player', 'Alice');
      localStorage.setItem('otherApp.data', 'should-remain');
      localStorage.setItem('lof.v2.futureData', 'different-version');
      
      // Clear namespace function
      function storageClearNamespace() {
        const prefix = 'lof.v1.';
        Object.keys(localStorage).forEach(lsKey => {
          if (lsKey.startsWith(prefix)) localStorage.removeItem(lsKey);
        });
      }
      
      const beforeClear = {
        v1Game: localStorage.getItem('lof.v1.selectedGame'),
        v1Player: localStorage.getItem('lof.v1.session.player'),
        otherApp: localStorage.getItem('otherApp.data'),
        v2Data: localStorage.getItem('lof.v2.futureData')
      };
      
      storageClearNamespace();
      
      const afterClear = {
        v1Game: localStorage.getItem('lof.v1.selectedGame'),
        v1Player: localStorage.getItem('lof.v1.session.player'),
        otherApp: localStorage.getItem('otherApp.data'),
        v2Data: localStorage.getItem('lof.v2.futureData')
      };
      
      return { beforeClear, afterClear };
    });
    
    // Before clear - v1 data should exist
    expect(result.beforeClear.v1Game).toBe('nameblame');
    expect(result.beforeClear.v1Player).toBe('Alice');
    expect(result.beforeClear.otherApp).toBe('should-remain');
    expect(result.beforeClear.v2Data).toBe('different-version');
    
    // After clear - only v1 data should be removed
    expect(result.afterClear.v1Game).toBe(null);
    expect(result.afterClear.v1Player).toBe(null);
    expect(result.afterClear.otherApp).toBe('should-remain');
    expect(result.afterClear.v2Data).toBe('different-version');
  });
});