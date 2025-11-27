# Game Picker (League of Fun Hub)

Central hub for discovering and launching League of Fun games.

## Purpose

Game Picker serves as the main entry point for the League of Fun collection. It provides:
- Game discovery and browsing
- Player ID generation and management
- Cross-game player tracking
- Return flow handling with stats collection

## Features

- 👤 Player ID generation and persistence
- 🎮 Beautiful game cards with descriptions
- 📊 Cross-game statistics tracking
- 🔄 URL-based player flow to/from games
- 🎨 Gradient UI design

## Local Development

```bash
# From repository root
npm run dev:game-picker

# Or from this directory
npm run dev
```

Visit `http://localhost:999`

## Building

```bash
# From repository root
npm run build:game-picker

# Or from this directory
npm run build
```

Build output: `dist/`

## Project Structure

```
game-picker/
├── src/
│   ├── App.tsx              # Main hub component
│   ├── PlayerContext.tsx    # Player ID management
│   ├── games.config.ts      # Games registry
│   ├── main.tsx            # Entry point
│   └── index.css           # Styles
├── public/                  # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Games Registry

Games are configured in `src/games.config.ts`:

```typescript
export const games: GameInfo[] = [
  {
    id: 'blamegame',
    name: 'BlameGame',
    description: 'Who would most likely...?',
    entryUrl: 'https://blamegame.leagueoffun.de',
    icon: '/assets/blamegame-icon.svg',
    tags: ['party', 'friends']
  },
  // ...
];
```

## Player ID Flow

### Generating Player ID

On first visit, Game Picker generates a UUID and stores it:

```typescript
const playerId = generatePlayerId(); // From @game-core
localStorage.setItem('leagueoffun.playerId', playerId);
```

### Launching a Game

When user clicks "Play":

```typescript
const url = `${gameUrl}?playerId=${playerId}&returnUrl=${encodeURIComponent(hubUrl)}`;
window.location.href = url;
```

### Receiving Return

When games return:

```typescript
// Parse URL: ?playerId=...&gameId=...&score=...
const stats = { gameId, score, playedAt };
localStorage.setItem('leagueoffun.playerStats', JSON.stringify(stats));
```

## How to Modify

### Adding a New Game

1. Add game entry to `src/games.config.ts`:
   ```typescript
   {
     id: 'newgame',
     name: 'New Game',
     description: 'Game description',
     entryUrl: 'https://newgame.leagueoffun.de',
     icon: '/assets/newgame-icon.svg',
     tags: ['tag1', 'tag2']
   }
   ```

2. Add game icon to `public/assets/`

3. Game automatically appears in the hub

### Customizing UI

- Edit `src/App.tsx` for layout changes
- Modify Tailwind classes for styling
- Update `src/index.css` for global styles

### Modifying Player Flow

- **Player ID logic**: Edit `src/PlayerContext.tsx`
- **Stats collection**: Update return URL handling in PlayerContext
- **URL parameters**: Modify launch URL construction in App.tsx

### What NOT to Modify

- ❌ **DON'T**: Change localStorage keys (breaks compatibility)
- ❌ **DON'T**: Modify Player ID format (breaks game integration)
- ❌ **DON'T**: Remove return URL functionality
- ❌ **DON'T**: Change URL parameter names

## Dependencies

### External
- React 19 - UI framework
- Framer Motion - Animations
- Lucide React - Icons
- Tailwind CSS - Styling

### Internal
- `@game-core` - Player ID utilities

## Deployment

Deployment is managed centrally from the monorepo root using a unified GitHub Actions workflow.

**Live URL:** https://www.leagueoffun.com

### How It Works

1. The unified workflow at `.github/workflows/deploy-all.yml` builds and deploys all apps
2. Gamepicker is deployed to GitHub Pages in the `webdrink/leagueoffun` repository
3. Deployment triggers on:
   - Push to `main` branch (when `apps/gamepicker/**` or `packages/**` change)
   - Manual trigger via `workflow_dispatch`

### Manual Deployment

To manually trigger a deployment, go to the **Actions** tab in the monorepo root, select **"🚀 Deploy All Apps"** workflow, and click **"Run workflow"**.

For more details, see the [main README](../../README.md#-deployment).

## URLs

- **Production**: https://www.leagueoffun.com
- **Local Dev**: http://localhost:999

## Key Components

- `App.tsx` - Main hub UI with game cards
- `PlayerContext.tsx` - Player ID management and stats
- `games.config.ts` - Games registry

## LocalStorage Keys

- `leagueoffun.playerId` - Player's UUID
- `leagueoffun.playerStats` - Array of game stats

## Testing

Test player flow locally:
1. Launch hub: `npm run dev:game-picker`
2. Launch game: `npm run dev:blamegame`
3. Manually construct URLs with params
4. Verify stats collection

## Need Help?

- Main docs: `docs/` in repository root
- Player flow: `docs/monorepo-structure.md`
