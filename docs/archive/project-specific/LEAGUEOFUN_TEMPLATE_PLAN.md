0) Executive Summary
--------------------

We will evolve the **blamegame** repo into a **configuration-driven, multi-game template**. The template isolates framework concerns (routing, phases, events, UI shell, stores, i18n, theming, persistence) from **game 5) UI Shell & Screen Registry
-----------------------------

*   `FrameworkRouter`: renders `screenId → <Component>` via a registry.
*   `GameShell`: configurable layout wrapper providing header/main/footer structure based on game.json UI configuration.
*   Footer actions generated from current phase `allowedActions`.
*   Inject dispatcher and event bus via context.
*   Shared screens live under `/src/screens` (intro, setup, summary). Modules can **override** by registering screens with same ids in their registry.

### 5.1 Modular UI Configuration

*   All UI elements (header, footer, buttons, modals) controlled by `game.json` UI configuration.
*   Config-driven feature toggles: soundControl, volumeControl, languageSelector, infoModal, settingsPanel, etc.
*   Theme integration: dynamic styling based on game.json theme configuration (primaryGradient, cardBackground, accentColor).
*   Layout options: header styles (minimal, full, compact), footer visibility, persistent UI elements.** that plug in their specific logic and content providers. The **main page** reads `game.json` files from individual games to populate a dynamic **game menu**. Selections, lightweight player profile, and feature flags are persisted via **LocalStorage**. We accept `playerId` and `roomId` in the URL for future multiplayer.

Success means:

*   New game = add `games/<id>/` with `game.json`, a `GameModule`, optional content provider, translations, and theme ref. No core edits.
*   ≥80% code reuse across games; **App.tsx** becomes a thin **GameHost**.
*   Contract tests cover the lifecycle for every registered module.

* * *

1) Scope, Goals, Non-Goals
--------------------------

### 1.1 Goals

*   Convert **blamegame** into a **framework + modules** structure.
*   Drive behavior from **validated configs** (`game.json` per game, plus schema).
*   Introduce **GameModule** interface, **Phase descriptors**, **GameAction** dispatcher, **EventBus**, **ContentProvider** abstraction.
*   Implement **GameMenu** that scans/reads `game.json` and lists games.
*   Persist selected game and lightweight session state in **LocalStorage**; parse `playerId` and `roomId` from URL.
*   Introduce **namespaced i18n** and **config-driven theming**.
*   Add **contract tests** to lock lifecycle invariants.

### 1.2 Non-Goals (v1)

*   Real-time multiplayer networking (we only prepare URL/state surfaces).
*   Cloud telemetry; only local debug/event stream for now.
*   Full plugin marketplace; we implement a registry and lazy loading hooks.

* * *

2) Target Architecture
----------------------

```
/src
  /framework
    /config/            # schemas, loaders, validation, defaults
    /core/              # GameHost, router, event bus, stores, persistence
    /ui/                # shell components + screen registry
    /i18n/              # framework translations (framework.*)
    /theme/             # theme packs (colors, motion, sounds)
  /games
    /nameblame          # example module migrated from current app
      /assets           # images, sfx
      /i18n             # game.nameblame.*
      game.json         # declarative config for menu + startup
      index.ts          # module entry: register(), lazy import screen map
      NameBlameModule.tsx
  /screens              # shared/reusable screens (intro, setup, summary)
  /providers            # ContentProvider implementations
  /testing              # test utilities, fake modules, contract tests
```

Key components:

*   **GameHost**: bootstraps framework, loads selected game module, provides contexts.
*   **GameModule**: encapsulates game logic. Provides `id`, `init`, `phase controllers`, content bindings, optional module store slice.
*   **PhaseDescriptor**: declarative phase definition with transitions.
*   **GameAction**: typed actions (ADVANCE, BACK, SELECT\_TARGET, REVEAL, RESTART, CUSTOM).
*   **EventBus**: publishes `GameEvent` for every meaningful transition.
*   **Stores**:
    *   `CoreStore`: players, lifecycle (init → ready → play → complete), phase, turn.
    *   `UIStore`: overlays, toasts, loading indicators.
    *   `ModuleStore`: per-module slice registration hook.
