# Plan: Game Header and Progress Bar Refactor

## 1. Feature Name or Bugfix Title
Game Header and Progress Bar Refactor

## 2. Goal & Expected Behavior
- Create a `GameHeader.tsx` component in `components/core/` to display the main game title (e.g., "BlameGame").
- Integrate `GameHeader.tsx` into `GameContainer.tsx`.
- Create a `QuestionProgress.tsx` component in `components/game/` to display the question counter text (e.g., "Question X of Y") and the visual progress bar.
- Integrate `QuestionProgress.tsx` into `QuestionScreen.tsx`.
- Remove the previously created `QuestionHeader.tsx` as its responsibilities will be split and handled by these new components.

## 3. Technical Steps to Implement

### a. `GameHeader.tsx` Creation
-   [x] **Location**: `components/core/GameHeader.tsx` (then moved to `components/game/GameHeader.tsx`).
-   [x] **Props**: `title: string`, `onTitleClick?: () => void`.
-   [x] **Content**: Renders an `<h1>` for the title. Styles appropriately. Title is clickable.
-   [x] **Docblock**: Standard component documentation.

### b. `GameContainer.tsx` Modification
-   [x] Import `GameHeader` from `../game/GameHeader` (path updated after move).
-   [x] Add `<GameHeader title="BlameGame" onTitleClick={handleTitleClick} />` at the top of the `GameContainer`'s JSX.
-   [x] Update `GameContainer.tsx` docblock.

### c. `QuestionProgress.tsx` Creation
-   [x] **Location**: `components/game/QuestionProgress.tsx`.
-   [x] **Props**: `currentQuestion: number`, `totalQuestions: number` (Note: `currentIndex` in plan was implemented as `currentQuestion` which is `index + 1`).
-   [x] **Content**:
    -   [x] Uses `useTranslation` hook.
    -   [x] Renders a `<p>` tag for the question counter: `{t('questions.counter', { current: currentQuestion, total: totalQuestions })}`.
    -   [x] Renders the visual progress bar using `motion.div`.
-   [x] **Docblock**: Standard component documentation.

### d. `QuestionScreen.tsx` Modification
-   [x] Remove the import and usage of the old `components/game/QuestionHeader.tsx`.
-   [x] Remove any direct rendering of game title, question counter text, and visual progress bar.
-   [x] Import `QuestionProgress` from `./QuestionProgress`.
-   [x] Add `<QuestionProgress currentQuestion={index + 1} totalQuestions={totalQuestions} />`.
-   [x] Update `QuestionScreen.tsx` docblock.

### e. Cleanup
-   [x] Delete the file `components/game/QuestionHeader.tsx` (the old one, if it existed after the initial refactor attempt).
-   [x] Delete original files from `components/core/` after moving them to `components/game/` (`GameHeader.tsx`, `GameContainer.tsx`).

## 4. Potential Edge Cases
-   [x] Styling of `GameHeader` within `GameContainer` might need adjustments.
-   [x] If `totalQuestions` is 0, the progress bar width calculation in `QuestionProgress.tsx` should gracefully handle this (shows 0% width).
-   [x] Translation key `questions.counter` missing (addressed by adding to `en.ts`).

## 5. Clickable Title
- [x] `GameHeader.tsx`: Added `onTitleClick` prop and handler.
- [x] `GameContainer.tsx`: Passed `onTitleClick` prop to `GameHeader`.
- [x] `App.tsx`: Added `handleTitleClick` function and passed it to `GameContainer`.

## 6. Verification
- [x] Game title is displayed by `GameHeader.tsx`.
- [x] Game title is clickable and returns to intro screen.
- [x] Question progress (text and bar) is displayed by `QuestionProgress.tsx`.
- [x] Progress bar text shows dynamic values (e.g., "Frage 1 von 10" or "Question 1 of 10").
