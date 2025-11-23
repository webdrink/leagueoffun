# Games Directory

This directory contains all game applications in the League of Fun monorepo.

## Purpose

The `games/` directory hosts individual game applications that are independently deployable. Each game is a complete application with its own build configuration, dependencies, and deployment pipeline.

## Contents

### Current Games

- **[blamegame/](./blamegame/README.md)** - "Who would most likely...?" party game
- **[hookhunt/](./hookhunt/README.md)** - Music guessing game (coming soon)
- **[game-picker/](./game-picker/README.md)** - Central hub for game discovery and player management

## Structure

Each game follows this structure:

```
games/
├── game-name/
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration
│   ├── vite.config.ts    # Build configuration
│   └── README.md         # Game-specific documentation
```

## How to Use

### Running a Game Locally

```bash
# From repository root
npm run dev:blamegame
npm run dev:hookhunt
npm run dev:game-picker
```

### Building a Game

```bash
# From repository root
npm run build:blamegame
npm run build:hookhunt
npm run build:game-picker
```

### Adding a New Game

1. Copy an existing game as a template:
   ```bash
   cp -r games/hookhunt games/newgame
   ```

2. Update `package.json` with the new game name

3. Add build and dev scripts to root `package.json`:
   ```json
   "dev:newgame": "cd games/newgame && npm run dev",
   "build:newgame": "cd games/newgame && npm run build"
   ```

4. Create a new GitHub Actions workflow:
   ```yaml
   # .github/workflows/deploy-newgame.yml
   on:
     push:
       paths:
         - 'games/newgame/**'
         - 'packages/**'
   ```

5. Register the game in `games/game-picker/src/games.config.ts`

## How to Modify

### Adding Features to a Game

- ✅ **DO**: Modify files within the specific game directory
- ✅ **DO**: Update that game's dependencies in its `package.json`
- ✅ **DO**: Follow the game's existing code structure and patterns
- ✅ **DO**: Test your changes locally before committing

### Sharing Code Between Games

- ❌ **DON'T**: Copy-paste code between games
- ✅ **DO**: Extract shared code to `packages/` directory
- ✅ **DO**: Use shared components from `@framework-ui/*`
- ✅ **DO**: Use shared utilities from `@game-core/*`

### Build Configuration

- ⚠️ **CAUTION**: Changing build configs affects deployments
- ✅ **DO**: Test builds locally after changes: `npm run build:gamename`
- ✅ **DO**: Update TypeScript paths if adding new aliases
- ❌ **DON'T**: Change base configurations without testing all games

## Independent Deployments

Each game has its own CI/CD pipeline:

- **Failure Isolation**: A failing build in one game doesn't block others
- **Path Triggers**: Only rebuilds when game-specific files change
- **Artifact Uploads**: Each game produces separate deployment artifacts

## TypeScript Path Aliases

All games use these path aliases for clean imports:

```typescript
import { Button } from '@framework-ui/components';
import { generatePlayerId } from '@game-core';
import { baseConfig } from '@shared-config';
```

Configured in each game's `tsconfig.json` and `vite.config.ts`.

## Best Practices

1. **Keep Games Independent**: Avoid direct dependencies between games
2. **Use Shared Packages**: Extract common code to `packages/`
3. **Document Changes**: Update game-specific README when adding features
4. **Test Thoroughly**: Build and test locally before pushing
5. **Follow Conventions**: Match existing code style and structure

## Need Help?

- See individual game READMEs for game-specific documentation
- Check `docs/monorepo-structure.md` for overall architecture
- Review `packages/` for available shared components
