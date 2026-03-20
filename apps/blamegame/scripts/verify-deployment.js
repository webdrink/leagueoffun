#!/usr/bin/env node

/**
 * Deployment version verification script
 * 
 * This script checks that the deployed version matches the expected version
 * from the local package.json and provides detailed deployment status.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://blamegame.leagueoffun.com';
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({ status: response.statusCode, data });
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${data}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...\n');
  
  // Get expected version from package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const expectedVersion = packageJson.version;
  
  console.log(`📊 Expected version: ${expectedVersion}`);
  
  try {
    // Check if main site is accessible
    console.log('🌐 Checking main site accessibility...');
    await fetchUrl(SITE_URL);
    console.log('✅ Main site is accessible');
    
    // Check if JSON files are accessible
    console.log('📄 Checking JSON files...');
    await fetchUrl(`${SITE_URL}/questions/categories.json`);
    console.log('✅ categories.json is accessible');
    
    // Check deployed version
    console.log('🔢 Checking deployed version...');
    const versionResponse = await fetchUrl(`${SITE_URL}/version.json`);
    const deployedVersionInfo = JSON.parse(versionResponse.data);
    
    console.log(`📊 Deployed version: ${deployedVersionInfo.version}`);
    console.log(`🔧 Git hash: ${deployedVersionInfo.gitHash}`);
    console.log(`🌿 Branch: ${deployedVersionInfo.branch}`);
    console.log(`🕐 Build time: ${deployedVersionInfo.buildTime}`);
    
    // Verify version match
    if (deployedVersionInfo.version === expectedVersion) {
      console.log('\n✅ VERSION VERIFICATION SUCCESSFUL!');
      console.log(`Both local and deployed versions are: ${expectedVersion}`);
      return true;
    } else {
      console.log('\n❌ VERSION MISMATCH DETECTED!');
      console.log(`Expected: ${expectedVersion}`);
      console.log(`Deployed: ${deployedVersionInfo.version}`);
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ Deployment verification failed: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('🌐 The site appears to be inaccessible');
    } else if (error.message.includes('404')) {
      console.log('📄 Some resources are missing (possible deployment issue)');
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 BlameGame Deployment Verification\n');
  
  const success = await verifyDeployment();
  
  if (success) {
    console.log('\n🎉 All checks passed! Deployment is verified.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Deployment verification failed. Please check the deployment.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { verifyDeployment };
