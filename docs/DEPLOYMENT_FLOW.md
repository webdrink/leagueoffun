# Deployment Flow Summary

## What Happens When You Add New Questions

When you add new questions to any language and commit to the main branch:

### 🔄 **Single Unified Workflow**

**File**: `.github/workflows/translation-validation.yml`  
**Status**: `deploy.yml` is disabled to prevent conflicts

### 📋 **3-Step Process**

#### 1. **Translation Validation** ✅
- Validates existing translations
- Checks for missing content
- Runs OpenAI dry-run preview

#### 2. **Auto-Translation** 🌍 
- **Triggers**: Push to main (unless `[skip translate]` in commit)
- **Uses**: `OPENAI_API_KEY` secret
- **Action**: Translates missing questions to all languages
- **Commits**: New translations with `🌍 Auto-translate: Update translations [skip ci]`

#### 3. **Build & Deploy** 🚀
- **Tools**: pnpm (better than npm)
- **Process**: Lint → TypeCheck → Build → Deploy
- **Output**: GitHub Pages with custom domain
- **CNAME**: `blamegame.leagueoffun.de`

### 🎯 **Result**

Your game is automatically deployed with **complete translations** in all 4 languages:
- 🇩🇪 German (base language)
- 🇬🇧 English  
- 🇪🇸 Spanish
- 🇫🇷 French

### ⚙️ **Configuration Required**

1. **GitHub Secret**: `OPENAI_API_KEY` in repository settings
2. **Permissions**: Read/write access for GitHub Actions
3. **Workflow**: `translation-validation.yml` (active)
4. **Workflow**: `deploy.yml` (disabled to prevent conflicts)

### 🔧 **Manual Control**

```bash
# Skip auto-translation
git commit -m "Add questions [skip translate]"

# Normal (triggers translation)
git commit -m "Add questions"
```

This ensures your Blame Game is always multilingual and up-to-date! 🎉
