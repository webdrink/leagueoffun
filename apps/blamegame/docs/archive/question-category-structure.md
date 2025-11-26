# Question and Category Data Structure

This document outlines the structure and organization of question and category data in BlameGame.

## Overview

BlameGame organizes its question and category data to support multilingual content and easy maintenance. The structure is designed to:

1.  Maintain a clear separation between category metadata (names, translations, emojis) and the questions themselves.
2.  Allow for dynamic loading of questions based on the selected language.
3.  Provide a fallback mechanism for languages where specific question sets may not yet be available.

## Directory Structure

The primary data for categories and questions is stored within the `public/questions/` directory.

```
public/
└── questions/
    ├── categories.json         # Central file for all category definitions and translations
    ├── de/                     # German language questions
    │   ├── party.json
    │   ├── relationships.json
    │   └── ... (other category question files for German)
    ├── en/                     # English language questions
    │   ├── party.json
    │   ├── relationships.json
    │   └── ... (other category question files for German)
    ├── en/                     # English language questions
    │   ├── apocalypse.json
    │   ├── at_school.json    │   └── ... (other category question files for English)
    ├── es/                     # Spanish language questions
    │   ├── party.json
    │   ├── relationships.json
    │   └── ... (other category question files for Spanish)
    ├── fr/                     # French language questions
    │   ├── party.json
    │   ├── relationships.json
    │   └── ... (other category question files for French)
    └── ... (other languages as they are added)
```

## File Formats

### 1. `categories.json`

This file is an array of category objects. Each object defines a unique category and provides its translations and associated emoji.

**Structure:**
```json
[
  {
    "id": "party", // Unique identifier for the category
    "de": "Beim Feiern",
    "en": "At Parties",
    "es": "De Fiesta",
    "fr": "En Fête",
    "emoji": "🎉"
  },
  // ... more category objects
]
```
-   `id`: A unique string that also corresponds to the question JSON filename (e.g., "party" means questions will be in `party.json` within each language folder).
-   `de`, `en`, `es`, `fr`: Translated names of the category for German, English, Spanish, and French respectively.
-   `emoji`: An emoji representing the category.

### 2. Language-Specific Question Files (e.g., `public/questions/en/party.json`)

Each file within a language directory (e.g., `en/party.json`) is an array of question objects for that specific category and language.

**Structure:**
```json
[
  {
    "questionId": "unique_question_identifier_1", // A unique ID for this question
    "text": "Who is most likely to dance on the table?", // The question text in the specified language
    "category": "party" // The category ID this question belongs to (matches the filename and an ID in categories.json)
  },
  // ... more question objects
]
```
-   `questionId`: A unique identifier for the question. This helps in tracking played questions or potentially for other features. It should be unique across all questions, if possible, or at least within its original language and category to simplify management.
-   `text`: The actual question text, translated into the language of the file's parent directory (e.g., English for a file in the `en/` folder).
-   `category`: The `id` of the category this question belongs to. This should match the filename (e.g., `party.json` questions all have `"category": "party"`) and an `id` in `categories.json`.

## Question Loading and Fallback Logic

The application will:
1.  Load `categories.json` to get the list of all available categories and their translations.
2.  When a game starts or the language changes, it will attempt to load question files for selected categories from the directory corresponding to the current language (e.g., `public/questions/fr/`).
3.  **Fallback:** If a question file for a specific category is not found in the target language (e.g., `fr/specific_category.json` is missing), the application will attempt to load the English version (`en/specific_category.json`). If that also fails, it will attempt to load the German version (`de/specific_category.json`). If all fallbacks fail, that category might be omitted for the current session, or the game might proceed with fewer questions.

This structure improves maintainability, simplifies adding new languages, and ensures a robust content delivery system.