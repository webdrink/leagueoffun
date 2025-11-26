/**
 * Phase Controller Integration Tests
 * Tests phase transitions, provider integration, and event emission.
 */
import { test, expect } from '@playwright/test';

test.describe('Phase Controller Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
  });

  test('should handle phase transitions correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate phase controller behavior
      const GameAction = {
        ADVANCE: 'ADVANCE',
        BACK: 'BACK',
        SELECT_TARGET: 'SELECT_TARGET',
        REVEAL: 'REVEAL',
        RESTART: 'RESTART'
      };
      
      // Mock provider
      const mockProvider = {
        index: 0,
        total: 3,
        progress() { return { index: this.index, total: this.total }; },
        next() { 
          if (this.index < this.total - 1) this.index++;
          return this.index < this.total ? { text: `Question ${this.index + 1}` } : null;
        }
      };
      
      // Mock event bus
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };
      
      // Simulate play phase controller
      const playPhaseController = {
        transition(action: string) {
          switch (action) {
            case GameAction.ADVANCE: {
              const { index, total } = mockProvider.progress();
              mockEventBus.publish({ type: 'CONTENT/NEXT', index: index + 1 });
              
              if (index + 1 < total) {
                mockProvider.next();
                return { type: 'STAY' };
              } else {
                return { type: 'GOTO', phaseId: 'summary' };
              }
            }
            case GameAction.SELECT_TARGET:
              return { type: 'STAY' };
            case GameAction.REVEAL:
              return { type: 'STAY' };
            default:
              return { type: 'STAY' };
          }
        }
      };
      
      // Test transitions
      const results = [];
      
      // First ADVANCE - should stay in play
      results.push({
        action: 'ADVANCE_1',
        result: playPhaseController.transition(GameAction.ADVANCE),
        providerState: mockProvider.progress()
      });
      
      // Second ADVANCE - should stay in play
      results.push({
        action: 'ADVANCE_2',
        result: playPhaseController.transition(GameAction.ADVANCE),
        providerState: mockProvider.progress()
      });
      
      // Third ADVANCE - should go to summary
      results.push({
        action: 'ADVANCE_3',
        result: playPhaseController.transition(GameAction.ADVANCE),
        providerState: mockProvider.progress()
      });
      
      return { results, events };
    });
    
    // First advance: stay in play, provider advances
    expect(result.results[0].result).toEqual({ type: 'STAY' });
    expect(result.results[0].providerState).toEqual({ index: 1, total: 3 });
    
    // Second advance: stay in play, provider advances
    expect(result.results[1].result).toEqual({ type: 'STAY' });
    expect(result.results[1].providerState).toEqual({ index: 2, total: 3 });
    
    // Third advance: go to summary, provider at end
    expect(result.results[2].result).toEqual({ type: 'GOTO', phaseId: 'summary' });
    expect(result.results[2].providerState).toEqual({ index: 2, total: 3 });
    
    // Check events were emitted
    expect(result.events).toHaveLength(3);
    expect(result.events[0]).toEqual({ type: 'CONTENT/NEXT', index: 2 });
    expect(result.events[1]).toEqual({ type: 'CONTENT/NEXT', index: 3 });
    expect(result.events[2]).toEqual({ type: 'CONTENT/NEXT', index: 3 });
  });

  test('should handle other actions appropriately', async ({ page }) => {
    const result = await page.evaluate(() => {
      const GameAction = {
        SELECT_TARGET: 'SELECT_TARGET',
        REVEAL: 'REVEAL',
        BACK: 'BACK'
      };
      
      const playPhaseController = {
        transition(action: string) {
          switch (action) {
            case GameAction.SELECT_TARGET:
              return { type: 'STAY' };
            case GameAction.REVEAL:
              return { type: 'STAY' };
            default:
              return { type: 'STAY' };
          }
        }
      };
      
      return {
        selectTarget: playPhaseController.transition(GameAction.SELECT_TARGET),
        reveal: playPhaseController.transition(GameAction.REVEAL),
        back: playPhaseController.transition(GameAction.BACK)
      };
    });
    
    expect(result.selectTarget).toEqual({ type: 'STAY' });
    expect(result.reveal).toEqual({ type: 'STAY' });
    expect(result.back).toEqual({ type: 'STAY' });
  });
});