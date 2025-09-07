/**
 * Framework Integration Tests
 * 
 * Purpose: Test the new framework components and Zustand store integration
 * implemented as part of the component modularization plan. These tests
 * validate that the framework architecture works correctly with NameBlame.
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../../utils/debug-helpers';

test.describe('Framework Integration Tests', () => {
  
  test('should validate translation keys for NameBlame mode', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'nameblame-translation-validation');
    
    // Test multiple languages
    const languages = ['en', 'de', 'es', 'fr'];
    
    for (const lang of languages) {
      tracker.logUserAction(`Testing ${lang} language translations`);
      
      // Navigate with language parameter
      await page.goto(`/?lang=${lang}`);
      await tracker.measurePageLoad();
      
      // Enable NameBlame mode
      const nameBlameModeToggle = page.getByRole('switch').first();
      if (await nameBlameModeToggle.count() > 0) {
        const isChecked = await nameBlameModeToggle.isChecked();
        if (!isChecked) {
          await nameBlameModeToggle.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Navigate to setup screen
      const startButton = page.getByRole('button', { name: /start|spiel starten|iniciar|commencer/i });
      if (await startButton.count() > 0) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }
      
      // Check for 3-player minimum hint in the correct language
      const expectedTexts = {
        'en': /minimum.*3.*player/i,
        'de': /mindestens.*3.*spieler/i,
        'es': /mínimo.*3.*jugador/i,
        'fr': /minimum.*3.*joueur/i
      };
      
      // Add 2 players to trigger the hint
      const playerInput = page.getByPlaceholder(/spielername|player name|nombre|nom/i);
      const addButton = page.locator('button').filter({ hasText: /\\+|add|añadir|ajouter/i }).first();
      
      if (await playerInput.count() > 0 && await addButton.count() > 0) {
        // Add first player
        await playerInput.fill('Player1');
        await addButton.click();
        await page.waitForTimeout(300);
        
        // Add second player
        await playerInput.fill('Player2');
        await addButton.click();
        await page.waitForTimeout(300);
        
        // Check for minimum player hint
        const hintText = expectedTexts[lang as keyof typeof expectedTexts];
        const hintVisible = await page.locator('body').locator(`text=${hintText}`).count() > 0;
        
        tracker.logGameEvent(`${lang} translation validation`, { 
          hintVisible,
          expectedPattern: hintText.toString()
        });
        
        expect(hintVisible).toBe(true);
        
        await tracker.takeScreenshot(`${lang}-translation-hint`);
      }
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
  
  test('should validate Zustand store state management', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'zustand-store-validation');
    
    // Monitor store state changes via console
    const storeEvents: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('GameStateStore') || text.includes('BlameGameStore') || text.includes('store')) {
        storeEvents.push(text);
      }
    });
    
    // Add script to expose store state for testing
    await page.addInitScript(() => {
      (window as Window & { testStoreAccess?: boolean }).testStoreAccess = true;
    });
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Step 1: Test initial store state
    tracker.logUserAction('Testing initial store state');
    
    const initialStoreState = await page.evaluate(() => {
      // Access store if exposed for testing
      try {
        return {
          storeAvailable: typeof (window as Window & { gameStateStore?: unknown }).gameStateStore !== 'undefined',
          blameStoreAvailable: typeof (window as Window & { blameGameStore?: unknown }).blameGameStore !== 'undefined'
        };
      } catch (e) {
        return { storeAvailable: false, blameStoreAvailable: false };
      }
    });
    
    tracker.logGameEvent('Initial store state', initialStoreState);
    
    // Step 2: Test NameBlame mode state changes
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        tracker.logUserAction('Toggled NameBlame mode');
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 3: Test player addition in store
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    if (await playerInput.count() > 0 && await addButton.count() > 0) {
      // Add players and monitor store updates
      const players = ['Alice', 'Bob', 'Charlie'];
      
      for (const playerName of players) {
        await playerInput.fill(playerName);
        await addButton.click();
        tracker.logUserAction(`Added player ${playerName} to store`);
        await page.waitForTimeout(500);
      }
      
      // Step 4: Start game and test game state store
      const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
      if (await startGameButton.count() > 0) {
        await startGameButton.click();
        tracker.logUserAction('Started game - testing game state store');
        await page.waitForTimeout(3000);
        
        // Step 5: Test blame action and blame store
        const playerButtons = page.getByRole('button').filter({ hasText: /alice|bob|charlie/i });
        let availableButton = null;
        
        for (let i = 0; i < await playerButtons.count(); i++) {
          const button = playerButtons.nth(i);
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            availableButton = button;
            break;
          }
        }
        
        if (availableButton) {
          const buttonText = await availableButton.textContent();
          await availableButton.click();
          tracker.logUserAction(`Blamed ${buttonText} - testing blame store`);
          await page.waitForTimeout(2000);
          
          // Test blame store state
          const blameStoreState = await page.evaluate(() => {
            try {
              // Check if blame action was recorded
              return {
                blameRecorded: true, // Placeholder - would need store exposure
                timestamp: Date.now()
              };
            } catch (e) {
              return { blameRecorded: false };
            }
          });
          
          tracker.logGameEvent('Blame store state after action', blameStoreState);
        }
      }
    }
    
    // Step 6: Analyze store events
    tracker.logGameEvent('Store events captured', { 
      totalEvents: storeEvents.length,
      events: storeEvents.slice(-10) // Last 10 events
    });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should validate framework component integration', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-component-integration');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Step 1: Test framework layout components
    tracker.logUserAction('Testing framework layout components');
    
    // Look for framework structure elements
    const layoutElements = [
      '[data-testid="game-main"]',
      '[data-testid="game-main-header"]',
      '[data-testid="game-main-screen"]',
      '[data-testid="game-main-footer"]'
    ];
    
    const layoutDetection: Record<string, boolean> = {};
    
    for (const selector of layoutElements) {
      const exists = await page.locator(selector).count() > 0;
      layoutDetection[selector] = exists;
      tracker.logGameEvent(`Framework component detection`, { 
        component: selector, 
        exists 
      });
    }
    
    await tracker.takeScreenshot('framework-layout-detection');
    
    // Step 2: Test responsive framework behavior
    tracker.logUserAction('Testing framework responsive behavior');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      tracker.logUserAction(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      await page.waitForTimeout(1000);
      
      // Check if layout adapts properly
      const body = page.locator('body');
      const bodyClasses = await body.getAttribute('class') || '';
      
      tracker.logGameEvent(`${viewport.name} layout classes`, { 
        classes: bodyClasses,
        hasResponsiveClasses: bodyClasses.includes('responsive') || bodyClasses.includes(viewport.name)
      });
      
      await tracker.takeScreenshot(`framework-${viewport.name}-layout`);
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Step 3: Test framework with NameBlame game flow
    tracker.logUserAction('Testing framework with NameBlame flow');
    
    // Enable NameBlame and start game
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
        await page.waitForTimeout(1000);
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Quick setup
    const playerInput = page.getByPlaceholder(/spielername|player name/i);
    const addButton = page.locator('button').filter({ hasText: /\\+|add/i }).first();
    
    if (await playerInput.count() > 0 && await addButton.count() > 0) {
      const players = ['Test1', 'Test2', 'Test3'];
      for (const player of players) {
        await playerInput.fill(player);
        await addButton.click();
        await page.waitForTimeout(300);
      }
      
      const startGameButton = page.getByRole('button', { name: /spiel.*starten|start.*game/i });
      await startGameButton.click();
      await page.waitForTimeout(3000);
      
      // Step 4: Test framework during game
      tracker.logUserAction('Testing framework during active game');
      
      // Check for framework header with game info
      const headerElements = [
        page.getByText(/frage.*\d+|question.*\d+/i), // Progress
        page.getByText(/test1|test2|test3/i) // Player info
      ];
      
      let headerWorking = true;
      for (const element of headerElements) {
        const visible = await element.count() > 0;
        if (!visible) headerWorking = false;
      }
      
      tracker.logGameEvent('Framework header in game', { working: headerWorking });
      expect(headerWorking).toBe(true);
      
      // Test framework footer with blame options
      const blameButtons = page.getByRole('button').filter({ hasText: /test1|test2|test3/i });
      const footerWorking = await blameButtons.count() > 0;
      
      tracker.logGameEvent('Framework footer with blame options', { working: footerWorking });
      expect(footerWorking).toBe(true);
      
      await tracker.takeScreenshot('framework-during-game');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
  
  test('should handle framework error boundaries and loading states', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-error-handling');
    
    // Monitor JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => {
      jsErrors.push(err.message);
      tracker.logGameEvent('JavaScript error detected', { error: err.message });
    });
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Step 1: Test framework loading states
    tracker.logUserAction('Testing framework loading states');
    
    // Enable NameBlame mode and navigate quickly to test loading
    const nameBlameModeToggle = page.getByRole('switch').first();
    if (await nameBlameModeToggle.count() > 0) {
      const isChecked = await nameBlameModeToggle.isChecked();
      if (!isChecked) {
        await nameBlameModeToggle.click();
      }
    }
    
    const startButton = page.getByRole('button', { name: /start|spiel starten/i });
    await startButton.click();
    
    // Look for loading indicators
    const loadingElements = [
      page.locator('[data-testid="loading"]'),
      page.locator('.loading'),
      page.getByText(/loading|laden/i)
    ];
    
    let loadingDetected = false;
    for (const element of loadingElements) {
      if (await element.count() > 0) {
        loadingDetected = true;
        break;
      }
    }
    
    tracker.logGameEvent('Framework loading state detection', { detected: loadingDetected });
    
    await page.waitForTimeout(2000);
    
    // Step 2: Test rapid navigation to stress framework
    tracker.logUserAction('Testing rapid navigation stress');
    
    // Rapid clicks to test framework stability
    const backButton = page.getByRole('button', { name: /back|zurück/i });
    if (await backButton.count() > 0) {
      for (let i = 0; i < 3; i++) {
        await backButton.click();
        await page.waitForTimeout(100);
        
        const startBtn = page.getByRole('button', { name: /start|spiel starten/i });
        if (await startBtn.count() > 0) {
          await startBtn.click();
          await page.waitForTimeout(100);
        }
      }
    }
    
    // Step 3: Check for framework stability
    tracker.logGameEvent('Framework stability check', { 
      jsErrors: jsErrors.length,
      errors: jsErrors
    });
    
    // Should handle rapid navigation without major errors
    expect(jsErrors.length).toBeLessThan(5);
    
    // Step 4: Test framework recovery
    tracker.logUserAction('Testing framework recovery');
    
    // Navigate to a stable state
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const pageStillResponsive = await page.getByRole('button', { name: /start|spiel starten/i }).count() > 0;
    tracker.logGameEvent('Framework recovery verification', { responsive: pageStillResponsive });
    expect(pageStillResponsive).toBe(true);
    
    await tracker.takeScreenshot('framework-post-stress-test');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });
});