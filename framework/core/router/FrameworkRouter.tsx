/**
 * FrameworkRouter
 * 
 * Routes phase changes to screen components via module screen registry.
 * Provides dispatcher context and manages phase transitions.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GameAction } from '../actions';
import { EventBus } from '../events/eventBus';
import { GameConfig } from '../../config/game.schema';
import { ScreenRegistry } from '../modules';
import { createDispatcher } from '../dispatcher';
import GameShell from '../../../components/framework/GameShell';

interface FrameworkRouterContext {
  currentPhaseId: string;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  config: GameConfig;
}

const RouterContext = createContext<FrameworkRouterContext | null>(null);

export const useFrameworkRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useFrameworkRouter must be used within FrameworkRouter');
  return ctx;
};

interface FrameworkRouterProps {
  config: GameConfig;
  screenRegistry: ScreenRegistry;
  phaseControllers: Record<string, import('../phases').PhaseController>;
  eventBus: EventBus;
  children?: React.ReactNode;
}

export const FrameworkRouter: React.FC<FrameworkRouterProps> = ({
  config,
  screenRegistry,
  phaseControllers,
  eventBus,
  children
}) => {
  const [currentPhaseId, setCurrentPhaseId] = useState(config.phases[0]?.id || 'intro');
  
  // Create module context
  const moduleCtx = {
    config,
    dispatch: ((_action: GameAction, _payload?: unknown) => {}) as (action: GameAction, payload?: unknown) => void,
    eventBus,
    playerId: null,
    roomId: null
  };

  // Create dispatcher with phase management
  const dispatch = createDispatcher({
    getCurrentPhaseId: () => currentPhaseId,
    setCurrentPhaseId,
    controllers: phaseControllers,
    eventBus,
    moduleCtx
  });
  
  // Update dispatch reference in context
  moduleCtx.dispatch = dispatch;

  const contextValue: FrameworkRouterContext = {
    currentPhaseId,
    dispatch,
    eventBus,
    config
  };

  // Find current phase and screen
  const currentPhase = config.phases.find(p => p.id === currentPhaseId);
  const screenId = currentPhase?.screenId;
  const ScreenComponent = screenId ? screenRegistry[screenId] : null;

  // Fire initial onEnter exactly once (publish PHASE/ENTER if controller does not)
  useEffect(() => {
    const initialPhase = config.phases[0]?.id;
    if (!initialPhase) return;
    const ctrl = phaseControllers[initialPhase];
    let published = false;
    const originalPublish = eventBus.publish;
    // Wrap publish to detect if PHASE/ENTER already sent by onEnter
    eventBus.publish = (evt => {
      if (evt.type === 'PHASE/ENTER' && evt.phaseId === initialPhase) {
        published = true;
      }
      originalPublish(evt);
    }) as typeof eventBus.publish;
    try {
      ctrl?.onEnter?.(moduleCtx);
      if (!published) {
        originalPublish({ type: 'PHASE/ENTER', phaseId: initialPhase });
      }
    } finally {
      // restore publish
      eventBus.publish = originalPublish;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RouterContext.Provider value={contextValue}>
      <GameShell>
        <div data-framework-router className="flex flex-col min-h-0 flex-1">
          {ScreenComponent ? (
            <ScreenComponent />
          ) : (
            <div className="flex items-center justify-center min-h-[60vh] p-4">
              <div className="text-red-500 bg-white/90 rounded-lg p-4 shadow-lg">
                Screen not found: {screenId} for phase {currentPhaseId}
              </div>
            </div>
          )}
          {children}
        </div>
      </GameShell>
    </RouterContext.Provider>
  );
};