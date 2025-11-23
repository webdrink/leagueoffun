# Plan: Enhanced NameBlame Mode Implementation

## 1. Feature Name
Enhanced NameBlame Mode Implementation

## 2. Goal & Expected Behavior

### Core NameBlame Flow Enhancement
Implement a proper NameBlame game flow where:

1. **Player Blame Selection Phase**: After a player selects who to blame, the question remains displayed with contextual information
2. **Blame Acknowledgment Phase**: The blamed player sees who blamed them and can proceed to the next question
3. **Proper Player Rotation**: Ensure all players (3, 4, 5 players) get proper turns in rotation
4. **Enhanced Summary Screen**: Show detailed blame statistics and fix missing translation keys
5. **Comprehensive Testing**: Add tests for NameBlame mode with multiple player scenarios

### Example Flow (3 players: Alex, Diana, Patrick)
1. Alex sees question "Wer plant jede Minute?" 
2. Alex selects Diana → Screen shows "Alex blamed you for" + question
3. Diana sees the blame context and clicks "Next Blame" to continue
4. Diana gets the next question, selects someone, etc.
5. At game end: Show who blamed whom for which questions

## 3. Technical Steps to Implement

### 3.1 Fix Missing Translation Keys in SummaryScreen
**Files to modify**: 
- `lib/localization/de.ts`
- `lib/localization/en.ts` 
- `lib/localization/es.ts`
- `lib/localization/fr.ts`

**Missing keys identified**:
- `summary.game_over` (currently using, but may be missing)
- `summary.questions_completed` (exists as `summary.questions_answered`)
- `summary.most_blamed_plural` (missing)
- `summary.most_blamed_singular` (missing) 
- `summary.blame_count` (missing)
- `summary.plural_suffix` (missing)
- `summary.no_blames_given` (missing)
- Hard-coded German text: "Team-Runde" and "Super gemacht, Team! {activePlayersCount} Spieler waren dabei."
- Hard-coded German text: "Neues Spiel starten"

### 3.2 Enhance NameBlame Game State Management
**Files to modify**:
- `types.ts` - Add new interfaces for blame phases
- `hooks/useNameBlameSetup.ts` - Add blame phase state management
- `App.tsx` - Implement blame flow logic

**New interfaces needed**:
```typescript
export type NameBlamePhase = 'selecting' | 'blamed' | 'continuing';

export interface NameBlameState {
  phase: NameBlamePhase;
  currentBlamer?: string;
  currentBlamed?: string;
  currentQuestion?: string;
}
```

### 3.3 Create Enhanced QuestionScreen for NameBlame
**Files to modify**:
- `components/game/QuestionScreen.tsx` - Add blame context display
- `lib/localization/*.ts` - Add new translation keys for blame context

**New features**:
- Display "Alex blamed you for" context when in blamed phase
- Show "Next Blame" button instead of player selection after blame is made
- Proper player turn indication based on blame phase

### 3.4 Enhance Player Rotation Logic  
**Files to modify**:
- `App.tsx` - Improve player rotation for blame phases
- `hooks/useNameBlameSetup.ts` - Add more robust player advancement

**Logic improvements**:
- Track blame phases properly
- Ensure proper rotation through all players
- Handle edge cases for player counts (3, 4, 5 players)

### 3.5 Create Comprehensive NameBlame Tests
**Files to create**:
- `tests/flows/nameblame-mode/3-player-game.spec.ts`
- `tests/flows/nameblame-mode/4-player-game.spec.ts`  
- `tests/flows/nameblame-mode/5-player-game.spec.ts`
- `tests/flows/nameblame-mode/blame-rotation.spec.ts`

**Test scenarios**:
- Player setup with different player counts
- Blame selection and phase transitions
- Player rotation verification
- Summary screen blame statistics
- Edge cases (self-blame prevention, invalid states)

### 3.6 Improve SummaryScreen for NameBlame
**Files to modify**:
- `components/game/SummaryScreen.tsx` - Enhanced blame display
- `lib/localization/*.ts` - Add detailed blame statistics keys

**New features**:
- Show who blamed whom for which questions
- Better blame statistics visualization
- Proper internationalization for all text

## 4. Potential Edge Cases

