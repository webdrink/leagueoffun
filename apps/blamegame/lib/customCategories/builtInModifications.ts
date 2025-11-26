/**
 * Storage for modifications to built-in categories
 * Allows users to add custom questions to existing game categories
 * or hide questions they don't like
 */

import { storageGet, storageSet } from '../../framework/persistence/storage';
import { SupportedLanguage } from '../../types';

const STORAGE_KEY = 'builtInCategoryModifications';
const CURRENT_VERSION = 1;

export interface CategoryQuestionModification {
  categoryId: string;
  addedQuestions: Array<{
    id: string;
    text: Record<SupportedLanguage, string>;
    createdAt: string;
  }>;
  hiddenQuestionIds: string[]; // IDs of built-in questions to hide
}

export interface CategoryModificationsData {
  modifications: CategoryQuestionModification[];
  version: number;
}

/**
 * Get all built-in category modifications
 */
export const getCategoryModifications = (): CategoryQuestionModification[] => {
  const data = storageGet<CategoryModificationsData>(STORAGE_KEY);
  if (!data || data.version !== CURRENT_VERSION) {
    return [];
  }
  return data.modifications || [];
};

/**
 * Save all category modifications
 */
const saveCategoryModifications = (modifications: CategoryQuestionModification[]): void => {
  const data: CategoryModificationsData = {
    modifications,
    version: CURRENT_VERSION
  };
  storageSet(STORAGE_KEY, data);
};

/**
 * Get modifications for a specific category
 */
export const getModificationsForCategory = (categoryId: string): CategoryQuestionModification | null => {
  const modifications = getCategoryModifications();
  return modifications.find(m => m.categoryId === categoryId) || null;
};

/**
 * Add a custom question to a built-in category
 */
export const addQuestionToBuiltInCategory = (
  categoryId: string,
  questionText: Record<SupportedLanguage, string>
): string => {
  const modifications = getCategoryModifications();
  let categoryMod = modifications.find(m => m.categoryId === categoryId);
  
  const questionId = `custom_q_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const newQuestion = {
    id: questionId,
    text: questionText,
    createdAt: new Date().toISOString()
  };
  
  if (categoryMod) {
    categoryMod.addedQuestions.push(newQuestion);
  } else {
    categoryMod = {
      categoryId,
      addedQuestions: [newQuestion],
      hiddenQuestionIds: []
    };
    modifications.push(categoryMod);
  }
  
  saveCategoryModifications(modifications);
  return questionId;
};

/**
 * Hide a question from a built-in category
 */
export const hideQuestionFromBuiltInCategory = (
  categoryId: string,
  questionId: string
): boolean => {
  const modifications = getCategoryModifications();
  let categoryMod = modifications.find(m => m.categoryId === categoryId);
  
  if (categoryMod) {
    if (!categoryMod.hiddenQuestionIds.includes(questionId)) {
      categoryMod.hiddenQuestionIds.push(questionId);
    }
  } else {
    categoryMod = {
      categoryId,
      addedQuestions: [],
      hiddenQuestionIds: [questionId]
    };
    modifications.push(categoryMod);
  }
  
  saveCategoryModifications(modifications);
  return true;
};

/**
 * Unhide a question from a built-in category
 */
export const unhideQuestionFromBuiltInCategory = (
  categoryId: string,
  questionId: string
): boolean => {
  const modifications = getCategoryModifications();
  const categoryMod = modifications.find(m => m.categoryId === categoryId);
  
  if (!categoryMod) return false;
  
  const index = categoryMod.hiddenQuestionIds.indexOf(questionId);
  if (index > -1) {
    categoryMod.hiddenQuestionIds.splice(index, 1);
    saveCategoryModifications(modifications);
    return true;
  }
  
  return false;
};

/**
 * Delete a custom question from a built-in category
 */
export const deleteCustomQuestionFromBuiltInCategory = (
  categoryId: string,
  questionId: string
): boolean => {
  const modifications = getCategoryModifications();
  const categoryMod = modifications.find(m => m.categoryId === categoryId);
  
  if (!categoryMod) return false;
  
  const initialLength = categoryMod.addedQuestions.length;
  categoryMod.addedQuestions = categoryMod.addedQuestions.filter(q => q.id !== questionId);
  
  if (categoryMod.addedQuestions.length < initialLength) {
    saveCategoryModifications(modifications);
    return true;
  }
  
  return false;
};

/**
 * Clear all modifications (for app reset)
 */
export const clearAllCategoryModifications = (): void => {
  saveCategoryModifications([]);
};