*   **ContentProvider**: pluggable content source (static list, API, procedural).
*   **Theme packs**: color scales, motion presets, sfx set; selected in config.
*   **i18n**: namespaced keys `framework.*`, `game.<id>.*`, `shared.*`.

* * *

3) Config Surfaces
------------------

### 3.1 `game.json` (per game)

Minimal example (NameBlame):

```json
{
  "id": "nameblame",
  "title": "Blamegame: NameBlame",
  "description": "Party deduction with rotating prompts and targeted choices.",
  "version": "1.0.0",
  "minPlayers": 3,
  "maxPlayers": 12,
  "tags": ["party", "prompt", "social", "local"],
  "themeRef": "neon-dark",
  "i18nNamespaces": ["game.nameblame"],
  "screens": {
    "intro": "IntroScreen",
    "setup": "PlayerSetupScreen",
    "play": "NameBlamePlayScreen",
    "summary": "SummaryScreen"
  },
  "phases": [
    { "id": "intro", "screenId": "intro", "allowedActions": ["ADVANCE"] },
    { "id": "setup", "screenId": "setup", "allowedActions": ["ADVANCE","BACK"] },
    { "id": "play", "screenId": "play", "allowedActions": ["ADVANCE","SELECT_TARGET","REVEAL"] },
    { "id": "summary", "screenId": "summary", "allowedActions": ["RESTART"] }
  ],
  "contentProvider": {
    "type": "static-questions",
    "source": "/games/nameblame/assets/questions.en.json",
    "shuffle": true
  },
  "featureFlags": {
    "allowRejoin": true,
    "showDebugPanel": false
  },
  "multiplayer": {
    "supportsRoom": true,
    "requiresRoom": false
  }
}
```

### 3.2 Runtime validation (Zod)

```ts
// framework/config/game.schema.ts
import { z } from "zod";

const UILayoutConfigSchema = z.object({
  showHeader: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  headerStyle: z.enum(['minimal', 'full', 'compact']).default('minimal')
}).default({ showHeader: true, showFooter: true, headerStyle: 'minimal' });

const UIFeaturesConfigSchema = z.object({
  soundControl: z.boolean().default(false),
  volumeControl: z.boolean().default(false),
  languageSelector: z.boolean().default(true),
  categorySelection: z.boolean().default(false),
  gameMode: z.string().optional(),
  playerSetup: z.boolean().default(false),
  infoModal: z.boolean().default(true),
  settingsPanel: z.boolean().default(true),
  kofiLink: z.boolean().default(false),
  githubLink: z.boolean().default(false),
  versionDisplay: z.boolean().default(true)
}).default({});

const UIBrandingConfigSchema = z.object({
  showFrameworkBadge: z.boolean().default(false),
  gameName: z.string().optional(),
  tagline: z.string().optional(),
  mainQuestion: z.string().optional(),
  subtitle: z.string().optional()
}).default({});

const UIThemeConfigSchema = z.object({
  primaryGradient: z.string().default('from-blue-400 via-purple-500 to-indigo-600'),
  cardBackground: z.string().default('bg-white'),
  accentColor: z.string().default('blue')
}).default({});

const UIConfigSchema = z.object({
  layout: UILayoutConfigSchema,
  features: UIFeaturesConfigSchema,
  branding: UIBrandingConfigSchema,
  theme: UIThemeConfigSchema
}).default({});

export const GameConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().default(""),
  version: z.string(),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  tags: z.array(z.string()).default([]),
  themeRef: z.string().default("default"),
  i18nNamespaces: z.array(z.string()).default([]),
  screens: z.record(z.string(), z.string()),
  phases: z.array(z.object({
    id: z.string(),
    screenId: z.string(),
    allowedActions: z.array(z.enum(["ADVANCE","BACK","SELECT_TARGET","REVEAL","RESTART","CUSTOM"]))
  })),
  contentProvider: z.object({
    type: z.string(),
    source: z.string().optional(),
    shuffle: z.boolean().optional()
  }).optional(),
  ui: UIConfigSchema,
  featureFlags: z.record(z.boolean()).default({}),
  multiplayer: z.object({
    supportsRoom: z.boolean().default(false),
    requiresRoom: z.boolean().default(false)
  }).default({ supportsRoom: false, requiresRoom: false })
});

export type GameConfig = z.infer<typeof GameConfigSchema>;
```

