/**
 * Resolves the questionLoader confusion by exporting the necessary functions
 * from the more complete implementation in utils.
 *
 * This file serves as a bridge between the lib/questionLoaders.ts and utils/questionLoaders.ts
 * to ensure backward compatibility while we transition to the new structure.
 */

// Re-export the functions from utils/questionLoaders with the expected names
import { loadQuestionsFromJson as loadJson} from './questionLoaders';

// Export with the names that useQuestions.ts expects
export const loadAllQuestionsFromJson = async (language: string = 'de') => {
  return await loadJson(language);
};

// Re-export other functions as needed
// export { loadCategories } from './questionLoaders'; // Removed as loadCategories is not in ./questionLoaders