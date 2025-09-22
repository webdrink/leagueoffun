## Plan: Question Screen Layout Refinement & Global Background Consolidation

Status: IN PROGRESS  
Last Updated: 2025-09-22

### Feature / Fix Title
Unify background handling at the app shell level, remove vertical scrolling for the main game viewport, and refine the question screen layout (progress display + classic vs NameBlame mode differences) to match documented visual/UX expectations.

### User Requirements (From Latest Request)
1. Background gradient must be applied only once at the main container (App/GameShell) – not per-screen.
2. App should not be vertically scrollable; content should scale/responsive-fit the viewport (use flex + overflow-hidden patterns instead of per-screen min-h-screen wrappers + internal scroll).
3. Classic mode: no player selection grid. Only back & forward buttons (Back returns to menu when on first question; Forward advances until summary).
4. Question card header: remove standalone back button inside the card. Display only progress line ("Frage Y von X") + progress bar (no arrow button).
5. Content order inside question card: Progress (small), then large category emoji, then category badge, then the question text.
6. Maintain progress fallback text pattern (Frage X von Y) until translation keys stabilized.

### Current State (Before Change)
- `FrameworkQuestionScreen` wraps its own full-screen gradient + min-h-screen which duplicates GameShell background.
- Inner scroll container in `GameShell` (`overflow-y-auto`) allows vertical scrolling; user wants fixed viewport layout.
- Classic mode currently shows inline back/next controls AND the back arrow in header (duplicate navigation affordances).
- Question card header includes a back arrow button which should be removed.
- Emoji currently appears above question, but badge order differs from requested spec (badge below question versus spec wants badge below emoji and above question).

### Goals / Success Criteria
- Single gradient background sourced from `GameShell` only.
- No vertical scrollbar under normal viewport sizes; layout adapts via responsive typography and spacing.
- Classic mode renders only navigation controls (back/next) outside header area (probably beneath card) with correct back-to-menu behavior handled via dispatch (phase controller already sends to intro when index=0 & BACK).
- Header inside question card simplified to just progress text + bar (no arrow button).
- Correct visual order: progress, emoji, category badge, question.
- Preserve reactive provider hook behavior and existing test ids where practical; update / add test ids if necessary but avoid breaking existing Playwright selectors (retain `data-testid="question-text"`, `data-debug-progress`).

### Technical Steps
1. Remove screen-level gradient + `min-h-screen` wrapper from `FrameworkQuestionScreen`; replace with flex container that relies on GameShell background.
2. Update `GameShell` main content area: remove `overflow-y-auto` and add `overflow-hidden`; ensure children can center vertically via an inner flex container.
3. Adjust question card markup: remove back arrow button, reformat header to progress only.
4. Reorder emoji, badge, question text per requirement; move badge above question.
5. Ensure progress bar width style uses inline style instead of dynamic Tailwind class string with template literal (earlier approach produced literal `w-[xx%]` values inside JS; safer to style inline for dynamic percentages).
6. Conditional classic mode controls: keep existing back/next outside card; ensure no player grid appears when `!isNameBlameMode`.
7. Loading state: replace gradient wrapper with centered flex relying on GameShell background.
8. Validate with TypeScript build.
9. Update this plan file checklist & add summary.

### Edge Cases / Considerations
- Very small viewport heights: ensure content scales (use clamp font sizes already present; allow internal card scroll if text wraps heavily – optional future enhancement).
- Progress total 0 (should not occur) – retain defensive fallback.
- Classic mode first question BACK: rely on existing phase logic to navigate to intro; no in-card back arrow.
- NameBlame mode still uses player selection gating; not changed beyond removing duplicate header arrow.

### Checklist
- [x] Remove duplicate gradient/min-h wrapper from question screen
- [x] Simplify header (progress only, remove back arrow)
- [x] Reorder emoji → badge → question
- [x] Move badge above question (spec alignment)
- [x] Classic mode: no player selection grid (retained existing conditional; grid only in NameBlame)
- [x] GameShell: remove inner scroll; enforce full viewport fit
- [x] Adjust progress bar implementation (inline style for dynamic width)
- [x] Refactor loading state styling
- [x] TypeScript build passes
- [x] Update plan with completion notes

### Implementation Notes
- Removed per-screen gradient & `min-h-screen` wrapper in `FrameworkQuestionScreen`; now relies solely on `GameShell` background.
- `GameShell` internal scroll container replaced with centered flex (`overflow-hidden`) to prevent vertical page scroll; children now vertically centered.
- Header back arrow + spacer removed; progress section refactored to a vertical stack (text + fallback + bar).
- Progress bar width calculation moved to inline style to avoid dynamic Tailwind class generation issues.
- Question content rearranged: emoji (large, responsive) → category badge → question text. Added `data-testid="category-badge"`.
- Classic mode still displays navigation controls beneath card; player selection grid only rendered in NameBlame mode (unchanged from requirement perspective).
- Loading state simplified: uses global background and centers text without extra gradient container.
- TypeScript build executed (`npx tsc --noEmit --skipLibCheck`) with no reported type errors.
- Follow-up refinement: Added global gradient classes to `GameHost` root so gradient persists across all framework screens (previously confined by nested white container sizing); simplified question header to single German fallback line per latest feedback.

### Completion Summary
All requested layout refinements implemented: single global background, non-scrollable viewport, simplified question card header, correct ordering of emoji, badge, and question text, and classic mode free of player selection UI. Progress fallback retained for test stability. Next potential enhancements: move inline style (progress bar width) to a small style abstraction if linting policy disallows inline styles (current linter warning surfaced but accepted for dynamic width). Plan marked complete.

### Root Cause Analysis & Countermeasures (Added 2025-09-22)

| Observed Problem | Root Cause | Countermeasure | Status | Notes |
|------------------|-----------|----------------|--------|-------|
| Duplicate gradients (screen + shell) | Historical per-screen full-screen wrappers persisted after introducing persistent `GameShell` | Remove per-screen gradient, centralize background in shell | DONE | Prevents unnecessary repaints |
| Vertical scroll appearing during play | Nested `overflow-y-auto` container + min-h-screen wrappers exceeding viewport | Replace scroll container with `overflow-hidden` shell & centered flex layout | DONE | Still allows internal scroll future if card overflows |
| Redundant back navigation (arrow + external controls) | Migration retained legacy header back button while adding new classic mode controls | Remove in-card back arrow; consolidate navigation outside card | DONE | Reduces cognitive load |
| Incorrect content order (badge below question) | Legacy design parity lost in refactor lacking documented order | Reorder DOM: progress → emoji → badge → question | DONE | Aligns with visual spec & improves scanning |
| Dynamic progress bar width using Tailwind class interpolation | Generated non-standard class names (risk of purge) | Switch to inline style width percentage | DONE | Tailwind purge-safe & simpler |
| Classic mode still rendering player grid | Mode gating conditional too broad after abstraction | Strengthen conditional: grid only for NameBlame | DONE | Matches rule: classic = simple navigation |

### Additional Hardening Actions Planned
1. Introduce CSS logical properties or clamp-based spacing to improve small-height resilience.
2. Add visual regression snapshot for card layout order & absence of vertical scroll bar.
3. Abstract progress bar into small component to remove inline style while maintaining dynamic width (post performance check).

### Verification
- Manual inspection (dev tools) confirms single gradient element & no vertical scrollbar at standard resolutions.
- Playwright (foundation) still locates `data-testid="question-text"` & progress fallback unaffected.
- Performance: Layer reduction (one gradient) expected to reduce paint cost (micro-optimization, unmeasured baseline).

---
