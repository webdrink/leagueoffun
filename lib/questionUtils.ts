/**
 * Utilities for loading and managing questions in the new structure
 */

import { SupportedLanguage } from '../types';

/**
 * Type for a question in the new structure
 */
export interface Question {
  questionId: string;
  text: string;
  category: string;
}

/**
 * Type for a category in the new structure
 */
export interface Category {
  id: string;
  name: string;
  emoji: string;
}

/**
 * Load categories for a specific language
 * @param language The language to load categories for
 * @returns Promise<Category[]> A promise that resolves to an array of categories
 */
export const loadCategories = async (language: SupportedLanguage): Promise<Category[]> => {
  try {
    const response = await fetch(`categories/index.${language}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load categories for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading categories for ${language}:`, error);
    // If we can't load categories for the requested language, fall back to English
    if (language !== 'en') {
      console.warn(`Falling back to English categories`);
      return loadCategories('en');
    }
    throw error;
  }
};

/**
 * Load questions for a specific category and language
 * @param category The category ID to load questions for
 * @param language The language to load questions for
 * @returns Promise<Question[]> A promise that resolves to an array of questions
 */
export const loadQuestionsForCategory = async (
  category: string,
  language: SupportedLanguage
): Promise<Question[]> => {
  try {
    const response = await fetch(`questions/${language}/${category}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load questions for ${category} in ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading questions for ${category} in ${language}:`, error);
    // If we can't load questions for the requested language, fall back to English
    if (language !== 'en') {
      console.warn(`Falling back to English questions for ${category}`);
      return loadQuestionsForCategory(category, 'en');
    }
    throw error;
  }
};

/**
 * Count questions for each category in a specific language
 * @param categories Array of category IDs to count questions for
 * @param language The language to count questions for
 * @returns Promise<Record<string, number>> A promise that resolves to an object mapping category IDs to question counts
 */
export const countQuestionsPerCategory = async (
  categories: string[],
  language: SupportedLanguage
): Promise<Record<string, number>> => {
  const counts: Record<string, number> = {};
  
  // Load questions for each category and count them
  await Promise.all(
    categories.map(async (category) => {
      try {
        const questions = await loadQuestionsForCategory(category, language);
        counts[category] = questions.length;
      } catch (error) {
        console.error(`Error counting questions for ${category}:`, error);
        counts[category] = 0;
      }
    })
  );
  
  return counts;
};

/**
 * Load all questions for all categories in a specific language
 * @param language The language to load questions for
 * @returns Promise<Question[]> A promise that resolves to an array of all questions
 */
export const loadAllQuestions = async (language: SupportedLanguage): Promise<Question[]> => {
  // First load the categories to get the category IDs
  const categories = await loadCategories(language);
  const categoryIds = categories.map(category => category.id);
  
  // Load questions for each category
  const questionsPromises = categoryIds.map(categoryId => 
    loadQuestionsForCategory(categoryId, language)
  );
  
  // Wait for all promises to resolve
  const questionsArrays = await Promise.all(questionsPromises);
  
  // Flatten the array of arrays into a single array
  return questionsArrays.flat();
};

/**
 * Filter out questions that have already been played
 * @param questions Array of all questions
 * @param playedQuestionIds Array of IDs of questions that have already been played
 * @returns Question[] Array of questions that haven't been played
 */
export const filterUnplayedQuestions = (
  questions: Question[],
  playedQuestionIds: string[]
): Question[] => {
  return questions.filter(question => !playedQuestionIds.includes(question.questionId));
};

/**
 * Get a random question from a specific category that hasn't been played yet
 * @param category The category ID to get a question from
 * @param language The language to get a question for
 * @param playedQuestionIds Array of IDs of questions that have already been played
 * @returns Promise<Question | null> A promise that resolves to a random question or null if no questions are available
 */
export const getRandomQuestionFromCategory = async (
  category: string,
  language: SupportedLanguage,
  playedQuestionIds: string[]
): Promise<Question | null> => {
  try {
    // Load all questions for the category
    const questions = await loadQuestionsForCategory(category, language);
    
    // Filter out questions that have already been played
    const unplayedQuestions = filterUnplayedQuestions(questions, playedQuestionIds);
    
    // If no unplayed questions are available, return null
    if (unplayedQuestions.length === 0) {
      return null;
    }
    
    // Return a random unplayed question
    const randomIndex = Math.floor(Math.random() * unplayedQuestions.length);
    return unplayedQuestions[randomIndex];
  } catch (error) {
    console.error(`Error getting random question from ${category}:`, error);
    return null;
  }
};