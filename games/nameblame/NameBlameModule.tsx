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
import { loadQuestionsFromJson, loadCategoriesFromJson } from '../../lib/utils/questionLoaders';

// Questions will be loaded asynchronously
let enrichedQuestions: Array<{
  text: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  questionId: string;
  id: string;
}> = [];

// Module-level provider instance with enriched question data
let provider: StaticListProvider<typeof enrichedQuestions[0]> | null = null;

const NameBlameModule: GameModule = {
  id: 'nameblame',
  async init() {
    console.log('🎮 NameBlameModule.init() called with provider:', provider ? 'exists' : 'null');
    if (!provider) {
      // Load questions from JSON files
      try {
        const categories = await loadCategoriesFromJson();
        const loadedQuestions = await loadQuestionsFromJson('de', categories);
        
        // Convert to the format expected by StaticListProvider
        enrichedQuestions = loadedQuestions.map((q, index) => ({
          text: q.text || '',
          categoryId: q.categoryId,
          categoryName: q.categoryName,
          categoryEmoji: q.categoryEmoji,
          questionId: q.questionId || `question-${index}`,
          id: q.questionId || `question-${index}`
        }));
        
        console.log('🎮 Loaded', enrichedQuestions.length, 'questions from JSON files');
        
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
      } catch (error) {
        console.error('🎮 Failed to load questions from JSON files:', error);
        // Fallback to minimal questions for testing
        enrichedQuestions = [
          {
            text: 'Wer würde sich bei einem Vorstellungsgespräch versprechen?',
            categoryId: 'at_work',
            categoryName: 'Bei der Arbeit',
            categoryEmoji: '💼',
            questionId: 'fallback-1',
            id: 'fallback-1'
          }
        ];
        provider = new StaticListProvider({
          items: enrichedQuestions,
          shuffle: true
        });
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
