/**
 * Verification script for checking if all required static assets exist
 * 
 * This script verifies that all required question files and other static assets
 * are in the correct locations. It's useful to run before deployment to ensure
 * everything will work correctly.
 * 
 * Run this script with: node scripts/verify-assets.cjs
 */

const fs = require('fs');
const path = require('path');

// Define paths relative to project root
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const QUESTIONS_DIR = path.join(PUBLIC_DIR, 'questions');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Check if we should also verify the dist directory (optional param)
const verifyDist = process.argv.includes('--verify-dist');

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
  const iconCandidates = [
    ['pwa-icon-192x192.png', 'favicon.svg'],
    ['pwa-icon-512x512.png', 'pwa-icon-512x512.svg']
  ];

  let allValid = true;
  iconCandidates.forEach((candidates) => {
    const existing = candidates.find((candidate) => fileExists(path.join(PUBLIC_DIR, candidate)));
    if (existing) {
      console.log(`✅ PWA icon exists: ${existing}`);
    } else {
      console.error(`❌ PWA icon missing. Checked: ${candidates.join(', ')}`);
      allValid = false;
    }
  });

  return allValid;
};

// Verify game.json exists in public
const verifyGameJson = () => {
  const gamePath = path.join(PUBLIC_DIR, 'game.json');
  if (fileExists(gamePath)) {
    console.log('✅ game.json exists');
    return true;
  } else {
    console.error('❌ game.json is missing');
    return false;
  }
};

