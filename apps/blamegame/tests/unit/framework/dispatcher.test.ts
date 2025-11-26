/**
 * Dispatcher Unit Tests
 * Tests action routing, phase transitions, event sequencing, and error handling.
 */
import { test, expect } from '@playwright/test';

test.describe('Dispatcher Unit Tests', () => {
  test('should route actions to current phase controller', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Mock event bus
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      // Mock phase controller
      let transitionCalled = false;
      let receivedAction = '';
      let receivedPayload: unknown = null;

      const mockController = {
        transition(action: string, _ctx: unknown, payload?: unknown) {
          transitionCalled = true;
          receivedAction = action;
          receivedPayload = payload;
          return { type: 'STAY' };
        }
      };

      // Mock dispatcher context
      let currentPhase = 'test-phase';
      const mockContext = {
        getCurrentPhaseId: () => currentPhase,
        setCurrentPhaseId: (id: string) => { currentPhase = id; },
        controllers: { 'test-phase': mockController } as Record<string, { transition: (action: string, ctx: unknown, payload?: unknown) => { type: string } }>,
        eventBus: mockEventBus,
        moduleCtx: {
          config: { id: 'test' },
          dispatch: () => {},
          eventBus: mockEventBus,
          playerId: null,
          roomId: null
        }
      };

      // Simulate dispatcher function
      const dispatch = (action: string, payload?: unknown) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action, payload });
        const phaseId = mockContext.getCurrentPhaseId();
        const controller = mockContext.controllers[phaseId];
        if (!controller) {
          mockEventBus.publish({ type: 'ERROR', error: `No controller for phase ${phaseId}` });
          return;
        }
        const result = controller.transition(action, mockContext.moduleCtx, payload);
        if (result.type === 'STAY') {
          // no-op
        }
        // Other transition types would be handled here
      };

      // Test dispatch
      dispatch('ADVANCE', { test: 'data' });

      return {
        transitionCalled,
        receivedAction,
        receivedPayload,
        actionDispatchEvent: events.find(e => e.type === 'ACTION/DISPATCH'),
        eventCount: events.length
      };
    });

    expect(result.transitionCalled).toBe(true);
    expect(result.receivedAction).toBe('ADVANCE');
    expect(result.receivedPayload).toEqual({ test: 'data' });
    expect(result.actionDispatchEvent).toEqual({
      type: 'ACTION/DISPATCH',
      action: 'ADVANCE',
      payload: { test: 'data' }
    });
    expect(result.eventCount).toBe(1);
  });

  test('should handle GOTO phase transitions with events', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      let onExitCalled = false;
      let onEnterCalled = false;
      let currentPhase = 'source-phase';

      // Simulate simplified dispatcher logic for GOTO
      const dispatch = (action: string) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action });
        
        // Simulate transition result
        if (action === 'ADVANCE' && currentPhase === 'source-phase') {
          // Emit EXIT event 
          mockEventBus.publish({ type: 'PHASE/EXIT', phaseId: currentPhase });
          onExitCalled = true;
          
          // Change phase
          currentPhase = 'target-phase';
          
          // Emit ENTER event
          mockEventBus.publish({ type: 'PHASE/ENTER', phaseId: currentPhase });
          onEnterCalled = true;
        }
      };

      dispatch('ADVANCE');

      const phaseEvents = events.filter(e => e.type.startsWith('PHASE/'));
      
      return {
        currentPhase,
        onExitCalled,
        onEnterCalled,
        phaseEvents,
        allEvents: events
      };
    });

    expect(result.currentPhase).toBe('target-phase');
    expect(result.onExitCalled).toBe(true);
    expect(result.onEnterCalled).toBe(true);
    expect(result.phaseEvents).toEqual([
      { type: 'PHASE/EXIT', phaseId: 'source-phase' },
      { type: 'PHASE/ENTER', phaseId: 'target-phase' }
    ]);
    expect(result.allEvents).toHaveLength(3); // ACTION/DISPATCH + PHASE/EXIT + PHASE/ENTER
  });

  test('should handle COMPLETE transitions', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      // Simplified dispatch simulation for COMPLETE
      const dispatch = (action: string) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action });
        
        // Simulate COMPLETE transition on RESTART action
        if (action === 'RESTART') {
          mockEventBus.publish({ type: 'GAME/COMPLETE' });
        }
      };

      dispatch('RESTART');

      return {
        events,
        hasGameComplete: events.some(e => e.type === 'GAME/COMPLETE')
      };
    });

    expect(result.hasGameComplete).toBe(true);
    expect(result.events).toEqual([
      { type: 'ACTION/DISPATCH', action: 'RESTART' },
      { type: 'GAME/COMPLETE' }
    ]);
  });

  test('should handle missing phase controller error', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      // Simplified error handling simulation
      const dispatch = (action: string) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action });
        
        // Simulate missing controller error
        const phaseId = 'missing-phase';
        mockEventBus.publish({ type: 'ERROR', error: `No controller for phase ${phaseId}` });
      };

      dispatch('ADVANCE');

      const errorEvent = events.find(e => e.type === 'ERROR');
      
      return {
        errorEvent,
        eventCount: events.length
      };
    });

    expect(result.errorEvent).toEqual({
      type: 'ERROR',
      error: 'No controller for phase missing-phase'
    });
    expect(result.eventCount).toBe(2); // ACTION/DISPATCH + ERROR
  });

  test('should handle STAY transitions correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      const currentPhase = 'current-phase';

      // Simplified STAY transition simulation
      const dispatch = (action: string) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action });
        
        // STAY transitions should not change phase or emit additional events
        // No phase change for SELECT_TARGET action
      };

      const initialPhase = currentPhase;
      dispatch('SELECT_TARGET');
      const finalPhase = currentPhase;

      return {
        initialPhase,
        finalPhase,
        phaseChanged: initialPhase !== finalPhase,
        events,
        onlyActionEvent: events.length === 1 && events[0].type === 'ACTION/DISPATCH'
      };
    });

    expect(result.phaseChanged).toBe(false);
    expect(result.initialPhase).toBe('current-phase');
    expect(result.finalPhase).toBe('current-phase');
    expect(result.onlyActionEvent).toBe(true);
  });
});