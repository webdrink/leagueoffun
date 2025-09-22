/**
 * NameBlameModule (skeleton) - will progressively internalize legacy logic.
 */
import { GameModule } from '../../framework/core/modules';
import { nameBlamePhaseControllers } from './phases';
import FrameworkIntroScreen from '../../components/framework/FrameworkIntroScreen';
import FrameworkCategoryPickScreen from '../../components/framework/FrameworkCategoryPickScreen';
import FrameworkPreparingScreen from '../../components/framework/FrameworkPreparingScreen';
import FrameworkPlayerSetupScreen from '../../components/framework/FrameworkPlayerSetupScreen';
import FrameworkQuestionScreen from '../../components/framework/FrameworkQuestionScreen';
import FrameworkSummaryScreen from '../../components/framework/FrameworkSummaryScreen';
import { StaticListProvider } from '../../providers/StaticListProvider';
import { createQuestionProvider, type EnrichedQuestion } from '../../providers/factories/createQuestionProvider';

// Module-level provider instance with enriched question data
let provider: StaticListProvider<EnrichedQuestion> | null = null;

const NameBlameModule: GameModule = {
  id: 'nameblame',
  async init(ctx) {
    console.log('🎮 NameBlameModule.init() called with provider:', provider ? 'exists' : 'null');
    if (!provider) {
      try {
        // Get filtering config from game config
        const gameSettings = ctx.config.gameSettings || {};
        
        // Create filtered provider using factory
        provider = await createQuestionProvider({
          categoriesPerGame: gameSettings.categoriesPerGame || 5,
          questionsPerCategory: gameSettings.questionsPerCategory || 8,
          maxQuestionsTotal: gameSettings.maxQuestionsTotal || 40,
          selectedCategoryIds: [], // TODO: Get from user settings when manual selection is enabled
          manualCategorySelection: false, // TODO: Get from user settings
          shuffleQuestions: gameSettings.shuffleQuestions !== false,
          shuffleCategories: gameSettings.shuffleCategories !== false,
          language: 'de', // TODO: Get from user language settings
          allowRepeatQuestions: gameSettings.allowRepeatQuestions || false
        });
        
        console.log('🎮 Created filtered question provider with', provider.progress().total, 'questions');
        
        // Initialize window globals for test compatibility
        if (typeof window !== 'undefined') {
          const windowObj = window as unknown as Record<string, unknown>;
          const allQuestions: EnrichedQuestion[] = [];
          
          // Extract all questions from provider for test compatibility
          const originalIndex = provider.progress().index;
          // Reset to start
          while (provider.progress().index > 0) {
            provider.previous();
          }
          // Collect all questions
          let current = provider.current();
          while (current) {
            allQuestions.push(current);
            const next = provider.next();
            if (!next) break;
            current = next;
          }
          // Reset to original position
          while (provider.progress().index > originalIndex) {
            provider.previous();
          }
          
          windowObj.gameQuestions = allQuestions;
          windowObj.gameCategories = Array.from(new Set(allQuestions.map(q => q.categoryId)))
            .map(categoryId => {
              const question = allQuestions.find(q => q.categoryId === categoryId);
              return {
                id: categoryId,
                name: question?.categoryName || categoryId,
                emoji: question?.categoryEmoji || '❓',
                questions: allQuestions.filter(q => q.categoryId === categoryId).map(q => q.text)
              };
            });
          console.log('🎮 Set window.gameQuestions to', allQuestions.length, 'questions');
          console.log('🎮 Set window.gameCategories to', (windowObj.gameCategories as unknown[]).length, 'categories');
        }
      } catch (error) {
        console.error('🎮 Failed to create filtered question provider:', error);
        // Fallback will be created by the factory
        provider = await createQuestionProvider(); // Uses defaults and fallback
      }
    }
  },
  registerScreens() {
    return {
      intro: FrameworkIntroScreen,
      categoryPick: FrameworkCategoryPickScreen,
      preparing: FrameworkPreparingScreen,
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
