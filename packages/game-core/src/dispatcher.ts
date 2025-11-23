/**
 * GameAction dispatcher - routes actions to current phase controller.
 */
import { GameAction } from './actions';
import { EventBus } from './events/eventBus';
import { PhaseControllerMap, GameModuleContext } from './phases';

export interface DispatcherContext {
  getCurrentPhaseId: () => string;
  setCurrentPhaseId: (id: string) => void;
  controllers: PhaseControllerMap;
  eventBus: EventBus;
  moduleCtx: GameModuleContext; // narrowed from any
}

export function createDispatcher(ctx: DispatcherContext) {
  return function dispatch(action: GameAction, payload?: unknown) {
    ctx.eventBus.publish({ type: 'ACTION/DISPATCH', action, payload });
    const phaseId = ctx.getCurrentPhaseId();
    const controller = ctx.controllers[phaseId];
    if (!controller) {
      ctx.eventBus.publish({ type: 'ERROR', error: `No controller for phase ${phaseId}` });
      return;
    }
    const result = controller.transition(action, ctx.moduleCtx, payload);
    if (result.type === 'GOTO') {
      ctx.eventBus.publish({ type: 'PHASE/EXIT', phaseId });
      controller.onExit?.(ctx.moduleCtx);
      ctx.setCurrentPhaseId(result.phaseId);
      const nextCtrl = ctx.controllers[result.phaseId];
      ctx.eventBus.publish({ type: 'PHASE/ENTER', phaseId: result.phaseId });
      nextCtrl?.onEnter?.(ctx.moduleCtx);
    } else if (result.type === 'COMPLETE') {
      ctx.eventBus.publish({ type: 'GAME/COMPLETE' });
    } else {
      // STAY - no-op
    }
  };
}
