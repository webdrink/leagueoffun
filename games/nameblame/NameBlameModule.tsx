/**
 * NameBlameModule (skeleton) - will progressively internalize legacy logic.
 */
import { GameModule } from '../../framework/core/modules';
import { nameBlamePhaseControllers } from './phases';
import FrameworkIntroScreen from '../../framework/ui/screens/FrameworkIntroScreen';
import FrameworkCategoryPickScreen from '../../framework/ui/screens/FrameworkCategoryPickScreen';
import FrameworkPreparingScreen from '../../framework/ui/screens/FrameworkPreparingScreen';
import FrameworkPlayerSetupScreen from '../../framework/ui/screens/FrameworkPlayerSetupScreen';
import FrameworkQuestionScreen from '../../framework/ui/screens/FrameworkQuestionScreen';
import FrameworkSummaryScreen from '../../framework/ui/screens/FrameworkSummaryScreen';
import { StaticListProvider } from '../../providers/StaticListProvider';
import { createQuestionProvider, type EnrichedQuestion } from '../../providers/factories/createQuestionProvider';
import { loadCategoriesFromJson, loadQuestionsFromJson } from '../../lib/utils/questionLoaders';
import { storageGet } from '../../framework/persistence/storage';
import type { GameSettings } from '../../framework/config/game.schema';

// Module-level provider instance with enriched question data
let provider: StaticListProvider<EnrichedQuestion> | null = null;
let unsubscribeSettings: (() => void) | null = null;

const NameBlameModule: GameModule = {
  id: 'nameblame',
  async init(ctx) {
    console.log('🎮 NameBlameModule.init() called with provider:', provider ? 'exists' : 'null');
    if (!provider) {
      try {
        // Merge persisted settings with config defaults (per game id)
        const persisted = storageGet<GameSettings>(`game.settings.${ctx.config.id}`) || {} as GameSettings;
        const gameSettings: Partial<GameSettings & { selectCategories?: boolean; selectedCategoryIds?: string[] }> = { ...(ctx.config.gameSettings || {}), ...persisted };
        // Detect language from global i18n if available
        const language = ((): string => {
          if (typeof window === 'undefined') return 'de';
          const w = window as unknown as { i18next?: { language?: string } };
          return w.i18next?.language || 'de';
        })();
        // Create filtered provider using factory
        provider = await createQuestionProvider({
          categoriesPerGame: gameSettings.categoriesPerGame ?? 5,
          questionsPerCategory: gameSettings.questionsPerCategory ?? 8,
          maxQuestionsTotal: gameSettings.maxQuestionsTotal ?? 40,
          selectedCategoryIds: gameSettings.selectedCategoryIds ?? [],
          manualCategorySelection: !!gameSettings.selectCategories,
          shuffleQuestions: gameSettings.shuffleQuestions !== false,
          shuffleCategories: gameSettings.shuffleCategories !== false,
          language,
          allowRepeatQuestions: !!gameSettings.allowRepeatQuestions
        });
        
        console.log('🎮 Created filtered question provider with', provider.progress().total, 'questions');

        // Initialize window globals for test compatibility (use full raw dataset, not filtered)
        if (typeof window !== 'undefined') {
          const windowObj = window as unknown as Record<string, unknown>;
          try {
            const categories = await loadCategoriesFromJson();
            const loaded = await loadQuestionsFromJson(language, categories);
            const enriched: EnrichedQuestion[] = loaded.map((q, index) => ({
              text: q.text || '',
              categoryId: q.categoryId,
              categoryName: q.categoryName,
              categoryEmoji: q.categoryEmoji,
              questionId: q.questionId || `question-${index}`,
              id: q.questionId || `question-${index}`
            }));
            windowObj.gameQuestions = enriched;
            windowObj.gameCategories = Array.from(new Set(enriched.map(q => q.categoryId)))
              .map(categoryId => {
                const question = enriched.find(q => q.categoryId === categoryId);
                return {
                  id: categoryId,
                  name: question?.categoryName || categoryId,
                  emoji: question?.categoryEmoji || '❓',
                  questions: enriched.filter(q => q.categoryId === categoryId).map(q => q.text)
                };
              });
            console.log('🎮 Set window.gameQuestions to', enriched.length, 'questions');
            console.log('🎮 Set window.gameCategories to', (windowObj.gameCategories as unknown[]).length, 'categories');
          } catch (e) {
            console.warn('🎮 Failed to load raw questions for debug window globals:', e);
          }
        }
      } catch (error) {
        console.error('🎮 Failed to create filtered question provider:', error);
        // Fallback will be created by the factory
        provider = await createQuestionProvider(); // Uses defaults and fallback
      }
    }

    // Subscribe to settings updates to rebuild provider on-the-fly
    if (!unsubscribeSettings) {
      unsubscribeSettings = ctx.eventBus.subscribe(async (evt) => {
        if (evt.type === 'SETTINGS/UPDATED' && evt.gameId === ctx.config.id) {
          try {
            const newSettings = evt.settings as GameSettings & { selectCategories?: boolean; selectedCategoryIds?: string[] };
            const language = ((): string => {
              if (typeof window === 'undefined') return 'de';
              const w = window as unknown as { i18next?: { language?: string } };
              return w.i18next?.language || 'de';
            })();
            provider = await createQuestionProvider({
              categoriesPerGame: newSettings.categoriesPerGame ?? ctx.config.gameSettings?.categoriesPerGame ?? 5,
              questionsPerCategory: newSettings.questionsPerCategory ?? ctx.config.gameSettings?.questionsPerCategory ?? 8,
              maxQuestionsTotal: newSettings.maxQuestionsTotal ?? ctx.config.gameSettings?.maxQuestionsTotal ?? 40,
              selectedCategoryIds: newSettings.selectedCategoryIds ?? [],
              manualCategorySelection: !!newSettings.selectCategories,
              shuffleQuestions: newSettings.shuffleQuestions !== false,
              shuffleCategories: newSettings.shuffleCategories !== false,
              language,
              allowRepeatQuestions: !!newSettings.allowRepeatQuestions
            });
            // Notify content advanced so UI refreshes indexes
            const total = provider.progress().total;
            ctx.eventBus.publish({ type: 'CONTENT/NEXT', index: Math.min(provider.progress().index, total - 1) });
          } catch (err) {
            console.error('🎮 Failed to rebuild provider after settings update:', err);
          }
        }
      });
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
