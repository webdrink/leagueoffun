# React Party Game Framework

A modular, extensible framework for building interactive party games. This framework powers games like **BlameGame** and **HookHunt**.

## 📁 Directory Structure

```
framework/
├── index.ts                    # Main framework exports
├── core/                       # Core framework functionality
│   ├── events/                 # Event bus system
│   ├── router/                 # Screen routing and navigation
│   ├── actions.ts              # Action definitions
│   ├── dispatcher.ts           # Action dispatcher
│   ├── modules.ts              # Game module registry
│   ├── phases.ts               # Phase management
│   └── GameHost.tsx            # Main game host component
├── config/                     # Configuration system
│   ├── game.schema.ts          # Game configuration schema
│   └── discovery/              # Config discovery utilities
├── persistence/                # Storage and persistence
│   └── storage.ts              # LocalStorage wrapper
├── ui/                         # UI components
│   ├── components/             # Reusable UI primitives
│   ├── screens/                # Complete screen implementations
│   ├── GameMenu.tsx            # Game selection menu
│   └── index files             # Component exports
└── utils/                      # Utility functions
    └── url.ts                  # URL parameter parsing
```

## 🧩 Core Components

### Framework Components (`ui/components/`)

Reusable UI primitives that work across all games:

#### Input & Form Components
- `Button` - Primary button component with variants
- `Input` - Text input field
- `Checkbox` - Checkbox input
- `Switch` - Toggle switch
- `Slider` - Slider control
- `Label` - Form label

#### Layout Components
- `Card` - Card container with header/footer variants
- `GameLayout` - Standard game layout structure
- `FooterButton` - Specialized footer button

#### Specialized Components
- `VolumeControl` - Audio volume slider
- `SplitText` - Animated text display
- `Confetti` - Celebration animation
- `InfoModal` - Modal dialog for information
- `ErrorDisplay` - Error message display
- `DataLoader` - Async data loading wrapper
- `GameInfoLoader` - Game metadata loader

### Framework Screens (`ui/screens/`)

Complete screen implementations for common game flows:

#### Layout & Shell
- `GameShell` - Main game shell with persistent header/footer
- `GameMain` - Main game wrapper
- `GameMainHeader` - Standardized header
- `GameMainFooter` - Standardized footer
- `GameMainScreen` - Main game screen layout

#### Game Flow Screens
- `FrameworkIntroScreen` - Game introduction and setup
- `FrameworkPlayerSetupScreen` - Player name entry
- `FrameworkCategoryPickScreen` - Category selection
- `FrameworkPreparingScreen` - Loading/preparation animation
- `FrameworkQuestionScreen` - Question display and interaction
- `FrameworkSummaryScreen` - Game end summary

#### Settings & Configuration
- `GameSettingsPanel` - In-game settings panel
- `DarkModeToggle` - Dark mode toggle button

## 🎮 Core Framework Features

### Event System (`core/events/`)
Event-driven architecture for loose coupling between components:
```typescript
import { createEventBus } from './framework';

const eventBus = createEventBus();
eventBus.publish({ type: 'GAME_START' });
eventBus.subscribe(event => console.log(event));
```

### Module System (`core/modules.ts`)
Pluggable game module architecture:
```typescript
import { GameModule, gameModuleRegistry } from './framework';

const myGame: GameModule = {
  id: 'my-game',
  init: async (ctx) => { /* initialization */ },
  registerScreens: () => ({ /* screen registry */ }),
  getPhaseControllers: () => ({ /* phase controllers */ })
};

gameModuleRegistry.register(myGame);
```

### Router (`core/router/`)
Screen-based navigation with phase management:
```typescript
import { useFrameworkRouter } from './framework';

const { dispatch, currentPhaseId, config } = useFrameworkRouter();
dispatch('ADVANCE');
```

### Configuration (`config/`)
JSON-driven game configuration:
```typescript
import { GameConfig } from './framework';

const config: GameConfig = {
  id: 'my-game',
  title: 'My Game',
  minPlayers: 2,
  maxPlayers: 8,
  gameSettings: { /* custom settings */ }
};
```

