/**
 * Storage utilities for custom categories
 * Handles persistence of user-created categories in localStorage
 * Designed to be easily migrated to API-based storage in the future
 */

import { storageGet, storageSet } from '../../framework/persistence/storage';
import { CustomCategoriesData, CustomCategory, CustomQuestion } from './types';
import { SupportedLanguage } from '../../types';

const STORAGE_KEY = 'customCategories';
const CURRENT_VERSION = 1;

/**
 * Get all custom categories from storage
 */
export const getCustomCategories = (): CustomCategory[] => {
  const data = storageGet<CustomCategoriesData>(STORAGE_KEY);
  if (!data || data.version !== CURRENT_VERSION) {
    return [];
  }
  return data.categories || [];
};

/**
 * Save all custom categories to storage
 */
export const saveCustomCategories = (categories: CustomCategory[]): void => {
  const data: CustomCategoriesData = {
    categories,
    version: CURRENT_VERSION
  };
  storageSet(STORAGE_KEY, data);
};

/**
 * Add a new custom category
 */
export const addCustomCategory = (
  emoji: string,
  name: Record<SupportedLanguage, string>
): CustomCategory => {
  const categories = getCustomCategories();
  
  const newCategory: CustomCategory = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    emoji,
    name,
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  categories.push(newCategory);
  saveCustomCategories(categories);
  
  return newCategory;
};

/**
 * Update an existing custom category
 */
export const updateCustomCategory = (
  categoryId: string,
  updates: Partial<Pick<CustomCategory, 'emoji' | 'name'>>
): CustomCategory | null => {
  const categories = getCustomCategories();
  const categoryIndex = categories.findIndex(c => c.id === categoryId);
  
  if (categoryIndex === -1) return null;
  
  const updatedCategory = {
    ...categories[categoryIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  categories[categoryIndex] = updatedCategory;
  saveCustomCategories(categories);
  
  return updatedCategory;
};

/**
 * Delete a custom category
 */
export const deleteCustomCategory = (categoryId: string): boolean => {
  const categories = getCustomCategories();
  const filteredCategories = categories.filter(c => c.id !== categoryId);
  
  if (filteredCategories.length === categories.length) {
    return false; // Category not found
  }
  
  saveCustomCategories(filteredCategories);
  return true;
};

/**
 * Add a question to a custom category
 */
export const addQuestionToCategory = (
  categoryId: string,
  text: Record<SupportedLanguage, string>
): CustomQuestion | null => {
  const categories = getCustomCategories();
  const categoryIndex = categories.findIndex(c => c.id === categoryId);
  
  if (categoryIndex === -1) return null;
  
  const newQuestion: CustomQuestion = {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    createdAt: new Date().toISOString()
  };
  
  categories[categoryIndex].questions.push(newQuestion);
  categories[categoryIndex].updatedAt = new Date().toISOString();
  
  saveCustomCategories(categories);
  
  return newQuestion;
};

/**
 * Update a question in a custom category
 */
export const updateCategoryQuestion = (
  categoryId: string,
  questionId: string,
  text: Record<SupportedLanguage, string>
): CustomQuestion | null => {
  const categories = getCustomCategories();
  const categoryIndex = categories.findIndex(c => c.id === categoryId);
  
  if (categoryIndex === -1) return null;
  
  const questionIndex = categories[categoryIndex].questions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) return null;
  
  const updatedQuestion = {
    ...categories[categoryIndex].questions[questionIndex],
    text
  };
  
  categories[categoryIndex].questions[questionIndex] = updatedQuestion;
  categories[categoryIndex].updatedAt = new Date().toISOString();
  
  saveCustomCategories(categories);
  
  return updatedQuestion;
};

/**
 * Delete a question from a custom category
 */
export const deleteQuestionFromCategory = (
  categoryId: string,
  questionId: string
): boolean => {
  const categories = getCustomCategories();
  const categoryIndex = categories.findIndex(c => c.id === categoryId);
  
  if (categoryIndex === -1) return false;
  
  const questions = categories[categoryIndex].questions;
  const filteredQuestions = questions.filter(q => q.id !== questionId);
  
  if (filteredQuestions.length === questions.length) {
    return false; // Question not found
  }
  
  categories[categoryIndex].questions = filteredQuestions;
  categories[categoryIndex].updatedAt = new Date().toISOString();
  
  saveCustomCategories(categories);
  
  return true;
};

/**
 * Export custom categories to JSON (for future API integration or backup)
 */
export const exportCustomCategories = (): string => {
  const data = storageGet<CustomCategoriesData>(STORAGE_KEY);
  return JSON.stringify(data || { categories: [], version: CURRENT_VERSION }, null, 2);
};

/**
 * Import custom categories from JSON (for future API integration or restore)
 */
export const importCustomCategories = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as CustomCategoriesData;
    
    if (!data.categories || !Array.isArray(data.categories)) {
      return false;
    }
    
    // Validate structure
    const isValid = data.categories.every(cat => 
      cat.id && 
      cat.emoji && 
      cat.name && 
      Array.isArray(cat.questions)
    );
    
    if (!isValid) return false;
    
    storageSet(STORAGE_KEY, { ...data, version: CURRENT_VERSION });
    return true;
  } catch (error) {
    console.error('Failed to import custom categories:', error);
    return false;
  }
};
