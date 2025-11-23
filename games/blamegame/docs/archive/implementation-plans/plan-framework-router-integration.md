# Plan: Framework Router Integration

## Goal
Replace legacy `App` conditional rendering with the modular `FrameworkRouter` driven by `game.json` configs and the `GameModule` registry. Persist selected game, support URL param preselection, and initialize module + phase lifecycle events.

## Scope
1. Persist & restore selected game (`storageGet/Set` with key `selectedGame`).
2. Parse URL params (`parseInitialParams`) to auto-select game if present.
3. Discover game configs (`discoverGameConfigs`) and reconcile with registry modules.
4. Integrate `FrameworkRouter` inside `GameHost` once a game is selected.
5. Initialize module (async supported) before mounting router; show loading state.
6. Wire phase controllers & ensure initial phase `onEnter` + `PHASE/ENTER` event fires.
7. Fallback gracefully if module or config mismatch (error screen + EventBus ERROR event).
8. Allow returning to menu (temporary dev control) while legacy `App` remains only as fallback until full migration.

## Non-Goals
- Full removal of `App.tsx` logic (future phase)
- Theme/i18n dynamic loading (separate plan)
- Contract tests (tracked elsewhere)

## Technical Steps
- [x] Create this plan file
- [x] Update `FrameworkRouter` to execute `onEnter` for initial phase
- [x] Refactor `GameHost`:
  - [x] Discover configs on mount
  - [x] Determine initial selected game (URL > storage > first config)
  - [x] Persist selection on change
  - [x] Resolve module from registry & run `init`
  - [x] Compose screen registry mapping (config.screens screenId -> component)
  - [x] Build PhaseController map from `module.getPhaseControllers()`
  - [x] Render `FrameworkRouter` with config
  - [x] Provide a lightweight dev header + back-to-menu button (dev only)
- [x] Emit lifecycle events `LIFECYCLE/INIT`, then `LIFECYCLE/READY` after module init
- [x] Error handling path: emit `ERROR` event & render message if module/config mismatch
- [x] Persist selected game using `storageSet(STORAGE_KEYS.selectedGame)`

## Edge Cases
- URL game id invalid -> ignore and fall back to stored/first
- Module registered but config missing (or vice versa) -> error UI
- Async init rejection -> error UI + ERROR event
- Empty phases array -> error UI

## Risks / Mitigations
- Race conditions during async init: gate render behind `isModuleReady` state
- Event duplication: ensure initial `PHASE/ENTER` published exactly once

## Checklist
- [x] Plan file created
- [x] `FrameworkRouter` initial onEnter support
- [x] `GameHost` selection + persistence
- [x] Module init with lifecycle events
- [x] Error boundary path
- [x] Manual back-to-menu (dev only)
- [x] LocalStorage integration
- [x] URL param integration
- [x] Initial phase event emission validated

## Implementation Notes
Will keep legacy `<App />` temporarily behind a fallback conditional until NameBlame screens are verified through router. Once stable, a subsequent plan will remove `<App />` entirely.

## Completion Criteria
- Selecting a game in menu mounts modular flow
- Refresh keeps same game
- Visiting `?game=nameblame` auto-selects it
- EventBus shows INIT -> READY -> PHASE/ENTER(intro)
- No console errors for missing screens/controllers

---
Progress updates:
2025-09-21: All technical steps implemented. Router initial onEnter now guards duplicate PHASE/ENTER. GameHost handles discovery, selection persistence, lifecycle INIT/READY, and error states. Checklist fully complete.
