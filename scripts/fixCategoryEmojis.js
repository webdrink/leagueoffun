/**
 * Script to fix emoji encoding issues in the category index file
 * This script reads from categories.json and properly encodes emojis in the index.json file
 */

const fs = require('fs');
const path = require('path');

// Define paths
const categoriesPath = path.join(__dirname, '../public/categories.json');
const indexPath = path.join(__dirname, '../public/categories/index.json');

try {
  // Read the source files
  const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  console.log(`Loaded ${categories.length} categories and ${index.length} index entries`);
  
  // Create emoji mapping
  const emojiMap = {};
  categories.forEach(cat => {
    emojiMap[cat.category] = cat.emoji;
  });
  
  // Update each item in the index
  let updatedCount = 0;
  index.forEach(item => {
    if (emojiMap[item.name]) {
      item.emoji = emojiMap[item.name];
      updatedCount++;
    } else {
      console.log(`No emoji found for category: ${item.name}`);
      item.emoji = "❓"; // Default emoji if not found
    }
  });
  
  // Save back to file with proper UTF-8 encoding
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} category emojis and saved to index.json`);
} catch (error) {
  console.error('Error updating category emojis:', error);
}
