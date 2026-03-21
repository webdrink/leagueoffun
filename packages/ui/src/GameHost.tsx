/**
 * GameHost
 * Shared host that discovers, initializes, and routes registered game modules.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEventBus,
  discoverGameConfigs,
  gameModuleRegistry,
  storageGet,
  storageSet,
  STORAGE_KEYS,
  parseInitialParams,
  GameConfig
} from '@leagueoffun/game-core';
import GameMenu, { GameMenuProps } from './GameMenu';
import { FrameworkRouter, FrameworkShellComponent } from './router/FrameworkRouter';

interface LoadState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

export interface GameHostProps {
  menuComponent?: React.ComponentType<GameMenuProps>;
  shellComponent?: FrameworkShellComponent;
  legacyFallback?: React.ReactNode;
  className?: string;
}

const GameHost: React.FC<GameHostProps> = ({
  menuComponent: MenuComponent = GameMenu,
  shellComponent,
  legacyFallback,
  className = ''
}) => {
  const eventBus = useMemo(() => createEventBus(), []);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'idle' });
  const [configs, setConfigs] = useState<GameConfig[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [moduleReady, setModuleReady] = useState(false);
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null);

  const params = useMemo(() => parseInitialParams(), []);
  const isLegacyMode = typeof window !== 'undefined' && params.game === null && window.location.search.includes('legacy=true');

  useEffect(() => {
    eventBus.publish({ type: 'LIFECYCLE/INIT' });
    if (typeof window !== 'undefined') {
      (window as unknown as { frameworkEventBus?: typeof eventBus }).frameworkEventBus = eventBus;
    }
  }, [eventBus]);

  useEffect(() => {
    if (isLegacyMode) {
      return;
    }
    const found = discoverGameConfigs();
    setConfigs(found);

    const stored = storageGet<string>(STORAGE_KEYS.selectedGame);
    const initial = params.game && found.some((cfg) => cfg.id === params.game)
      ? params.game
      : (stored && found.some((cfg) => cfg.id === stored) ? stored : (found[0]?.id ?? null));
    setSelectedGameId(initial);
  }, [isLegacyMode, params.game]);

  useEffect(() => {
    if (selectedGameId) {
      storageSet(STORAGE_KEYS.selectedGame, selectedGameId);
    }
  }, [selectedGameId]);

  useEffect(() => {
    if (!selectedGameId) {
      return;
    }

    const cfg = configs.find((gameConfig) => gameConfig.id === selectedGameId) ?? null;
    setActiveConfig(cfg);

    if (!cfg) {
      return;
    }

    const module = gameModuleRegistry.get(selectedGameId);
    if (!module) {
      const error = `Module ${selectedGameId} not registered`;
      setLoadState({ status: 'error', error });
      eventBus.publish({ type: 'ERROR', error });
      return;
    }

    setLoadState({ status: 'loading' });
    Promise.resolve(module.init({
      config: cfg,
      dispatch: () => undefined,
      eventBus,
      playerId: null,
      roomId: null
    }))
      .then(() => {
        setModuleReady(true);
        setLoadState({ status: 'ready' });
        eventBus.publish({ type: 'LIFECYCLE/READY' });
      })
      .catch((error: Error) => {
        setLoadState({ status: 'error', error: error.message });
        eventBus.publish({ type: 'ERROR', error: `Init failed: ${error.message}` });
      });
  }, [selectedGameId, configs, eventBus]);

  const handleSelect = useCallback((id: string) => {
    setSelectedGameId(id);
    setModuleReady(false);
  }, []);

  const renderBody = () => {
    if (!selectedGameId) {
      return <MenuComponent onSelect={handleSelect} configs={configs} />;
    }

    if (loadState.status === 'error') {
      return (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-medium">Failed to load game: {loadState.error}</p>
          <button
            className="rounded border border-current px-3 py-1 text-sm"
            onClick={() => setSelectedGameId(null)}
            type="button"
          >
            Back to menu
          </button>
        </div>
      );
    }

    if (!moduleReady || !activeConfig) {
      return <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading module...</div>;
    }

    const module = gameModuleRegistry.get(selectedGameId);
    if (!module) {
      return <div className="p-4 text-sm text-red-600">Module missing after initialization.</div>;
    }

    return (
      <FrameworkRouter
        config={activeConfig}
        eventBus={eventBus}
        phaseControllers={module.getPhaseControllers()}
        screenRegistry={module.registerScreens()}
        shellComponent={shellComponent}
      />
    );
  };

  if (isLegacyMode) {
    return <>{legacyFallback ?? <div className="p-4">Legacy mode active. Provide a fallback app via `legacyFallback`.</div>}</>;
  }

  const shellBackground = selectedGameId
    ? 'min-h-screen'
    : 'min-h-screen bg-gradient-to-br from-amber-300 via-orange-400 to-red-400 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800';

  return (
    <div className={`${shellBackground} ${className}`} data-framework-host>
      {renderBody()}
    </div>
  );
};

export default GameHost;
