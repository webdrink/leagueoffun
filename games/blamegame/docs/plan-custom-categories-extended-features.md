# Custom Categories Extended Features - Implementation Plan

## Overview
This plan covers the implementation of advanced custom category features:
1. Built-in category editing (add questions, hide unwanted questions)
2. Question deletion from any category (custom or built-in)
3. App reset functionality (clear all custom data)
4. Comprehensive E2E test suite

## Current Architecture Analysis

### Existing Infrastructure (✅ Already Implemented)
- **Storage Layer**: 
  - `lib/customCategories/storage.ts` - Handles custom category CRUD operations
  - `lib/customCategories/builtInModifications.ts` - Tracks modifications to built-in categories
  - Both use `framework/persistence/storage.ts` for namespaced localStorage

- **Integration Layer**:
  - `lib/customCategories/integration.ts` - Merges custom + built-in categories
  - `mergeWithCustomQuestions()` already filters hidden questions and adds custom questions from modifications

- **UI Components**:
  - `CustomCategoryManager.tsx` - Lists and manages categories (currently custom only)
  - `CustomCategoryEditor.tsx` - Create/edit interface with emoji + questions

- **Question Loading**:
  - Built-in categories loaded from `public/questions/categories.json`
  - Built-in questions from `public/questions/{lang}/{categoryId}.json`
  - `lib/utils/questionLoaders.ts` - `loadCategoriesFromJson()`, `loadQuestionsFromJson()`

### Storage Keys Used
```typescript
// From framework/persistence/storage.ts
NAMESPACE = 'lof'
VERSION = 'v1'
// Results in: 'lof.v1.{key}'

// Custom categories storage
'customCategories' → 'lof.v1.customCategories'

// Built-in modifications storage
'builtInCategoryModifications' → 'lof.v1.builtInCategoryModifications'

// Game settings (different per game)
'game.settings.{gameId}' → 'lof.v1.game.settings.nameblame'
```

## Feature Implementation Plan

---

## Feature 1: Built-in Category Editing

### Goal
Allow users to add custom questions to built-in game categories and hide questions they don't like.

### Technical Requirements

#### 1.1 Update CustomCategoryManager to Display Built-in Categories

**Files to modify:**
- `components/customCategories/CustomCategoryManager.tsx`

**Implementation Steps:**

1. **Load built-in categories on mount**
   ```typescript
   import { loadCategoriesFromJson } from '../../lib/utils/questionLoaders';
   import { getCategoryModifications } from '../../lib/customCategories/builtInModifications';
   
   // State management
   const [builtInCategories, setBuiltInCategories] = useState<Category[]>([]);
   const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
   
   useEffect(() => {
     const loadCategories = async () => {
       try {
         const categories = await loadCategoriesFromJson();
         setBuiltInCategories(categories);
       } catch (error) {
         console.error('Failed to load built-in categories:', error);
       }
       setCustomCategories(getCustomCategories());
     };
     loadCategories();
   }, []);
   ```

2. **Create unified category display with visual distinction**
   - Built-in categories should show a badge/indicator
   - Custom categories should show current indicator
   - Both should be editable
   ```typescript
   interface DisplayCategory {
     id: string;
     emoji: string;
     name: Record<SupportedLanguage, string>;
     questionCount: number;
     isBuiltIn: boolean;
     hasModifications?: boolean; // For built-in categories
   }
   ```

3. **Show modification indicators**
   - Display badge if built-in category has modifications
   - Show count of added questions
   - Show count of hidden questions
   ```typescript
   const modifications = getCategoryModifications();
   const categoryMod = modifications.find(m => m.categoryId === category.id);
   
   {categoryMod && (
     <span className="text-xs text-autumn-600">
       {categoryMod.addedQuestions.length > 0 && `+${categoryMod.addedQuestions.length} `}
       {categoryMod.hiddenQuestionIds.length > 0 && `-${categoryMod.hiddenQuestionIds.length}`}
     </span>
   )}
   ```