### 4.1 Player Rotation Edge Cases
- What happens if a player is removed mid-game?
- How to handle when current player index becomes invalid?
- Proper wraparound when reaching the last player

### 4.2 Blame Phase Edge Cases  
- What if user navigates back during blame phase?
- How to handle if same player is blamed multiple times?
- What if user tries to blame themselves (should be prevented)?

### 4.3 Data Persistence Edge Cases
- Blame log should persist across page reloads
- Player order should remain consistent during game
- Proper cleanup when game is reset

## 5. Impact on Existing Files

### 5.1 App.tsx Changes
- Add blame phase state management
- Modify `handleBlame` to handle phase transitions
- Update player rotation logic for blame phases
- Add debugging for blame flow

### 5.2 QuestionScreen.tsx Changes  
- Add conditional rendering for blame context
- Show different UI based on blame phase
- Add "Next Blame" button functionality
- Improve player selection UI

### 5.3 Translation Files Changes
- Add all missing summary screen keys
- Add blame context keys ("X blamed you for")
- Add "Next Blame" button text
- Ensure consistency across all languages

### 5.4 Type Definitions Changes
- Add NameBlamePhase enum
- Add NameBlameState interface
- Update existing interfaces if needed

## 6. Implementation Checklist

### Phase 1: Fix Translation Issues ✅
- [ ] Add missing translation keys to all language files
- [ ] Replace hard-coded German text in SummaryScreen
- [ ] Test translation switching for summary screen
- [ ] Verify all summary screen text is properly translated

### Phase 2: Enhance NameBlame State Management ✅
- [ ] Add blame phase types to types.ts
- [ ] Update useNameBlameSetup hook with phase management
- [ ] Implement blame phase transitions in App.tsx
- [ ] Add debugging for blame flow states

### Phase 3: Improve QuestionScreen for NameBlame ✅
- [ ] Add blame context display ("Alex blamed you for")
- [ ] Implement "Next Blame" button functionality
- [ ] Update UI based on blame phase
- [ ] Add proper player turn indicators

### Phase 4: Player Rotation Improvements ✅
- [ ] Fix player rotation logic for blame phases
- [ ] Ensure proper wraparound for all player counts
- [ ] Add validation for player index bounds
- [ ] Test rotation with 3, 4, 5 players

### Phase 5: Comprehensive Testing ✅
- [ ] Create 3-player NameBlame test
- [ ] Create 4-player NameBlame test  
- [ ] Create 5-player NameBlame test
- [ ] Test blame rotation scenarios
- [ ] Test summary screen blame statistics
- [ ] Verify edge cases are handled

### Phase 6: Enhanced Summary Display ✅
- [ ] Show detailed blame statistics
- [ ] Display who blamed whom for which questions
- [ ] Improve blame visualization
- [ ] Test with different blame scenarios

## 7. Success Criteria

### Functional Requirements
- ✅ Players can complete full NameBlame games with 3, 4, 5 players
- ✅ Blame selection shows proper context to blamed player  
- ✅ "Next Blame" button advances game properly
- ✅ Player rotation works correctly for all player counts
- ✅ Summary screen shows detailed blame statistics
- ✅ All text is properly translated (no hard-coded German)

### Technical Requirements  
- ✅ All tests pass for NameBlame scenarios
- ✅ No console errors during NameBlame gameplay
- ✅ Proper state management for blame phases
- ✅ Clean separation of blame logic from classic mode
- ✅ Robust error handling for edge cases

### User Experience Requirements
- ✅ Clear indication of whose turn it is
- ✅ Obvious blame context display
- ✅ Intuitive "Next Blame" flow
- ✅ Satisfying summary with blame details
- ✅ Consistent behavior across different player counts

## 8. Dependencies and Integration

### Internal Dependencies
- Translation system (i18next) for new keys
- Local storage for blame log persistence  
- Sound system for blame action feedback
- Question system for blame context display

### External Dependencies
- Framer Motion for blame transition animations
- React hooks for state management
- Playwright for comprehensive testing

### Integration Points
- App.tsx game flow management
- QuestionScreen blame display
- SummaryScreen statistics display
- Translation system for all new text

---

This plan addresses all the identified issues with NameBlame mode and provides a clear roadmap for implementation with proper testing and edge case handling.
