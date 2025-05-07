import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Question, GameSettings, GameStep } from '../types';
import { FALLBACK_QUESTIONS } from '../constants';
import { getRandomCategories, getAvailableQuestions } from '../utils';

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
const useQuestions = (gameSettings: GameSettings): UseQuestionsOutput => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [playedQuestions, setPlayedQuestions] = useLocalStorage<string[]>('blamegame-played-questions', []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  // Load questions from JSON or CSV
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setCsvError(null);
    
    try {
      // First try to load questions from JSON
      const res = await fetch('questions.json');
      
      if (!res.ok) {
        throw new Error('JSON questions not found, falling back to CSV');
      }
      
      const data = await res.json();
      
      if (data && data.length > 0) {
        setAllQuestions(data);
        setCsvError(null);
        console.log(`Loaded ${data.length} questions from JSON`);
      } else {
        throw new Error('JSON file empty or invalid');
      }
    } catch (jsonError) {
      console.warn('Failed to load JSON questions, falling back to CSV:', jsonError);
      
      try {
        // Fallback to CSV
        const res = await fetch('blamegame_questions.csv');
        
        if (!res.ok) {
          throw new Error(`CSV HTTP error! status: ${res.status}`);
        }
        
        const text = await res.text();
        const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('//'));
        const header = lines.shift();
        
        if (!header || !header.toLowerCase().includes('kategorie') || !header.toLowerCase().includes('frage')) {
          console.warn("CSV header might be missing or incorrect. Assuming 'Kategorie;Frage;' structure.");
        }
        
        const parsed: Question[] = lines.map(line => {
          const parts = line.split(';');
          const category = parts[0]?.trim() || 'Unbekannt';
          const text = parts[1]?.trim() || 'Keine Frage gefunden';
          return { category, text };
        }).filter(q => q.category !== 'Unbekannt' && q.text !== 'Keine Frage gefunden');

        if (parsed.length > 0) {
          setAllQuestions(parsed);
          setCsvError(null);
          console.log(`Loaded ${parsed.length} questions from CSV`);
        } else {
          throw new Error('No valid questions found in CSV');
        }
      } catch (csvError) {
        console.error('Error loading questions from CSV:', csvError);
        setCsvError('Fehler beim Laden der Fragen. Weder JSON noch CSV konnten geladen werden.');
        setAllQuestions(FALLBACK_QUESTIONS);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Prepare questions for a new round
  const prepareRoundQuestions = useCallback(async (gameSettings: GameSettings): Promise<boolean> => {
    if (isLoading) {
      return false;
    }

    // Handle the case when no questions were loaded
    let questionsToUse = allQuestions;
    if (questionsToUse.length === 0) {
      console.warn("No questions loaded, using fallback questions");
      questionsToUse = FALLBACK_QUESTIONS;
      setCsvError("Konnte keine Fragen laden. Verwende eingeschränkte Notzufragen.");
    }

    let availableQuestions = getAvailableQuestions(questionsToUse, playedQuestions);

    if (availableQuestions.length < 15) {
      setPlayedQuestions([]);
      availableQuestions = questionsToUse;
    }

    const allCategoryNames = availableQuestions.map(q => q.category);
    const categoriesForRound = getRandomCategories(allCategoryNames, gameSettings.categoryCount);
    setSelectedCategories(categoriesForRound);

    if (availableQuestions.length > 0) {
      let filteredAndLimited: Question[] = [];
      categoriesForRound.forEach(cat => {
        const questionsForCat = availableQuestions
          .filter(q => q.category === cat)
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
  }, [isLoading, allQuestions, playedQuestions, setPlayedQuestions]);

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

  // Load questions on initial mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

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
