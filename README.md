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
- [Play Now →](https://blamegame.leagueoffun.com)

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
├── apps/
│   ├── blamegame/          # BlameGame application
│   ├── hookhunt/           # HookHunt application  
│   └── gamepicker/         # Central hub / landing page
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── game-core/          # Game logic primitives
│   └── config/             # Shared configurations
│
└── .github/workflows/      # Independent CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+ (via `npm install -g pnpm` or `corepack enable pnpm`)

### Development

```bash
# Install all dependencies
pnpm install

# Run a specific app locally
pnpm run dev:gamepicker  # Main landing page
pnpm run dev:blamegame   # BlameGame
pnpm run dev:hookhunt    # HookHunt

# Build all apps
pnpm run build

# Build a specific app
pnpm run build:blamegame
pnpm run build:hookhunt
pnpm run build:gamepicker
```

## 🚀 Deployment

Each game is deployed to its own hosting repository via GitHub Actions:

| App | Hosting Repository | URL |
|-----|-------------------|-----|
| BlameGame | `webdrink/blamegame-site` | https://blamegame.leagueoffun.com |
| HookHunt | `webdrink/hookhunt-site` | https://hookhunt.leagueoffun.com |
| Game Picker | `webdrink/leagueoffun-site` | https://leagueoffun.com |

### How Deployment Works

1. When code is pushed to `main`, the relevant workflow triggers based on changed files
2. The workflow builds the app using pnpm
3. The built files are pushed to the corresponding hosting repository
4. GitHub Pages serves the static files from the hosting repository

### Changing Target Hosting Repositories

Each deployment workflow has a `TARGET_REPO` environment variable at the top of the file:

```yaml
env:
  TARGET_REPO: webdrink/blamegame-site  # Change this to update deployment target
```

To change where an app deploys, simply update this variable in the workflow file.

### Required Secrets

- `DEPLOY_TOKEN`: A Personal Access Token with `repo` write access, used for pushing to hosting repositories

### Hosting Repository Structure

Each hosting repository is "dumb" and contains only:
- Built static files (from `dist/`)
- `.nojekyll` (to disable Jekyll processing)
- `CNAME` (for custom domain - manually configured)
- `README.md` (optional)

The `CNAME` file is preserved during deployments to maintain custom domain settings.

## 📦 Workspace Packages

### @leagueoffun/ui
Shared React components, layouts, and design system elements.

### @leagueoffun/game-core
Core game logic primitives, event bus, and persistence utilities.

### @leagueoffun/config
Shared TypeScript, ESLint, and Tailwind configurations.

## 🔧 Configuration

### TypeScript
All apps extend `tsconfig.base.json` from the root for consistent TypeScript configuration.

### Tailwind CSS
Shared Tailwind configuration in `packages/config/tailwind.config.js` with content paths for the monorepo structure.

---

© 2025 League of Fun - Bringing people together through games
