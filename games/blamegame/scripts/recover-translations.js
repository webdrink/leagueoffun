/**
 * recover-translations.js
 * 
 * Recovery script to restore translations from a saved results file
 * Useful when the translation process completes but subsequent steps fail
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const QUESTIONS_DIR = path.join(PROJECT_ROOT, 'public', 'questions');
const RESULTS_FILE = path.join(PROJECT_ROOT, 'translation-results.json');

async function recoverTranslations() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error('❌ No translation results file found');
    process.exit(1);
  }

  try {
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    
    console.log('📄 Loading translation results...');
    console.log(`  Status: ${results.status}`);
    console.log(`  Translations: ${results.translationsCompleted}`);
    console.log(`  Tokens used: ~${results.totalTokensUsed}`);
    
    if (!results.translatedQuestions) {
      console.error('❌ No translation data found in results file');
      process.exit(1);
    }

    let restoredFiles = 0;
    for (const [language, categories] of Object.entries(results.translatedQuestions)) {
      const langDir = path.join(QUESTIONS_DIR, language);
      
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      for (const [categoryId, questions] of Object.entries(categories)) {
        if (questions.length === 0) continue;
        
        const categoryFile = path.join(langDir, `${categoryId}.json`);
        
        // Read existing questions if file exists
        let existingQuestions = [];
        if (fs.existsSync(categoryFile)) {
          existingQuestions = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
        }
        
        // Merge questions
        const existingIds = new Set(existingQuestions.map(q => q.questionId));
        const newQuestions = questions.filter(q => !existingIds.has(q.questionId));
        
        if (newQuestions.length > 0) {
          const updatedQuestions = [...existingQuestions, ...newQuestions];
          fs.writeFileSync(categoryFile, JSON.stringify(updatedQuestions, null, 2));
          console.log(`✅ Restored ${newQuestions.length} questions to ${language}/${categoryId}.json`);
          restoredFiles++;
        }
      }
    }
    
    console.log(`\n✅ Recovery complete! Restored ${restoredFiles} files`);
    
  } catch (error) {
    console.error('❌ Recovery failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  recoverTranslations();
}

module.exports = { recoverTranslations };