4. **Update styling and layout**
   - Add section headers: "Your Custom Categories" and "Game Categories"
   - Use consistent card design for both types
   - Ensure 44px touch targets for all buttons

**Edge Cases:**
- Handle loading failures for built-in categories gracefully
- Show empty state if no categories of either type
- Handle language switching (reload category names)

---

#### 1.2 Update CustomCategoryEditor for Built-in Categories

**Files to modify:**
- `components/customCategories/CustomCategoryEditor.tsx`

**Implementation Steps:**

1. **Accept built-in category editing**
   ```typescript
   interface CustomCategoryEditorProps {
     category?: CustomCategory | null;
     builtInCategory?: Category | null; // NEW
     isOpen: boolean;
     onClose: () => void;
   }
   ```

2. **Conditional rendering based on category type**
   - For built-in categories:
     - Emoji and name are READ-ONLY (display only)
     - Can only add/remove questions
     - Show "You are editing a game category" notice
   - For custom categories:
     - Everything editable as before

3. **Load existing questions for built-in categories**
   ```typescript
   // Load built-in questions on mount if builtInCategory provided
   useEffect(() => {
     if (builtInCategory) {
       const loadBuiltInQuestions = async () => {
         try {
           const lang = i18n.language as SupportedLanguage;
           const questions = await loadQuestionsFromJson(lang);
           const categoryQuestions = questions.filter(
             q => q.categoryId === builtInCategory.id
           );
           
           // Load modifications
           const mods = getCategoryModifications();
           const categoryMod = mods.find(m => m.categoryId === builtInCategory.id);
           
           // Filter out hidden questions
           const visibleQuestions = categoryQuestions.filter(
             q => !categoryMod?.hiddenQuestionIds.includes(q.questionId)
           );
           
           // Add custom questions
           const customQuestions = categoryMod?.addedQuestions || [];
           
           setQuestions([...visibleQuestions, ...customQuestions]);
         } catch (error) {
           console.error('Failed to load built-in questions:', error);
         }
       };
       loadBuiltInQuestions();
     }
   }, [builtInCategory, i18n.language]);
   ```

4. **Update save logic for built-in categories**
   ```typescript
   const handleSaveBuiltIn = () => {
     if (!builtInCategory) return;
     
     // Questions added to built-in categories
     const newQuestions = questions.filter(q => q.isCustom);
     newQuestions.forEach(q => {
       const text: Record<SupportedLanguage, string> = {
         en: q.text,
         de: q.text,
         es: q.text,
         fr: q.text
       };
       addQuestionToBuiltInCategory(builtInCategory.id, q.id, text);
     });
     
     onClose();
   };
   ```

5. **Mark questions for hiding**
   - Add visual indicator to each question showing if it's:
     - Built-in (default game question)
     - Custom (user added)
     - Hidden (grayed out, with "Unhide" button)
   ```tsx
   <div className="flex items-center gap-2">
     {question.isBuiltIn && (
       <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
         Game Question
       </span>
     )}
     {question.isCustom && (
       <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
         Your Question
       </span>
     )}
     {question.isHidden && (
       <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">
         Hidden
       </span>
     )}
   </div>
   ```

**Edge Cases:**
- Prevent hiding ALL questions in a category (require at least 1 visible)
- Handle async question loading states (show spinner)
- Validate that new questions don't duplicate existing ones

---

## Feature 2: Question Deletion

### Goal
Allow users to delete questions from custom categories and hide questions from built-in categories.

### Technical Requirements

#### 2.1 Add Delete Button to Questions List

**Files to modify:**
- `components/customCategories/CustomCategoryEditor.tsx`

**Implementation Steps:**

