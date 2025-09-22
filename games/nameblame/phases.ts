/**
 * NameBlame phase controllers with provider integration.
 */
import { PhaseController } from '../../framework/core/phases';
import { GameAction } from '../../framework/core/actions';
import { getProvider } from './NameBlameModule';
import { useGameStore } from '../../store/gameStore';

export const nameBlamePhaseControllers: Record<string, PhaseController> = {
  intro: {
    onEnter(ctx) {
      // Reset provider when entering intro phase (especially on restart)
      console.log('🎮 Entering intro phase - resetting provider state');
      const provider = getProvider();
      if (provider) {
        const currentIndex = provider.progress().index;
        if (currentIndex > 0) {
          console.log(`🔄 Resetting provider from index ${currentIndex} to 0`);
          while (provider.progress().index > 0) {
            provider.previous();
          }
          // Publish content change event to trigger React re-renders
          ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: 0 });
        }
      }
      ctx.eventBus.publish({ type: 'PHASE/ENTER', phaseId: 'intro' });
    },
    transition(action) {
      if (action === GameAction.ADVANCE) {
        // Read current game mode and settings from store
        const { gameSettings } = useGameStore.getState();
        const selectCategories = gameSettings?.selectCategories || false;
        
        // If manual category selection is enabled, go to category selection
        if (selectCategories) {
          return { type: 'GOTO', phaseId: 'categoryPick' };
        }
        
        // Otherwise go directly to preparing phase for loading animation
        return { type: 'GOTO', phaseId: 'preparing' };
      }
      if (action === GameAction.RESTART) return { type: 'STAY' }; // Already at intro
      return { type: 'STAY' };
    }
  },
  categoryPick: {
    transition(action) {
      if (action === GameAction.BACK) return { type: 'GOTO', phaseId: 'intro' };
      if (action === GameAction.ADVANCE) {
        // After category selection, go to preparing/loading phase
        return { type: 'GOTO', phaseId: 'preparing' };
      }
      if (action === GameAction.RESTART) return { type: 'GOTO', phaseId: 'intro' };
      return { type: 'STAY' };
    }
  },
  preparing: {
    transition(action) {
      if (action === GameAction.ADVANCE) {
        // After loading animation, check game mode
        const { gameSettings } = useGameStore.getState();
        const gameMode = (gameSettings?.gameMode || 'classic').toLowerCase();
        
        if (gameMode === 'nameblame') {
          // NameBlame mode always goes to player setup after loading
          return { type: 'GOTO', phaseId: 'setup' };
        } else {
          // Classic mode skips setup and goes directly to play
          return { type: 'GOTO', phaseId: 'play' };
        }
      }
      if (action === GameAction.RESTART) return { type: 'GOTO', phaseId: 'intro' };
      return { type: 'STAY' };
    }
  },
  setup: {
    transition(action) {
      if (action === GameAction.BACK) return { type: 'GOTO', phaseId: 'intro' };
      if (action === GameAction.ADVANCE) return { type: 'GOTO', phaseId: 'play' };
      if (action === GameAction.RESTART) return { type: 'GOTO', phaseId: 'intro' };
      return { type: 'STAY' };
    }
  },
  play: {
    onEnter(ctx) {
      ctx.eventBus.publish({ type: 'PHASE/ENTER', phaseId: 'play' });
    },
    transition(action, ctx) {
      const provider = getProvider();
      
      switch (action) {
        case GameAction.SELECT_TARGET:
          // Handle blame selection (update module store)
          return { type: 'STAY' };
        case GameAction.REVEAL:
          // Handle blame reveal phase
          return { type: 'STAY' };
        case GameAction.ADVANCE:
          // Use provider to determine if we advance to next question or summary
          if (provider) {
            const { index, total } = provider.progress();
            // eslint-disable-next-line no-console
            console.log('[phases:play] ADVANCE received. Current index:', index, 'total:', total);
            
            if (index + 1 < total) {
              // Advance to next question
              provider.next();
              // eslint-disable-next-line no-console
              console.log('[phases:play] provider.next() called. New index:', provider.progress().index);
              ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: index + 1 });
              return { type: 'STAY' };
            } else {
              // End of questions, go to summary
              // eslint-disable-next-line no-console
              console.log('[phases:play] End of questions reached. Going to summary.');
              ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: index + 1 });
              return { type: 'GOTO', phaseId: 'summary' };
            }
          }
          return { type: 'STAY' };
        case GameAction.BACK:
          // Go to previous question or back to intro if first question
          if (provider) {
            const { index } = provider.progress();
            // eslint-disable-next-line no-console
            console.log('[phases:play] BACK received. Current index:', index);
            if (index > 0) {
              provider.previous();
              // eslint-disable-next-line no-console
              console.log('[phases:play] provider.previous() called. New index:', provider.progress().index);
              ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: index - 1 });
              return { type: 'STAY' };
            } else {
              // If first question, go back to intro (or preparing)
              return { type: 'GOTO', phaseId: 'intro' };
            }
          }
          return { type: 'GOTO', phaseId: 'intro' };
        case GameAction.RESTART:
          return { type: 'GOTO', phaseId: 'intro' };
        default:
          return { type: 'STAY' };
      }
    }
  },
  summary: {
    transition(action) {
      if (action === GameAction.RESTART) return { type: 'GOTO', phaseId: 'intro' };
      return { type: 'STAY' };
    }
  }
};
