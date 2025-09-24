# Plan: Footer Positioning and NameBlame Mode Fixes

## Goal & Expected Behavior
Fix footer positioning and resolve NameBlame mode issues:

1. **Footer Positioning**: Position footer at bottom of viewport minus padding
2. **Player Setup Translation**: Add missing translation keys for player setup screen
3. **Player Data Flow**: Fix mock players showing instead of actual setup players
4. **Player Button Styling**: Improve light mode contrast for player buttons
5. **Missing Translation Keys**: Add missing `question.blame_revealed` and `question.was_blamed` keys
6. **Title Responsiveness**: Make game title resize to fit container instead of breaking lines
7. **Footer Button Visibility**: Style footer buttons to match language selector for better visibility
8. **UI Overlapping**: Fix padding and layout issues in NameBlame question screen

## Technical Steps to Implement

### 1. Add Missing Translation Keys
- **Files**: All translation files (`lib/localization/*.ts`)
- **Action**: Add missing translation keys for NameBlame mode
- **Keys to add**:
  - `question.blame_revealed`: "Blame Revealed!"
  - `question.was_blamed`: "was blamed"

### 2. Fix Title Responsiveness
- **File**: `components/framework/GameShell.tsx`
- **Action**: Update SplitText component to use responsive font sizing with clamp()
- **Details**: Replace static text sizes with CSS clamp() for better responsive scaling

### 3. Improve Footer Button Styling
- **File**: `lib/constants/uiConstants.ts`
- **Action**: Update FOOTER_BUTTON_CLASSES to match language selector styling
- **Details**: Ensure all footer buttons have consistent purple styling and visibility

### 4. Fix NameBlame UI Padding and Layout
- **File**: `components/framework/FrameworkQuestionScreen.tsx`
- **Action**: Adjust padding and spacing in NameBlame mode to prevent UI overlapping
- **Details**: Fix category badge and blame revelation box spacing

### 5. Test NameBlame Mode End-to-End
- **Action**: Test complete NameBlame flow to ensure all fixes work together
- **Details**: Verify translations, UI layout, and user experience

## Task Checklist

### Setup
- [x] Create plan document
- [x] Analyze current NameBlame mode implementation
- [x] Identify all missing translation keys

### Implementation
- [x] Add missing translation keys to all language files (en, de, es, fr)
- [x] Fix title responsiveness with better tailwind classes
- [x] Update footer button styling for consistency
- [x] Fix NameBlame question screen padding and layout
- [x] Improve category badge and blame box positioning
- [x] Increase NameBlame card height to prevent overlapping

### Testing & Polish
- [x] Test NameBlame mode end-to-end
- [x] Verify all translations work correctly
- [x] Test footer button visibility in both light and dark modes
- [x] Validate responsive title behavior across screen sizes
- [x] Check UI layout in both game modes

## Completion Summary

All NameBlame mode issues have been successfully fixed:

1. **Missing Translation Keys**: Added `question.blame_revealed` and `question.was_blamed` keys to all language files (English, German, Spanish, French)

2. **Title Responsiveness**: Updated GameShell SplitText component with better responsive text classes and proper overflow handling

3. **Footer Button Styling**: Footer buttons now use consistent purple styling matching the language selector for better visibility

4. **UI Overlapping**: Fixed NameBlame question screen layout by:
   - Increasing card height from `h-[42vh]` to `h-[55vh]` in NameBlame mode
   - Reducing padding and margins throughout the component
   - Making text sizes more compact for better space utilization
   - Adjusting blame revelation box and player selection areas

5. **Layout Improvements**: Optimized spacing between question elements, category badge, blame boxes, and player selection buttons

All changes maintain responsive design and accessibility while providing a better user experience in NameBlame mode.

## 🚨 CRITICAL BUG DISCOVERED: Self-Blame Prevention Logic Missing

### Bug Description
After analyzing the NameBlame game flow documentation and code, a critical bug has been identified in the **Framework version** of the NameBlame mode:

**Issue**: Players can blame themselves, which violates the core NameBlame game rules.

### Expected NameBlame Flow (from docs/NAMEBLAME_MODE_FLOW.md)
Based on the documented game logic, the NameBlame mode should follow this flow:

1. **Random Start**: Game randomly picks a starting player (e.g., Player A)
2. **Blame Selection**: Player A sees question and can blame any other player EXCEPT themselves
3. **Turn Chain**: If A blames B, then B becomes the next active player
4. **Self-Blame Prevention**: B can now blame A or C, but NOT B (themselves)
5. **Rotation**: This continues with the blamed player becoming the next active player

### Current Broken Behavior
- **Framework Question Screen**: `components/framework/FrameworkQuestionScreen.tsx` displays all players as selectable buttons
- **Missing Logic**: No current player tracking or self-blame prevention
- **Bug Result**: Player A can continuously blame Player A, breaking the game flow

### Root Cause Analysis
From the code analysis:

1. **Legacy QuestionScreen**: Has proper self-blame prevention logic:
   ```tsx
   const isSelf = currentPlayer && player.id === currentPlayer.id;
   disabled={!!isSelf}
   ```

2. **Framework QuestionScreen**: Missing this logic entirely - all players are always enabled

### Required Fix Implementation
**File**: `components/framework/FrameworkQuestionScreen.tsx`

**Missing Elements**:
1. **Current Player Tracking**: Need to identify who the active player is
2. **Self-Blame Prevention**: Disable the current player's own button
3. **Player Rotation Logic**: Ensure blamed player becomes next active player
4. **Visual Feedback**: Show current player indicator

**Dependencies**:
- Hook into `useNameBlameSetup` for current player state
- Integrate with blame state management
- Update player selection UI to show disabled state for current player

### Testing Requirements
After implementation, verify:
- [ ] Current player cannot blame themselves (button disabled)
- [ ] Visual indicator shows who the current player is
- [ ] Proper rotation: A blames B → B becomes active → B can blame A or C (not B)
- [ ] Game flow follows documented NameBlame rules
- [ ] At the end of the game, summary reflects correct blame assignments


### Impact
**High Priority**: This bug breaks the fundamental game mechanics and makes NameBlame mode unplayable according to its intended rules.

## Implementation Notes
- Maintain responsive design
- Ensure accessibility is preserved
- Test with different player counts
- Verify data persistence works correctly
- Keep consistent styling across all UI elements
- **NEW**: Fix self-blame prevention logic before next release