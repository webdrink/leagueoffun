# 🚨 ACTION REQUIRED: Complete Deployment Setup

This document outlines the **manual steps** you need to take to make League of Fun fully operational and deployable.

## ✅ What's Already Done

The following fixes and improvements have been completed:

- ✅ Fixed deployment workflow secret name mismatch (`DEPLOY_TOKEN` → `DEPLOY_PAT`)
- ✅ Added smoke tests to all deployment jobs
- ✅ Fixed Spotify OAuth callback to support subdomain hosting
- ✅ Fixed domain inconsistencies (HookHunt now correctly uses `.com`)
- ✅ Created comprehensive deployment documentation
- ✅ Created Spotify OAuth setup guide
- ✅ Created GitHub secrets setup guide
- ✅ Added Spotify environment variable configuration to build workflows
- ✅ Verified all apps build successfully locally

## 🔧 Required Actions

### 1. Configure GitHub Secrets (CRITICAL - Deployments Will Fail Without This)

You need to add two secrets to the `webdrink/leagueoffun` repository.

#### A. Create DEPLOY_PAT Secret

**Purpose**: Allows deployment workflows to push to `webdrink/blamegame` and `webdrink/HookHunt` repositories.

**Steps**:
1. Generate a GitHub Personal Access Token (Classic):
   - Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - Click **"Generate new token (classic)"**
   - Name: `League of Fun Deployment Token`
   - Expiration: 90 days or 1 year (recommended)
   - Scopes: Check **`repo`** (Full control of private repositories)
   - Click **"Generate token"** and copy the token

2. Add to repository secrets:
   - Go to `webdrink/leagueoffun` repository
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **"New repository secret"**
   - Name: `DEPLOY_PAT` (exact name, case-sensitive)
   - Value: Paste the token
   - Click **"Add secret"**

**Verification**: The token must have write access to both:
- `webdrink/blamegame`
- `webdrink/HookHunt`

#### B. Create SPOTIFY_CLIENT_ID Secret

**Purpose**: Enables HookHunt's Spotify integration.

**Steps**:
1. Create a Spotify Developer application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click **"Create app"**
   - App name: `HookHunt` or `HookHunt Production`
   - App description: `A music guessing game`
   - Website: `https://hookhunt.leagueoffun.com`
   - Redirect URIs: `https://hookhunt.leagueoffun.com/callback`
   - API: **Web API**
   - Click **"Save"**

2. Copy the Client ID:
   - Find **Client ID** in your app dashboard
   - Copy this value (NOT the Client Secret)

3. Add to repository secrets:
   - Go to `webdrink/leagueoffun` repository
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **"New repository secret"**
   - Name: `SPOTIFY_CLIENT_ID` (exact name, case-sensitive)
   - Value: Paste the Client ID
   - Click **"Add secret"**

**⚠️ Important**: Do NOT add the Client Secret. PKCE OAuth doesn't need it.

**Detailed Guide**: See [`docs/SPOTIFY_SETUP.md`](./docs/SPOTIFY_SETUP.md) for complete instructions.

---

### 2. Verify GitHub Pages Configuration

Ensure GitHub Pages is properly configured for all deployment repositories.

#### A. Gamepicker (webdrink/leagueoffun)

1. Go to `webdrink/leagueoffun` repository
2. Navigate to **Settings → Pages**
3. Verify:
   - ✅ Source: **Deploy from a branch**
   - ✅ Branch: **gh-pages** / **/ (root)**
   - ✅ Custom domain: **www.leagueoffun.com**
   - ✅ Enforce HTTPS: **Enabled**

#### B. BlameGame (webdrink/blamegame)

1. Go to `webdrink/blamegame` repository
2. Navigate to **Settings → Pages**
3. Verify:
   - ✅ Source: **Deploy from a branch**
   - ✅ Branch: **main** / **/ (root)**
   - ✅ Custom domain: **blamegame.leagueoffun.de**
   - ✅ Enforce HTTPS: **Enabled**

4. **If the repository doesn't exist**, create it:
   - Create new repository `webdrink/blamegame`
   - Make it public
   - Don't initialize with README (will be created automatically)
   - After creation, enable GitHub Pages as above

#### C. HookHunt (webdrink/HookHunt)

1. Go to `webdrink/HookHunt` repository
2. Navigate to **Settings → Pages**
3. Verify:
   - ✅ Source: **Deploy from a branch**
   - ✅ Branch: **main** / **/ (root)**
   - ✅ Custom domain: **hookhunt.leagueoffun.com**
   - ✅ Enforce HTTPS: **Enabled**

4. **If the repository doesn't exist**, create it:
   - Create new repository `webdrink/HookHunt`
   - Make it public
   - Don't initialize with README (will be created automatically)
   - After creation, enable GitHub Pages as above

---

### 3. Configure DNS Records

Ensure your DNS provider has the correct CNAME records for custom domains.

**Required DNS Records**:

| Hostname | Type | Value |
|----------|------|-------|
| `www.leagueoffun.com` | CNAME | `webdrink.github.io` |
| `blamegame.leagueoffun.de` | CNAME | `webdrink.github.io` |
| `hookhunt.leagueoffun.com` | CNAME | `webdrink.github.io` |

