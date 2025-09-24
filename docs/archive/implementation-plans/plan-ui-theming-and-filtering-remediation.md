# Plan: UI Theming & Content Filtering Remediation

Status: NEW  
Created: 2025-09-22

## Scope
Address outstanding user-reported regressions & enhancements not yet captured in other plans:
1. Robust Dark Mode Toggle component (functional & accessible)
2. Dynamic background gradient sourced from primary/secondary theme colors (supports dark variant)
3. Question selection / filtering honoring game settings (categoriesPerGame, questionsPerCategory, maxQuestionsTotal, shuffle flags, manual selection)
4. Standardized button sizing on question card (consistent height/typography)
5. Language switch forces full module/game reload (fresh questions & UI translation)
6. Loading card stack animation depth via layered shadows
7. Add Playwright test coverage locking in all above behaviors

## Root Cause Analysis (Consolidated)
| Area | Symptom | Root Cause | Impact |
|------|---------|-----------|--------|
| Dark Mode Toggle | Feature flag true but control missing previously | Conditional render block side-effects & reliance on custom Button variant masking failure path | Users unable to switch theme; trust erosion |
| Dark Mode Effect | Toggling had no visual effect in prod | `tailwind.config.js` uses `darkMode: 'media'` while implementation expects class strategy (`html.dark`) | Functional mismatch causing non-applied dark styles |
| Background Gradient Theming | Static gradient not reflecting configured primary/secondary colors | Hardcoded gradient classes; no utility mapping theme tokens | Inconsistent branding & harder theme adjustments |
| Question Filtering | All questions shown ignoring settings | Provider returns entire list; filtering logic not implemented in pipeline | Game length unpredictable; settings feel ineffective |
| Button Size Inconsistency | Player/next/result buttons different heights/widths | Mixed Tailwind utility stacks applied ad-hoc per button | Visual clutter; tap target inconsistency |
| Language Switch Reload | Language change did not reload questions/UI consistently | i18n changeLanguage invoked without reinitializing provider/module state | Mixed-language UI & stale localized questions |
| Loading Card Stack Depth | Flat appearance; lacks shadow depth | Missing box-shadow layering in `LoadingCardStack` after migration | Reduced visual polish & depth perception |

## Goals / Acceptance Criteria
| Feature | Acceptance Criteria |
|---------|--------------------|
| DarkModeToggle | Visible when feature flag enabled; toggles `html.dark` class; accessible (aria-pressed); persists preference in localStorage; Playwright verifies class add/remove |
| Gradient | Uses CSS vars or inline style deriving from config primary/secondary; updates on theme change; dark mode variant adjusts luminance; test asserts computed background includes both color hexes |
| Question Filtering | Settings reduce question set deterministically; respects manual category pick; max questions property enforced; test seeds settings and asserts displayed total <= configured |
| Button Sizing | All action buttons share identical min-height, padding, font sizing responsive via clamp; test computes bounding box equality within tolerance |
| Language Reload | Changing language triggers provider reset + fresh first question localized; test switches de→en and asserts progress + sample question language changed |
| Loading Shadows | Each stacking card has multi-layer shadow (e.g., 2–3 layered rgba) & elevated z-index; test checks presence of expected shadow class substring |

## Technical Strategy
1. Dark Mode
   - Switch Tailwind to `darkMode: 'class'` (evaluate impact) OR adapt hook to honor media mode fallback.
   - Create `components/framework/DarkModeToggle.tsx` with minimal internal state syncing from `useDarkMode` hook.
   - Persist user preference under storage key (reuse existing localStorage hook).
2. Gradient Utility
   - Add `lib/utils/themeGradient.ts` exporting `buildGradient(theme, isDark)` returning string.
   - Inject via CSS custom property on shell root (e.g., `--app-bg-gradient`).
   - Fallback to static gradient if config incomplete.
3. Question Filtering
   - Create `providers/factories/createQuestionProvider.ts` that:
     - Loads raw questions
     - Applies category filtering (manual picks > random selection limited by categoriesPerGame)
     - Applies per-category question limit
     - Flattens & truncates to maxQuestionsTotal
     - Optional shuffle at category and/or global level based on flags
   - Return wrapped provider implementing ContentProvider interface.
4. Button Standardization
   - Introduce shared class constant (e.g., `QUESTION_ACTION_BUTTON_CLASSES`).
   - Apply flex container distributing space evenly; use `basis-1/2` or grid.
   - Use responsive clamp for font-size & consistent `min-h-[3rem]`.
5. Language Reload
   - Extend language selector onChange handler: await `i18n.changeLanguage(); dispatch(GameAction.RESTART); re-seed provider.`
   - Option fallback: full `location.reload()` if deep state coupling blocks partial reset.
   - Persist chosen language to storage.
6. Loading Shadows
   - Update `LoadingCardStack` card motion element: add multi-shadow style (progressive elevation) & subtle dark-mode variant.
7. Tests
   - Extend foundation test suite; add data-testid hooks where needed (toggle, card shadows, buttons container).

## Edge Cases
- Filtering yields zero questions -> fallback to minimum 1 (first original) & log warning.
- Manual categories fewer than requested categoriesPerGame -> use available subset w/ warning.
- Language switch mid-question during animation: ensure safe abort (guard with isMounted ref).
- Dark mode preference stored but system prefers opposite (choose user override precedence).

## Implementation Checklist
### Theming
- [ ] Tailwind dark mode strategy aligned (class vs media) documented
- [ ] DarkModeToggle component created
- [ ] Preference persistence implemented
- [ ] Playwright dark mode toggle test added
- [ ] Gradient builder utility implemented
- [ ] Shell consumes dynamic gradient (light + dark)
- [ ] Gradient test asserts presence of primary/secondary colors

### Question Filtering
- [ ] Provider factory created
- [ ] Filtering pipeline unit tested
- [ ] Integrated with phase controller/provider init
- [ ] E2E test asserting question count respects settings

### Button Standardization
- [ ] Shared sizing classes constant
- [ ] Applied to question action buttons
- [ ] Visual regression / bbox equality test

### Language Reload
- [ ] Language selector triggers provider reset
- [ ] Question text changes language after switch
- [ ] Preference persisted
- [ ] E2E language switch test

### Loading Shadows
- [ ] Multi-layer shadows added
- [ ] Dark mode shadow variant
- [ ] Shadow presence test

### Documentation & Cleanup
- [ ] Update related existing plan files referencing theming
- [ ] Add section to `progress-summary.md`
- [ ] Remove temporary debug spans/logs in GameShell

## Verification Strategy
- Unit: Filtering pipeline, gradient builder pure function tests.
- E2E: Feature toggles, gradient detection, filtering limits, language switch, shadow presence, button size parity.
- Manual: Quick theme toggle latency (<16ms) & gradient transition smoothness.

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Changing Tailwind dark mode strategy introduces regressions | Audit all `dark:` usages; run visual smoke; keep rollback branch |
| Filtering pipeline performance on large sets | Lazy slice early; avoid repeated shuffles; micro-benchmark if >5ms | 
| Language reload flicker | Use skeleton or maintain current question until new loaded | 
| Shadow performance on low-end devices | Limit to 2-3 layers; avoid large blur radii |

## Completion Definition
Plan considered complete when all checklist items are marked and Playwright suite passes with new tests integrated; documentation updated and no debug artifacts remain.
