/**
 * Script to update category files with standardized IDs across languages
 */

const fs = require('fs');
const path = require('path');

// Define language codes
const languages = ['en', 'fr', 'es', 'de'];

// Define mapping for English category names to standardized IDs
const categoryMappings = {
  // Party/Social
  'beim_feiern': 'party',
  'auf_partys_mit_fremden': 'parties_with_strangers',
  
  // Relationships
  'in_beziehungen': 'relationships',
  'in_der_freundschaft': 'friendships',
  'beim_flirten': 'flirting',
  
  // Work & School
  'bei_der_arbeit': 'at_work',
  'in_der_schule': 'at_school',
  
  // Daily Life
  'im_alltag': 'daily_life',
  'beim_essen': 'eating',
  'im_bad': 'in_bathroom',
  'in_der_wg': 'in_shared_apartment',
  'in_der_familie': 'in_family',
  
  // Activities
  'im_urlaub': 'on_vacation',
  'beim_sport': 'sports',
  
  // Awkward & Difficult
  'in_peinlichen_momenten': 'embarrassing_moments',
  'im_stra_enverkehr': 'in_traffic',
  
  // Media & Digital
  'im_internet': 'internet',
  'bei_filmen_serien': 'movies_series',
  
  // Fantasy & Hypothetical
  'in_der_zukunft': 'in_future',
  'in_der_vergangenheit': 'in_past',
  'beim_weltuntergang': 'apocalypse',
  'im_paralleluniversum': 'parallel_universe',
  'im_land_der_schlechten_entscheidungen': 'bad_decisions_land',
  'im_inneren_monolog': 'inner_monologue',
  'in_der_natur': 'in_nature',
  'in_der_fantasie': 'in_fantasy'
};

// Localized category names for each language (just a sample for demonstration)
const localizedNames = {
  'de': {
    'party': 'Beim Feiern',
    'relationships': 'In Beziehungen',
    'at_work': 'Bei der Arbeit',
    'at_school': 'In der Schule',
    // ... more German translations
  },
  'en': {
    'party': 'At Parties',
    'relationships': 'In Relationships',
    'at_work': 'At Work',
    'at_school': 'At School',
    // ... more English translations
  },
  'fr': {
    'party': 'En Fête',
    'relationships': 'Dans les Relations',
    'at_work': 'Au Travail',
    'at_school': 'À l\'École',
    // ... more French translations
  },
  'es': {
    'party': 'De Fiesta',
    'relationships': 'En Relaciones',
    'at_work': 'En el Trabajo',
    'at_school': 'En la Escuela',
    // ... more Spanish translations
  }
};

// Main function to update category files
async function updateCategoryFiles() {
  try {
    console.log('Starting category file update...');
    
    // First, standardize the base German index
    const deFilePath = path.join(__dirname, '../public/categories/index.json');
    const deData = JSON.parse(fs.readFileSync(deFilePath, 'utf8').replace(/^\uFEFF/, ''));
    
    // Update the German file with standardized IDs
    const updatedDe = deData.map(category => {
      const oldId = category.id;
      const newId = categoryMappings[oldId] || oldId;
      
      return {
        ...category,
        id: newId,
        fileName: `${newId}.json`, // Update fileName to match new ID
      };
    });
    
    // Save the updated German file
    fs.writeFileSync(deFilePath, JSON.stringify(updatedDe, null, 2), 'utf8');
    console.log('Updated German category index with standardized IDs');
    
    // Now update each language-specific file
    for (const lang of languages) {
      if (lang === 'de') continue; // German already processed
      
      const filePath = path.join(__dirname, `../public/categories/index.${lang}.json`);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.log(`File does not exist: ${filePath}`);
        continue;
      }
      
      // Read and parse the file
      const fileContent = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
      const langData = JSON.parse(fileContent);
      
      // Update each category with the standardized ID and proper translations
      const updatedLangData = updatedDe.map(baseCategory => {
        // Find matching category in the language file
        const existingCategory = langData.find(c => 
          c.id === baseCategory.id || // Match by new ID
          c.id === Object.keys(categoryMappings).find(key => categoryMappings[key] === baseCategory.id) // Match by old ID
        );
        
        // If we have a localized name for this category and language, use it
        // Otherwise, keep the existing translation or use a placeholder
        const localizedName = 
          (localizedNames[lang] && localizedNames[lang][baseCategory.id]) || 
          (existingCategory && !existingCategory.name.startsWith(`[${lang}]`) ? existingCategory.name : 
          `[${lang}] ${baseCategory.id.replace(/_/g, ' ')}`);
        
        return {
          id: baseCategory.id,
          name: localizedName,
          fileName: `${baseCategory.id}.json`,
          count: baseCategory.count || 30, // Default count
          emoji: baseCategory.emoji || "❓" // Default emoji
        };
      });
      
      // Save the updated file
      fs.writeFileSync(filePath, JSON.stringify(updatedLangData, null, 2), 'utf8');
      console.log(`Updated ${lang} category index with standardized IDs and translations`);
    }
    
    console.log('All category files updated successfully!');
    
    // Now, create directories for question files with new IDs
    const questionsDir = path.join(__dirname, '../public/questions');
    
    // Ensure the base questions directory exists
    if (!fs.existsSync(questionsDir)) {
      fs.mkdirSync(questionsDir);
    }
    
    // Create language directories and sample question files
    for (const lang of languages) {
      const langDir = path.join(questionsDir, lang);
      
      // Create language directory if it doesn't exist
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir);
      }
      
      console.log(`Created questions directory for ${lang}`);
      
      // Create a sample question file for each category
      for (const category of updatedDe) {
        const questionFilePath = path.join(langDir, `${category.id}.json`);
        
        // Only create if it doesn't exist
        if (!fs.existsSync(questionFilePath)) {
          // Create a sample question file
          const sampleQuestions = [
            {
              text: `Sample question 1 for ${category.id} in ${lang}`,
              category: category.id
            },
            {
              text: `Sample question 2 for ${category.id} in ${lang}`,
              category: category.id
            }
          ];
          
          fs.writeFileSync(questionFilePath, JSON.stringify(sampleQuestions, null, 2), 'utf8');
        }
      }
    }
    
    console.log('Sample question files created for all categories and languages');
    
  } catch (error) {
    console.error('Error updating category files:', error);
  }
}

// Run the update function
updateCategoryFiles();
