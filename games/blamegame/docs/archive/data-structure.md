# BlameGame Data Structure Documentation

This document describes the data organization and structure for the BlameGame application.

## Core Data Structures

### 1. Game Settings
   - Managed by `useGameSettings` hook.
   - Persisted in `localStorage`.
   - Includes: `language`, `soundEnabled`, `volume`, `gameMode`, etc.

### 2. UI Translations
   - Managed by `useTranslation` hook and i18next.
   - Language files located in `lib/localization/` (e.g., `en.ts`, `de.ts`).
   - Refer to `docs/multilingual-support.md` for more details.

## Questions and Categories Data

The primary source of truth for the structure, organization, and loading logic of questions and categories is detailed in:

**[➡️ Question and Category Data Structure Guide](question-category-structure.md)**

This guide covers:
- Directory structure (`public/questions/`)
- Format of `categories.json`
- Format of language-specific question files (e.g., `/en/party.json`)
- Question loading flow
- Fallback mechanisms for missing language files

### Legacy Data (Phased Out)
- Previously, questions were stored in a single `questions.json` file or in category-specific files that contained all languages. This structure has been deprecated in favor of the new system outlined in the `question-category-structure.md` document.

## Player and Game State

- **`players`**: Array of player objects, potentially with names and scores.
- **`currentQuestion`**: The question object currently displayed.
- **`playedQuestions`**: An array or set of `questionId`s that have already been used in the current session to avoid repetition.
- **`gameStep`**: Manages the current phase of the game (e.g., `intro`, `playing`, `results`).

## Application Configuration

- General application configuration settings might be stored in a dedicated config file or as constants within the codebase if they are not user-modifiable.

This document provides a high-level overview. For specific details on question and category data, please refer to the linked `question-category-structure.md`.
