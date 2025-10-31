/**
 * Integration utilities for custom categories
 * Merges custom categories with built-in categories for use in the game
 */

import { getCustomCategories } from './storage';
import { CustomCategory } from './types';
import { Category, Question } from '../utils/questionLoaders';
import { SupportedLanguage } from '../../types';

/**
 * Get localized text with fallback logic
 * Falls back to: current language -> 'en' -> 'de' -> first available
 */
const getLocalizedText = (
  textRecord: Record<SupportedLanguage, string>,
  language: SupportedLanguage,
  defaultText = ''
): string => {
  return textRecord[language] || 
         textRecord.en || 
         textRecord.de || 
         Object.values(textRecord).find(v => v) || 
         defaultText;
};

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
      en: getLocalizedText(cat.name, 'en', 'Custom Category'),
      de: getLocalizedText(cat.name, 'de', 'Benutzerdefiniert'),
      es: getLocalizedText(cat.name, 'es', 'Categoría Personalizada'),
      fr: getLocalizedText(cat.name, 'fr', 'Catégorie Personnalisée')
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
        text: getLocalizedText(question.text, language, ''),
        categoryId: category.id,
        categoryName: getLocalizedText(category.name, language, ''),
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