* * *

4) Framework Contracts
----------------------

### 4.1 GameModule

```ts
export interface GameModuleContext {
  config: GameConfig;
  playerId?: string | null;
  roomId?: string | null;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  // access to stores via hooks
}

export interface GameModule {
  id: string;
  init(ctx: GameModuleContext): void | Promise<void>;
  registerScreens(): ScreenRegistry;
  getPhaseControllers(): Record<string, PhaseController>;
  getModuleStore?(): ModuleStoreRegistration;
  getTranslations?(): TranslationBundle[];     // optional additional bundles
  getThemeExtensions?(): ThemeExtension | null;
}
```

### 4.2 PhaseController

```ts
export interface PhaseController {
  onEnter?(ctx: GameModuleContext): void | Promise<void>;
  onExit?(ctx: GameModuleContext): void | Promise<void>;
  transition(action: GameAction, ctx: GameModuleContext): PhaseTransitionResult;
}

export type PhaseTransitionResult =
  | { type: "STAY" }
  | { type: "GOTO"; phaseId: string }
  | { type: "COMPLETE" };
```

### 4.3 GameAction

```ts
export enum GameAction {
  ADVANCE = "ADVANCE",
  BACK = "BACK",
  SELECT_TARGET = "SELECT_TARGET",
  REVEAL = "REVEAL",
  RESTART = "RESTART",
  CUSTOM = "CUSTOM"
}
```

### 4.4 EventBus & Events

```ts
export type GameEvent =
  | { type: "LIFECYCLE/INIT"; meta?: Record<string, unknown> }
  | { type: "LIFECYCLE/READY" }
  | { type: "PHASE/ENTER"; phaseId: string }
  | { type: "PHASE/EXIT"; phaseId: string }
  | { type: "ACTION/DISPATCH"; action: GameAction; payload?: unknown }
  | { type: "CONTENT/NEXT"; index: number }
  | { type: "GAME/COMPLETE"; summary?: unknown }
  | { type: "ERROR"; error: string; meta?: Record<string, unknown> };

export interface EventBus {
  publish: (evt: GameEvent) => void;
  subscribe: (fn: (evt: GameEvent) => void) => () => void;
}
```

* * *

5) Stores
---------

### 5.1 CoreStore (Zustand)

*   `players: Player[]`
*   `lifecycle: "init" | "loading" | "ready" | "playing" | "complete"`
*   `phaseId: string`
*   `turn: { index: number; total: number }`
*   `stablePlayerOrder: PlayerId[]` (selector, not duplicated effects)
*   Actions: `setPlayers`, `setPhase`, `advanceTurn`, `reset`, etc.

### 5.2 UIStore

*   `overlay: { type: "modal" | "sheet" | null; data?: unknown }`
*   `loading: boolean`
*   `toasts: Toast[]`

### 5.3 ModuleStore

*   Each module registers via `getModuleStore()` returning:
    *   slice name
    *   initial state
    *   actions/selectors

> Migration note: extract all **NameBlame** state from `useBlameGameStore` into a `module:nameblame` slice.

* * *

6) UI Shell & Screen Registry
-----------------------------

*   `FrameworkRouter`: renders `screenId → <Component>` via a registry.
*   Footer actions generated from current phase `allowedActions`.
*   Inject dispatcher and event bus via context.
*   Shared screens live under `/src/screens` (intro, setup, summary). Modules can **override** by registering screens with same ids in their registry.

* * *

7) Content Providers
--------------------

Interface:

