# Framework vs Game Code Mapping

**Purpose:** Clear visual mapping of what belongs to framework vs game-specific code

---

## Current Architecture Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BLAMEGAME REPOSITORY                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
        ┌───────────▼──────────┐        ┌───────────▼──────────┐
        │   FRAMEWORK CODE     │        │    GAME CODE         │
        │   (Reusable)         │        │    (BlameGame)       │
        └───────────┬──────────┘        └───────────┬──────────┘
                    │                                │
        ┌───────────┴───────────┐        ┌───────────┴──────────┐
        │                       │        │                       │
  ┌─────▼─────┐         ┌──────▼──────┐ │              ┌────────▼────────┐
  │ Core      │         │ Components  │ │              │ NameBlame       │
  │ Framework │         │ & Screens   │ │              │ Module          │
  └───────────┘         └─────────────┘ │              └─────────────────┘
        │                     │          │                      │
  • EventBus            • Framework     │              • Phase Logic
  • Modules             Screens         │              • Blame Store
  • Phases              • Core UI       │              • Game Config
  • Router              • Layouts       │              • Question Data
  • Config              • Hooks         │              • Game Screens
  • Storage             • Providers     │              • Game Components
```

---

## Proposed Architecture After Extraction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PARTY GAME FRAMEWORK (New Repo)                          │
│                         NPM: @party-game/*                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
        ┌───────────▼──────────┐        ┌───────────▼──────────┐
        │  @party-game/core    │        │  @party-game/ui      │
        └───────────┬──────────┘        └───────────┬──────────┘
                    │                                │
            • EventBus                    • Framework Screens
            • GameModule                  • Core Components
            • PhaseController             • Layouts
            • Router                      • Theme System
            • Config Schema               • Animations
            • Storage
                    │                                │
        ┌───────────▼──────────┐        ┌───────────▼──────────┐
        │ @party-game/hooks    │        │ @party-game/utils    │
        └───────────┬──────────┘        └───────────┬──────────┘
                    │                                │
            • useGameState                • Array Utils
            • useGameSettings             • Validators
            • useSound                    • Formatters
            • useTheme                    • Preload Utils
            • useContent
                    │
                    │
                    └────────────────────┬─────────────────────┐
                                         │                     │
                              ┌──────────▼────────┐  ┌─────────▼────────┐
                              │   BLAMEGAME       │  │  TRUTH OR DARE   │
                              │   (Game Repo)     │  │  (Game Repo)     │
                              └──────────┬────────┘  └─────────┬────────┘
                                         │                     │
                                • NameBlame Module   • ToD Module
                                • Game Components    • Game Components
                                • Question Data      • Dare Data
                                • Blame Logic        • Challenge Logic
                                • Game Screens       • Game Screens
```

---

## Code Distribution Analysis

### Current State (Lines of Code)

```
Framework Code (Extractable)          Game Code (BlameGame Specific)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
framework/                            games/nameblame/
├── core/           ~600 LOC          ├── NameBlameModule.tsx  ~140 LOC
├── config/         ~200 LOC          ├── phases.ts            ~173 LOC
├── persistence/     ~50 LOC          ├── store.ts             ~163 LOC
├── ui/             ~200 LOC          └── game.json             ~50 LOC
└── utils/           ~50 LOC          
                                      components/game/        ~2,000 LOC
components/framework/                 ├── IntroScreen.tsx
├── Screens/      ~1,000 LOC          ├── QuestionScreen.tsx
└── GameShell/      ~200 LOC          ├── PlayerSetupScreen.tsx
                                      ├── SummaryScreen.tsx
components/core/      ~800 LOC        └── [others]
                                      
hooks/ (framework)    ~400 LOC        App.tsx (legacy)          ~820 LOC
providers/            ~500 LOC        
lib/utils/            ~600 LOC        store/BlameGameStore.ts   ~163 LOC
                                      
                                      public/questions/       ~10,000 LOC
                                      lib/customCategories/     ~500 LOC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ~4,600 LOC                     Total: ~14,000 LOC
```

### Distribution Breakdown

| Category           | Framework LOC | Game LOC | % Framework |
|--------------------|---------------|----------|-------------|
| Core Logic         | 1,100         | 476      | 70%         |
| UI Components      | 2,000         | 2,000    | 50%         |
| Configuration      | 200           | 50       | 80%         |
| Data/Content       | 500           | 10,500   | 5%          |
| Utilities          | 800           | 500      | 62%         |
| **TOTAL**          | **4,600**     | **13,526**| **25%**    |

**Analysis:** 25% of code is reusable framework, 75% is game-specific. This is healthy - shows a focused framework with room for game creativity.

---

## Component Categorization

### ✅ Pure Framework Components (No Changes Needed)

