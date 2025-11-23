# Fix NameBlame Flow Order and Harden Transitions

## Goal & Expected Behavior
- Ensure NameBlame mode follows the intended flow: Intro -> Player Setup -> (optional Category Pick) -> Loading/Preparing -> Game -> Summary.
- Classic mode remains: Intro -> (optional Category Pick) -> Loading/Preparing -> Game -> Summary.
- Make transitions robust with clear guards and sensible BACK behavior per mode.

## Technical Steps
1. Adjust `games/nameblame/phases.ts` transitions:
   - From `intro`:
     - NameBlame -> `setup`
     - Classic -> `categoryPick` if `selectCategories`, else `preparing`
   - From `setup` (NameBlame only):
     - `ADVANCE` -> `categoryPick` if `selectCategories`, else `preparing`
     - `BACK` -> `intro`
   - From `categoryPick`:
     - NameBlame: `BACK` -> `setup`, `ADVANCE` -> `preparing`
     - Classic: `BACK` -> `intro`, `ADVANCE` -> `preparing`
   - From `preparing`:
     - `ADVANCE` -> `play` (both modes)
   - Keep `play` and `summary` semantics, add small guards where helpful.
2. Update `games/nameblame/game.json` phase order to reflect Setup before Preparing.
3. Harden transitions with provider readiness checks and consistent event publishing.
4. Run Playwright NameBlame suite and iterate until green.

## Edge Cases
- Provider not yet initialized when entering `play`: stay and publish a content event or defer to `preparing`.
- `BACK` from first question should return to `intro` for Classic and NameBlame.
- Manual category selection toggled on/off at runtime: transitions still resolve correctly.
- Zero players in NameBlame setup should block advancement (handled in UI; no change here).

## Impacted Files
- `games/nameblame/phases.ts`
- `games/nameblame/game.json`
- (Docs) `docs/plan-fix-nameblame-flow.md`

## Checklist
- [x] Create plan document
- [x] Update `phases.ts` transitions
- [x] Update `game.json` phase order
- [x] Add/keep guards for provider readiness and event emissions
- [x] Run NameBlame tests and verify flow (flow exercised; unrelated foundation tests still failing)
- [ ] Document completion summary

## Completion Summary
- Implemented target flow for NameBlame: Intro -> Setup -> (optional CategoryPick) -> Preparing -> Play.
- Reordered `game.json` phases to list `setup` before `preparing`.
- Added onEnter hooks to publish `PHASE/ENTER` events for key phases.
- Hardened play transitions with provider-not-ready guard.
- Verified NameBlame question advancement works; broader foundation tests report unrelated translation/UI expectations that are out of scope for this flow fix.

## Notes
- We keep Classic mode logic intact and only adjust ordering for NameBlame.
- `intro.onEnter` still resets provider index and emits content change.
