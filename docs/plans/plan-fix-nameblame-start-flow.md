# Plan: Fix NameBlame Start Flow

## Goal
Ensure the game flow for NameBlame mode is: Intro → PlayerSetup → Loading → Game. Prevent the current incorrect sequence where Loading appears before PlayerSetup.

## Expected Behavior
- Classic mode: Intro → (optional CategoryPick) → Loading → Game
- NameBlame mode:
  - From Intro: always go directly to PlayerSetup
  - From PlayerSetup after enough players (≥3): proceed to Loading → Game
  - No Loading screen should appear before PlayerSetup in NameBlame mode

## Technical Steps
- Split start logic into two entry points to avoid race conditions:
  - handleStartFromIntro: handles IntroScreen "Start Game" button
  - handleStartAfterSetup: handles PlayerSetupScreen "Start Game" button
- Extract common loading logic into proceedToLoadingAndPrepare()
- Wire IntroScreen.onStartGame to handleStartFromIntro
- Wire PlayerSetupScreen.onStartGame to handleStartAfterSetup
- Keep existing category pick logic only in handleStartFromIntro

## Edge Cases
- User toggles NameBlame and clicks Start immediately (race): Intro handler still routes to PlayerSetup
- Insufficient players in NameBlame: PlayerSetup Start is blocked until ≥3 players
- No questions available: show error; no flow progression

## Impact
- App.tsx: refactor start flow and handlers
- No changes to UX besides fixing the incorrect screen order

## Checklist
- [x] Add plan file
- [x] Implement split handlers in App.tsx
- [x] Extract proceedToLoadingAndPrepare()
- [x] Update component props to use new handlers
- [x] Fix CategoryPickScreen flow for NameBlame mode
- [ ] Manual test NameBlame flow
- [ ] Create Automatic test for phase transition inside NameBlame flow
- [ ] Manual test Classic flow
- [x] Add brief implementation notes

## Implementation Notes
- Added a safeguard inside proceedToLoadingAndPrepare to redirect to PlayerSetup if NameBlame has <3 players, preventing any accidental loading flashes from other paths.
- **Root Cause Found**: CategoryPickScreen was calling `handleStartFromIntro()` after category selection, which would re-run the full intro flow logic including potential loading screen. Fixed by making CategoryPickScreen.onConfirm directly route to playerSetup for NameBlame mode instead of calling the intro handler.
