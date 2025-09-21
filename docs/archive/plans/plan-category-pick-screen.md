# Implementation Plan: CategoryPickScreen Integration

## Feature Description
Add a new screen that allows users to manually select categories for the game round instead of using randomly selected categories.

## Requirements
- Create a new `CategoryPickScreen` component
- Add a toggle in the `IntroScreen` for enabling manual category selection
- Add a new gameStep: "categoryPick"
- Implement logic to support user-selected categories
- Add translations for all new UI elements

## Implementation Checklist

### 1. Create CategoryPickScreen Component
- [x] Create `components/game/CategoryPickScreen.tsx`
- [x] Implement UI based on provided code
- [x] Ensure component can display all categories with proper translations

### 2. Add Translations
- [x] Update `lib/localization/en.ts` with new translation keys
- [x] Update `lib/localization/de.ts` with new translation keys

### 3. Extend App.tsx
- [x] Add `selectedCategories` state
- [x] Add `categoryPick` gameStep to the game flow
- [x] Modify `handleStartGameFlow` to consider manual category selection
- [x] Update the rendering logic to show `CategoryPickScreen` when in `categoryPick` step

### 4. Update IntroScreen
- [x] Add toggle for manual category selection
- [x] Update IntroScreen props interface
- [x] Connect toggle to gameSettings

### 5. Modify Question Loading Logic
- [x] Update the question preparation logic to use manually selected categories when enabled

### 6. Testing
- [ ] Verify the toggle appears in IntroScreen
- [ ] Verify CategoryPickScreen displays all categories correctly
- [ ] Verify selecting categories works as expected
- [ ] Verify the game uses the manually selected categories

## Progress Tracking
Implementation status: Completed, pending testing
