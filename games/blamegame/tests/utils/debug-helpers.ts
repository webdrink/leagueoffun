/**
 * Debug Helpers for BlameGame Testing
 * 
 * Purpose: Provides enhanced debugging capabilities for Playwright tests
 * with comprehensive logging, state tracking, and visual debugging tools.
 * 
 * Features:
 * - Emoji-coded console logging for different event types
 * - Game state tracking and monitoring
 * - Screenshot and video recording capabilities
 * - Performance metrics collection
 * - Test report generation
 */

import { Page } from '@playwright/test';

// Extend Window interface for BlameGame specific properties
declare global {
  interface Window {
    gameState?: {
      currentStep: string;
    };
    gameQuestions?: unknown[];
    gameCategories?: Array<{
      id: string;
      name: string;
      emoji: string;
      questions: string[];
    }>;
    audioContext?: AudioContext;
    webkitAudioContext?: AudioContext;
    i18n?: {
      isInitialized: boolean;
      language?: string;
      changeLanguage?: (lang: string) => void;
      t?: (key: string) => string;
    };
  }
}

export interface UserAction {
  timestamp: number;
  action: string;
  element?: string;
  details: Record<string, unknown>;
}

export interface StateChange {
  timestamp: number;
  component: string;
  before: unknown;
  after: unknown;
}

export interface PerformanceMetrics {
  loadTime: number;
  interactionTimes: number[];
  memoryUsage?: number;
  renderTimes: number[];
}

export interface TestReport {
  testName: string;
  duration: number;
  userActions: UserAction[];
  stateChanges: StateChange[];
  errors: Error[];
  performance: PerformanceMetrics;
  screenshots: string[];
  videoRecording?: string;
}

export class GameStateTracker {
  private testName: string;
  private startTime: number;
  private userActions: UserAction[] = [];
  private stateChanges: StateChange[] = [];
  private errors: Error[] = [];
  private screenshots: string[] = [];
  private page: Page;
  private performance: PerformanceMetrics = {
    loadTime: 0,
    interactionTimes: [],
    renderTimes: []
  };

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName;
    this.startTime = Date.now();
    
