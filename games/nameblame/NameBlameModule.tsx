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
import { FALLBACK_QUESTIONS, CATEGORY_EMOJIS } from '../../constants';


// Enrich questions with category emoji and name for proper display
const enrichedQuestions = FALLBACK_QUESTIONS.map((q, index) => ({
  text: q.text,
  categoryId: q.category,
  categoryName: q.category,
  categoryEmoji: CATEGORY_EMOJIS[q.category] || '❓',
  questionId: `fallback-${index}`,
  // Add index signature to satisfy StaticItem constraint
  id: `fallback-${index}`
}));

// Module-level provider instance with enriched question data
let provider: StaticListProvider<typeof enrichedQuestions[0]> | null = null;

const NameBlameModule: GameModule = {
  id: 'nameblame',
  async init() {
    console.log('🎮 NameBlameModule.init() called with provider:', provider ? 'exists' : 'null');
    if (!provider) {
      provider = new StaticListProvider({
        items: enrichedQuestions,
        shuffle: true
      });
      console.log('🎮 Created new StaticListProvider with', enrichedQuestions.length, 'questions');
      
      // Initialize window globals for test compatibility
      if (typeof window !== 'undefined') {
        const windowObj = window as unknown as Record<string, unknown>;
        windowObj.gameQuestions = enrichedQuestions;
        windowObj.gameCategories = Array.from(new Set(enrichedQuestions.map(q => q.categoryId)))
          .map(categoryId => {
            const question = enrichedQuestions.find(q => q.categoryId === categoryId);
            return {
              id: categoryId,
              name: question?.categoryName || categoryId,
              emoji: question?.categoryEmoji || '❓',
              questions: enrichedQuestions.filter(q => q.categoryId === categoryId).map(q => q.text)
            };
          });
        console.log('🎮 Set window.gameQuestions to', (windowObj.gameQuestions as unknown[]).length, 'questions');
        console.log('🎮 Set window.gameCategories to', (windowObj.gameCategories as unknown[]).length, 'categories');
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
