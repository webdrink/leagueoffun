# Deployment Architecture

## Overview

League of Fun uses a **monorepo-to-multisite** deployment model where all apps are built from a single monorepo but deployed to separate GitHub Pages sites for subdomain hosting.

## Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Source: webdrink/leagueoffun (Monorepo)                    │
│  ├── apps/gamepicker/                                       │
│  ├── apps/blamegame/                                        │
│  ├── apps/hookhunt/                                         │
│  └── packages/*                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ GitHub Actions
                            │ (.github/workflows/deploy-all.yml)
                            ▼
        ┌───────────────────┴───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Game Picker  │    │  BlameGame   │    │  HookHunt    │
│              │    │              │    │              │
│ Target:      │    │ Target:      │    │ Target:      │
│ webdrink/    │    │ webdrink/    │    │ webdrink/    │
│ leagueoffun  │    │ blamegame    │    │ HookHunt     │
│              │    │              │    │              │
│ Pages: gh-   │    │ Pages: main  │    │ Pages: main  │
│ pages branch │    │ branch /root │    │ branch /root │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Custom Domain│    │ Custom Domain│    │ Custom Domain│
│ www.         │    │ blamegame.   │    │ hookhunt.    │
│ leagueoffun  │    │ leagueoffun  │    │ leagueoffun  │
│ .com         │    │ .de          │    │ .com         │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Deployment Targets

| App | Source | Target Repository | Custom Domain | Deployment Method |
|-----|--------|-------------------|---------------|-------------------|
| **Game Picker** (Hub) | `apps/gamepicker` | `webdrink/leagueoffun` | `www.leagueoffun.com` | GitHub Pages Action (`actions/deploy-pages@v4`) |
| **BlameGame** | `apps/blamegame` | `webdrink/blamegame` | `blamegame.leagueoffun.de` | Git push via PAT |
| **HookHunt** | `apps/hookhunt` | `webdrink/HookHunt` | `hookhunt.leagueoffun.com` | Git push via PAT |

### Domain Strategy

- **Hub**: Uses `.com` TLD (`www.leagueoffun.com`)
- **BlameGame**: Uses `.de` TLD (`blamegame.leagueoffun.de`) 
- **HookHunt**: Uses `.com` TLD (`hookhunt.leagueoffun.com`)

**Note**: The mixed TLD strategy (.de vs .com) is intentional and must be maintained for DNS/custom domain configuration.

## Deployment Workflows

### Primary Workflow: `deploy-all.yml`

The **unified deployment workflow** that handles all three apps:

**Triggers:**
- Push to `main` branch when files change in:
  - `apps/**`
  - `packages/**`
  - `.github/workflows/deploy-all.yml`
- Manual trigger via `workflow_dispatch`

**Process:**
1. **Build Phase**: All three apps are built in parallel
2. **Validation**: Each build is verified (index.html, assets/, JS/CSS files)
3. **Upload Artifacts**: Build outputs saved as workflow artifacts
4. **Deploy Phase**: Three parallel deployment jobs
5. **Smoke Tests**: Each deployment is verified with HTTP checks
6. **Summary**: Aggregated deployment status report

### Individual Workflows (Legacy)

Individual per-app workflows exist but the unified workflow is **preferred**:
- `.github/workflows/deploy-gamepicker.yml`
- `.github/workflows/deploy-blamegame.yml`
- `.github/workflows/deploy-hookhunt.yml`

**When to use individual workflows:**
- Deploying a single app without rebuilding others
- Debugging deployment issues for a specific app
- Emergency hotfix to one app

## Required Secrets

| Secret Name | Description | Required Permissions | Used By |
|-------------|-------------|---------------------|---------|
| `DEPLOY_PAT` | GitHub Personal Access Token | `repo` write access to `webdrink/blamegame` and `webdrink/HookHunt` | BlameGame & HookHunt deployments |

### Setting up DEPLOY_PAT

1. Generate a Personal Access Token (Classic) in GitHub
2. Grant `repo` (Full control of private repositories) permission
3. Add as repository secret named `DEPLOY_PAT` in `webdrink/leagueoffun`

**Security Note**: The PAT must have write access to both deployment repositories.

## GitHub Pages Configuration

### Game Picker (webdrink/leagueoffun)

- **Source**: Deploy from `gh-pages` branch (created by `actions/deploy-pages@v4`)
- **Custom Domain**: `www.leagueoffun.com` (configured in repo settings)
- **CNAME**: Created automatically during deployment
- **`.nojekyll`**: Added to disable Jekyll processing

### BlameGame (webdrink/blamegame)

- **Source**: Deploy from `main` branch, `/` (root)
- **Custom Domain**: `blamegame.leagueoffun.de` (configured in repo settings)
- **CNAME**: Created automatically during deployment
- **`.nojekyll`**: Added to disable Jekyll processing

### HookHunt (webdrink/HookHunt)

- **Source**: Deploy from `main` branch, `/` (root)
- **Custom Domain**: `hookhunt.leagueoffun.com` (configured in repo settings)
- **CNAME**: Created automatically during deployment
- **`.nojekyll`**: Added to disable Jekyll processing

### Verifying GitHub Pages Settings

For each deployment repository, verify in **Settings → Pages**:
1. ✅ GitHub Pages is **enabled**
2. ✅ Source is set to correct branch and folder
3. ✅ Custom domain is configured
4. ✅ HTTPS is enforced
5. ✅ No Jekyll processing (`.nojekyll` file present)

## Build Configuration

### Base Path

All apps use `base: '/'` in their `vite.config.ts` because they are served from **subdomain root**, not a path:

- ✅ `https://hookhunt.leagueoffun.com/` (subdomain root)
- ❌ `https://leagueoffun.com/hookhunt/` (path-based, NOT used)

### Environment Variables

#### HookHunt Spotify Integration

HookHunt requires Spotify OAuth configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SPOTIFY_CLIENT_ID` | Spotify App Client ID | Build-time only, can be public |
| `VITE_SPOTIFY_REDIRECT_URI` | OAuth callback URL | `https://hookhunt.leagueoffun.com/callback` |

**Important**: The redirect URI must match the Spotify Developer Dashboard configuration exactly.

**Callback Path**: The app supports both subdomain hosting (`/callback`) and path-based hosting (`/games/hookhunt/callback`) for flexibility.

## Deployment Process

### Automatic Deployment

1. Push changes to `main` branch
2. GitHub Actions detects changes in `apps/` or `packages/`
3. Workflow builds all affected apps
4. Validated builds are deployed to target repositories
5. Smoke tests verify deployments are accessible
6. Summary report is generated

### Manual Deployment

1. Go to **Actions** tab in `webdrink/leagueoffun`
2. Select **"🚀 Deploy All Apps"** workflow
3. Click **"Run workflow"**
4. Select `main` branch
5. Click **"Run workflow"** button

### Emergency Rollback

If a deployment causes issues:

1. Navigate to the affected deployment repository (e.g., `webdrink/blamegame`)
2. Revert the last commit: `git revert HEAD`
3. Push the revert: `git push`
4. GitHub Pages will automatically redeploy the previous version

**Alternative**: Use individual workflow to redeploy a specific commit from the monorepo.

## Smoke Tests

Each deployment includes automated smoke tests:

1. **Wait Period**: 30 seconds for GitHub Pages CDN to update
2. **HTTP Check**: Verify site returns HTTP 200
3. **Content Check**: Verify HTML contains `<title>` tag
4. **Retry Logic**: 3 attempts with 10-second delays

**Failure Handling**: If smoke tests fail, the deployment job fails and the summary shows an error.

## Validation Checklist

After deployment, verify:

### Game Picker
- [ ] `https://www.leagueoffun.com` loads
- [ ] BlameGame link works
- [ ] HookHunt link works
- [ ] Player ID management works

### BlameGame
- [ ] `https://blamegame.leagueoffun.de` loads
- [ ] Game starts correctly
- [ ] Questions display
- [ ] Navigation works
- [ ] Return to hub link works

### HookHunt
- [ ] `https://hookhunt.leagueoffun.com` loads
- [ ] Spotify login works
- [ ] Playlist selection works
- [ ] Game rounds play
- [ ] Audio preview works
- [ ] Scoring works
- [ ] Return to hub link works

## Troubleshooting

### "Input required and not supplied: token"

**Problem**: Individual workflow failing because secret is missing.

**Solution**: 
1. Verify `DEPLOY_PAT` secret exists in repository settings
2. Ensure secret has `repo` permission
3. Check secret name is exactly `DEPLOY_PAT` (not `DEPLOY_TOKEN`)

### "404 Not Found" after deployment

**Problem**: GitHub Pages not serving the site.

**Causes**:
1. GitHub Pages not enabled in target repository
2. Source branch/folder misconfigured
3. Custom domain DNS not propagated

**Solution**:
1. Check **Settings → Pages** in target repository
2. Verify CNAME file exists in deployed files
3. Wait up to 24 hours for DNS propagation

### "502 Bad Gateway" or "TLS Handshake Error"

**Problem**: Custom domain SSL certificate not provisioned.

**Solution**:
1. Wait 24-48 hours for GitHub to provision SSL
2. Ensure custom domain DNS has correct CNAME record
3. Temporarily disable and re-enable custom domain in Pages settings

### Build succeeds but deployment fails

**Problem**: Permission issue or target repository missing.

**Solution**:
1. Verify target repository exists
2. Verify `DEPLOY_PAT` has write access to target repository
3. Check workflow logs for detailed error message

### Spotify OAuth not working in HookHunt

**Problem**: Redirect URI mismatch or client ID missing.

**Solution**:
1. Verify `VITE_SPOTIFY_CLIENT_ID` environment variable is set
2. Verify `VITE_SPOTIFY_REDIRECT_URI` matches Spotify Developer Dashboard
3. Ensure callback URL is `https://hookhunt.leagueoffun.com/callback`
4. Check Spotify Developer Dashboard for the app configuration

## Monitoring

### Deployment Status

Check deployment status:
1. **GitHub Actions**: View workflow runs in Actions tab
2. **Deployment Summary**: Check summary report at end of workflow
3. **Commit Status**: Green checkmark on commits indicates successful deployment

### Site Availability

Monitor site availability:
- Use external monitoring (e.g., UptimeRobot, StatusCake)
- Check GitHub Status page for Pages incidents
- Review smoke test results in workflow logs

## Best Practices

1. **Always use the unified workflow** (`deploy-all.yml`) for normal deployments
2. **Test locally** before pushing to `main`
3. **Review smoke test logs** after each deployment
4. **Monitor deployment time** - should complete in 5-10 minutes
5. **Keep README.md preserved** in deployment repositories
6. **Never force-push** to deployment repositories
7. **Document environment variables** for future reference
8. **Verify CNAME and .nojekyll** files are present after deployment

## Future Improvements

Potential enhancements to the deployment system:

- [ ] Add E2E tests to smoke tests (e.g., Playwright)
- [ ] Implement blue-green deployments for zero-downtime
- [ ] Add deployment preview for pull requests
- [ ] Automate DNS verification checks
- [ ] Add performance monitoring (Core Web Vitals)
- [ ] Implement feature flags for gradual rollouts
- [ ] Add deployment notifications (Slack, Discord)
- [ ] Create deployment dashboard for status visualization

---

**Last Updated**: 2026-01-11  
**Maintained By**: League of Fun Team
