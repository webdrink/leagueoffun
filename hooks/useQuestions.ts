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
import { getRandomCategories, getAvailableQuestions, shuffleArray } from '../lib/utils/arrayUtils';
import { 
  loadQuestionsFromJson, 
  getFallbackQuestions,
  Question as LoadedQuestion
} from '../lib/utils/questionLoaders';
import { useGameSettings } from './useGameSettings';

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
const useQuestions = (initialGameSettings: GameSettings): UseQuestionsOutput => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playedQuestions, setPlayedQuestions] = useLocalStorage<string[]>('blamegame-played-questions', []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  
  const { gameSettings } = useGameSettings();
  const currentLanguage = gameSettings.language;

  // Load questions from JSON
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`Loading questions with language: ${currentLanguage}`);

      const loadedJsonQuestions: LoadedQuestion[] = await loadQuestionsFromJson(currentLanguage);

      if (loadedJsonQuestions && loadedJsonQuestions.length > 0) {
        // Convert LoadedQuestion to the Question type expected by the hook (from types.ts)
        const formattedQuestions: Question[] = loadedJsonQuestions.map((q: LoadedQuestion): Question => ({
          questionId: q.questionId,
          text: q.text || '', // Ensure text is always a string
          categoryId: q.categoryId,
          categoryName: q.categoryName,
          categoryEmoji: q.categoryEmoji
        }));
        setAllQuestions(formattedQuestions);
        console.log(`Loaded ${formattedQuestions.length} questions from JSON`);
      } else {
        console.warn('No questions loaded from JSON, using fallback questions.');
        setAllQuestions(getFallbackQuestions());
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setAllQuestions(getFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Prepare questions for a new round
  const prepareRoundQuestions = useCallback(async (currentActiveGameSettings: GameSettings): Promise<boolean> => {
    if (isLoading || allQuestions.length === 0) {
      console.log("Cannot prepare round: still loading or no questions available.");
      return false;
    }
    if (!currentActiveGameSettings) {
      console.warn("Game settings not provided to prepareRoundQuestions.");
      // Provide a minimal fallback if settings are missing
      const fallbackQuestions = getFallbackQuestions().slice(0, 10);
      setCurrentRoundQuestions(fallbackQuestions);
      setIndex(0);
      setCardKey(prev => prev + 1);
      return fallbackQuestions.length > 0;
    }

    const { categoryCount, questionsPerCategory } = currentActiveGameSettings;

    try {
      const allCategoryIds = Array.from(new Set(allQuestions.map(q => q.categoryId)));
      
      if (allCategoryIds.length === 0) {
        console.warn("No categories found in allQuestions. Cannot prepare round.");
        setCurrentRoundQuestions(getFallbackQuestions().slice(0, questionsPerCategory)); // Use questionsPerCategory from settings
        setIndex(0);
        setCardKey(prev => prev + 1);
        return currentRoundQuestions.length > 0;
      }

      const numCategoriesToSelect = Math.min(categoryCount, allCategoryIds.length);
      const roundCategoryIds = getRandomCategories(allCategoryIds, numCategoriesToSelect);
      setSelectedCategories(roundCategoryIds);

      let newRoundQuestions: Question[] = [];

      for (const catId of roundCategoryIds) {
        const questionsInCat = allQuestions.filter(q => q.categoryId === catId);
        const availableCatQuestions = getAvailableQuestions(questionsInCat, playedQuestions); // Filters out played ones
        
        const shuffledCatQuestions = shuffleArray([...availableCatQuestions]);
        const selectedCatQuestions = shuffledCatQuestions.slice(0, questionsPerCategory); // Use questionsPerCategory from settings
        
        newRoundQuestions.push(...selectedCatQuestions);
      }

      const finalShuffledRoundQuestions = shuffleArray(newRoundQuestions);
      
      if (finalShuffledRoundQuestions.length > 0) {
        setCurrentRoundQuestions(finalShuffledRoundQuestions);
        setIndex(0);
        setCardKey(prev => prev + 1);
        console.log(`Prepared round with ${finalShuffledRoundQuestions.length} questions from ${roundCategoryIds.length} categories.`);
        return true;
      } else {
        console.warn('No available questions for the selected categories after filtering. Using fallback questions for the round.');
        // Use categoryCount and questionsPerCategory from settings for fallback size
        const fallbackForRound = shuffleArray(getFallbackQuestions()).slice(0, questionsPerCategory * numCategoriesToSelect);
        setCurrentRoundQuestions(fallbackForRound);
        setIndex(0);
        setCardKey(prev => prev + 1);
        return fallbackForRound.length > 0;
      }
    } catch (error) {
      console.error("Error preparing round questions:", error);
      // Use questionsPerCategory from settings for general fallback size
      const fallbackForRound = shuffleArray(getFallbackQuestions()).slice(0, questionsPerCategory); 
      setCurrentRoundQuestions(fallbackForRound);
      setIndex(0);
      setCardKey(prev => prev + 1);
      return fallbackForRound.length > 0;
    }
  }, [isLoading, allQuestions, playedQuestions, currentLanguage]);

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
    console.log("useQuestions: Loading questions for language:", currentLanguage);
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