1. **Add delete button to each question**
   ```tsx
   <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
     <span className="text-gray-800 dark:text-gray-200">{question.text}</span>
     <div className="flex items-center gap-2">
       {question.isBuiltIn ? (
         // Hide/Unhide button for built-in questions
         question.isHidden ? (
           <Button
             variant="outline"
             onClick={() => handleUnhideQuestion(question.id)}
             className="p-2 hover:bg-green-50 text-green-600 min-h-[44px]"
           >
             <Eye size={18} />
           </Button>
         ) : (
           <Button
             variant="outline"
             onClick={() => handleHideQuestion(question.id)}
             className="p-2 hover:bg-gray-100 text-gray-600 min-h-[44px]"
           >
             <EyeOff size={18} />
           </Button>
         )
       ) : (
         // Delete button for custom questions
         <Button
           variant="outline"
           onClick={() => handleDeleteQuestion(question.id)}
           className="p-2 hover:bg-red-50 text-red-600 min-h-[44px]"
         >
           <Trash2 size={18} />
         </Button>
       )}
     </div>
   </div>
   ```

2. **Implement hide/unhide handlers**
   ```typescript
   const handleHideQuestion = (questionId: string) => {
     if (builtInCategory) {
       // Ensure at least one question remains visible
       const visibleCount = questions.filter(q => !q.isHidden).length;
       if (visibleCount <= 1) {
         alert(t('custom_categories.error_must_keep_one_question'));
         return;
       }
       
       hideQuestionFromBuiltInCategory(builtInCategory.id, questionId);
       // Update local state
       setQuestions(prev => 
         prev.map(q => q.id === questionId ? { ...q, isHidden: true } : q)
       );
     }
   };
   
   const handleUnhideQuestion = (questionId: string) => {
     if (builtInCategory) {
       unhideQuestionFromBuiltInCategory(builtInCategory.id, questionId);
       setQuestions(prev => 
         prev.map(q => q.id === questionId ? { ...q, isHidden: false } : q)
       );
     }
   };
   ```

3. **Implement delete handler for custom questions**
   ```typescript
   const handleDeleteQuestion = (questionId: string) => {
     if (category) {
       // Custom category - delete directly
       const confirmed = window.confirm(t('custom_categories.confirm_delete_question'));
       if (confirmed) {
         deleteQuestionFromCategory(category.id, questionId);
         setQuestions(prev => prev.filter(q => q.id !== questionId));
       }
     } else if (builtInCategory) {
       // Built-in category modification - delete custom added question
       deleteCustomQuestionFromBuiltInCategory(builtInCategory.id, questionId);
       setQuestions(prev => prev.filter(q => q.id !== questionId));
     }
   };
   ```

4. **Add confirmation dialogs with translations**
   ```typescript
   // New translation keys needed:
   'custom_categories.confirm_delete_question': 'Are you sure you want to delete this question?',
   'custom_categories.error_must_keep_one_question': 'You must keep at least one question visible.',
   'custom_categories.hide_question': 'Hide this question',
   'custom_categories.unhide_question': 'Show this question',
   'custom_categories.hidden_question': 'Hidden',
   'custom_categories.game_question': 'Game Question',
   'custom_categories.your_question': 'Your Question',
   'custom_categories.editing_game_category': 'You are editing a game category',
   ```

**Edge Cases:**
- Prevent deleting last question in custom category
- Prevent hiding last visible question in built-in category
- Handle rapid clicking (debounce delete action)
- Confirm before permanent deletion

---

## Feature 3: App Reset Functionality

### Goal
Provide a "Reset App" button that clears all custom data and modifications, returning the app to fresh install state.

### Technical Requirements

#### 3.1 Add Reset Button to Settings/Debug Panel

**Files to modify:**
- `components/framework/GameShell.tsx`
- `components/settings/InfoModal.tsx` (or create new ResetModal)
- `lib/customCategories/storage.ts` (add clearAll function)
- `lib/customCategories/builtInModifications.ts` (already has clearAllCategoryModifications)

**Implementation Steps:**

1. **Add clearAllCustomCategories function to storage.ts**
   ```typescript
   /**
    * Clear all custom categories (for app reset)
    */
   export const clearAllCustomCategories = (): void => {
     const emptyData: CustomCategoriesData = {
       categories: [],
       version: CURRENT_VERSION
     };
     storageSet(STORAGE_KEY, emptyData);
   };
   ```

