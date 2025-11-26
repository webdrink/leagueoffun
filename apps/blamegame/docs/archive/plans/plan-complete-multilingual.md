# Complete Multilingual Implementation Plan

## Goal
Create a fully multilingual application that supports translation of both content (categories/questions) and UI elements across multiple languages.

## Current Status
- Basic multilingual support structure is in place for categories and questions
- Language selection UI components are implemented
- Language-specific index files are created but need refinement
- Directory structure for language-specific questions exists
- Missing: UI text localization system

## Implementation Plan

### 1. UI Text Localization System

#### Create Localization Infrastructure
- Create a `lib/localization` directory to hold all translation resources
- Implement a string resource system with translations for all UI text
- Create a `useTranslation` hook to access translated strings
- Add string formatting capability for variables in translations

#### String Resource Structure
```typescript
// Example structure
type TranslationKey = 
  | 'app.title'
  | 'intro.start_game'
  | 'intro.player_setup'
  | 'settings.language'
  | ...;

type Translations = Record<TranslationKey, string>;

// Language resources
const de: Translations = {
  'app.title': 'Blame Game',
  'intro.start_game': 'Spiel starten',
  ...
};

const en: Translations = {
  'app.title': 'Blame Game',
  'intro.start_game': 'Start Game',
  ...
};
```

### 2. Refine Category/Question Structure

#### Update Category Structure
- Ensure category IDs are consistent across all languages
- Use English category names as language-neutral IDs
- Remove placeholder translations with actual localized text
- Keep metadata (emoji, count) consistent across languages

#### Example of Refined Category Structure
```json
// index.de.json
[
  {
    "id": "party",
    "name": "Beim Feiern",
    "fileName": "party.json",
    "emoji": "🎉"
  },
  ...
]

// index.en.json
[
  {
    "id": "party",
    "name": "At Parties",
    "fileName": "party.json",
    "emoji": "🎉"
  },
  ...
]
```

### 3. Question Loading System

#### Update Question File Structure
- Use language-specific directories (already created)
- Match question files to category IDs, not localized names
- Implement proper fallback to default language

#### Loading Sequence
1. Get language from user preferences
2. Load language-specific category index
3. For selected categories, load corresponding question files from language-specific directory
4. If file not found, fall back to default language

### 4. UI Component Updates

#### Identify All UI Components with Text
- App.tsx - Main titles, buttons
- IntroScreen.tsx - Intro text, buttons
- SettingsScreen.tsx - Settings labels
- PlayerSetupScreen.tsx - Setup instructions, buttons
- QuestionScreen.tsx - UI controls
- SummaryScreen.tsx - Summary text, headers
- DebugPanel.tsx - Debug controls, labels

#### Update Components to Use Translation Hook
Replace all hardcoded strings with translation keys:
```tsx
// Before
<Button>Spiel starten</Button>

// After
const { t } = useTranslation();
<Button>{t('intro.start_game')}</Button>
```

### 5. Language Selection Improvements

#### UX Enhancements
- Add visual feedback when changing language
- Update language detection to respect browser settings on first load
- Ensure smooth transitions between languages

#### Language Management
- Store language preference persistently
- Add more languages as needed using the established framework

### 6. Documentation Updates

#### Update Existing Documentation
- Expand multilingual-support.md with UI localization details
- Update implementation guides for translators
- Add translation process documentation

#### New Documentation
- Create a guide for adding new languages
- Document translation formats and conventions

## Tasks Breakdown

1. Create UI localization system
2. Update category index structure across languages
3. Enhance question loading to support full localization
4. Update all UI components to use the translation system
5. Improve language selection UX
6. Update documentation
7. Test multilingual support end-to-end
