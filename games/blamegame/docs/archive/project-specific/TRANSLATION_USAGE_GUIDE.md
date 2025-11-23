# Automatic Translation System - Usage Guide

## Deployment Flow: Adding New Questions

When you add new questions and commit to the main branch, here's exactly what happens:

### Current Workflow (Updated)

**Only `translation-validation.yml` is active** - the old `deploy.yml` has been disabled to prevent conflicts.

#### Step-by-Step Process:

1. **You commit new questions** to main branch
2. **Translation Validation** (always runs):
   - Validates current translation completeness  
   - Checks for missing content across languages
   - Runs dry-run translation preview

3. **Auto-Translation** (if no `[skip translate]` in commit message):
   - Uses `OPENAI_API_KEY` secret to translate missing questions
   - Creates translations for all supported languages (de, en, es, fr)
   - Commits new translations back with `🌍 Auto-translate: Update translations [skip ci]`

4. **Build & Deploy** (final step):
   - Uses pnpm for better dependency management
   - Runs linting and type-checking
   - Builds with complete translations using `pnpm run build:domain`
   - Deploys to GitHub Pages with custom domain `blamegame.leagueoffun.de`

### Skip Translation Control

```bash
# Skip automatic translation (manual control)
git commit -m "Add German questions only [skip translate]"

# Normal commit (triggers auto-translation)
git commit -m "Add new party questions"
```

## Quick Start

### 1. Set up OpenAI API Key
```bash
# Linux/Mac
export OPENAI_API_KEY="your-api-key-here"

# Windows
set OPENAI_API_KEY=your-api-key-here
```

### 2. Check Current Translation Status
```bash
npm run translate:check
```

This shows what needs translation without making any changes.

### 3. Run Automatic Translation
```bash
npm run translate
```

This will translate missing content and update your files.

## Example Output

### Translation Check (Dry Run)
```
🚀 Starting automatic translation process...
📁 Backup created: translation-backups/backup-2025-06-17T10-30-00-000Z
📋 Loaded 25 categories
🔍 Analyzing category files across languages...
✅ Loaded de/alex.json (89 questions)
⚠️ Missing file: en/alex.json
✅ Loaded de/party.json (45 questions)
✅ Loaded en/party.json (42 questions)

🏷️ Checking category name translations...
✅ Category "alex": "Alex" -> "Alex" (en)
✅ Category "alex": "Alex" -> "Aléx" (fr)

🌍 Processing English...
  📂 Category: alex (89 missing)
    ✅ Translated: "Wer schreibt seine Thesis nicht, weil die SoloQ wichtiger ist?" -> "Who doesn't write their thesis because SoloQ is more important?" (en)
    ✅ Added 89 translations to en/alex.json

📊 Found 134 missing translations
✅ Translation process completed successfully!
```

### Validation Results
```bash
npm run translate:validate

🔍 Validating translation completeness...

ℹ️ Found 25 categories in categories.json
ℹ️ Loaded 89 questions from de/alex.json
ℹ️ Loaded 89 questions from en/alex.json
ℹ️ Loaded 89 questions from es/alex.json
ℹ️ Loaded 89 questions from fr/alex.json

📊 Validation Summary:
  - Info: 100
  - Warnings: 0
  - Errors: 0

✅ All translations validated successfully!
```

## File Structure After Translation

```
public/questions/
├── categories.json                 # Updated with all language translations
├── de/                            # German (base language)
│   ├── alex.json                  # 89 questions
│   ├── party.json                 # 45 questions
│   └── ...
├── en/                            # English (auto-translated)
│   ├── alex.json                  # 89 questions (translated)
│   ├── party.json                 # 45 questions (translated)
│   └── ...
├── es/                            # Spanish (auto-translated)
│   └── ...
└── fr/                            # French (auto-translated)
    └── ...
```

## Integration with Build Process

### Enhanced Build Scripts
```bash
# Production build with translation validation
npm run build:production

# This runs:
# 1. npm run translate:check    (validates translations)
# 2. npm run build             (builds the app)
# 3. npm run verify-build      (verifies all assets)
```

### Continuous Integration
The system includes GitHub Actions that:
- Validate translations on every push
- Check for missing content
- Ensure build succeeds with current translations
- Run comprehensive asset verification

## Handling New Content

### Adding a New Category
1. Add category to `categories.json` with at least German name
2. Create German question file: `de/new_category.json`
3. Run translation: `npm run translate`
4. All other languages will be created automatically

### Adding New Questions
1. Add questions to any language file
2. Run translation: `npm run translate`
3. Missing translations will be generated for other languages

## Error Handling Examples

### API Rate Limiting
```
Rate limit reached. Waiting 15 seconds...
✅ Translated: "Your question" -> "Votre question" (fr)
```

### Missing API Key
```
❌ OPENAI_API_KEY environment variable is required
Set it with: export OPENAI_API_KEY="your-api-key-here"
```

### JSON Syntax Error
```
❌ Failed to parse de/alex.json: Unexpected token at line 5
```

## Quality Features

### Context-Aware Translation
- Game-specific prompts ensure appropriate tone
- Cultural adaptation for target languages
- Preserves humor and casual party game style

### Consistency Validation
- Maintains questionId across all languages
- Validates JSON structure after translation
- Checks category field consistency
- Ensures emoji and category name sync

### Backup and Recovery
- Automatic backups before any changes
- Timestamped backup directories
- Easy restore from any backup point

## Best Practices

1. **Always test translations**: Review generated content manually
2. **Use dry-run first**: `npm run translate:check` before `npm run translate`
3. **Commit translations**: Include auto-translated content in git
4. **Monitor costs**: Track OpenAI API usage
5. **Validate builds**: Use `npm run build:production` for releases

## Troubleshooting

### Common Issues
- **Empty translations**: Usually means API key issues
- **Inconsistent counts**: Run `npm run translate:validate` for details
- **Build failures**: Check `npm run verify-assets` output
- **Missing files**: System creates them automatically

### Recovery
```bash
# Restore from backup
cp -r translation-backups/backup-TIMESTAMP/* public/questions/

# Validate current state
npm run translate:validate

# Check what needs translation
npm run translate:check
```

This automatic translation system ensures your Blame Game stays multilingual and up-to-date across all supported languages!
