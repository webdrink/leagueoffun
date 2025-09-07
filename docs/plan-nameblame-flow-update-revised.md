## Plan: NameBlame Mode Flow Update & Testing (REVISED)

### 1. Feature / Fix Title
**CRITICAL FIX**: Refine NameBlame mode to enforce minimum 3 named players, always show setup screen, hide unnamed players, fix broken rotation logic, implement proper blame acknowledgement phase, add multilingual hints, and add comprehensive Playwright tests.

### 2. Goals & Expected Behavior (CRITICAL ISSUES IDENTIFIED)

1. **Player Setup Requirements (CRITICAL)**
   - Minimum 3 named players required for NameBlame mode (currently broken - uses 2). 
   - Start button disabled (grey) until 3 valid names entered.
   - A localized hint text appears explaining the requirement (new translation key).
   - Unnamed player slots are NOT rendered as selectable buttons in blame phase.
   - **CRITICAL**: When switching to NameBlame mode OR enabling NameBlame toggle, ALWAYS force user to Player Setup screen (no auto-start into game even with stored players).

2. **Game Start & Player Order (CRITICAL BUG FIX)**
   - On entering NameBlame mode: if <3 players (after filtering names) cannot proceed.
   - **NEW**: Random starting player selection at game start (currently missing).
   - Player order for a round: choose random starting player, then rotate through remaining players in stable order with no repeats until all have had a turn, then wrap.
   - **FIX**: The current rotation logic has serious bugs causing wrong player sequences as described in user scenario.

3. **Blame Flow (MAJOR REWORK NEEDED)**
   - **CURRENT ISSUE**: Question advances immediately after blame selection, breaking the acknowledgement flow.
   - **USER SCENARIO BUG**: "Seez starts -> selects Test, then suddenly GitHub Copilot is at turn" indicates broken rotation.
   - **NEW FLOW**:
     - Phase A: "selecting" → current player sees question + player buttons to blame.
     - After selecting blame target: phase transitions to "blamed" → UI shows context to blamed player: "{blamer} blamed you for:" + the question. NO player selection buttons visible.
     - Blamed player presses "Next to blame" button to advance.
     - After acknowledgment: advance to NEXT player (not the blamed player), fetch next question, phase back to "selecting".
   - **CRITICAL**: Question must NOT auto-advance on blame; must wait for acknowledgement button.

4. **Translation Gaps (MISSING KEYS)**
   - `players.min_players_nameblame_hint`: "You need at least 3 players for NameBlame mode." (DE: "Du brauchst mindestens 3 Spieler für den NameBlame Modus.")
   - Verify/fix `questions.blamed_you_for`: "{blamer} blamed you for:" across all languages.
   - Verify/fix `questions.next_blame`: "Next to blame" / "Weiter" across all languages.
   - **NEW**: Add proper turn indicators for the blamed acknowledgement phase.

5. **Testing (COMPREHENSIVE COVERAGE)**
   - Playwright tests verifying setup restrictions, hint visibility, button states, flow phases, and rotation integrity.
   - **CRITICAL**: Test the exact scenario described: 3 players (Seez, GitHub Copilot, Test) and verify proper rotation without duplicates.

### 3. Technical Changes (DETAILED IMPLEMENTATION)

1. **PlayerSetupScreen.tsx (CRITICAL CHANGES)**
   - Add `nameBlameMode` prop to component interface.
   - Change disabled logic from `players.length < 2` to conditional: `nameBlameMode ? players.filter(p => p.name.trim()).length < 3 : players.length < 2`.
   - Add hint display when NameBlame active and <3 players.
   - Update minimum players warning text to be context-aware.

2. **App.tsx (MAJOR FLOW FIXES)**
   - **FIX handleStartGameFlow**: Change NameBlame check from `< 2` to `< 3` players.
   - **NEW**: Add logic to ALWAYS force playerSetup when NameBlame mode is enabled (even with stored players).
   - **FIX**: Add random starting player selection in game initialization.
   - **FIX handleBlame**: Remove automatic question advancement; only transition to 'blamed' phase.
   - **FIX handleNextBlame**: Properly advance to next player in rotation AND advance question.
   - **FIX advanceToNextPlayer**: Fix rotation logic to prevent duplicate consecutive turns.

3. **IntroScreen.tsx (NEW REQUIREMENT)**
   - When NameBlame toggle is changed, immediately set gameStep to 'playerSetup' if toggled ON.
   - Add callback prop for handling mode change navigation.

