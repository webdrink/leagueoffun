# BlameGame Multilingual Support Guide

This document outlines how BlameGame implements multilingual support and provides guidelines for developers and translators.

## 1. Overview

BlameGame supports multiple languages through a comprehensive localization system that includes:

- UI text translations
- Language-specific category files
- Language-specific question files
- Dynamic language switching

## 2. Structure

### 2.1 Translation Files

Translation strings are organized by language in the `lib/localization` directory:

```
lib/localization/
  ├── en.ts     # English translations
  ├── de.ts     # German translations
  ├── es.ts     # Spanish translations
  ├── fr.ts     # French translations
  ├── i18n.ts   # i18next configuration
  └── index.ts  # Exports all translations
```

Each language file exports an object that follows the `Translation` interface defined in `types.ts`.

### 2.2 Category Files

Categories are stored in a unified file with translations for all languages:

```
public/questions/
  └── categories.json   # Combined categories with all language translations
```

### 2.3 Question Files

Questions are stored in language-specific directories:

```
public/questions/
  ├── de/           # German questions (default)
  │   ├── party.json
  │   ├── relationships.json
  │   └── ...
  ├── en/           # English questions
  │   ├── party.json
  │   ├── relationships.json
  │   └── ...
  └── ...          # Other languages
```

## 3. Adding a New Language

To add a new language:

1. Create a new translation file in the `lib/localization` directory
2. Add the language code to the `SupportedLanguage` type in `types.ts`
3. Add the language to the `SUPPORTED_LANGUAGES` array in `hooks/utils/languageSupport.ts`
4. Add the new language translation to the categories in `public/questions/categories.json`
5. Create language-specific question files in the `public/questions/{lang}` directory

## 4. Translation Guidelines

### 4.1 UI Translations

- Use constants for translation keys
- Group related translations under namespace objects
- Use variable interpolation for dynamic content: `{variable}`

### 4.2 Category Translations

- Maintain the same IDs across all languages
- Translate each language field (`de`, `en`, `es`, `fr`) to the appropriate language
- Keep the `emoji` consistent across languages

### 4.3 Question Translations

- Translate questions appropriately for the target language
- Maintain the same category IDs across languages

## 5. Implementation

### 5.1 Using Translations in Components

```tsx
// Import the hook
import useTranslation from '../hooks/useTranslation';

const MyComponent = () => {
  // Get the translation function
  const { t } = useTranslation();
  
  return (
    <div>
      {/* Simple translation */}
      <h1>{t('game.title')}</h1>
      
      {/* Translation with variables */}
      <p>{t('game.question_count', { count: 10 })}</p>
    </div>
  );
};
```

### 5.2 Switching Languages

Users can change their language through the language selector in the settings panel.

### 5.3 Language Detection

On first load, the app attempts to detect the user's preferred language based on browser settings.

## 6. Testing

When adding or updating translations:

1. Test language switching to ensure all UI updates properly
2. Verify that category and question content loads in the correct language
3. Check for missing translations or display issues
4. Test variable interpolation with different inputs

## 7. Maintenance

- Keep all language files in sync when adding new features
- Update this documentation when making structural changes to the translation system
- Consider adding automated tests for translation coverage
