# Question Migration Guide

This document provides instructions for migrating questions from the old category-based structure to the new language-specific structure.

## Overview

In the old structure, categories and questions were stored in separate directory structures. In the new structure, all category metadata is stored in a single `categories.json` file, and questions are organized by language and category in `public/questions/{lang}/{category}.json`.

## Migration Process

### Automated Migration

We've created a script to automate the migration process. Here's how to use it:

1. Ensure Node.js is installed on your system.

2. Run the migration script:
   ```bash
   node scripts/migrate-questions.js
   ```

3. The script will:
   - Extract category metadata and create the consolidated `categories.json` file
   - Generate appropriate questionIds based on the text
   - Create new language-specific question files in `public/questions/{lang}/{category}.json`

4. After running the script, verify that:
   - The `categories.json` file has been created with all category metadata
   - New question files are created in `public/questions/de/`, `public/questions/en/`, etc.
   - Each question has a proper questionId, text, and category
   - No questions are lost in the migration

### Manual Adjustments

After the automated migration, you may need to make some manual adjustments:

1. **Review QuestionIds**: The script generates questionIds based on the text, but these may not be ideal. Review and adjust as needed.

2. **Cross-Language Alignment**: Ensure that questions in different languages have matching questionIds.

3. **Remove Old Category Structure**: Once satisfied with the migration, you can remove the old question data from category files.

### Updating Application Code

The application code also needs to be updated to work with the new structure:

1. Update the question loading logic to:
   - Load the consolidated `categories.json` file for category metadata
   - Look for questions in the new location (`public/questions/{lang}/{category}.json`)
   - Handle the new question format (with questionId)
   - Implement client-side question counting

2. Test the application thoroughly to ensure:
   - Categories load correctly with their translations
   - Questions load correctly in all languages
   - Language switching works properly

## Fallback Mechanism

In the new structure, if a question doesn't exist in the current language, the application should fall back to English. Ensure this mechanism is implemented in the question loading logic.