4. **QuestionScreen.tsx (VERIFICATION)**
   - Verify phase-based conditional rendering works correctly.
   - Ensure blamed acknowledgement phase displays correctly.
   - Confirm no empty player buttons are rendered.

5. **Translation Files (ALL LANGUAGES)**
   - Add `players.min_players_nameblame_hint` key to `de.ts`, `en.ts`, `es.ts`, `fr.ts`.
   - Verify consistency of blame-related keys across all languages.

6. **Hook useNameBlameSetup.ts (POTENTIAL UPDATE)**
   - Consider adding method to check minimum players for NameBlame mode.
   - Ensure blame state management is robust.

### 🚨 **CONSOLE ANALYSIS UPDATE - CORRECTED PRIORITIES**

**GOOD NEWS**: Console output shows rotation logic is working PERFECTLY:
- Seez (index 0) → GitHub Copilot (index 1) → Test (index 2) → Seez (index 0)
- No duplicate consecutive turns, proper wraparound

**REAL ISSUE**: Questions auto-advance immediately after blame selection, completely bypassing the acknowledgement phase.

### 4. Critical Bugs Found in Current Implementation (REVISED)

1. ~~**Rotation Bug**~~: ✅ **WORKING CORRECTLY** - Console shows perfect rotation sequence
2. **Auto-advance Bug**: ❌ **CRITICAL** - Question automatically advances when blame is selected, preventing acknowledgement phase
3. **Missing Acknowledgement Phase**: ❌ **CRITICAL** - No UI state for blamed player to see blame context and click "Next"
4. **Setup Bypass Bug**: ❌ **CRITICAL** - NameBlame mode can start without going through setup if players are stored
5. **Minimum Players Bug**: ❌ **NEEDS FIX** - Currently allows 2 players for NameBlame mode
6. ~~**Random Start Missing**~~: ⚠️ **LOWER PRIORITY** - Rotation logic works fine with any starting player

### 5. Testing Strategy (COMPREHENSIVE)

1. **Unit Tests for Logic**
   - Test player rotation logic in isolation.
   - Test minimum player validation.
   - Test blame phase transitions.

2. **Playwright Integration Tests**
   - `nameblame-setup-validation.spec.ts`: Test all setup requirements.
   - `nameblame-flow-basic.spec.ts`: Test complete blame flow with 3 players.
   - `nameblame-rotation.spec.ts`: Test exact user scenario (Seez, GitHub Copilot, Test).
   - `nameblame-persistence.spec.ts`: Test setup screen forced display.
   - `nameblame-translations.spec.ts`: Test hint visibility and correct translations.

### 6. Implementation Order (UPDATED PRIORITIES)

1. **HIGHEST PRIORITY**: Fix auto-advance bug in `handleBlame()` - remove `advanceToNextPlayer()` call
2. **HIGHEST PRIORITY**: Implement blame acknowledgement phase UI properly  
3. **HIGH PRIORITY**: Fix PlayerSetupScreen 3-player requirement + hint
4. **HIGH PRIORITY**: Fix setup screen bypass (always show setup for NameBlame)
5. **MEDIUM PRIORITY**: Add missing translation keys
6. **LOW PRIORITY**: Add comprehensive Playwright tests
7. **LOWEST PRIORITY**: Random starting player (rotation works fine as-is)

### 7. Success Criteria (MEASURABLE)

- [ ] NameBlame mode requires exactly 3+ players (tested)
- [ ] Start button disabled with <3 players in NameBlame (tested)
- [ ] Hint text appears and is translated correctly (tested)
- [ ] Setup screen always appears when NameBlame enabled (tested)
- [ ] Random starting player selected (verified in logs)
- [ ] Blame phase doesn't auto-advance question (tested)
- [ ] Blamed acknowledgement works correctly (tested)
- [ ] Player rotation follows correct sequence (tested with exact user scenario)
- [ ] No duplicate consecutive turns (tested)
- [ ] All translation keys present in all languages (verified)

### 8. Risk Assessment

- **HIGH RISK**: Game flow changes could break existing Classic mode
- **MEDIUM RISK**: Translation changes could cause missing key errors
- **LOW RISK**: UI changes are mostly additive

### 9. Rollback Plan

- Keep existing logic as fallback in comments
- Implement feature flags for new vs old behavior
- Maintain backward compatibility for saved game states

---

This revised plan addresses the critical bugs identified in the current NameBlame implementation and provides a clear roadmap for fixing the user-reported issues.

This plan will be referenced in `docs/todo.md` and updated with progress notes during implementation.