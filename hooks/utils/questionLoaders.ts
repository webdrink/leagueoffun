/**
 * Question loader utilities with language support
 */
import { Question, SupportedLanguage } from '../../types';
import { DEFAULT_LANGUAGE } from './languageSupport';

/**
 * Loads all categories from the index file for a specific language
 */
export const loadAllCategories = async (language: SupportedLanguage = DEFAULT_LANGUAGE): Promise<string[]> => {
  try {
    // Try to load the language-specific index file
    const langFile = language !== DEFAULT_LANGUAGE 
      ? `index.${language}.json` 
      : 'index.json';
    
    const response = await fetch(`categories/${langFile}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load categories for ${language}`);
    }
    
    const categoryData = await response.json();
    
    // Extract names from the category data
    return categoryData.map((cat: any) => cat.name);
  } catch (error) {
    console.error(`Error loading categories for ${language}:`, error);
    
    // Fallback to default language if not already trying
    if (language !== DEFAULT_LANGUAGE) {
      console.log(`Falling back to ${DEFAULT_LANGUAGE} categories`);
      return loadAllCategories(DEFAULT_LANGUAGE);
    }
    
    // If all fails, return empty array
    return [];
  }
};

/**
 * Loads questions for specific categories with language support
 */
export const loadQuestionsByCategories = async (
  categories: string[],
  language: SupportedLanguage = DEFAULT_LANGUAGE
): Promise<Question[]> => {
  try {
    // Load the category index to get file names
    const langFile = language !== DEFAULT_LANGUAGE 
      ? `index.${language}.json` 
      : 'index.json';
    
    const response = await fetch(`categories/${langFile}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load category index for ${language}`);
    }
    
    const categoryData = await response.json();
    
    // Get categories that match our requested list
    const targetCategories = categoryData.filter((cat: any) => 
      categories.includes(cat.name)
    );
    
    // Load questions for each category
    const allQuestionsPromises = targetCategories.map(async (cat: any) => {
      if (!cat.fileName) {
        console.warn(`No fileName for category ${cat.name}`);
        return [];
      }
      
      try {
        const questionResponse = await fetch(`questions/${language}/${cat.fileName}`);
        
        if (!questionResponse.ok) {
          throw new Error(`Failed to load questions for ${cat.name}`);
        }
        
        const questions = await questionResponse.json();
        
        return questions.map((q: any) => ({
          ...q,
          category: cat.name,
          questionId: q.questionId || `${cat.name}_${Math.random().toString(36).substr(2, 9)}`
        }));
      } catch (error) {
        console.error(`Error loading questions for ${cat.name}:`, error);
        
        // Try fallback language
        if (language !== DEFAULT_LANGUAGE) {
          console.log(`Falling back to ${DEFAULT_LANGUAGE} questions for ${cat.name}`);
          
          try {
            const fallbackResponse = await fetch(`questions/${DEFAULT_LANGUAGE}/${cat.fileName}`);
            
            if (fallbackResponse.ok) {
              const fallbackQuestions = await fallbackResponse.json();
              
              return fallbackQuestions.map((q: any) => ({
                ...q,
                category: cat.name,
                questionId: q.questionId || `${cat.name}_${Math.random().toString(36).substr(2, 9)}`
              }));
            }
          } catch (fallbackError) {
            // Ignore fallback errors
          }
        }
        
        // Return empty array if everything fails
        return [];
      }
    });
    
    // Wait for all promises to resolve
    const allQuestionsArrays = await Promise.all(allQuestionsPromises);
    
    // Flatten the array of arrays
    return allQuestionsArrays.flat();
  } catch (error) {
    console.error(`Error loading questions by categories:`, error);
    
    // Fallback to default language if not already trying
    if (language !== DEFAULT_LANGUAGE) {
      console.log(`Falling back to ${DEFAULT_LANGUAGE} for categories`);
      return loadQuestionsByCategories(categories, DEFAULT_LANGUAGE);
    }
    
    // If all fails, return empty array
    return [];
  }
};

/**
 * Loads all questions from the old JSON format (fallback)
 */
export const loadAllQuestionsFromJson = async (): Promise<Question[]> => {
  try {
    const response = await fetch('questions.json');
    
    if (!response.ok) {
      throw new Error('Failed to load questions.json');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error loading questions from JSON:', error);
    throw error; // Let the caller handle the fallback
  }
};

/**
 * Legacy function to load questions from CSV
 */
export const loadQuestionsFromCsv = async (): Promise<Question[]> => {
  throw new Error('CSV loading not implemented');
};

/**
 * Provides fallback questions in case all loading methods fail
 */
export const getFallbackQuestions = (): Question[] => {
  return [
    { text: "Wer ist am hilfsbereitesten?", category: "Allgemein" },
    { text: "Wer ist am kreativsten?", category: "Allgemein" },
    { text: "Wer ist am abenteuerlustigsten?", category: "Allgemein" },
    { text: "Wer ist am geduldigsten?", category: "Allgemein" },
    { text: "Wer ist am optimistischsten?", category: "Allgemein" }
  ];
};
