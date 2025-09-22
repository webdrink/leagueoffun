/**
 * Framework-specific debug helpers
 * 
 * Updated helpers that work with the new framework architecture
 * instead of expecting legacy global variables.
 */

import { Page } from '@playwright/test';
import { GameStateTracker } from './debug-helpers';

/**
 * Helper function to wait for framework initialization
 */
export async function waitForFrameworkInitialized(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    // Wait for framework to be ready
    await page.waitForFunction(() => {
      // Check for framework elements instead of global variables
      const body = document.body;
      return body && (
        body.textContent?.includes('BlameGame') ||
        document.querySelector('.split-text') ||
        document.querySelector('h1') ||
        body.textContent?.includes('Spiel starten') ||
        body.textContent?.includes('Start') // Framework should have start button
      );
    }, { timeout: 10000 });
    
    tracker.logDataFlow('Framework initialized', 'Framework components detected');
    return true;
  } catch (error) {
    tracker.logDataFlow('Framework initialization failed', error);
    return false;
  }
}

/**
 * Helper function to verify framework content provider is working
 */
export async function verifyFrameworkContent(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    // Check if content is loaded by looking for framework content provider
    const contentAvailable = await page.evaluate(() => {
      // Try different ways to detect content is available
      return !!(
        // Check for any framework-loaded content
        document.querySelector('[data-category]') ||
        document.querySelector('.question-text') ||
        document.body.textContent?.includes('Frage') ||
        document.body.textContent?.includes('Question') ||
        // Check if any content provider globals exist
        (window as unknown as { frameworkProvider?: unknown }).frameworkProvider ||
        (window as unknown as { gameContent?: unknown }).gameContent
      );
    });
    
    tracker.logDataFlow('Framework content check', { contentAvailable });
    return contentAvailable;
  } catch (error) {
    tracker.logDataFlow('Framework content check failed', { error: String(error) });
    return false;
  }
}

/**
 * Helper function to check framework translation system
 */
export async function verifyFrameworkTranslations(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    const translationsWorking = await page.evaluate(() => {
      // Check for i18next or framework translation system
      const hasI18n = !!(window as unknown as { i18n?: unknown }).i18n || !!(window as unknown as { i18next?: unknown }).i18next;
      const hasTranslatedContent = document.body.textContent?.includes('Start') || 
                                  document.body.textContent?.includes('Spiel') ||
                                  document.body.textContent?.includes('Game');
      
      return hasI18n || hasTranslatedContent;
    });
    
    tracker.logDataFlow('Framework translation system check', { translationsWorking });
    return translationsWorking || false;
  } catch (error) {
    tracker.logDataFlow('Framework translation system check failed', { error: String(error) });
    return false;
  }
}

/**
 * Helper function to get the actual framework title
 */
export async function getFrameworkTitle(page: Page): Promise<string | null> {
  try {
    const title = await page.evaluate(() => {
      // Try multiple selectors for the title
      const titleSelectors = [
        'h1', // Most likely
        '.split-text h1',
        '[data-testid="game-title"]',
        '.game-title',
        '.title'
      ];
      
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      
      // Check for SplitText rendered title
      const splitTextElements = document.querySelectorAll('.split-text span');
      if (splitTextElements.length > 0) {
        return Array.from(splitTextElements)
          .map(el => el.textContent || '')
          .join('')
          .trim();
      }
      
      return null;
    });
    
    return title;
  } catch {
    return null;
  }
}

/**
 * Helper function to detect current framework language
 */
export async function getFrameworkLanguage(page: Page): Promise<string> {
  try {
    const language = await page.evaluate(() => {
      // Try different methods to get current language
      const htmlLang = document.documentElement.lang;
      const i18nLang = (window as unknown as { i18n?: { language?: string } }).i18n?.language || 
                      (window as unknown as { i18next?: { language?: string } }).i18next?.language;
      const storedLang = localStorage.getItem('i18nextLng');
      
      return htmlLang || i18nLang || storedLang || 'unknown';
    });
    
    return language;
  } catch {
    return 'unknown';
  }
}

/**
 * Helper function to find framework start button
 */
export async function findFrameworkStartButton(page: Page): Promise<boolean> {
  try {
    // Look for start button with various possible texts
    const startButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('start') || 
               text.includes('spiel') || 
               text.includes('begin') ||
               text.includes('commencer') ||
               text.includes('inizia');
      });
    });
    
    return startButtonExists;
  } catch {
    return false;
  }
}