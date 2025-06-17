/**
 * auto-translate.js
 * 
 * Automatic translation system for Blame Game
 * Analyzes categories and questions across all languages (de, en, es, fr)
 * Uses OpenAI API to translate missing content
 * Maintains consistency across all language files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  languages: ['de', 'en', 'es', 'fr'],
  baseLanguage: 'de', // Primary language to translate from if available
  fallbackLanguage: 'en', // Secondary language to translate from
  openaiModel: 'gpt-3.5-turbo',
  maxTokens: 150,
  temperature: 0.3,
  batchSize: 10, // Questions to translate per API call
  backupEnabled: true,
  dryRun: false // Set to true to preview changes without applying them
};

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const QUESTIONS_DIR = path.join(PROJECT_ROOT, 'public', 'questions');
const CATEGORIES_FILE = path.join(QUESTIONS_DIR, 'categories.json');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'translation-backups');

// Language mappings for better context
const LANGUAGE_NAMES = {
  de: 'German',
  en: 'English', 
  es: 'Spanish',
  fr: 'French'
};

class TranslationService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.requestCount = 0;
    this.maxRequestsPerMinute = 50; // Conservative rate limit
    this.requestTimes = [];
  }

  async translateText(text, targetLanguage, context = '') {
    await this.checkRateLimit();
    
    const systemPrompt = `You are a professional translator specializing in party game content. 
    Translate the following text to ${LANGUAGE_NAMES[targetLanguage]}. 
    Keep the fun, casual tone appropriate for a party game called "Blame Game" where players assign funny scenarios to each other.
    Maintain any humor and make it culturally appropriate for ${LANGUAGE_NAMES[targetLanguage]} speakers.
    Context: ${context}
    
    Only return the translated text, nothing else.`;

    const payload = {
      model: CONFIG.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              reject(new Error(`OpenAI API Error: ${response.error.message}`));
              return;
            }
            
            const translatedText = response.choices?.[0]?.message?.content?.trim();
            if (!translatedText) {
              reject(new Error('Empty translation response'));
              return;
            }
            
            this.requestCount++;
            this.requestTimes.push(Date.now());
            resolve(translatedText);
          } catch (error) {
            reject(new Error(`Failed to parse OpenAI response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  async checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      const waitTime = this.requestTimes[0] + 60000 - now;
      console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  async translateBatch(items, targetLanguage, context = '') {
    const results = [];
    for (const item of items) {
      try {
        const translated = await this.translateText(item.text, targetLanguage, context);
        results.push({ ...item, translatedText: translated });
        console.log(`✅ Translated: "${item.text}" -> "${translated}" (${targetLanguage})`);
      } catch (error) {
        console.error(`❌ Translation failed for "${item.text}": ${error.message}`);
        results.push({ ...item, translatedText: null, error: error.message });
      }
    }
    return results;
  }
}

class CategoryAnalyzer {
  constructor() {
    this.categories = [];
    this.languageFiles = {};
    this.issues = [];
  }

  async loadCategories() {
    try {
      const categoriesData = fs.readFileSync(CATEGORIES_FILE, 'utf8');
      this.categories = JSON.parse(categoriesData);
      console.log(`📋 Loaded ${this.categories.length} categories`);
    } catch (error) {
      throw new Error(`Failed to load categories.json: ${error.message}`);
    }
  }

  async analyzeCategoryFiles() {
    console.log('🔍 Analyzing category files across languages...');
    
    for (const language of CONFIG.languages) {
      const langDir = path.join(QUESTIONS_DIR, language);
      this.languageFiles[language] = {};
      
      if (!fs.existsSync(langDir)) {
        console.warn(`⚠️ Language directory missing: ${language}`);
        this.issues.push(`Missing language directory: ${language}`);
        continue;
      }

      // Check each category
      for (const category of this.categories) {
        const categoryFile = path.join(langDir, `${category.id}.json`);
        
        if (fs.existsSync(categoryFile)) {
          try {
            const fileData = fs.readFileSync(categoryFile, 'utf8');
            this.languageFiles[language][category.id] = JSON.parse(fileData);
            console.log(`✅ Loaded ${language}/${category.id}.json (${this.languageFiles[language][category.id].length} questions)`);
          } catch (error) {
            console.error(`❌ Failed to parse ${language}/${category.id}.json: ${error.message}`);
            this.issues.push(`Invalid JSON in ${language}/${category.id}.json: ${error.message}`);
          }
        } else {
          console.warn(`⚠️ Missing file: ${language}/${category.id}.json`);
          this.issues.push(`Missing file: ${language}/${category.id}.json`);
          this.languageFiles[language][category.id] = [];
        }
      }
    }
  }

  getMissingTranslations() {
    const missing = {};
    
    for (const language of CONFIG.languages) {
      missing[language] = {};
      
      for (const category of this.categories) {
        missing[language][category.id] = [];
        
        // Get questions from base language
        const baseQuestions = this.getQuestionsForCategory(category.id, CONFIG.baseLanguage) ||
                             this.getQuestionsForCategory(category.id, CONFIG.fallbackLanguage) ||
                             [];
        
        const currentQuestions = this.languageFiles[language]?.[category.id] || [];
        const currentQuestionIds = new Set(currentQuestions.map(q => q.questionId));
        
        // Find missing questions
        for (const baseQuestion of baseQuestions) {
          if (!currentQuestionIds.has(baseQuestion.questionId)) {
            missing[language][category.id].push(baseQuestion);
          }
        }
      }
    }
    
    return missing;
  }

  getMissingCategories() {
    const missing = {};
    
    for (const language of CONFIG.languages) {
      missing[language] = [];
      
      for (const category of this.categories) {
        if (!this.languageFiles[language]?.[category.id] || 
            this.languageFiles[language][category.id].length === 0) {
          missing[language].push(category.id);
        }
      }
    }
    
    return missing;
  }

  getQuestionsForCategory(categoryId, language) {
    return this.languageFiles[language]?.[categoryId] || null;
  }

  updateCategoriesJson(translatedCategories) {
    // Update categories.json with new translations
    const updatedCategories = [...this.categories];
    
    for (const [language, categoryTranslations] of Object.entries(translatedCategories)) {
      for (const [categoryId, translation] of Object.entries(categoryTranslations)) {
        const categoryIndex = updatedCategories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex][language] = translation;
        }
      }
    }
    
    if (!CONFIG.dryRun) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(updatedCategories, null, 2));
      console.log('✅ Updated categories.json');
    }
    
    return updatedCategories;
  }
}

class TranslationManager {
  constructor(apiKey) {
    this.translationService = new TranslationService(apiKey);
    this.analyzer = new CategoryAnalyzer();
    this.backupCreated = false;
  }

  async createBackup() {
    if (!CONFIG.backupEnabled || this.backupCreated) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Copy entire questions directory
    const copyDir = (src, dest) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyDir(QUESTIONS_DIR, backupPath);
    this.backupCreated = true;
    console.log(`📁 Backup created: ${backupPath}`);
  }

  async run() {
    try {
      console.log('🚀 Starting automatic translation process...');
      
      // Create backup
      await this.createBackup();
      
      // Load and analyze
      await this.analyzer.loadCategories();
      await this.analyzer.analyzeCategoryFiles();
      
      // Check for missing categories in categories.json
      await this.translateMissingCategoryNames();
      
      // Translate missing questions
      await this.translateMissingQuestions();
      
      console.log('✅ Translation process completed successfully!');
      
      if (this.analyzer.issues.length > 0) {
        console.log('\n⚠️ Issues encountered:');
        this.analyzer.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
    } catch (error) {
      console.error('❌ Translation process failed:', error.message);
      throw error;
    }
  }

  async translateMissingCategoryNames() {
    console.log('🏷️ Checking category name translations...');
    
    const missingCategoryTranslations = {};
    
    for (const category of this.analyzer.categories) {
      for (const language of CONFIG.languages) {
        if (!category[language] || category[language].trim() === '') {
          if (!missingCategoryTranslations[language]) {
            missingCategoryTranslations[language] = {};
          }
          
          // Find source text from base or fallback language
          const sourceText = category[CONFIG.baseLanguage] || category[CONFIG.fallbackLanguage];
          if (sourceText) {
            missingCategoryTranslations[language][category.id] = sourceText;
          }
        }
      }
    }
    
    // Translate missing category names
    for (const [language, categories] of Object.entries(missingCategoryTranslations)) {
      console.log(`🌍 Translating category names to ${LANGUAGE_NAMES[language]}...`);
      
      for (const [categoryId, sourceText] of Object.entries(categories)) {
        try {
          const translation = await this.translationService.translateText(
            sourceText, 
            language, 
            'Category name for a party game'
          );
          
          if (!CONFIG.dryRun) {
            const categoryIndex = this.analyzer.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex !== -1) {
              this.analyzer.categories[categoryIndex][language] = translation;
            }
          }
          
          console.log(`✅ Category "${categoryId}": "${sourceText}" -> "${translation}" (${language})`);
        } catch (error) {
          console.error(`❌ Failed to translate category "${categoryId}" to ${language}: ${error.message}`);
        }
      }
    }
    
    // Update categories.json
    if (!CONFIG.dryRun) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(this.analyzer.categories, null, 2));
      console.log('✅ Updated categories.json with new translations');
    }
  }

  async translateMissingQuestions() {
    console.log('❓ Analyzing missing question translations...');
    
    const missingTranslations = this.analyzer.getMissingTranslations();
    let totalMissing = 0;
    
    // Count total missing translations
    for (const [language, categories] of Object.entries(missingTranslations)) {
      for (const [categoryId, questions] of Object.entries(categories)) {
        totalMissing += questions.length;
      }
    }
    
    if (totalMissing === 0) {
      console.log('✅ All translations are up to date!');
      return;
    }
    
    console.log(`📊 Found ${totalMissing} missing translations`);
    
    // Process each language
    for (const [language, categories] of Object.entries(missingTranslations)) {
      if (language === CONFIG.baseLanguage) continue; // Skip base language
      
      console.log(`\n🌍 Processing ${LANGUAGE_NAMES[language]}...`);
      
      for (const [categoryId, missingQuestions] of Object.entries(categories)) {
        if (missingQuestions.length === 0) continue;
        
        console.log(`  📂 Category: ${categoryId} (${missingQuestions.length} missing)`);
        
        // Translate questions in batches
        const batches = [];
        for (let i = 0; i < missingQuestions.length; i += CONFIG.batchSize) {
          batches.push(missingQuestions.slice(i, i + CONFIG.batchSize));
        }
        
        const translatedQuestions = [];
        for (const batch of batches) {
          const results = await this.translationService.translateBatch(
            batch, 
            language, 
            `Questions for "${categoryId}" category in a party game`
          );
          
          for (const result of results) {
            if (result.translatedText) {
              translatedQuestions.push({
                questionId: result.questionId,
                text: result.translatedText,
                category: categoryId
              });
            }
          }
        }
        
        // Update language file
        if (translatedQuestions.length > 0 && !CONFIG.dryRun) {
          const langDir = path.join(QUESTIONS_DIR, language);
          if (!fs.existsSync(langDir)) {
            fs.mkdirSync(langDir, { recursive: true });
          }
          
          const categoryFile = path.join(langDir, `${categoryId}.json`);
          const existingQuestions = this.analyzer.languageFiles[language]?.[categoryId] || [];
          const updatedQuestions = [...existingQuestions, ...translatedQuestions];
          
          fs.writeFileSync(categoryFile, JSON.stringify(updatedQuestions, null, 2));
          console.log(`    ✅ Added ${translatedQuestions.length} translations to ${language}/${categoryId}.json`);
        }
      }
    }
  }
}

// Main execution
async function main() {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable is required');
      console.log('Set it with: export OPENAI_API_KEY="your-api-key-here"');
      process.exit(1);
    }
    
    // Parse command line arguments
    if (process.argv.includes('--dry-run')) {
      CONFIG.dryRun = true;
      console.log('🔍 Running in DRY RUN mode - no changes will be made');
    }
    
    if (process.argv.includes('--no-backup')) {
      CONFIG.backupEnabled = false;
      console.log('⚠️ Backup disabled');
    }
    
    // Run translation manager
    const manager = new TranslationManager(apiKey);
    await manager.run();
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TranslationManager, CategoryAnalyzer, TranslationService };