```ts
export interface ContentProvider<T> {
  preload?(): Promise<void>;
  current(): T | null;
  next(): T | null;
  previous?(): T | null;
  progress(): { index: number; total: number };
}
```

Implementations:

*   `StaticListProvider` (wraps questions JSON; uses `shuffle`).
*   `DeckDraftProvider` (no repeats, deck logic).
*   `TimedFeedProvider` (future: interval updates or remote API).

Bind provider in module `init()` based on `config.contentProvider`.

* * *

8) i18n Strategy
----------------

*   Keys: `framework.*`, `shared.*`, `game.<id>.*`.
*   Framework loads `framework.*` by default. Module registers `game.<id>.*` at init.
*   Debounce language changes to avoid redundant rerenders (previous issue).

* * *

9) Theming & Assets
-------------------

*   `theme packs` under `/framework/theme/packs/*.ts`:
    *   `colors`, `gradients`, `motion` (framer presets), `soundSet` (map ids→paths).
*   Config `themeRef` selects pack; modules can extend via `getThemeExtensions`.
*   Asset helpers:
    *   `getAssetsPath(gameId)` returns `/games/<id>/assets`
    *   Avoid hardcoded `/public` paths; use helper for consistency.

* * *

10) Persistence & URL Surface
-----------------------------

### 10.1 LocalStorage Adapter

*   Keys are **namespaced** and **versioned**:

```
lof.v1.selectedGame
lof.v1.session.player
lof.v1.flags
lof.v1.recentGames
```

*   Adapter functions: `get<T>(key)`, `set<T>(key, value)`, `remove(key)`.
*   Handle migrations on version bump.

### 10.2 URL Parameters

*   Parse once at boot:
    *   `?game=<id>&playerId=<uuid>&roomId=<string>`
*   Validate and store in Core/Session store. If `game` present and valid, **auto-select** that game.
*   Keep params on internal navigation (preserve/shareable links).

* * *

11) Game Menu
-------------

*   Component: `GameMenu` renders cards from discovered `game.json`.
*   Data loading strategies:
    1.  **Build-time glob** with Vite `import.meta.glob` to pull JSON modules.
    2.  Runtime fetch from `/games/*/game.json` where games are placed under `/public/games/<id>/game.json`.
*   Store result in `LocalStorage` for fast reload; revalidate on version change.
*   Card displays `title`, `description`, `players`, `tags`; click to select and mount module.

* * *

12) Testing
-----------

### 12.1 Contract Tests

*   For each registered module:
    *   init → ready → enter `intro` → ADVANCE → `setup` → ADVANCE → `play` → transitions → `summary` → COMPLETE.
    *   Assert `EventBus` emits expected sequence.

### 12.2 Provider Tests

*   Deterministic progression for `StaticListProvider` with and without shuffle.

### 12.3 Store Tests

*   Derived selectors produce stable order; no duplicate effects.

### 12.4 E2E (Playwright)

*   Load app → select game → add players → play a round → summary.

* * *

13) Dev & Debug Tooling
-----------------------

*   Centralized logger subscribing to `EventBus` with levels: `debug|info|warn|error`.
*   **DebugPanel**: toggleable overlay that shows live event stream, current phase, provider progress.
*   Flag via config `featureFlags.showDebugPanel`.

* * *

14) Accessibility & UX
----------------------

*   Keyboard navigation for menu and in-game actions.
*   Focus management on phase change.
*   Visible focus styles, motion-reduced variant using `prefers-reduced-motion`.
*   Color contrast validated for theme packs.

* * *

15) Performance
---------------

*   Code-split per game module.
*   Memoize heavy derived values in providers/screens.
*   Remove duplicated `stablePlayerOrder` effects (compute via selector).
*   Debounce i18n changes.

* * *

16) Security & Future Multiplayer Prep
--------------------------------------

*   Sanitize/validate `playerId`, `roomId`, `game` URL params.
*   Strict types on dispatch payloads.
*   Encapsulate networking behind future `NetAdapter` interface; keep room/session in store but no network side effects in v1.

