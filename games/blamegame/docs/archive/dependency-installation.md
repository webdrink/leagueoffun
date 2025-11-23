# Dependency Installation Guide

To ensure the application works correctly, you need to install the following dependencies:

## Required i18n Dependencies

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

This installs:

1. `i18next` - The core internationalization framework
2. `react-i18next` - React bindings for i18next
3. `i18next-browser-languagedetector` - Language detection plugin for i18next

## TypeScript Types (if needed)

If you're getting TypeScript errors related to i18next modules, install the type definitions:

```bash
npm install --save-dev @types/i18next @types/react-i18next
```

## Verification

After installing the dependencies, restart your development server and check that:

1. No module import errors appear in the console
2. The application loads without i18n initialization errors
3. Language switching works correctly

If you're still seeing issues, check the browser console for specific error messages.