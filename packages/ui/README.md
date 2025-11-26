# Framework UI

Reusable UI components, layouts, and screens for League of Fun games.

## Purpose

Provides a consistent set of React components that can be used across all games in the monorepo. Promotes UI consistency, reduces duplication, and speeds up game development.

## Contents

### Components (~30 components)

- **Basic UI**: Button, Card, Input, Label, Switch, Slider, Checkbox
- **Layout**: GameShell, GameLayout, GameHeader, GameBody, GameFooter
- **Advanced**: Confetti, SplitText, VolumeControl, InfoModal, ErrorDisplay
- **Data**: DataLoader, GameInfoLoader

### Screens

- FrameworkIntroScreen
- FrameworkPlayerSetupScreen
- FrameworkQuestionScreen
- FrameworkCategoryPickScreen
- FrameworkPreparingScreen
- FrameworkSummaryScreen
- GameSettingsPanel
- DarkModeToggle

### Additional

- GameMenu - Game selection menu
- GameHost - Framework host component
- FrameworkRouter - Routing system

## Usage

### Importing Components

```typescript
// Import specific components
import { Button, Card, GameShell } from '@framework-ui/components';
import { FrameworkIntroScreen } from '@framework-ui/screens';

// Import from package root
import { GameMenu, FrameworkRouter } from '@framework-ui';
```

### Using Components

```typescript
import { Button } from '@framework-ui/components';

function MyGame() {
  return (
    <Button variant="primary" onClick={handleClick}>
      Start Game
    </Button>
  );
}
```

### With Themes

Components are theme-aware and accept theme props:

```typescript
<GameShell theme={myGameTheme}>
  <YourGameContent />
</GameShell>
```

## Structure

```
framework-ui/
├── src/
│   ├── components/      # UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── index.ts     # Component exports
│   │   └── ...
│   ├── screens/         # Screen components
│   │   ├── GameShell.tsx
│   │   ├── FrameworkIntroScreen.tsx
│   │   ├── index.ts     # Screen exports
│   │   └── ...
│   ├── router/          # Routing
│   │   └── FrameworkRouter.tsx
│   ├── GameMenu.tsx     # Menu component
│   ├── GameHost.tsx     # Host component
│   └── index.ts         # Main exports
└── package.json
```

## How to Modify

### Adding a New Component

1. Create component file:
   ```typescript
   // src/components/NewComponent.tsx
   import React from 'react';
   
   export interface NewComponentProps {
     label: string;
     onClick?: () => void;
   }
   
   export function NewComponent({ label, onClick }: NewComponentProps) {
     return <button onClick={onClick}>{label}</button>;
   }
   ```

2. Export from components index:
   ```typescript
   // src/components/index.ts
   export { NewComponent } from './NewComponent';
   export type { NewComponentProps } from './NewComponent';
   ```

3. Test in multiple games:
   ```bash
   npm run build:blamegame
   npm run build:hookhunt
   npm run build:game-picker
   ```

### Modifying Existing Components

- ✅ **DO**: Maintain backward compatibility
- ✅ **DO**: Test changes in all games
- ✅ **DO**: Update TypeScript types
- ✅ **DO**: Document breaking changes
- ⚠️ **CAUTION**: Changes affect all games
- ❌ **DON'T**: Make game-specific changes here

### Component Guidelines

Components should be:
- **Generic**: Work for any game
- **Themeable**: Accept theme props where appropriate
- **Typed**: Full TypeScript types
- **Documented**: Clear prop descriptions
- **Tested**: Work in multiple games

## Theme System

Components support theme customization:

```typescript
interface Theme {
  primaryGradient: {
    from: string;
    to: string;
    css: string;
  };
  accent: {
    main: string;
    css: string;
  };
  // ...
}

// Usage
<Button theme={myTheme} />
```

## Dependencies

### Peer Dependencies
- React 19
- Framer Motion
- Lucide React
- Radix UI components
- Tailwind CSS

These must be provided by consuming games.

## Exports

Main exports from `src/index.ts`:

```typescript
// Components
export * from './components';

// Screens  
export * from './screens';

// Routing and menus
export { GameMenu } from './GameMenu';
export { GameHost } from './GameHost';
export { FrameworkRouter } from './router/FrameworkRouter';
```

## TypeScript

Components are fully typed:

```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button(props: ButtonProps) { ... }
```

## Styling

- Uses Tailwind CSS classes
- Supports custom className props
- Theme-aware color classes
- Responsive design utilities

## What NOT to Modify

- ❌ **DON'T**: Add game-specific logic
- ❌ **DON'T**: Import from games
- ❌ **DON'T**: Hardcode game-specific values
- ❌ **DON'T**: Break existing component APIs

## Testing

Test components by:
1. Building all games: `npm run build`
2. Running dev servers for visual testing
3. Checking TypeScript errors: `npm run typecheck`

## Examples

See how components are used in:
- `games/blamegame/components/`
- `games/game-picker/src/`
- `games/hookhunt/src/`

## Need Help?

- Component examples: Look at game implementations
- TypeScript types: Check component interfaces
- Patterns: Review existing components
