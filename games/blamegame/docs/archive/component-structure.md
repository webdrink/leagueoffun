# BlameGame Component Structure Guide

This document outlines the organization and purpose of components within the BlameGame project.

## Directory Structure

```
components/
  ├── core/           # Reusable, generic UI components
  ├── debug/          # Components for development and debugging
  └── game/           # Game-specific, feature components
```

## Core Components

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
- `GameContainer.tsx` - Main layout container with theming
- `InfoModal.tsx` - Modal dialog for showing information
- `Input.tsx` - Text input field with consistent styling
- `Label.tsx` - Form label with consistent styling
- `Slider.tsx` - Range input slider
- `Switch.tsx` - Toggle switch input
- `VolumeControl.tsx` - Audio volume control

## Game Components

The `components/game/` directory contains **feature-specific components** that implement game functionality. These components:

- Can use core components as building blocks
- Contain game-specific logic and presentation
- May be composed of multiple smaller components
- Are specific to BlameGame features

### Current Game Components

- `IntroScreen.tsx` - The initial game screen with options
- `LoadingCardStack.tsx` - Card stack animation during loading
- `LoadingContainer.tsx` - Container for loading state
- `LoadingQuote.tsx` - Displays rotating quotes during loading
- `PlayerSetupScreen.tsx` - Screen for setting up players in NameBlame mode
- `QuestionCard.tsx` - Displays a question
- `QuestionScreen.tsx` - Screen for the main question gameplay
- `SummaryScreen.tsx` - End-of-game summary and stats

## Debug Components

The `components/debug/` directory contains components used during development for testing and debugging. These components:

- Are not shown to end users in production
- Provide developer tools and controls
- Can be used to modify game state for testing

### Current Debug Components

- `DebugInput.tsx` - Input controls for debug panel
- `DebugPanel.tsx` - Panel with developer controls and game state inspection

## Component Best Practices

When creating or modifying components:

1. **Keep components focused**: Each component should do one thing well
2. **Use composition**: Build complex components from simpler ones
3. **Maintain separation of concerns**: 
   - UI presentation in components
   - Business logic in hooks
   - Data management in separate utilities
4. **Document with JSDoc**: Add clear documentation for props and behavior
5. **Consider accessibility**: Ensure components work with keyboard and screen readers

## Moving Components

If a component in `core/` is actually game-specific, it should be moved to `game/`. Similarly, if a component in `game/` is purely presentational and could be reused elsewhere, consider refactoring it and moving it to `core/`.