2. **Create comprehensive reset function**
   ```typescript
   // In GameShell.tsx or new utility file
   export const resetAppData = () => {
     // Show confirmation dialog
     const confirmed = window.confirm(
       t('settings.confirm_reset_app') +
       '\n\n' +
       t('settings.reset_warning_details')
     );
     
     if (!confirmed) return;
     
     try {
       // Clear custom categories
       clearAllCustomCategories();
       
       // Clear built-in category modifications
       clearAllCategoryModifications();
       
       // Clear game settings (if desired)
       // storageRemove('game.settings.nameblame');
       
       // Option 1: Reload page to reset everything
       window.location.reload();
       
       // Option 2: Just refresh UI
       // eventBus.publish({ type: 'APP/RESET' });
     } catch (error) {
       console.error('Failed to reset app data:', error);
       alert(t('settings.reset_error'));
     }
   };
   ```

3. **Add Reset button to InfoModal**
   ```tsx
   // In InfoModal.tsx
   <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
     <h3 className="text-lg font-semibold mb-3 text-red-700 dark:text-red-400">
       {t('settings.danger_zone')}
     </h3>
     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
       {t('settings.reset_description')}
     </p>
     <Button
       onClick={onResetAppData}
       className="bg-red-600 hover:bg-red-700 text-white w-full min-h-[44px]"
     >
       <RotateCcw size={18} className="mr-2" />
       {t('settings.reset_app_data')}
     </Button>
   </div>
   ```

4. **Wire up reset in GameShell**
   ```tsx
   // In GameShell.tsx
   {showInfoModal && (
     <InfoModal
       isOpen={showInfoModal}
       onClose={() => setShowInfoModal(false)}
       onResetAppData={() => {
         resetAppData();
       }}
     />
   )}
   ```

5. **Add necessary translations**
   ```typescript
   'settings.danger_zone': 'Danger Zone',
   'settings.confirm_reset_app': 'Are you sure you want to reset ALL app data?',
   'settings.reset_warning_details': 'This will permanently delete:\n• All custom categories\n• All custom questions\n• All modifications to game categories\n\nThis action cannot be undone.',
   'settings.reset_description': 'Reset the app to its original state by clearing all custom data.',
   'settings.reset_error': 'Failed to reset app data. Please try again.',
   ```

**Edge Cases:**
- Double confirmation for safety
- Handle partial failures gracefully
- Preserve language preference if desired
- Clear service worker cache if needed

---

## Feature 4: Comprehensive E2E Test Suite

### Goal
Test the complete user journey from category creation to gameplay with custom categories.

### Technical Requirements

#### 4.1 Test Structure

**New test file created:**
- `tests/custom-categories-e2e.spec.ts` ✅ (Already created in previous step)

**Test Coverage:**

1. **Basic CRUD Operations**
   - ✅ Create category with questions
   - ✅ Edit existing category
   - ✅ Delete questions
   - ✅ Delete category
   - ✅ Validation (empty fields, invalid emoji)

2. **Built-in Category Editing** (NEW TESTS NEEDED)
   ```typescript
   test('should allow adding questions to built-in categories', async ({ page }) => {
     // Open custom categories manager
     // Navigate to built-in category
     // Click edit
     // Add new question
     // Save
     // Verify question appears in category
     // Verify modification indicator shows
   });
   
   test('should allow hiding questions from built-in categories', async ({ page }) => {
     // Open built-in category
     // Find a question
     // Click hide button
     // Verify question is marked hidden
     // Verify it doesn't appear in game
   });
   
   test('should allow unhiding previously hidden questions', async ({ page }) => {
     // Hide a question first
     // Click unhide button
     // Verify question reappears
   });
   ```

3. **Reset Functionality** (NEW TESTS NEEDED)
   ```typescript
   test('should reset app and clear all custom data', async ({ page }) => {
     // Create custom category
     // Add question to built-in category
     // Open settings
     // Click reset button
     // Confirm dialog
     // Verify localStorage is cleared
     // Verify no custom categories exist
     // Verify built-in modifications cleared
   });
   ```

