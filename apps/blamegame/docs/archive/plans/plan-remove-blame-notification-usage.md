# Plan: Remove Blame Notification Usage

## Goal & Expected Behavior
Remove the blame notification popup that shows after a player blames another in NameBlame mode, as it displays redundant information that users already see elsewhere. However, preserve the BlameNotification component for potential future use in other game modes.

## Current State Analysis
The BlameNotification system consists of:
- **Component**: `components/game/BlameNotification.tsx` - Well-documented, reusable component
- **Store State**: `showBlameNotification` and `lastBlameEvent` in BlameGameStore
- **Store Actions**: `showNotification()` and `hideNotification()` methods
- **Usage**: Rendered in App.tsx with blame event data
- **Types**: `BlameNotificationProps` interface in types.ts

## Technical Steps

### Phase 1: Remove App.tsx Usage
- [ ] Remove BlameNotification import from App.tsx
- [ ] Remove store selectors for `showBlameNotification` and `lastBlameEvent`
- [ ] Remove BlameNotification JSX rendering block
- [ ] Remove debug logging that references `lastBlameEvent`

### Phase 2: Clean Store State & Actions
- [ ] Remove `showBlameNotification` and `lastBlameEvent` from BlameState interface
- [ ] Remove `showNotification()` and `hideNotification()` from BlameActions interface  
- [ ] Remove these properties from initialBlameState
- [ ] Remove the notification-related action implementations
- [ ] Keep blame recording functionality intact (recordBlame, blameLog, etc.)

### Phase 3: Preserve Component & Types
- [ ] Keep BlameNotification component file unchanged for future use
- [ ] Keep BlameNotificationProps interface in types.ts
- [ ] Add comment in component indicating it's preserved for future game modes

### Phase 4: Update Tests
- [ ] Review nameblame test files for notification-specific test cases
- [ ] Remove or update tests that verify notification display
- [ ] Keep tests that verify blame recording and game flow

## Potential Edge Cases
- Ensure blame recording (`recordBlame`) still works without notification
- Verify NameBlame game flow continues normally without notification display
- Check that no other components depend on notification state

## Impact Assessment
- **UI**: Users will no longer see redundant blame notification popups
- **Game Flow**: Blame progression continues as normal, just without notification overlay
- **Code**: Store becomes simpler, notification component preserved for future
- **Tests**: Some notification-specific tests will need updates

## Files Modified
- `App.tsx` - Remove notification usage and imports
- `store/BlameGameStore.ts` - Remove notification state and actions
- Test files in `tests/flows/nameblame-mode/` - Update relevant test cases

## Files Preserved
- `components/game/BlameNotification.tsx` - Keep for future use
- `types.ts` - Keep BlameNotificationProps interface

## Completion Criteria
- [x] BlameNotification no longer appears during NameBlame gameplay
- [x] Blame recording and game progression work normally  
- [x] Component and types preserved for future development
- [x] Tests updated to reflect notification removal
- [x] No console errors or broken references

## Implementation Notes
- Successfully removed all BlameNotification usage from App.tsx including imports, store selectors, JSX rendering, and debug logging
- Cleaned BlameGameStore by removing `showBlameNotification`, `lastBlameEvent`, `showNotification()`, and `hideNotification()` functions while preserving all blame recording functionality  
- Updated `tests/unit/nameblame-components.test.tsx` to remove notification-specific test cases while maintaining core blame functionality tests
- Added preservation comment to BlameNotification component indicating it's kept for future game modes
- Verified successful build and development server startup - no compilation errors
- BlameNotificationProps interface and component file preserved for future use

## Task Completion Summary
✅ **COMPLETED** - All BlameNotification usage successfully removed from NameBlame game flow while preserving the component for potential future use in other game modes. Game continues to function normally with blame recording and progression intact.