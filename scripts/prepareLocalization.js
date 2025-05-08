/**
 * Script to prepare localization files for the BlameGame
 * This script:
 * 1. Creates language-specific category index files with translated category names
 * 2. Updates the German category index with language-neutral IDs
 * 3. Creates directories for language-specific question files (future use)
 */

const fs = require('fs');
const path = require('path');

// Supported languages (ISO codes)
const languages = ['en', 'fr', 'es'];

// Default language (German)
const defaultLanguage = 'de';

// Main function
async function prepareLocalization() {  try {
    console.log('Starting localization preparation...');
    
    // 1. Read the German category index
    const categoriesPath = path.join(__dirname, '../public/categories/index.json');
    let categoriesText = fs.readFileSync(categoriesPath, 'utf8');
    
    // Remove BOM if present
    if (categoriesText.charCodeAt(0) === 0xFEFF) {
      categoriesText = categoriesText.slice(1);
    }
    
    const categories = JSON.parse(categoriesText);
    
    console.log(`Loaded ${categories.length} categories from default language (${defaultLanguage})`);
    
    // 2. Add language-neutral IDs to each category if not already present
    let updatedCount = 0;
    categories.forEach(cat => {
      if (!cat.id) {
        // Create an ID based on the name (simplified)
        let id = cat.name
          .toLowerCase()
          .replace(/[äöüß]/g, char => {
            return { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[char] || char;
          })
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        cat.id = id;
        updatedCount++;
      }
    });
    
    // 3. Save the updated German category index with IDs
    if (updatedCount > 0) {
      fs.writeFileSync(
        categoriesPath,
        JSON.stringify(categories, null, 2),
        'utf8'
      );
      console.log(`Updated ${updatedCount} categories with IDs in default language file`);
    }
    
    // 4. Generate template files for other languages
    for (const lang of languages) {
      await generateLanguageFile(lang, categories);
    }
    
    // 5. Create directories for language-specific question files
    createQuestionDirectories(languages);
    
    console.log('Localization preparation completed successfully!');
  } catch (error) {
    console.error('Error preparing localization:', error);
  }
}

// Generate a language-specific category index file
async function generateLanguageFile(lang, sourceCategories) {
  const targetPath = path.join(__dirname, `../public/categories/index.${lang}.json`);
  
  // Check if the file already exists to preserve existing translations  let existingData = [];
  if (fs.existsSync(targetPath)) {
    try {
      let fileContent = fs.readFileSync(targetPath, 'utf8');
      
      // Remove BOM if present
      if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
      }
      
      existingData = JSON.parse(fileContent);
      console.log(`Found existing ${lang} file with ${existingData.length} entries`);
    } catch (error) {
      console.error(`Error reading existing ${lang} file:`, error);
    }
  }
  
  // Create the localized version using existing data or placeholders
  const localizedCategories = sourceCategories.map(cat => {
    // Find this category in existing data if it exists
    const existing = existingData.find(e => e.id === cat.id);
    
    return {
      id: cat.id,
      name: existing ? existing.name : `[${lang}] ${cat.name}`, // Use existing or placeholder
      fileName: cat.fileName,
      count: cat.count,
      emoji: cat.emoji
    };
  });
  
  // Write the file
  fs.writeFileSync(
    targetPath,
    JSON.stringify(localizedCategories, null, 2),
    'utf8'
  );
  
  console.log(`Created/updated localization template for ${lang} with ${localizedCategories.length} entries`);
}

// Create directories for language-specific question files
function createQuestionDirectories(languages) {
  const basePath = path.join(__dirname, '../public/questions');
  
  // Create the base directory if it doesn't exist
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
    console.log('Created base questions directory');
  }
  
  // Create a directory for each language
  for (const lang of [...languages, defaultLanguage]) {
    const langPath = path.join(basePath, lang);
    if (!fs.existsSync(langPath)) {
      fs.mkdirSync(langPath);
      console.log(`Created questions directory for ${lang}`);
    }
  }
}

// Run the script
prepareLocalization();