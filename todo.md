# League of Fun MVP - Master TODO List

This file serves as the central reference for all TODOs across the League of Fun project. Individual component TODOs are maintained in their respective directories.

## Component TODO Lists

### Game Components
- [Blame Game TODOs](./games/blamegame/todo.md) - Implementation in progress
- [Truth or Drink TODOs](./games/truthordrink/todo.md) - Initial planning stage

### Infrastructure Components
- [Game Picker TODOs](./game-picker/todo.md) - Basic implementation complete, enhancements planned

## Repository-Level Tasks

### 1. Development Infrastructure
- [x] Review deployment and utility scripts for robustness
  - [x] `deployBlameGame.js` is functional
  - [x] `generateGamesJson.ts` is functional 
  - [ ] `deployAllGames.ts` needs implementation
- [ ] Create unified build and deployment pipeline:
  - [ ] Implement `deployAllGames.ts` to handle all games
  - [ ] Add CI/CD workflow for automated deployments
- [ ] Add repository-level testing framework:
  - [ ] Configure Jest or Vitest for unit testing
  - [ ] Add E2E testing with Cypress or Playwright

### 2. Documentation
- [ ] Update root README.md:
  - [ ] Add project overview and purpose
  - [ ] Document repository structure
  - [ ] Add getting started instructions
  - [ ] List available games with brief descriptions
- [ ] Create contributing guidelines:
  - [ ] Document code style and standards
  - [ ] Explain PR and review process
  - [ ] Add templates for issues and PRs

### 3. Game Integration Framework
- [ ] Standardize game metadata format:
  - [ ] Define required fields for games.json
  - [ ] Create validation for game metadata
- [ ] Implement unified state management:
  - [ ] Consider shared hooks or context providers
  - [ ] Define standard interfaces for game state

### 4. Performance & Optimization
- [ ] Review bundling and code splitting:
  - [ ] Ensure games load independently
  - [ ] Optimize asset loading
- [ ] Implement analytics tracking (optional):
  - [ ] Track game usage and popularity
  - [ ] Gather performance metrics

### 5. Future Planning
- [ ] Prioritize next games for development
- [ ] Explore multiplayer capabilities:
  - [ ] Investigate WebRTC or WebSocket options
  - [ ] Consider shared-device multiplayer framework
- [ ] Evaluate PWA implementation across all games

## Instructions for Maintenance

**For developers:** Keep updating tasks in the component-specific todo.md files. When features are completed, mark them as done [x] and add implementation notes. For significant changes, add a comment in the code explaining what was done and why. Also update the corresponding README files with dates and explanation of changes.

**For planning:** Review all todo.md files regularly to maintain a comprehensive view of project progress. Prioritize tasks based on current focus areas and resources.

## 0. Current Bug Fixes & Setup Issues (Priority)
*Resolve these before proceeding with new feature development.*

