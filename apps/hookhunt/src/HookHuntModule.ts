/**
 * HookHunt Game Module
 * 
 * Implements the GameModule interface for HookHunt music quiz game.
 * Registers screens, phase controllers, and handles game initialization.
 * 
 * This module integrates HookHunt with the framework system, providing:
 * - Screen registration for all HookHunt components
 * - Phase controllers for game flow management
 * - Event handling and state management
 * - Integration with Spotify services
 */

// (no React import needed)
import type { GameModule, GameModuleContextMinimal, ScreenRegistry } from './framework/core/modules';
import type { PhaseControllerMap } from './framework/core/phases';

// Import HookHunt screens
import HookHuntIntroScreen from './components/game/HookHuntIntroScreen';
import SpotifyAuthScreen from './components/game/SpotifyAuthScreen';
import PlaylistSelectionScreen from './components/game/PlaylistSelectionScreen';
import PlayerSetupScreen from './components/game/PlayerSetupScreen';
import HookHuntGameScreen from './components/game/HookHuntGameScreen';
import HookHuntSummaryScreen from './components/game/HookHuntSummaryScreen';

// Screen registry mapping game.json screen IDs to components
const hookHuntScreenRegistry: ScreenRegistry = {
  'intro': HookHuntIntroScreen,
  'spotify-auth': SpotifyAuthScreen,
  'playlist-selection': PlaylistSelectionScreen,
  'player-setup': PlayerSetupScreen,
  'game': HookHuntGameScreen,
  'summary': HookHuntSummaryScreen
};

// Import GameModuleContext for proper typing
import type { GameModuleContext } from './framework/core/phases';
import { GameAction, type PhaseTransitionResult } from './framework/core/actions';

// Phase controllers for game flow management
const hookHuntPhaseControllers: PhaseControllerMap = {
  intro: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering intro phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting intro phase');
    },
  transition: (action: GameAction, _context: GameModuleContext): PhaseTransitionResult => {
      if (action === GameAction.ADVANCE) {
        return { type: 'GOTO', phaseId: 'auth' };
      }
      return { type: 'STAY' };
    }
  },
  auth: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering auth phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting auth phase');
    },
    transition: (action: GameAction): PhaseTransitionResult => {
      if (action === GameAction.ADVANCE) {
        return { type: 'GOTO', phaseId: 'playlist' };
      }
      if (action === GameAction.BACK) {
        return { type: 'GOTO', phaseId: 'intro' };
      }
      return { type: 'STAY' };
    }
  },
  playlist: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering playlist phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting playlist phase');
    },
    transition: (action: GameAction): PhaseTransitionResult => {
      if (action === GameAction.ADVANCE) {
        return { type: 'GOTO', phaseId: 'setup' };
      }
      if (action === GameAction.BACK) {
        return { type: 'GOTO', phaseId: 'auth' };
      }
      return { type: 'STAY' };
    }
  },
  setup: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering setup phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting setup phase');
    },
    transition: (action: GameAction): PhaseTransitionResult => {
      if (action === GameAction.ADVANCE) {
        return { type: 'GOTO', phaseId: 'playing' };
      }
      if (action === GameAction.BACK) {
        return { type: 'GOTO', phaseId: 'playlist' };
      }
      return { type: 'STAY' };
    }
  },
  playing: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering playing phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting playing phase');
    },
    transition: (action: GameAction): PhaseTransitionResult => {
      if (action === GameAction.ADVANCE) {
        return { type: 'GOTO', phaseId: 'summary' };
      }
      if (action === GameAction.BACK) {
        return { type: 'GOTO', phaseId: 'setup' };
      }
      return { type: 'STAY' };
    }
  },
  summary: {
    onEnter: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Entering summary phase');
    },
    onExit: (_context: GameModuleContext) => {
      console.log('🎵 HookHunt: Exiting summary phase');
    },
    transition: (action: GameAction): PhaseTransitionResult => {
      if (action === GameAction.RESTART) {
        return { type: 'GOTO', phaseId: 'intro' };
      }
      if (action === GameAction.BACK) {
        return { type: 'GOTO', phaseId: 'playing' };
      }
      return { type: 'STAY' };
    }
  }
};

/**
 * HookHunt Game Module Implementation
 */
class HookHuntModule implements GameModule {
  id = 'hookhunt';
  private context: GameModuleContextMinimal | null = null;

  async init(context: GameModuleContextMinimal): Promise<void> {
    console.log('🎵 HookHunt: Initializing module with context', context);
    this.context = context;
    
    // Initialize HookHunt-specific services
    // TODO: Initialize Spotify services, audio handlers, etc.
    
    // Subscribe to framework events
    context.eventBus.subscribe((event) => {
      if (event.type === 'LIFECYCLE/READY') {
        console.log('🎵 HookHunt: Framework ready, module initialized');
      }
      if (event.type === 'ERROR') {
        console.error('🎵 HookHunt: Framework error:', event);
      }
    });

    // Publish lifecycle ready event
    context.eventBus.publish({
      type: 'LIFECYCLE/READY'
    });

    console.log('🎵 HookHunt: Module initialization complete');
  }

  registerScreens(): ScreenRegistry {
    console.log('🎵 HookHunt: Registering screens', Object.keys(hookHuntScreenRegistry));
    return hookHuntScreenRegistry;
  }

  getPhaseControllers(): PhaseControllerMap {
    console.log('🎵 HookHunt: Providing phase controllers', Object.keys(hookHuntPhaseControllers));
    return hookHuntPhaseControllers;
  }

  getTranslations() {
    // TODO: Add HookHunt-specific translations
    return [{
      namespace: 'hookhunt',
      resources: {
        en: {
          title: 'HookHunt',
          subtitle: 'Guess the song from the hook!',
          startGame: 'Start Playing',
          connectSpotify: 'Connect Spotify',
          selectPlaylist: 'Choose Playlist',
          setupPlayers: 'Setup Players',
          playGame: 'Play Game',
          viewResults: 'View Results'
        }
      }
    }];
  }

  getThemeExtensions() {
    return {
      hookhunt: {
        primaryGradient: 'from-purple-500 via-pink-500 to-red-500',
        cardBackground: 'bg-gray-800',
        accentColor: 'purple'
      }
    };
  }

  getModuleStore() {
    // TODO: Integrate with HookHunt Zustand store
    return null;
  }
}

// Create and export the module instance
export const hookHuntModule = new HookHuntModule();

// Auto-register the module
import { gameModuleRegistry } from './framework/core/modules';
gameModuleRegistry.register(hookHuntModule);

console.log('🎵 HookHunt: Module registered successfully');

export default hookHuntModule;