/**
 * Question loader utilities for BlameGame application
 * 
 * This file provides functions for loading question data with proper path handling
 * for both development and production (GitHub Pages) environments.
 */

import { getAssetsPath } from './assetUtils';

// Define types for our data structures
interface Category {
  id: string;
  emoji: string;
  [key: string]: string; // For language keys like 'en', 'de', etc.
}

interface BaseQuestion {
  questionId: string;
  text?: string;
}

// Define the Question type expected by the application
export interface Question extends BaseQuestion {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
}

/**
 * Loads questions from JSON files with correct path handling
 * 
 * @param language The language code to load questions for
 * @returns Promise resolving to an array of Question objects
 */
export const loadQuestionsFromJson = async (language: string = 'de'): Promise<Question[]> => {
  try {
    // Use getAssetsPath to construct correct URL with the base path
    const categoriesUrl = getAssetsPath('questions/categories.json');
    const categoriesResponse = await fetch(categoriesUrl);
    
    if (!categoriesResponse.ok) {
      throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
    }
    
    const categories: Category[] = await categoriesResponse.json();
    const allQuestions: Question[] = [];
    
    // Load questions for each category
    for (const category of categories) {
      try {
        // Use getAssetsPath for correct path to category questions
        const questionsUrl = getAssetsPath(`questions/${language}/${category.id}.json`);
        const questionsResponse = await fetch(questionsUrl);
        
        if (questionsResponse.ok) {
          const loadedQuestions = await questionsResponse.json();
          // Convert to the expected Question format
          const enhancedQuestions = loadedQuestions.map((q: { questionId: string; text?: string; category: string }) => ({
            questionId: q.questionId,
            text: q.text || '',
            categoryId: q.category || category.id, // Use category from question or fallback to category id
            categoryName: category[language] || category.id,
            categoryEmoji: category.emoji
          }));
          allQuestions.push(...enhancedQuestions);
        } else {
          console.warn(`Failed to load questions for category ${category.id}: ${questionsResponse.status}`);
        }
      } catch (error) {
        console.error(`Error loading questions for category ${category.id}:`, error);
      }
    }
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading questions from JSON:', error);
    throw error;
  }
};

/**
 * Fallback function for loading questions from CSV files
 * 
 * @returns Promise resolving to an array of Question objects
 */
export const loadQuestionsFromCsv = async (): Promise<Question[]> => {
  try {
    // Use getAssetsPath for the correct URL with base path
    const url = getAssetsPath('questions/questions.csv');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    // Parse CSV logic would go here
    // ...

    // Return empty array for now
    return [];
  } catch (error) {
    console.error('Error loading questions from CSV:', error);
    throw error;
  }
};

/**
 * Function to get fallback questions when loading fails
 * 
 * @returns Array of fallback questions
 */
export const getFallbackQuestions = () => {
  return [
    {
      questionId: 'fallback_question_1',
      text: 'Who would most likely survive in the wilderness?',
      categoryId: 'survival',
      categoryName: 'Survival',
      categoryEmoji: '🏕️'
    },
    {
      questionId: 'fallback_question_2',
      text: 'Who would forget their own birthday?',
      categoryId: 'daily_life',
      categoryName: 'Daily Life',
      categoryEmoji: '🏠'
    }
  ];
};