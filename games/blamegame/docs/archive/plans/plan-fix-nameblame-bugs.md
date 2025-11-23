# Plan: Fix NameBlame Player Management & Blame Selection Bugs

## 🐛 Bug Title
**CRITICAL**: Fix player deletion restrictions and multiple blame selection issues in NameBlame mode

## 🎯 Problems Identified

### 1. Player Deletion Bug *(HIGH PRIORITY)*
**Issue**: Cannot delete players when only 2 remain in player setup
- Users cannot reset to 0 players to start fresh
- Must add a 3rd player before being able to delete any of the existing 2
- This creates a poor UX where users get "stuck" with unwanted players

**Expected Behavior**:
- Allow deletion of players down to 0 players
- Only enforce 3-player minimum when trying to START the game
- Validation should happen at game start, not during player management

### 2. Multiple Blame Selection Bug *(CRITICAL)*
**Issue**: Player can blame multiple players for the same question
- Console shows Pat blamed both "Maus" and "Jack" for the same question
- No UI state management to prevent multiple selections
- Question doesn't advance after first blame selection
- Same question repeats after each blame action

**Expected Behavior**:
- Allow only ONE blame selection per question
- After blame selection, move to acknowledgement phase
- Disable all blame buttons after selection until acknowledgement
- Advance to next question after acknowledgement

## 🔍 Root Cause Analysis

### Player Deletion Issue
- `PlayerSetupScreen.tsx` enforces 3-player minimum during deletion
- Validation logic incorrectly applied during editing instead of at game start
- Minimum player check should be separated from deletion restrictions

### Multiple Blame Selection Issue
- Missing state management for "blame already selected" condition
- No UI disabling after first blame selection
- Blame state not properly preventing multiple actions
- Phase transitions not working correctly

## 🛠️ Technical Implementation

### 1. Fix Player Deletion Logic

**File**: `PlayerSetupScreen.tsx`
```typescript
// Current problematic logic:
const canRemovePlayer = nameBlameMode ? players.length > 3 : players.length > 2;

// Fixed logic:
const canRemovePlayer = players.length > 0; // Always allow deletion during setup
```

**Changes**:
- Remove minimum player restriction during player management
- Keep validation only for the "Start Game" button
- Allow users to delete all players and start fresh

### 2. Fix Multiple Blame Selection

**File**: `App.tsx` - `handleBlame` function
```typescript
// Add blame selection state management
const [blameSelectionMade, setBlameSelectionMade] = useState(false);

const handleBlame = useCallback((blamedPlayer: Player) => {
  // Prevent multiple selections
  if (blameSelectionMade) {
    console.log("❌ Blame already selected for this question");
    return;
  }
  
  setBlameSelectionMade(true);
  // ... existing blame logic
}, [blameSelectionMade, /* other deps */]);
```

**File**: `QuestionScreen.tsx`
```typescript
// Disable blame buttons after selection
<Button
  disabled={blameSelectionMade || player.name === currentPlayer?.name}
  // ... other props
>
```

### 3. Proper Phase Management

**Updates to blame flow**:
1. **Selection Phase**: Show question + enabled blame buttons
2. **Blame Made**: Disable all buttons, show "blame recorded" state
3. **Acknowledgement Phase**: Show "Next to blame" button to blamed player
4. **Advance**: Move to next question and reset blame selection state

## 🧪 Testing Strategy

### Manual Testing Scenarios
1. **Player Deletion Test**:
   - Add 3 players
   - Delete down to 1 player (should work)
   - Delete down to 0 players (should work)
   - Try to start with <3 players (should be blocked)

2. **Blame Selection Test**:
   - Start NameBlame game with 3 players
   - Select first blame target
   - Verify other buttons become disabled
   - Verify question doesn't repeat
   - Complete acknowledgement flow

### Automated Tests
- Add Playwright test for player deletion edge cases
- Add test for blame selection state management
- Test phase transition integrity

## 📝 Implementation Steps

### Step 1: Fix Player Deletion *(Immediate)*
1. Update `PlayerSetupScreen.tsx` deletion logic
2. Separate deletion rules from game start validation
3. Test player management flow

### Step 2: Fix Blame Selection State *(Critical)*
1. Add blame selection state to App.tsx
2. Update QuestionScreen.tsx to handle disabled state
3. Implement proper phase transitions
4. Reset blame state on question advance

### Step 3: Validation & Testing
1. Manual test both fixes
2. Add automated test coverage
3. Verify no regressions in Classic mode

## ✅ Success Criteria

- [ ] Can delete players down to 0 in player setup
- [ ] 3-player minimum only enforced at game start
- [ ] Only one blame selection allowed per question
- [ ] Blame buttons disabled after selection
- [ ] Proper acknowledgement flow works
- [ ] Question advances correctly after acknowledgement
- [ ] No duplicate blame selections in console
- [ ] Classic mode unaffected

## 🚨 Risk Assessment

**LOW RISK**: These are isolated bug fixes that don't affect core architecture
- Player deletion is contained to setup screen
- Blame selection state is additive functionality
- Changes are backwards compatible

## 📋 Files to Modify

1. `components/game/PlayerSetupScreen.tsx` - Fix deletion logic
2. `App.tsx` - Add blame selection state management
3. `components/game/QuestionScreen.tsx` - Handle disabled state
4. `tests/flows/nameblame-mode/critical-fixes.spec.ts` - Add test coverage

---

**Priority**: CRITICAL - Blocks normal NameBlame gameplay
**Estimated Time**: 2-3 hours implementation + testing
**Dependencies**: None - can be implemented immediately