# Debug Features in Blame Game

This document outlines the debugging features available in Blame Game, how to access them, and how they can be used for testing and development.

## Accessing Debug Mode

Debug mode can be activated in two ways:

1. **URL Parameter**: Add `?debug=true` to the end of your URL.
   Example: `https://your-hostname.com/blamegame/?debug=true`

2. **Debug Button**: Click the "D" button in the bottom-right corner of the screen.

## Debug Panel Features

The debug panel provides several tools and information displays to help with development and testing:

### Game Settings Section

- **View and modify all game settings in real-time**
- Adjust loading animation speeds, durations, and transitions
- Change category count and game mode
- Test with different language settings

### Data Loading Stats

- **Loading Status**: Shows whether data is currently being loaded
- **Preparing Round Status**: Shows whether a round is being prepared
- **Categories Count**: Number of categories available
- **Questions Count**: Total number of questions loaded

### Question Statistics

- **Total Questions**: Shows the total number of questions loaded
- **Available Questions**: Questions available for the current round
- **Categories**: List of categories with question counts for each
- **Played Questions**: Tracks how many questions have been played (when implemented)

### Utility Buttons

- **Reset App Data**: Clears all localStorage data and reloads the application
- **Close Debug Panel**: Hides the debug panel (can be reopened using the debug button)

## URL Parameters

The following URL parameters can be used for testing and debugging:

- `?debug=true` - Enables debug mode
- `?language=en` - Forces a specific language (example: English)
- `?categories=3` - Sets the number of categories to use

Multiple parameters can be combined with `&`:
`?debug=true&language=en&categories=3`

## Asset Path Testing

Use the debug panel to verify asset paths are working correctly:

1. Check the loading sequence with different category counts
2. Verify that assets load correctly in GitHub Pages environment

## Data Loading Sequence

The app follows this sequence for loading data:

1. App initializes and starts loading categories
2. Once categories are loaded, questions for each category are fetched
3. When "Start Game" is clicked:
   - The loading animation begins immediately
   - Round preparation starts in parallel
   - When both loading animation and round preparation are complete, the game starts
4. If any error occurs, it's displayed to the user and also logged to the console

## Implementing New Debug Features

When adding new debug features:

1. Update the `DebugPanel.tsx` component with your new controls or displays
2. Add any URL parameter handling to `debugUtils.ts`
3. Update this documentation with details about your new features

## Best Practices for Debug Logs

- Use `console.log()` with descriptive prefixes like: `[QUESTIONS]`, `[LOADING]`, etc.
- For sensitive operations that might fail, use `console.warn()` and `console.error()`
- When debugging loading issues, check the Network tab in browser devtools 

## Known Debug Limitations

- Debug mode is not available in production builds by default
- Some settings may not take effect until the next game round
- Performance might be affected when debug panel is open with all statistics enabled
