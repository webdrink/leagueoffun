/**
 * validate-translations.js
 * 
 * Simple validation script for CI/CD pipelines
 * Checks translation completeness without requiring OpenAI API
 * Returns exit code 0 if all translations are complete, 1 if issues found
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUPPORTED_LANGUAGES = ['de', 'en', 'es', 'fr'];
const PROJECT_ROOT = path.join(__dirname, '..');
const QUESTIONS_DIR = path.join(PROJECT_ROOT, 'public', 'questions');
const CATEGORIES_FILE = path.join(QUESTIONS_DIR, 'categories.json');

class ValidationReporter {
  constructor() {
    this.warnings = [];
    this.errors = [];
    this.infoMessages = [];
  }

  warn(message) {
    this.warnings.push(message);
    console.warn(`⚠️ ${message}`);
  }

  error(message) {
    this.errors.push(message);
    console.error(`❌ ${message}`);
  }

  info(message) {
    this.infoMessages.push(message);
    console.log(`ℹ️ ${message}`);
  }
  summary() {
    console.log('\n📊 Validation Summary:');
    console.log(`  - Info: ${this.infoMessages.length}`);
    console.log(`  - Warnings: ${this.warnings.length}`);
    console.log(`  - Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Critical errors found:');
      this.errors.forEach(error => console.log(`    ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      this.warnings.forEach(warning => console.log(`    ${warning}`));
    }
    
    return this.errors.length === 0;
  }
}

function loadCategories() {
  try {
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to load categories.json: ${error.message}`);
  }
}

function validateCategoryTranslations(categories, reporter) {
  reporter.info(`Validating ${categories.length} categories`);
  
  categories.forEach(category => {
    if (!category.id) {
      reporter.error('Category missing ID');
      return;
    }
    
    SUPPORTED_LANGUAGES.forEach(language => {
      if (!category[language] || category[language].trim() === '') {
        reporter.error(`Category "${category.id}" missing ${language} translation`);
      }
    });
  });
}

function validateQuestionFiles(categories, reporter) {
  const questionCounts = {};
  
  // Initialize counts
  SUPPORTED_LANGUAGES.forEach(lang => {
    questionCounts[lang] = {};
  });
  
  // Check each language directory
  SUPPORTED_LANGUAGES.forEach(language => {
    const langDir = path.join(QUESTIONS_DIR, language);
    
    if (!fs.existsSync(langDir)) {
      reporter.error(`Language directory missing: ${language}`);
      return;
    }
    
    // Check each category file
    categories.forEach(category => {
      const categoryFile = path.join(langDir, `${category.id}.json`);
      
      if (!fs.existsSync(categoryFile)) {
        reporter.error(`Question file missing: ${language}/${category.id}.json`);
        questionCounts[language][category.id] = 0;
        return;
      }
      
      try {
        const questions = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
        questionCounts[language][category.id] = questions.length;
        
        // Validate question structure
        questions.forEach((question, index) => {
          if (!question.questionId) {
            reporter.error(`Missing questionId in ${language}/${category.id}.json at index ${index}`);
          }
          
          if (!question.text || question.text.trim() === '') {
            reporter.error(`Empty question text in ${language}/${category.id}.json at index ${index}`);
          }
          
          if (question.category !== category.id) {
            reporter.error(`Category mismatch in ${language}/${category.id}.json at index ${index}: expected "${category.id}", got "${question.category}"`);
          }
        });
        
        reporter.info(`Loaded ${questions.length} questions from ${language}/${category.id}.json`);
        
      } catch (error) {
        reporter.error(`Invalid JSON in ${language}/${category.id}.json: ${error.message}`);
        questionCounts[language][category.id] = 0;
      }
    });
  });
  
  return questionCounts;
}

function validateQuestionConsistency(categories, questionCounts, reporter) {
  const baseLanguage = 'de';
  
  categories.forEach(category => {
    const categoryId = category.id;
    const baseCount = questionCounts[baseLanguage]?.[categoryId] || 0;
    
    if (baseCount === 0) {
      reporter.warn(`No questions found in base language (${baseLanguage}) for category: ${categoryId}`);
      return;
    }
    
    // Compare with other languages
    SUPPORTED_LANGUAGES.forEach(language => {
      if (language === baseLanguage) return;
      
      const langCount = questionCounts[language]?.[categoryId] || 0;
      const difference = Math.abs(baseCount - langCount);
      
      if (langCount === 0) {
        reporter.error(`No questions found in ${language} for category: ${categoryId}`);
      } else if (difference > 0) {
        const percentage = Math.round((difference / baseCount) * 100);
        if (percentage > 20) {
          reporter.error(`Significant question count difference for ${categoryId}: ${baseLanguage}=${baseCount}, ${language}=${langCount} (${percentage}% difference)`);
        } else {
          reporter.warn(`Question count difference for ${categoryId}: ${baseLanguage}=${baseCount}, ${language}=${langCount} (${percentage}% difference)`);
        }
      }
    });
  });
}

function validateQuestionIds(categories, reporter) {
  categories.forEach(category => {
    const categoryId = category.id;
    const questionIdsByLanguage = {};
    
    // Collect question IDs for each language
    SUPPORTED_LANGUAGES.forEach(language => {
      const langDir = path.join(QUESTIONS_DIR, language);
      const categoryFile = path.join(langDir, `${categoryId}.json`);
      
      if (fs.existsSync(categoryFile)) {
        try {
          const questions = JSON.parse(fs.readFileSync(categoryFile, 'utf8'));
          questionIdsByLanguage[language] = new Set(questions.map(q => q.questionId));
        } catch (error) {
          questionIdsByLanguage[language] = new Set();
        }
      } else {
        questionIdsByLanguage[language] = new Set();
      }
    });
    
    // Find all unique question IDs
    const allQuestionIds = new Set();
    Object.values(questionIdsByLanguage).forEach(ids => {
      ids.forEach(id => allQuestionIds.add(id));
    });
    
    // Check for missing translations
    allQuestionIds.forEach(questionId => {
      const presentLanguages = SUPPORTED_LANGUAGES.filter(lang => 
        questionIdsByLanguage[lang].has(questionId)
      );
      
      const missingLanguages = SUPPORTED_LANGUAGES.filter(lang => 
        !questionIdsByLanguage[lang].has(questionId)
      );
      
      if (missingLanguages.length > 0) {
        if (presentLanguages.length === 1) {
          reporter.info(`Question "${questionId}" in ${categoryId} only exists in: ${presentLanguages.join(', ')}`);
        } else {
          reporter.warn(`Question "${questionId}" in ${categoryId} missing translations for: ${missingLanguages.join(', ')}`);
        }
      }
    });
  });
}

async function main() {
  const reporter = new ValidationReporter();
  
  try {
    console.log('🔍 Validating translation completeness...\n');
    
    // Load categories
    const categories = loadCategories();
    reporter.info(`Found ${categories.length} categories in categories.json`);
    
    // Validate category translations
    validateCategoryTranslations(categories, reporter);
    
    // Validate question files
    const questionCounts = validateQuestionFiles(categories, reporter);
    
    // Validate question consistency
    validateQuestionConsistency(categories, questionCounts, reporter);
    
    // Validate question ID consistency
    validateQuestionIds(categories, reporter);
    
    // Generate summary
    const isValid = reporter.summary();
    
    if (isValid) {
      console.log('\n✅ All translations validated successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Translation validation failed!');
      console.log('Run "npm run translate:check" to see what needs translation.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`💥 Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ValidationReporter };
