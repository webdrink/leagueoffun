# Deployment Flow Summary

## What Happens When You Add New Questions

When you add new questions to any language and commit to the main branch:

### 🔄 **Orchestrated Dual-Workflow System**

**Main Orchestrator**: `.github/workflows/deploy.yml`  
**Translation Service**: `.github/workflows/translation-validation.yml`  
**Status**: Both workflows active with clear separation of concerns

### 📋 **Automated 7-Step Process**

#### 1. **Translation Check** 🔍
- `deploy.yml` checks if any translations are missing
- Uses `pnpm run translate:check` (dry-run mode)

#### 2. **Translation Trigger** ⚡
- **If missing translations**: Triggers `translation-validation.yml` via workflow_dispatch
- **If complete**: Skips directly to build & deploy

#### 3. **Auto-Translation** 🌍 
- `translation-validation.yml` runs OpenAI translation
- Uses `OPENAI_API_KEY` secret for missing content
- Commits new translations with `🌍 Auto-translate: Update translations [skip ci]`

#### 4. **Wait & Refresh** ⏳
- `deploy.yml` waits for translation workflow completion
- Refreshes repository state to get new translations

#### 5. **Build Preparation** 🛠️
- Installs dependencies with pnpm
- Runs linting and type-checking

#### 6. **Translation Validation** ✅
- Final validation of all translations
- Ensures complete coverage across all languages

#### 7. **Build & Deploy** 🚀
- **Build**: `pnpm run build:domain` with custom domain configuration
- **Deploy**: GitHub Pages deployment to `blamegame.leagueoffun.de`

### 🎯 **Result**

Your game is automatically deployed with **complete translations** in all 4 languages:
- 🇩🇪 German (base language)
- 🇬🇧 English  
- 🇪🇸 Spanish
- 🇫🇷 French

### ⚙️ **Configuration Required**

1. **GitHub Secret**: `OPENAI_API_KEY` in repository settings
2. **Permissions**: Read/write access for GitHub Actions
3. **GitHub Pages**: Source set to "GitHub Actions"
4. **Custom Domain**: `blamegame.leagueoffun.de` configured

### 🔧 **Manual Control**

```bash
# Skip auto-translation
git commit -m "Add questions [skip translate]"

# Normal (triggers translation)
git commit -m "Add questions"
```

This ensures your Blame Game is always multilingual and up-to-date! 🎉
