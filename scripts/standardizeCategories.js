/**
 * Script to standardize categories across languages
 * 
 * This script:
 * 1. Reads the default categories index.json
 * 2. Updates other language files to match the same IDs and structure
 */

const fs = require('fs');
const path = require('path');

// Path configurations
const CATEGORIES_DIR = path.join(__dirname, '../public/categories');
const DEFAULT_FILE = path.join(CATEGORIES_DIR, 'index.json');
const LANGUAGE_FILES = [
  { code: 'en', file: 'index.en.json' },
  { code: 'es', file: 'index.es.json' },
  { code: 'fr', file: 'index.fr.json' }
];

// Read the default categories
try {
  const defaultCategories = JSON.parse(fs.readFileSync(DEFAULT_FILE, 'utf8'));
  
  // Process each language file
  LANGUAGE_FILES.forEach(({ code, file }) => {
    const langFilePath = path.join(CATEGORIES_DIR, file);
    let langCategories = [];
    
    // Try to read existing language file
    try {
      langCategories = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      console.log(`Successfully read ${file}`);
    } catch (err) {
      console.log(`Creating new file for ${code}`);
      langCategories = [];
    }
    
    // Create a map of existing categories by ID
    const langCategoriesMap = {};
    langCategories.forEach(cat => {
      if (cat.id) {
        langCategoriesMap[cat.id] = cat;
      }
    });
    
    // Create a new array based on the default structure
    const updatedCategories = defaultCategories.map(defCat => {
      // If this category exists in the language file, preserve its name and other fields
      if (defCat.id && langCategoriesMap[defCat.id]) {
        return {
          ...defCat,
          name: langCategoriesMap[defCat.id].name || `[${code}] ${defCat.id}`,
          emoji: langCategoriesMap[defCat.id].emoji || defCat.emoji || '❓'
        };
      }
      
      // Otherwise, create a placeholder entry
      return {
        ...defCat,
        name: `[${code}] ${defCat.name || defCat.id}`,
        emoji: defCat.emoji || '❓'
      };
    });
    
    // Write the updated file
    fs.writeFileSync(
      langFilePath, 
      JSON.stringify(updatedCategories, null, 2),
      'utf8'
    );
    
    console.log(`Updated ${file} with ${updatedCategories.length} categories`);
  });
  
  console.log('Category standardization complete!');
} catch (err) {
  console.error('Error processing categories:', err);
}