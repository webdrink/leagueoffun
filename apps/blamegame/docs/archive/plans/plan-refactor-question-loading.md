# Refactor Question Loading Logic to Eliminate Redundancy

## Feature Name/Bugfix Title
Consolidate Question and Category Loading Logic

## Goal & Expected Behavior
The primary goal is to streamline the way questions and categories are loaded by:
1.  [x] Establishing `lib/utils/questionLoaders.ts` as the definitive module for all raw data fetching of questions and categories, ensuring `getAssetsPath` is used for all `fetch` calls to guarantee correct URL construction for GitHub Pages deployment.
2.  [x] Removing redundant question/category loading utilities found in `lib/utils/questionUtils.ts` and `hooks/utils/questionLoaders.ts`.
3.  [x] Simplifying or removing adapter files (`hooks/utils/questionLoaderAdapter.ts`, `lib/utils/questionAdapter.ts`) as their roles became obsolete after consolidation.
4.  [x] Ensuring the `useQuestions` hook and other dependent parts of the application correctly use the consolidated loading mechanism.
5.  [x] The refactored logic should fully support the intended data structure as outlined in `docs/QUESTIONS_CATEGORIES.md` (i.e., loading `public/questions/categories.json` and then `public/questions/{lang}/{category_id}.json` for selected categories).
6.  [x] This refactoring should also pave the way for implementing the new question loading logic described in `docs/todo.md` (selecting 10 categories and fetching their questions).

## Context from Existing Documentation

*   **`docs/QUESTIONS_CATEGORIES.md`**: Defines the authoritative structure for question and category data. Categories are in `public/questions/categories.json` (with `id`, translations, `emoji`). Questions are in `public/questions/{lang}/{category_id}.json` (with `questionId`, `text`, `category` (ID)). The final `Question` object in the app should include `categoryId`, `categoryName`, and `categoryEmoji`.
- [x] Review and update `docs/QUESTIONS_CATEGORIES.md`, `docs/DATA_STRUCTURE_OVERVIEW.md`, and `docs/MULTILINGUAL_STRATEGY.md` as this refactoring clarified the documented data flow.

**This plan is now complete.**
