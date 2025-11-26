# BlameGame Multilingual Support

This document provides comprehensive information about the multilingual support system in BlameGame, serving as a guide for both developers and translators.

## 1. Overview

BlameGame supports multiple languages through a comprehensive localization system that includes:
- UI text translations using `i18next` and the `useTranslation` hook.
- Language-specific question files.
- A central `categories.json` file containing category metadata with translations for all supported languages.
- Dynamic language switching affecting both UI and game content.
- Fallback mechanisms for missing translations or content.

## 2. Directory Structure

### Translation Files (UI Text)

UI translation strings are organized by language in the `lib/localization/` directory:

```
lib/localization/
  ├── en.ts     # English translations (Translation object)
  ├── de.ts     # German translations
  ├── es.ts     # Spanish translations
  ├── fr.ts     # French translations
  └── index.ts  # Exports all translations and the Translation type
```
Each language file (e.g., `en.ts`) exports a `Translation` object that adheres to the structure defined in `lib/localization/index.ts`.

### Category and Question Files (Game Content)

Game content (categories and questions) is stored in the `public/questions/` directory:

```
public/questions/
  ├── categories.json       # Central file with all category definitions: id, emoji, and translations (e.g., "en": "Party", "de": "Party").
  └── {lang}/               # Language-specific directories (e.g., 'en', 'de', 'es', 'fr')
      └── {category_id}.json # Question files named by category ID (e.g., 'party.json', 'work.json').
                            # These files contain an array of question objects specific to that language and category.
```
- Example: `public/questions/en/party.json` contains English questions for the "party" category.
- Example: `public/questions/de/work.json` contains German questions for the "work" category.

## 3. File Formats

### 3.1. UI Translation Files (e.g., `lib/localization/en.ts`)

These files export a TypeScript object matching the `Translation` interface.

```typescript
// Sample structure from lib/localization/en.ts
import type { Translation } from "./index"; // Import the main Translation type

const en: Translation = {
  app: {
    title: "BlameGame",
    loading: "Loading...",
    error: "An error occurred.",
    // ... more app-level keys
  },
  introScreen: {
    title: "Welcome to BlameGame!",
    playButton: "Start Game",
    // ... more intro screen keys
  },
  // ... other sections like gameScreen, settingsScreen, etc.
};

export default en;
```

### 3.2. `public/questions/categories.json`

This JSON file contains an array of category objects. Each object must have an `id`, an `emoji`, and a key for each supported language providing the translated category name.

```json
[
  {
    "id": "party",
    "emoji": "🎉",
    "en": "Party",
    "de": "Party",
    "es": "Fiesta",
    "fr": "Fête"
  },
  {
    "id": "work",
    "emoji": "💼",
    "en": "Work",
    "de": "Arbeit",
    "es": "Trabajo",
    "fr": "Travail"
  }
  // ... more categories
]
```

### 3.3. Language-Specific Question Files (e.g., `public/questions/en/party.json`)

These JSON files contain an array of question objects for a specific category and language.

```json
[
  {
    "questionId": "party_q1_en", // Unique ID for the question
    "text": "Who is most likely to dance on the table?", // Question text
    "category": "party" // Category ID, must match an 'id' in categories.json
  },
  {
    "questionId": "party_q2_en",
    "text": "Who would be the DJ at a party?",
    "category": "party"
  }
  // ... more questions for this category and language
]
```

## 4. Data Loading and Language Switching

- **UI Text**: The `useTranslation` hook, powered by `i18next`, handles loading and displaying UI text in the currently selected language. Language changes trigger `i18next` to provide the correct translations.
- **Game Content (Questions & Categories)**:
    - The `useQuestions` hook is responsible for loading game content.
    - It calls `loadQuestionsFromJson` (from `lib/utils/questionLoaders.ts`).
    - `loadQuestionsFromJson` first fetches `public/questions/categories.json`.
    - Based on `gameSettings.language` (from `useGameSettings`) and selected categories, it then fetches the appropriate `public/questions/{lang}/{category_id}.json` files.
    - `getAssetsPath` (from `lib/utils/assetUtils.ts`) is used to construct correct file paths, ensuring compatibility with deployments like GitHub Pages.
    - When the language changes via `gameSettings`, the `useEffect` in `useQuestions` (dependent on `currentLanguage`) re-triggers `loadQuestions`, fetching content for the new language.
    - The `loadQuestionsFromJson` function also enriches the question objects with the translated `categoryName` (from `categories.json`) and `categoryEmoji` for the current language.

## 5. Adding a New Language

To add a new language (e.g., Italian - `it`):

1.  **Define Language Code**: Add `'it'` to the `SupportedLanguage` type in `types.ts`.
2.  **Update Language Support**: Add `'it'` to the `SUPPORTED_LANGUAGES` array in `hooks/utils/languageSupport.ts`.
3.  **Create UI Translation File**:
    *   Create `lib/localization/it.ts`.
    *   Implement the `Translation` interface in `it.ts` with all necessary Italian translations.
    *   Export `it` from `lib/localization/index.ts`.
4.  **Translate Categories**:
    *   In `public/questions/categories.json`, add an `"it"` key with the Italian translation for each category name.
    ```json
    {
      "id": "party",
      "emoji": "🎉",
      "en": "Party",
      "de": "Party",
      "es": "Fiesta",
      "fr": "Fête",
      "it": "Festa" // New Italian translation
    }
    ```
5.  **Create Language-Specific Question Directory**:
    *   Create the directory `public/questions/it/`.
6.  **Translate and Add Question Files**:
    *   For each category `id` (e.g., `party`), create a corresponding JSON file in the new language directory (e.g., `public/questions/it/party.json`).
    *   Populate these files with Italian questions, ensuring the structure matches (array of objects with `questionId`, `text`, `category`).
7.  **Update Translation Glossary**: Add Italian translations to `docs/TRANSLATION_GLOSSARY.md`.
8.  **Test Thoroughly**: Test UI text, category names, and questions in the new language.

## 6. Translation Guidelines

### UI Translation (`lib/localization/*.ts`)
- Use the constants/keys defined in the `Translation` type. Do not invent new keys directly in components.
- Group related translations under namespace objects (e.g., `introScreen`, `settingsScreen`).
- Use variable interpolation for dynamic content as supported by `i18next` (e.g., `{{variableName}}`).
  Example: `"Question {{count}} of {{total}}"`
- Review translations with native speakers when possible.

### Game Content Translation (`public/questions/*`)
- **`categories.json`**: Ensure every category object has a translation for every supported language code as a key.
- **`{lang}/{category_id}.json`**:
    - `questionId` should ideally be unique across all languages for a conceptual question, or at least unique within its own file. Suffixing with language code (e.g., `_en`) can help if direct conceptual mapping is hard.
    - `text` is the translated question.
    - `category` must exactly match an `id` from `categories.json`.

### General
- Refer to `docs/TRANSLATION_GLOSSARY.md` for consistent terminology.
- Maintain the casual, fun tone appropriate for a party game.
- Adapt idioms to maintain their meaning rather than translating them literally.
- Try to keep translations approximately the same length as the original English text to avoid UI layout issues.

This strategy aims for a robust and maintainable multilingual system. The consolidation of question loading into `lib/utils/questionLoaders.ts` and the clear structure for raw data files are key to this.