| Component | Category | Purpose | LOC |
|-----------|----------|---------|-----|
| `EventBus` | Core | Event-driven architecture | 100 |
| `GameModule` | Core | Module interface & registry | 50 |
| `PhaseController` | Core | Phase management | 50 |
| `GameHost` | Core | Module host & initialization | 167 |
| `FrameworkRouter` | Core | Phase routing | 100 |
| `GameConfigSchema` | Config | Config validation | 140 |
| `discover.ts` | Config | Auto-discovery | 60 |
| `storage.ts` | Persistence | LocalStorage abstraction | 41 |
| `FrameworkIntroScreen` | UI | Generic intro screen | 150 |
| `FrameworkCategoryPickScreen` | UI | Category selection | 150 |
| `FrameworkPlayerSetupScreen` | UI | Player setup | 150 |
| `FrameworkPreparingScreen` | UI | Loading/preparing | 100 |
| `FrameworkQuestionScreen` | UI | Generic question display | 200 |
| `FrameworkSummaryScreen` | UI | Game summary | 150 |
| `GameShell` | UI | Shell layout | 80 |
| `GameMain` | UI | Main game container | 120 |
| `Button` | UI | Button component | 50 |
| `Card` | UI | Card component | 80 |
| `Input` | UI | Input component | 60 |
| `Switch` | UI | Switch component | 40 |
| ... and 15+ more core UI components | UI | Various | ~500 |

**Total Pure Framework: ~2,300 LOC**

### ⚠️ Abstractable Components (Minor Changes Needed)

| Component | Current State | Framework State | Changes Needed |
|-----------|---------------|-----------------|----------------|
| `useQuestions` | Question-specific | `useContent` | Generalize to any content type |
| `useNameBlameSetup` | Game-specific | `usePlayerSetup` | Remove blame-specific logic |
| `QuestionProvider` | Question-focused | `ContentProvider` | Generic content interface |
| `arrayUtils` | Mixed | Pure utils | Remove game-specific functions |
| `useProviderState` | Partially coupled | Generic | Remove question assumptions |

**Estimated Effort: 20-30 hours**

### ❌ Game-Specific Components (Stay in BlameGame)

| Component | Purpose | LOC |
|-----------|---------|-----|
| `NameBlameModule` | Game module implementation | 140 |
| `nameBlame/phases.ts` | Game phase logic | 173 |
| `nameBlame/store.ts` | Blame-specific state | 163 |
| `BlameGameStore` | Blame tracking | 163 |
| `IntroScreen` (legacy) | Game-specific intro | 200 |
| `QuestionScreen` (legacy) | Blame-specific questions | 300 |
| `PlayerSetupScreen` (legacy) | Name entry | 150 |
| `SummaryScreen` (legacy) | Blame summary | 200 |
| `BlameNotification` | Blame reveal animation | 100 |
| `QuestionCard` | Question display | 150 |
| `CategoryPickScreen` (legacy) | Category selection | 200 |
| Question JSON files | Game content | 10,000 |
| Custom category logic | User categories | 500 |

**Total Game-Specific: ~12,400 LOC**

---

## Dependency Mapping

### Framework Dependencies (Can be in framework)

```javascript
{
  // Core React
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  
  // UI Components
  "@radix-ui/react-checkbox": "^1.3.1",
  "@radix-ui/react-label": "^2.1.6",
  "@radix-ui/react-slider": "^1.3.4",
  "@radix-ui/react-switch": "^1.2.4",
  "lucide-react": "^0.507.0",
  
  // Styling
  "tailwindcss": "^3.4.17",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.2.0",
  "class-variance-authority": "^0.7.1",
  
  // Animation
  "framer-motion": "^11.0.0",
  
  // State
  "zustand": "^5.0.8",
  
  // i18n
  "i18next": "^25.1.2",
  "react-i18next": "^15.5.1",
  "i18next-browser-languagedetector": "^8.1.0",
  
  // Validation
  "zod": "^3.23.8",
  
  // PWA
  "workbox-window": "^7.3.0",
  
  // Build Tools
  "vite": "^5.4.19",
  "@vitejs/plugin-react": "^4.4.1",
  "typescript": "^5.0.0",
  
  // Testing
  "@playwright/test": "^1.55.0"
}
```

**Assessment:** ✅ All dependencies are appropriate for a party game framework. No game-specific dependencies.

### Game-Specific Dependencies

```javascript
{
  // All dependencies come from framework
  "@party-game/core": "^1.0.0",
  "@party-game/ui": "^1.0.0",
  "@party-game/hooks": "^1.0.0",
  "@party-game/utils": "^1.0.0"
}
```

**Games only need framework packages!**

---

## Configuration Mapping

### Framework Config (`GameConfigSchema`)

