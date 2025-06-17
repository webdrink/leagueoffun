# GitHub Actions Setup for Automatic Translation

## Required Setup Steps

### 1. Add OpenAI API Key Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set:
   - **Name**: `OPENAI_API_KEY`
   - **Secret**: Your actual OpenAI API key (starts with `sk-...`)
5. Click **Add secret**

### 2. Enable GitHub Actions

Ensure GitHub Actions are enabled in your repository:
1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions", select "Allow all actions and reusable workflows"
3. Under "Workflow permissions", select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"

### 3. Verify Workflow File

The workflow file should be at:
```
.github/workflows/translation-validation.yml
```

## How It Works

### Automatic Translation Flow

```mermaid
flowchart TD
    A[Developer pushes to main] --> B{Contains '[skip translate]'?}
    B -->|Yes| C[Skip translation, build normally]
    B -->|No| D[Validate existing translations]
    D --> E[Run automatic translation]
    E --> F{New translations created?}
    F -->|Yes| G[Commit translations back to repo]
    F -->|No| H[No changes needed]
    G --> I[Build with complete translations]
    H --> I
    I --> J[Deploy to GitHub Pages]
    C --> I
```

### Trigger Conditions

The workflow triggers on:
- **Push to main branch**: Runs full translation and deployment
- **Push to develop branch**: Validation only
- **Pull requests to main**: Validation and build test only

### Translation Process

1. **Validation**: Checks current translation status
2. **Translation**: Uses OpenAI API to translate missing content
3. **Auto-commit**: Commits new translations with `[skip ci]` to avoid loops
4. **Build**: Creates production build with all translations
5. **Deploy**: Deploys to GitHub Pages with custom domain

## Commit Message Controls

### Skip Translation
To skip automatic translation on a specific commit:
```bash
git commit -m "Add new German questions [skip translate]"
```

### Skip CI Entirely
To skip all CI/CD actions:
```bash
git commit -m "Update documentation [skip ci]"
```

## Monitoring and Troubleshooting

### Check Workflow Status
1. Go to your repository on GitHub
2. Click the **Actions** tab
3. View recent workflow runs and their status

### Common Issues

#### Missing API Key
```
Error: OPENAI_API_KEY environment variable is required
```
**Solution**: Add the `OPENAI_API_KEY` secret in repository settings

#### Permission Denied
```
Error: Permission denied (publickey)
```
**Solution**: Ensure "Read and write permissions" are enabled in Actions settings

#### API Rate Limits
```
Rate limit reached. Waiting X seconds...
```
**Solution**: Normal behavior, the workflow will wait automatically

#### Translation Failures
```
❌ Translation failed for "question text": API error
```
**Solution**: Check your OpenAI API key and account status

### Viewing Translation Changes

When translations are automatically created:
1. Check the latest commit by "GitHub Action"
2. Review the changes in `public/questions/` directories
3. Files will show added/modified translations for missing content

## Cost Management

### OpenAI API Usage
- The system uses **gpt-3.5-turbo** (cost-effective model)
- Batch processing minimizes API calls
- Rate limiting prevents excessive usage
- Only translates missing content (not re-translating existing)

### Monitoring Costs
1. Check your OpenAI usage dashboard
2. Set up billing alerts in OpenAI account
3. Monitor GitHub Actions usage (free tier: 2000 minutes/month)

## Manual Override

If you need to bypass automatic translation:

### Temporarily Disable
1. Edit `.github/workflows/translation-validation.yml`
2. Add `if: false` to the `auto-translate-and-deploy` job
3. Commit and push

### Run Translation Locally
```bash
export OPENAI_API_KEY="your-key-here"
npm run translate
git add public/questions/
git commit -m "Manual translation update"
git push
```

## Best Practices

1. **Review translations**: Check auto-translated content for quality
2. **Monitor costs**: Keep track of OpenAI API usage
3. **Test builds**: Verify application works after translation updates
4. **Backup strategy**: GitHub maintains version history of all translations
5. **Quality control**: Manually review important or sensitive content

This setup ensures your Blame Game always has complete translations across all supported languages without manual intervention!
