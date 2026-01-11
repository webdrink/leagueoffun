# HookHunt Spotify Integration Setup Guide

## Overview

HookHunt uses the Spotify Web API to allow users to play music guessing games using their own Spotify playlists. This requires OAuth authentication using the PKCE (Proof Key for Code Exchange) flow.

## Prerequisites

- A Spotify account (free or premium)
- Access to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 1: Create a Spotify Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the application details:
   - **App name**: `HookHunt` (or `HookHunt Dev` for development)
   - **App description**: `A music guessing game that tests your knowledge of song hooks`
   - **Website**: `https://hookhunt.leagueoffun.com`
   - **Redirect URIs**: Add the following URIs:
     - Production: `https://hookhunt.leagueoffun.com/callback`
     - Development: `http://localhost:9992/callback`
   - **API/SDKs**: Select **Web API**
5. Agree to Spotify's Developer Terms of Service
6. Click **"Save"**

## Step 2: Get Your Client ID

1. In your app's dashboard, find the **Client ID**
2. Copy this value - you'll need it for configuration

**⚠️ Important**: Do NOT copy the Client Secret. PKCE OAuth does not require the client secret and it should never be embedded in client-side code.

## Step 3: Configure Environment Variables

### For Local Development

Create a `.env.local` file in the `apps/hookhunt/` directory:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:9992/callback
```

**Example:**
```env
VITE_SPOTIFY_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
VITE_SPOTIFY_REDIRECT_URI=http://localhost:9992/callback
```

### For Production Deployment

For production builds, these environment variables need to be set during the build process. There are two approaches:

#### Option 1: Build-time Environment Variables (Recommended)

Add environment variables to your build workflow (`.github/workflows/deploy-all.yml` or `.github/workflows/deploy-hookhunt.yml`):

```yaml
- name: 🏗️ Build HookHunt
  env:
    VITE_SPOTIFY_CLIENT_ID: ${{ secrets.SPOTIFY_CLIENT_ID }}
    VITE_SPOTIFY_REDIRECT_URI: https://hookhunt.leagueoffun.com/callback
  run: |
    echo "🏗️ Building HookHunt..."
    pnpm --filter @leagueoffun/hookhunt build
    echo "✅ HookHunt build complete"
```

Then add the `SPOTIFY_CLIENT_ID` as a GitHub repository secret:
1. Go to `webdrink/leagueoffun` repository settings
2. Navigate to **Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `SPOTIFY_CLIENT_ID`
5. Value: Your Spotify Client ID
6. Click **"Add secret"**

#### Option 2: Create a Production .env File

**⚠️ Not Recommended**: This approach stores the Client ID in version control, which is acceptable for client-side OAuth but less flexible.

Create `apps/hookhunt/.env.production`:

```env
VITE_SPOTIFY_CLIENT_ID=your_production_client_id
VITE_SPOTIFY_REDIRECT_URI=https://hookhunt.leagueoffun.com/callback
```

**Note**: The Client ID will be visible in the built JavaScript bundle, which is acceptable for PKCE OAuth as the client secret is not used.

## Step 4: Verify Redirect URIs

The redirect URIs **must match exactly** between:
1. Spotify Developer Dashboard app settings
2. Environment variable `VITE_SPOTIFY_REDIRECT_URI`
3. The actual deployment URL

### Current Production Configuration

- **Domain**: `hookhunt.leagueoffun.com`
- **Callback Path**: `/callback`
- **Full Redirect URI**: `https://hookhunt.leagueoffun.com/callback`

### Development Configuration

- **Domain**: `localhost:9992`
- **Callback Path**: `/callback`
- **Full Redirect URI**: `http://localhost:9992/callback`

## Step 5: Test the Integration

### Local Testing

1. Start the development server:
   ```bash
   cd apps/hookhunt
   pnpm dev
   ```

2. Open your browser to `http://localhost:9992`

3. Click **"Connect with Spotify"** or similar button

4. You should be redirected to Spotify's login page

5. After authorizing, you should be redirected back to `http://localhost:9992/callback`

6. The app should handle the callback and display your playlists

### Production Testing

1. Deploy HookHunt to production (using the deployment workflow)

2. Visit `https://hookhunt.leagueoffun.com`

3. Click **"Connect with Spotify"**

4. Authorize the app on Spotify

5. Verify you're redirected back and can select playlists

## OAuth Flow Overview

### PKCE Authentication Flow

```
┌──────────┐                                      ┌──────────┐
│          │                                      │          │
│  User    │                                      │  Spotify │
│  Browser │                                      │  Server  │
│          │                                      │          │
└────┬─────┘                                      └─────┬────┘
     │                                                  │
     │  1. Click "Connect with Spotify"                │
     │────────────────────────────────────────────────>│
     │                                                  │
     │  2. Generate code_verifier (random)             │
     │     Generate code_challenge (SHA256)            │
     │     Store code_verifier in localStorage         │
     │                                                  │
     │  3. Redirect to Spotify auth URL                │
     │────────────────────────────────────────────────>│
     │     with code_challenge                          │
     │                                                  │
     │  4. User logs in and authorizes                 │
     │<────────────────────────────────────────────────│
     │                                                  │
     │  5. Redirect to callback with code              │
     │<────────────────────────────────────────────────│
     │     (/callback?code=ABC123...)                  │
     │                                                  │
     │  6. Extract code from URL                       │
     │     Retrieve code_verifier from localStorage    │
     │     Exchange code + code_verifier for tokens    │
     │────────────────────────────────────────────────>│
     │                                                  │
     │  7. Receive access_token and refresh_token      │
     │<────────────────────────────────────────────────│
     │                                                  │
     │  8. Store tokens in localStorage                │
     │     Use access_token for API requests           │
     │                                                  │
```

