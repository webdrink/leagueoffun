/**
 * FrameworkRouter
 * Routes phase transitions to screen components via a game module registry.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createDispatcher,
  EventBus,
  GameAction,
  GameConfig,
  PhaseController,
  ScreenRegistry
} from '@leagueoffun/game-core';

interface FrameworkRouterContext {
  currentPhaseId: string;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  config: GameConfig;
}

const RouterContext = createContext<FrameworkRouterContext | null>(null);

export const useFrameworkRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useFrameworkRouter must be used within FrameworkRouter');
  }
  return ctx;
};

export type FrameworkShellComponent = React.ComponentType<React.PropsWithChildren>;

interface FrameworkRouterProps {
  config: GameConfig;
  screenRegistry: ScreenRegistry;
  phaseControllers: Record<string, PhaseController>;
  eventBus: EventBus;
  shellComponent?: FrameworkShellComponent;
  children?: React.ReactNode;
}

const PassthroughShell: FrameworkShellComponent = ({ children }) => <>{children}</>;

export const FrameworkRouter: React.FC<FrameworkRouterProps> = ({
  config,
  screenRegistry,
  phaseControllers,
  eventBus,
  shellComponent,
  children
}) => {
  const [currentPhaseId, setCurrentPhaseId] = useState(config.phases[0]?.id || 'intro');

  const moduleCtx = useMemo(() => ({
    config,
    dispatch: ((_action: GameAction, _payload?: unknown) => undefined) as (action: GameAction, payload?: unknown) => void,
    eventBus,
    playerId: null,
    roomId: null
  }), [config, eventBus]);

  const dispatch = createDispatcher({
    getCurrentPhaseId: () => currentPhaseId,
    setCurrentPhaseId,
    controllers: phaseControllers,
    eventBus,
    moduleCtx
  });

  moduleCtx.dispatch = dispatch;

  const currentPhase = config.phases.find((phase) => phase.id === currentPhaseId);
  const screenId = currentPhase?.screenId;
  const ScreenComponent = screenId ? screenRegistry[screenId] : null;
  const Shell = shellComponent ?? PassthroughShell;

  useEffect(() => {
    const initialPhase = config.phases[0]?.id;
    if (!initialPhase) {
      return;
    }

    const ctrl = phaseControllers[initialPhase];
    let published = false;
    const originalPublish = eventBus.publish;

    eventBus.publish = ((evt) => {
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
      eventBus.publish = originalPublish;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RouterContext.Provider value={{ currentPhaseId, dispatch, eventBus, config }}>
      <Shell>
        <div data-framework-router className="flex min-h-0 flex-1 flex-col bg-transparent">
          {ScreenComponent ? (
            <ScreenComponent />
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center p-4">
              <div className="rounded-lg bg-white/90 p-4 text-red-500 shadow-lg">
                Screen not found: {screenId} for phase {currentPhaseId}
              </div>
            </div>
          )}
          {children}
        </div>
      </Shell>
    </RouterContext.Provider>
  );
};
