/**
 * useQuestions - Custom hook for loading and managing game questions
 * 
 * This hook handles the loading of question data from JSON files, with error handling
 * and language-specific loading based on game settings.
 */
import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Question, GameSettings } from '../types';
import { FALLBACK_QUESTIONS } from '../constants';
import { getRandomCategories, getAvailableQuestions } from '../lib/utils/arrayUtils';
import { 
  loadQuestionsFromJson, 
  getFallbackQuestions
} from '../lib/utils/questionLoaders';
import { useLanguage } from './utils/languageSupport';
import { getAssetsPath } from '../lib/utils/assetUtils';

interface UseQuestionsOutput {
  allQuestions: Question[];
  currentRoundQuestions: Question[];
  currentQuestion: Question | undefined;
  isLoading: boolean;
  playedQuestions: string[];
  selectedCategories: string[];
  index: number;
  loadQuestions: () => Promise<void>;
  prepareRoundQuestions: (gameSettings: GameSettings) => Promise<boolean>;
  advanceToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setPlayedQuestions: (value: string[] | ((val: string[]) => string[])) => void;
  resetQuestions: () => void;
}

/**
 * Custom React hook for managing question selection, loading, and state for a game round.
 *
 * This hook handles:
 * - Loading questions from various sources (category-based, JSON) with language support.
 * - Selecting random categories and questions for each game round based on game settings.
 * - Tracking played questions to avoid repeats, with local storage persistence.
 * - Managing loading and error states during question retrieval.
 * - Navigating between questions within a round.
 * - Resetting state for new games or rounds.
 *
 * @param gameSettings - The current game settings, including category and question counts.
 * @returns An object containing question state and manipulation functions
 */
