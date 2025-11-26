# Base URL Path Fix for GitHub Pages Deployment

## Feature Name/Bugfix Title
Fix for missing questions and 404 errors in GitHub Pages deployment

## Goal & Expected Behavior
Ensure that all static assets (JSON files, images, etc.) load correctly when the app is deployed to GitHub Pages, where it's served from a subdirectory (`/blamegame/`) rather than the root.

## Technical Steps to Implement

1. Modify all fetch requests to use `import.meta.env.BASE_URL` prefix for paths
   - Update question loader utilities
   - Check any direct fetch calls in components
   - Ensure PWA icons and other static assets are correctly referenced

2. Verify that all JSON files are correctly placed in the `public/` directory:
   - `public/questions/categories.json`
   - `public/questions/{lang}/{category}.json` files

3. Update any hard-coded paths in the application to use the base URL

## Potential Edge Cases

1. Local development vs. production - ensure the solution works in both environments
2. Different deployment environments - the fix should gracefully handle different base paths
3. Cached outdated paths - users with cached versions might need to clear their cache

## Impact on Existing Files or UX

- No visible UX changes - this is purely a technical fix
- Question loading should now work correctly when deployed to GitHub Pages
- PWA icon and other static assets should load properly

## Implementation Checklist

- [x] Create utility function `getAssetsPath` in `lib/assetUtils.ts` to handle base URL prefixing
- [x] Create examples of updated question loading utilities in `lib/questionLoaders.ts`
- [x] Create `lib/index.ts` to export all utilities for easier imports
- [x] Implement updated question loader functions in `utils/questionLoaders.ts`
- [x] Add proper TypeScript interfaces for question and category data
- [x] Create audio utilities with proper path handling in `lib/audioUtils.ts`
- [x] Create verification script for checking required static assets in `scripts/verify-assets.js`
- [x] Add `verify-assets` script to package.json
- [x] Test locally using `npm run build` and `npm run preview`
- [x] Deploy and verify on GitHub Pages
- [x] Update documentation with the fix details