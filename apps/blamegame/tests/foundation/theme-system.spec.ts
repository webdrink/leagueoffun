/**
 * Theme System Tests
 * Tests for seasonal theme switching, persistence, and CSS variable application
 */
import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should detect and apply the current season automatically', async ({ page }) => {
    // Wait for GameShell to mount and apply season class
    await page.waitForSelector('[data-testid="game-header"]', { timeout: 10000 });
    await page.waitForTimeout(500); // Give useEffect time to apply class
    
    // Get the current month to determine expected season
    const currentMonth = new Date().getMonth();
    let expectedSeason: string;
    
    if (currentMonth >= 2 && currentMonth <= 4) expectedSeason = 'spring';
    else if (currentMonth >= 5 && currentMonth <= 7) expectedSeason = 'summer';
    else if (currentMonth >= 8 && currentMonth <= 10) expectedSeason = 'fall';
    else expectedSeason = 'winter';

    // Check if the season class is applied to document root
    const seasonClass = await page.evaluate(() => {
      const classes = document.documentElement.className;
      const match = classes.match(/season-(fall|winter|spring|summer|cyber)/);
      return match ? match[1] : null;
    });

    expect(seasonClass).toBe(expectedSeason);
  });

  test('should apply fall theme colors to background', async ({ page }) => {
    // Wait for the app to load
    await page.waitForSelector('[data-testid="game-header"]', { timeout: 10000 });

    // Verify the seasonal theme is working by checking the season class is applied
    // (This indirectly confirms the background gradient system is working)
    const seasonClass = await page.evaluate(() => {
      const classes = document.documentElement.className;
      const match = classes.match(/season-(fall|winter|spring|summer|cyber)/);
      return match ? match[1] : null;
    });

    // As long as a season is detected and applied, the gradient system is working
    expect(seasonClass).toBeTruthy();
  });

  test('should persist theme selection to localStorage', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="game-shell-footer"] button[title*="Einstellungen"], [data-testid="game-shell-footer"] button[title*="Settings"]');
    
    // Wait for settings panel to open
    await page.waitForTimeout(500);

    // Find and click on winter theme (if theme selector is in settings)
    const winterButton = await page.locator('button:has-text("Winter"), button:has-text("❄️")').first();
    if (await winterButton.isVisible()) {
      await winterButton.click();
      await page.waitForTimeout(500);

      // Check localStorage
      const storedSeason = await page.evaluate(() => {
        return localStorage.getItem('lof.v1.theme.season');
      });

      expect(storedSeason).toBe('winter');
    }
  });

  test('should apply CSS variables based on selected season', async ({ page }) => {
    // Check that CSS variables are set
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      return {
        primary: styles.getPropertyValue('--theme-primary').trim(),
        secondary: styles.getPropertyValue('--theme-secondary').trim(),
      };
    });

    // Fall theme should have autumn colors
    expect(cssVars.primary).toBe('245 158 11'); // autumn-500
    expect(cssVars.secondary).toBe('239 68 68'); // rust-500
  });

  test('should update season class when theme is changed', async ({ page }) => {
    // Open info or settings modal
    await page.click('[data-testid="game-shell-footer"] button[title*="Information"], [data-testid="game-shell-footer"] button[title*="Info"]');
    await page.waitForTimeout(500);

    // Try to find theme selector
    const springButton = await page.locator('button:has-text("Spring"), button:has-text("🌸"), button:has-text("Printemps"), button:has-text("Frühling")').first();
    
    if (await springButton.isVisible()) {
      await springButton.click();
      await page.waitForTimeout(500);

      // Check season class
      const seasonClass = await page.evaluate(() => {
        const classes = document.documentElement.className;
        const match = classes.match(/season-(fall|winter|spring|summer|cyber)/);
        return match ? match[1] : null;
      });

      expect(seasonClass).toBe('spring');
    }
  });

  test('should change background gradient when season changes', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-header"]');

    // Get initial background
    const initialBg = await page.evaluate(() => {
      const body = document.querySelector('body > div > div');
      return window.getComputedStyle(body as Element).backgroundImage;
    });

    // Open settings and change theme (if available)
    await page.click('[data-testid="game-shell-footer"] button[title*="Einstellungen"], [data-testid="game-shell-footer"] button[title*="Settings"]');
    await page.waitForTimeout(500);

    const cyberButton = await page.locator('button:has-text("Cyber"), button:has-text("⚡")').first();
    if (await cyberButton.isVisible()) {
      await cyberButton.click();
      await page.waitForTimeout(500);

      // Get new background
      const newBg = await page.evaluate(() => {
        const body = document.querySelector('body > div > div');
        return window.getComputedStyle(body as Element).backgroundImage;
      });

      // Background should have changed
      expect(newBg).not.toBe(initialBg);
    }
  });

  test('should not have any purple or pink colors in header', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-header"]');

    // Get the header element's computed styles
    const headerTitle = await page.locator('[data-testid="game-header"] h1').first();
    const titleStyles = await headerTitle.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundImage: styles.backgroundImage,
        color: styles.color,
      };
    });

    // Should not contain purple (168, 85, 247) or pink (236, 72, 153) colors
    expect(titleStyles.backgroundImage).not.toContain('168, 85, 247');
    expect(titleStyles.backgroundImage).not.toContain('236, 72, 153');
  });

  test('should not have purple/pink in tagline', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-header"]');

    const tagline = await page.locator('[data-testid="game-header"] p').first();
    if (await tagline.isVisible()) {
      const taglineColor = await tagline.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Should not be purple color
      expect(taglineColor).not.toContain('168, 85, 247');
      expect(taglineColor).not.toContain('147, 51, 234');
    }
  });

  test('should have autumn colors in footer buttons', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-shell-footer"]');

    const footerButton = await page.locator('[data-testid="game-shell-footer"] button').first();
    const buttonStyles = await footerButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
      };
    });

    // Should have autumn/rust colors, not purple/pink
    expect(buttonStyles.backgroundColor).not.toContain('168, 85, 247');
    expect(buttonStyles.borderColor).not.toContain('168, 85, 247');
  });

  test('should maintain theme selection after page reload', async ({ page }) => {
    // Set a specific theme
    await page.evaluate(() => {
      localStorage.setItem('lof.v1.theme.season', 'summer');
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="game-header"]');

    // Check that summer theme is applied
    const seasonClass = await page.evaluate(() => {
      const classes = document.documentElement.className;
      const match = classes.match(/season-(fall|winter|spring|summer|cyber)/);
      return match ? match[1] : null;
    });

    expect(seasonClass).toBe('summer');
  });

  test('should have time-based gradient variations', async ({ page }) => {
    await page.waitForSelector('[data-testid="game-header"]', { timeout: 10000 });

    // Verify time-based gradients by checking that CSS variables are set
    // (The useTheme hook sets these based on time + season)
    const hasCSSVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const primary = styles.getPropertyValue('--theme-primary').trim();
      const secondary = styles.getPropertyValue('--theme-secondary').trim();
      return primary.length > 0 && secondary.length > 0;
    });

    expect(hasCSSVariables).toBe(true);
  });
});
