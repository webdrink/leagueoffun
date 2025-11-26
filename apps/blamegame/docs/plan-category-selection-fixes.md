# Plan: Category Selection UI/ARIA Fixes and Dynamic Counts

## Goal
Fix the category selection screen so that:
- Category titles are always visible and not clipped.
- Overflowing checkboxes are removed (accessible selection without visual inputs).
- Question counts per category are accurate (not always "10 Fragen").
- Max selectable categories is driven by settings, not hardcoded.
- Validate with Playwright and keep screenshots for verification.

## Technical Steps
1. Replace visible checkbox control with an accessible, keyboard-operable tile:
   - Use label as the clickable container with role=button and keyboard handlers (Enter/Space).
   - Remove visual Checkbox component to prevent overflow.
   - Keep focusability with tabIndex.
2. Ensure category titles render and wrap:
   - Add `break-words`/`line-clamp-2` to title block.
3. Make counts dynamic:
   - Classic flow: already provided via `App.tsx -> allCategoriesInfo` using `getCategoriesWithCounts`.
   - Framework flow: compute counts from `window.gameCategories` (populated by module provider) and bind into `FrameworkCategoryPickScreen`.
4. Use settings for max category selection:
   - Classic: already passes `maxSelectable={gameSettings.categoryCount}`.
   - Framework: read from `useGameSettings().categoryCount`.
5. Verify via Playwright tests and screenshots.

## Edge Cases
- No questions loaded yet: counts fallback to 0.
- Very long category names: ensure wrapping and clamping.
- Keyboard-only users: Enter/Space toggles selection reliably.

## Impacted Files
- `components/game/CategoryPickScreen.tsx`
- `components/framework/FrameworkCategoryPickScreen.tsx`

## Checklist
- [x] Remove visible checkboxes and implement accessible tiles
- [x] Ensure category titles visible with wrapping
- [x] Dynamic question counts in classic flow
- [x] Dynamic question counts in framework flow
- [x] Use settings for max selection in both flows
- [ ] Run Playwright tests and review screenshot(s)
- [ ] Summarize results and completion notes

## Notes
If further accessibility polish is desired, we can convert the grid to a `role="grid"` with `aria-selected` on options. For now, keyboard navigation and clear focus/focus-visible styles are preserved.