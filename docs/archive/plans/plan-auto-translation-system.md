# Plan: Automatic Translation System

## Goal & Expected Behavior
Create an automated translation system that:
1. Analyzes all categories and question files across supported languages (de, en, es, fr)
2. Detects missing translations or inconsistent content
3. Uses OpenAI API to automatically translate missing content
4. Maintains consistent category structure across all languages
5. Integrates with the build/deployment process

## Technical Steps to Implement

### 1. Create Translation Service
- Build OpenAI API integration with small model (gpt-3.5-turbo)
- Create translation prompts optimized for game questions
- Handle rate limiting and error cases
- Support batch translation for efficiency

### 2. Category Analysis System
- Scan categories.json for available categories
- Compare category files across all language directories
- Detect missing categories or question files
- Identify questions with missing translations

### 3. Content Synchronization
- Sync category definitions in categories.json
- Ensure all languages have corresponding question files
- Translate missing questions maintaining questionId consistency
- Preserve game-specific context and tone

### 4. Build Integration
- Add translation check to build process
- Create pre-deployment validation
- Generate translation reports
- Auto-commit translated content if requested

### 5. Quality Assurance
- Validate JSON structure after translation
- Check for questionId consistency
- Ensure category field matches file structure
- Create backup before making changes

## Potential Edge Cases
- OpenAI API failures or rate limits
- Invalid JSON after translation
- Inconsistent questionId between languages
- Network connectivity issues
- File permission problems

## Impact on Existing Files
- New script: `scripts/auto-translate.js`
- Enhanced: `package.json` (new scripts)
- Enhanced: `scripts/verify-assets.js` (translation verification)
- Potentially modified: All question JSON files
- Potentially modified: `categories.json`

## Implementation Checklist
- [x] Create OpenAI translation service
- [x] Build category analysis system
- [x] Implement content synchronization
- [x] Add build integration scripts
- [x] Create validation and backup systems
- [x] Add configuration for API key
- [x] Test with sample translations
- [x] Document usage and configuration
- [x] Integration with deployment workflow
- [x] Error handling and logging

## Success Criteria
- [x] All supported languages have complete question sets
- [x] No missing categories across languages
- [x] Consistent questionIds across all language files
- [x] Automated translation works without manual intervention
- [x] Build process validates translation completeness
- [x] Quality translations that maintain game context

## ✅ PLAN COMPLETED

The automatic translation system has been successfully implemented with the following components:

### Core System
- **`scripts/auto-translate.js`**: Main translation engine with OpenAI integration
- **`scripts/validate-translations.js`**: Standalone validation for CI/CD
- **Enhanced `scripts/verify-assets.js`**: Now includes translation verification

### Build Integration
- **Enhanced `package.json`**: New npm scripts for translation workflows
- **`build:production`**: Includes automatic translation validation
- **GitHub Actions**: Automated translation validation on every push

### Documentation
- **`docs/TRANSLATION_SYSTEM.md`**: Comprehensive system documentation
- **`docs/TRANSLATION_USAGE_GUIDE.md`**: Quick start and usage examples
- **Updated `docs/todo.md`**: Marked translation tasks as completed

### Features Implemented
✅ **Multi-language support**: German, English, Spanish, French  
✅ **Smart detection**: Finds missing categories and questions  
✅ **OpenAI integration**: Uses gpt-3.5-turbo for quality translations  
✅ **Batch processing**: Efficient API usage with rate limiting  
✅ **Backup system**: Automatic backups before any changes  
✅ **Quality assurance**: JSON validation and consistency checks  
✅ **CI/CD integration**: GitHub Actions for automated validation  
✅ **Comprehensive logging**: Detailed progress and error reporting  
✅ **Dry-run mode**: Preview changes before applying  
✅ **Build integration**: Translation validation in production builds
