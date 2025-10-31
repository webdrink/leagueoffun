/**
 * Integration utilities for custom categories
 * Merges custom categories with built-in categories for use in the game
 */

import { getCustomCategories } from './storage';
import { CustomCategory } from './types';
import { Category, Question } from '../utils/questionLoaders';
import { SupportedLanguage } from '../../types';

/**
 * Convert custom categories to the format expected by the question loader
 */
export const convertCustomCategoriesToStandard = (
  customCategories: CustomCategory[]
): Category[] => {
  return customCategories.map(cat => {
    const standardCategory: Category = {
      id: cat.id,
      emoji: cat.emoji,
      en: cat.name.en || cat.name.de || 'Custom Category',
      de: cat.name.de || cat.name.en || 'Benutzerdefiniert',
      es: cat.name.es || cat.name.en || 'Categoría Personalizada',
      fr: cat.name.fr || cat.name.en || 'Catégorie Personnalisée'
    };
    return standardCategory;
  });
};

/**
 * Convert custom category questions to the format expected by the game
 */
export const convertCustomQuestionsToStandard = (
  customCategories: CustomCategory[],
  language: SupportedLanguage = 'en'
): Question[] => {
  const questions: Question[] = [];
  
  customCategories.forEach(category => {
    category.questions.forEach(question => {
      questions.push({
        questionId: question.id,
        text: question.text[language] || question.text.en || question.text.de || '',
        categoryId: category.id,
        categoryName: category.name[language] || category.name.en || category.name.de || '',
        categoryEmoji: category.emoji
      });
    });
  });
  
  return questions;
};

/**
 * Merge custom categories with built-in categories
 * Custom categories are added to the end of the list
 */
export const mergeWithCustomCategories = (
  builtInCategories: Category[]
): Category[] => {
  const customCategories = getCustomCategories();
  const standardCustomCategories = convertCustomCategoriesToStandard(customCategories);
  
  return [...builtInCategories, ...standardCustomCategories];
};

/**
 * Merge custom questions with built-in questions
 * Custom questions are added to the pool
 */
export const mergeWithCustomQuestions = (
  builtInQuestions: Question[],
  language: SupportedLanguage = 'en'
): Question[] => {
  const customCategories = getCustomCategories();
  const customQuestions = convertCustomQuestionsToStandard(customCategories, language);
  
  return [...builtInQuestions, ...customQuestions];
};

/**
 * Get count of questions per category including custom categories
 */
export const getQuestionCounts = (
  builtInQuestions: Question[],
  language: SupportedLanguage = 'en'
): Record<string, number> => {
  const allQuestions = mergeWithCustomQuestions(builtInQuestions, language);
  
  const counts: Record<string, number> = {};
  allQuestions.forEach(question => {
    counts[question.categoryId] = (counts[question.categoryId] || 0) + 1;
  });
  
  return counts;
};
