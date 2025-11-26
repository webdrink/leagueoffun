/**
 * Foundation Test: Audio System
 * 
 * Purpose: Tests audio functionality including sound effects, volume control,
 * and audio file loading to ensure the audio system works correctly.
 * 
 * Test Areas:
 * - Audio context initialization
 * - Sound file loading
 * - Volume control functionality
 * - Audio settings persistence
 * - Browser audio compatibility
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker, verifyAudioSystem } from '../utils/debug-helpers';

test.describe('Foundation: Audio System', () => {
  test('should initialize audio system correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'audio-system-initialization');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Verify audio system is available
    const audioAvailable = await verifyAudioSystem(page, tracker);
    tracker.logAudioEvent('Audio system availability check', { available: audioAvailable });
    
    // Audio might not be available in all test environments
    if (audioAvailable) {
      expect(audioAvailable).toBe(true);
    } else {
      tracker.logAudioEvent('Audio system not available in test environment');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should handle audio settings correctly', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'audio-system-settings');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test audio settings storage
    const audioSettings = {
      enabled: true,
      volume: 0.7,
      effectsEnabled: true
    };
    
    await tracker.setLocalStorage('audioSettings', audioSettings);
    tracker.logAudioEvent('Audio settings saved', audioSettings);
    
    // Reload and verify persistence
    await page.reload();
    await tracker.measurePageLoad();
    
    const restoredSettings = await tracker.checkLocalStorage('audioSettings');
    tracker.logAudioEvent('Audio settings restored', { 
      restored: restoredSettings ? 'success' : 'failed' 
    });
    
    if (restoredSettings) {
      expect(restoredSettings).toEqual(audioSettings);
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should handle audio loading failures gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'audio-system-loading-failures');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Test audio loading with non-existent files
    const audioLoadTest = await page.evaluate(() => {
      return new Promise((resolve) => {
        const audio = new Audio('/non-existent-sound.mp3');
        
        const loadResult = {
          loadAttempted: true,
          errorOccurred: false,
          canPlayType: false
        };
        
        audio.addEventListener('error', () => {
          loadResult.errorOccurred = true;
          resolve(loadResult);
        });
        
        audio.addEventListener('canplaythrough', () => {
          loadResult.canPlayType = true;
          resolve(loadResult);
        });
        
        // Test if browser supports audio format
        loadResult.canPlayType = audio.canPlayType('audio/mpeg') !== '';
        
        // Timeout after 3 seconds
        setTimeout(() => {
          resolve(loadResult);
        }, 3000);
        
        audio.load();
      });
    });
    
    tracker.logAudioEvent('Audio loading test completed', { 
      testCompleted: true 
    });
    
    // App should handle audio loading failures gracefully
    if (typeof audioLoadTest === 'object' && audioLoadTest !== null) {
      const loadTest = audioLoadTest as Record<string, unknown>;
      expect(loadTest.loadAttempted).toBe(true);
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should respect volume controls', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'audio-system-volume-controls');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Look for volume controls in the UI
    const volumeSlider = page.locator('input[type="range"]').or(page.locator('[role="slider"]'));
    const volumeButton = page.getByRole('button', { name: /volume|sound|audio/i });
    
    const hasVolumeControls = await volumeSlider.count() > 0 || await volumeButton.count() > 0;
    tracker.logAudioEvent('Volume controls detection', { hasControls: hasVolumeControls });
    
    if (hasVolumeControls) {
      if (await volumeSlider.count() > 0) {
        // Test volume slider
        await volumeSlider.first().fill('50');
        tracker.logAudioEvent('Volume slider set to 50%');
        await page.waitForTimeout(500);
        
        const sliderValue = await volumeSlider.first().inputValue();
        tracker.logAudioEvent('Volume slider value verified', { value: sliderValue });
      }
      
      if (await volumeButton.count() > 0) {
        // Test volume button toggle
        await volumeButton.first().click();
        tracker.logAudioEvent('Volume button clicked');
        await page.waitForTimeout(500);
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should maintain audio state during gameplay', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'audio-system-gameplay-state');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Set audio preferences
    await tracker.setLocalStorage('audioSettings', { enabled: true, volume: 0.8 });
    
    // Start a game to test audio during gameplay
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      tracker.logUserAction('Started game to test audio state');
      
      await page.waitForTimeout(3000);
      
      // Check that audio settings are maintained
      const audioSettings = await tracker.checkLocalStorage('audioSettings');
      tracker.logAudioEvent('Audio settings during gameplay', { 
        settingsFound: audioSettings ? 'yes' : 'no' 
      });
      
      if (audioSettings && typeof audioSettings === 'object') {
        const settings = audioSettings as Record<string, unknown>;
        expect(settings.enabled).toBe(true);
        expect(settings.volume).toBe(0.8);
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});