* * *

17) CI/CD & Project Hygiene
---------------------------

*   Prettier + ESLint + TypeScript strict mode.
*   GitHub Actions:
    *   `test` on PR
    *   `build` and deploy to Pages
*   Conventional Commits for changelog.
*   `pnpm` workspace ready (optional), but v1 can remain single package.

* * *

18) Migration Guide (Blamegame → Module)
----------------------------------------

### 18.1 Files to Extract or Replace

*   `App.tsx` → **GameHost.tsx** (framework)
*   Move NameBlame logic from `App` and ad-hoc handlers into:
    *   `/src/games/nameblame/NameBlameModule.tsx`
    *   `/src/games/nameblame/index.ts` (register module)
    *   `/src/games/nameblame/game.json`
    *   `/src/games/nameblame/i18n/*` (namespaced)
*   `useBlameGameStore` → `module:nameblame` store slice.
*   `useGameStateStore` → `CoreStore` without game semantics.
*   `useQuestions` → `StaticListProvider` under `/providers`.

### 18.2 UI Wiring

*   Replace direct `handleNextQuestion`, `handleBlame` calls with `dispatch(GameAction.X)`.
*   Footer buttons derive from `allowedActions` of current `PhaseDescriptor`.

### 18.3 i18n Keys

*   Move global keys into `framework.*` and `shared.*`.
*   Game strings into `game.nameblame.*`.

* * *

19) Concrete Task Breakdown (Phases)
------------------------------------

> Each task has Definition of Done (DoD) and code-review touch points.

### Phase 1 — Foundations (P1)

*    Create **EventBus** utility.  
    DoD: publish/subscribe with tests; connected to DebugPanel.
*    Define **GameConfigSchema** and runtime validation.  
    DoD: invalid config yields user-visible error screen and console error.
*    Implement **GameModule** interface and **GameModuleRegistry**.  
    DoD: can register and resolve module by `id`.
*    Refactor `App.tsx` → **GameHost.tsx**.  
    DoD: `GameHost` mounts framework contexts; no game logic.

### Phase 2 — NameBlame Extraction (P1)

*    Create `/games/nameblame` and move logic.  
    DoD: feature parity with current gameplay.
*    Register NameBlame screens via module registry.  
    DoD: Router resolves by `screenId`.
*    Create `module:nameblame` store slice.  
    DoD: no leakage into CoreStore.

### Phase 3 — Actions & Phases (P1/P2)

*    Introduce `GameAction` enum + dispatcher.  
    DoD: direct handlers removed; events emitted on dispatch.
*    Implement `PhaseController` per phase.  
    DoD: transition table covers ADVANCE/BACK/REVEAL/etc.
*    Hook transitions to `EventBus`.  
    DoD: enter/exit events appear in DebugPanel.

### Phase 4 — Content Provider (P2)

*    Implement `StaticListProvider` from existing questions.  
    DoD: same question progression as before; tests for progression.
*    Bind provider via `game.json` `contentProvider`.  
    DoD: module picks provider type at init.

### Phase 5 — Menu, URL, Persistence (P1/P2)

*    `GameMenu` listing from discovered `game.json`.  
    DoD: cards with title, description, player range, tags.
*    LocalStorage adapter + selected game persistence.  
    DoD: refresh keeps selection; versioned keys.
*    URL parsing for `game`, `playerId`, `roomId`.  
    DoD: valid params auto-select game and populate session.

### Phase 6 — i18n & Theme Packs (P3)

*    Move to namespaced keys; load per module.  
    DoD: no collisions; language switch stable.
*    Theme packs and motion presets; config `themeRef`.  
    DoD: switching games switches theme without reload.

### Phase 7 — Testing & Hardening (P3/P4)

*    Contract tests per module.  
    DoD: green on CI; snapshot events stable.
*    Performance passes (memoization, effect cleanup).  
    DoD: no duplicate stablePlayerOrder effects.

### Phase 8 — Docs & Scaffolding (P4)

