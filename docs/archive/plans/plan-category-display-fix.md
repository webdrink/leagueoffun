# Plan: Category Display Fix (Name and Emoji)

## 1. Feature Name or Bugfix Title
Fix Category Name Localization and Emoji Display in Question Card

## 2. Goal & Expected Behavior
The goal is to ensure that `QuestionCard.tsx` displays the correctly translated category name (e.g., "Auf der Arbeit" instead of "at_work") and the associated category emoji. This involves modifying the data pipeline from `App.tsx` to `QuestionCard.tsx`.

## 3. Technical Steps to Implement
1.  **Update `Question` Type in `types.ts`**:
    *   [x] Modify the `Question` interface to include distinct fields for category data:
        *   `categoryId: string`
        *   `categoryName: string`
        *   `categoryEmoji: string`
    *   [x] Ensure all existing fields of the `Question` type are preserved.
2.  **Modify `App.tsx` (`loadGameData` function)**:
    *   [x] When loading categories (`categories.json`), ensure the `translatedCategories` array stores objects each containing `id`, `name` (translated), and `emoji`.
    *   [x] When processing and setting up the `shuffledQuestions` (or `questions`) state:
        *   [x] For each question, retrieve its `categoryId`.
        *   [x] Look up the corresponding category object in the `translatedCategories` state.
        *   [x] Populate the question object in the state with the new fields.
3.  **Modify `QuestionCard.tsx`**:
    *   [x] Update `QuestionCardProps` to reflect that `question` prop is of the modified `Question` type.
    *   [x] Change the emoji display to use `{question.categoryEmoji}`.
    *   [x] Change the category name display to use `{question.categoryName}`.
    *   [x] Remove the `import { getEmoji } from '../../lib/formatters';` and its usage.
    *   [x] Update the docblock for `QuestionCard.tsx`.
4.  **Review `hooks/utils/questionLoaders.ts`**:
    *   [x] Ensure `loadDefaultQuestions` and any other question loading utilities correctly populate `categoryId`, `categoryName`, and `categoryEmoji` for fallback/default questions.

## 4. Potential Edge Cases
*   [x] `categories.json` missing `emoji` or translation for a specific language for a category. (Handled by `App.tsx` logic, falls back to ID or empty string if not found, emoji might be missing).
*   [x] Mismatch between `categoryId` in question files and `id` in `categories.json`. (Handled by `App.tsx` logic, category data might be missing for such questions).
*   [x] `Question` type changes might affect other parts of the application. (Reviewed, main impact was on `questionLoaders.ts` which was updated).

## 5. Impact on Existing Files or UX
*   [x] `types.ts`: `Question` interface modified.
*   [x] `App.tsx`: Logic within `loadGameData` changed.
*   [x] `components/game/QuestionCard.tsx`: Updated.
*   [x] `hooks/utils/questionLoaders.ts`: Updated.
*   [x] **UX**: Category display corrected.

## 6. Checklist
- [x] `plan-category-display-fix.md` created.
- [x] `types.ts`: `Question` interface updated.
- [x] `App.tsx`: `loadGameData` updated.
- [x] `components/game/QuestionCard.tsx`: Updated to use `question.categoryName`.
- [x] `components/game/QuestionCard.tsx`: Updated to use `question.categoryEmoji`.
- [x] `components/game/QuestionCard.tsx`: `getEmoji` import and usage removed.
- [x] `hooks/utils/questionLoaders.ts`: Updated to align with new `Question` structure.
- [x] **Verification**: Category name and emoji display correctly in `QuestionCard.tsx`.
