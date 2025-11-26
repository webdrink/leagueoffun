# Plan: Wire Config-Driven Settings To Gameplay (NameBlame)

## Goal
- Make the in-game Settings panel actually persist user changes and affect NameBlame gameplay immediately.
- Keep settings config-driven using `games/nameblame/game.json` and the framework schema.

## Expected Behavior
- Opening Settings shows current values (merged: defaults from config + previously saved values).
- Saving Settings persists them (namespaced per game) and updates the running game (question count, shuffles, etc.).
- Reopening Settings shows the saved values.
- Question total and progression reflect updated limits (e.g., set 10 total → progress shows 1/10).

## Technical Steps
- Add `SETTINGS/UPDATED` event to EventBus so modules can react to changes.
- In `GameShell`:
  - Load initial settings from storage key `game.settings.{gameId}` merged with `config.gameSettings`.
  - Pass settings to `GameSettingsPanel`.
  - On save/reset: persist to storage and publish `SETTINGS/UPDATED` with `{ gameId, settings }`.
- In `NameBlameModule`:
  - On init: read persisted settings and merge with `config.gameSettings`.
  - Build the question provider using those values and current language.
  - Subscribe to `SETTINGS/UPDATED` and rebuild the provider when settings change; publish `CONTENT/NEXT` to refresh UI.
  - For tests, expose full raw question dataset via `window.gameQuestions` and categories via `window.gameCategories`.

## Files Impacted
- framework/core/events/eventBus.ts → add new event type.
- components/framework/GameShell.tsx → load/save/publish settings.
- games/nameblame/NameBlameModule.tsx → consume settings at init + subscribe to updates; set window globals from raw data.

## Edge Cases
- Missing or corrupted localStorage → fall back to config defaults.
- Setting `maxQuestionsTotal` > available → provider trims; UI still shows correct total.
- Language changes → provider rebuild uses `window.i18next.language` if present.
- Manual category selection (future) → hooks present in settings object; respected if provided.

## Checklists
- [x] Event type added (SETTINGS/UPDATED)
- [x] Settings persisted per game id
- [x] Settings applied to question provider at init
- [x] Settings updates rebuild provider live
- [x] Settings re-open shows saved values
- [x] Tests can still access window.gameQuestions (full dataset)

## Implementation Notes
- Storage uses framework adapter (namespaced, versioned) to avoid clashing with legacy keys.
- Publishing `CONTENT/NEXT` after rebuild triggers `useProviderState` to refresh progress + current question.
- For dynamic settings UI, current panel maps to schema fields; future improvement: add UI hints (min/max) in config to drive sliders.

## Completion Summary
- The Settings panel now affects gameplay and persists changes.
- NameBlame provider consumes and reacts to settings.
- Window globals now expose complete datasets for foundation tests while gameplay uses filtered provider.