*    Write `ARCHITECTURE.md`, `GAME_MODULE_GUIDE.md`, `CONTENT_PROVIDER_GUIDE.md`, `EVENT_BUS_REFERENCE.md`, `THEME_PACKS.md`.
*    CLI `pnpm run create:game <id>` scaffolds: dirs, `game.json`, i18n namespace, test stubs.

* * *

20) File-by-File Touch Points
-----------------------------

*   `src/App.tsx` → replace with `src/framework/core/GameHost.tsx` (thin host).
*   `src/hooks/useGameStateStore.ts` → `src/framework/core/stores/coreStore.ts`.
*   `src/hooks/useBlameGameStore.ts` → `src/games/nameblame/store.ts`.
*   `src/hooks/useQuestions.ts` → `src/providers/StaticListProvider.ts`.
*   `src/components/*` that are **framework shell** → move to `src/framework/ui/*`.
*   `src/locales/en.json` → split: `src/framework/i18n/en.framework.json`, `src/games/nameblame/i18n/en.nameblame.json`.
*   `public/assets` used by NameBlame → `src/games/nameblame/assets` (served via helper).
*   New:
    *   `src/framework/config/game.schema.ts`
    *   `src/framework/core/eventBus.ts`
    *   `src/framework/core/dispatcher.ts`
    *   `src/framework/core/router/FrameworkRouter.tsx`
    *   `src/framework/persistence/storage.ts`
    *   `src/framework/utils/url.ts`
    *   `src/framework/theme/packs/*.ts`
    *   `src/components/menu/GameMenu.tsx`
    *   `src/components/framework/GameShell.tsx`
    *   `src/components/framework/FrameworkIntroScreen.tsx`
    *   `src/testing/contract.test.ts`

### 20.1 Modular UI Components

*   `GameShell`: Layout wrapper with configurable header/main/footer structure
*   Framework screens: `FrameworkIntroScreen`, `FrameworkPlayerSetupScreen`, `FrameworkQuestionScreen`, `FrameworkSummaryScreen`
*   Enhanced components: `LanguageSelector` with compact mode, improved `Button` variants
*   UI configuration schemas: `UILayoutConfigSchema`, `UIFeaturesConfigSchema`, `UIBrandingConfigSchema`, `UIThemeConfigSchema`

* * *

21) Hints, Pitfalls, Conventions
--------------------------------

*   **Do not** leak module state into CoreStore. Keep module slices namespaced.
*   Run `zod` validation on **every** `game.json` load; guard against missing phases/screens.
*   Use `import.meta.glob` for friendly build-time discovery of `game.json`.
*   EventBus is your source of truth for testability. Avoid silent side effects.
*   LocalStorage: always read through the adapter; never direct `localStorage.getItem` in components.
*   Keep `screenId` stable. It is the contract between config and registry.
*   Avoid hardcoded paths; always resolve via `getAssetsPath(gameId)`.
*   Accessibility first: ensure focus lands on the next screen root after phase change.

* * *

22) Risks & Mitigations
-----------------------

*   **Scope creep**: freeze scope after Phase 5; backlog extra ideas.
*   **Hidden coupling**: add adapter layers to keep legacy components working short-term.
*   **Test fragility**: favor contract tests via EventBus snapshots over fragile DOM selectors.
*   **Discovery failures**: fallback to a static list of known games if runtime fetch/glob fails.

* * *

23) Acceptance Criteria & Metrics
---------------------------------

*   `App.tsx` LOC reduced by ≥70%, with no game-specific logic remaining.
*   New game prototype scaffolded and playable within **< 10 minutes** using CLI.
*   All gameplay transitions emit events; DebugPanel shows coherent sequences.
*   All modules pass lifecycle contract tests on CI.
*   Language switch and theme switch do not force full reloads.
*   URL param selection works: `?game=nameblame&playerId=abc&roomId=xyz`.

* * *

24) Backlog (Post-v1)
---------------------

