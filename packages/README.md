# Packages Directory

This directory contains shared packages used across all games in the League of Fun monorepo.

## Purpose

The `packages/` directory hosts reusable code libraries that provide common functionality to all game applications. This promotes code reuse, consistency, and maintainability across the entire collection.

## Contents

### Shared Packages

- **[framework-ui/](./framework-ui/README.md)** - Reusable UI components, layouts, and screens
- **[game-core/](./game-core/README.md)** - Core game logic, events, and player utilities
- **[shared-config/](./shared-config/README.md)** - Base configurations for TypeScript, Tailwind, etc.

## Structure

Each package follows this structure:

```
packages/
├── package-name/
│   ├── src/              # Package source code
│   ├── package.json      # Package metadata and dependencies
│   └── README.md         # Package documentation
```

## How to Use

### Importing from Packages

All games can import from shared packages using TypeScript path aliases:

```typescript
// Import UI components
import { Button, Card, GameShell } from '@framework-ui/components';
import { FrameworkRouter } from '@framework-ui';

// Import game utilities
import { generatePlayerId, GameSession } from '@game-core';
import { EventBus } from '@game-core/events';

// Import configurations
import baseConfig from '@shared-config/tsconfig.base.json';
```

### Package Dependencies

Packages are linked via npm workspaces:

```json
// In a game's package.json
{
  "dependencies": {
    "@leagueoffun/framework-ui": "*",
    "@leagueoffun/game-core": "*"
  }
}
```

## How to Modify

### Adding New Components/Utilities

1. **Choose the Right Package**:
   - UI components → `framework-ui/`
   - Game logic/utilities → `game-core/`
   - Build configurations → `shared-config/`

2. **Follow Package Structure**:
   ```typescript
   // packages/framework-ui/src/components/NewComponent.tsx
   export function NewComponent() { ... }
   
   // packages/framework-ui/src/components/index.ts
   export { NewComponent } from './NewComponent';
   ```

3. **Export from Package Index**:
   ```typescript
   // packages/framework-ui/src/index.ts
   export * from './components';
   ```

4. **Test in Multiple Games**:
   ```bash
   npm run build:blamegame
   npm run build:hookhunt
   npm run build:game-picker
   ```

### Modifying Existing Code

- ✅ **DO**: Test changes across all games
- ✅ **DO**: Maintain backward compatibility
- ✅ **DO**: Update package documentation
- ✅ **DO**: Consider impact on all consumers
- ⚠️ **CAUTION**: Breaking changes affect all games
- ❌ **DON'T**: Make game-specific changes in shared packages

### Adding New Packages

1. Create package directory:
   ```bash
   mkdir -p packages/new-package/src
   ```

2. Create `package.json`:
   ```json
   {
     "name": "@leagueoffun/new-package",
     "version": "0.1.0",
     "private": true,
     "main": "./src/index.ts",
     "peerDependencies": {
       "react": "^19.1.0"
     }
   }
   ```

3. Create `src/index.ts` to export package contents

4. Update games' `tsconfig.json` and `vite.config.ts` with new alias

5. Add to games' `package.json` dependencies

## Package Guidelines

### framework-ui

**Purpose**: Reusable UI components and layouts

**What belongs here**:
- ✅ Buttons, cards, forms, modals
- ✅ Layout components (GameShell, headers, footers)
- ✅ Common screens (intro, setup, summary)
- ✅ Animation components
- ✅ Theme-aware components

**What doesn't belong**:
- ❌ Game-specific logic
- ❌ Non-UI utilities
- ❌ Game content (questions, data)

### game-core

**Purpose**: Core game logic and utilities

**What belongs here**:
- ✅ Event system
- ✅ Player ID management
- ✅ Game session types
- ✅ Persistence utilities
- ✅ Configuration schemas
- ✅ Game state management primitives

**What doesn't belong**:
- ❌ UI components
- ❌ Game-specific rules
- ❌ Build configurations

### shared-config

**Purpose**: Base configurations

**What belongs here**:
- ✅ Base TypeScript config
- ✅ Shared Tailwind config
- ✅ PostCSS config
- ✅ ESLint/Prettier configs
- ✅ Theme tokens

**What doesn't belong**:
- ❌ Game-specific configs
- ❌ Runtime code
- ❌ Components or utilities

## TypeScript Configuration

Packages are referenced via path aliases configured in each game:

```json
// games/*/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@framework-ui/*": ["../../packages/framework-ui/src/*"],
      "@game-core/*": ["../../packages/game-core/src/*"],
      "@shared-config/*": ["../../packages/shared-config/*"]
    }
  }
}
```

## Best Practices

1. **Keep Packages Generic**: No game-specific code
2. **Maintain Compatibility**: Don't break existing APIs
3. **Document Exports**: Clear documentation for all public APIs
4. **Test Thoroughly**: Verify changes work in all games
5. **Version Carefully**: Consider impact before major changes
6. **Export Clearly**: Use clear, consistent export patterns

## Peer Dependencies

Packages use peer dependencies to avoid version conflicts:

```json
{
  "peerDependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

Games are responsible for providing these dependencies.

## When to Create a New Package

Create a new package when:
- ✅ Code is used by 2+ games
- ✅ Code has clear, focused purpose
- ✅ Code benefits from independent versioning
- ✅ Code doesn't fit existing packages

Don't create a new package when:
- ❌ Code is game-specific
- ❌ Code is used by only one game
- ❌ Code fits well in existing package

## Need Help?

- See individual package READMEs for detailed documentation
- Check `docs/monorepo-structure.md` for architecture overview
- Review existing packages for patterns and examples
