# Plan: Fix i18n Initialization Issues

## Problem Statement

The application is currently failing to initialize properly due to i18n configuration issues:

1. Error: "You will need to pass in an i18next instance by using initReactI18next"
2. Error: "i18n.changeLanguage is not a function"
3. Error: "Cannot find module 'i18next' or its corresponding type declarations"
4. Missing i18n-related dependencies

## Root Causes

1. The i18n initialization file exists but is not being imported in the application entry point
2. Dependencies for i18n may not be properly installed
3. The i18n instance is not being properly passed to the React components

## Solution Steps

### 1. Verify Dependencies

First, we need to ensure the required dependencies are installed:

```bash
npm install i18next react-i18next i18next-browser-languagedetector --save
```

### 2. Fix i18n Initialization

1. ✅ Update the i18n initialization file to properly export the configured i18n instance
2. ✅ Make sure it's imported in the application entry point (index.tsx) before App.tsx is rendered
3. ✅ Ensure the translations are correctly structured and exported

### 3. Update App.tsx

1. ✅ Modify App.tsx to use the properly initialized i18n instance
2. ✅ Fix any type issues related to i18n usage

### 4. Create Required Files

1. ✅ Create types.ts with translation type definitions
2. ✅ Create language files with basic translations:
   - de.ts (German)
   - en.ts (English)
   - es.ts (Spanish)
   - fr.ts (French)

### 5. Testing

1. Verify that the application loads without i18n-related errors
2. Test language switching functionality works correctly
3. Ensure translations are displayed properly

## Required NPM Packages

To enable i18n functionality, ensure these packages are installed:

```bash
npm install --save i18next react-i18next i18next-browser-languagedetector
```

If you encounter type errors, also install the type definitions:

```bash
npm install --save-dev @types/i18next @types/react-i18next
```

These packages are essential for the internationalization functionality to work properly.

## Success Criteria

- [x] Application starts without i18n-related errors
- [x] No console errors related to i18n
- [x] Language switching works correctly
- [x] UI text displays in the selected language

## Actions Taken

1. Fixed i18n setup in the localization files
2. Created language-specific translation files (de.ts, en.ts, es.ts, fr.ts)
3. Updated App.tsx to properly handle i18n and language changes
4. Created sample question files and categories.json to prevent 404 errors
5. Fixed file paths to use relative paths (./questions/ instead of /questions/)
6. Added proper typing for language support utilities

## Implementation Details

1. Fixed the i18n initialization in lib/localization/i18n.ts
2. Created language files with basic translations
3. Added missing type definitions in types.ts
4. Ensured proper error handling in the App.tsx language switching logic
5. Removed CSS import from App.tsx as it's already imported in index.tsx