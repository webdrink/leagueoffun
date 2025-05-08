/**
 * Utility functions for loading and managing questions
 */
import { Question } from '../../types';
import { FALLBACK_QUESTIONS } from '../../lib/constants';
import { SupportedLanguage, DEFAULT_LANGUAGE } from './languageSupport';

export interface CategoryInfo {
  name: string;
  count: number;
  fileName: string;
  emoji?: string;
  id?: string;
}

/**
 * Load all questions from JSON
 * @returns Promise resolving to an array of Question objects
 */
export const loadAllQuestionsFromJson = async (): Promise<Question[]> => {
  try {
    const res = await fetch('questions.json');
    
    if (!res.ok) {
      throw new Error('JSON questions not found');
    }
    
    const data = await res.json();
    
    if (data && data.length > 0) {
      console.log(`Loaded ${data.length} questions from JSON`);
      return data;
    } else {
      throw new Error('JSON file empty or invalid');
    }
  } catch (error) {
    console.warn('Failed to load JSON questions:', error);
    throw error;
  }
};

/**
 * Load category information
 * @param language The language code to load categories for
 * @returns Promise resolving to an array of CategoryInfo objects
 */
export const loadCategoryIndex = async (
  language: SupportedLanguage = DEFAULT_LANGUAGE
): Promise<CategoryInfo[]> => {
  try {
    // Try to load the language-specific index
    let indexFile = language === DEFAULT_LANGUAGE 
      ? 'categories/index.json' 
      : `categories/index.${language}.json`;
    
    let res = await fetch(indexFile);
    
    // Fallback to default language if requested language is not available
    if (!res.ok && language !== DEFAULT_LANGUAGE) {
      console.warn(`Categories for ${language} not found, using default language`);
      indexFile = 'categories/index.json';
      res = await fetch(indexFile);
    }
    
    if (!res.ok) {
      throw new Error(`Category index not found: ${indexFile}`);
    }
    
    const data = await res.json();
    
    if (data && data.length > 0) {
      console.log(`Loaded ${data.length} categories from ${indexFile}`);
      return data;
    } else {
      throw new Error(`Category index empty or invalid: ${indexFile}`);
    }
  } catch (error) {
    console.warn('Failed to load category index:', error);
    throw error;
  }
};

/**
 * Load questions for specific categories
 * @param categories Array of category names to load
 * @param language The language code to load questions for
 * @returns Promise resolving to an array of Question objects
 */
export const loadQuestionsByCategories = async (
  categories: string[],
  language: SupportedLanguage = DEFAULT_LANGUAGE
): Promise<Question[]> => {
  try {
    const categoryIndex = await loadCategoryIndex(language);
    
    // Find the file names for requested categories
    const filesToLoad = categories.map(categoryName => {
      const match = categoryIndex.find(c => c.name === categoryName);
      return match ? match.fileName : null;
    }).filter(Boolean) as string[];
    
    if (filesToLoad.length === 0) {
      throw new Error('No matching categories found');
    }
    
    // For now, use the current directory structure
    // In the future, this could use language-specific paths: `questions/${language}/${fileName}`
    const promises = filesToLoad.map(fileName => 
      fetch(`categories/${fileName}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${fileName}`);
          return res.json();
        })
    );
    
    const results = await Promise.all(promises);
    
    // Flatten the array of arrays
    const allQuestions = results.flat();
    console.log(`Loaded ${allQuestions.length} questions from ${filesToLoad.length} categories in ${language}`);
    
    return allQuestions;
  } catch (error) {
    console.warn(`Failed to load questions for ${language}:`, error);
    return FALLBACK_QUESTIONS;
  }
};

/**
 * Load all available categories
 * @param language The language code to load categories for
 * @returns Array of category names
 */
export const loadAllCategories = async (
  language: SupportedLanguage = DEFAULT_LANGUAGE
): Promise<string[]> => {
  try {
    const categoryIndex = await loadCategoryIndex(language);
    return categoryIndex.map(category => category.name);
  } catch (error) {
    console.warn('Failed to load categories:', error);
    // Return a fallback list of categories
    return ['Beim Feiern', 'In Beziehungen', 'Bei der Arbeit'];
  }
};

/**
 * Load questions from CSV as a fallback
 * @returns Promise resolving to an array of Question objects
 */
export const loadQuestionsFromCsv = async (): Promise<Question[]> => {
  try {
    const res = await fetch('blamegame_questions.csv');
    
    if (!res.ok) {
      throw new Error(`CSV HTTP error! status: ${res.status}`);
    }
    
    const text = await res.text();
    const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('//'));
    
    const questions = lines.map(line => {
      const [category, text] = line.split(',').map(part => part.trim());
      return { category, text };
    });
    
    console.log(`Loaded ${questions.length} questions from CSV`);
    return questions;
  } catch (error) {
    console.warn('Failed to load CSV questions:', error);
    throw error;
  }
};

/**
 * Get fallback questions if all other loading methods fail
 * @returns Array of fallback Question objects
 */
export const getFallbackQuestions = (): Question[] => {
  console.warn('Using fallback questions');
  return FALLBACK_QUESTIONS;
};
