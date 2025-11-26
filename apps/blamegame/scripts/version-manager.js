#!/usr/bin/env node

/**
 * Version management script for BlameGame
 * 
 * This script:
 * 1. Auto-increments the patch version on each commit to main
 * 2. Updates package.json with the new version
 * 3. Creates a version.json file for deployment verification
 * 4. Adds the git commit hash for additional tracking
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const VERSION_JSON_PATH = path.join(__dirname, '..', 'public', 'version.json');

function getCurrentGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️ Could not get git hash:', error.message);
    return 'unknown';
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️ Could not get git branch:', error.message);
    return 'unknown';
  }
}

function incrementVersion(currentVersion) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

function updatePackageJson(newVersion) {
  console.log('📝 Updating package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const oldVersion = packageJson.version;
  
  packageJson.version = newVersion;
  
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log(`✅ Version updated: ${oldVersion} → ${newVersion}`);
  return oldVersion;
}

function createVersionFile(version, gitHash, branch) {
  console.log('📝 Creating version.json...');
  
  const versionInfo = {
    version: version,
    gitHash: gitHash,
    branch: branch,
    buildTime: new Date().toISOString(),
    buildTimestamp: Date.now()
  };
  
  fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(versionInfo, null, 2) + '\n');
  
  console.log('✅ version.json created');
  return versionInfo;
}

function main() {
  console.log('🔢 Starting version management...');
  
  // Read current version
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Get git information
  const gitHash = getCurrentGitHash();
  const branch = getCurrentBranch();
  
  console.log(`Current version: ${currentVersion}`);
  console.log(`Git hash: ${gitHash}`);
  console.log(`Branch: ${branch}`);
  
  // Check if this is a CI/CD environment (only increment in CI)
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const shouldIncrement = process.argv.includes('--increment') || (isCI && branch === 'main');
  
  let newVersion = currentVersion;
  
  if (shouldIncrement) {
    newVersion = incrementVersion(currentVersion);
    updatePackageJson(newVersion);
  } else {
    console.log('ℹ️ Version increment skipped (not CI/main branch)');
  }
  
  // Always create/update version.json
  const versionInfo = createVersionFile(newVersion, gitHash, branch);
  
  console.log('\n📊 Version Information:');
  console.log(`- Version: ${versionInfo.version}`);
  console.log(`- Git Hash: ${versionInfo.gitHash}`);
  console.log(`- Branch: ${versionInfo.branch}`);
  console.log(`- Build Time: ${versionInfo.buildTime}`);
  
  console.log('\n✅ Version management complete');
  
  return versionInfo;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Version management failed:', error);
    process.exit(1);
  }
}

module.exports = { main, incrementVersion, createVersionFile };
