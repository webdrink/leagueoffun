/**
 * NameBlame phase controllers with provider integration.
 */
import { PhaseController } from '../../framework/core/phases';
import { GameAction } from '../../framework/core/actions';
import { getProvider } from './NameBlameModule';
import { useGameStore } from '../../store/gameStore';

export const nameBlamePhaseControllers: Record<string, PhaseController> = {
  intro: {
    transition(action) {
      if (action === GameAction.ADVANCE) {
        // Read current game mode from store (default classic)
        const { gameSettings } = useGameStore.getState();
        const mode = (gameSettings?.gameMode || 'classic').toLowerCase();
        // If not nameblame => skip setup directly to play
        if (mode !== 'nameblame') {
          return { type: 'GOTO', phaseId: 'play' };
        }
        return { type: 'GOTO', phaseId: 'setup' };
      }
      return { type: 'STAY' };
    }
  },
  setup: {
    transition(action) {
      if (action === GameAction.BACK) return { type: 'GOTO', phaseId: 'intro' };
      if (action === GameAction.ADVANCE) return { type: 'GOTO', phaseId: 'play' };
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
            ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: index + 1 });
            
            if (index + 1 < total) {
              // Advance to next question
              provider.next();
              return { type: 'STAY' };
            } else {
              // End of questions, go to summary
              return { type: 'GOTO', phaseId: 'summary' };
            }
          }
          return { type: 'STAY' };
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
