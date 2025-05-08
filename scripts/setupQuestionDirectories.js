/**
 * Script to create language-specific question directories
 * 
 * This script:
 * 1. Creates a directory for each supported language
 * 2. Creates empty question files for each category (optional)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const QUESTIONS_DIR = path.join(__dirname, '../public/questions');
const CATEGORIES_DIR = path.join(__dirname, '../public/categories');
const DEFAULT_CATEGORIES = path.join(CATEGORIES_DIR, 'index.json');
const LANGUAGES = ['de', 'en', 'es', 'fr'];

// Create the base questions directory if it doesn't exist
if (!fs.existsSync(QUESTIONS_DIR)) {
  fs.mkdirSync(QUESTIONS_DIR);
  console.log(`Created directory: ${QUESTIONS_DIR}`);
}

// Create language subdirectories
LANGUAGES.forEach(lang => {
  const langDir = path.join(QUESTIONS_DIR, lang);
  
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir);
    console.log(`Created directory: ${langDir}`);
  }
});

// Optionally create empty question files for each category
// Only if the default categories file exists
if (fs.existsSync(DEFAULT_CATEGORIES)) {
  try {
    const categories = JSON.parse(fs.readFileSync(DEFAULT_CATEGORIES, 'utf8'));
    
    // Create empty files for German (source language)
    const deDir = path.join(QUESTIONS_DIR, 'de');
    categories.forEach(category => {
      if (category.id && category.fileName) {
        const filePath = path.join(deDir, category.fileName);
        
        // Only create if it doesn't exist
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
          console.log(`Created empty question file: ${filePath}`);
        }
      }
    });
    
    console.log('Question directory structure created successfully!');
  } catch (err) {
    console.error('Error creating question files:', err);
  }
}