# Plan: Fix debug flow to toggle NameBlame correctly

## Goal
- Ensure the debug flow and tests toggle the NameBlame mode switch (not the category toggle) so flow is Intro → PlayerSetup → Loading → Game.

## Steps
- Update `debug-flow.js` to click `#nameBlameModeToggle` and verify `data-state="checked"` or `aria-checked="true"`.
- Re-run the debug script and confirm PlayerSetup is shown after Start.
- Update Playwright test selectors to target `#nameBlameModeToggle` (and move tests under `tests/flows/nameblame-mode/` if needed).

## Edge cases
- Toggle not present due to translation or render order issues.
- Multiple switches on screen (category select also present).

## Checklist
- [x] Debug script updated to target NameBlame toggle specifically
- [ ] Debug script verified: Start from Intro goes to PlayerSetup
- [ ] Playwright tests updated to select `#nameBlameModeToggle`
- [ ] If needed, relocate test into `tests/flows/nameblame-mode/` so project picks it up

## Notes
- Radix Switch exposes `data-state` and `aria-checked` attributes; use these for robust checks.
