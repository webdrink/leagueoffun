# Plan: Question Header Refactor

## 1. Feature Name or Bugfix Title
Refactor Question Screen Header

## 2. Goal & Expected Behavior
The goal is to create a dedicated `QuestionHeader.tsx` component to display the game title ("BlameGame") and the current question progress (e.g., "Question X of Y"). This component will be used within `QuestionScreen.tsx` to improve organization.

## 3. Technical Steps to Implement
1.  **Create `QuestionHeader.tsx`**:
    *   File location: `components/game/QuestionHeader.tsx`.
    *   Define props: `title: string`, `currentIndex: number`, `totalQuestions: number`.
    *   Implement the component to render an `<h1>` for the title.
    *   Implement a `<p>` tag for the question progress, using `useTranslation` for the string `t('questions.counter', { current: currentIndex + 1, total: totalQuestions })`.
    *   Style the component appropriately, similar to the existing header elements in `QuestionScreen.tsx`.
    *   Add a docblock explaining its purpose, props, and dependencies (React, react-i18next).
2.  **Integrate `QuestionHeader.tsx` into `QuestionScreen.tsx`**:
    *   Import `QuestionHeader.tsx` in `QuestionScreen.tsx`.
    *   Replace the existing `<h1>BlameGame</h1>` and the `<p>` tag displaying the question count with `<QuestionHeader title="BlameGame" currentIndex={index} totalQuestions={totalQuestions} />`.
    *   Ensure the player turn information and the visual progress bar remain in `QuestionScreen.tsx`, positioned correctly relative to the new header.

## 4. Potential Edge Cases
*   Translations for `questions.counter` not being available (though it's expected to exist).
*   Incorrect prop values passed, leading to display issues (e.g., `totalQuestions` being 0).

## 5. Impact on Existing Files or UX
*   `QuestionScreen.tsx`: Will be simplified by offloading header elements to `QuestionHeader.tsx`. Structure of the top section will change.
*   `components/game/QuestionHeader.tsx`: New file created.
*   **UX**: Should remain visually consistent with the current header, but the code will be better organized.

## 6. Checklist
- [ ] `plan-question-header-refactor.md` created.
- [ ] `components/game/QuestionHeader.tsx` created with correct props and rendering logic.
- [ ] `QuestionHeader.tsx` uses `useTranslation` for progress text.
- [ ] `QuestionHeader.tsx` includes a docblock.
- [ ] `QuestionScreen.tsx` imports and uses `QuestionHeader.tsx`.
- [ ] Old header elements (H1 and progress text p-tag) removed from `QuestionScreen.tsx`.
- [ ] Visual appearance of the header in the application is verified.
- [ ] Task updated in `todo.md`.
