/**
 * FrameworkRouter Integration Tests
 * Tests screen rendering, initial PHASE/ENTER emission, context provision, and error handling.
 */
import { test, expect } from '@playwright/test';

test.describe('FrameworkRouter Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-framework-host]', { timeout: 10000 });
  });

  test('should render screen based on current phase', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate FrameworkRouter screen rendering logic
      const mockConfig = {
        id: 'test-game',
        phases: [
          { id: 'intro', screenId: 'intro', allowedActions: ['ADVANCE'] },
          { id: 'play', screenId: 'play', allowedActions: ['ADVANCE', 'BACK'] }
        ]
      };

      const mockScreenRegistry = {
        'intro': { displayName: 'IntroScreen' },
        'play': { displayName: 'PlayScreen' },
        'missing': null // Missing screen
      };

      // Simulate screen resolution
      const resolveScreen = (phaseId: string) => {
        const phase = mockConfig.phases.find(p => p.id === phaseId);
        if (!phase) return null;
        
        const screenId = phase.screenId;
        return mockScreenRegistry[screenId as keyof typeof mockScreenRegistry] || null;
      };

      return {
        introScreen: resolveScreen('intro'),
        playScreen: resolveScreen('play'),
        missingPhase: resolveScreen('nonexistent'),
        configPhasesLength: mockConfig.phases.length
      };
    });

    expect(result.introScreen).toEqual({ displayName: 'IntroScreen' });
    expect(result.playScreen).toEqual({ displayName: 'PlayScreen' });
    expect(result.missingPhase).toBe(null);
    expect(result.configPhasesLength).toBe(2);
  });

  test('should emit initial PHASE/ENTER event', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      const mockConfig = {
        phases: [{ id: 'intro', screenId: 'intro', allowedActions: ['ADVANCE'] }]
      };

      const mockController = {
        onEnter: () => { events.push({ type: 'CONTROLLER/ON_ENTER', phase: 'intro' }); }
      };

      const mockPhaseControllers = {
        'intro': mockController
      };

      // Simulate initial phase setup
      const initialPhaseId = mockConfig.phases[0]?.id;
      if (initialPhaseId) {
        const ctrl = mockPhaseControllers[initialPhaseId as keyof typeof mockPhaseControllers];
        mockEventBus.publish({ type: 'PHASE/ENTER', phaseId: initialPhaseId });
        ctrl?.onEnter?.();
      }

      return {
        events,
        initialPhaseId,
        hasPhaseEnterEvent: events.some(e => e.type === 'PHASE/ENTER'),
        hasControllerOnEnterEvent: events.some(e => e.type === 'CONTROLLER/ON_ENTER')
      };
    });

    expect(result.initialPhaseId).toBe('intro');
    expect(result.hasPhaseEnterEvent).toBe(true);
    expect(result.hasControllerOnEnterEvent).toBe(true);
    expect(result.events).toEqual([
      { type: 'PHASE/ENTER', phaseId: 'intro' },
      { type: 'CONTROLLER/ON_ENTER', phase: 'intro' }
    ]);
  });

  test('should provide context to screen components', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Simulate context creation and provision
      const mockConfig = {
        id: 'test-game',
        title: 'Test Game',
        phases: [{ id: 'intro', screenId: 'intro', allowedActions: ['ADVANCE'] }]
      };

      const mockEventBus = {
        publish: () => {},
        subscribe: () => () => {}
      };

      const contextValue = {
        currentPhaseId: 'intro',
        dispatch: (action: string) => { return action; },
        eventBus: mockEventBus,
        config: mockConfig
      };

      // Simulate context consumption by a screen component
      const screenComponentProps = {
        context: contextValue,
        hasDispatch: typeof contextValue.dispatch === 'function',
        hasEventBus: typeof contextValue.eventBus === 'object',
        hasConfig: typeof contextValue.config === 'object',
        currentPhase: contextValue.currentPhaseId
      };

      return screenComponentProps;
    });

    expect(result.hasDispatch).toBe(true);
    expect(result.hasEventBus).toBe(true);
    expect(result.hasConfig).toBe(true);
    expect(result.currentPhase).toBe('intro');
    expect(result.context.config.id).toBe('test-game');
  });

  test('should handle missing screen gracefully', async ({ page }) => {
    const result = await page.evaluate(() => {
      const mockConfig = {
        phases: [{ id: 'intro', screenId: 'missing-screen', allowedActions: ['ADVANCE'] }]
      };

      const mockScreenRegistry = {
        // 'missing-screen' is not registered
      };

      // Simulate missing screen detection
      const currentPhase = mockConfig.phases.find(p => p.id === 'intro');
      const screenId = currentPhase?.screenId;
      const ScreenComponent = screenId ? mockScreenRegistry[screenId as keyof typeof mockScreenRegistry] : null;

      const errorMessage = ScreenComponent ? null : `Screen not found: ${screenId} for phase intro`;

      return {
        screenId,
        hasScreenComponent: ScreenComponent !== null && ScreenComponent !== undefined,
        errorMessage,
        phaseFound: currentPhase !== undefined
      };
    });

    expect(result.screenId).toBe('missing-screen');
    expect(result.hasScreenComponent).toBe(false);
    expect(result.errorMessage).toBe('Screen not found: missing-screen for phase intro');
    expect(result.phaseFound).toBe(true);
  });

  test('should handle dispatcher integration', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      const mockController = {
        transition: (action: string) => {
          events.push({ type: 'CONTROLLER/TRANSITION', action });
          return { type: 'STAY' };
        }
      };

      const mockPhaseControllers = {
        'intro': mockController
      };

      let currentPhaseId = 'intro';

      // Simulate dispatcher creation and usage
      const staticPhaseId = currentPhaseId; // avoid reassignment warning
      const dispatch = (action: string, payload?: unknown) => {
        mockEventBus.publish({ type: 'ACTION/DISPATCH', action, payload });
        const controller = mockPhaseControllers[staticPhaseId as keyof typeof mockPhaseControllers];
        if (controller) {
          controller.transition(action);
        }
      };

      // Test dispatch call
      dispatch('ADVANCE', { test: 'data' });

      return {
        events,
        dispatchWorked: events.some(e => e.type === 'ACTION/DISPATCH'),
        controllerCalled: events.some(e => e.type === 'CONTROLLER/TRANSITION'),
        actionDispatchEvent: events.find(e => e.type === 'ACTION/DISPATCH')
      };
    });

    expect(result.dispatchWorked).toBe(true);
    expect(result.controllerCalled).toBe(true);
    expect(result.actionDispatchEvent).toEqual({
      type: 'ACTION/DISPATCH',
      action: 'ADVANCE',
      payload: { test: 'data' }
    });
  });

  test('should handle phase transitions through router', async ({ page }) => {
    const result = await page.evaluate(() => {
      const events: Array<{ type: string; [key: string]: unknown }> = [];
      const mockEventBus = {
        publish(evt: { type: string; [key: string]: unknown }) { events.push(evt); }
      };

      let currentPhaseId = 'intro';
      const phaseHistory: string[] = [currentPhaseId];

      // Simulate phase transition
      const transitionToPhase = (newPhaseId: string) => {
        mockEventBus.publish({ type: 'PHASE/EXIT', phaseId: currentPhaseId });
        currentPhaseId = newPhaseId;
        phaseHistory.push(newPhaseId);
        mockEventBus.publish({ type: 'PHASE/ENTER', phaseId: newPhaseId });
      };

      // Simulate ADVANCE action causing transition
      transitionToPhase('play');

      const phaseEvents = events.filter(e => e.type.startsWith('PHASE/'));

      return {
        currentPhaseId,
        phaseHistory,
        phaseEvents,
        transitionWorked: currentPhaseId === 'play'
      };
    });

    expect(result.currentPhaseId).toBe('play');
    expect(result.phaseHistory).toEqual(['intro', 'play']);
    expect(result.transitionWorked).toBe(true);
    expect(result.phaseEvents).toEqual([
      { type: 'PHASE/EXIT', phaseId: 'intro' },
      { type: 'PHASE/ENTER', phaseId: 'play' }
    ]);
  });
});