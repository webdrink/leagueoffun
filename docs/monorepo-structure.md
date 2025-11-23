# League of Fun Monorepo Structure

This repository is a monorepo containing multiple game applications and shared packages for the League of Fun game collection.

## 📁 Repository Structure

```
.
├── games/                     # Game applications
│   ├── blamegame/           # BlameGame - "Who would most likely...?"
│   ├── hookhunt/            # HookHunt - Music guessing game
│   └── game-picker/         # League of Fun hub (leagueoffun.de)
│
├── packages/                 # Shared packages
│   ├── framework-ui/        # Reusable UI components
│   ├── game-core/           # Shared game logic primitives
│   └── shared-config/       # Shared configs (TypeScript, Tailwind, etc.)
│
└── .github/workflows/       # Independent CI/CD pipelines
    ├── deploy-blamegame.yml
    ├── deploy-hookhunt.yml
    └── deploy-game-picker.yml
```

## 🎮 Applications

### Game Picker (Hub)
- **Path**: `games/game-picker`
- **URL**: `leagueoffun.de`
- **Purpose**: Central hub for discovering and launching games
- **Features**:
  - Player ID generation and management
  - Game listing with descriptions
  - Cross-game player tracking
  - Return flow handling with stats collection

### BlameGame
- **Path**: `games/blamegame`
- **URL**: `blamegame.leagueoffun.de`
- **Purpose**: Party game for friends - "Who would most likely...?"
- **Features**:
  - Classic and NameBlame modes
  - Multi-language support
  - Category selection
  - Player ID integration

### HookHunt
- **Path**: `games/hookhunt`
- **URL**: `hookhunt.leagueoffun.de`
- **Purpose**: Music guessing game (coming soon)
- **Features**:
  - Guess songs from their hooks
  - Player ID integration
  - Return to hub functionality

## 📦 Shared Packages

### @leagueoffun/framework-ui
Reusable UI components used across all games:
- Layout components (GameShell, GameLayout)
- Buttons, Cards, Forms
- Animation components
- Theme-aware components

### @leagueoffun/game-core
Shared game logic and utilities:
- Event system
- Player ID management
- Game session types
- Persistence utilities
- Configuration schemas

### @leagueoffun/shared-config
Shared configuration files:
- Base TypeScript config
- Tailwind CSS config
- PostCSS config
- Theme tokens

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm (workspaces support)

### Getting Started

```bash
# Install all dependencies
npm install

# Run a specific app in development mode
npm run dev:blamegame
npm run dev:hookhunt
npm run dev:game-picker

# Build a specific app
npm run build:blamegame
npm run build:hookhunt
npm run build:game-picker

# Build all apps
npm run build
```

### TypeScript Path Aliases

All apps use TypeScript path aliases for cleaner imports:

```typescript
// Instead of: import { Button } from '../../packages/framework-ui/src/components'
import { Button } from '@framework-ui/components';

// Instead of: import { generatePlayerId } from '../../packages/game-core/src'
import { generatePlayerId } from '@game-core';
```

Aliases are configured in each app's `tsconfig.json` and `vite.config.ts`.

## 🔄 Player ID Flow

The League of Fun uses a URL-based player ID flow to track players across games on different subdomains:

### 1. Hub → Game
```
https://blamegame.leagueoffun.de/?playerId=abc123&returnUrl=https%3A%2F%2Fleagueoffun.de
```

### 2. Game → Hub (Return)
```
https://leagueoffun.de/?playerId=abc123&gameId=blamegame&score=42&playedAt=2025-11-18T10:00:00Z
```

### Implementation

**In Game Picker (Hub)**:
```typescript
import { usePlayer } from './PlayerContext';

const { playerId } = usePlayer();
const targetUrl = `${gameUrl}?playerId=${playerId}&returnUrl=${encodeURIComponent(hubUrl)}`;
```

**In Game Apps**:
```typescript
import { usePlayerId, returnToHub } from './hooks/usePlayerId';

const { playerId, returnUrl } = usePlayerId();

// When game ends:
if (returnUrl) {
  returnToHub(returnUrl, playerId, finalScore);
}
```

## 🔧 CI/CD

Each app has an independent build and deployment pipeline to ensure failure isolation:

- **deploy-blamegame.yml**: Triggers on changes to `games/blamegame/**` or `packages/**`
- **deploy-hookhunt.yml**: Triggers on changes to `games/hookhunt/**` or `packages/**`
- **deploy-game-picker.yml**: Triggers on changes to `games/game-picker/**` or `packages/**`

Benefits:
- A failing build in one game doesn't block others
- Independent deployment schedules
- Focused path-based triggers
- Separate artifact uploads

## 🎨 Theming

Each game can define its own theme while using the same shared components:

```typescript
// BlameGame theme (orange/warm)
const blamegameTheme = {
  primaryGradient: 'from-orange-400 to-orange-600',
  accent: 'orange',
  // ...
};

// HookHunt theme (music/blue)
const hookhuntTheme = {
  primaryGradient: 'from-blue-400 to-purple-600',
  accent: 'blue',
  // ...
};
```

## 📝 Adding a New Game

1. **Create app directory**:
   ```bash
   mkdir -p games/newgame/src
   ```

2. **Copy configuration** from an existing game:
   ```bash
   cp games/hookhunt/package.json games/newgame/
   cp games/hookhunt/tsconfig.json games/newgame/
   cp games/hookhunt/vite.config.ts games/newgame/
   ```

3. **Update package.json** with new game name

4. **Add build scripts** to root `package.json`:
   ```json
   "dev:newgame": "cd games/newgame && npm run dev",
   "build:newgame": "cd games/newgame && npm run build"
   ```

5. **Create GitHub workflow**:
   ```yaml
   # .github/workflows/deploy-newgame.yml
   on:
     push:
       paths:
         - 'games/newgame/**'
         - 'packages/**'
   ```

6. **Register in game-picker**:
   ```typescript
   // games/game-picker/src/games.config.ts
   export const games = [
     // ...existing games
     {
       id: 'newgame',
       name: 'New Game',
       description: 'Description',
       entryUrl: 'https://newgame.leagueoffun.de',
       icon: '/assets/newgame-icon.svg',
       tags: ['fun', 'party']
     }
   ];
   ```

## 🤝 Contributing

- Make changes in the appropriate app or package
- Run builds locally to verify: `npm run build`
- Open a PR with a clear description
- CI will run independent builds for affected apps

## 📄 License

MIT License - See LICENSE file for details
