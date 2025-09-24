# BlameGame Component Structure Guide

This document outlines the organization, purpose, and best practices for components within the BlameGame project.

## 1. Directory Structure

```
components/
  ├── core/           # Reusable, generic UI components
  ├── debug/          # Components for development and debugging
  ├── game/           # Game-specific, feature components
  ├── language/       # Components related to language selection and display
  └── settings/       # Components related to application settings
```

## 2. Core Components

The `components/core/` directory contains **reusable UI components** that are not specific to any particular feature of the application. These components should:

- Be highly reusable across the application
- Have a single, well-defined responsibility
- Accept props for customization
- Be documented with JSDoc comments
- Not contain game-specific logic

### Current Core Components

- `Button.tsx` - Reusable button component with different variants
- `Card.tsx` - Container with consistent styling and animation capabilities
- `Checkbox.tsx` - Standard checkbox input with label
- `Confetti.tsx` - Celebration animation component
- `ErrorDisplay.tsx` - Standard error message display
- `InfoModal.tsx` - Modal dialog for showing information
- `Input.tsx` - Text input field with consistent styling
- `Label.tsx` - Form label with consistent styling
- `Slider.tsx` - Range input slider
- `Switch.tsx` - Toggle switch input
- `VolumeControl.tsx` - Audio volume control
- `DataLoader.tsx` - Generic loader using render props
- `GameLayout.tsx` - Provides `GameHeader`, `GameBody`, and `GameFooter` shells

## 3. Game Components

The `components/game/` directory contains **feature-specific components** that implement game functionality. These components:

- Can use core components as building blocks
- Contain game-specific logic and presentation
- May be composed of multiple smaller components
- Are specific to BlameGame features

### Current Game Components

- `GameContainer.tsx` - Main layout container with theming (moved from core/)
- `GameHeader.tsx` - Displays game title with click functionality
- `IntroScreen.tsx` - The initial game screen with options
- `LoadingCardStack.tsx` - Card stack animation during loading
- `LoadingContainer.tsx` - Container for loading state
- `LoadingQuote.tsx` - Displays rotating quotes during loading
- `PlayerSetupScreen.tsx` - Screen for setting up players in NameBlame mode
- `QuestionCard.tsx` - Displays a question with category information
- `QuestionProgress.tsx` - Shows question counter and progress bar
- `QuestionScreen.tsx` - Screen for the main question gameplay
- `SummaryScreen.tsx` - End-of-game summary and stats

## 4. Debug Components

The `components/debug/` directory contains components used during development for testing and debugging. These components:

- Are not shown to end users in production
- Provide developer tools and controls
- Can be used to modify game state for testing

### Current Debug Components

- `DebugInput.tsx` - Input controls for debug panel
- `DebugPanel.tsx` - Panel with developer controls and game state inspection
- `LanguageTester.tsx` - Component for testing language features

## 5. Language Components

The `components/language/` directory contains components related to language selection and display.

### Current Language Components

- `LanguageChangeFeedback.tsx` - Displays feedback when the language is changed

## 6. Settings Components

The `components/settings/` directory contains components related to application settings.

### Current Settings Components

- `LanguageSelector.tsx` - Component for selecting the application language
- `SettingsScreen.tsx` - Screen for managing application settings

## 7. Component Tree Visualization

This section provides a simplified view of the main component tree structure, illustrating how components are nested within the application, primarily starting from `App.tsx`.

### 7.1 Main Application Structure (`App.tsx`)

```
App
└── GameContainer
    ├── AnimatePresence (handles screen transitions)
    │   ├── IntroScreen (conditional)
    │   │   ├── (uses core: Button, Switch, Slider)
    │   │   └── LanguageSelector (likely, or similar UI for language)
    │   ├── PlayerSetupScreen (conditional)
    │   │   └── (uses core: Input, Button)
    │   ├── LoadingContainer (conditional)
    │   │   ├── LoadingQuote
    │   │   └── LoadingCardStack
    │   ├── QuestionScreen (conditional)
    │   │   ├── GameHeader (imported but usage depends on QuestionScreen internal structure)
    │   │   ├── QuestionCard
    │   │   │   └── (uses core: Card)
    │   │   └── QuestionProgress
    │   └── SummaryScreen (conditional, not directly in App.tsx but part of flow)
    │       └── (uses core: Button, Confetti)
    ├── InfoModal (conditional)
    ├── LanguageChangeFeedback
    └── DebugPanel (conditional)
        └── DebugInput (likely used within DebugPanel)
```

**Note:**
-   `(conditional)` indicates components rendered based on `gameStep` or other state.
-   This tree is not exhaustive but highlights major screen components and key reusable/game components.
-   Core components like `Button`, `Card`, `Input` are used within many of these higher-level components.
-   `SettingsScreen` would also be conditionally rendered within `GameContainer` if it were a main `gameStep`.


## 8. Component Best Practices

When creating or modifying components:

1. **Keep components focused**: Each component should do one thing well
2. **Use composition**: Build complex components from simpler ones
3. **Maintain separation of concerns**: 
   - UI presentation in components
   - Business logic in hooks
   - Data management in separate utilities
4. **Document with JSDoc**: Add clear documentation for props and behavior
5. **Consider accessibility**: Ensure components work with keyboard and screen readers
6. **Use TypeScript properly**: Define prop types explicitly 
7. **Handle edge cases**: Components should gracefully handle empty or unexpected props

### 8.1 Moving Components

If a component in `core/` is actually game-specific, it should be moved to `game/`. Similarly, if a component in `game/` is purely presentational and could be reused elsewhere, consider refactoring it and moving it to `core/`.

### 8.2 Component Documentation Pattern

Each component should include a JSDoc comment at the top with:

```tsx
/**
 * ComponentName - A brief description of the component's purpose
 * 
 * This component [detailed explanation of what it does and how it's used]
 * 
 * @example
 * <ComponentName prop1="value" prop2={123} />
 */
```

### 8.3 Prop Types Pattern

Use TypeScript interfaces for props:

```tsx
interface ComponentNameProps {
  /** Description of what this prop does */
  propName: PropType;
  
  /** Optional prop with default value */
  optionalProp?: PropType;
}
```

## 9. Recent Component Updates

### 9.1 GameHeader and QuestionProgress Refactoring

As part of a recent refactoring:
- `GameHeader.tsx` was created to display the game title
- Title click functionality was added to return to the intro screen
- `QuestionProgress.tsx` was created to show question count and progress bar
- These components replaced the previous `QuestionHeader.tsx`

### 9.2 QuestionCard Updates

The `QuestionCard.tsx` component was updated to:
- Display translated category names
- Show category emojis
- Use the enhanced Question type with categoryId, categoryName, and categoryEmoji fields