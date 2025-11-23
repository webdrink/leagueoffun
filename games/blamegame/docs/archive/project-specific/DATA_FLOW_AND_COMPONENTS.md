# BlameGame: Data Flow and Component Interaction

This document outlines the primary data flow, state management strategies, and component interactions within the BlameGame application.

## 1. Core Data & State Management

The application relies heavily on custom React hooks for managing state and logic. `App.tsx` serves as the central point where these hooks are initialized and their states/functions are distributed to child components.

### Key Hooks and Utilities:

*   **`useQuestions` (`hooks/useQuestions.ts`):**
    *   Central hub for all question-related data and logic.
    *   Fetches categories and questions using utilities from `lib/utils/questionLoaders.ts`.
    *   Manages `allQuestions` (all available for the current language), `currentRoundQuestions` (shuffled list for the active game), and the `currentQuestion` being displayed.
    *   Tracks loading states (`isLoading`, `isPreparingRound`) and played questions to avoid repetition.
    *   Handles selection of categories and questions based on `gameSettings`.

*   **`lib/utils/questionLoaders.ts`:**
    *   `loadCategoriesFromJson`: Fetches `public/questions/categories.json` (contains category IDs, emojis, and names translated into all supported languages).
    *   `loadQuestionsFromJson`: Fetches language-specific question files (e.g., `public/questions/en/party.json`). It enriches raw question objects with the translated `categoryName` and `categoryEmoji` using data from `loadCategoriesFromJson`.
    *   Includes error handling mechanisms like `fetchWithRetry` and `getFallbackQuestions`.

*   **`useGameSettings` (`hooks/useGameSettings.ts`):**
    *   Manages user-configurable settings such as language, game mode, sound volume, and theme.
    *   Persists these settings using the `useLocalStorage` hook.

*   **`useLocalStorage` (`hooks/useLocalStorage.ts`):**
    *   A generic hook that synchronizes a piece of state with the browser's `localStorage`, ensuring data persistence across sessions.

*   **`useTranslation` (`hooks/useTranslation.ts`):**
    *   Integrates with `react-i18next`.
    *   Provides the `t` function for translating UI text based on the current language selected in `gameSettings`.

*   **`useGameState` (`hooks/useGameState.ts`):**
    *   Manages the overall progression and current phase of the game (e.g., 'intro', 'playerSetup', 'loading', 'playing', 'summary').

*   **`useNameBlameSetup` (`hooks/useNameBlameSetup.ts`):**
    *   Manages player data (names, adding/removing players) specifically for the "NameBlame" game mode.

*   **`useSound` (`hooks/useSound.ts`):**
    *   Manages sound effects, including enabling/disabling sound and controlling volume.

## 2. Main Application Component (`App.tsx`)

*   **Orchestrator:** `App.tsx` acts as the central coordinator of the application.
*   **Hook Initialization:** It initializes all the primary custom hooks listed above.
*   **State Distribution:** Data and functions from these hooks are passed down as props to various screen-level and game-specific components.
*   **Game Flow Control:** Manages the `gameStep` state (from `useGameState`), determining which screen or view is currently active.
*   **Global State Management:** Handles aspects like the `currentQuote` for loading screens (cycling through `LOADING_QUOTES` from `lib/constants/loadingQuotes.ts`).

## 3. Game Flow & Key Component Interactions

The game progresses through several distinct phases, with `App.tsx` controlling the transitions and data flow.

### 3.1. Introduction Phase
*   **`IntroScreen.tsx` (`components/game/IntroScreen.tsx`):**
    *   Displays initial game options (e.g., start game, select mode).
    *   User interactions trigger functions in `App.tsx` to change the `gameStep` and initiate game setup.

### 3.2. Player Setup Phase (NameBlame Mode)
*   **`PlayerSetupScreen.tsx` (`components/game/PlayerSetupScreen.tsx`):**
    *   Allows users to input, add, and remove player names.
    *   Interacts with `useNameBlameSetup` (via `App.tsx`) to manage player data.

