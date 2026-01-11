# Required GitHub Secrets Setup

This repository requires the following secrets to be configured for successful CI/CD deployments.

## Secrets Overview

| Secret Name | Required For | Description | Permissions |
|-------------|--------------|-------------|-------------|
| `DEPLOY_PAT` | BlameGame & HookHunt deployment | Personal Access Token for pushing to deployment repos | `repo` (Full control) |
| `SPOTIFY_CLIENT_ID` | HookHunt build | Spotify OAuth Client ID | None (build-time only) |

## Setup Instructions

### 1. Create DEPLOY_PAT

This Personal Access Token (PAT) is used to push built files to the deployment repositories (`webdrink/blamegame` and `webdrink/HookHunt`).

#### Steps:

1. Go to your GitHub account settings
2. Navigate to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Configure the token:
   - **Note**: `League of Fun Deployment Token`
   - **Expiration**: Set to your preference (recommend 90 days or 1 year)
   - **Scopes**: Check `repo` (Full control of private repositories)
     - This includes:
       - `repo:status`
       - `repo_deployment`
       - `public_repo`
       - `repo:invite`
       - `security_events`
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't be able to see it again)
7. Add to repository secrets:
   - Go to `webdrink/leagueoffun` repository
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **"New repository secret"**
   - Name: `DEPLOY_PAT`
   - Value: Paste the token you copied
   - Click **"Add secret"**

#### Verification:

The token must have write access to:
- `webdrink/blamegame` repository
- `webdrink/HookHunt` repository

### 2. Create SPOTIFY_CLIENT_ID

This is the Spotify OAuth Client ID used for HookHunt's Spotify integration.

#### Prerequisites:

You need a Spotify Developer account and a registered application. See [`docs/SPOTIFY_SETUP.md`](./docs/SPOTIFY_SETUP.md) for detailed instructions.

#### Steps:

1. Follow the setup guide in [`docs/SPOTIFY_SETUP.md`](./docs/SPOTIFY_SETUP.md) to create a Spotify application
2. Copy the **Client ID** from your Spotify app dashboard
3. Add to repository secrets:
   - Go to `webdrink/leagueoffun` repository
   - Navigate to **Settings → Secrets and variables → Actions**
   - Click **"New repository secret"**
   - Name: `SPOTIFY_CLIENT_ID`
   - Value: Paste your Spotify Client ID
   - Click **"Add secret"**

#### Security Note:

The Spotify Client ID is embedded in the built JavaScript bundle and is visible to users. This is **intentional and safe** for OAuth PKCE flow, which does not require a client secret.

**❌ DO NOT** add the Spotify Client Secret as a secret. It should never be used in client-side code.

## Verifying Secrets

To verify secrets are configured correctly:

1. Go to `webdrink/leagueoffun` repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. You should see two repository secrets:
   - `DEPLOY_PAT`
   - `SPOTIFY_CLIENT_ID`
4. Click on each secret to verify it exists (you won't be able to see the value)

## Testing Deployments

After configuring secrets, test the deployment pipeline:

1. Go to **Actions** tab
2. Select **"🚀 Deploy All Apps"** workflow
3. Click **"Run workflow"**
4. Select `main` branch
5. Click **"Run workflow"** button
6. Monitor the workflow execution

### Expected Results:

- ✅ Build phase completes successfully
- ✅ Gamepicker deploys to GitHub Pages
- ✅ BlameGame deploys to `webdrink/blamegame`
- ✅ HookHunt deploys to `webdrink/HookHunt`
- ✅ Smoke tests pass for all three apps
- ✅ Deployment summary shows all successes

### Common Issues:

#### "Input required and not supplied: token"

**Cause**: `DEPLOY_PAT` secret is missing or misconfigured.

**Solution**: 
1. Verify the secret exists and is named exactly `DEPLOY_PAT` (case-sensitive)
2. Ensure the PAT has `repo` permission
3. Check the PAT hasn't expired

#### "Permission denied" or "403 Forbidden"

**Cause**: `DEPLOY_PAT` doesn't have write access to deployment repositories.

**Solution**:
1. Verify the PAT has `repo` scope selected
2. Ensure the PAT owner has write access to both `webdrink/blamegame` and `webdrink/HookHunt`
3. Try regenerating the PAT with correct permissions

#### HookHunt build succeeds but Spotify login fails

**Cause**: `SPOTIFY_CLIENT_ID` is missing or incorrect.

**Solution**:
1. Verify the secret exists and is named exactly `SPOTIFY_CLIENT_ID`
2. Verify the Client ID matches your Spotify Developer Dashboard
3. Check that redirect URIs are configured correctly in Spotify app settings

## Secret Rotation

### When to Rotate Secrets:

- **DEPLOY_PAT**: 
  - When the token expires
  - If the token is accidentally exposed
  - When changing repository permissions
  - Recommended: Every 90-365 days

- **SPOTIFY_CLIENT_ID**:
  - If you need to use a different Spotify app
  - If the Client ID is compromised (rare, but possible)
  - When migrating to a new Spotify Developer account

### How to Rotate:

1. Generate a new secret/token using the same steps above
2. Update the repository secret with the new value:
   - Go to **Settings → Secrets and variables → Actions**
   - Click the secret name
   - Click **"Update secret"**
   - Paste the new value
   - Click **"Update secret"**
3. Test the deployment to ensure it works with the new secret

## Security Best Practices

### ✅ Do:
- Keep secrets confidential and never commit them to version control
- Use fine-grained permissions (only what's needed)
- Set expiration dates on PATs
- Rotate secrets regularly
- Monitor Actions logs for suspicious activity
- Use different PATs for different purposes

### ❌ Don't:
- Share secrets via email, Slack, or other communication channels
- Use the same PAT across multiple repositories if not necessary
- Give PATs more permissions than required
- Store secrets in issue comments or pull request descriptions
- Use personal PATs for organization-level automation (use org PATs instead)

## Troubleshooting

If you encounter issues with secrets:

1. **Verify secret exists**: Check Settings → Secrets and variables → Actions
2. **Check workflow syntax**: Ensure `${{ secrets.SECRET_NAME }}` is used correctly
3. **Review permissions**: Ensure PAT has necessary scopes
4. **Check expiration**: Verify PAT hasn't expired
5. **Test manually**: Try using the secret in a simple workflow first
6. **Check logs**: Review workflow logs for specific error messages

## Additional Resources

- [GitHub Encrypted Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Creating a Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Spotify OAuth Setup Guide](./docs/SPOTIFY_SETUP.md)
- [Deployment Architecture](./DEPLOYMENT.md)

---

**Need Help?** Open an issue with the `deployment` or `ci-cd` label.
