# Getting Started

Welcome to the React Party Game Framework! This guide will help you set up your development environment and create your first game.

*"Getting started is easy," they said. "Just follow the documentation," they said.*

## 📋 Prerequisites

Before you begin, ensure you have the following installed *(and pray they're all compatible)*:

- **Node.js 18+** (LTS recommended) *(because 16 is "deprecated" and 20 might break something)*
- **pnpm** (preferred) or npm/yarn *(we gave up on npm after the 47th dependency conflict)*
- **Git** for version control *(because "it works on my machine" needs version history)*
- **VS Code** (recommended IDE) *(or your editor of choice, but we can't help you with vim)*

### Recommended VS Code Extensions

- **TypeScript and JavaScript Language Features** (Built-in)
- **Tailwind CSS IntelliSense**
- **ES7+ React/Redux/React-Native snippets**
- **Playwright Test for VS Code**
- **i18n Ally** (for translation management)

## 🚀 Quick Setup

### 1. Clone and Install

```bash
# Clone the framework repository (this usually works)
git clone <repository-url>
cd <framework-directory>

# Install dependencies (here we go...)
pnpm install
# ☕ Go get coffee, this might take a while
```

### 2. Start Development

```bash
# Start the development server (cross your fingers)
pnpm dev
```

Open `http://localhost:999` in your browser. You should see the NameBlame game running!

*If you see an error instead, welcome to the club. Check the console for cryptic error messages.*

### 3. Explore the Example

The included NameBlame game demonstrates all framework features:
- Navigate through different game phases
- Try different languages (German, English, Spanish, French)
- Test responsive design on mobile/desktop
- Use the debug panel (press 'D' in development)

## 🎯 Your First Custom Game

Let's create a simple "Truth or Dare" game to learn the framework basics.

### Step 1: Create Game Module

```typescript
// games/truthordare/TruthOrDareModule.tsx
import { GameModule } from '../../framework/core/modules';
import { truthOrDarePhaseControllers } from './phases';
import TruthOrDareIntroScreen from './screens/IntroScreen';
import TruthOrDareGameScreen from './screens/GameScreen';
import TruthOrDareSummaryScreen from './screens/SummaryScreen';

const TruthOrDareModule: GameModule = {
  id: 'truthordare',
  
  async init(ctx) {
    // Initialize your game data
    console.log('Truth or Dare game initializing...');
  },
  
  registerScreens() {
    return {
      intro: TruthOrDareIntroScreen,
      play: TruthOrDareGameScreen,
      summary: TruthOrDareSummaryScreen
    };
  },
  
  getPhaseControllers() {
    return truthOrDarePhaseControllers;
  }
};

export default TruthOrDareModule;
```

### Step 2: Define Game Configuration

```json
// games/truthordare/game.json
{
  "gameId": "truthordare",
  "version": "1.0.0",
  "name": "Truth or Dare",
  "description": "Classic party game with truth questions and dare challenges",
  "phases": [
    {
      "id": "intro",
      "screen": "intro",
      "controller": "intro"
    },
    {
      "id": "play",
      "screen": "play", 
      "controller": "play"
    },
    {
      "id": "summary",
      "screen": "summary",
      "controller": "summary"
    }
  ],
  "gameSettings": {
    "minPlayers": 2,
    "maxPlayers": 8,
    "gameMode": "truthordare"
  }
}
```

### Step 3: Create Phase Controllers

```typescript
// games/truthordare/phases/index.ts
import { PhaseController } from '../../../framework/core/phases';

const introController: PhaseController = {
  id: 'intro',
  async onEnter(ctx) {
    console.log('Entering intro phase');
  },
  async onExit(ctx) {
    console.log('Exiting intro phase');
  }
};

const playController: PhaseController = {
  id: 'play',
  async onEnter(ctx) {
    // Game logic when entering play phase
  },
  async onExit(ctx) {
    // Cleanup when leaving play phase
  }
};

const summaryController: PhaseController = {
  id: 'summary',
  async onEnter(ctx) {
    // Calculate game results
  }
};

export const truthOrDarePhaseControllers = [
  introController,
  playController,
  summaryController
];
```

### Step 4: Create Screen Components

```tsx
// games/truthordare/screens/IntroScreen.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/core/Button';
import { Card } from '../../../components/core/Card';

const TruthOrDareIntroScreen: React.FC = () => {
  const { t } = useTranslation();

  const handleStartGame = () => {
    // Navigate to play phase
    window.dispatchEvent(new CustomEvent('phase:navigate', { 
      detail: { phase: 'play' } 
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <Card className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Truth or Dare</h1>
        <p className="text-gray-600 mb-6">
          Classic party game - answer truthfully or take on a dare!
        </p>
        <Button onClick={handleStartGame} size="lg">
          Start Game
        </Button>
      </Card>
    </motion.div>
  );
};

export default TruthOrDareIntroScreen;
```

### Step 5: Register Your Game

```typescript
// Add to your main app configuration
import TruthOrDareModule from './games/truthordare/TruthOrDareModule';

// Register the module
const gameModules = [
  TruthOrDareModule,
  // ... other modules
];
```

## 🛠️ Development Commands

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Run tests
pnpm test

# Run specific test suite
pnpm test:truthordare

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🔍 Development Tools

### Debug Panel

Press **'D'** in development mode to open the debug panel:
- View current game state
- Inspect phase transitions
- Test different scenarios
- Monitor event bus activity

### Browser DevTools

The framework exposes helpful globals in development:
- `window.gameState` - Current game state
- `window.eventBus` - Event bus for debugging
- `window.framework` - Framework instance

### Hot Module Replacement

The framework supports HMR for rapid development:
- Component changes reload instantly
- State is preserved during development
- Styles update without page refresh

## 📁 Project Structure

```
your-game/
├── games/
│   └── truthordare/           # Your game module
│       ├── TruthOrDareModule.tsx
│       ├── game.json
│       ├── phases/
│       ├── screens/
│       └── data/
├── components/
│   ├── core/                  # Reusable UI components
│   ├── framework/             # Framework components
│   └── game/                  # Game-specific components
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and helpers
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🌍 Adding Internationalization

```typescript
// Add translations
// public/locales/en/truthordare.json
{
  "game": {
    "title": "Truth or Dare",
    "start": "Start Game",
    "truth": "Truth",
    "dare": "Dare"
  }
}

// Use in components
const { t } = useTranslation('truthordare');
return <h1>{t('game.title')}</h1>;
```

## 🧪 Adding Tests

```typescript
// tests/games/truthordare/basic-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Truth or Dare basic flow', async ({ page }) => {
  await page.goto('/');
  
  // Navigate to your game
  await page.click('[data-testid="truthordare-game"]');
  
  // Test intro screen
  await expect(page.locator('h1')).toContainText('Truth or Dare');
  
  // Start game
  await page.click('button:has-text("Start Game")');
  
  // Verify play screen
  await expect(page.locator('[data-testid="game-screen"]')).toBeVisible();
});
```

## 🎯 Next Steps

Congratulations! You've created your first game. Here's what to explore next:

1. **[Component System](../architecture/component-system.md)** - Learn about reusable components
2. **[State Management](../architecture/state-management.md)** - Understand data flow patterns
3. **[Internationalization Guide](../guides/internationalization.md)** - Add multi-language support
4. **[Testing Guide](../guides/testing.md)** - Write comprehensive tests
5. **[Animation Guide](../guides/animations.md)** - Add engaging animations

## 🆘 Common Issues *(A.K.A. "Why Doesn't This Work?")*

### Port Already in Use *(Because Something Is Always Running)*
```bash
# If port 5173 is taken (it probably is)
pnpm dev --port 3000
# Or 3001, or 3002, or whatever isn't occupied by your 15 other projects
```

### TypeScript Errors *(The Red Squiggles of Doom)*
```bash
# Clear TypeScript cache (the classic "turn it off and on again")
pnpm type-check --build --force
# If that doesn't work, try restarting VS Code. If that doesn't work, try meditation.
```

### Dependency Issues *(The Nuclear Option)*
```bash
# Clear cache and reinstall (when all else fails)
rm -rf node_modules pnpm-lock.yaml
pnpm install
# This fixes 73% of problems and creates 27% new ones
```

---

**Need help?** Check our [API Reference](../api-reference/) or look at the [NameBlame example](../examples/nameblame-game/) for a complete implementation.