### 3.3. Loading Phase
*   Triggered when `App.tsx` calls `prepareRoundQuestions` from `useQuestions`.
*   **`LoadingContainer.tsx` (`components/game/LoadingContainer.tsx`):**
    *   Displays a loading animation and information while questions are being prepared.
    *   Receives category information (e.g., names, emojis for the upcoming round) derived from `useQuestions` data via `App.tsx`.
    *   Receives the `currentQuote` (a string) from `App.tsx`.
    *   **`LoadingCardStack.tsx` (`components/game/LoadingCardStack.tsx`):**
        *   Nested within `LoadingContainer`.
        *   Receives an array of category names (`string[]`) and a function to get emojis (or the emojis directly).
        *   Renders an animated stack of cards representing the categories being loaded.
    *   **`LoadingQuote.tsx` (`components/game/LoadingQuote.tsx`):**
        *   Nested within `LoadingContainer`.
        *   Displays the `currentQuote` with an animation.

### 3.4. Gameplay Phase
*   **`QuestionScreen.tsx` (`components/game/QuestionScreen.tsx`):**
    *   The main screen for displaying and interacting with questions.
    *   Receives the `currentQuestion` object (which includes `text`, `categoryId`, `categoryName`, and `categoryEmoji`) from `App.tsx` (sourced from `useQuestions`).
    *   Receives `currentQuestionIndex` (current question number) and `totalQuestions` for the round.
    *   **`GameHeader.tsx` (`components/game/GameHeader.tsx`):**
        *   Displays the game title or other relevant header information.
    *   **`QuestionCard.tsx` (`components/game/QuestionCard.tsx`):**
        *   Renders the details of the `currentQuestion` (emoji, category name, question text) within a styled card.
    *   **`QuestionProgress.tsx` (`components/game/QuestionProgress.tsx`):**
        *   Displays the user's progress (e.g., "Question 3 of 10") and a visual progress bar.
        *   Receives `currentQuestion` (number) and `totalQuestions`.
    *   Handles navigation (next/previous question) by invoking callback functions passed from `App.tsx` (which in turn call methods from `useQuestions`).

### 3.5. Summary Phase
*   **`SummaryScreen.tsx` (`components/game/SummaryScreen.tsx`):**
    *   Displays at the end of a game round.
    *   Shows statistics like questions answered and, in NameBlame mode, blame counts.
    *   Receives `nameBlameLog`, `questionsAnswered`, `activePlayersCount` from `App.tsx`.
    *   Uses `Confetti.tsx` for a celebratory visual effect.
    *   Provides a "Restart Game" option, which calls an `onRestart` function passed from `App.tsx`.

## 4. Reusable Core Components (`components/core/`)

*   This directory contains generic, reusable UI components (e.g., `Button.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`, `Confetti.tsx`).
*   These components are used extensively across various game-specific, settings, and debug components to ensure UI consistency and promote code reuse.
    *   Example: `QuestionCard.tsx` uses `Card.tsx`. `SummaryScreen.tsx` uses `Button.tsx` and `Confetti.tsx`.

## 5. Settings Components (`components/settings/`)

*   **`SettingsScreen.tsx`:**
    *   Provides an interface for users to change application settings.
    *   Interacts with `useGameSettings` (via `App.tsx`) to modify and persist settings.
*   **`LanguageSelector.tsx`:**
    *   Allows users to change the application language.
    *   Updates the `language` setting in `useGameSettings`.
*   **`LanguageChangeFeedback.tsx` (`components/language/`):**
    *   Provides visual feedback to the user when the language is changed.

## 6. Debug Components (`components/debug/`)

*   **`DebugPanel.tsx`:**
    *   Provides a UI for developers to inspect game state, modify settings in real-time, and access debugging tools.
    *   Interacts with various hooks and state variables in `App.tsx`.
*   **`DebugInput.tsx`:**
    *   Likely a specialized input component used within the `DebugPanel`.
*   **`LanguageTester.tsx`:**
    *   A utility component for testing language and translation functionalities.

## 7. Conclusion

BlameGame employs a well-structured, hook-based architecture for managing state and data flow. `App.tsx` serves as the central nervous system, integrating various custom hooks and distributing data to a hierarchy of specialized components. This separation of concerns allows for maintainable and scalable code. The documentation for individual components and hooks should be consulted for more granular details.
