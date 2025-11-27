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
- [Play Now →](https://hookhunt.leagueoffun.com)

### 🏠 Game Picker Hub
The central hub for discovering and launching League of Fun games. Maintains player identity and stats across all games.

- 👤 Player ID management
- 📊 Cross-game statistics
- 🎮 Unified game launcher
- [Visit Hub →](https://www.leagueoffun.com)

## 🏗️ Architecture

This monorepo contains all League of Fun games and shared packages. Deployment is handled by a unified GitHub Actions workflow that builds and deploys all apps automatically.

```
.
├── apps/
│   ├── gamepicker/         # Central hub / landing page
│   ├── blamegame/          # BlameGame application
│   └── hookhunt/           # HookHunt application  
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── game-core/          # Game logic primitives
│   └── config/             # Shared configurations
│
└── .github/workflows/
    └── deploy-all.yml      # Unified deployment workflow
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
pnpm run build:gamepicker
pnpm run build:blamegame
pnpm run build:hookhunt
```

## 🚀 Deployment

All three apps are deployed automatically from this monorepo using a single unified GitHub Actions workflow (`deploy-all.yml`).

### Deployment Targets

| App | Target | URL | Deployment Method |
|-----|--------|-----|-------------------|
| Gamepicker | `webdrink/leagueoffun` (GitHub Pages) | https://www.leagueoffun.com | GitHub Pages Actions |
| Blamegame | `webdrink/blamegame` | https://blamegame.leagueoffun.de | Push via PAT |
| HookHunt | `webdrink/HookHunt` | https://hookhunt.leagueoffun.com | Push via PAT |

### How Deployment Works

1. **Trigger**: The workflow runs on:
   - Push to `main` branch (when files in `apps/` or `packages/` change)
   - Manual trigger via `workflow_dispatch`

2. **Build Phase**: All three apps are built in parallel using pnpm

3. **Deploy Phase**: Each app is deployed to its target:
   - **Gamepicker**: Deployed to GitHub Pages in this repository using the official `actions/deploy-pages@v4` action
   - **Blamegame**: Built files are pushed to `webdrink/blamegame` repository
   - **HookHunt**: Built files are pushed to `webdrink/HookHunt` repository

4. **Idempotence**: The workflow only commits and pushes when there are actual changes (checked with `git diff --cached --quiet`)

### Required Secrets

The following secret must be configured in this repository:

| Secret | Description | Required Permissions |
|--------|-------------|---------------------|
| `DEPLOY_PAT` | Personal Access Token | `repo` write access to `webdrink/blamegame` and `webdrink/HookHunt` |

### Target Repository Structure

The external deploy repositories (`webdrink/blamegame` and `webdrink/HookHunt`) contain:
- Built static files (from `dist/`)
- `.nojekyll` (to disable Jekyll processing)
- `CNAME` (custom domain configuration - created automatically)
- `README.md` (preserved during deployments if present)

### Manual Deployment

To manually trigger a deployment:
1. Go to **Actions** tab in this repository
2. Select **"🚀 Deploy All Apps"** workflow
3. Click **"Run workflow"**
4. Select the `main` branch
5. Click **"Run workflow"** button

### Workflow Files

The deployment is managed by these workflow files:

- `.github/workflows/deploy-all.yml` - Main unified deployment workflow (builds and deploys all apps)

Legacy individual workflows exist but the unified workflow is the primary deployment method:
- `.github/workflows/deploy-gamepicker.yml` - Individual Gamepicker deployment
- `.github/workflows/deploy-blamegame.yml` - Individual Blamegame deployment
- `.github/workflows/deploy-hookhunt.yml` - Individual HookHunt deployment

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
