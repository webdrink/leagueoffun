/**
 * Script to create localized category index files for the BlameGame
 */

const fs = require('fs');
const path = require('path');

// Supported languages (ISO codes)
const languages = ['en', 'fr', 'es'];
const defaultLanguage = 'de';

// Main function
async function createLocalizedFiles() {
  try {
    console.log('Starting localization...');
    
    // Read source category index
    const sourcePath = path.join(__dirname, '../public/categories/index.json');
    const sourceData = fs.readFileSync(sourcePath, 'utf8')
      .replace(/^\uFEFF/, ''); // Remove BOM if present
    
    const categories = JSON.parse(sourceData);
    console.log(`Read ${categories.length} categories from source file`);
    
    // Add IDs to categories based on name
    let idUpdated = 0;
    const updatedCategories = categories.map(cat => {
      if (!cat.id) {
        // Generate ID from name
        const id = cat.name
          .toLowerCase()
          .replace(/[äöüß]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[c] || c))
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        
        idUpdated++;
        return { ...cat, id };
      }
      return cat;
    });
    
    // Save updated source file with IDs
    if (idUpdated > 0) {
      fs.writeFileSync(
        sourcePath,
        JSON.stringify(updatedCategories, null, 2),
        'utf8'
      );
      console.log(`Updated source file with ${idUpdated} category IDs`);
    }
    
    // Create directory for language-specific questions
    const questionsDir = path.join(__dirname, '../public/questions');
    if (!fs.existsSync(questionsDir)) {
      fs.mkdirSync(questionsDir);
      console.log('Created questions base directory');
    }
    
    // Create each language directory and language-specific index file
    for (const lang of [...languages, defaultLanguage]) {
      // Create language directory for questions
      const langDir = path.join(questionsDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir);
        console.log(`Created questions directory for ${lang}`);
      }
      
      // Skip creating index file for default language (already exists)
      if (lang === defaultLanguage) continue;
      
      // Create language-specific index file
      const targetPath = path.join(__dirname, `../public/categories/index.${lang}.json`);
      
      // If file exists, preserve existing translations
      let existingData = [];
      if (fs.existsSync(targetPath)) {
        try {
          const existingContent = fs.readFileSync(targetPath, 'utf8')
            .replace(/^\uFEFF/, ''); // Remove BOM if present
          existingData = JSON.parse(existingContent);
          console.log(`Found existing ${lang} index with ${existingData.length} entries`);
        } catch (error) {
          console.warn(`Error reading existing ${lang} index: ${error.message}`);
        }
      }
      
      // Create localized version
      const localizedCategories = updatedCategories.map(cat => {
        const existing = existingData.find(e => e.id === cat.id || e.name === cat.name);
        return {
          id: cat.id,
          name: existing?.name || `[${lang}] ${cat.name}`,
          fileName: cat.fileName,
          count: cat.count,
          emoji: cat.emoji
        };
      });
      
      // Write localized index file
      fs.writeFileSync(
        targetPath,
        JSON.stringify(localizedCategories, null, 2),
        'utf8'
      );
      console.log(`Created/updated index for ${lang} with ${localizedCategories.length} entries`);
    }
    
    console.log('Localization completed successfully!');
  } catch (error) {
    console.error('Error during localization:', error);
    console.error(error.stack);
  }
}

// Run the script
createLocalizedFiles().catch(error => {
  console.error('Fatal error:', error);
});
