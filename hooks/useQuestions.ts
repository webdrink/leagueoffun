import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Question, GameSettings, GameStep } from '../types';
import { FALLBACK_QUESTIONS } from '../constants';
import { getRandomCategories, getAvailableQuestions } from '../utils';
import { 
  loadQuestionsByCategories, 
  loadAllQuestionsFromJson, 
  loadAllCategories,
  loadQuestionsFromCsv,
  getFallbackQuestions 
} from './utils/questionLoaders';
import { useLanguage } from './utils/languageSupport';

interface UseQuestionsOutput {
  allQuestions: Question[];
  currentRoundQuestions: Question[];
  currentQuestion: Question | undefined;
  isLoading: boolean;
  csvError: string | null;
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
 * Hook to manage the questions state and operations
 */
/**
 * Custom React hook for managing question selection, loading, and state for a game round.
 *
 * This hook handles:
 * - Loading questions from various sources (category-based, JSON, CSV) with language support.
 * - Selecting random categories and questions for each game round based on game settings.
 * - Tracking played questions to avoid repeats, with local storage persistence.
 * - Managing loading and error states during question retrieval.
 * - Navigating between questions within a round.
 * - Resetting state for new games or rounds.
 *
 * @param gameSettings - The current game settings, including category and question counts.
 * @returns An object containing:
 *   - `allQuestions`: All loaded questions.
 *   - `currentRoundQuestions`: Questions selected for the current round.
 *   - `currentQuestion`: The currently active question.
 *   - `isLoading`: Whether questions are currently being loaded.
 *   - `csvError`: Error message if loading questions failed.
 *   - `playedQuestions`: Array of IDs of already played questions.
 *   - `selectedCategories`: Categories selected for the current round.
 *   - `index`: Index of the current question in the round.
 *   - `loadQuestions`: Function to reload all questions.
 *   - `prepareRoundQuestions`: Function to prepare questions for a new round.
 *   - `advanceToNextQuestion`: Function to move to the next question.
 *   - `goToPreviousQuestion`: Function to move to the previous question.
 *   - `setPlayedQuestions`: Setter for played questions.
 *   - `resetQuestions`: Function to reset all question-related state.
 *
 * @example
 * const {
 *   currentQuestion,
 *   advanceToNextQuestion,
 *   prepareRoundQuestions,
 *   isLoading,
 *   csvError
 * } = useQuestions(gameSettings);
 */
const useQuestions = (gameSettings: GameSettings): UseQuestionsOutput => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [playedQuestions, setPlayedQuestions] = useLocalStorage<string[]>('blamegame-played-questions', []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  
  // Get current language from language hook
  const { currentLanguage } = useLanguage();
  // Load questions from JSON or CSV
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setCsvError(null);
    
    try {
      // First try to load questions from the new category-based system with language support
      console.log(`Loading questions with language: ${currentLanguage}`);
      
      // Load all available categories
      const categories = await loadAllCategories(currentLanguage);
      
      if (categories && categories.length > 0) {
        // Load a sample of questions to populate allQuestions
        // We'll load more specific questions during gameplay based on selected categories
        const randomCategories = getRandomCategories(categories, 3);
        const questions = await loadQuestionsByCategories(randomCategories, currentLanguage);
        
        if (questions && questions.length > 0) {
          setAllQuestions(questions);
          setCsvError(null);
          console.log(`Loaded ${questions.length} sample questions from categories`);
          return;
        }
      }
      
      // If that fails, try the old JSON file
      const jsonQuestions = await loadAllQuestionsFromJson();
      setAllQuestions(jsonQuestions);
      setCsvError(null);
      console.log(`Loaded ${jsonQuestions.length} questions from JSON`);
    } catch (jsonError) {
      console.warn('Failed to load JSON questions, falling back to CSV:', jsonError);
      
      try {
        // Fallback to CSV
        const csvQuestions = await loadQuestionsFromCsv();
        setAllQuestions(csvQuestions);
        setCsvError(null);
        console.log(`Loaded ${csvQuestions.length} questions from CSV`);
      } catch (csvError) {
        console.error('Error loading questions from all sources:', csvError);
        setCsvError('Fehler beim Laden der Fragen. Weder JSON noch CSV konnten geladen werden.');
        setAllQuestions(getFallbackQuestions());
      }
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
      const allCategoryNames = await loadAllCategories(currentLanguage);
      
      // Select random categories based on game settings
      const categoriesForRound = getRandomCategories(allCategoryNames, gameSettings.categoryCount);
      setSelectedCategories(categoriesForRound);
      
      // Load questions for the selected categories with the current language
      const loadedQuestions = await loadQuestionsByCategories(categoriesForRound, currentLanguage);
      
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
        setCsvError("Konnte das Spiel nicht starten, da keine Fragen geladen wurden.");
        return false;
      }
    } catch (error) {
      console.error("Error preparing round questions:", error);
      setCsvError("Fehler beim Laden der Fragen für diese Runde.");
      
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
    setCsvError(null);
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
    csvError,
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
