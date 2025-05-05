# TODO for Blame Game MVP

## Setup & Fixes
- [x] Scaffold Vite+React+TS+Tailwind+Framer Motion for Blame Game
- [x] Implement Blame Game UI logic
- [x] Fix all TypeScript and linter errors in Blame Game
- [x] Ensure all dependencies are installed and working

## Game Data
- [x] Load questions from CSV (not hardcoded)
- [x] Add fallback if CSV missing or parse error

## Build & Deploy
- [x] Add CNAME generation for dist/
- [x] Ensure vite.config.ts is subdomain-safe
- [x] Test build output for GitHub Pages
- [x] Prepare for gh-pages deploy

## Polish
- [x] Add favicon to public/
- [x] Add meta tags (title, description)
- [x] Mobile/responsive tweaks
- [x] Accessibility basics

## Documentation
- [x] Add README for Blame Game

---

# Outstanding Errors (to resolve step by step)

## game-picker
*Note: These might be resolved by user's manual edits, will re-check later if needed.*
- [x] App.tsx: Cannot find module 'react' or its corresponding type declarations. *(Resolved: No longer present)*
- [x] vite.config.ts: Cannot find module 'vite' or its corresponding type declarations. *(Resolved: No longer present)*
- [x] vite.config.ts: Cannot find module '@vitejs/plugin-react' or its corresponding type declarations. *(Resolved: No longer present)*

## blamegame
- [x] index.tsx (line 6): Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Container'. Type 'null' is not assignable to type 'Container'. (Resolved)
- [x] App.tsx (line 54): Argument of type '{ category: string; text: string; }[]' is not assignable to parameter of type 'SetStateAction<never[]>'. (Resolved)
- [x] App.tsx (line 56): Argument of type '"Keine Fragen gefunden."' is not assignable to parameter of type 'SetStateAction<null>'. (Resolved)
- [x] App.tsx (line 59): Argument of type '"Fehler beim Laden der Fragen."' is not assignable to parameter of type 'SetStateAction<null>'. (Resolved)
- [x] App.tsx (line 65): Property 'category' does not exist on type 'never'. (Resolved)
- [x] App.tsx (line 67): Argument of type 'unknown[]' is not assignable to parameter of type 'SetStateAction<never[]>'. (Resolved)
- [x] App.tsx (line 76): Property 'category' does not exist on type 'never'. (Resolved)
- [x] App.tsx (line 164): Property 'category' does not exist on type 'never'. (x2) (Resolved)
- [x] App.tsx (line 165): Property 'text' does not exist on type 'never'. (Resolved)
- [ ] index.css (lines 1, 2, 3): Unknown at rule @tailwind (Warning - likely IDE/linter issue, ignore for now)

## scripts/generateGamesJson.ts
- [x] Cannot find module 'fs' or its corresponding type declarations. *(Hint: Resolved by switching to CommonJS `require` syntax)*
- [x] Cannot find module 'path' or its corresponding type declarations. *(Hint: Resolved by switching to CommonJS `require` syntax)*
- [x] Cannot find name '__dirname'. (x2) *(Hint: Resolved by switching to CommonJS `require` syntax)*

## public
- [x] games.json: Comments are not permitted in JSON. (Resolved)

---

# Progress
- Update this file after each completed step.
- Resolved Blame Game TypeScript errors.
