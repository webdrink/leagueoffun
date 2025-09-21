/**
 * EventBus Unit Tests
 * Tests the pub/sub system, error handling, and subscriber management.
 */
import { test, expect } from '@playwright/test';

test.describe('EventBus Unit Tests', () => {
  test('should create EventBus and publish/subscribe to events', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Import and create EventBus
      const { createEventBus } = require('../../framework/core/events/eventBus');
      const bus = createEventBus();
      
      const events: Array<{ type: string; data?: unknown }> = [];
      const unsubscribe = bus.subscribe((evt: { type: string; data?: unknown }) => {
        events.push(evt);
      });
      
      // Publish test events
      bus.publish({ type: 'LIFECYCLE/INIT' });
      bus.publish({ type: 'PHASE/ENTER', phaseId: 'test' });
      bus.publish({ type: 'ACTION/DISPATCH', action: 'ADVANCE', payload: { test: true } });
      
      unsubscribe();
      bus.publish({ type: 'LIFECYCLE/READY' }); // Should not be received
      
      return {
        eventCount: events.length,
        subscriberCount: bus.count(),
        events
      };
    });
    
    expect(result.eventCount).toBe(3);
    expect(result.subscriberCount).toBe(0); // Unsubscribed
    expect(result.events[0].type).toBe('LIFECYCLE/INIT');
    expect(result.events[1].type).toBe('PHASE/ENTER');
    expect(result.events[2].type).toBe('ACTION/DISPATCH');
  });

  test('should handle subscriber errors gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createEventBus } = require('../../framework/core/events/eventBus');
      const bus = createEventBus();
      
      let errorThrown = false;
      let validEventReceived = false;
      
      // Subscribe with error-throwing handler
      bus.subscribe(() => {
        errorThrown = true;
        throw new Error('Test error');
      });
      
      // Subscribe with valid handler
      bus.subscribe(() => {
        validEventReceived = true;
      });
      
      bus.publish({ type: 'LIFECYCLE/INIT' });
      
      return { errorThrown, validEventReceived };
    });
    
    expect(result.errorThrown).toBe(true);
    expect(result.validEventReceived).toBe(true); // Other subscribers should still work
  });

  test('should clear all subscribers', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { createEventBus } = require('../../framework/core/events/eventBus');
      const bus = createEventBus();
      
      let eventCount = 0;
      bus.subscribe(() => eventCount++);
      bus.subscribe(() => eventCount++);
      
      expect(bus.count()).toBe(2);
      
      bus.clear();
      bus.publish({ type: 'LIFECYCLE/INIT' });
      
      return { eventCount, subscriberCount: bus.count() };
    });
    
    expect(result.eventCount).toBe(0);
    expect(result.subscriberCount).toBe(0);
  });
});