# BlameGame

**"Who would most likely...?"**

A party game for friends! One person reads a question, passes the phone, and the group decides: Who's to blame?

## Purpose

BlameGame is a social party game designed to spark conversations and laughter among friends. Players answer "who would most likely" questions about each other, creating funny and revealing moments.

## Game Modes

### Classic Mode
- Jump straight into random questions
- Quick setup, instant fun
- No player names required

### NameBlame Mode
- Add friends' names for personalized questions
- Questions reference specific players
- Requires 3+ players

## Features

- 🎯 Two game modes (Classic & NameBlame)
- 📱 Mobile-first design for phone passing
- 🌍 Multi-language support (EN, DE, ES, FR)
- ⚙️ Customizable categories and question count
- 🎨 Orange/warm themed UI
- 📱 PWA support for offline play
- 🎵 Optional sound effects

## Local Development

```bash
# From repository root
npm run dev:blamegame

# Or from this directory
npm run dev
```

Visit `http://localhost:999`

## Building

```bash
# From repository root
npm run build:blamegame

# Or from this directory
npm run build
```

Build output: `dist/`

## Project Structure

```
blamegame/
├── assets/           # Audio files, images
├── components/       # React components
│   ├── game/        # Game-specific components
│   ├── settings/    # Settings screens
│   ├── debug/       # Debug tools
│   └── ...
├── framework/        # Local framework code (being migrated)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── providers/       # React context providers
├── store/           # Zustand state stores
├── tests/           # Playwright tests
├── theme/           # Theme configuration
├── App.tsx          # Main app component
└── index.tsx        # Entry point
```

## Configuration

Game behavior is controlled via:
- `game.json` - Game metadata
- `constants.ts` - Game constants
- `theme/blamegameTheme.ts` - Theme configuration

## Player ID Integration

BlameGame supports cross-game player tracking:

```typescript
import { usePlayerId, returnToHub } from './hooks/usePlayerId';

const { playerId, returnUrl } = usePlayerId();

// When game ends
if (returnUrl) {
  returnToHub(returnUrl, playerId, finalScore);
}
```

## How to Modify

### Adding Questions

Questions are loaded from CSV files in the questions directory. See documentation for format.

### Changing Theme

Edit `theme/blamegameTheme.ts`:

```typescript
export const blamegameTheme = {
  primaryGradient: { /* orange gradient */ },
  accent: { /* orange colors */ },
  // ...
};
```

### Adding Features

- ✅ **DO**: Follow existing component patterns
- ✅ **DO**: Use TypeScript for type safety
- ✅ **DO**: Test with both game modes
- ✅ **DO**: Update tests if needed
- ✅ **DO**: Use shared components from `@framework-ui/*`

### What NOT to Modify

- ❌ **DON'T**: Change `framework/` (being migrated to packages)
- ❌ **DON'T**: Modify core game flow without discussion
- ❌ **DON'T**: Break PWA functionality
- ❌ **DON'T**: Remove existing game modes

## Testing

```bash
# From repository root
npm run test

# Specific test suites
npm run test:classic
npm run test:nameblame
npm run test:components
```

## Deployment

Automatic deployment via GitHub Actions:
- Triggers on changes to `games/blamegame/**`
- Builds and uploads artifacts
- Independent of other games

## Dependencies

### External Dependencies
- React 19 - UI framework
- Framer Motion - Animations
- i18next - Internationalization
- Zustand - State management
- Tailwind CSS - Styling

### Internal Dependencies
- Uses local `framework/` code (to be migrated)
- Will use `@framework-ui/*` and `@game-core/*` packages

## Key Files

- `App.tsx` - Main game logic and state
- `components/game/IntroScreen.tsx` - Home screen
- `components/game/QuestionScreen.tsx` - Question display
- `components/game/PlayerSetupScreen.tsx` - NameBlame setup
- `hooks/useQuestions.ts` - Question management
- `hooks/usePlayerId.ts` - Player ID tracking

## Theme

BlameGame uses a warm orange/autumn color palette:
- Primary: Orange gradient (`from-orange-500 to-orange-700`)
- Accent: Orange-600
- Surface: White cards with shadows

## Internationalization

Translations in `public/locales/*/`:
- English (`en/`)
- German (`de/`)
- Spanish (`es/`)
- French (`fr/`)

## PWA Features

- Offline gameplay
- Install to home screen
- Service worker for caching
- Manifest configuration

## Need Help?

- Main docs: `docs/` in repository root
- Framework docs: `games/blamegame/docs/`
- Architecture: `docs/architecture/`
- Testing guide: `docs/guides/testing.md`

## Live URL

[https://blamegame.leagueoffun.de](https://blamegame.leagueoffun.de)
