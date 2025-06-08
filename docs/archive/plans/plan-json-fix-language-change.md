# Plan: Fix JSON Parsing and Language Change Issues

## Problem Statement

The BlameGame application has two main issues:
1. JSON parsing errors due to comments in JSON files
2. Language changes not immediately reflecting in the UI

## Solution Implemented

### 1. Fix JSON Parsing Errors

- **Root Cause**: JSON files (categories.json and question files) contained JavaScript-style comments (// filepath...) which are not valid in standard JSON format.

- **Solution**:
  - Created a utility script (`fix-json-files.js`) to remove comment lines from all JSON files
  - Processed all JSON files in the `public/questions/` directory to remove invalid comments
  - Made JSON files compliant with the standard JSON format

### 2. Improve Language Change Handling

- **Root Cause**: The language was being changed in the settings, but the UI wasn't being updated immediately.

- **Solution**:
  - Added the `LanguageChangeFeedback` component to App.tsx to provide visual feedback when language changes
  - Enhanced the language change effect to ensure proper handling of language changes
  - Ensured that game data is reloaded when language changes
  - Added proper sequencing of language change operations

## Implementation Details

1. **JSON Fix Script**:
   - Created a Node.js script that processes all JSON files in the questions directory
   - Removes comment lines that start with "//"
   - Processed all category and question files

2. **Language Change Enhancements**:
   - Added visual feedback through the LanguageChangeFeedback component
   - Modified language change handling to ensure proper sequence of operations
   - Ensured game data is reloaded with the new language

## Testing Instructions

1. **JSON Parsing Fix**:
   - Launch the application
   - Verify that the application loads without JSON parsing errors
   - Check that categories and questions load properly

2. **Language Change Feature**:
   - Change the language using the language selector
   - Verify that a visual feedback notification appears
   - Confirm that the UI text changes to the selected language immediately
   - Check that questions are loaded in the newly selected language

## Future Improvements

- Consider adding a permanent helper script that validates JSON files during build
- Enhance the language change mechanism to ensure smoother transitions
- Add more comprehensive error handling for language-specific content loading
