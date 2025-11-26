# Theme Standardization Plan

## Overview
Eliminate lingering purple/pink styling, ensure runtime UI respects configurable theme values, and design a reusable theme application flow that keeps future games aligned with shared palettes.

## Goals & Expected Behavior
- No hard-coded `purple-*`, `pink-*`, or related gradient classes remain in runtime-facing code.
- Theme colors and gradients derive from config-driven values with sensible fallbacks.
- Components consume centralized helpers/hooks instead of duplicating Tailwind class strings.

## Technical Steps
- Audit runtime components, utilities, config, and assets for legacy color tokens.
- Identify where config theme data is read and how it flows through hooks and components.
- Prototype an approach (e.g., CSS variables or helper) to apply config theme colors globally.
- Update affected components/tests to use the standardized approach.

## Potential Edge Cases
- Dark mode rendering and animated gradients must still work.
- Tests or docs asserting old colors require updates.
- PWA manifest and meta tags might need aligned branding.

## Impacted Areas
- Framework intro/host screens, core intro screen, gradient utilities, Tailwind classes, Playwright tests, documentation.

## Task Checklist
### Audit & Research
- [x] Catalogue all runtime purple/pink references (components, utils, styles, manifests, tests, docs).
	- Runtime hotspots: `games/nameblame/game.json` (legacy gradient & colors), `components/debug/LanguageTester.tsx` (debug UI styling), `components/framework/FrameworkSummaryScreen.tsx` (accent fallback), `components/core/FooterButton.tsx` (docstring), `components/settings/SeasonSelector.tsx` (spring description), Playwright specs targeting `.bg-pink-*` selectors, and archived docs referencing old palette.
	- Generated bundles (`dist/`, `playwright-report/`) also contain legacy classes; treat as build artifacts.
- [x] Trace theme config consumption path (`game.schema.ts`, hooks, stores, components).
	- `game.schema.ts` provides `ui.theme` colors/gradient defaults, but `GameShell`, `FrameworkIntroScreen`, and other framework wrappers currently ignore these values in favor of `useTheme` seasonal gradients. Only `theme.cardBackground` is consumed.
	- `useTheme` derives gradients via season/time-of-day and applies them globally, independent of config; theme values are not bubbled into Tailwind classes.

### Implementation Design
- [ ] Draft centralized theme application approach (e.g., CSS variables, helper updates) with pros/cons.
- [ ] Validate approach against dark mode and animation requirements.

### Execution
- [ ] Replace remaining purple/pink classes in runtime code with config-driven equivalents.
- [ ] Update tests/docs to match new palette expectations.
- [ ] Align PWA manifest/theme metadata with autumn palette or config values.

### Validation
- [ ] Run lint/build/tests as needed to ensure no regressions.
- [ ] Document new theme flow and usage guidelines.

## Notes
- Updated NameBlame Playwright specs to target autumn classes instead of `.bg-pink-*` (`comprehensive-player-setup`, `comprehensive-edge-cases`, `blame-progression`).
- Refreshed `category-selection-fix-test.spec.ts` to expect `border-autumn-500` on selected labels.
- Tablet landscape readability check now validates autumn/rust gradient colors on the primary start button.
- `GameShell` now derives header gradients and tagline accent colors from `ui.theme.colors` with autumn defaults, keeping the layout responsive to config overrides.