    // Set up console logging capture
    this.setupConsoleLogging();
  }

  private setupConsoleLogging(): void {
    this.page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      // Categorize console messages with emojis
      if (text.includes('🎯')) {
        console.log(`🎯 USER ACTION: ${text}`);
      } else if (text.includes('🔄')) {
        console.log(`🔄 STATE CHANGE: ${text}`);
      } else if (text.includes('🎮')) {
        console.log(`🎮 GAME LOGIC: ${text}`);
      } else if (text.includes('🌐')) {
        console.log(`🌐 DATA FLOW: ${text}`);
      } else if (text.includes('❌')) {
        console.log(`❌ ERROR: ${text}`);
        this.errors.push(new Error(text));
      } else if (text.includes('⚡')) {
        console.log(`⚡ PERFORMANCE: ${text}`);
      } else if (text.includes('🎵')) {
        console.log(`🎵 AUDIO: ${text}`);
      } else if (text.includes('💾')) {
        console.log(`💾 PERSISTENCE: ${text}`);
      } else if (type === 'error') {
        console.error(`❌ BROWSER ERROR: ${text}`);
        this.errors.push(new Error(text));
      }
    });
  }

  logUserAction(action: string, element?: string, details: Record<string, unknown> = {}): void {
    const userAction: UserAction = {
      timestamp: Date.now(),
      action,
      element,
      details
    };
    this.userActions.push(userAction);
    
    // Enhanced console logging
    console.log(`🎯 USER ACTION: ${action}${element ? ` on ${element}` : ''}`);
    if (Object.keys(details).length > 0) {
      console.log(`   Details:`, details);
    }
  }

  logStateChange(component: string, before: unknown, after: unknown): void {
    const stateChange: StateChange = {
      timestamp: Date.now(),
      component,
      before,
      after
    };
    this.stateChanges.push(stateChange);
    
    console.log(`🔄 STATE CHANGE: ${component}`);
    console.log(`   Before:`, before);
    console.log(`   After:`, after);
  }

  logGameEvent(event: string, data?: unknown): void {
    console.log(`🎮 GAME LOGIC: ${event}`);
    if (data) {
      console.log(`   Data:`, data);
    }
  }

  logDataFlow(operation: string, data?: unknown): void {
    console.log(`🌐 DATA FLOW: ${operation}`);
    if (data) {
      console.log(`   Data:`, data);
    }
  }

  logPerformance(metric: string, value: number): void {
    console.log(`⚡ PERFORMANCE: ${metric} = ${value}ms`);
    
    if (metric === 'loadTime') {
      this.performance.loadTime = value;
    } else if (metric === 'interactionTime') {
      this.performance.interactionTimes.push(value);
    } else if (metric === 'renderTime') {
      this.performance.renderTimes.push(value);
    }
  }

  logAudioEvent(event: string, details?: Record<string, unknown>): void {
    console.log(`🎵 AUDIO: ${event}`);
    if (details) {
      console.log(`   Details:`, details);
    }
  }

  logPersistence(operation: string, key?: string, value?: unknown): void {
    console.log(`💾 PERSISTENCE: ${operation}${key ? ` (${key})` : ''}`);
    if (value) {
      console.log(`   Value:`, value);
    }
  }

  async takeScreenshot(label: string): Promise<void> {
    const timestamp = Date.now();
    const filename = `${this.testName}-${label}-${timestamp}.png`;
    await this.page.screenshot({ path: `test-results/screenshots/${filename}` });
    this.screenshots.push(filename);
    console.log(`📸 SCREENSHOT: ${filename}`);
  }

  async measurePageLoad(): Promise<number> {
    const start = Date.now();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    this.logPerformance('loadTime', loadTime);
    return loadTime;
  }

  async measureInteraction(action: () => Promise<void>): Promise<number> {
    const start = Date.now();
    await action();
    const interactionTime = Date.now() - start;
    this.logPerformance('interactionTime', interactionTime);
    return interactionTime;
  }

  async waitForGameState(expectedState: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        (state) => window.gameState?.currentStep === state,
        expectedState,
        { timeout }
      );
      this.logGameEvent('Game state reached', expectedState);
      return true;
    } catch (error) {
      console.log(`❌ ERROR: Failed to reach game state ${expectedState}: ${error}`);
      return false;
    }
  }

  async checkLocalStorage(key: string): Promise<unknown> {
    const value = await this.page.evaluate((storageKey) => {
      return localStorage.getItem(storageKey);
    }, key);
    
    this.logPersistence('localStorage read', key, value);
    
    // Handle special cases like language preferences that are stored as plain strings
    if (key === 'i18nextLng' || value === null) {
      return value;
    }
    
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // Return raw value if JSON parsing fails
      return value;
    }
  }

  async setLocalStorage(key: string, value: unknown): Promise<void> {
    await this.page.evaluate(({ storageKey, storageValue }) => {
      localStorage.setItem(storageKey, JSON.stringify(storageValue));
    }, { storageKey: key, storageValue: value });
    
    this.logPersistence('localStorage write', key, value);
  }

  generateReport(): TestReport {
    const duration = Date.now() - this.startTime;
    
    const report: TestReport = {
      testName: this.testName,
      duration,
      userActions: this.userActions,
      stateChanges: this.stateChanges,
      errors: this.errors,
      performance: this.performance,
      screenshots: this.screenshots
    };

    console.log(`📊 TEST REPORT: ${this.testName}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   User Actions: ${this.userActions.length}`);
    console.log(`   State Changes: ${this.stateChanges.length}`);
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Screenshots: ${this.screenshots.length}`);
    console.log(`   Avg Interaction Time: ${this.calculateAverageInteractionTime()}ms`);

    return report;
  }

  private calculateAverageInteractionTime(): number {
    if (this.performance.interactionTimes.length === 0) return 0;
    const sum = this.performance.interactionTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.performance.interactionTimes.length);
  }
}

/**
 * Helper function to create a game state tracker for tests
 */
export function createGameStateTracker(page: Page, testName: string): GameStateTracker {
  return new GameStateTracker(page, testName);
}

/**
 * Helper function to wait for questions to load
 */
export async function waitForQuestionsLoaded(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    await page.waitForFunction(() => {
      return window.gameQuestions && window.gameQuestions.length > 0;
    }, { timeout: 10000 });
    
    tracker.logDataFlow('Questions loaded', 'Questions available in window.gameQuestions');
    return true;
  } catch (error) {
    tracker.logDataFlow('Questions loading failed', error);
    return false;
  }
}

/**
 * Helper function to verify game audio is working
 */
export async function verifyAudioSystem(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    const audioEnabled = await page.evaluate(() => {
      return window.audioContext !== undefined || window.webkitAudioContext !== undefined;
    });
    
    tracker.logAudioEvent('Audio system check', { audioEnabled });
    return audioEnabled;
  } catch (error) {
    tracker.logAudioEvent('Audio system check failed', { error: String(error) });
    return false;
  }
}

/**
 * Helper function to simulate network conditions
 */
export async function simulateNetworkConditions(page: Page, offline: boolean = false): Promise<void> {
  await page.context().setOffline(offline);
  console.log(`🌐 NETWORK: ${offline ? 'Offline' : 'Online'} mode simulated`);
}

/**
 * Helper function to check translation system
 */
export async function verifyTranslationSystem(page: Page, tracker: GameStateTracker): Promise<boolean> {
  try {
    const translationsLoaded = await page.evaluate(() => {
      return window.i18n?.isInitialized ?? false;
    });
    
    tracker.logDataFlow('Translation system check', { translationsLoaded });
    return translationsLoaded;
  } catch (error) {
    tracker.logDataFlow('Translation system check failed', { error: String(error) });
    return false;
  }
}
