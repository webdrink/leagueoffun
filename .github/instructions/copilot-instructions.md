# League of Fun AI Coding Agent Instructions

## Project Overview

League of Fun is a monorepo containing multiple React-based party games. It includes:
- **Gamepicker**: Central hub for discovering and launching games (https://www.leagueoffun.com)
- **BlameGame**: A "who would most likely" party game (https://blamegame.leagueoffun.com)
- **HookHunt**: A music guessing game (https://hookhunt.leagueoffun.com)

All apps are built with React 19, TypeScript, Vite, Tailwind CSS, and Framer Motion with comprehensive multilingual support and PWA capabilities.

## Monorepo Structure

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

## Deployment System

### Unified Deployment Workflow

All three apps are deployed using a single unified GitHub Actions workflow (`.github/workflows/deploy-all.yml`). 

**Deployment Targets:**
| App | Target Repository | URL | Method |
|-----|-------------------|-----|--------|
| Gamepicker | `webdrink/leagueoffun` (GitHub Pages) | https://www.leagueoffun.com | GitHub Pages Actions |
| Blamegame | `webdrink/blamegame` | https://blamegame.leagueoffun.com | Push via PAT |
| HookHunt | `webdrink/HookHunt` | https://hookhunt.leagueoffun.com | Push via PAT |

**Workflow Triggers:**
- Push to `main` branch (when files in `apps/` or `packages/` change)
- Manual trigger via `workflow_dispatch`

**Required Secrets:**
- `DEPLOY_PAT`: Personal Access Token with `repo` write access to `webdrink/blamegame` and `webdrink/HookHunt`

### Adding a New Game

To add a new game to the monorepo and deployment pipeline:

1. **Create the app**: Add a new app in `apps/newgame/` following the existing structure
2. **Add package.json**: Include `@leagueoffun/newgame` as the name
3. **Add root scripts**: Update the root `package.json`:
   ```json
   "dev:newgame": "pnpm --filter @leagueoffun/newgame dev",
   "build:newgame": "pnpm --filter @leagueoffun/newgame build"
   ```
4. **Update workflow**: Add new build and deploy jobs to `.github/workflows/deploy-all.yml`:
   - Add a build step for the new app
   - Add artifact upload step
   - Add a deploy job following the pattern of existing apps
5. **Create deploy repo**: Create a new GitHub repository (e.g., `webdrink/newgame`)
6. **Configure CNAME**: The workflow will automatically create the CNAME file with the custom domain
7. **Update PAT**: Ensure `DEPLOY_PAT` has write access to the new deploy repo

### Important Rules for Deployment

- **DO NOT** push built artifacts manually to deploy repositories
- **DO NOT** modify files directly in `webdrink/blamegame` or `webdrink/HookHunt`
- All deployments must go through the unified workflow in the monorepo
- The workflow is idempotent - it only commits when there are actual changes

---

## BlameGame Specific Instructions

BlameGame is a React-based party game application with two game modes: Classic (team-based) and NameBlame (player-specific blaming).

## Architecture & Data Flow

### Core State Management
- **Zustand Store** (`store/BlameGameStore.ts`): Game-specific state for NameBlame mode progression
- **Custom Hooks Pattern**: Business logic encapsulated in dedicated hooks (`hooks/` directory)
- **React Context**: Minimal usage - most state handled via hooks + local storage persistence

### Question Loading System
Questions are loaded from language-specific JSON files in `/public/questions/{lang}/`. The system:
- Loads categories from central `categories.json` with emoji + translations
- Fetches questions from language folders with fallback mechanisms  
- Uses `lib/utils/questionLoaders.ts` with retry logic and proper asset path handling
- Supports both random and manual category selection via `GameSettings.selectCategories`

### Component Architecture
```
components/
├── core/           # Reusable UI (Button, Card, Modal, etc.)
├── game/           # Game screens (IntroScreen, QuestionScreen, etc.)
├── debug/          # Development tools (DebugPanel, AssetDebugInfo)
├── language/       # Language selection and feedback
└── settings/       # Settings-related components
```

## Critical Development Patterns

### 1. Game Flow Management
App.tsx orchestrates game steps via `gameStep` state:
```typescript
type GameStep = 'intro' | 'playerSetup' | 'categoryPick' | 'loading' | 'game' | 'summary'
```
- Each step renders different screen components
- Loading screen shows animated card stack with rotating quotes
- NameBlame mode requires ≥3 players, triggers `playerSetup` step

### 2. NameBlame vs Classic Mode
**Critical difference in blame handling:**
```typescript
// Classic: immediate advancement after blame selection
if (gameSettings.gameMode === 'classic') {
  advanceToNextPlayer();
}

// NameBlame: shows notification, transitions to 'reveal' phase
if (gameSettings.gameMode === 'nameBlame') {
  showNotification(blamer, blamed, question);
  updateBlameState({ phase: 'reveal' });
  // Player must click "Next Blame" to continue
}
```

### 3. Asset Path Handling
**CRITICAL**: Use `getAssetsPath()` from `lib/utils/assetUtils.ts` for all asset references:
```typescript
// WRONG: Direct paths break in production
const audioPath = '/sounds/new_question.mp3';

// CORRECT: Use asset utility
const audioPath = getAssetsPath('sounds/new_question.mp3');
```

### 4. Translation System
- **i18next** for UI translations with automatic language detection
- **Auto-translation script**: `npm run translate` uses OpenAI to generate missing translations
- **Question content**: Stored in language-specific folders, loaded via `useQuestions` hook
- Always use translation keys: `t('intro.start_button')` not hardcoded strings

## Development Workflows

### Essential Build Commands
```bash
# Development with network access
npm run dev

# Production build for custom domain (critical for GitHub Pages)
npm run build:windows-domain    # Windows
npm run build:domain           # Linux/macOS
```

### Testing Strategy
Playwright tests organized by concern:
- `tests/foundation/` - Core app initialization
- `tests/flows/classic-mode/` - Classic game flow
- `tests/flows/nameblame-mode/` - NameBlame specific flows  
- `tests/components/` - Individual component tests
- `tests/edge-cases/` - Error states and edge cases

Run specific test suites: `npm run test:nameblame`, `npm run test:classic`

### Translation Management
```bash
npm run translate:check      # Validate translations without changes
npm run translate:dry-run    # Preview translation changes
npm run translate           # Auto-translate missing keys
npm run translate:recover   # Restore from backup if needed
```

## Component Development Guidelines

### 1. Hook-First Architecture
Encapsulate business logic in custom hooks:
```typescript
// Extract stateful logic to hooks
const { gameSettings, updateGameSettings } = useGameSettings();
const { currentQuestion, advanceToNextQuestion } = useQuestions(gameSettings);
```

### 2. Animation Patterns
Use Framer Motion with consistent patterns:
```typescript
// Page transitions use AnimatePresence with mode="wait"
<AnimatePresence mode="wait">
  {gameStep === 'intro' && <IntroScreen key="intro" />}
</AnimatePresence>

// Component animations follow established spring configs
const springConfig = {
  stiffness: gameSettings.introSpringStiffness,
  damping: gameSettings.introSpringDamping
};
```

### 3. Error Handling Strategy
- **Network failures**: Retry with exponential backoff in `fetchUtils.ts`
- **Missing questions**: Fallback to `FALLBACK_QUESTIONS` constant
- **User-facing errors**: Set error state, show in UI with translation keys
- **Development errors**: Log to console with context

## Key Gotchas & Anti-Patterns

### ❌ Don't Do This
```typescript
// Never hardcode asset paths
const imageSrc = '/assets/images/logo.png';

// Avoid direct DOM manipulation
document.getElementById('game-container').style.display = 'none';

// Don't bypass the translation system
const buttonText = 'Start Game';
```

### ✅ Do This Instead
```typescript
// Use asset utilities
const imageSrc = getAssetsPath('assets/images/logo.png');

// Use React state and conditional rendering
const [showContainer, setShowContainer] = useState(true);

// Always use translations
const buttonText = t('intro.start_button');
```

### Debugging Tools
- **Debug Panel**: Click 'D' button (bottom-right) for live game state inspection
- **Window Globals**: `window.gameQuestions`, `window.gameCategories` exposed in development
- **Blame Store**: `window.blameGameStore` for testing NameBlame flows

## Integration Points

### PWA Configuration
- Service worker handles offline caching via `vite-plugin-pwa`
- Manifest in `/public/manifest.json` with app icons and metadata
- Install prompts handled automatically by browser

### Asset Pipeline
- **Static assets**: `/public/` directory (sounds, images, question JSON)
- **Icons**: Lucide React for UI icons, custom SVGs for game-specific graphics  
- **Sounds**: MP3 files triggered via `useSound` hook with volume controls
  - Currently not really in place, but already in place for future use

When modifying existing code, always check for related hook dependencies and ensure proper error boundaries. Follow the established patterns rather than introducing new architectural approaches.

## 🚫 Behavioral Guardrails

**Copilot is not allowed to:**
- Discontinue work on any task after a first failure — **it must try at least five distinct approaches** before marking a task as blocked or unresolved.
- Alter the application's **design, UX, or core logic flow** unless explicitly allowed via a written note in a plan file or issue description.
- Unless requested to, do NOT alter the program flow or logic. If a task is not clear, it should be documented in the relevant plan file.

## ✅ Workflow Protocol

### 1. Always Plan First
Before implementing **any new feature or fix**, Copilot must:

1. Create a corresponding `plan-[feature-name].md` inside the `/docs/` folder.
2. This plan **must include**:
   - Feature name or bugfix title
   - Goal & expected behavior
   - Technical steps to implement
   - Potential edge cases
   - Impact on existing files or UX
   - **Task checklist with individual actionable items** - all tasks for this feature should be managed within the plan itself
   - Use the checklist to determine if this plan is done or not and track progress on individual items

### 2. Task Management
- **All tasks should be managed within individual plan files** rather than using a centralized `todo.md`
- When creating a new task:
  - Add it to the checklist section of the relevant `/docs/plan-*.md` file
  - Use descriptive bullets and group tasks into meaningful sections (e.g., Setup, Implementation, Testing, Polish)
- When a larger feature is completed:
  - Mark all checklist items as complete (`- [x]`) in the plan file
  - Add a completion summary and any relevant notes or links preserved

### 3. Documentation and Communication
- Annotate all changes and progress directly in the relevant plan file with brief **implementation notes** or obstacles
- Reference other `docs/*` plans or files when applicable
- If an obstacle is encountered, write it down in the related plan file or create a new `/docs/issue-[topic].md`
- For every component you touch, if not already there add to the beginning of the file a documentation comment, documenting the following:
  - The component name
  - The purpose of the component
  - The props it receives
  - The expected behavior of the component
  - Any important notes or caveats
  - Any dependencies or external libraries used
  - Other components integrating this component or using it (just direct references)

## 🔁 Retry Expectations

If a problem or bug is encountered:

- Copilot must attempt **five unique implementation strategies** before:
  - Logging the issue as blocked in the plan file
  - Requesting clarification
- Each attempt should differ significantly (e.g., alternate API usage, DOM structure, CSS method, fallback behavior)

Use inline `// Attempt 1`, `// Attempt 2`, etc. to indicate retries in the codebase if needed.

## 🧠 Mind the Boundaries

Copilot should:
- Align component changes with `docs/component-structure.md`
- Respect existing data schema per existing documentation
- Maintain language-aware behavior based on the established multilingual patterns

## 📦 Final Output Responsibilities

For each completed task:
- Ensure relevant source files are updated and committed
- Update the plan file to mark tasks as complete in the checklist
- Add any implementation notes in the relevant plan
- Add completion summary when major features are finished

---

By following this protocol, Copilot becomes a reliable assistant within a human-defined framework of structure, clarity, and plan-based task management.