// Verify CNAME file
const verifyCNAME = () => {
  const cnamePath = path.join(PUBLIC_DIR, 'CNAME');
  
  if (fileExists(cnamePath)) {
    try {
      const content = fs.readFileSync(cnamePath, 'utf8').trim();
      if (content === 'blamegame.leagueoffun.com') {
        console.log('✅ CNAME file exists with correct domain');
        return true;
      } else {
        console.error(`❌ CNAME file has incorrect content: ${content}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error reading CNAME file:', error);
      return false;
    }
  } else {
    console.error('❌ CNAME file is missing');
    return false;
  }
};

// Verify dist directory for deployment
const verifyDistDirectory = () => {
  if (!verifyDist) {
    return true; // Skip if not requested
  }
  
  console.log('\nVerifying dist directory for deployment...');
  
  if (!fileExists(DIST_DIR)) {
    console.error('❌ dist directory not found. Run "npm run build" first.');
    return false;
  }
  
  // Check for critical files in dist
  const criticalFiles = [
    'index.html',
    'CNAME',
    'questions/categories.json',
    'game.json'
  ];
  
  let allValid = true;
  
  criticalFiles.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    if (fileExists(filePath)) {
      console.log(`✅ Dist file exists: ${file}`);
    } else {
      console.error(`❌ Missing from dist: ${file}`);
      allValid = false;
    }
  });
  
  return allValid;
};

// Verify translation completeness across languages
const verifyTranslations = () => {
  console.log('\n🌍 Verifying translation completeness...');
  
  let allValid = true;
  const issues = [];
  
  try {
    // Load categories
    const categoriesPath = path.join(QUESTIONS_DIR, 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Check category name translations
    categoriesData.forEach(category => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        if (!category[lang] || category[lang].trim() === '') {
          issues.push(`Missing category name translation: ${category.id} (${lang})`);
          allValid = false;
        }
      });
    });
    
    // Check question file completeness
    const questionCounts = {};
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      const langDir = path.join(QUESTIONS_DIR, lang);
      questionCounts[lang] = {};
      
      if (dirExists(langDir)) {
        categoriesData.forEach(category => {
          const categoryFile = path.join(langDir, `${category.id}.json`);
          if (fileExists(categoryFile)) {
            try {
              const questions = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
              questionCounts[lang][category.id] = questions.length;
              
              // Validate question structure
              questions.forEach((question, index) => {
                if (!question.questionId) {
                  issues.push(`Missing questionId in ${lang}/${category.id}.json at index ${index}`);
                  allValid = false;
                }
                if (!question.text || question.text.trim() === '') {
                  issues.push(`Empty question text in ${lang}/${category.id}.json at index ${index}`);
                  allValid = false;
                }
                if (question.category !== category.id) {
                  issues.push(`Category mismatch in ${lang}/${category.id}.json at index ${index}: expected "${category.id}", got "${question.category}"`);
                  allValid = false;
                }
              });
            } catch (error) {
              issues.push(`Invalid JSON in ${lang}/${category.id}.json: ${error.message}`);
              allValid = false;
            }
          } else {
            questionCounts[lang][category.id] = 0;
          }
        });
      }
    });
    
    // Compare question counts across languages
    const baseLanguage = 'de';
    if (questionCounts[baseLanguage]) {
      categoriesData.forEach(category => {
        const baseCo = questionCounts[baseLanguage][category.id] || 0;
        
        SUPPORTED_LANGUAGES.forEach(lang => {
          if (lang !== baseLanguage) {
            const langCount = questionCounts[lang]?.[category.id] || 0;
            const difference = Math.abs(baseCo - langCount);
            
            if (difference > 0) {
              console.warn(`  ⚠️ Question count mismatch for ${category.id}: ${baseLanguage}=${baseCo}, ${lang}=${langCount} (diff: ${difference})`);
            }
          }
        });
      });
    }
    
    // Report issues
    if (issues.length > 0) {
      console.error('\n❌ Translation issues found:');
      issues.forEach(issue => console.error(`  - ${issue}`));
    } else {
      console.log('✅ All translations appear complete and valid');
    }
    
  } catch (error) {
    console.error(`❌ Error verifying translations: ${error.message}`);
    allValid = false;
  }
  
  return allValid;
};

// Verify question ID consistency across languages
const verifyQuestionIdConsistency = () => {
  console.log('\n🔍 Verifying question ID consistency...');
  
  let allValid = true;
  
  try {
    const categoriesPath = path.join(QUESTIONS_DIR, 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    categoriesData.forEach(category => {
      const questionIdsByLanguage = {};
      
      // Collect question IDs for each language
      SUPPORTED_LANGUAGES.forEach(lang => {
        const langDir = path.join(QUESTIONS_DIR, lang);
        const categoryFile = path.join(langDir, `${category.id}.json`);
        
        if (fileExists(categoryFile)) {
          try {
            const questions = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
            questionIdsByLanguage[lang] = new Set(questions.map(q => q.questionId));
          } catch (error) {
            console.error(`  ❌ Error reading ${lang}/${category.id}.json: ${error.message}`);
            allValid = false;
          }
        } else {
          questionIdsByLanguage[lang] = new Set();
        }
      });
      
      // Find all unique question IDs
      const allQuestionIds = new Set();
      Object.values(questionIdsByLanguage).forEach(ids => {
        ids.forEach(id => allQuestionIds.add(id));
      });
      
      // Check for missing translations
      allQuestionIds.forEach(questionId => {
        const missingLanguages = SUPPORTED_LANGUAGES.filter(lang => 
          !questionIdsByLanguage[lang].has(questionId)
        );
        
        if (missingLanguages.length > 0) {
          console.warn(`  ⚠️ Question "${questionId}" in category "${category.id}" missing in: ${missingLanguages.join(', ')}`);
        }
      });
    });
    
    console.log('✅ Question ID consistency check completed');
    
  } catch (error) {
    console.error(`❌ Error verifying question ID consistency: ${error.message}`);
    allValid = false;
  }
  
  return allValid;
};

// Main verification function
const verifyAssets = () => {
  console.log('Verifying static assets...');
  
  let allValid = true;
  
  allValid = verifyCategoriesFile() && allValid;
  allValid = verifyLanguageDirectories() && allValid;
  allValid = verifyPWAIcons() && allValid;
  allValid = verifyGameJson() && allValid;
  allValid = verifyCNAME() && allValid;
  
  // Verify dist if requested
  if (verifyDist) {
    allValid = verifyDistDirectory() && allValid;
  }
  
  // Verify translations
  allValid = verifyTranslations() && allValid;
  allValid = verifyQuestionIdConsistency() && allValid;
  
  if (allValid) {
    console.log('\n✅ All critical assets verified successfully!');
  } else {
    console.error('\n❌ Some critical assets are missing. See errors above.');
  }
  
  return allValid;
};

// Run verification
verifyAssets();
