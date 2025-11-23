# Plan: Question Screen UI and Data Fixes

## 1. Feature Name or Bugfix Title
Question Screen UI and Data Fixes

## 2. Goal & Expected Behavior
The primary goal is to restore and correct the UI elements and data display within the `QuestionScreen.tsx` component.
- The main "BlameGame" title should be consistently displayed.
- Player turn text and question progress counter should use translations and display dynamic data correctly.
- Navigation controls (Next/Back buttons) and blame functionality (blame buttons in name blame mode) should be fully restored and functional.
- Category-specific information (translated name, emoji) is primarily handled by `QuestionCard.tsx` and the data pipeline from `App.tsx`, but `QuestionScreen.tsx` must be robust in its own responsibilities.

## 3. Technical Steps to Implement (for `QuestionScreen.tsx`)
- **Imports**: Add missing React and library imports:
    - `import React, { useState } from 'react';`
    - `import { useTranslation } from 'react-i18next';`
    - `import { motion, AnimatePresence } from 'framer-motion';` (Ensure these are correctly used if already partially present)
    - `import { ChevronLeft, ChevronRight } from 'lucide-react';`
- **State and Translation Hook**:
    - Initialize the translation function: `const { t } = useTranslation();`
    - Initialize state for animation direction: `const [direction, setDirection] = useState(0);`
- **Event Handlers**:
    - Implement `handleNextWithDirection` to set direction to `1` and call `onNext()`.
    - Implement `handleBackWithDirection` to set direction to `-1` and call `onBack()`.
- **JSX Updates**:
    - **Player Turn Text**: Ensure it correctly displays `currentPlayer.name` and uses the translation key `t('questions.player_turn')`.
    - **Question Counter Text**: Ensure it uses the translation key `t('questions.counter', { current: index + 1, total: totalQuestions })`.
    - **Controls Area**:
        - Re-implement the logic for displaying blame buttons when `nameBlameMode` is true. Each button should:
            - Display player name.
            - Call `onBlame(player.name)` on click.
            - Be disabled for the current player.
            - Use `t('questions.who_blame')` for the section title.
            - Use `t('questions.cannot_blame_self')` and `t('questions.blame_player', { name: player.name })` for titles/aria-labels.
        - Re-implement the logic for displaying Next and Back buttons when `nameBlameMode` is false.
            - Back button: Calls `handleBackWithDirection`, disabled if `index === 0`, uses `t('questions.previous_question')` for aria-label and "Back" (or translated equivalent) for text.
            - Next button: Calls `handleNextWithDirection`, uses `t('questions.next_question')` or `t('questions.show_summary')` for aria-label and "Next"/"Summary" (or translated equivalents) for text.
- **Docblock**: Update the docblock at the beginning of the file if necessary to reflect dependencies like `react-i18next` and `framer-motion`.

## 4. Potential Edge Cases
- Missing translation keys: If `questions.player_turn`, `questions.counter`, `questions.who_blame`, etc., are not defined in the localization files, the UI will show keys instead of text. (Assumption: keys are correct based on previous versions).
- `activePlayers` or `currentPlayerIndex` issues: Incorrect data could lead to errors in blame mode.
- The `Question` object passed to `QuestionCard` might not yet contain translated category names or emojis. This fix focuses on `QuestionScreen.tsx`; further changes in `App.tsx` and `QuestionCard.tsx` might be needed for those aspects.

## 5. Impact on Existing Files or UX
- `QuestionScreen.tsx`: Significant updates to imports, state management, event handlers, and JSX, particularly in the controls area.
- `App.tsx`: No direct changes from this plan, but may require future changes to provide enriched `Question` objects to `QuestionCard` for category names/emojis.
- `QuestionCard.tsx`: No direct changes from this plan, but is a dependency for displaying question content, including category details.
- **UX**: Expected to be significantly improved by:
    - Restoring correct translations for dynamic text.
    - Re-enabling question navigation and blame functionality.
    - Ensuring a consistent visual presentation as intended.

## 6. Checklist
- [ ] `plan-questionscreen-fixes.md` created.
- [ ] `QuestionScreen.tsx`: Docblock updated with new dependencies.
- [ ] `QuestionScreen.tsx`: Necessary imports (`React`, `useState`, `useTranslation`, `ChevronLeft`, `ChevronRight`) added.
- [ ] `QuestionScreen.tsx`: `useTranslation` hook initialized and `t` function available.
- [ ] `QuestionScreen.tsx`: `direction` state and its handlers (`handleNextWithDirection`, `handleBackWithDirection`) implemented.
- [ ] `QuestionScreen.tsx`: Player turn text correctly displays `currentPlayer.name` and uses `t('questions.player_turn')`.
- [ ] `QuestionScreen.tsx`: Question counter text correctly uses `t('questions.counter')`.
- [ ] `QuestionScreen.tsx`: "Who to blame?" text (`t('questions.who_blame')`) is displayed in name blame mode.
- [ ] `QuestionScreen.tsx`: Blame buttons are correctly implemented and functional.
- [ ] `QuestionScreen.tsx`: Navigation buttons (Next/Back) are correctly implemented and functional with appropriate labels.
- [ ] `QuestionScreen.tsx`: Animations for question transition are preserved and use the `direction` state.
- [ ] Task marked as done in `todo.md` upon completion.