### Storage (`persistence/`)
Persistent storage utilities:
```typescript
import { storageGet, storageSet, STORAGE_KEYS } from './framework';

storageSet(STORAGE_KEYS.selectedGame, 'my-game');
const game = storageGet<string>(STORAGE_KEYS.selectedGame);
```

## 🚀 Usage

### Importing Components

All framework components and utilities are exported from the main index:

```typescript
// Import everything you need
import {
  // Components
  Button,
  Card,
  GameShell,
  FrameworkIntroScreen,
  
  // Core framework
  GameHost,
  createEventBus,
  gameModuleRegistry,
  
  // Configuration
  discoverGameConfigs,
  
  // Storage
  storageGet,
  storageSet,
  
  // Types
  GameConfig,
  GameModule,
  EventBus
} from './framework';
```

### Creating a Game Module

```typescript
import { GameModule } from './framework';

export const MyGameModule: GameModule = {
  id: 'my-game',
  
  async init(ctx) {
    // Initialize game data, providers, etc.
    console.log('Initializing game:', ctx.config.id);
  },
  
  registerScreens() {
    return {
      'intro': MyIntroScreen,
      'game': MyGameScreen,
      'summary': MySummaryScreen
    };
  },
  
  getPhaseControllers() {
    return {
      'intro': introPhaseController,
      'game': gamePhaseController,
      'summary': summaryPhaseController
    };
  }
};

// Register the module
import { gameModuleRegistry } from './framework';
gameModuleRegistry.register(MyGameModule);
```

## 📦 What's NOT in the Framework

The framework is designed to be game-agnostic. The following should remain in your game code:

### Game-Specific Components
- Custom game screens (beyond the framework screens)
- Game-specific UI elements
- Custom animations unique to your game

### Game Logic
- Question/content loading
- Score calculation
- Game-specific state management
- Custom business logic

### Assets & Content
- Questions and categories
- Images and media
- Game-specific translations
- Custom themes beyond the base system

### Hooks & Utilities
- Game-specific custom hooks
- Domain-specific utility functions
- Game state management (beyond framework state)

## 🔧 Integration with Games

### BlameGame Integration

BlameGame uses the framework for:
- ✅ Core UI components (Button, Card, Input, etc.)
- ✅ Framework screens (Intro, Question, Summary)
- ✅ Event system and router
- ✅ Configuration and storage

BlameGame keeps game-specific:
- ❌ Question/category management
- ❌ Name/Blame game logic
- ❌ Custom loading animations
- ❌ Game-specific hooks and stores

### HookHunt Integration

HookHunt similarly uses the framework components while maintaining its own game-specific logic.

## 🎨 Styling

Components use Tailwind CSS and follow these conventions:

- **Mobile-first responsive design**
- **Dark mode support** via CSS custom properties
- **Consistent spacing** using Tailwind spacing scale
- **Accessible** with ARIA labels and semantic HTML

## 🧪 Testing

Framework components should be tested independently of games:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './framework';

test('Button renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## 📝 Development Guidelines

### Adding New Components

1. Create component in appropriate directory (`ui/components/` or `ui/screens/`)
2. Export from the directory's `index.ts`
3. Add to main `framework/index.ts`
4. Document usage and props
5. Ensure it's game-agnostic

### Modifying Existing Components

1. Ensure changes don't break existing games
2. Update TypeScript interfaces
3. Update documentation
4. Test with all games using the framework

### Best Practices

- **Keep it generic** - Framework components should work for any game
- **Use TypeScript** - Full type safety for better DX
- **Document thoroughly** - JSDoc for all public APIs
- **Test comprehensively** - Unit tests for all components
- **Follow conventions** - Consistent naming and structure

## 🔮 Future Improvements

- [ ] Extract to separate npm package
- [ ] Add Storybook for component documentation
- [ ] Create CLI for scaffolding new games
- [ ] Add more framework screens (leaderboard, achievements, etc.)
- [ ] Improve animation system
- [ ] Add multiplayer/networking support

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Changes are backward compatible
- New features are documented
- Tests are included
- Code follows existing patterns

---

**Built with ❤️ for League of Fun**
