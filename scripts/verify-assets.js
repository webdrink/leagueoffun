/**
 * Verification script for checking if all required static assets exist
 * 
 * This script verifies that all required question files and other static assets
 * are in the correct locations. It's useful to run before deployment to ensure
 * everything will work correctly.
 * 
 * Run this script with: node scripts/verify-assets.js
 */

const fs = require('fs');
const path = require('path');

// Define paths relative to project root
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const QUESTIONS_DIR = path.join(PUBLIC_DIR, 'questions');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Define supported languages
const SUPPORTED_LANGUAGES = ['de', 'en', 'es', 'fr'];

// Function to check if a file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`Error checking if file exists (${filePath}):`, error);
    return false;
  }
};

// Function to check directory exists
const dirExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    console.error(`Error checking if directory exists (${dirPath}):`, error);
    return false;
  }
};

// Verify categories.json exists
const verifyCategoriesFile = () => {
  const categoriesPath = path.join(QUESTIONS_DIR, 'categories.json');
  if (fileExists(categoriesPath)) {
    console.log('✅ categories.json exists');
    return true;
  } else {
    console.error('❌ categories.json does not exist at', categoriesPath);
    return false;
  }
};

// Verify language directories and question files
const verifyLanguageDirectories = () => {
  let allValid = true;
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const langDir = path.join(QUESTIONS_DIR, lang);
    
    if (dirExists(langDir)) {
      console.log(`✅ Language directory exists: ${lang}`);
      
      // Get categories from categories.json
      try {
        const categoriesPath = path.join(QUESTIONS_DIR, 'categories.json');
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        // Check for each category
        categoriesData.forEach(category => {
          if (!category.id) {
            console.warn(`⚠️ Category without ID in categories.json`);
            return;
          }
          
          const categoryFile = path.join(langDir, `${category.id}.json`);
          if (fileExists(categoryFile)) {
            console.log(`  ✅ Question file exists: ${lang}/${category.id}.json`);
          } else {
            console.warn(`  ⚠️ Question file missing: ${lang}/${category.id}.json`);
            // This is just a warning since fallbacks exist
          }
        });
      } catch (error) {
        console.error(`❌ Error reading categories.json:`, error);
        allValid = false;
      }
    } else {
      console.warn(`⚠️ Language directory missing: ${lang}`);
      // Not a critical error since fallbacks exist
    }
  });
  
  return allValid;
};

// Verify PWA icons exist
const verifyPWAIcons = () => {
  const icons = [
    path.join(PUBLIC_DIR, 'pwa-icon-192x192.png'),
    path.join(PUBLIC_DIR, 'pwa-icon-512x512.png')
  ];
  
  let allValid = true;
  icons.forEach(iconPath => {
    if (fileExists(iconPath)) {
      console.log(`✅ PWA icon exists: ${path.basename(iconPath)}`);
    } else {
      console.error(`❌ PWA icon missing: ${path.basename(iconPath)}`);
      allValid = false;
    }
  });
  
  return allValid;
};

// Main verification function
const verifyAssets = () => {
  console.log('Verifying static assets...');
  
  let allValid = true;
  
  allValid = verifyCategoriesFile() && allValid;
  allValid = verifyLanguageDirectories() && allValid;
  allValid = verifyPWAIcons() && allValid;
  
  if (allValid) {
    console.log('\n✅ All critical assets verified successfully!');
  } else {
    console.error('\n❌ Some critical assets are missing. See errors above.');
  }
  
  return allValid;
};

// Run verification
verifyAssets();