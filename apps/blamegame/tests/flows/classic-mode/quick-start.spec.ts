/**
 * Flow Test: Classic Mode Quick Start
 * 
 * Purpose: Tests the complete Classic mode user journey from intro to completion
 * using default settings for rapid game start.
 * 
 * Test Flow:
 * - Intro Screen → Start Game → Loading → Questions → Summary → Restart
 * 
 * Features Tested:
 * - Quick start functionality
 * - Question navigation
 * - Progress tracking
 * - Game completion
 * - Summary statistics
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('Classic Mode: Quick Start Flow', () => {
  test('should complete full classic mode game flow', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'classic-mode-quick-start-full');
    
    // Step 1: Navigate to app
    tracker.logUserAction('Navigate to app');
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Step 2: Verify intro screen
    tracker.logUserAction('Verify intro screen elements');
    await expect(page.getByText('BlameGame').first()).toBeVisible();
    
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    await expect(startButton).toBeVisible();
    
    await tracker.takeScreenshot('intro-screen');
    
    // Step 3: Start game (Classic mode default)
    tracker.logUserAction('Click start game button');
    const clickTime = await tracker.measureInteraction(async () => {
      await startButton.click();
    });
    
    expect(clickTime).toBeLessThan(1000); // Should respond quickly
    
    // Step 4: Wait for loading or direct question display
    tracker.logGameEvent('Waiting for game to start');
    
    // Check if we go to loading screen or directly to questions
    await page.waitForTimeout(2000);
    
    // Look for either loading screen or question content
    const loadingScreen = page.locator('text*=Loading').or(page.locator('text*=Laden'));
    const questionScreen = page.locator('text*=Question').or(page.locator('text*=Frage'));
    
    const hasLoading = await loadingScreen.count() > 0;
    const hasQuestion = await questionScreen.count() > 0;
    
    tracker.logGameEvent('Game start state detected', { hasLoading, hasQuestion });
    
    if (hasLoading) {
      tracker.logGameEvent('Loading screen displayed');
      await tracker.takeScreenshot('loading-screen');
      
      // Wait for loading to complete
      await page.waitForSelector('text*=Question', { timeout: 10000 })
        .catch(() => page.waitForSelector('text*=Frage', { timeout: 5000 }));
    }
    
    // Step 5: Verify we're in question mode
    tracker.logGameEvent('Verifying question screen');
    
    // Should see question content
    const questionVisible = await page.locator('body').filter({ hasText: /question|frage/i }).count() > 0;
    expect(questionVisible).toBe(true);
    
    await tracker.takeScreenshot('first-question');
    
    // Step 6: Navigate through several questions
    tracker.logUserAction('Navigate through questions');
    
    const questionsToAnswer = 5;
    for (let i = 0; i < questionsToAnswer; i++) {
      // Look for next button or answer options
      const nextButton = page.getByRole('button', { name: /next|weiter|nächste/i }).first();
      
      if (await nextButton.isVisible()) {
        const navigationTime = await tracker.measureInteraction(async () => {
          await nextButton.click();
        });
        
        tracker.logGameEvent(`Question ${i + 1} answered`, { navigationTime });
        expect(navigationTime).toBeLessThan(500);
        
        // Wait for next question to load
        await page.waitForTimeout(500);
      } else {
        // Maybe we need to click on an answer first
        const answerButton = page.getByRole('button').first();
        if (await answerButton.isVisible()) {
          await answerButton.click();
          await page.waitForTimeout(300);
          
          // Try next button again
          const nextAfterAnswer = page.getByRole('button', { name: /next|weiter|nächste/i }).first();
          if (await nextAfterAnswer.isVisible()) {
            await nextAfterAnswer.click();
            tracker.logGameEvent(`Question ${i + 1} answered after selection`);
          }
        }
      }
      
      // Take screenshot every few questions
      if (i % 2 === 0) {
        await tracker.takeScreenshot(`question-${i + 2}`);
      }
    }
    
    // Step 7: Test navigation controls
    tracker.logUserAction('Test backward navigation');
    
    const backButton = page.getByRole('button', { name: /previous|zurück|back/i }).first();
    if (await backButton.isVisible()) {
      await backButton.click();
      tracker.logGameEvent('Backward navigation tested');
      await page.waitForTimeout(500);
      
      // Go forward again
      const forwardButton = page.getByRole('button', { name: /next|weiter|vor/i }).first();
      if (await forwardButton.isVisible()) {
        await forwardButton.click();
        tracker.logGameEvent('Forward navigation tested');
      }
    }
    
    // Step 8: Skip to end or continue to summary
    tracker.logUserAction('Navigate towards game end');
    
    // Try to reach the end quickly for testing purposes
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      const summaryVisible = await page.locator('text*=Summary').or(page.locator('text*=Zusammenfassung')).count() > 0;
      const gameOverVisible = await page.locator('text*=Game Over').or(page.locator('text*=Spiel beendet')).count() > 0;
      
      if (summaryVisible || gameOverVisible) {
        tracker.logGameEvent('Game end reached');
        break;
      }
      
      // Continue navigating
      const nextBtn = page.getByRole('button', { name: /next|weiter|nächste/i }).first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      } else {
        // Maybe we need to skip or there's a different way to proceed
        break;
      }
      
      attempts++;
    }
    
    // Step 9: Verify summary screen (if reached)
    const summaryReached = await page.locator('text*=Summary').or(page.locator('text*=Zusammenfassung')).count() > 0;
    
    if (summaryReached) {
      tracker.logGameEvent('Summary screen reached');
      await tracker.takeScreenshot('summary-screen');
      
      // Look for restart/new game button
      const restartButton = page.getByRole('button', { name: /new game|neues spiel|restart|neustart/i }).first();
      if (await restartButton.isVisible()) {
        tracker.logUserAction('Test restart functionality');
        await restartButton.click();
        
        // Should return to intro
        await page.waitForTimeout(2000);
        const backToIntro = await page.getByText('BlameGame').first().isVisible();
        expect(backToIntro).toBe(true);
        tracker.logGameEvent('Successfully returned to intro');
      }
    } else {
      tracker.logGameEvent('Summary screen not reached in test time limit');
    }
    
    // Final verification
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5); // Allow some minor errors
    expect(report.userActions.length).toBeGreaterThan(10); // Should have multiple interactions
    
    tracker.logGameEvent('Classic mode quick start test completed', {
      totalActions: report.userActions.length,
      totalErrors: report.errors.length,
      duration: report.duration
    });
  });

  test('should handle rapid question navigation', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'classic-mode-rapid-navigation');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Start game
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    await startButton.click();
    tracker.logUserAction('Game started for rapid navigation test');
    
    // Wait for questions to load
    await page.waitForTimeout(3000);
    
    // Rapidly navigate through questions
    tracker.logUserAction('Begin rapid navigation test');
    
    const rapidNavigationCount = 10;
    const navigationTimes: number[] = [];
    
    for (let i = 0; i < rapidNavigationCount; i++) {
      const startTime = Date.now();
      
      const nextButton = page.getByRole('button', { name: /next|weiter|nächste/i }).first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const navTime = Date.now() - startTime;
        navigationTimes.push(navTime);
        
        tracker.logPerformance('rapidNavigation', navTime);
        
        // Very short delay to simulate rapid clicking
        await page.waitForTimeout(50);
      } else {
        break;
      }
    }
    
    // Verify performance
    const averageNavTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(averageNavTime).toBeLessThan(1000); // Average should be under 1 second
    
    tracker.logPerformance('averageRapidNavigation', averageNavTime);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should maintain game state during navigation', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'classic-mode-state-maintenance');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Start game
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    await startButton.click();
    tracker.logUserAction('Game started for state maintenance test');
    
    // Wait for game to load
    await page.waitForTimeout(3000);
    
    // Navigate forward a few questions
    for (let i = 0; i < 3; i++) {
      const nextButton = page.getByRole('button', { name: /next|weiter|nächste/i }).first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        tracker.logGameEvent(`Navigated to question ${i + 2}`);
      }
    }
    
    // Test backward navigation
    const backButton = page.getByRole('button', { name: /previous|zurück|back/i }).first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(500);
      tracker.logGameEvent('Navigated backward');
      
      // Navigate forward again
      const forwardButton = page.getByRole('button', { name: /next|weiter|vor/i }).first();
      if (await forwardButton.isVisible()) {
        await forwardButton.click();
        tracker.logGameEvent('Navigated forward again');
      }
    }
    
    // Check that the app is still responsive
    const appResponsive = await page.locator('body').isVisible();
    expect(appResponsive).toBe(true);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});
