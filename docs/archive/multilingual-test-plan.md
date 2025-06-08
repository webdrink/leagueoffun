# Multilingual Support Test Plan

This document outlines the testing strategy for the multilingual support features in BlameGame.

## 1. Language Selection and Detection

### 1.1 Browser Language Detection
- **Test:** Open app in browser with different language preferences set
- **Expected:** App should detect and apply the supported language closest to browser preference
- **Fallback:** If no match, app should default to German (DE)

### 1.2 Language Selector UI
- **Test:** Navigate to settings and change language using the selector
- **Expected:** Language selector should display all available languages
- **Expected:** Current language should be visually indicated as selected

### 1.3 Language Persistence
- **Test:** Change language, close and reopen the app
- **Expected:** Selected language should be remembered between sessions

## 2. UI Translation

### 2.1 Component Text Translation
- **Test:** Switch between languages and check all UI components
- **Expected:** All text should be translated according to the selected language
- **Expected:** No hardcoded text should remain in any UI component

### 2.2 Variable Interpolation
- **Test:** Check components with dynamic content (e.g., question counts, player names)
- **Expected:** Variables should be properly interpolated in all languages
- **Expected:** Sentence structure should remain grammatically correct across languages

### 2.3 Translation Completeness
- **Test:** For each language, navigate through all app screens
- **Expected:** No missing translation keys or "[Translation missing]" placeholders
- **Expected:** No English/default text appearing when a different language is selected

## 3. Content Translation

### 3.1 Category Loading
- **Test:** Change language and navigate to category selection
- **Expected:** Categories should display in the selected language based on unified categories.json
- **Expected:** Category emojis and other metadata should be consistent across languages

### 3.2 Question Loading
- **Test:** Start a game in different languages
- **Expected:** Questions should be loaded in the selected language
- **Expected:** If a question is missing in a language, it should fallback to default language

### 3.3 Categories and Questions Consistency
- **Test:** Compare questions across languages for consistent meaning
- **Expected:** The same question concept should be expressed appropriately in each language

## 4. Edge Cases

### 4.1 Missing Translations
- **Test:** Introduce a deliberately missing translation key
- **Expected:** App should show the key name or default language as fallback
- **Expected:** No crashes or console errors for missing translations

### 4.2 Language Switching During Game
- **Test:** Change language during active gameplay
- **Expected:** Current game should continue seamlessly
- **Expected:** UI should update immediately, current game state preserved

### 4.3 Unsupported Language Fallback
- **Test:** Attempt to use a language code not in the supported list
- **Expected:** App should fallback to default language
- **Expected:** No crashing or blank screens

## 5. Performance

### 5.1 Initial Load Performance
- **Test:** Measure initial load time with different languages
- **Expected:** No significant performance difference between languages
- **Expected:** Translation files should load efficiently

### 5.2 Language Switch Performance
- **Test:** Measure time taken to switch languages
- **Expected:** Language switching should be nearly instantaneous
- **Expected:** No visible UI lag during language transition

## 6. Compatibility

### 6.1 Cross-Browser Testing
- **Test:** Test language features in Chrome, Firefox, Safari, and Edge
- **Expected:** Consistent behavior across all modern browsers

### 6.2 Mobile Responsiveness
- **Test:** Test language features on mobile devices
- **Expected:** Language selector and translated content should be properly displayed on all screen sizes

## Test Reporting

For each test case, record:
1. Test date and tester name
2. Test environment (browser, device)
3. Steps taken
4. Expected vs. actual result
5. Screenshots if applicable
6. Pass/Fail status

## Regression Testing

After any significant update to the multilingual system:
1. Retest all primary language switching flows
2. Verify all UI components in at least two different languages
3. Check for any new hardcoded text