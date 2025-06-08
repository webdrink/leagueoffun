# BlameGame Data Structure Overview

This document provides a comprehensive overview of the data organization and structure in the BlameGame application.

## 1. Core Data Structures

### 1.1 Game Settings

Game settings manage user preferences and are persisted across sessions.

- **Location**: Managed by the `useGameSettings` hook (`hooks/useGameSettings.ts`)
- **Storage**: Persisted in `localStorage`
- **Key Properties**:
  - `language`: The currently selected language (e.g., 'en', 'de') - `SupportedLanguage` type from `types.ts`.
  - `theme`: UI theme preference (e.g., 'light', 'dark', 'system').
  - `soundEnabled`: Boolean indicating if sound effects are active.
  - `volume`: Sound volume level (0 to 1).
  - `categoryCount`: Number of categories to select for a game round.
  - `questionsPerCategory`: Number of questions to load per selected category.
  - `gameMode`: Current game mode (e.g., 'classic', 'nameBlame').

### 1.2 UI Translations

Translation data powers the multilingual interface.

- **Location**: `lib/localization/` directory
- **Files**:
  - Language-specific files (e.g., `en.ts`, `de.ts`) containing translation objects.
  - `index.ts` - Exports all translations and the `Translation` type.
- **Access**: Via the `useTranslation` hook (`hooks/useTranslation.ts`), which leverages `i18next`.

### 1.3 Question and Category Data

Game content organized by language and category. For detailed structure, see [Questions and Categories Data Structure](QUESTIONS_CATEGORIES.md).

- **Primary Loading Module**: `lib/utils/questionLoaders.ts` is the central place for fetching raw question and category data. It uses `getAssetsPath` from `lib/utils/assetUtils.ts` for correct URL construction.
- **Location of Raw Data**: `public/questions/` directory
  - `categories.json`: Central file with all category metadata (ID, emoji, and translations for all supported languages).
  - `public/questions/{lang}/{category_id}.json`: Language-specific question files, where `{lang}` is the language code (e.g., `en`) and `{category_id}` is the category ID from `categories.json` (e.g., `party.json`).
- **Access**:
    - The `useQuestions` hook (`hooks/useQuestions.ts`) is responsible for orchestrating the loading of questions for a game round.
    - It calls `loadQuestionsFromJson` from `lib/utils/questionLoaders.ts` to fetch and process categories and their associated questions based on the current language and selected categories.
    - The `loadQuestionsFromJson` function enriches question data with translated category names and emojis.
- **In-App Question Structure**: The final `Question` object used in the application (defined in `types.ts`) includes `questionId`, `text`, `categoryId`, `categoryName` (translated), and `categoryEmoji`.

## 2. Game State

Managed primarily by custom React hooks.

### 2.1 Player Data (for NameBlame mode)

- **Managed by**: `useNameBlameSetup` hook (`hooks/useNameBlameSetup.ts`)
- **Structure**: Array of `Player` objects (defined in `types.ts`):
  ```typescript
  export interface Player {
    id: string;
    name: string;
    blameCount: number;
  }
  ```
- **State Variables in Hook**:
  - `players`: Array of `Player` objects.
  - `currentPlayerIndex`: Index of the current player whose turn it is.

### 2.2 Question State

- **Managed by**: `useQuestions` hook (`hooks/useQuestions.ts`)
- **Key State Variables**:
  - `allQuestions`: An array of all `Question` objects loaded for the current language and selected categories, after processing by `loadQuestionsFromJson`.
  - `currentRoundQuestions`: A subset of `allQuestions`, shuffled and limited for the current game round.
  - `currentQuestion`: The `Question` object currently displayed to the user.
  - `playedQuestions`: An array of `questionId` strings for questions already used in the current session or across sessions (persisted in `localStorage`). This is used to avoid repetition.
  - `selectedCategories`: An array of category `id` strings selected for the current round.
  - `isLoading`: Boolean indicating if question data is currently being fetched.
- **Question Statistics (`questionStats` in `App.tsx`)**:
  - This object, managed in `App.tsx`, previously tracked total and played questions per category. With the refactored loading (10 categories, 10 questions each), its update logic will need to align with how `useQuestions` now prepares `currentRoundQuestions`. The goal is to reflect the questions available *in the current round*.

### 2.3 Game Flow State

- **Managed by**: `useGameState` hook (`hooks/useGameState.ts`)
- **Key State Variable**:
  - `gameStep`: Manages the current phase of the game.
    - Possible values: `'intro'`, `'playerSetup'`, `'playing'`, `'summary'`, `'settings'`.
- **Loading State**:
  - `isLoading` in `useQuestions` indicates if game content (questions) is being loaded.
  - `App.tsx` might have an overarching loading state for initial setup.

## 3. Component Data Flow

- [Component Structure](COMPONENT_STRUCTURE.md) outlines how components are organized.
- Data generally flows from hooks (managing state and business logic) to UI components.
  - Example: `useQuestions` provides `currentQuestion` to `QuestionScreen.tsx`, which then passes it to `QuestionCard.tsx`.
  - Settings from `useGameSettings` influence data loading in `useQuestions` (e.g., language, category count).

This overview should provide a clear understanding of how data is structured and managed within BlameGame, especially after the recent refactoring of question loading logic.