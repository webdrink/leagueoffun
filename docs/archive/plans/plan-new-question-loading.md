# Plan: New Question and Category Loading Strategy

This document outlines the strategy for implementing the new system for loading categories and questions in the BlameGame application. This approach aims to improve flexibility, maintainability, and multilingual support.

## 1. Objectives

-   Dynamically load categories and their translations from a central `categories.json` file.
-   Randomly select a subset of available categories for each game session.
-   Load questions for the selected categories based on the user's current language setting.
-   Implement a robust fallback mechanism for missing language-specific question files.
-   Update game statistics (`questionStats`) to reflect the newly loaded questions.

## 2. Data Source Structure

Refer to `docs/question-category-structure.md` for the detailed file and directory structure. Key files involved:
-   `public/questions/categories.json`: Contains all category definitions and their translations.
-   `public/questions/{lang}/{category_id}.json`: Contains questions for a specific category in a specific language.

## 3. Implementation Steps

The core logic will reside primarily within the `useQuestions` hook, with potential modifications to `App.tsx` for state management and `lib/questionUtils.ts` for helper functions.

### Step 1: Load Categories (`useQuestions` hook)

1.  **Fetch `categories.json`**:
    *   On initial load or when the hook is invoked, fetch `public/questions/categories.json`.
    *   Store the parsed array of category objects in a state variable within the hook (e.g., `allCategories`).
    *   Handle potential fetch errors (e.g., file not found).

### Step 2: Select and Translate Categories for Game Session (`useQuestions` hook)

1.  **Randomly Select 10 Categories**:
    *   Once `allCategories` is populated, if there are more than 10 categories, randomly select 10 unique category `id`s. If 10 or fewer categories exist, select all of them.
    *   Store these selected category `id`s (e.g., `selectedCategoryIds`).
2.  **Fetch Translated Category Names**:
    *   Based on the `gameSettings.language` and the `selectedCategoryIds`, extract the translated names from the `allCategories` data.
    *   Store an array of objects, each containing the category `id`, its translated `name` for the current language, and its `emoji` (e.g., `currentCategories`). This will be used for display purposes.

### Step 3: Load Questions for Selected Categories (`useQuestions` hook)

This step will likely involve an asynchronous process, potentially using `Promise.all` to fetch multiple question files.

1.  **Iterate Through `selectedCategoryIds`**:
    *   For each selected category `id`:
        *   Construct the primary path to the question file: `public/questions/${gameSettings.language}/${category_id}.json`.
        *   Attempt to fetch this file.
2.  **Implement Fallback Logic**:
    *   **If primary fetch fails (e.g., 404 error)**:
        1.  Attempt to fetch the English version: `public/questions/en/${category_id}.json`.
        2.  If English version fails, attempt to fetch the German version: `public/questions/de/${category_id}.json`.
        3.  If all fallbacks fail, this category will have no questions for the current session. Log this event for debugging.
    *   **If fetch is successful (primary or fallback)**:
        *   Parse the JSON content (an array of question objects).
        *   Add these questions to a temporary collection.
3.  **Consolidate Loaded Questions**:
    *   After attempting to load questions for all selected categories, consolidate all successfully fetched questions into a single array (e.g., `loadedQuestions`).
    *   Store `loadedQuestions` in a state variable within the `useQuestions` hook. This will be the pool of questions for the game.

### Step 4: Update Question Statistics (`App.tsx` or `useQuestions` hook)

1.  **Calculate `questionStats`**:
    *   Once `loadedQuestions` is populated, calculate the necessary statistics:
        *   `totalQuestions`: Total number of questions in `loadedQuestions`.
        *   `playedQuestionsCount`: Number of questions already played in the current session (from `localStorage` or game state).
        *   `availableQuestions`: `totalQuestions - playedQuestionsCount`.
        *   Potentially, a breakdown by category if needed for the debug panel.
2.  **Update State**:
    *   Update the `questionStats` state in `App.tsx` or expose it from the `useQuestions` hook.

### Step 5: Handle Language Changes

1.  **Re-trigger Loading**:
    *   The `useQuestions` hook must re-execute the category selection, translation, and question loading process (Steps 2-4) whenever `gameSettings.language` changes.
    *   This can be achieved by including `gameSettings.language` in the dependency array of a `useEffect` hook that orchestrates the loading.

## 4. Error Handling

-   **`categories.json` not found**: Display a critical error to the user; the game cannot proceed.
-   **Question file not found (after fallbacks)**: Log the missing file. The game can proceed with fewer questions/categories. The UI should gracefully handle categories with no questions if necessary.
-   **Invalid JSON format**: Log the error and treat the file as missing.

## 5. State Management

-   **`useQuestions` Hook**:
    *   `allCategories: Category[]`
    *   `selectedCategoryObjects: { id: string; name: string; emoji: string }[]` (translated for current language)
    *   `loadedQuestions: Question[]`
    *   `isLoading: boolean`
    *   `error: string | null`
-   **`App.tsx`**:
    *   `gameSettings: GameSettings` (includes `language`)
    *   `questionStats: QuestionStats`

## 6. Helper Functions (`lib/questionUtils.ts`)

-   Consider creating helper functions for:
    *   Shuffling and selecting random categories.
    *   Constructing file paths.
    *   Fetching and parsing JSON with error handling.

## 7. Testing Considerations

-   Test with various language settings.
-   Test fallback logic by temporarily renaming/removing question files.
-   Test behavior when `categories.json` is missing or malformed.
-   Verify `questionStats` are updated correctly.
-   Ensure UI updates correctly upon language change.

This plan provides a roadmap for implementing the new question and category loading mechanism. Adjustments may be necessary as development progresses.
