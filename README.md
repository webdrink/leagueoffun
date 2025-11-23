# League of Fun 🎮

> A collection of digital party games designed to bring people together

Welcome to the League of Fun monorepo! This repository contains multiple interactive party games built on a shared, extensible React framework.

## 🎯 Games

### 🎲 BlameGame
**"Who would most likely...?"**
A party game for friends! One person reads a question, passes the phone, and the group decides: Who's to blame?

- 🎮 Two game modes: Classic & NameBlame
- 🌍 Multi-language support (English, German, Spanish, French)
- 📱 Mobile-first, optimized for group play
- [Play Now →](https://blamegame.leagueoffun.de)

### 🎵 HookHunt
**"Guess the hit from the hook!"**
Test your music knowledge by identifying songs from their iconic hooks. *(Coming Soon)*

- 🎶 Music guessing gameplay
- 🏆 Score tracking
- 🌟 Multiple difficulty levels

### 🏠 Game Picker Hub
The central hub for discovering and launching League of Fun games. Maintains player identity and stats across all games.

- 👤 Player ID management
- 📊 Cross-game statistics
- 🎮 Unified game launcher

## 🏗️ Monorepo Structure

```
.
├── games/
│   ├── blamegame/          # BlameGame application
│   ├── hookhunt/           # HookHunt application  
│   └── game-picker/        # Central hub
│
├── packages/
│   ├── framework-ui/       # Shared UI components
│   ├── game-core/          # Game logic primitives
│   └── shared-config/      # Shared configurations
│
└── .github/workflows/      # Independent CI/CD pipelines
```

[📖 Detailed Structure Documentation →](docs/monorepo-structure.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 10+ for local development (via `corepack enable pnpm` or manual install)
- npm 8+/workspaces (used automatically in CI/CD)

### Development

```bash
# Install all dependencies (local development)
pnpm install

# Run a specific game locally (pnpm auto-selects workspace)
pnpm run dev:blamegame
pnpm run dev:hookhunt  
pnpm run dev:game-picker

# Build all games locally
pnpm run build

# CI/CD continues to call the same scripts with npm
npm install && npm run build
```

### Package Manager Strategy

- **Local:** pnpm is the default; scripts route through `scripts/run-*-task.cjs` so pnpm is used automatically.
- **Remote/CI:** npm remains the execution environment. The helper scripts detect `CI=true` (or `USE_NPM=1`) and fall back to npm to keep pipelines stable.
- **Forcing npm locally:** run `USE_NPM=1 pnpm run build` (PowerShell: `$env:USE_NPM=1; pnpm run build`) to mimic CI behavior.

[📖 Full Documentation →](docs/monorepo-structure.md)

---

© 2025 League of Fun - Bringing people together through games