**Note**: DNS propagation can take up to 24-48 hours.

**Verification**:
```bash
# Check DNS resolution
dig www.leagueoffun.com CNAME
dig blamegame.leagueoffun.de CNAME
dig hookhunt.leagueoffun.com CNAME
```

---

### 4. Test Deployment Pipeline

After configuring secrets and GitHub Pages, test the deployment:

#### Manual Deployment Test

1. Go to `webdrink/leagueoffun` repository
2. Navigate to **Actions** tab
3. Select **"🚀 Deploy All Apps"** workflow
4. Click **"Run workflow"**
5. Select **main** branch
6. Click **"Run workflow"** button

#### Expected Results

- ✅ Build phase: All three apps build successfully
- ✅ Deploy Gamepicker: Deploys to GitHub Pages
- ✅ Deploy BlameGame: Pushes to `webdrink/blamegame`
- ✅ Deploy HookHunt: Pushes to `webdrink/HookHunt`
- ✅ Smoke Tests: All three sites return HTTP 200
- ✅ Summary: Shows all deployments succeeded

#### If Deployment Fails

**Check workflow logs** for specific error messages:

Common issues and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Input required and not supplied: token" | Missing `DEPLOY_PAT` secret | Add secret (see Step 1A) |
| "Permission denied" | PAT doesn't have repo access | Regenerate PAT with `repo` scope |
| "Repository not found" | Deployment repo doesn't exist | Create repository (see Step 2) |
| "Failed to fetch" during smoke test | DNS not configured | Wait for DNS propagation or check DNS records |

---

### 5. Verify Deployed Sites

After successful deployment, verify each site is working:

#### A. Gamepicker (Hub)

1. Visit `https://www.leagueoffun.com`
2. Verify:
   - ✅ Page loads without errors
   - ✅ BlameGame card is visible
   - ✅ HookHunt card is visible
   - ✅ Clicking BlameGame navigates to `https://blamegame.leagueoffun.de`
   - ✅ Clicking HookHunt navigates to `https://hookhunt.leagueoffun.com`

#### B. BlameGame

1. Visit `https://blamegame.leagueoffun.de`
2. Verify:
   - ✅ Page loads without errors
   - ✅ Game starts and questions display
   - ✅ Navigation works (next/prev question)
   - ✅ "Return to Hub" link works

#### C. HookHunt

1. Visit `https://hookhunt.leagueoffun.com`
2. Verify:
   - ✅ Page loads without errors
   - ✅ "Connect with Spotify" button appears
   - ✅ Clicking button redirects to Spotify login
   - ✅ After authorizing, returns to HookHunt
   - ✅ Playlist selection screen appears
   - ✅ Selecting a playlist starts the game
   - ✅ Song preview plays
   - ✅ Guessing mechanism works
   - ✅ Scoring and summary work
   - ✅ "Return to Hub" link works

**If HookHunt Spotify fails**:
- Verify `SPOTIFY_CLIENT_ID` secret is set
- Check Spotify Developer Dashboard redirect URI is exactly `https://hookhunt.leagueoffun.com/callback`
- Clear browser cache and try again

---

## 📋 Post-Deployment Checklist

After completing all steps above, verify:

- [ ] Both GitHub secrets are configured (`DEPLOY_PAT` and `SPOTIFY_CLIENT_ID`)
- [ ] All three GitHub Pages sites are enabled and configured
- [ ] DNS records are configured correctly
- [ ] A test deployment has run successfully
- [ ] All smoke tests passed
- [ ] Gamepicker hub loads and links work
- [ ] BlameGame is playable end-to-end
- [ ] HookHunt Spotify login works
- [ ] HookHunt gameplay works (playlist → preview → guess → score)
- [ ] Return-to-hub flow works from both games

## 🔍 Monitoring & Maintenance

### Regular Checks

- **Weekly**: Check deployment workflow runs for failures
- **Monthly**: Verify all sites are still accessible
- **Quarterly**: Rotate `DEPLOY_PAT` (regenerate and update secret)
- **Annually**: Review and update Spotify app configuration

### Troubleshooting Resources

- **Deployment Issues**: See [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Spotify Integration**: See [`docs/SPOTIFY_SETUP.md`](./docs/SPOTIFY_SETUP.md)
- **Secret Management**: See [`docs/GITHUB_SECRETS_SETUP.md`](./docs/GITHUB_SECRETS_SETUP.md)

### Getting Help

If you encounter issues:

1. Check workflow logs in Actions tab
2. Review error messages in smoke tests
3. Check browser console for frontend errors
4. Review documentation files listed above
5. Open an issue with:
   - Workflow run URL
   - Error messages (redact any secrets)
   - Steps to reproduce
   - Browser/environment details (for frontend issues)

## 🎉 Success!

Once all steps are complete and verified, League of Fun will be:

- ✅ Fully deployed across three custom domains
- ✅ Automatically deploying on every push to `main`
- ✅ Self-testing with smoke tests
- ✅ Ready for players to enjoy!

**Share the hub**: `https://www.leagueoffun.com`

---

**Questions?** Check the documentation in `/docs/` or open an issue!
