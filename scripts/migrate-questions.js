/**
 * Script to migrate questions from old category-based files to the new structure
 * 
 * This script:
 * 1. Reads all questions from existing category files in public/categories
 * 2. Extracts and processes the questions
 * 3. Creates new language-specific question files in public/questions/{lang}/{category}.json
 * 
 * Run with: node scripts/migrate-questions.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const CATEGORIES_DIR = path.join(__dirname, '../public/categories');
const QUESTIONS_DIR = path.join(__dirname, '../public/questions');

// Languages to generate
const LANGUAGES = ['de', 'en'];

// Make sure the questions directory exists for each language
LANGUAGES.forEach(lang => {
  const langDir = path.join(QUESTIONS_DIR, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
});

// Read all category files
const categoryFiles = fs.readdirSync(CATEGORIES_DIR).filter(file => 
  file.endsWith('.json') && !file.startsWith('index')
);

// Process each category file
categoryFiles.forEach(categoryFile => {
  const categoryId = path.basename(categoryFile, '.json');
  console.log(`Processing category: ${categoryId}`);
  
  // Read the category file
  const categoryFilePath = path.join(CATEGORIES_DIR, categoryFile);
  const categoryData = JSON.parse(fs.readFileSync(categoryFilePath, 'utf8'));
  
  // Extract questions
  const questions = categoryData.filter(item => item.text);
  
  // Skip if no questions found
  if (questions.length === 0) {
    console.log(`No questions found in ${categoryFile}, skipping...`);
    return;
  }
  
  // Process questions for each language
  LANGUAGES.forEach(lang => {
    console.log(`Creating ${lang} question file for ${categoryId}`);
    
    // Create language-specific question files
    const questionFilePath = path.join(QUESTIONS_DIR, lang, `${categoryId}.json`);
    
    // Transform questions to the new format
    const transformedQuestions = questions.map(q => {
      // Generate a questionId from the text (for German, we'll use a simple approach)
      // In a real scenario, you might want a more sophisticated mapping between languages
      const questionId = q.text
        .toLowerCase()
        .replace(/[^a-z0-9üäöß ]/g, '')
        .replace(/[üäöß]/g, m => ({ 'ü': 'u', 'ä': 'a', 'ö': 'o', 'ß': 'ss' }[m]))
        .replace(/\s+/g, '_')
        .substring(0, 50); // Limit the length
      
      return {
        questionId,
        text: q.text,
        category: categoryId
      };
    });
    
    // Write the transformed questions to the new file
    fs.writeFileSync(
      questionFilePath, 
      JSON.stringify(transformedQuestions, null, 2),
      'utf8'
    );
    
    console.log(`✅ Created ${transformedQuestions.length} questions in ${questionFilePath}`);
  });
});

console.log('Migration completed! 🎉');