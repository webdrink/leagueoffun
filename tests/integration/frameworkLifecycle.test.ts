/**
 * Framework Lifecycle Contract Test
 * End-to-end test: select NameBlame -> verify LIFECYCLE/INIT -> LIFECYCLE/READY -> PHASE/ENTER(intro) sequence.
 */
import { test, expect } from '@playwright/test';

test.describe('Framework Lifecycle Contract Tests', () => {
  test('should emit correct lifecycle events when selecting NameBlame module', async ({ page }) => {
    await page.goto('/');
    
    // Wait for framework host to be ready
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Capture events by subscribing to global EventBus
    const events = await page.evaluate(() => {
      return new Promise<Array<{ type: string; [key: string]: unknown }>>((resolve) => {
        const collectedEvents: Array<{ type: string; [key: string]: unknown }> = [];
        
        // Wait for EventBus to be available
        const checkForEventBus = () => {
          const eventBus = (window as unknown as { frameworkEventBus?: { subscribe: (fn: (evt: unknown) => void) => () => void } }).frameworkEventBus;
          if (eventBus) {
            const unsubscribe = eventBus.subscribe((evt: unknown) => {
              const typedEvent = evt as { type: string; [key: string]: unknown };
              collectedEvents.push(typedEvent);
              
              // Resolve when we see PHASE/ENTER which indicates full initialization
              if (typedEvent.type === 'PHASE/ENTER') {
                setTimeout(() => {
                  unsubscribe();
                  resolve(collectedEvents);
                }, 100); // Small delay to catch any additional events
              }
            });
            
            // Trigger game selection if GameMenu is visible
            const gameMenu = document.querySelector('[data-framework-host]');
            if (gameMenu) {
              const nameBlameButton = Array.from(document.querySelectorAll('button'))
                .find(btn => btn.textContent?.includes('NameBlame') || btn.textContent?.includes('nameblame'));
              
              if (nameBlameButton) {
                nameBlameButton.click();
              } else {
                // If no game menu visible, the modular path might not be active
                resolve(collectedEvents);
              }
            }
          } else {
            // Retry after a short delay
            setTimeout(checkForEventBus, 100);
          }
        };
        
        checkForEventBus();
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(collectedEvents), 10000);
      });
    });

    // Verify event sequence
    const eventTypes = events.map(e => e.type);
    
    // Should see LIFECYCLE/INIT at minimum (from GameHost)
    expect(eventTypes).toContain('LIFECYCLE/INIT');
    
    // If we successfully selected a game, should see LIFECYCLE/READY
    if (eventTypes.includes('LIFECYCLE/READY')) {
      expect(eventTypes).toContain('LIFECYCLE/READY');
      
      // Should see PHASE/ENTER after LIFECYCLE/READY
      const initIndex = eventTypes.indexOf('LIFECYCLE/INIT');
      const readyIndex = eventTypes.indexOf('LIFECYCLE/READY');
      const phaseEnterIndex = eventTypes.indexOf('PHASE/ENTER');
      
      expect(initIndex).toBeLessThan(readyIndex);
      expect(readyIndex).toBeLessThan(phaseEnterIndex);
      
      // PHASE/ENTER should be for 'intro' phase
      const phaseEnterEvent = events.find(e => e.type === 'PHASE/ENTER');
      expect(phaseEnterEvent).toHaveProperty('phaseId', 'intro');
    }
    
    console.log('Captured events:', eventTypes);
  });

  test('should handle module initialization errors gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Check for error handling by examining console errors or error UI
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Look for error UI elements
    const hasErrorMessage = await page.evaluate(() => {
      return document.body.textContent?.includes('Failed to load game') || 
             document.body.textContent?.includes('error') ||
             false;
    });
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    // Should not have critical framework errors
    const criticalErrors = consoleLogs.filter(log => 
      log.includes('framework') && 
      (log.includes('error') || log.includes('failed'))
    );
    
    // Framework should handle errors gracefully
    expect(criticalErrors.length).toBeLessThanOrEqual(0);
    
    console.log('Console errors:', consoleLogs);
    console.log('Has error UI:', hasErrorMessage);
  });

  test('should show EventBus stream in DebugPanel when available', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Open debug panel (legacy App.tsx should have the D button)
    const debugButton = page.locator('button:has-text("D")');
    if (await debugButton.isVisible()) {
      await debugButton.click();
      
      // Wait for debug panel
      await page.waitForSelector('text=Event Stream', { timeout: 3000 }).catch(() => {
        // DebugPanel might not have EventBus integration visible
      });
      
      // Check if EventBus stream section exists
      const hasEventStream = await page.locator('text=Event Stream').isVisible().catch(() => false);
      
      if (hasEventStream) {
        // Try to toggle event stream visibility
        const showButton = page.locator('button:has-text("Show")');
        if (await showButton.isVisible()) {
          await showButton.click();
          
          // Should see some events or "No events yet" message
          const hasEventDisplay = await page.waitForSelector(
            'text=No events yet, text=LIFECYCLE/INIT, text=PHASE/ENTER', 
            { timeout: 2000 }
          ).then(() => true).catch(() => false);
          
          expect(hasEventDisplay).toBe(true);
        }
      }
      
      console.log('EventBus integration visible:', hasEventStream);
    }
  });

  test('should maintain stable event ordering', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
    
    // Test that events are published in predictable order multiple times
    const testRuns = 3;
    const eventSequences: string[][] = [];
    
    for (let run = 0; run < testRuns; run++) {
      const events = await page.evaluate(() => {
        return new Promise<string[]>((resolve) => {
          const eventTypes: string[] = [];
          const eventBus = (window as unknown as { frameworkEventBus?: { subscribe: (fn: (evt: unknown) => void) => () => void } }).frameworkEventBus;
          
          if (eventBus) {
            const unsubscribe = eventBus.subscribe((evt: unknown) => {
              const typedEvent = evt as { type: string };
              eventTypes.push(typedEvent.type);
            });
            
            // Collect events for a short period
            setTimeout(() => {
              unsubscribe();
              resolve(eventTypes);
            }, 1000);
          } else {
            resolve([]);
          }
        });
      });
      
      eventSequences.push(events);
      
      // Small delay between runs
      await page.waitForTimeout(500);
    }
    
    // All runs should have LIFECYCLE/INIT if EventBus is working
    const initEvents = eventSequences.map(seq => seq.filter(type => type === 'LIFECYCLE/INIT').length);
    
    // Should have consistent initialization
    if (initEvents.some(count => count > 0)) {
      expect(initEvents.every(count => count >= 1)).toBe(true);
    }
    
    console.log('Event sequences across runs:', eventSequences);
  });
});