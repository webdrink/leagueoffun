/**
 * NameBlameModule (skeleton) - will progressively internalize legacy logic.
 */
import { GameModule } from '../../framework/core/modules';
import { nameBlamePhaseControllers } from './phases';
import FrameworkIntroScreen from '../../components/framework/FrameworkIntroScreen';
import FrameworkPlayerSetupScreen from '../../components/framework/FrameworkPlayerSetupScreen';
import FrameworkQuestionScreen from '../../components/framework/FrameworkQuestionScreen';
import FrameworkSummaryScreen from '../../components/framework/FrameworkSummaryScreen';
import { StaticListProvider } from '../../providers/StaticListProvider';
import { FALLBACK_QUESTIONS } from '../../constants';

// Module-level provider instance with real question data
let provider: StaticListProvider<{ text: string; category: string }> | null = null;

const NameBlameModule: GameModule = {
  id: 'nameblame',
  async init() {
    if (!provider) {
      provider = new StaticListProvider({
        items: FALLBACK_QUESTIONS,
        shuffle: true
      });
    }
  },
  registerScreens() {
    return {
      intro: FrameworkIntroScreen,
      setup: FrameworkPlayerSetupScreen,
      play: FrameworkQuestionScreen,
      summary: FrameworkSummaryScreen
    };
  },
  getPhaseControllers() {
    return nameBlamePhaseControllers;
  }
};

// Export provider for use in phase controllers
export const getProvider = () => provider;

export default NameBlameModule;
