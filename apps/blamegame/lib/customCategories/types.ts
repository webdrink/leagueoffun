/**
 * Types for custom categories feature
 * Allows users to create their own categories with emojis and questions
 */

import { SupportedLanguage } from '../../types';

export interface CustomQuestion {
  id: string;
  text: Record<SupportedLanguage, string>;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  emoji: string;
  name: Record<SupportedLanguage, string>;
  questions: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomCategoriesData {
  categories: CustomCategory[];
  version: number;
}
