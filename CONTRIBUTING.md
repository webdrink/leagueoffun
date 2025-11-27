# Contributing to League of Fun

Thank you for your interest in contributing to League of Fun! This document provides guidelines for contributing to the project.

## 🏗️ Project Structure

This is a pnpm monorepo containing multiple party games and shared packages:

```
.
├── apps/
│   ├── gamepicker/     # Main hub at www.leagueoffun.com
│   ├── blamegame/      # BlameGame at blamegame.leagueoffun.de
│   └── hookhunt/       # HookHunt at hookhunt.leagueoffun.com
│
├── packages/
│   ├── ui/             # Shared UI components
│   ├── game-core/      # Core game logic and utilities
│   └── config/         # Shared configurations
│
└── .github/workflows/  # CI/CD pipelines
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm` or `corepack enable pnpm`)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/webdrink/leagueoffun.git
cd leagueoffun

# Install dependencies
pnpm install

# Start development servers
pnpm run dev:gamepicker  # Port 9990
pnpm run dev:blamegame   # Port 9991
pnpm run dev:hookhunt    # Port 9992
```

## 📝 Code Style

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over `any`
- Use path aliases for imports (`@game-core`, `@ui`, etc.)

### React

- Prefer functional components with hooks
- Use `framer-motion` for animations
- Respect user's `prefers-reduced-motion` preference

### CSS

- Use Tailwind CSS for styling
- Follow the design system colors and spacing
- Ensure responsive design (mobile-first)

## 🎮 Adding a New Game

1. **Create the app folder:**
   ```bash
   mkdir -p apps/your-game
   ```

2. **Copy base structure from existing game** (recommend HookHunt as template)

3. **Update configurations:**
   - `package.json` with name `@leagueoffun/your-game`
   - `vite.config.ts` with correct aliases and port
   - `tsconfig.json` with correct path aliases

4. **Add to root `package.json` scripts:**
   ```json
   {
     "dev:yourgame": "pnpm --filter @leagueoffun/your-game dev",
     "build:yourgame": "pnpm --filter @leagueoffun/your-game build"
   }
   ```

5. **Create deployment workflow** in `.github/workflows/deploy-yourgame.yml`

6. **Add to Game Picker** in `apps/gamepicker/src/games.config.ts`

## 🔄 Branch Strategy

- `main` - Production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Use pull requests for all changes

## ✅ Before Submitting

Run these checks before creating a PR:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build all apps
pnpm build
```

## 📦 Deployment

Deployments are automatic via GitHub Actions when merging to `main`:

| App | URL | Trigger |
|-----|-----|---------|
| Game Picker | www.leagueoffun.com | Changes in `apps/gamepicker/` |
| BlameGame | blamegame.leagueoffun.de | Changes in `apps/blamegame/` |
| HookHunt | hookhunt.leagueoffun.com | Changes in `apps/hookhunt/` |

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Questions? Open an issue or reach out to the maintainers!
