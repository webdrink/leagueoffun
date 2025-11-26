# Custom Domain Deployment Guide

This document provides instructions for deploying the Blame Game application to the custom domain: blamegame.leagueoffun.de

## Prerequisites

- GitHub repository for the BlameGame project
- Access to the DNS settings for leagueoffun.de
- GitHub Pages enabled on the repository

## DNS Configuration

1. **Configure DNS Records**
   
   Add a CNAME record in your domain provider's DNS settings:
   
   ```
   Type: CNAME
   Name: blamegame
   Value: [your-github-username].github.io
   TTL: 3600 (or as recommended)
   ```
   
   Alternative: If CNAME doesn't work properly, use A records:
   
   ```
   Type: A
   Name: blamegame
   Value: 185.199.108.153
   TTL: 3600
   ```
   
   Add additional A records for these IPs:
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

## Building for Custom Domain

1. **Local Development Build**
   ```bash
   # For Unix/Linux/macOS:
   npm run build:domain
   
   # For Windows:
   npm run build:windows-domain
   ```

2. **Verify the Build**
   ```bash
   npm run verify-build
   ```

3. **Manual Deployment**
   If deploying manually (not using GitHub Actions):
   - Commit and push your changes
   - Go to your GitHub repository's Settings > Pages
   - Set the custom domain to `blamegame.leagueoffun.de`
   - Enable HTTPS

## Troubleshooting

If questions or other assets aren't loading correctly, check:

1. **Path Issues**
   Run the path fixer script:
   ```bash
   node scripts/fix-deployment-paths.js
   ```

2. **Question Loading**
   Verify that questions are accessible:
   - Open browser DevTools (F12)
   - Check the Network tab for errors
   - Look for 404s on question files

3. **CNAME Persistence**
   Make sure the `public/CNAME` file contains:
   ```
   blamegame.leagueoffun.de
   ```

4. **Debugging Tool**
   The app includes a debug panel (press the "D" button in the bottom right). Use the Asset Debug Info to verify paths.

## Contact

For assistance with deployment issues, contact:
- GitHub Issues: Create an issue on the repository
- Email: [your-contact-email]