4. **Integration with Game Flow** (ENHANCE EXISTING TEST)
   ```typescript
   test('should play game with custom and modified built-in categories', async ({ page }) => {
     // Create custom category with 2 questions
     // Add 1 question to built-in category
     // Hide 1 question from built-in category
     // Start game
     // Enable manual category selection
     // Verify custom category appears
     // Select categories (mix of custom and built-in)
     // Play through questions
     // Verify custom questions appear
     // Verify hidden questions don't appear
     // Verify added questions appear
   });
   ```

5. **Persistence Tests** (ENHANCE EXISTING TEST)
   - ✅ Categories persist across reloads
   - NEW: Built-in modifications persist across reloads
   - NEW: Hidden questions remain hidden after reload

6. **Edge Cases** (NEW TESTS NEEDED)
   ```typescript
   test('should prevent hiding all questions in a category', async ({ page }) => {
     // Try to hide all questions
     // Verify error message
     // Verify at least one remains visible
   });
   
   test('should handle question count correctly with modifications', async ({ page }) => {
     // Category with 5 built-in questions
     // Hide 2 questions
     // Add 3 custom questions
     // Verify count shows 6 (3 built-in + 3 custom)
   });
   ```

---

## Implementation Order & Dependencies

### Phase 1: Foundation (Priority: HIGH)
**Estimated Time: 4-6 hours**

1. **Add clearAllCustomCategories to storage.ts** (30 min)
2. **Update translation files with all new keys** (45 min)
3. **Create reset functionality** (1 hour)
   - Add reset function
   - Wire up in GameShell
   - Add UI in InfoModal
   - Test manually

**Blockers:** None
**Output:** Working reset functionality

---

### Phase 2: Built-in Category Display (Priority: HIGH)
**Estimated Time: 6-8 hours**

1. **Update CustomCategoryManager to load built-in categories** (2 hours)
   - Add async loading logic
   - Create unified display structure
   - Add section headers
   - Show modification indicators

2. **Update styling and layout** (2 hours)
   - Distinguish built-in vs custom visually
   - Add badges/indicators
   - Ensure responsive design
   - Test on mobile

3. **Manual testing** (1 hour)
   - Test category loading
   - Test on different screen sizes
   - Verify language switching works

**Blockers:** None
**Dependencies:** Phase 1 complete helps with testing reset
**Output:** CustomCategoryManager shows both category types

---

### Phase 3: Built-in Category Editing (Priority: HIGH)
**Estimated Time: 8-10 hours**

1. **Update CustomCategoryEditor interface** (3 hours)
   - Accept built-in category prop
   - Conditional rendering for read-only fields
   - Load existing questions for built-in
   - Show modification indicators

2. **Implement question hiding logic** (2 hours)
   - Add hide/unhide buttons
   - Implement handlers using builtInModifications.ts
   - Add visual indicators (badges)
   - Handle edge case (prevent hiding all)

3. **Implement question addition to built-in** (2 hours)
   - Update save logic
   - Call addQuestionToBuiltInCategory
   - Test modifications persist

4. **Manual testing** (2 hours)
   - Add questions to built-in categories
   - Hide questions
   - Unhide questions
   - Save and verify persistence
   - Test reload behavior

**Blockers:** Phase 2 must be complete
**Dependencies:** 
- Phase 2 (need manager showing built-in categories)
- builtInModifications.ts already exists
**Output:** Full built-in category editing functionality

---

### Phase 4: Question Deletion (Priority: MEDIUM)
**Estimated Time: 4-5 hours**

1. **Add delete button to questions list** (2 hours)
   - Update UI with delete button
   - Conditional rendering (delete vs hide)
   - Add confirmation dialog

2. **Implement delete handlers** (1 hour)
   - Custom category delete
   - Built-in modification delete
   - Handle edge cases

3. **Testing** (1 hour)
   - Test deleting from custom
   - Test deleting from built-in
   - Test edge cases (last question)

**Blockers:** Phase 3 should be complete
**Dependencies:** Phase 3 (shares same UI component)
**Output:** Working question deletion

---

