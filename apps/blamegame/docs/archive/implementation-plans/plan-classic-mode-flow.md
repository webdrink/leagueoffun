# Plan: Classic Mode Setup Skip & PlayerSetup Integration

## Goal
Implement correct game flow so that when gameMode is `classic`, the Player Setup phase is skipped (intro -> play). When `nameBlame` is active, retain intro -> setup -> play. Also wrap Player Setup screen with persistent header/footer using `GameShell`.

## Desired Behavior
- User toggles NameBlame mode on Intro screen.
- Toggle persists to global `gameSettings.gameMode` (zustand + localStorage).
- On pressing Start Game (ADVANCE action):
  - If `gameMode === 'classic'` => transition directly to `play` phase.
  - If `gameMode === 'nameBlame'` => transition to `setup` phase.
- Player setup screen now visually consistent with other screens (header/footer persistent).

## Technical Steps
1. Wire Intro screen gameMode toggle to global store via `useGameSettings` (remove local-only state).
2. Update phase controller for `intro` in `games/nameblame/phases.ts` to inspect current gameMode from the store (import `useGameStore.getState()`). Conditional `GOTO` to `play` or `setup`.
3. Refactor `FrameworkPlayerSetupScreen` to render inside `<GameShell>`; extract card content; remove full-screen gradient.
4. Adjust card/container styling for setup screen to prevent double padding and ensure scroll inside main area.
5. Documentation: Record implementation notes & edge cases here, mark checklist when done.

## Edge Cases
- Missing or undefined gameMode -> default to 'classic'.
- Rapid toggle + immediate start (ensure store update before dispatch). We'll update store synchronously before dispatch.
- Direct deep link into setup while in classic mode (should still show but ideally unreachable; out of scope now).
- Local storage corruption -> fallback to initialGameSettings.

## Impact
- Touch files: `FrameworkIntroScreen.tsx`, `games/nameblame/phases.ts`, `FrameworkPlayerSetupScreen.tsx`.
- Docs updated: this plan file.

## Checklist
- [x] Intro toggle uses store `gameSettings.gameMode` value
- [x] Store updates on toggle immediately
- [x] Phase controller conditional skip implemented
- [x] Setup screen wrapped in GameShell
- [x] Styling consistent (header/footer visible, internal scroll works)
- [x] Document completion summary

## Notes / Implementation Log
2025-09-21 1: Wired intro screen to `useGameSettings` replacing local only state.
2025-09-21 2: Added conditional transition in `phases.ts` reading zustand store to skip setup when classic.
2025-09-21 3: Refactored `FrameworkPlayerSetupScreen` to wrap with `GameShell` and updated dark mode aware styles.

## Completion Summary
Implemented classic mode skip logic: Intro ADVANCE now routes directly to `play` when `gameSettings.gameMode !== 'nameBlame'`. Intro screen toggle now persists mode via global store ensuring transition logic reads up-to-date value. Player setup screen integrated into `GameShell` providing persistent header/footer, dark mode styling, and consistent card UI. Plan checklist fully satisfied. Potential future enhancement: guard against manual navigation to setup while in classic mode (not required now).


