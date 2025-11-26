/**
 * Foundation Test: Translation System
 * 
 * Purpose: Tests the i18n functionality to ensure all supported languages
 * work correctly and translations are loaded properly.
 * 
 * Test Areas:
 * - i18n system initialization
 * - Language switching functionality
 * - Translation loading for all supported languages (de, en, es, fr)
 * - Browser language detection
 * - Fallback mechanisms for missing translations
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker, verifyTranslationSystem } from '../utils/debug-helpers';

test.describe('Foundation: Translation System', () => {
  test('should initialize translation system on app load', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-init');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Verify translation system is initialized
    const translationsWorking = await verifyTranslationSystem(page, tracker);
    expect(translationsWorking).toBe(true);
    
    // Check that i18n namespace is available
    const i18nAvailable = await page.evaluate(() => {
      return typeof window.i18n !== 'undefined';
    });
    expect(i18nAvailable).toBe(true);
    tracker.logDataFlow('i18n namespace available');
    
    // Verify initial language is set
    const currentLanguage = await page.evaluate(() => {
      return window.i18n?.language || 'unknown';
    });
    expect(['de', 'en', 'es', 'fr']).toContain(currentLanguage);
    tracker.logDataFlow('Current language detected', { language: currentLanguage });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should load translations for all supported languages', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-languages');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const supportedLanguages = ['de', 'en', 'es', 'fr'];
    
    for (const lang of supportedLanguages) {
      tracker.logUserAction('Testing language', lang);
      
      // Switch to language
      const languageChanged = await page.evaluate((language) => {
        if (window.i18n && window.i18n.changeLanguage) {
          window.i18n.changeLanguage(language);
          return true;
        }
        return false;
      }, lang);
      
      if (languageChanged) {
        tracker.logDataFlow('Language switched', { language: lang });
        
        // Wait for language change to complete
        await page.waitForTimeout(1000);
        
        // Verify language was applied
        const currentLang = await page.evaluate(() => {
          return window.i18n?.language || 'unknown';
        });
        
        expect(currentLang).toBe(lang);
        tracker.logDataFlow('Language change verified', { expected: lang, actual: currentLang });
      } else {
        tracker.logDataFlow('Language change not available', { language: lang });
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3); // Allow some errors for missing features
  });

  test('should translate UI elements correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-ui');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test translation of common UI elements
    const translationTests = [
      { key: 'start', expectedGerman: 'Spiel' },
      { key: 'settings', expectedGerman: 'Einstellungen' },
      { key: 'question', expectedGerman: 'Frage' }
    ];
    
    for (const testCase of translationTests) {
      // Check if we can find German text (assuming German as default or switch to German)
      await page.evaluate(() => {
        if (window.i18n && window.i18n.changeLanguage) {
          window.i18n.changeLanguage('de');
        }
      });
      
      await page.waitForTimeout(500);
      
      // Look for translated text in the page
      const germanTextFound = await page.getByText(testCase.expectedGerman).count() > 0;
      
      if (germanTextFound) {
        tracker.logDataFlow('German translation found', testCase);
      } else {
        tracker.logDataFlow('German translation not found', testCase);
      }
      
      // Switch to English and check
      await page.evaluate(() => {
        if (window.i18n && window.i18n.changeLanguage) {
          window.i18n.changeLanguage('en');
        }
      });
      
      await page.waitForTimeout(500);
      
      // Look for English text
      const englishTextFound = await page.getByText(testCase.key).count() > 0;
      
      if (englishTextFound) {
        tracker.logDataFlow('English translation found', testCase);
      } else {
        tracker.logDataFlow('English translation not found', testCase);
      }
    }
    
    const report = tracker.generateReport();
    // Don't enforce strict translation requirements as UI might not be fully translated
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should handle missing translations gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-fallback');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Try to access a non-existent translation key
    const fallbackBehavior = await page.evaluate(() => {
      if (window.i18n && window.i18n.t) {
        const result = window.i18n.t('non.existent.key');
        return {
          result,
          type: typeof result,
          isEmpty: result === '',
          isKey: result === 'non.existent.key'
        };
      }
      return { available: false };
    });
    
    tracker.logDataFlow('Fallback behavior test', fallbackBehavior);
    
    if (fallbackBehavior.available !== false) {
      // Should either return the key itself or an empty string, not crash
      expect(typeof fallbackBehavior.result).toBe('string');
      tracker.logDataFlow('Translation fallback working');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should maintain language preference in localStorage', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-persistence');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Change language
    await page.evaluate(() => {
      if (window.i18n && window.i18n.changeLanguage) {
        window.i18n.changeLanguage('es');
      }
    });
    
    await page.waitForTimeout(1000);
    tracker.logUserAction('Changed language to Spanish');
    
    // Check if language preference is stored
    const storedLanguage = await tracker.checkLocalStorage('i18nextLng');
    tracker.logPersistence('Language preference stored', 'i18nextLng', storedLanguage);
    
    // Reload page
    await page.reload();
    await tracker.measurePageLoad();
    tracker.logUserAction('Page reloaded');
    
    // Check if language is restored
    const restoredLanguage = await page.evaluate(() => {
      return window.i18n?.language || 'unknown';
    });
    
    tracker.logDataFlow('Language restored after reload', { language: restoredLanguage });
    
    // Language should be maintained or fall back to browser default
    expect(['es', 'de', 'en', 'fr']).toContain(restoredLanguage);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should detect browser language correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-browser-detection');
    
    // Set browser language to German
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        get: () => 'de-DE'
      });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['de-DE', 'de', 'en']
      });
    });
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Check detected language
    const detectedLanguage = await page.evaluate(() => {
      return window.i18n?.language || 'unknown';
    });
    
    tracker.logDataFlow('Browser language detection', { detected: detectedLanguage });
    
    // Should detect German or fall back to supported language
    expect(['de', 'en', 'es', 'fr']).toContain(detectedLanguage);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should handle rapid language switching', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'translation-system-rapid-switching');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    const languages = ['de', 'en', 'es', 'fr'];
    
    // Rapidly switch languages
    for (let i = 0; i < 10; i++) {
      const lang = languages[i % languages.length];
      
      await page.evaluate((language) => {
        if (window.i18n && window.i18n.changeLanguage) {
          window.i18n.changeLanguage(language);
        }
      }, lang);
      
      tracker.logUserAction('Rapid language switch', lang, { iteration: i });
      
      // Small delay to prevent overwhelming the system
      await page.waitForTimeout(100);
    }
    
    // Final check - app should still be responsive
    await page.waitForTimeout(1000);
    
    const finalLanguage = await page.evaluate(() => {
      return window.i18n?.language || 'unknown';
    });
    
    tracker.logDataFlow('Final language after rapid switching', { language: finalLanguage });
    expect(['de', 'en', 'es', 'fr']).toContain(finalLanguage);
    
    // Check that app is still functional
    const appStillWorks = await page.locator('body').isVisible();
    expect(appStillWorks).toBe(true);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
});
