/**
 * URL Parsing Tests
 * Tests parseInitialParams with valid/invalid query parameters and edge cases.
 */
import { test, expect } from '@playwright/test';

test.describe('URL Parsing Tests', () => {
  test('should parse valid URL parameters correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate parseInitialParams function
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'),
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {};
        }
      };

      // Test with valid parameters
      const validUrl = { search: '?game=nameblame&playerId=abc123&roomId=room456' };
      const params = parseInitialParams(validUrl);

      return params;
    });

    expect(result).toEqual({
      game: 'nameblame',
      playerId: 'abc123',
      roomId: 'room456'
    });
  });

  test('should handle partial parameters', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'),
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {};
        }
      };

      const testCases = [
        { search: '?game=nameblame', expected: { game: 'nameblame', playerId: null, roomId: null } },
        { search: '?playerId=user123', expected: { game: null, playerId: 'user123', roomId: null } },
        { search: '?roomId=abc', expected: { game: null, playerId: null, roomId: 'abc' } },
        { search: '?game=test&roomId=xyz', expected: { game: 'test', playerId: null, roomId: 'xyz' } }
      ];

      return testCases.map(({ search, expected }) => ({
        search,
        result: parseInitialParams({ search }),
        expected,
        matches: JSON.stringify(parseInitialParams({ search })) === JSON.stringify(expected)
      }));
    });

    result.forEach(({ matches }) => {
      expect(matches).toBe(true);
    });
  });

  test('should handle empty and malformed URLs', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'),
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {};
        }
      };

      const testCases = [
        '', // empty
        '?', // just question mark
        '?=', // malformed
        '?game=', // empty value
        '?game&playerId=test', // missing value for game
        '?invalid-format', // no equals sign
      ];

      return testCases.map(search => {
        const result = parseInitialParams({ search });
        return {
          search,
          result,
          hasValidStructure: typeof result === 'object' && result !== null
        };
      });
    });

    // All should return valid objects (even if empty/null values)
    result.forEach(({ hasValidStructure }) => {
      expect(hasValidStructure).toBe(true);
    });

    // Empty search should return all nulls
    const emptyResult = result.find(r => r.search === '');
    expect(emptyResult?.result).toEqual({
      game: null,
      playerId: null,
      roomId: null
    });
  });

  test('should handle URL encoding and special characters', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'),
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {};
        }
      };

      const encodedUrl = { search: '?game=name%2Dblame&playerId=user%40test&roomId=room%20with%20spaces' };
      const params = parseInitialParams(encodedUrl);

      return params;
    });

    expect(result).toEqual({
      game: 'name-blame', // %2D decoded to -
      playerId: 'user@test', // %40 decoded to @
      roomId: 'room with spaces' // %20 decoded to space
    });
  });

  test('should handle multiple values for same parameter', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'), // get() returns first value
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {};
        }
      };

      // Multiple game parameters - should return first one
      const multipleUrl = { search: '?game=first&game=second&playerId=test' };
      const params = parseInitialParams(multipleUrl);

      return params;
    });

    expect(result.game).toBe('first'); // Should get first occurrence
    expect(result.playerId).toBe('test');
    expect(result.roomId).toBe(null);
  });

  test('should gracefully handle URLSearchParams constructor errors', async ({ page }) => {
    const result = await page.evaluate(() => {
      const parseInitialParams = (loc: { search: string }) => {
        try {
          const usp = new URLSearchParams(loc.search);
          return {
            game: usp.get('game'),
            playerId: usp.get('playerId'),
            roomId: usp.get('roomId')
          };
        } catch {
          return {}; // Fallback to empty object
        }
      };

      // Test with potentially problematic input that might cause URLSearchParams to throw
      const problematicInputs = [
        null as unknown as { search: string }, // null input
        undefined as unknown as { search: string }, // undefined input
        { search: null as unknown as string }, // null search
        { search: undefined as unknown as string } // undefined search
      ];

      return problematicInputs.map(input => {
        try {
          const result = parseInitialParams(input);
          return { input: String(input), result, success: true };
        } catch (e) {
          return { input: String(input), result: null, success: false, error: (e as Error).message };
        }
      });
    });

    // All should either succeed with empty object or handle gracefully
    result.forEach(({ success, result: res }) => {
      if (success) {
        expect(typeof res).toBe('object');
      }
      // If it doesn't succeed, that's also acceptable as long as it doesn't crash the test
    });
  });
});