### Security Features

- **PKCE (Proof Key for Code Exchange)**: Protects against authorization code interception attacks
- **No Client Secret**: The client secret is never exposed in client-side code
- **Code Verifier**: A cryptographically random string stored client-side
- **Code Challenge**: SHA-256 hash of the code verifier sent to Spotify
- **Token Storage**: Access and refresh tokens stored in localStorage
- **Automatic Refresh**: Tokens are automatically refreshed before expiry

## Required Spotify Scopes

HookHunt requests the following OAuth scopes:

| Scope | Description | Required For |
|-------|-------------|--------------|
| `user-read-private` | Read user's subscription details | Determining account type |
| `user-read-email` | Read user's email address | User identification |
| `playlist-read-private` | Read user's private playlists | Playlist selection |
| `playlist-read-collaborative` | Read collaborative playlists | Playlist selection |
| `user-library-read` | Read user's saved tracks | Library access |
| `streaming` | Control Spotify playback | Web Playback SDK (future feature) |

**Note**: The `streaming` scope is included for future Pro Mode features but is not currently used.

## Troubleshooting

### "Invalid Redirect URI" Error

**Problem**: Spotify returns an error saying the redirect URI is invalid.

**Solution**:
1. Verify the redirect URI in Spotify Developer Dashboard **exactly matches** the value in `VITE_SPOTIFY_REDIRECT_URI`
2. Check for typos, trailing slashes, and protocol (http vs https)
3. Ensure the URI is added to the app's Redirect URI whitelist

### "Client ID Not Found" Error

**Problem**: App shows an error that the Client ID is not configured.

**Solution**:
1. Verify `.env.local` file exists in `apps/hookhunt/`
2. Ensure `VITE_SPOTIFY_CLIENT_ID` is set
3. Restart the development server after creating/modifying `.env.local`

### Callback Hangs or Shows "No Code Verifier Found"

**Problem**: After Spotify redirects back, the app hangs or shows an error.

**Solution**:
1. Clear browser localStorage: `localStorage.clear()`
2. Ensure browser allows localStorage (not in private browsing mode)
3. Check browser console for errors
4. Verify the callback path is `/callback` and not something else

### "Failed to Fetch" or CORS Errors

**Problem**: API requests to Spotify fail with CORS errors.

**Solution**:
- CORS is handled by Spotify's servers
- Ensure you're making requests to `https://api.spotify.com`
- Verify the access token is included in the `Authorization` header
- Check that the token hasn't expired

### Tokens Expire Too Quickly

**Problem**: User has to re-authenticate frequently.

**Solution**:
- Access tokens expire after 1 hour (Spotify's policy)
- The app automatically refreshes tokens using the refresh token
- Ensure refresh token logic is working correctly
- Check for errors in browser console during token refresh

## Rate Limits

Spotify has rate limits for API requests:

- **Default**: ~180 requests per minute per user
- **Extended**: Some endpoints have higher limits

**Best Practices**:
1. Cache API responses when possible
2. Avoid unnecessary API calls in loops
3. Use batch endpoints when available (e.g., get multiple tracks at once)
4. Implement exponential backoff for rate limit errors (429 status)

## Development vs Production

### Development Setup

- Use `http://localhost:9992/callback`
- Can use a separate Spotify app for development
- Easier to test and debug
- Logs are visible in browser console

### Production Setup

- Use `https://hookhunt.leagueoffun.com/callback`
- Should use a dedicated production Spotify app
- Client ID is embedded in built JavaScript (visible to users)
- Monitor error rates and user feedback

## Security Considerations

### ✅ Safe Practices

- Client ID embedded in frontend code (acceptable for PKCE)
- PKCE flow eliminates need for client secret
- Tokens stored in localStorage (acceptable for web apps)
- Automatic token refresh
- HTTPS enforced in production

### ❌ Things to Avoid

- **Never** embed the client secret in frontend code
- **Never** use the implicit grant flow (deprecated by Spotify)
- **Never** store tokens in cookies without proper security
- **Never** send tokens to third-party analytics or logging services
- **Never** share access tokens between users

## Future Enhancements

Potential improvements to the Spotify integration:

- [ ] Implement Spotify Web Playback SDK for full playback control
- [ ] Add support for podcasts and audiobooks
- [ ] Cache user playlists to reduce API calls
- [ ] Add offline playlist mode (requires saved data)
- [ ] Implement playlist search and filtering
- [ ] Add collaborative playlist creation
- [ ] Support for multiple music providers (Apple Music, YouTube Music)

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [OAuth 2.0 with PKCE](https://oauth.net/2/pkce/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Spotify Dashboard](https://developer.spotify.com/dashboard)

---

**Last Updated**: 2026-01-11  
**Need Help?** Open an issue in the repository with the `spotify-integration` label