const useQuestions = (gameSettings: GameSettings): UseQuestionsOutput => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playedQuestions, setPlayedQuestions] = useLocalStorage<string[]>('blamegame-played-questions', []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  
  // Get current language from language hook
  const { currentLanguage } = useLanguage();

  /**
   * Loads categories from the categories.json file
   */
  const loadCategories = async () => {
    try {
      // Use getAssetsPath to ensure correct URL with base path
      const url = getAssetsPath('questions/categories.json');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  };

  /**
   * Loads questions for a specific category and language
   */
  const loadQuestionsForCategory = async (category: string, language: string) => {
    try {
      // Use getAssetsPath to ensure correct URL with base path
      const url = getAssetsPath(`questions/${language}/${category}.json`);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try fallback languages if primary language file is not found
        return await tryFallbackLanguages(category, language);
      }
      
      return await response.json();
    } catch (error) {
      // Try fallback languages if there was an error
      return await tryFallbackLanguages(category, language);
    }
  };

  /**
   * Attempts to load questions from fallback languages if the primary language file is not found
   */
  const tryFallbackLanguages = async (category: string, primaryLanguage: string) => {
    // Define fallback language order (e.g., try English, then German)
    const fallbackLanguages = ['en', 'de'].filter(lang => lang !== primaryLanguage);
    
    for (const lang of fallbackLanguages) {
      try {
        // Use getAssetsPath to ensure correct URL with base path
        const url = getAssetsPath(`questions/${lang}/${category}.json`);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Used fallback language ${lang} for category ${category}`);
          return data;
        }
      } catch (error) {
        console.warn(`Fallback to ${lang} failed for ${category}:`, error);
      }
    }
    
    // If all fallbacks fail, return empty array
    console.error(`No questions available for category ${category} in any language`);
    return [];
  };

  // Load questions from JSON
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);    
    try {
      // First try to load questions from the new category-based system with language support
      console.log(`Loading questions with language: ${currentLanguage}`);
      
      // Attempt to load questions from JSON first
      const jsonQuestions = await loadQuestionsFromJson(currentLanguage);
      
      if (jsonQuestions && jsonQuestions.length > 0) {        // Convert jsonQuestions to the format expected by setAllQuestions
        const formattedQuestions: Question[] = jsonQuestions.map((q: any) => ({
          questionId: q.questionId,
          text: q.text || '',
          categoryId: q.categoryId,
          categoryName: q.categoryName,
          categoryEmoji: q.categoryEmoji
        }));
        
        setAllQuestions(formattedQuestions);
        console.log(`Loaded ${jsonQuestions.length} questions from JSON`);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setAllQuestions(getFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Prepare questions for a new round
  const prepareRoundQuestions = useCallback(async (gameSettings: GameSettings): Promise<boolean> => {
    if (isLoading) {
      return false;
    }

    try {
      // Get all available categories for the current language
      const allCategoryNames = await loadCategories();
      
      // Select random categories based on game settings
      const categoriesForRound = getRandomCategories(allCategoryNames, gameSettings.categoryCount);
      setSelectedCategories(categoriesForRound);
      
      // Load questions for the selected categories with the current language
      const questionsPromises = categoriesForRound.map(category => loadQuestionsForCategory(category, currentLanguage));
      const loadedQuestions = (await Promise.all(questionsPromises)).flat();
      
      // Filter out already played questions
      let availableQuestions = getAvailableQuestions(loadedQuestions, playedQuestions);
      
      // Reset played questions if we're running low
      if (availableQuestions.length < 15) {
        setPlayedQuestions([]);
        availableQuestions = loadedQuestions;
      }
      
      if (availableQuestions.length > 0) {
        let filteredAndLimited: Question[] = [];
        categoriesForRound.forEach(cat => {
          const questionsForCat = availableQuestions
            .filter(q => q.categoryId === cat)
            .sort(() => 0.5 - Math.random())
            .slice(0, gameSettings.questionsPerCategory);
          filteredAndLimited = filteredAndLimited.concat(questionsForCat);
        });
        
        const shuffledRoundQuestions = filteredAndLimited.sort(() => 0.5 - Math.random());
        setCurrentRoundQuestions(shuffledRoundQuestions);
        setIndex(0);
        setCardKey(prev => prev + 1);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error preparing round questions:", error);      
      // Fallback to using whatever questions we have in allQuestions
      if (allQuestions.length > 0) {
        const availableQuestions = getAvailableQuestions(allQuestions, playedQuestions);
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
        setCurrentRoundQuestions(shuffled);
        setIndex(0);
        setCardKey(prev => prev + 1);
        return true;
      }
      
      return false;
    }
  }, [isLoading, allQuestions, playedQuestions, setPlayedQuestions, currentLanguage]);

  // Advance to the next question
  const advanceToNextQuestion = useCallback(() => {
    if (index < currentRoundQuestions.length - 1) {
      setIndex(prevIndex => prevIndex + 1);
      setCardKey(prev => prev + 1);
    }
  }, [index, currentRoundQuestions.length]);

  // Go to the previous question
  const goToPreviousQuestion = useCallback(() => {
    if (index > 0) {
      setIndex(prevIndex => prevIndex - 1);
      setCardKey(prev => prev - 1);
    }
  }, [index]);

  // Reset questions for a new game
  const resetQuestions = useCallback(() => {
    setIndex(0);
    setCurrentRoundQuestions([]);
    setSelectedCategories([]);
  }, []);

  // Load questions on initial mount and when language changes
  useEffect(() => {
    console.log("Loading questions for language:", currentLanguage);
    loadQuestions();
  }, [loadQuestions, currentLanguage]);

  return {
    allQuestions,
    currentRoundQuestions,
    currentQuestion: currentRoundQuestions[index],
    isLoading,
    playedQuestions,
    selectedCategories,
    index,
    loadQuestions,
    prepareRoundQuestions,
    advanceToNextQuestion,
    goToPreviousQuestion,
    setPlayedQuestions,
    resetQuestions
  };
};

export default useQuestions;
