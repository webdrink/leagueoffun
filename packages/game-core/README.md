# Game Core

Core game logic, utilities, and primitives shared across all League of Fun games.

## Purpose

Provides fundamental game functionality and utilities that are game-agnostic. This includes player management, event systems, state management primitives, and configuration schemas.

## Contents

### Event System
- `EventBus` - Pub/sub event system
- `GameEvent` - Event type definitions

### Player Management
- `PlayerId` type
- `generatePlayerId()` - UUID generation
- `GameSession` interface
- `GameScore` interface

### Game Primitives
- Module system
- Phase controllers
- Dispatcher
- Actions

### Persistence
- Storage utilities
- LocalStorage helpers
- Storage keys

### Configuration
- Game config schemas (Zod)
- Config discovery
- URL parameter parsing

## Usage

### Player ID Management

```typescript
import { generatePlayerId, PlayerId, GameSession } from '@game-core';

// Generate a new player ID
const playerId: PlayerId = generatePlayerId();

// Create a game session
const session: GameSession = {
  gameId: 'blamegame',
  playerId: playerId,
  startedAt: new Date().toISOString(),
  stats: { score: 42 }
};
```

### Event System

```typescript
import { createEventBus } from '@game-core/events';

const eventBus = createEventBus();

// Subscribe to events
eventBus.on('game:start', (data) => {
  console.log('Game started', data);
});

// Emit events
eventBus.emit('game:start', { playerId: '123' });
```

### Persistence

```typescript
import { storageGet, storageSet, STORAGE_KEYS } from '@game-core/persistence';

// Store data
storageSet(STORAGE_KEYS.PLAYER_ID, playerId);

// Retrieve data
const playerId = storageGet(STORAGE_KEYS.PLAYER_ID);
```

## Structure

```
game-core/
├── src/
│   ├── events/
│   │   └── eventBus.ts       # Event system
│   ├── persistence/
│   │   └── storage.ts        # Storage utilities
│   ├── config/
│   │   ├── game.schema.ts    # Config schemas
│   │   └── discovery/        # Config discovery
│   ├── utils/
│   │   └── url.ts           # URL utilities
│   ├── modules.ts           # Module system
│   ├── phases.ts            # Phase controllers
│   ├── dispatcher.ts        # Dispatcher
│   ├── actions.ts           # Action creators
│   └── index.ts             # Main exports
└── package.json
```

## How to Modify

### Adding New Utilities

1. Create utility file:
   ```typescript
   // src/utils/newUtil.ts
   export function newUtility(input: string): string {
     return input.toUpperCase();
   }
   ```

2. Export from index:
   ```typescript
   // src/index.ts
   export { newUtility } from './utils/newUtil';
   ```

3. Test in games:
   ```typescript
   import { newUtility } from '@game-core/utils';
   ```

### Adding Types

```typescript
// src/index.ts
export type NewGameType = {
  id: string;
  name: string;
};

export interface NewInterface {
  value: number;
  label: string;
}
```

### Modifying Existing Code

- ✅ **DO**: Keep functions pure and testable
- ✅ **DO**: Maintain backward compatibility
- ✅ **DO**: Update TypeScript types
- ✅ **DO**: Test across all games
- ⚠️ **CAUTION**: Changes affect all games
- ❌ **DON'T**: Add UI-related code
- ❌ **DON'T**: Add game-specific logic

## TypeScript Types

### Core Types

```typescript
// Player types
export type PlayerId = string;
export type GameId = string;

// Session types
export interface GameSession {
  gameId: GameId;
  playerId: PlayerId;
  startedAt: string;
  endedAt?: string;
  stats?: Record<string, unknown>;
}

// Score types
export interface GameScore {
  gameId: GameId;
  score: number;
  meta?: Record<string, unknown>;
}
```

## Dependencies

### Peer Dependencies
- React (for some utilities)
- Zod (for schemas)

## What Belongs Here

### ✅ DO Include

- Player ID management
- Event systems
- Storage utilities
- Type definitions
- Game state primitives
- Configuration schemas
- Pure utility functions

### ❌ DON'T Include

- UI components (use `framework-ui`)
- Game-specific rules
- React components
- Styling/themes
- Build configurations

## Event System

The event bus provides pub/sub functionality:

```typescript
interface EventBus {
  on<T>(event: string, handler: (data: T) => void): void;
  off<T>(event: string, handler: (data: T) => void): void;
  emit<T>(event: string, data: T): void;
}
```

## Storage Utilities

Helpers for localStorage management:

```typescript
// Get with type safety
const value = storageGet<string>('key');

// Set with namespace
storageSet('user.preference', value);

// Remove
storageRemove('key');

// Clear namespace
storageClearNamespace('user');
```

## Configuration

Zod schemas for game configuration:

```typescript
import { GameConfig } from '@game-core/config';

const config: GameConfig = {
  gameId: 'blamegame',
  name: 'BlameGame',
  // ...
};
```

## What NOT to Modify

- ❌ **DON'T**: Add UI dependencies
- ❌ **DON'T**: Import from games
- ❌ **DON'T**: Add build-specific code
- ❌ **DON'T**: Break existing APIs

## Testing

Test utilities by:
1. Unit testing pure functions
2. Integration testing in games
3. Building all games: `npm run build`
4. TypeScript checking: `npm run typecheck`

## Examples

See usage in:
- `games/game-picker/src/PlayerContext.tsx`
- `games/blamegame/hooks/usePlayerId.ts`
- Game event handling throughout apps

## Need Help?

- Type definitions: Check `src/index.ts`
- Event usage: See game implementations
- Storage patterns: Review game code
