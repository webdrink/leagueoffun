# Plan for Localization Cleanup and Data Restructuring

## 1. Localization Cleanup

### Current State Analysis
We currently have two separate localization structures:
1. `/lib/localization/` - Contains language files (de.ts, en.ts, es.ts, fr.ts) with key-based translations
2. `/localization/` - Contains similar language files but with a different nested structure

### Cleanup Steps
1. Compare both structures to determine which one is actively used by the application
   - Check imports in components and hooks
   - Check the `useTranslation` hook to see which structure it references
2. Identify the preferred structure (likely the one in `/lib/localization/`)
3. Migrate any unique translations from the non-preferred structure
4. Remove the redundant localization directory
5. Update any imports throughout the codebase
6. Test the application to ensure all translations work correctly

## 2. Question and Category Restructuring

### Current State Analysis
- Question files are organized by language in `/public/questions/{language}/`
- Category metadata is stored in a single `categories.json` file with translations for all languages
- This structure improves maintainability and organization

### Previous Target Structure (Now Implemented)
- `/public/questions/categories.json`
  - Contains all category definitions with translations for all languages:
    ```json
    [
      {
        "id": "party",
        "de": "Beim Feiern",
        "en": "At Parties",
        "es": "En Fiestas",
        "fr": "Aux Fêtes",
        "emoji": "🎉"
      },
      {
        "id": "relationships",
        "de": "Beziehungen",
        "en": "Relationships",
        "es": "Relaciones",
        "fr": "Relations",
        "emoji": "❤️"
      }
    ]
    ```

- `/public/questions/{lang}/`
  - Contains category-specific question files (e.g., `party.json`, `relationships.json`)
  - Each question file contains questions for that category in the specific language:
    ```json
    [
      {
        "questionId": "who_would_dance",
        "text": "Wer würde am ehesten auf dem Tisch tanzen?",
        "category": "party"
      }
    ]
    ```

### Implementation Status
✅ Categories are now stored in a single `categories.json` file with translations for all languages
✅ Question files are organized by language and category in `/public/questions/{lang}/{category}.json`
✅ The application code has been updated to work with this structure
   - Extract questions from category files and organize them by category
   - Assign consistent questionIds to questions based on English text
   - Generate the new question files with the required format

2. Manual Steps:
   - Create the standardized `index.de.json` in `/public/categories/`
   - Move questions to their respective category files in `/public/questions/de/`
   - Ensure each question has a proper questionId (English-based identifier)
   - Update the application code to support the new data structure
   - Implement client-side question counting

3. Update Question Loading Logic:
   - Modify question loaders to support the new structure
   - Add client-side question counting functionality
   - Create fallback mechanisms for missing translations

4. Testing:
   - Test question loading with the new structure
   - Verify language switching works with the restructured data
   - Confirm question counts are accurate

5. Documentation:
   - Update documentation to reflect the new data structure
   - Create guidelines for adding new questions and categories
   - Document the localization process for future translators

## 3. Implementation Timeline

1. **Phase 1: Localization Cleanup** (1-2 days)
   - Analyze current usage
   - Consolidate structures
   - Remove redundancy

2. **Phase 2: Category Structure Preparation** (1-2 days)
   - Create category index files
   - Standardize category metadata

3. **Phase 3: Question Restructuring** (2-3 days)
   - Create question files by category
   - Assign consistent questionIds
   - Update loading logic

4. **Phase 4: Testing and Documentation** (1-2 days)
   - Test restructured data
   - Update documentation
   - Final review