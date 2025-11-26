/**
 * Framework Action Dispatchers
 * Helper functions to dispatch framework actions from legacy components.
 * These bridge the gap during the migration from direct handlers to modular flow.
 */
import type { EventBus } from '../../framework/core/events/eventBus';
import { GameAction } from '../../framework/core/actions';

interface DispatchContext {
  eventBus?: EventBus;
  // Future: access to dispatcher when available
}

/**
 * Dispatch ADVANCE action through framework if available, otherwise fall back to legacy handler.
 */
export function dispatchAdvance(context: DispatchContext, legacyHandler: () => void, payload?: unknown): void {
  if (context.eventBus) {
    // Use framework action dispatch
    context.eventBus.publish({ 
      type: 'ACTION/DISPATCH', 
      action: GameAction.ADVANCE, 
      payload 
    });
    console.log('🔄 FRAMEWORK: Dispatched ADVANCE action', payload);
  } else {
    // Fall back to legacy handler
    legacyHandler();
    console.log('🔄 LEGACY: Used legacy advance handler');
  }
}

/**
 * Dispatch SELECT_TARGET action for blame selection.
 */
export function dispatchSelectTarget(context: DispatchContext, legacyHandler: (target: string) => void, target: string): void {
  if (context.eventBus) {
    context.eventBus.publish({ 
      type: 'ACTION/DISPATCH', 
      action: GameAction.SELECT_TARGET, 
      payload: { target } 
    });
    console.log('🔄 FRAMEWORK: Dispatched SELECT_TARGET action', { target });
  } else {
    legacyHandler(target);
    console.log('🔄 LEGACY: Used legacy blame handler');
  }
}

/**
 * Dispatch REVEAL action for blame reveal phase.
 */
export function dispatchReveal(context: DispatchContext, legacyHandler: () => void): void {
  if (context.eventBus) {
    context.eventBus.publish({ 
      type: 'ACTION/DISPATCH', 
      action: GameAction.REVEAL 
    });
    console.log('🔄 FRAMEWORK: Dispatched REVEAL action');
  } else {
    legacyHandler();
    console.log('🔄 LEGACY: Used legacy reveal handler');
  }
}

/**
 * Dispatch BACK action for previous question/phase.
 */
export function dispatchBack(context: DispatchContext, legacyHandler: () => void): void {
  if (context.eventBus) {
    context.eventBus.publish({ 
      type: 'ACTION/DISPATCH', 
      action: GameAction.BACK 
    });
    console.log('🔄 FRAMEWORK: Dispatched BACK action');
  } else {
    legacyHandler();
    console.log('🔄 LEGACY: Used legacy back handler');
  }
}

/**
 * Dispatch RESTART action for game restart.
 */
export function dispatchRestart(context: DispatchContext, legacyHandler: () => void): void {
  if (context.eventBus) {
    context.eventBus.publish({ 
      type: 'ACTION/DISPATCH', 
      action: GameAction.RESTART 
    });
    console.log('🔄 FRAMEWORK: Dispatched RESTART action');
  } else {
    legacyHandler();
    console.log('🔄 LEGACY: Used legacy restart handler');
  }
}

/**
 * Create dispatch context from available framework resources.
 */
export function createDispatchContext(eventBus?: EventBus | null): DispatchContext {
  return {
    eventBus: eventBus || undefined
  };
}