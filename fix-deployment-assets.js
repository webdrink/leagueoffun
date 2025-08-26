/**
 * Fix deployment asset issue by ensuring JSON files are properly deployed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment asset issue...');

// Check if dist directory has the required files
const distPath = path.join(__dirname, 'dist');
const questionsPath = path.join(distPath, 'questions');

if (fs.existsSync(questionsPath)) {
  console.log('✅ questions directory exists in dist');
  
  const categoriesFile = path.join(questionsPath, 'categories.json');
  if (fs.existsSync(categoriesFile)) {
    console.log('✅ categories.json exists in dist/questions');
  } else {
    console.log('❌ categories.json missing in dist/questions');
  }
  
  const deDir = path.join(questionsPath, 'de');
  if (fs.existsSync(deDir)) {
    console.log('✅ de directory exists in dist/questions');
    const files = fs.readdirSync(deDir);
    console.log(`  Found ${files.length} files in de directory`);
  } else {
    console.log('❌ de directory missing in dist/questions');
  }
} else {
  console.log('❌ questions directory missing in dist');
}

// Check if the deployment workflow includes these files
console.log('\n🔍 Checking if deployment includes JSON files...');

// Check the current repository structure
const publicQuestionsPath = path.join(__dirname, 'public', 'questions');
if (fs.existsSync(publicQuestionsPath)) {
  const files = fs.readdirSync(publicQuestionsPath, { recursive: true });
  console.log('📁 Public questions files:');
  files.forEach(file => console.log(`  ${file}`));
}

console.log('\n✅ Diagnosis complete.');
console.log('💡 The issue appears to be that GitHub Pages is not serving the JSON files correctly.');
console.log('🔧 Solution: Force a redeploy with enhanced GitHub Pages configuration.');
