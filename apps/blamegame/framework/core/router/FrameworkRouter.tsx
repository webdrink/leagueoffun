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
import { storageGet, storageSet } from '../../persistence/storage';
import GameShell from '../../ui/screens/GameShell';
import type { MultiplayerSessionManager } from '../../network/manager';
import type { RoomRole } from '../../network/protocol';
import { useMultiplayerStore } from '../../network/store';
import { getProvider } from '../../../games/nameblame/NameBlameModule';

interface FrameworkRouterContext {
  currentPhaseId: string;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  config: GameConfig;
  playerId?: string | null;
  role?: RoomRole | null;
  multiplayer?: MultiplayerSessionManager | null;
}

const RouterContext = createContext<FrameworkRouterContext | null>(null);
const RESUMABLE_PHASES = new Set(['intro', 'playerSetup', 'categoryPick']);

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
  playerId?: string | null;
  roomId?: string | null;
  role?: RoomRole | null;
  multiplayer?: MultiplayerSessionManager | null;
  children?: React.ReactNode;
}

export const FrameworkRouter: React.FC<FrameworkRouterProps> = ({
  config,
  screenRegistry,
  phaseControllers,
  eventBus,
  playerId = null,
  roomId = null,
  role = null,
  multiplayer = null,
  children
}) => {
  const phaseStorageKey = playerId
    ? `session.phase.${config.id}.${playerId}`
    : `session.phase.${config.id}`;
  const [currentPhaseId, setCurrentPhaseId] = useState(() => {
    const defaultPhase = config.phases[0]?.id || 'intro';
    const persisted =
      storageGet<string>(phaseStorageKey) ||
      storageGet<string>(`session.phase.${config.id}`) ||
      storageGet<string>('session.phase');
    if (!persisted) return defaultPhase;
    if (!RESUMABLE_PHASES.has(persisted)) return defaultPhase;
    const exists = config.phases.some((phase) => phase.id === persisted);
    return exists ? persisted : defaultPhase;
  });
  
  const readProviderIndex = () => {
    const provider = getProvider();
    return provider?.progress().index ?? 0;
  };

  const syncProviderIndex = (targetIndex: number) => {
    const provider = getProvider();
    if (!provider) {
      return;
    }

    const boundedTarget = Math.max(0, targetIndex);
    let currentIndex = provider.progress().index;
    while (currentIndex < boundedTarget) {
      provider.next();
      currentIndex += 1;
    }
    while (currentIndex > boundedTarget) {
      provider.previous();
      currentIndex -= 1;
    }

    eventBus.publish({ type: 'CONTENT/NEXT', index: boundedTarget });
  };

  // Create module context
  const moduleCtx = {
    config,
    dispatch: ((_action: GameAction, _payload?: unknown) => {}) as (action: GameAction, payload?: unknown) => void,
    eventBus,
    playerId,
    roomId,
    role,
    network: {
      enabled: !!multiplayer,
      role,
      manager: multiplayer
    }
  };

  // Create local dispatcher with phase management
  const localDispatch = createDispatcher({
    getCurrentPhaseId: () => currentPhaseId,
    setCurrentPhaseId,
    controllers: phaseControllers,
    eventBus,
    moduleCtx
  });

  const dispatch = (action: GameAction, payload?: unknown) => {
    const metadata = payload && typeof payload === 'object' ? (payload as { __fromNetwork?: boolean }) : {};
    const isFromNetwork = !!metadata.__fromNetwork;

    if (multiplayer && role === 'controller' && !isFromNetwork) {
      multiplayer.sendPlayerInput(action, payload).catch((error) => {
        eventBus.publish({
          type: 'ERROR',
          error: `Failed to send controller action: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      });
      return;
    }

    localDispatch(action, payload);

    if (multiplayer && role === 'host' && !isFromNetwork) {
      const currentProviderIndex = readProviderIndex();
      multiplayer.broadcastStatePatch({
        action,
        payload,
        phaseId: currentPhaseId,
        providerIndex: currentProviderIndex
      }).catch((error) => {
        eventBus.publish({
          type: 'ERROR',
          error: `Failed to broadcast state patch: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      });
    }
  };

  // Update dispatch reference in context
  moduleCtx.dispatch = dispatch;

  const contextValue: FrameworkRouterContext = {
    currentPhaseId,
    dispatch,
    eventBus,
    config,
    playerId,
    role,
    multiplayer
  };

  // Find current phase and screen
  const currentPhase = config.phases.find(p => p.id === currentPhaseId);
  const screenId = currentPhase?.screenId;
  const ScreenComponent = screenId ? screenRegistry[screenId] : null;

  useEffect(() => {
    storageSet(phaseStorageKey, RESUMABLE_PHASES.has(currentPhaseId) ? currentPhaseId : 'intro');
  }, [currentPhaseId, phaseStorageKey]);

  useEffect(() => {
    if (!multiplayer) {
      return;
    }

    multiplayer.setCallbacks({
      onPlayerInput: (inputPayload) => {
        localDispatch(inputPayload.action as GameAction, inputPayload.payload);

        const currentProviderIndex = readProviderIndex();
        multiplayer.broadcastStatePatch({
          action: inputPayload.action,
          payload: inputPayload.payload,
          phaseId: currentPhaseId,
          providerIndex: currentProviderIndex,
          originPlayerId: inputPayload.playerId
        }).catch((error) => {
          eventBus.publish({
            type: 'ERROR',
            error: `Failed to rebroadcast host patch: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        });
      },
      onStatePatch: (patch) => {
        localDispatch(patch.action as GameAction, patch.payload);

        if (patch.phaseId && patch.phaseId !== currentPhaseId) {
          setCurrentPhaseId(patch.phaseId);
        }

        syncProviderIndex(patch.providerIndex);
      },
      onStateSnapshot: (snapshot) => {
        if (snapshot.phaseId !== currentPhaseId) {
          setCurrentPhaseId(snapshot.phaseId);
        }
        syncProviderIndex(snapshot.providerIndex);
      },
      onPlayersUpdated: (players) => {
        eventBus.publish({ type: 'NETWORK/PLAYERS', players });
      },
      onError: (error) => {
        eventBus.publish({ type: 'ERROR', error });
      }
    });
  }, [currentPhaseId, eventBus, localDispatch, multiplayer]);

  useEffect(() => {
    if (!multiplayer || role !== 'host') {
      return;
    }

    const currentState = useMultiplayerStore.getState().authoritativeState;
    const players = useMultiplayerStore.getState().players;
    const providerIndex = readProviderIndex();

    multiplayer.broadcastStateSnapshot({
      phaseId: currentPhaseId,
      providerIndex,
      players,
      currentPlayerId: currentState?.currentPlayerId ?? null,
      selectedTargetId: currentState?.selectedTargetId ?? null,
      reveal: currentState?.reveal ?? false
    }).catch((error) => {
      eventBus.publish({
        type: 'ERROR',
        error: `Failed to broadcast host snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    });
  }, [currentPhaseId, eventBus, multiplayer, role]);

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
        <div data-framework-router className="flex flex-col min-h-0 flex-1 bg-transparent">
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