```typescript
// Extracted to @party-game/core
interface GameConfig {
  // Identity
  id: string;
  title: string;
  version: string;
  description: string;
  
  // Player Constraints
  minPlayers: number;
  maxPlayers: number;
  
  // Game Structure
  phases: GamePhase[];
  screens: Record<string, string>;
  
  // Content
  contentProvider: ContentProviderConfig;
  
  // Settings
  gameSettings: GameSettings;
  
  // UI Configuration
  ui: {
    layout: UILayoutConfig;
    features: UIFeaturesConfig;
    branding: UIBrandingConfig;
    theme: UIThemeConfig;
    settings: UISettingsConfig;
  };
  
  // Feature Flags
  featureFlags: Record<string, boolean>;
  
  // Multiplayer (future)
  multiplayer: MultiplayerConfig;
}
```

### Game Config (`game.json`)

```json
{
  "id": "nameblame",
  "title": "NameBlame",
  "version": "1.0.0",
  "minPlayers": 3,
  "maxPlayers": 16,
  "phases": [
    { "id": "intro", "screenId": "intro" },
    { "id": "setup", "screenId": "setup" },
    { "id": "play", "screenId": "play" },
    { "id": "summary", "screenId": "summary" }
  ],
  "screens": {
    "intro": "FrameworkIntroScreen",
    "setup": "FrameworkPlayerSetupScreen",
    "play": "FrameworkQuestionScreen",
    "summary": "FrameworkSummaryScreen"
  },
  "contentProvider": {
    "type": "json",
    "source": "/questions",
    "shuffle": true
  },
  "gameSettings": {
    "categoriesPerGame": 5,
    "questionsPerCategory": 10,
    "maxQuestionsTotal": 50
  },
  "ui": {
    "features": {
      "playerSetup": true,
      "categorySelection": true,
      "soundControl": true
    },
    "branding": {
      "gameName": "BlameGame",
      "tagline": "Who's to blame?"
    },
    "theme": {
      "colors": {
        "primary": "autumn-500",
        "secondary": "rust-500",
        "accent": "orange-600"
      }
    }
  }
}
```

---

## Migration Checklist

### Phase 1: Internal Restructuring

- [ ] Move all framework code to `framework/` directory
- [ ] Move all game code to `games/nameblame/` directory
- [ ] Complete `App.tsx` migration to `NameBlameModule`
- [ ] Abstract `useQuestions` → `useContent`
- [ ] Generalize `QuestionProvider` → `ContentProvider`
- [ ] Remove game-specific logic from framework components
- [ ] Update all imports
- [ ] Ensure all tests pass
- [ ] Document framework boundaries

### Phase 2: Validation

- [ ] Design second game (Truth or Dare)
- [ ] Implement using framework APIs
- [ ] Document pain points and missing features
- [ ] Refactor framework based on learnings
- [ ] Update both games with improvements
- [ ] Validate config-driven approach
- [ ] Add comprehensive tests

### Phase 3: Extraction

- [ ] Create framework repository structure
- [ ] Set up monorepo tooling (Turborepo/Lerna)
- [ ] Define package.json for each package
- [ ] Set up build system (tsup/rollup)
- [ ] Move framework code to new repo
- [ ] Publish packages to npm (private or public)
- [ ] Update BlameGame to consume packages
- [ ] Update second game to consume packages
- [ ] Verify all tests pass
- [ ] Create migration guide
- [ ] Write comprehensive documentation
- [ ] Create example games
- [ ] Set up CI/CD pipelines
- [ ] Announce framework availability

---

## Comparison: Before vs After Extraction

### Before Extraction (Current)

```
blamegame/
├── Everything in one repo
├── ~18,000 LOC total
├── Mixed framework/game code
├── Hard to reuse for new games
└── Single deployment pipeline

Pros:
✅ Simple single-repo management
✅ Fast iteration
✅ No version coordination

Cons:
❌ Hard to identify framework code
❌ Can't reuse without copying
❌ Encourages coupling
❌ New games start from scratch
```

### After Extraction (Proposed)

```
party-game-framework/
├── Framework code only (~4,600 LOC)
├── Published npm packages
├── Reusable across games
└── Independent CI/CD

blamegame/
├── Game code only (~13,400 LOC)
├── Consumes framework packages
└── Focused on game logic

Pros:
✅ Clear separation
✅ Reusable framework
✅ Faster new game development
✅ Independent evolution
✅ Professional architecture

Cons:
⚠️ Multi-repo complexity
⚠️ Version coordination
⚠️ Slower iteration (publish cycle)
```

---

## Summary

**Framework Code:** ~25% of codebase (~4,600 LOC)  
**Game Code:** ~75% of codebase (~13,400 LOC)  
**Extraction Effort:** ~200-260 hours  
**Expected Time Savings:** 50-70% per new game  
**Recommendation:** ✅ **EXTRACT** using phased approach

---

**Document Status:** Complete  
**Next Review:** After second game completion  
**Owner:** Architecture Team
