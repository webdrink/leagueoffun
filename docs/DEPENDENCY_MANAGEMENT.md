# Dependency Management

This document provides guidance on managing dependencies for the BlameGame project, including required packages and installation instructions.

## 1. Core Dependencies

### React and TypeScript

The application is built on React with TypeScript:

```bash
npm install react react-dom typescript @types/react @types/react-dom
```

### State Management

We use React's built-in hooks for state management, no additional libraries required.

## 2. UI and Animation Dependencies

### Framer Motion

Used for animations throughout the application:

```bash
npm install framer-motion
```

### Lucide React

Used for icons:

```bash
npm install lucide-react
```

### Radix UI

Used for certain UI components:

```bash
npm install @radix-ui/react-slider
```

## 3. Internationalization Dependencies

The application uses i18next for internationalization:

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### TypeScript Types

If you're getting TypeScript errors related to i18next modules, install the type definitions:

```bash
npm install --save-dev @types/i18next @types/react-i18next
```

## 4. Dependency Verification

After installing dependencies, verify that:

1. No module import errors appear in the console
2. The application loads without initialization errors
3. UI components render correctly
4. Animations work as expected
5. Language switching functions properly

## 5. Troubleshooting

### Missing Modules

If you encounter "Cannot find module" errors:

1. Check that all dependencies are installed
2. Run `npm install` to ensure all packages are up to date
3. Check for typos in import statements
4. Restart the development server

### i18next Errors

If you encounter i18next-related errors:

1. Verify that all i18next dependencies are installed
2. Check that i18n is properly initialized in the application
3. Ensure language files are correctly formatted
4. Check the browser console for specific error messages

### Animation Issues

If animations aren't working correctly:

1. Verify that framer-motion is installed
2. Check that components using motion are properly importing from 'framer-motion'
3. Ensure animation props are correctly defined

## 6. Adding New Dependencies

When adding new dependencies to the project:

1. Consider whether the dependency is truly necessary
2. Check bundle size impact
3. Verify license compatibility
4. Test thoroughly after adding
5. Document the new dependency in this guide
6. Update package.json with any specific version requirements

## 7. Removing Unused Dependencies

Periodically review and remove unused dependencies:

1. Check package.json for dependencies that might no longer be needed
2. Use tools like `npm-check` or `depcheck` to identify unused packages
3. Remove unused dependencies with `npm uninstall [package-name]`

## 8. Development Dependencies

These packages are used for development only and are not included in the production build:

```bash
npm install --save-dev eslint typescript-eslint prettier
```