/**
 * Question Provider Factory
 * Creates filtered and configured question providers based on game settings.
 */

import { StaticListProvider } from '../StaticListProvider';
import { loadQuestionsFromJson, loadCategoriesFromJson } from '../../lib/utils/questionLoaders';
import { getRandomCategories, shuffleArray } from '../../lib/utils/arrayUtils';

// Enhanced question interface with rich category data (extends StaticItem)
export interface EnrichedQuestion {
  text: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  questionId: string;
  id: string;
  [k: string]: unknown; // Index signature required by StaticItem
}

// Factory configuration options
export interface QuestionProviderConfig {
  categoriesPerGame?: number;
  questionsPerCategory?: number;
  maxQuestionsTotal?: number;
  selectedCategoryIds?: string[];
  manualCategorySelection?: boolean;
  shuffleQuestions?: boolean;
  shuffleCategories?: boolean;
  language?: string;
  allowRepeatQuestions?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Required<QuestionProviderConfig> = {
  categoriesPerGame: 5,
  questionsPerCategory: 8,
  maxQuestionsTotal: 40,
  selectedCategoryIds: [],
  manualCategorySelection: false,
  shuffleQuestions: true,
  shuffleCategories: true,
  language: 'de',
  allowRepeatQuestions: false
};

/**
 * Filters and processes questions based on configuration
 */
function filterQuestions(
  allQuestions: EnrichedQuestion[],
  config: Required<QuestionProviderConfig>
): EnrichedQuestion[] {
  // Step 1: Group questions by category
  const questionsByCategory = new Map<string, EnrichedQuestion[]>();
  
  for (const question of allQuestions) {
    const categoryQuestions = questionsByCategory.get(question.categoryId) || [];
    categoryQuestions.push(question);
    questionsByCategory.set(question.categoryId, categoryQuestions);
  }

  // Step 2: Select categories
  let selectedCategoryIds: string[];
  const availableCategoryIds = Array.from(questionsByCategory.keys());
  
  if (config.manualCategorySelection && config.selectedCategoryIds.length > 0) {
    // Use manually selected categories
    selectedCategoryIds = config.selectedCategoryIds.filter(id => 
      questionsByCategory.has(id)
    );
    console.log('Using manually selected categories:', selectedCategoryIds);
  } else {
    // Random category selection
    const numCategories = Math.min(config.categoriesPerGame, availableCategoryIds.length);
    selectedCategoryIds = config.shuffleCategories 
      ? getRandomCategories(availableCategoryIds, numCategories)
      : availableCategoryIds.slice(0, numCategories);
    console.log('Using random categories:', selectedCategoryIds);
  }

  // Step 3: Select questions from each category
  const selectedQuestions: EnrichedQuestion[] = [];
  
  for (const categoryId of selectedCategoryIds) {
    const categoryQuestions = questionsByCategory.get(categoryId) || [];
    
    if (categoryQuestions.length === 0) {
      console.warn(`No questions found for category: ${categoryId}`);
      continue;
    }

    // Shuffle questions within category if requested
    const questionsToChooseFrom = config.shuffleQuestions 
      ? shuffleArray([...categoryQuestions])
      : [...categoryQuestions];

    // Take up to questionsPerCategory from this category
    const selectedFromCategory = questionsToChooseFrom.slice(0, config.questionsPerCategory);
    selectedQuestions.push(...selectedFromCategory);
  }

  // Step 4: Apply global question limit
  let finalQuestions = selectedQuestions;
  if (selectedQuestions.length > config.maxQuestionsTotal) {
    finalQuestions = config.shuffleQuestions 
      ? shuffleArray(selectedQuestions).slice(0, config.maxQuestionsTotal)
      : selectedQuestions.slice(0, config.maxQuestionsTotal);
    
    console.log(`Trimmed questions from ${selectedQuestions.length} to ${finalQuestions.length} (maxQuestionsTotal: ${config.maxQuestionsTotal})`);
  }

  // Step 5: Final shuffle if requested
  if (config.shuffleQuestions) {
    finalQuestions = shuffleArray(finalQuestions);
  }

  console.log(`Question filtering complete: ${finalQuestions.length} questions from ${selectedCategoryIds.length} categories`);
  return finalQuestions;
}

/**
 * Creates a StaticListProvider with filtered questions based on configuration
 */
export async function createQuestionProvider(
  config: Partial<QuestionProviderConfig> = {}
): Promise<StaticListProvider<EnrichedQuestion>> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('Creating question provider with config:', fullConfig);

  try {
    // Load raw data
    const categories = await loadCategoriesFromJson();
    const loadedQuestions = await loadQuestionsFromJson(fullConfig.language, categories);
    
    // Convert to enriched format
    const enrichedQuestions: EnrichedQuestion[] = loadedQuestions.map((q, index) => ({
      text: q.text || '',
      categoryId: q.categoryId,
      categoryName: q.categoryName,
      categoryEmoji: q.categoryEmoji,
      questionId: q.questionId || `question-${index}`,
      id: q.questionId || `question-${index}`
    }));

    console.log(`Loaded ${enrichedQuestions.length} raw questions`);

    // Apply filtering
    const filteredQuestions = filterQuestions(enrichedQuestions, fullConfig);
    
    if (filteredQuestions.length === 0) {
      console.error('No questions remaining after filtering! Using fallback.');
      // Fallback to at least one question
      const fallbackQuestion: EnrichedQuestion = {
        text: 'Wer würde diese Situation am besten meistern?',
        categoryId: 'fallback',
        categoryName: 'Fallback',
        categoryEmoji: '❓',
        questionId: 'fallback-1',
        id: 'fallback-1'
      };
      return new StaticListProvider({
        items: [fallbackQuestion],
        shuffle: false
      });
    }

    // Create provider with filtered questions
    return new StaticListProvider({
      items: filteredQuestions,
      shuffle: false // Already shuffled during filtering if requested
    });

  } catch (error) {
    console.error('Failed to create question provider:', error);
    
    // Return minimal fallback provider
    const fallbackQuestion: EnrichedQuestion = {
      text: 'Wer würde bei einem technischen Problem am ehesten um Hilfe bitten?',
      categoryId: 'technology',
      categoryName: 'Technologie',
      categoryEmoji: '💻',
      questionId: 'fallback-tech-1',
      id: 'fallback-tech-1'
    };
    
    return new StaticListProvider({
      items: [fallbackQuestion],
      shuffle: false
    });
  }
}

/**
 * Extracts unique categories with emojis from questions (for loading animation)
 */
export function extractCategoriesFromQuestions(questions: EnrichedQuestion[]): Array<{name: string; emoji: string}> {
  const categoryMap = new Map<string, {name: string; emoji: string}>();
  
  for (const question of questions) {
    if (!categoryMap.has(question.categoryId)) {
      categoryMap.set(question.categoryId, {
        name: question.categoryName,
        emoji: question.categoryEmoji
      });
    }
  }
  
  return Array.from(categoryMap.values());
}