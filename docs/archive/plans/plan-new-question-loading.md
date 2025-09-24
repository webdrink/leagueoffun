# Plan: New Question Loading Strategy

**Date:** May 9, 2025

**Goal:** Document and implement the refined question loading strategy centered around `useQuestions.ts` and `lib/utils/questionLoaders.ts`.

**Expected Behavior:**
- All question and category data fetching is consolidated within `lib/utils/questionLoaders.ts`.
- `getAssetsPath` is used for all fetches to `public/questions/*` for correct URL construction.
- The `useQuestions` hook manages the state for all loaded questions (`allQuestions`), questions for the current round (`currentRoundQuestions`), loading status, and errors.
- Game rounds are prepared by selecting a configurable number of categories (e.g., 10 by default from `gameSettings.categoryCount`) and a configurable number of questions per category (e.g., 10 by default from `gameSettings.questionsPerCategory`).
- The total set of questions for a round (e.g., up to 100) is then shuffled.
- `App.tsx` utilizes the `useQuestions` hook for all question-related data and logic, simplifying its own state management.
- `questionStats` in `App.tsx` are derived from the questions provided by the `useQuestions` hook.

## Technical Steps

1.  **`lib/utils/questionLoaders.ts` (Already Refactored):**
    *   `loadCategoriesFromJson()`: Fetches `public/questions/categories.json`.
    *   `loadQuestionsForCategory(categoryId, language)`: Fetches `public/questions/{lang}/{categoryId}.json`.
    *   `loadQuestionsFromJson(language)`:
        *   Loads all categories from `categories.json`.
        *   For each category, attempts to load its language-specific question file.
        *   Combines successfully loaded questions, enriching them with category name (translated) and emoji from the central `categories.json`.
        *   Returns a flat array of `LoadedQuestion` objects.
    *   `getFallbackQuestions()`: Provides a default set of questions if loading fails.
    *   Ensures `getAssetsPath` (from `lib/utils/assetUtils.ts`) is used for constructing fetch URLs.

2.  **`hooks/useQuestions.ts` (Already Refactored):**
    *   **State:**
        *   `allQuestions: Question[]`: Stores all questions successfully loaded by `loadQuestionsFromJson` for the current language.
        *   `currentRoundQuestions: Question[]`: Stores questions selected and shuffled for the current game round.
        *   `currentQuestion: Question | undefined`: The currently active question.
        *   `isLoading: boolean`: True while `loadQuestionsFromJson` is running.
        *   `playedQuestions: string[]`: IDs of questions already played in the current session (persisted in localStorage).
        *   `selectedCategories: string[]`: IDs of categories chosen for the current round.
        *   `index: number`: Index of the `currentQuestion` within `currentRoundQuestions`.
    *   **`loadQuestions` (callback, internally called on mount and language change):**
        *   Calls `loadQuestionsFromJson` from `lib/utils/questionLoaders.ts`.
        *   Populates `allQuestions` with the result, mapping `LoadedQuestion` to the app's `Question` type.
        *   Handles errors and uses fallback questions if necessary.
    *   **`prepareRoundQuestions(gameSettings: GameSettings)` (callback):**
        *   Takes `categoryCount` and `questionsPerCategory` from `gameSettings`.
        *   Randomly selects `categoryCount` category IDs from unique categories present in `allQuestions`.
        *   For each selected category, filters questions from `allQuestions`, excluding already `playedQuestions`.
        *   Shuffles and takes up to `questionsPerCategory` from each category's available pool.
        *   Combines these into a single list, shuffles it, and sets `currentRoundQuestions`.
        *   Resets `index` to 0.
        *   Returns `true` if round preparation was successful (questions are available), `false` otherwise.
    *   **Navigation functions:** `advanceToNextQuestion`, `goToPreviousQuestion`.
    *   **Reset functions:** `resetQuestions`.
    *   `useEffect` to call `loadQuestions` when `currentLanguage` (from `gameSettings`) changes.

3.  **`App.tsx` Integration (Partially Done, to be finalized):**
    *   Instantiate `useQuestions(gameSettings)`.
    *   Remove local state related to question loading, categories, and question lists.
    *   Use `isLoading` from `useQuestions` for loading indicators.
    *   Use `currentQuestion`, `currentRoundQuestions`, `index` from `useQuestions` to drive the `QuestionScreen`.
    *   Call `prepareRoundQuestions` when starting a new game.
    *   Update `questionStats` based on `currentRoundQuestions`.
    *   Handle potential errors surfaced by `useQuestions` (e.g., if `prepareRoundQuestions` fails or initial load yields no questions).

4.  **Game Flow for New Round:**
    *   User initiates a new game.
    *   `App.tsx` calls `await prepareRoundQuestions(gameSettings)` from the `useQuestions` hook.
    *   If successful, `gameStep` transitions to `'game'`, and `QuestionScreen` displays `currentQuestion`.
    *   If not, an error is shown, or the user is guided appropriately.

5.  **Configuration:**
    *   Default `categoryCount` and `questionsPerCategory` are set to 10 in `constants.ts` (`initialGameSettings`). These values are used by `useQuestions` via the `gameSettings` prop.

## Impact on Existing Files

-   **`lib/utils/questionLoaders.ts`**: Centralized logic for data fetching. (Already done)
-   **`hooks/useQuestions.ts`**: Core hook for question management and round preparation. (Already done)
-   **`App.tsx`**: Simplified by delegating question logic to `useQuestions`. (Ongoing)
-   **`constants.ts`**: `initialGameSettings` provides default counts for categories/questions per round. (Already configured)
-   **`vite.config.ts`**: Ensure `questions/**` is in `includeAssets` for PWA. (Already done)

## Checklist

-   [x] `lib/utils/questionLoaders.ts` fetches all raw data.
-   [x] `lib/utils/questionLoaders.ts` uses `getAssetsPath`.
-   [x] `hooks/useQuestions.ts` manages all question-related states.
-   [x] `hooks/useQuestions.ts` implements `prepareRoundQuestions` with 10x10 logic (configurable via `gameSettings`).
-   [x] `App.tsx` uses `useQuestions` for data and game logic.
-   [x] `questionStats` in `App.tsx` is derived correctly.
-   [x] Player setup and loading screen are integrated with the new flow in `App.tsx`.
  - [x] `handleStartGameFlow` calls `prepareRoundQuestions` before `setGameStep('loading')`.
  - [x] `LoadingContainer` receives categories from `currentRoundQuestions` and `getEmoji` from `App.tsx`.
  - [x] `LoadingContainer` uses `currentQuote` from `App.tsx`, internal quote cycling removed.
  - [x] `LoadingContainer` props updated to reflect changes (removed `loadingQuotes`).
-   [x] Documentation (`QUESTIONS_CATEGORIES.md`, `DATA_STRUCTURE_OVERVIEW.md`, `MULTILINGUAL_STRATEGY.md`) updated.
-   [x] This plan file (`plan-new-question-loading.md`) created.

**Plan Status:** In Progress (Verifying loading animation and final game flow testing)
