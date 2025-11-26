#!/usr/bin/env node

/**
 * Fix question files by adding missing category fields
 * and removing BOM characters
 */

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['en', 'es', 'fr'];
const QUESTIONS_DIR = path.join(__dirname, '..', 'public', 'questions');

function fixQuestionFiles() {
  console.log('🔧 Fixing question files...');
  
  LANGUAGES.forEach(language => {
    const languageDir = path.join(QUESTIONS_DIR, language);
    
    if (!fs.existsSync(languageDir)) {
      console.log(`⚠️ Language directory not found: ${language}`);
      return;
    }
    
    const files = fs.readdirSync(languageDir).filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      const categoryName = path.basename(file, '.json');
      const filePath = path.join(languageDir, file);
      
      console.log(`Processing ${language}/${file} with category '${categoryName}'...`);
      
      try {
        // Read file content and remove BOM
        let rawContent = fs.readFileSync(filePath, 'utf8');
        
        // Remove BOM if present
        if (rawContent.charCodeAt(0) === 0xFEFF) {
          rawContent = rawContent.slice(1);
          console.log(`  ✅ Removed BOM from ${file}`);
        }
        
        // Parse JSON
        const questions = JSON.parse(rawContent);
        
        if (!Array.isArray(questions)) {
          console.log(`  ⚠️ ${file} is not an array of questions`);
          return;
        }
        
        let modified = false;
        
        // Add category field to each question if missing or incorrect
        questions.forEach((question, index) => {
          if (!question.category || question.category !== categoryName) {
            question.category = categoryName;
            modified = true;
          }
        });
        
        if (modified) {
          // Write back with proper formatting (no BOM)
          const jsonOutput = JSON.stringify(questions, null, 2);
          fs.writeFileSync(filePath, jsonOutput, 'utf8');
          console.log(`  ✅ Fixed ${file} - Added/corrected category fields`);
        } else {
          // Still write to ensure no BOM
          const jsonOutput = JSON.stringify(questions, null, 2);
          fs.writeFileSync(filePath, jsonOutput, 'utf8');
          console.log(`  ✅ ${file} already has correct category fields (ensured no BOM)`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing ${file}: ${error.message}`);
      }
    });
  });
  
  console.log('\n🎉 Finished fixing question files!');
}

if (require.main === module) {
  fixQuestionFiles();
}

module.exports = { fixQuestionFiles };
