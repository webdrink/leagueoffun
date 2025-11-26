# Testing Guide for Blame Game

## PWA Installation Testing

1. Build the application:
   ```
   npm run build
   ```

2. Preview the built application:
   ```
   npm run preview
   ```

3. Open the preview URL in Chrome (e.g., http://localhost:4173)

4. Test PWA installability:
   - Look for the "Install" icon in the address bar or three-dot menu
   - Click "Install" and confirm the installation
   - Verify the app opens in a standalone window
   - Check that the app icon appears on your desktop/home screen

## Offline Functionality Testing

1. After installing as a PWA:
   - Open the app
   - Navigate through a few screens to cache assets
   - Disconnect from the internet (turn off Wi-Fi or toggle airplane mode)
   - Refresh the app or close and reopen it
   - Verify the app loads and functions correctly without internet

2. Test offline data access:
   - Check if questions load when offline
   - Verify that sound effects play when offline
   - Ensure the game can be played through a complete round without internet

## LocalStorage Persistence Testing

1. Set up game preferences:
   - Toggle sound on/off
   - Adjust volume level
   - Add player names in NameBlame mode
   - Play through some questions to add them to played history

2. Close the browser/app completely

3. Reopen the app and verify:
   - Sound settings are preserved
   - Player names are remembered
   - Previously played questions are not repeated

## Multi-Device Testing

1. Test on different screen sizes:
   - Desktop browser (resized to various dimensions)
   - Tablet (or simulated tablet using DevTools)
   - Mobile phone (or simulated mobile device using DevTools)

2. Check for layout issues:
   - Text overflow in question cards
   - Button spacing and sizing
   - Modal dialogs (rules, info panel)
   - Confetti animation

## Sound Testing

1. Verify sound effects play correctly:
   - When starting a round (`round_start.mp3`)
   - When advancing to a new question (`new_question.mp3`)
   - When reaching the summary screen (`summary_fun.mp3`)

2. Test volume control:
   - Adjust volume slider
   - Mute/unmute functionality
   - Volume setting persistence between sessions

## Comprehensive Feature Testing

1. Test all game flows:
   - Classic mode complete round
   - NameBlame mode with multiple players
   - Debug panel functionality
   - Info modal display and dismissal

2. Verify all added features:
   - Confetti animation on game completion
   - Question stats in debug panel
   - Volume control for sound effects
   - Info/rules modal accessibility
   - PWA installation and offline play

## Error Handling

1. Test fallback mechanisms:
   - If questions can't be loaded from JSON or CSV
   - If sound files are missing
   - If localStorage is not available

## Performance Testing

1. Check animation smoothness:
   - Theme animations
   - Confetti effect
   - Card transitions

2. Verify loading times:
   - Initial app load
   - Question retrieval
   - Category selection
