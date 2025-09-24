# Config-Driven Settings UI

Build your game’s Settings UI entirely from your game.json config—no manual wiring per control.

## TL;DR
- Define settings fields in `game.json` under `ui.settings.fields`.
- The framework renders the Settings panel dynamically from this schema.
- Saving persists per game and broadcasts `SETTINGS/UPDATED` so modules refresh instantly.

## 1) Define settings in game.json

Add a `settings` section under `ui` with fields describing each control. Example (NameBlame):

```jsonc
{
  "ui": {
    "settings": {
      "fields": [
        { "key": "categoriesPerGame", "type": "number", "label": "settings.categories_per_game", "group": "content", "min": 1, "max": 20, "step": 1, "order": 1 },
        { "key": "questionsPerCategory", "type": "number", "label": "settings.questions_per_category", "group": "content", "min": 1, "max": 50, "step": 1, "order": 2 },
        { "key": "maxQuestionsTotal", "type": "number", "label": "settings.max_questions_total", "group": "content", "min": 1, "max": 100, "step": 1, "order": 3 },
        { "key": "allowRepeatQuestions", "type": "boolean", "label": "settings.allow_repeat_questions", "group": "behavior", "order": 1 },
        { "key": "shuffleQuestions", "type": "boolean", "label": "settings.shuffle_questions", "group": "behavior", "order": 2 },
        { "key": "shuffleCategories", "type": "boolean", "label": "settings.shuffle_categories", "group": "behavior", "order": 3 },
        { "key": "allowSkipQuestions", "type": "boolean", "label": "settings.allow_skip_questions", "group": "behavior", "order": 4 },
        { "key": "showProgress", "type": "boolean", "label": "settings.show_progress", "group": "behavior", "order": 5 },
        { "key": "enableSounds", "type": "boolean", "label": "settings.enable_sounds", "group": "experience", "order": 1 },
        { "key": "enableAnimations", "type": "boolean", "label": "settings.enable_animations", "group": "experience", "order": 2 }
      ]
    }
  },
  "gameSettings": {
    // defaults
  }
}
```

Tip: Use i18n keys in `label` and define translations (e.g. `settings.categories_per_game`). Optional group titles can be translated with `settings.group.{group}`.

## 2) What the framework provides

- Schema support in `framework/config/game.schema.ts`:
  - `ui.settings.fields[]` with types, ranges, groups, and ordering.
- Dynamic panel: `components/framework/GameSettingsPanel.tsx`
  - Renders sliders for `type: number`, checkboxes for `type: boolean`.
  - Groups sections by `group` and sorts by `order`.
- Persistence & events: `components/framework/GameShell.tsx`
  - Loads initial settings = `config.gameSettings` merged with any saved overrides for this game id.
  - On Save/Reset: saves per-game (namespaced) and publishes `SETTINGS/UPDATED`.

## 3) How modules consume settings

- NameBlame example: `games/nameblame/NameBlameModule.tsx`
  - On init: reads merged settings (defaults from `config.gameSettings` + persisted overrides) and the current language.
  - Builds the question provider using these values (categories per game, max totals, shuffle flags, etc.).
  - Subscribes to `SETTINGS/UPDATED` to rebuild the provider live and publish a content update so the UI refreshes immediately.

Pseudo-flow:
```
GameShell (Save)
 ├─ persist: game.settings.{gameId}
 └─ publish: { type: 'SETTINGS/UPDATED', gameId, settings }
 
NameBlameModule
 ├─ init(): read persisted + defaults, build provider
 └─ on SETTINGS/UPDATED: rebuild provider with new settings
```

## 4) Access settings in components

- If a component needs to react to current totals/progress (e.g., progress bar), rely on the provider-powered hooks (`useProviderState`) that already reflect the rebuilt provider.
- If you need raw settings, read them from your store or pass them down from `GameShell` context if required.

Common patterns:
- Use provider progress to display `Frage X von N`.
- Avoid direct localStorage calls in components—let the framework handle persistence.

## 5) Best practices

- Keep defaults in `game.json` under `gameSettings` and avoid hardcoding in components.
- Use i18n keys for labels and optional group headings (`settings.group.content`, `settings.group.behavior`, `settings.group.experience`).
- Prefer reacting to `SETTINGS/UPDATED` in your module (rebuild content providers, recalc caches) rather than pushing state into many components.
- For tests, you can still expose full datasets on `window.gameQuestions`/`window.gameCategories` while gameplay uses filtered settings.

## 6) Example: Minimal integration checklist

- [ ] Add fields to `ui.settings.fields` in your game’s `game.json`.
- [ ] Add defaults to `gameSettings` in the same file.
- [ ] Ensure your module’s `init` reads persisted overrides and merges with defaults.
- [ ] Subscribe to `SETTINGS/UPDATED` to rebuild any providers.
- [ ] Reference provider progress/state in your screens to reflect new totals.

## 7) Events and storage keys

- Event: `{ type: 'SETTINGS/UPDATED', gameId, settings }`
- Storage key: `game.settings.{gameId}` (namespaced via framework storage adapter)

## 8) Troubleshooting

- “Settings don’t stick” → Confirm game id matches between your config and storage key; verify Save is called.
- “UI didn’t change after saving” → Ensure your module subscribes to `SETTINGS/UPDATED` and rebuilds state; confirm a content refresh event is sent.
- “Total questions doesn’t match sliders” → Verify provider respects `maxQuestionsTotal` and per-category selections; ensure progress reads from provider.

---

With this setup, your games can ship customizable, persistent settings without bespoke UI or plumbing—just declare fields in config and react in your module.
