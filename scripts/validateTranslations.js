/**
 * Translation validation utility
 * This script verifies that all languages have the same keys and structure
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALIZATION_DIR = path.join(__dirname, '../localization');
const LANGUAGES = ['en', 'de', 'es', 'fr'];
const BASE_LANGUAGE = 'en'; // Language to use as reference

// Helper function to get all keys from a nested object (flattened with dot notation)
function getKeysFromObject(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively get keys from nested objects
      keys = [...keys, ...getKeysFromObject(obj[key], newPrefix)];
    } else {
      keys.push(newPrefix);
    }
  }
  
  return keys;
}

// Helper function to check if a key exists in an object
function hasKey(obj, key) {
  const parts = key.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Main validation function
async function validateTranslations() {
  console.log('Validating translations...');
  
  // First, load all translation files
  const allTranslations = {};
  
  try {
    for (const lang of LANGUAGES) {
      const filePath = path.join(LOCALIZATION_DIR, `${lang}.ts`);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`Translation file for ${lang} not found!`);
        continue;
      }
      
      // Read the file content as string
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Use regex to extract the translation object
      const match = fileContent.match(/const\s+[a-z]+\s*:\s*Translation\s*=\s*(\{[\s\S]+?\n\})\s*;/);
      
      if (!match || !match[1]) {
        console.error(`Could not parse translation object from ${lang}.ts`);
        continue;
      }
      
      // Convert the matched string to actual JavaScript
      // Note: This is a simplified approach and might not handle all edge cases
      const objectStr = match[1].replace(/\'([^\']+)\'/g, '"$1"');
      
      // Use eval in a controlled environment (only for local development)
      // In production, consider using a proper parser
      try {
        // Create a sandboxed function to evaluate the object
        const objFn = new Function(`return ${objectStr}`);
        allTranslations[lang] = objFn();
      } catch (evalError) {
        console.error(`Error parsing ${lang}.ts:`, evalError);
      }
    }
    
    // Get all keys from the base language
    const baseLanguage = allTranslations[BASE_LANGUAGE];
    if (!baseLanguage) {
      console.error(`Base language ${BASE_LANGUAGE} not found or failed to parse!`);
      return;
    }
    
    const baseKeys = getKeysFromObject(baseLanguage);
    console.log(`Found ${baseKeys.length} keys in ${BASE_LANGUAGE} (base language)`);
    
    // Check all other languages against the base
    for (const lang of LANGUAGES) {
      if (lang === BASE_LANGUAGE) continue;
      
      const langTranslation = allTranslations[lang];
      if (!langTranslation) {
        console.error(`Language ${lang} not found or failed to parse!`);
        continue;
      }
      
      // Check for missing keys
      const missingKeys = [];
      for (const key of baseKeys) {
        if (!hasKey(langTranslation, key)) {
          missingKeys.push(key);
        }
      }
      
      // Check for extra keys (not in base language)
      const langKeys = getKeysFromObject(langTranslation);
      const extraKeys = langKeys.filter(key => !baseKeys.includes(key));
      
      // Report findings
      console.log(`\n=== Language: ${lang} ===`);
      console.log(`Total keys: ${langKeys.length}`);
      
      if (missingKeys.length > 0) {
        console.log(`\nMissing keys (${missingKeys.length}):`);
        missingKeys.forEach(key => console.log(`  - ${key}`));
      } else {
        console.log('\n✅ No missing keys!');
      }
      
      if (extraKeys.length > 0) {
        console.log(`\nExtra keys (${extraKeys.length}):`);
        extraKeys.forEach(key => console.log(`  - ${key}`));
      } else {
        console.log('\n✅ No extra keys!');
      }
    }
    
    console.log('\nTranslation validation complete!');
    
  } catch (error) {
    console.error('Error validating translations:', error);
  }
}

// Run the validation
validateTranslations();