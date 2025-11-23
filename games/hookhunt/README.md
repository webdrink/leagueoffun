# HookHunt

**"Guess the hit from the hook!"**

A music guessing game where players identify songs from their iconic hooks. (Coming Soon)

## Purpose

HookHunt is a music-based party game that tests players' ability to recognize popular songs from short audio clips (the "hook"). Players compete to identify songs quickly and accurately.

## Current Status

🚧 **Under Development** - Skeleton application with "coming soon" screen

## Planned Features

- 🎶 Music guessing gameplay
- 🏆 Score tracking and leaderboards
- 🎵 Multiple music genres/categories
- 🌟 Difficulty levels
- 👤 Player ID integration
- 🎨 Blue/purple music-themed UI

## Local Development

```bash
# From repository root
npm run dev:hookhunt

# Or from this directory
npm run dev
```

Visit `http://localhost:5173`

## Building

```bash
# From repository root
npm run build:hookhunt

# Or from this directory
npm run build
```

Build output: `dist/`

## Project Structure

```
hookhunt/
├── src/
│   ├── App.tsx          # Main app (currently "coming soon")
│   ├── main.tsx         # Entry point
│   └── index.css        # Styles
├── public/              # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Player ID Integration

Already implemented and ready:

```typescript
// Read player ID from URL
const params = new URLSearchParams(window.location.search);
const playerId = params.get('playerId');
const returnUrl = params.get('returnUrl');

// Store locally
localStorage.setItem('hookhunt.playerId', playerId);

// Return to hub when done
const url = new URL(decodeURIComponent(returnUrl));
url.searchParams.set('playerId', playerId);
url.searchParams.set('gameId', 'hookhunt');
url.searchParams.set('score', score.toString());
window.location.href = url.toString();
```

## How to Modify

### Developing the Game

This is a skeleton for building the actual game. You can:

1. **Replace "Coming Soon" Screen**:
   - Edit `src/App.tsx`
   - Add game logic and components
   - Keep player ID integration intact

2. **Add Game Components**:
   ```
   src/
   ├── components/
   │   ├── GameScreen.tsx
   │   ├── ScoreBoard.tsx
   │   └── MusicPlayer.tsx
   └── hooks/
       ├── useAudio.ts
       └── useGame.ts
   ```

3. **Use Shared Framework**:
   ```typescript
   import { GameShell, Button } from '@framework-ui/components';
   import { usePlayerId } from '@game-core';
   ```

### Adding Music/Audio

- Add audio files to `public/audio/`
- Create audio management hooks
- Implement music playback logic

### Styling

- Current theme: Blue/purple gradient
- Edit `src/index.css` and component styles
- Use Tailwind CSS classes

### What NOT to Modify

- ❌ **DON'T**: Remove player ID integration
- ❌ **DON'T**: Change return URL handling
- ❌ **DON'T**: Break build configuration

## Theme

HookHunt uses a music-inspired blue/purple color palette:
- Primary: Blue to purple gradient
- Accent: Blue-600
- Design: Modern, energetic

## Dependencies

### External
- React 19 - UI framework
- Framer Motion - Animations
- Lucide React - Icons
- Tailwind CSS - Styling

### Internal
- Will use `@framework-ui/*` for components
- Will use `@game-core/*` for utilities

## Deployment

Automatic deployment via GitHub Actions:
- Triggers on changes to `games/hookhunt/**`
- Builds and uploads artifacts
- Independent of other games

## URLs

- **Game**: https://hookhunt.leagueoffun.de
- **Local Dev**: http://localhost:5173

## Development Roadmap

1. ✅ Skeleton setup with player ID
2. ⏳ Game logic and state management
3. ⏳ Audio playback system
4. ⏳ Score tracking
5. ⏳ Music library integration
6. ⏳ UI/UX polish
7. ⏳ Testing

## Key Files (When Built)

- `src/App.tsx` - Main game component
- `src/hooks/useGame.ts` - Game logic
- `src/hooks/useAudio.ts` - Music playback
- `src/components/GameScreen.tsx` - Main game UI

## Testing

Currently shows placeholder UI. Future testing:
- Game flow testing
- Audio playback testing
- Score calculation
- Player ID flow

## Need Help?

- Main docs: `docs/` in repository root
- Framework components: `packages/framework-ui/`
- Game utilities: `packages/game-core/`
- Skeleton reference: This is the template!