*   NetAdapter and minimal room sync (polling or WebRTC stub).
*   Telemetry sink toggle (file download of events for analytics).
*   State serialization snapshots for resume.
*   In-app config editor for rapid prototyping a new `game.json`.

* * *

25) Implementation Order (PR Slicing)
-------------------------------------

1.  EventBus + dispatcher + schema (no behavior change).
2.  GameHost + Menu + URL + LocalStorage adapter.
3.  NameBlame extraction into `games/nameblame` with provider integration.
4.  Actions/Phases refactor and router.
5.  Namespaced i18n + theme packs.
6.  Contract tests, performance, docs.
7.  CLI scaffolder.

* * *

26) Definitions
---------------

*   **GameHost**: loads config, manages lifecycle, mounts module and screens.
*   **GameModule**: pluggable package for a specific game’s logic.
*   **Phase**: a logical gameplay stage visible to the user (intro, setup, play, summary).
*   **Screen**: the UI for a phase; mapped via registry and screenId.
*   **Provider**: source of content (questions, prompts, cards).
*   **EventBus**: pub/sub for lifecycle, phase, and action events.

* * *

27) Example: NameBlame Phase Controllers (Sketch)
-------------------------------------------------

```ts
// games/nameblame/phases.ts
export const nameBlamePhases: Record<string, PhaseController> = {
  intro: {
    transition(action) {
      return action === GameAction.ADVANCE ? { type: "GOTO", phaseId: "setup" } : { type: "STAY" };
    }
  },
  setup: {
    transition(action, ctx) {
      if (action === GameAction.BACK) return { type: "GOTO", phaseId: "intro" };
      if (action === GameAction.ADVANCE /* && players valid */) return { type: "GOTO", phaseId: "play" };
      return { type: "STAY" };
    }
  },
  play: {
    onEnter(ctx) { ctx.eventBus.publish({ type: "PHASE/ENTER", phaseId: "play" }); },
    transition(action, ctx) {
      switch (action) {
        case GameAction.SELECT_TARGET: /* update module slice */ return { type: "STAY" };
        case GameAction.REVEAL: /* compute round result */ return { type: "STAY" };
        case GameAction.ADVANCE: /* next question or summary */ 
          const { index, total } = ctx /* provider */.content.progress();
          return index + 1 < total ? { type: "STAY" } : { type: "GOTO", phaseId: "summary" };
        default: return { type: "STAY" };
      }
    }
  },
  summary: {
    transition(action) {
      return action === GameAction.RESTART ? { type: "GOTO", phaseId: "intro" } : { type: "STAY" };
    }
  }
};
```

* * *

28) Example: Menu Discovery (Vite)
----------------------------------

```ts
// framework/config/discover.ts
// Build-time: import all game.json under /src/games/*/
export const discoveredConfigs = Object.entries(
  import.meta.glob("/src/games/**/game.json", { eager: true, import: "default" })
).map(([path, json]) => GameConfigSchema.parse(json));
```

Runtime fetch fallback:

```ts
export async function fetchConfigsRuntime(gameIds: string[]) {
  const results = [];
  for (const id of gameIds) {
    const res = await fetch(`/games/${id}/game.json`);
    if (res.ok) results.push(GameConfigSchema.parse(await res.json()));
  }
  return results;
}
```

* * *

29) Done Means Done Checklist
-----------------------------

*    No game-specific imports in `/framework/*`.
*    NameBlame runs entirely from `/games/nameblame/*` plus framework APIs.
*    GameMenu renders from discovered configs; selection persists.
*    URL params set selection and session state.
*    i18n is namespaced; switching language does not break module strings.
*    Theme pack applied per game.
*    Contract tests pass on CI; DebugPanel shows coherent event sequences.

* * *

30) Appendix: Coding Standards
------------------------------

*   TypeScript strict; exhaustive `switch` on `GameAction`.
*   No direct `console.log` in modules; use EventBus sinks.
*   All cross-module IDs are **lowercase kebab**.
*   All user-visible text goes through i18n.
*   One source of truth for player order; selector not duplicated.

* * *

**End of Plan.**