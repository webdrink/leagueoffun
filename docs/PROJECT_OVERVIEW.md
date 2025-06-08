# Project Overview

BlameGame is a party game built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**. Players answer humorous questions and decide "who's to blame" in various categories. The game supports multiple languages and is optimized as a Progressive Web App.

## Goals
- Provide a fun, lightweight party game for friends.
- Offer multilingual support with language-specific question sets.
- Work offline via PWA features.

## Main Components
- **components/core/** – Reusable UI elements (buttons, sliders, cards).
- **components/game/** – Screens and logic specific to gameplay.
- **components/settings/** – Configuration screens including language selection.
- **hooks/** – Custom hooks handling state and data fetching.
- **context/GameContext** – (currently empty) placeholder for global state.
- **lib/** – Utility functions and constants.

## Architecture Sketch
```
App.tsx
 ├─ Game Screens (components/game)
 │   └─ uses core components
 ├─ Settings Screens (components/settings)
 └─ Hooks & Utils
```

## Build System
- Managed with **pnpm**.
- Bundled via **Vite** with React plugin.
- Tailwind CSS for styling.

## Technologies
- React 19
- TypeScript 5
- Tailwind CSS 3
- i18next for localization
- vite-plugin-pwa for PWA support