- [x] **Dependency Installation & Pathing for UI Components:**
    - **Error Symptoms:**
        - `Cannot find module './components/ui/input' or its corresponding type declarations.` (in `App.tsx`)
        - `Cannot find module './components/ui/checkbox' or its corresponding type declarations.` (in `App.tsx`)
        - `Cannot find module './ui/switch' or its corresponding type declarations.` (in `games/blamegame/components/DebugInput.tsx`)
        - `Cannot find module '@radix-ui/react-checkbox'` (in `games/blamegame/components/ui/checkbox.tsx`)
        - `Cannot find module '@radix-ui/react-label'` (in `games/blamegame/components/ui/label.tsx`)
        - `Cannot find module 'class-variance-authority'` (in `games/blamegame/components/ui/label.tsx`)
        - `Cannot find module '@radix-ui/react-switch'` (in `games/blamegame/components/ui/switch.tsx`)
        - `Cannot find module 'clsx'` (in `games/blamegame/lib/utils.ts`)
        - `Cannot find module 'tailwind-merge'` (in `games/blamegame/lib/utils.ts`)
    - **Resolution Steps:**
        1.  Navigate to `cd games/blamegame`.
        2.  Run `npm install @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-switch class-variance-authority clsx tailwind-merge lucide-react`. (Ensure `lucide-react` is also included as it's used by Shadcn components). (DONE)
        3.  Verify import paths in the affected files: (DONE - paths seem correct)
            - `App.tsx`: `import { Input } from './components/ui/input';`, `import { Checkbox } from './components/ui/checkbox';`
            - `DebugInput.tsx`: `import { Switch } from "./ui/switch";` (relative to `games/blamegame/components/`)
            - `checkbox.tsx`, `label.tsx`, `switch.tsx`, `utils.ts`: Ensure their internal imports are correct.
        4.  Restart the development server. (User action)
    - *Note: Dependencies installed. Paths verified.*

- [x] **Tailwind CSS `@tailwind` Directive Warnings:** (Reviewed)
    - **Error Symptom:** `Unknown at rule @tailwind` (in `games/blamegame/index.css`).
    - **Resolution Steps:**
        1.  Ensure Tailwind CSS is correctly configured: `tailwind.config.js` and `postcss.config.js` should be present and correctly set up in `games/blamegame/`. (Checked)
        2.  Verify that `games/blamegame/index.css` content starts with: (Checked)
            ```css
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
            ```
        3.  Install the "Tailwind CSS IntelliSense" VS Code extension if not already present. This usually resolves IDE-specific warnings. (User action)
        4.  If the build process (`npm run dev` or `npm run build`) completes without Tailwind errors, these IDE warnings can often be deprioritized as they don't affect functionality. (User action)
    - *Note: Configuration and CSS file appear correct. Issue likely IDE-specific or resolved by build. Recommend installing Tailwind CSS IntelliSense extension and checking build output.*

- [x] **`DebugInput` Name Not Found in `App.tsx`:** (Resolved)
    - **Error Symptom:** `Cannot find name 'DebugInput'.` (multiple instances in `App.tsx`).
    - **Resolution Steps:**
        1.  `DebugInput` is a sub-component of `DebugPanel`. `App.tsx` should only import and render `DebugPanel`. (Verified)
        2.  Search for and remove any direct import statements or JSX usages of `<DebugInput ... />` from `games/blamegame/App.tsx`. These are likely artifacts. (Done - Removed the block that used `gameSettings.showDebugControls` which contained these usages.)
    - *Note: `App.tsx` now only uses `DebugPanel`. The `showDebugControls` property in `GameSettings` and its related logic in `App.tsx` were removed as `DebugPanel` visibility is controlled by its own `debugMode` state, toggled by the WrenchIcon.* 

- [x] **Type Errors in `DebugPanel.tsx` (GameSettings Keys):** (Resolved)
    - **Error Symptoms:**
        - `Type '"numberOfRounds"' is not assignable to type 'keyof GameSettings'.` (and similar for other settings like `questionsPerRound`, `timePerQuestion`, `showScore`, `allowSkip`, `showIntroAnimation`, `introAnimationDuration`, `questionFontSize`, `dynamicThemeEnabled`).
        - `Type '"questionCardAnimation"' is not assignable to type 'keyof GameSettings'. Did you mean '"questionCardTransitionSec"'?`
        - `Type 'number | boolean' is not assignable to type 'never'.` (in `handleSectionReset` related to `updatedSettings[setting.name] = defaultGameSettings[setting.name];`)
    - **Resolution Steps:**
        1.  Open `games/blamegame/App.tsx` and carefully review the `GameSettings` interface definition. (Done)
        2.  Open `games/blamegame/components/DebugPanel.tsx`. (Done)
        3.  In `settingsConfig`, ensure every `name` property (e.g., `'numberOfRounds'`) exactly matches a key in the `GameSettings` interface. (Done - All keys from `settingsConfig` are now in `GameSettings`)
            - For `questionCardAnimation`: Decided that `GameSettings` should have `questionCardAnimation: string`. This has been updated in `GameSettings` in `App.tsx`. (Done)
        4.  Ensure the `SettingConfigBase` interface in `DebugPanel.tsx` defines `name: keyof GameSettings;`. This was already the case. (Checked)
        5.  The `'number | boolean' is not assignable to type 'never'` error should resolve once all `setting.name` values are valid keys of `GameSettings`. (Resolved by updating `GameSettings`)
    - *Note: The `GameSettings` interface in `App.tsx` has been updated to include all properties defined in `DebugPanel.tsx`'s `settingsConfig`. `initialGameSettings` in `App.tsx` has also been updated. This ensures type compatibility.* 

- [x] **Type Error in `DebugInput.tsx` (Select Value Casting):** (Resolved)
    - **Error Symptom:** `Conversion of type 'number | boolean' to type 'string' may be a mistake...` (related to `value={String(currentValue)}` for select input type).
    - **Resolution Steps:**
        1.  This error highlights that a `currentValue` for a `select` input might be a boolean, which is invalid for an HTML select's value.
        2.  In `DebugPanel.tsx`, when defining `settingsConfig`, ensure that any setting with `type: 'select'` (like `questionCardAnimation`) corresponds to a property in `GameSettings` that is typed as `string` or `number`, *not* `boolean`. (Done - `questionCardAnimation` is now `string` in `GameSettings`)
        3.  In `App.tsx`, update the `GameSettings` interface. For example, `questionCardAnimation: string;` (not `boolean`). (Done)
        4.  The runtime check `if (typeof selectValue === 'boolean')` in `DebugInput.tsx` is a good safeguard, but the type system should ideally prevent this. (This check remains but should not be hit for `questionCardAnimation` due to type changes.)
        5.  The `value={currentValue === null || currentValue === undefined || isNaN(currentValue as number) ? '' : String(currentValue)}` in `DebugInput.tsx` for number inputs, and similar for string/select, should correctly handle casting to string for the input field. The primary fix is ensuring the underlying `GameSettings` type for a select-driven field is not boolean. (Verified)
    - *Note: The `questionCardAnimation` property in `GameSettings` is now correctly typed as `string`. This resolves the potential type conflict for select inputs in `DebugInput.tsx`. No errors were found in `DebugInput.tsx` after these changes.* 

---

## Codebase Structure & General Tasks
- [x] **game-picker/App.tsx**: Review and refactor if necessary. (Reviewed - No immediate refactoring needed, code is clean and serves its purpose.)
- [x] **game-picker/index.css**: Ensure styles are minimal and don't conflict. (Reviewed - Styles are minimal, use system fonts, and no conflicts noted.)
- [x] **games/blamegame/App.tsx**: Main application logic for Blame Game. This will be the focus of most feature enhancements. (Ongoing)
- [x] **games/blamegame/index.css**: Blame Game specific styles. (Reviewed - Tailwind directives, responsive styles, focus visibility, and background transitions are in place. Commented-out night sky example noted.)
- [x] **games/blamegame/tailwind.config.js**: Tailwind configuration for Blame Game. (Reviewed - Content paths, theme extensions for animations are correctly configured.)
- [x] **games/blamegame/hooks/**: Directory for custom React hooks. (All sub-tasks already marked as complete)
    - [x] `useLocalStorage.ts`: Implemented.
    - [x] `useTheme.ts`: Created for dynamic theming.
    - [x] `useSound.ts`: Created for sound effects.
- [x] **scripts/**: Review deployment and utility scripts for robustness. (Reviewed - `deployBlameGame.js` and `generateGamesJson.ts` are functional. `deployAllGames.ts` is a placeholder and needs implementation for full robustness.)
- [x] **public/games.json**: Ensure it's correctly generated and used. (Marked as complete - `generateGamesJson.ts` successfully creates it, and `game-picker/App.tsx` fetches it.)

---

# Feature Enhancements for games/blamegame/

## 1. LocalStorage: Played Question Tracking
- [x] Store `blamegame-played-questions` in localStorage.
- [x] Filter out recently played questions / reset if variety is low.
- [x] Add newly used questions to `blamegame-played-questions` on game end.
- [x] "Reset App Data" button clears relevant localStorage.

## 2. Dynamic Themes Based on Time
- [x] **tailwind.config.js**: Defined 4 time-based themes.
- [x] **games/blamegame/hooks/useTheme.ts**: `useTheme` hook implemented.
- [x] **games/blamegame/App.tsx**: Integrated `useTheme` hook.
- [x] **games/blamegame/index.css**: Added keyframes and transitions.
- [ ] **Refinement**: Review animations for smoothness and visual appeal. Ensure star animation for night theme is optimized.
    - *Hint: Consider CSS transforms and opacity for performance. For stars, ensure they don't cause layout shifts or performance drops on many elements.*

## 3. Sound Toggle + Sound Effects
- [x] **games/blamegame/App.tsx**: Sound toggle button implemented.
- [x] **games/blamegame/hooks/useLocalStorage.ts**: Sound preference stored.
- [x] **games/blamegame/hooks/useSound.ts**: `useSound` hook implemented.
- [x] **assets/**: Placeholder .mp3 files created.
- [ ] **Actual Sound Files**: Replace placeholder `.mp3` files (`new_question.mp3`, `round_start.mp3`, `summary_fun.mp3`) with distinct, appropriate sound effects.
    - *Hint: Find royalty-free sound effects. Keep file sizes small.*

## 4. NameBlame Mode (Player Selection)
- [x] **games/blamegame/App.tsx**: Added "NameBlame Mode" toggle/checkbox on the intro screen.
    *Note: Basic UI for player setup screen (`showPlayerSetup` state) also added.*
- [ ] **Player Setup UI & Logic (`App.tsx`):**
    - [ ] **Add Player Functionality:**
        - In `App.tsx`, implement the `onClick` handler for the "Add Player" button.
        - Validate `tempPlayerName` (not empty, not a duplicate, within character limits if any).
        - If valid and `players.length < 10`, add `tempPlayerName` to the `players` array (which is managed by `useLocalStorage`).
        - Clear `tempPlayerName` input field.
        - *Hint: `setPlayers(prevPlayers => [...prevPlayers, tempPlayerName.trim()]);`*
    - [ ] **Remove Player Functionality:**
        - For each player listed in the setup screen, add a small "remove" (e.g., X icon) button.
        - Implement `onClick` handler to remove the player from the `players` array.
        - *Hint: `setPlayers(prevPlayers => prevPlayers.filter(p => p !== playerToRemove));`*
    - [ ] **Input Validation & Feedback:**
        - Prevent adding more than 10 players (already have a message, ensure button is disabled).
        - Ensure "Start Game with These Players" button is disabled if `players.length < 2` or `players.length > 10`. (Partially implemented).
        - Provide clear visual feedback for validation (e.g., error messages near input if name is empty/duplicate).
- [x] **games/blamegame/hooks/useLocalStorage.ts**: Player names (`blamegame-player-names`) are already being stored via `useLocalStorage` hook in `App.tsx`.
- [ ] **Game Logic (NameBlame Mode in `App.tsx`):**
    - [ ] **Display Player Names During Question:**
        - When `nameBlameMode` is true and a question is active, display the list of `players` as selectable options (buttons, cards, etc.).
        - This UI will appear below or alongside the question card.
        - *Hint: Map over the `players` array to render these options.*
    - [ ] **Record Blame Interaction:**
        - When a player name is selected/clicked:
            - Identify the "blamer" (this might be implicit, or you might need a concept of whose "turn" it is if you want to track that). For MVP, assume any selection is a blame.
            - Identify the "blamed" (the player whose name was clicked).
            - Get the current `question.text`.
            - Create an interaction object: `const entry: NameBlameEntry = { from: "current_player_or_anonymous", to: selectedPlayerName, question: currentQuestion.text, timestamp: new Date().toISOString() };` (Define `NameBlameEntry` interface).
            - Add this entry to the `nameBlameLog` array (managed by `useLocalStorage`).
            - *Hint: `setNameBlameLog(prevLog => [...prevLog, newEntry]);`*
        - Proceed to the next question or game phase.
- [ ] **`NameBlameEntry` Interface:**
    - Define this interface in `App.tsx` (or a types file):
      ```typescript
      interface NameBlameEntry {
        from: string; // Identifier for the player who blamed (can be "anonymous" or a player name if turns are tracked)
        to: string;   // Player who was blamed
        question: string;
        timestamp: string; // ISO date string
      }
      ```

## 5. End-of-Game Summary & Progress Bar
- [x] **games/blamegame/App.tsx**: Basic results screen implemented.
- [x] Progress bar implemented.
- [ ] **NameBlame Mode Summary (`App.tsx`):**
    - [ ] If `nameBlameMode` was active for the completed game:
        - Process the `nameBlameLog` to count how many times each player in the `players` list was blamed (`entry.to`).
        - *Hint: Use a dictionary/Map to store counts: `{'PlayerA': 5, 'PlayerB': 3}`.*
        - Display these counts on the summary screen.
        - Optionally, find and highlight the player(s) blamed the most.
        - Example display: "Blame Count: Paula (7), Max (4), Anna (2)".
        - Fun title: "And the 'Most Blamed' award goes to... Paula (7 times)!"

## 6. Offline-Friendly Enhancements (PWA)
- [ ] **Vite PWA Plugin Setup:**
    - [ ] In `games/blamegame/`, run `npm install vite-plugin-pwa -D`.
    - [ ] **`games/blamegame/vite.config.ts`**: Import and configure `vite-plugin-pwa`.
        - *Hint: Refer to `vite-plugin-pwa` documentation for configuration options (caching strategies, manifest details).*
        ```typescript
        // Example vite.config.ts
        import { defineConfig } from 'vite';
        import react from '@vitejs/plugin-react';
        import { VitePWA } from 'vite-plugin-pwa';

        export default defineConfig({
          plugins: [
            react(),
            VitePWA({
              registerType: 'autoUpdate',
              // devOptions: { enabled: true }, // Enable PWA in dev for testing
              manifest: {
                name: 'The Blame Game',
                short_name: 'BlameGame',
                description: 'A fun game of pointing fingers!',
                theme_color: '#000000', // Example color
                icons: [
                  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff,woff2}'], // Cache these assets
                runtimeCaching: [ // Example runtime caching for API calls or other assets
                  {
                    urlPattern: /^https:\/\/api\.example\.com\/.*/,
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'api-cache',
                      expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                      }
                    }
                  }
                ]
              }
            })
          ],
          // ... other Vite config
        });
        ```
- [ ] **Service Worker Configuration:**
    - The `vite-plugin-pwa` will auto-generate a service worker. Review its configuration (via `workbox` options in `vite.config.ts`) to ensure it caches:
        - Static assets: HTML, JS, CSS.
        - Game assets: Images (if any), sound files (`.mp3`), fonts.
        - Questions data (if fetched, or ensure it's part of the build).
- [ ] **Manifest File (`games/blamegame/public/`):**
    - The `vite-plugin-pwa` can generate the `manifest.json` based on the config in `vite.config.ts`.
    - Ensure you have necessary icons (e.g., `pwa-192x192.png`, `pwa-512x512.png`) in the `games/blamegame/public/` directory and they are referenced in the manifest configuration.
    - *Hint: Create simple placeholder icons initially if final ones aren't ready.*
- [ ] **Test PWA Functionality:**
    - Build the Blame Game: `npm run build` (in `games/blamegame/`).
    - Serve the built files (e.g., using `npm install -g serve` then `serve dist`).
    - Test installability, offline loading, and caching in a browser.

## 7. Testing & Persistence
- [ ] **Manual Testing - Responsiveness:**
    - Test all screens (intro, player setup, game, summary, debug panel) on various device sizes (mobile, tablet, desktop) using browser developer tools.
    - Check for layout breaks, text overflow, button usability.
- [ ] **Manual Testing - Theme Switching:**
    - Temporarily modify `useTheme.ts` to cycle through themes or allow manual selection for testing, or change system time.
    - Verify all theme gradients and animations apply correctly.
- [ ] **Manual Testing - LocalStorage Persistence:**
    - Play a game, close the tab/browser, reopen. Check if:
        - Played questions are remembered.
        - Game settings (from Debug Panel) persist.
        - Sound enabled/disabled state persists.
        - (Once implemented) Player names and NameBlame logs persist.
    - Use the "Reset App Data" button and verify all relevant data is cleared.

## 8. Polish & Refinements
- [x] Refactor `App.tsx` to use a `GameSettings` state object (Done, integrated with `useLocalStorage` and `DebugPanel`).
- [x] Add a debug UI panel to control `GameSettings` (Done, `DebugPanel.tsx` created and integrated).
- [ ] **Text Handling on Question Cards (Roulette Animation):**
    - If using roulette animation for questions, ensure long question text doesn't overflow or become unreadable.
    - *Hints: Consider dynamic font sizing, text truncation with ellipsis, or a scrollable area within the card if text is very long. Prioritize readability.*
- [ ] **Visual Enhancements:**
    - Review overall UI for "popping" colors and engaging animations beyond themes.
    - Consider micro-interactions for buttons or card transitions.
- [ ] **Accessibility (A11y) Review:**
    - After major features are stable, review for basic accessibility:
        - Sufficient color contrast.
        - Keyboard navigability for all interactive elements.
        - ARIA attributes where necessary (e.g., for custom controls if any).
        - Semantic HTML.
        - *Hint: Use browser accessibility tools (like Lighthouse, Axe DevTools) for initial checks.*

## 9. Documentation
- [x] Add README for Blame Game.
- [ ] **Update READMEs:**
    - `README.md` (root): Briefly mention the Blame Game and its status.
    - `games/blamegame/README.md`: Update with details on all implemented features, how to play (especially NameBlame mode), and any setup/dev notes.
    - `game-picker/README.md` (if exists, or general notes): Ensure it reflects how to access/run the Blame Game.
    - *Hint: Include screenshots or GIFs if helpful.*

## 10. Replace CSV loading with JSON for Offline Support

**Goal:** Eliminate the need to fetch `blamegame_questions.csv` at runtime to enable fully offline experience, which is essential for GitHub Pages and Progressive Web App (PWA) compatibility.

### Tasks:
- [ ] Write a Node.js script (`scripts/convertCsvToJson.js`) that:
  - Reads the `blamegame_questions.csv` from `public/` or `src/data/`.
  - Converts it to a valid JSON array of objects `{ category: string, text: string }`.
  - Saves it to `src/data/questions.json`.

- [ ] Replace runtime CSV fetch in `App.tsx`:
  - Instead of `fetch('blamegame_questions.csv')`, use:
    ```ts
    import questions from './data/questions.json';
    ```

- [ ] Update README with instructions:
  - Describe how to run the conversion script.
  - Document that all question changes must be made in the CSV and then re-converted.

- [ ] Optional: Add a build step (`npm run convert:csv`) and/or hook into Git pre-commit or post-merge using Husky or simple bash hook.

**Why this matters:** JSON import allows Vite to bundle all data during build time, enabling clean offline use via GitHub Pages and PWA.

---

## 11. Fallback & Error Recovery for Missing or Broken Data

- [ ] Ensure that if the question list is empty (either JSON is missing or parsed incorrectly), the app:
  - Shows a dedicated error screen (e.g. "No valid questions found").
  - Suggests clicking a "Reset App Data" button to clear `localStorage`.

- [ ] Check at game startup if `questions.length >= 1`:
  - If not, prevent entering the roulette or game step.

- [ ] In Debug Panel:
  - Display a counter for how many valid questions are currently available.
  - Ideally show breakdown per category.

---

## 12. End of Game: Clean Exit Flow

- [ ] Instead of instantly jumping back to the intro screen after the final question:
  - Show a new screen titled "Game Complete" with options:
    - [ ] Start a new round with same categories
    - [ ] Return to main menu
    - [ ] Switch mode (e.g., enable NameBlame if not active)

- [ ] Add small confetti or fun animation to celebrate game completion.

---

## 13. Player Setup Flow: Validation and Reset Logic

- [ ] Add `onBlur` and `onSubmit` validation for the player name input:
  - Disallow empty strings or whitespace-only names.
  - Prevent duplicate player names.

- [ ] Reset `tempPlayerName` when:
  - Navigating back to main menu.
  - Successfully adding a player.

- [ ] Clear full player setup state if the game is aborted or restarted.

---

## 14. Long-Term Storage Management

- [ ] Implement an optional cleanup logic:
  - If `blamegame-played-questions` exceeds 300–500 entries, truncate the oldest entries.

- [ ] Add a "View App Data" panel (for dev use only):
  - Shows number of players stored, recent blame logs, and played question IDs.

- [ ] "Reset App Data" button should:
  - Clear all stored values: questions, player list, settings, logs.

---

## 15. Modular Component Refactoring

**Goal:** Make the application more modular and respect separation of concerns. The current question card component holds UI, logic and controls in a tightly coupled way.

### Tasks:
- [ ] Extract `QuestionCard` into its own component (`components/QuestionCard.tsx`):
  - Should display only the question, emoji, and category.
  - Should follow a traditional card shape (e.g. portrait 3:4 or 2:3 aspect ratio).
  - Should be touch-optimized for mobile screens.

- [ ] Create `QuestionControls` component:
  - Holds buttons: Back, Next, Restart (and future actions like "Save Blame").
  - Accepts callbacks via props and displays the current progress bar.

- [ ] Create `GameContainer` layout component:
  - Holds `QuestionCard`, `QuestionControls`, and the title bar (`TheBlameGame`).
  - Applies flex layout + responsive spacing + handles mobile first layout with breakpoints.
  - Handles overall theming/background.

- [ ] Refactor `App.tsx` to only orchestrate state:
  - Render `GameContainer` and pass required state + callbacks.

**Why this matters:** It simplifies testing, improves mobile UX, and allows easier expansion (e.g., embedding NameBlame voting UI inside cards later).

---

## 16. UI Polish & Accessibility

- [ ] Improve focus states and tab order for keyboard users.
- [ ] Ensure buttons use semantic `<button>` and not `<div>` hacks.
- [ ] Ensure all animations degrade gracefully for prefers-reduced-motion users.
- [ ] Add aria-labels to interactive controls like "Back", "Next", "Player Select".

---

## 17. Sound System Finalization

- [ ] Replace placeholder `.mp3` files with distinct, royalty-free sounds:
  - Round start (fun jingle)
  - New question (card slide or chime)
  - Summary screen (confetti pop or cheer)

- [ ] Add error fallback for failed sound playback:
  - If `Audio` fails to play, disable sound toggle.

- [ ] Add volume toggle or slider (stored in localStorage).

---

## 18. PWA Finalization

- [ ] Add `vite-plugin-pwa` to `vite.config.ts`.
- [ ] Provide manifest details (name, icons, description).
- [ ] Add `pwa-192x192.png` and `pwa-512x512.png` in `public/`.
- [ ] Test offline installation, and force-offline mode in devtools.

---

## 19. README Documentation Expansion

- [ ] Update all READMEs:
  - root `README.md`: describe project structure and how to start all games
  - `games/blamegame/README.md`: gameplay, CSV to JSON setup, theming, debug panel
  - `game-picker/README.md`: explain how game list is built from `games.json`

- [ ] Add screenshots or GIFs showcasing:
  - Start screen
  - Category roulette
  - Question + player selection
  - Summary view

---

## 20. Optional: Multiplayer Sync in Local Network (Future Scope)

(Not for MVP, but consider design implications)

- [ ] If device A starts the game and passes to device B, implement QR code for device-to-device sync.
- [ ] Players join via local Wi-Fi link or QR, and select who is blaming whom.

---

## 21. ESLint Configuration Notes

- [x] **Resolved ESLint v9+ Configuration Issues:**
  - ESLint v9+ flat config requires proper import of @eslint/js. 
  - If you get 'js is not a function', check your import style and package versions. 
  - Use `import js from '@eslint/js'` and call `js()`. If that fails, try `import * as js from '@eslint/js'` and use `js.default()`. 
  - Always ensure your package.json has 'type': 'module' for ESM compatibility.
  - For TypeScript + React projects, separate configuration blocks for different file types provides the cleanest setup.
