# Plan: Fix Loading Sequence & GitHub Pages Path Issues (Extended Review by Echo)

## Feature Name/Bugfix Title
Resolve Loading Sequence, Category Display, and GitHub Pages Asset Path Issues

---

## 🔍 Goals & Expected Behavior

1. **Fix "error.noQuestionsForRound" on First Click**: Ensure the question loading sequence properly loads categories and questions before preparing a round.
2. **Fix Incorrect Category Display in Loading Animation**: Correct the issue where category names display as single characters due to faulty data handling.
3. **Fix GitHub Pages 404 Errors**: Ensure all assets (e.g., `categories.json`, `manifest.webmanifest`, PWA icons) load correctly under `/blamegame/`.

---

## 🧠 Additional Root Cause Insights (Echo Review)

### ✅ Category Bug – Displayed Letters like “I”, “o”, “a”

- You're passing an array of strings (e.g., `['Auf der Arbeit', 'Alltag']`) instead of full category objects.
- When `LoadingCardStack` maps over these, it treats each string like an array of characters.

> 🔧 **Fix**: Ensure you're passing `CategoryObject[]`, not `string[]`.

```ts
const selectedCategories = allCategories.filter(cat =>
  selectedCategoryIds.includes(cat.id)
);
<LoadingContainer categories={selectedCategories} />
```

---

### ✅ Redundant Category Rendering

- `console.log()` reveals multiple re-renders of the same category data.
- Likely cause: state is being set multiple times due to missing guards in `useEffect`.

> 🔧 **Fix**: Introduce a memoized or guarded update:

```ts
useEffect(() => {
  if (!categoriesInitialized && categories.length) {
    setCategoriesInitialized(true);
    setLoadingCategories(categories);
  }
}, [categories]);
```

---

### ✅ Asset Path Issues on GitHub Pages

- `getAssetsPath()` must account for dynamic base paths, especially `/blamegame/`.
- `import.meta.env.BASE_URL` should be used as the canonical source of base path.

> 🔧 **Fix**:

```ts
export function getAssetsPath(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${relativePath}`.replace(/\/\/+/g, '/');
}
```

---

### ✅ Missing Icons / `manifest.webmanifest`

- Icons not found = either missing in `/public` or incorrectly referenced.
- Use `getAssetsPath()` to resolve manifest references in `<head>`.

> 🔧 Tasks:

- Ensure all required PWA icons exist in `/public`
- In `vite.config.ts`, set `base` via env:  
  `base: process.env.VITE_BASE_PATH || '/'`
- In HTML:

```html
<link rel="manifest" href={getAssetsPath('manifest.webmanifest')} />
```

---

## 🧪 Additional Debugging & Tools

### ✅ Add a `<DebugPanel />`

Show real-time info:
- `questions.length`
- `categories.length`
- `isInitialized`
- `renderCount`

> ✅ Use `URLSearchParams` to toggle:  
> `?debug=true`

---

## ✅ Implementation Checklist (Extended)

- [ ] Ensure `LoadingContainer` receives full category objects
- [ ] Add guards and logging to `LoadingCardStack`
- [ ] Enhance `getAssetsPath()` to use `import.meta.env.BASE_URL`
- [ ] Refactor `vite.config.ts` to use `VITE_BASE_PATH` env var
- [ ] Verify existence of all referenced PWA icons
- [ ] Reference manifest and icons using `getAssetsPath()`
- [ ] Implement retry logic for JSON fetches in `useQuestions`
- [ ] Use `isInitialized` flag in `App.tsx` to block game start
- [ ] Avoid redundant state updates in `useEffect`
- [ ] Simulate deployment via `serve dist --single` and `VITE_BASE_PATH=/blamegame/`
- [ ] Add `DebugPanel` for runtime state tracing

---

## 🧪 Debug and Verification Plan

### 1. **Console Instrumentation**

- Log each stage of `useQuestions` loading
- Print base path, manifest path, icon paths at runtime

### 2. **UI Overlay**

- Add dev toggle to display current question state, category array, init flags

### 3. **Network Throttling**

- Use devtools to simulate "Slow 3G" and test race condition resilience

### 4. **Cross-Environment Validation**

- Build with:
```bash
VITE_BASE_PATH=/blamegame/ pnpm build
serve dist --single
```

- Confirm all paths resolve correctly in `/blamegame/` scope