### Phase 5: E2E Test Suite (Priority: HIGH)
**Estimated Time: 8-10 hours**

1. **Enhance existing E2E tests** (2 hours)
   - Update helper functions
   - Add built-in category selectors
   - Enhance persistence tests

2. **Write built-in category tests** (3 hours)
   - Add question to built-in test
   - Hide question test
   - Unhide question test
   - Modification indicator tests

3. **Write reset functionality tests** (2 hours)
   - Full reset test
   - Partial data scenarios
   - Verify cleanup

4. **Write integration tests** (2 hours)
   - Complete game flow with modifications
   - Question count accuracy
   - Category selection with modifications

5. **Debug and stabilize tests** (2 hours)
   - Fix flaky tests
   - Add wait times where needed
   - Handle async operations

**Blockers:** Phases 1-4 must be complete
**Dependencies:** All previous phases
**Output:** Comprehensive E2E test coverage

---

## Testing Strategy

### Manual Testing Checklist

#### Custom Categories
- [ ] Create new custom category
- [ ] Add multiple questions
- [ ] Edit category (emoji + name)
- [ ] Edit category (add/remove questions)
- [ ] Delete questions from custom category
- [ ] Delete entire custom category
- [ ] Verify persistence after reload

#### Built-in Categories
- [ ] View built-in categories in manager
- [ ] Open built-in category for editing
- [ ] Verify emoji/name are read-only
- [ ] Add question to built-in category
- [ ] Verify modification indicator appears
- [ ] Hide question from built-in category
- [ ] Verify hidden question doesn't appear in game
- [ ] Unhide previously hidden question
- [ ] Prevent hiding all questions (edge case)
- [ ] Verify modifications persist after reload

#### Reset Functionality
- [ ] Create custom category
- [ ] Modify built-in category
- [ ] Trigger reset
- [ ] Confirm dialog appears
- [ ] Verify all custom data cleared
- [ ] Verify built-in modifications cleared
- [ ] Verify app returns to initial state

#### Game Integration
- [ ] Start game with custom category
- [ ] Verify custom questions appear
- [ ] Start game with modified built-in category
- [ ] Verify added questions appear
- [ ] Verify hidden questions don't appear
- [ ] Check question counts are accurate

### Automated Testing

**Run E2E tests:**
```bash
npm run test:e2e
```

**Coverage areas:**
- All CRUD operations
- Built-in category modifications
- Reset functionality
- Persistence across reloads
- Game integration
- Edge cases and validations

---

## File Modifications Summary

### Files to Modify

1. **lib/customCategories/storage.ts**
   - Add: `clearAllCustomCategories()`

2. **components/customCategories/CustomCategoryManager.tsx**
   - Add: Load built-in categories via `loadCategoriesFromJson()`
   - Add: Unified category display (built-in + custom)
   - Add: Section headers and visual distinction
   - Add: Modification indicators
   - Update: Styling to support both types

3. **components/customCategories/CustomCategoryEditor.tsx**
   - Add: Support for built-in category editing
   - Add: Read-only emoji/name for built-in
   - Add: Load existing questions for built-in categories
   - Add: Hide/unhide button for built-in questions
   - Add: Delete button for custom questions
   - Add: Visual indicators (badges for question types)
   - Update: Save logic for both types
   - Add: Validation (prevent hiding all questions)

4. **components/framework/GameShell.tsx**
   - Add: `resetAppData()` function
   - Update: Wire up reset in InfoModal

5. **components/settings/InfoModal.tsx**
   - Add: Danger zone section
   - Add: Reset button with warning

6. **Translation files** (en.ts, de.ts, es.ts, fr.ts)
   - Add: ~15 new translation keys
   - Keys for: hiding, unhiding, game question badges, reset warnings, etc.

7. **tests/custom-categories-e2e.spec.ts**
   - Add: Built-in category editing tests
   - Add: Reset functionality tests
   - Add: Enhanced integration tests
   - Add: Edge case tests

### New Files to Create

- **None** - All functionality fits into existing architecture

---

