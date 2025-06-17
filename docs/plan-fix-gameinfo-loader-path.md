# Plan: Fix GameInfoLoader Path

## Feature Name/Bugfix Title
Ensure `GameInfoLoader` correctly loads `game.json` in all deployment environments.

## Goals & Expected Behavior
- `game.json` should be fetched successfully both locally and on GitHub Pages/custom domains.
- App should no longer display a blank page due to failing JSON fetch.

## Technical Steps
1. Copy `game.json` to the `public/` directory so it is included in the build output.
2. Update `GameInfoLoader` to use `fetchAsset('game.json')` which applies `getAssetsPath` and retry logic.
3. Extend `verify-assets.js` to check that `game.json` exists in `public` and the build `dist` directory.
4. Add/update documentation comments as required.

## Potential Edge Cases
- Incorrect base path could still break the fetch if environment variables are misconfigured.
- Cached old versions of the service worker may continue serving stale files until refreshed.

## Impact on Existing Files or UX
- No direct UI changes.
- Ensures initial configuration loads correctly and prevents the app from hanging on "Loading".

## Checklist
- [x] `game.json` copied to `public/`
- [x] `GameInfoLoader` uses `fetchAsset`
- [x] `verify-assets.js` validates presence of `game.json`
- [x] Documentation comments updated

