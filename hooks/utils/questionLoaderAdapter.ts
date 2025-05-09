/**
 * Type adapter to convert between Question types
 * 
 * This resolves the type mismatch between the Question type in lib/utils/questionLoaders.ts
 * and the Question type used in hooks/useQuestions.ts (expected via types.ts).
 */

import { 
  loadQuestionsFromJson as originalLoadJson, 
  loadQuestionsFromCsv as originalLoadCsv,
  Question as LoadedQuestion // Question type from lib/utils/questionLoaders.ts
} from '../../lib/utils/questionLoaders'; // Corrected path

import { Question as TargetQuestion } from '../../types'; // Expected Question type for useQuestions

// Re-export the functions with type adaptation for Question
export const loadQuestionsFromJson = async (language: string = 'de'): Promise<TargetQuestion[]> => {
  const questions: LoadedQuestion[] = await originalLoadJson(language);
  
  // Convert LoadedQuestion to TargetQuestion
  return questions.map((q: LoadedQuestion): TargetQuestion => ({
    questionId: q.questionId,
    text: q.text || "",
    categoryId: q.categoryId, // Corrected: TargetQuestion expects categoryId
    categoryName: q.categoryName,
    categoryEmoji: q.categoryEmoji
  }));
};

export const loadQuestionsFromCsv = async (): Promise<TargetQuestion[]> => {
  const questions: LoadedQuestion[] = await originalLoadCsv();
  
  // Convert LoadedQuestion to TargetQuestion
  return questions.map((q: LoadedQuestion): TargetQuestion => ({
    questionId: q.questionId,
    text: q.text || "",
    categoryId: q.categoryId, // Corrected: TargetQuestion expects categoryId
    categoryName: q.categoryName,
    categoryEmoji: q.categoryEmoji
  }));
};