## Translation Keys Needed

```typescript
// English (en.ts)
{
  // Question management
  'custom_categories.confirm_delete_question': 'Are you sure you want to delete this question?',
  'custom_categories.error_must_keep_one_question': 'You must keep at least one question visible in this category.',
  'custom_categories.hide_question': 'Hide this question',
  'custom_categories.unhide_question': 'Show this question',
  'custom_categories.hidden_question': 'Hidden',
  'custom_categories.game_question': 'Game Question',
  'custom_categories.your_question': 'Your Question',
  
  // Built-in category editing
  'custom_categories.editing_game_category': 'You are editing a game category',
  'custom_categories.builtin_category_notice': 'You can add questions and hide unwanted questions, but cannot change the category name or emoji.',
  'custom_categories.modifications_indicator': 'Modified',
  'custom_categories.added_questions': '{{count}} added',
  'custom_categories.hidden_questions': '{{count}} hidden',
  
  // Category sections
  'custom_categories.your_categories': 'Your Custom Categories',
  'custom_categories.game_categories': 'Game Categories',
  
  // Reset functionality
  'settings.danger_zone': 'Danger Zone',
  'settings.confirm_reset_app': 'Are you sure you want to reset ALL app data?',
  'settings.reset_warning_details': 'This will permanently delete:\n• All custom categories\n• All custom questions\n• All modifications to game categories\n• All game progress\n\nThis action cannot be undone.',
  'settings.reset_description': 'Reset the app to its original state by clearing all custom data and modifications.',
  'settings.reset_app_data': 'Reset App Data',
  'settings.reset_error': 'Failed to reset app data. Please try again.',
  'settings.reset_success': 'App data has been reset successfully.',
}
```

**Note:** All keys need German, Spanish, and French translations as well.

---

## Risk Assessment

### High Risk Items
1. **Built-in category loading failures**
   - Mitigation: Graceful error handling, fallback to empty state
   - Test: Offline mode, network failures

2. **localStorage quota exceeded**
   - Mitigation: Monitor storage usage, warn user
   - Test: Create many large categories

3. **Race conditions in async loading**
   - Mitigation: Proper loading states, prevent multiple fetches
   - Test: Rapid category switching

### Medium Risk Items
1. **Question count mismatches**
   - Mitigation: Careful filtering logic, comprehensive tests
   - Test: All modification scenarios

2. **Localization edge cases**
   - Mitigation: Fallback language logic
   - Test: Missing translations, language switching

### Low Risk Items
1. **UI responsiveness issues**
   - Mitigation: Test on multiple devices
   - Test: Mobile viewports in E2E tests

---

## Success Criteria

### Must Have (P0)
- [ ] Built-in categories appear in CustomCategoryManager
- [ ] Can add questions to built-in categories
- [ ] Can hide questions from built-in categories
- [ ] Can unhide previously hidden questions
- [ ] Reset button clears all custom data
- [ ] All modifications persist across page reloads
- [ ] E2E tests cover all new features
- [ ] No console errors or warnings
- [ ] Works on mobile (375px viewport)

### Should Have (P1)
- [ ] Modification indicators show counts
- [ ] Visual distinction between question types (badges)
- [ ] Confirmation dialogs for destructive actions
- [ ] Proper accessibility (ARIA labels)
- [ ] Smooth animations and transitions
- [ ] Loading states for async operations

### Nice to Have (P2)
- [ ] Keyboard shortcuts for common actions
- [ ] Bulk operations (hide multiple questions)
- [ ] Export/import modifications
- [ ] Undo recent changes

---

## Performance Considerations

### Loading Optimization
- Load built-in categories only once, cache in state
- Lazy load question lists (don't load all categories' questions upfront)
- Use React.memo for category cards

### Storage Optimization
- Monitor localStorage usage
- Compress data if approaching quota
- Warn user at 80% capacity

### Rendering Optimization
- Virtualize long lists (if >50 categories)
- Debounce search/filter operations
- Use AnimatePresence wisely (remove exits if too many items)

---

## Documentation Updates Needed

