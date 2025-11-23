/**
 * GameHost
 * Temporary thin host that will (in later phases) select and mount a game module.
 * For now it wraps the legacy <App /> to allow incremental migration.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEventBus } from '@game-core/events/eventBus';
import GameMenu from './GameMenu';
import { discoverGameConfigs } from '@game-core/config/discovery/discover';
import { gameModuleRegistry } from '@game-core/modules';
import { FrameworkRouter } from './router/FrameworkRouter';
import { storageGet, storageSet, STORAGE_KEYS } from '@game-core/persistence/storage';
import { parseInitialParams } from '@game-core/utils/url';
import { GameConfig } from '@game-core/config/game.schema';
// These imports won't work in the extracted package, will need to be provided by the app
// import App from '../../App'; // Import legacy App for fallback
// Register modules (legacy side-effect import)
// import '../../games/nameblame';

interface LoadState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

const GameHost: React.FC = () => {
  const eventBus = useMemo(() => createEventBus(), []);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'idle' });
  const [configs, setConfigs] = useState<GameConfig[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [moduleReady, setModuleReady] = useState(false);
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null);

  // INIT lifecycle
  useEffect(() => { 
    eventBus.publish({ type: 'LIFECYCLE/INIT' }); 
    // Expose EventBus globally for DebugPanel access during migration
    if (typeof window !== 'undefined') {
      (window as unknown as { frameworkEventBus?: typeof eventBus }).frameworkEventBus = eventBus;
    }
  }, [eventBus]);

  // Check for legacy mode
  const params = parseInitialParams();
  const isLegacyMode = params.game === null && window.location.search.includes('legacy=true');
  
  // Discover configs on mount
  useEffect(() => {
    if (isLegacyMode) return; // Skip framework initialization in legacy mode
    
    const found = discoverGameConfigs();
    setConfigs(found);
    // Determine initial selection: URL param > storage > first config
    const stored = storageGet<string>(STORAGE_KEYS.selectedGame);
    const initial = params.game && found.some(c => c.id === params.game)
      ? params.game
      : (stored && found.some(c => c.id === stored) ? stored : (found[0]?.id || null));
    setSelectedGameId(initial);
  }, [isLegacyMode, params.game]);

  // Persist selection changes
  useEffect(() => {
    if (selectedGameId) storageSet(STORAGE_KEYS.selectedGame, selectedGameId);
  }, [selectedGameId]);

  // Load & init module when selection changes
  useEffect(() => {
    if (!selectedGameId) return;
    const cfg = configs.find(c => c.id === selectedGameId) || null;
    setActiveConfig(cfg);
    if (!cfg) return;
    const mod = gameModuleRegistry.get(selectedGameId);
    if (!mod) {
      setLoadState({ status: 'error', error: `Module ${selectedGameId} not registered` });
      eventBus.publish({ type: 'ERROR', error: `Module ${selectedGameId} not registered` });
      return;
    }
    setLoadState({ status: 'loading' });
    Promise.resolve(mod.init({
      config: cfg,
      dispatch: () => {}, // replaced later by router
      eventBus,
      playerId: null,
      roomId: null
    })).then(() => {
      setModuleReady(true);
      setLoadState({ status: 'ready' });
      eventBus.publish({ type: 'LIFECYCLE/READY' });
    }).catch(err => {
      setLoadState({ status: 'error', error: (err as Error).message });
      eventBus.publish({ type: 'ERROR', error: `Init failed: ${(err as Error).message}` });
    });
  }, [selectedGameId, configs, eventBus]);

  const handleSelect = useCallback((id: string) => {
    setSelectedGameId(id);
    setModuleReady(false);
  }, []);

  const renderBody = () => {
    if (!selectedGameId) {
      return <GameMenu onSelect={handleSelect} />;
    }
    if (loadState.status === 'error') {
      return (
        <div className="p-4 text-red-600 space-y-2">
          <p>Failed to load game: {loadState.error}</p>
          <button className="px-3 py-1 border rounded" onClick={() => setSelectedGameId(null)}>Back to menu</button>
        </div>
      );
    }
    if (!moduleReady || !activeConfig) {
      return <div className="p-4 text-sm text-gray-500">Loading module…</div>;
    }
    const mod = gameModuleRegistry.get(selectedGameId);
    if (!mod) return <div className="p-4 text-red-600">Module not found after init.</div>;
    const screenRegistry = mod.registerScreens();
    const controllers = mod.getPhaseControllers();
    return (
      <div className="relative">
        <FrameworkRouter
          config={activeConfig}
          screenRegistry={screenRegistry}
          phaseControllers={controllers}
          eventBus={eventBus}
        />
      </div>
    );
  };

  // Render legacy App if in legacy mode
  if (isLegacyMode) {
    return (
      <div data-framework-host className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute top-2 right-2 z-50">
          <button
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
            onClick={() => {
              window.location.href = window.location.origin + window.location.pathname;
            }}
          >Framework</button>
        </div>
        {/* App component should be passed as a prop or children when using GameHost */}
        <div>Legacy mode - App component not available in framework package</div>
      </div>
    );
  }

  return (
    <div 
      data-framework-host 
      className={selectedGameId 
        ? "min-h-screen" // Let GameShell handle background when game is running
        : "min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" // Apply background only for menu
      }
    >
      {/* Only show header when no game is selected (menu view) */}
      {!selectedGameId && (
        <header className="p-2 text-xs text-gray-500 flex items-center gap-4">
          <span>Framework Host (router integration)</span>
        </header>
      )}
      <div className={selectedGameId ? "min-h-screen" : "flex-1"}>
        {renderBody()}
      </div>
    </div>
  );
};

export default GameHost;
