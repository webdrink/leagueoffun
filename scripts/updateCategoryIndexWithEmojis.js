/**
 * Script to update the category index with emoji information
 * This allows us to consolidate category data in one place
 */

const fs = require('fs');
const path = require('path');

// Read the files
const indexPath = path.join(__dirname, '..', 'public', 'categories', 'index.json');
const categoriesPath = path.join(__dirname, '..', 'public', 'categories.json');

let categoryIndex;
let categories;

try {
  categoryIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  
  console.log(`Read ${categoryIndex.length} categories from index`);
  console.log(`Read ${categories.length} category emoji mappings`);
} catch (error) {
  console.error('Error reading files:', error);
  process.exit(1);
}

// Create a map of category names to emojis
const emojiMap = {};
categories.forEach(cat => {
  emojiMap[cat.category] = cat.emoji;
});

// Update the category index with emojis
const updatedIndex = categoryIndex.map(indexItem => {
  const emoji = emojiMap[indexItem.name] || "❓"; // Use question mark as fallback
  return {
    ...indexItem,
    emoji
  };
});

try {
  fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2));
  console.log(`Updated ${updatedIndex.length} categories with emoji information`);
} catch (error) {
  console.error('Error writing updated index:', error);
  process.exit(1);
}

console.log('Category index update complete!');