1. **User Guide**
   - How to edit built-in categories
   - How to hide unwanted questions
   - How to reset the app

2. **Developer Docs**
   - Architecture diagram with modification layer
   - Storage schema documentation
   - Testing guide for E2E tests

3. **README Updates**
   - Feature list updates
   - Screenshots of new UI

---

## Post-Implementation Tasks

### Code Quality
- [ ] Run ESLint and fix all warnings
- [ ] Run TypeScript compiler with strict mode
- [ ] Format all files with Prettier
- [ ] Remove console.logs (except intentional debug)

### Testing
- [ ] Run full E2E test suite
- [ ] Run unit tests (if any affected)
- [ ] Manual testing on 3 devices (desktop, tablet, phone)
- [ ] Test in 2 browsers (Chrome, Safari)

### Documentation
- [ ] Update this plan with implementation notes
- [ ] Create completion summary
- [ ] Document any deviations from plan
- [ ] Add troubleshooting guide

### Deployment
- [ ] Test in staging environment
- [ ] Verify asset paths work in production
- [ ] Check PWA still works
- [ ] Monitor error logs after deploy

---

## Implementation Notes

### Session: [Date TBD]
- Started implementation: [timestamp]
- Completed phases: []
- Blockers encountered: []
- Deviations from plan: []

---

## Completion Checklist

### Phase 1: Foundation
- [ ] clearAllCustomCategories function added
- [ ] Reset functionality implemented
- [ ] Reset button in UI
- [ ] Translations added for reset
- [ ] Manual testing passed

### Phase 2: Built-in Display
- [ ] CustomCategoryManager loads built-in categories
- [ ] Unified display with visual distinction
- [ ] Modification indicators working
- [ ] Responsive on mobile
- [ ] Manual testing passed

### Phase 3: Built-in Editing
- [ ] CustomCategoryEditor accepts built-in categories
- [ ] Read-only fields for built-in
- [ ] Question loading works
- [ ] Hide/unhide functionality works
- [ ] Add questions to built-in works
- [ ] Persistence verified
- [ ] Manual testing passed

### Phase 4: Question Deletion
- [ ] Delete button added to questions
- [ ] Confirmation dialogs work
- [ ] Custom question deletion works
- [ ] Built-in question hiding works
- [ ] Edge cases handled
- [ ] Manual testing passed

### Phase 5: E2E Tests
- [ ] Built-in category tests written
- [ ] Reset tests written
- [ ] Integration tests enhanced
- [ ] Edge case tests written
- [ ] All tests passing
- [ ] Test suite stable (no flakes)

### Final Review
- [ ] All manual tests passed
- [ ] All automated tests passed
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance verified
- [ ] Accessibility verified
- [ ] Ready for deployment

---

## Appendix: Component Hierarchy

```
CustomCategoryManager (Main UI)
├── Built-in Categories Section
│   ├── Category Card (built-in)
│   │   ├── Emoji + Name (read-only)
│   │   ├── Question count
│   │   ├── Modification indicator
│   │   ├── Edit button → CustomCategoryEditor (built-in mode)
│   │   └── (No delete button)
│   └── ...
├── Custom Categories Section
│   ├── Category Card (custom)
│   │   ├── Emoji + Name (editable)
│   │   ├── Question count
│   │   ├── Edit button → CustomCategoryEditor (custom mode)
│   │   └── Delete button
│   └── ...
└── Create New Button → CustomCategoryEditor (create mode)

CustomCategoryEditor
├── Mode: Create Custom | Edit Custom | Edit Built-in
├── Header
│   ├── Title (context-aware)
│   └── Close button
├── Category Info
│   ├── Emoji input (editable for custom, read-only for built-in)
│   └── Name input (editable for custom, read-only for built-in)
├── Questions List
│   ├── Question Item
│   │   ├── Text
│   │   ├── Type badge (Game Question / Your Question / Hidden)
│   │   └── Action button (Delete / Hide / Unhide)
│   └── ...
├── Add Question Input
└── Save Button
```

---

## End of Plan
