/**
 * Question loader utilities for BlameGame application
 * 
 * This file provides functions for loading question data with proper path handling
 * for both development and production (GitHub Pages) environments.
 */

import { getAssetsPath } from './assetUtils';

// Define types for our data structures
export interface Category {
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
 * Loads categories from the central categories.json file
 * 
 * @returns Promise resolving to an array of Category objects
 */
export const loadCategoriesFromJson = async (): Promise<Category[]> => {
  try {
    // Use getAssetsPath to construct correct URL with the base path
    const categoriesUrl = getAssetsPath('questions/categories.json');
    const categoriesResponse = await fetch(categoriesUrl);
    
    if (!categoriesResponse.ok) {
      throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
    }
    
    const categories: Category[] = await categoriesResponse.json();
    return categories;
  } catch (error) {
    console.error('Error loading categories from JSON:', error);
    throw error;
  }
};

/**
 * Loads questions from JSON files with correct path handling
 * 
 * @param language The language code to load questions for
 * @param categories Array of Category objects to use for mapping category details
 * @returns Promise resolving to an array of Question objects
 */
export const loadQuestionsFromJson = async (language: string = 'de', categories: Category[] = []): Promise<Question[]> => {
  try {
    // If categories weren't provided, we need to fetch them
    if (!categories || categories.length === 0) {
      try {
        categories = await loadCategoriesFromJson();
        if (!categories || categories.length === 0) {
          throw new Error('No categories available');
        }
      } catch (error) {
        console.error('Error loading categories during question loading:', error);
        return [];
      }
    }
    
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
    },
    // Add more diverse fallback questions covering multiple categories
    {
      questionId: 'fallback_question_3',
      text: 'Who would be the first to fall asleep at a party?',
      categoryId: 'party',
      categoryName: 'Party',
      categoryEmoji: '🎉'
    },
    {
      questionId: 'fallback_question_4',
      text: 'Who would adopt too many pets if given the chance?',
      categoryId: 'pets',
      categoryName: 'Pets',
      categoryEmoji: '🐾'
    },
    {
      questionId: 'fallback_question_5',
      text: 'Who would accidentally send a text to the wrong person?',
      categoryId: 'tech',
      categoryName: 'Technology',
      categoryEmoji: '📱'
    },
    {
      questionId: 'fallback_question_6',
      text: 'Who would eat dessert before dinner?',
      categoryId: 'food',
      categoryName: 'Food',
      categoryEmoji: '🍽️'
    },
    {
      questionId: 'fallback_question_7',
      text: 'Who would get lost even with GPS?',
      categoryId: 'travel',
      categoryName: 'Travel',
      categoryEmoji: '✈️'
    },
    {
      questionId: 'fallback_question_8',
      text: 'Who would spend their whole paycheck at a sale?',
      categoryId: 'shopping',
      categoryName: 'Shopping',
      categoryEmoji: '🛍️'
    },
    {
      questionId: 'fallback_question_9',
      text: 'Who would start a dance party in a serious situation?',
      categoryId: 'entertainment',
      categoryName: 'Entertainment',
      categoryEmoji: '🎵'
    },
    {
      questionId: 'fallback_question_10',
      text: 'Who would accidentally like an old post while stalking someone online?',
      categoryId: 'social',
      categoryName: 'Social Media',
      categoryEmoji: '👀'
    }
  ];
};