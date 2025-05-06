/**
 * Script to convert blamegame_questions.csv to JSON format
 * 
 * This script reads the CSV file containing Blame Game questions,
 * converts it to a structured JSON array, and saves the result
 * to src/data/questions.json for improved offline support.
 */

const fs = require('fs');
const path = require('path');

// Paths
const csvPath = path.join(__dirname, '..', 'blamegame_questions.csv');
const outputDir = path.join(__dirname, '..', 'src', 'data');
const outputPath = path.join(outputDir, 'questions.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Parse CSV (assuming format: Category;Question)
  const lines = csvContent.split('\n').filter(line => 
    line.trim() !== '' && !line.startsWith('//'));
  
  // Skip header if it exists
  const headerIndex = lines.findIndex(line => 
    line.toLowerCase().includes('kategorie') || 
    line.toLowerCase().includes('frage'));
  
  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;
  
  // Convert to JSON structure
  const questions = dataLines.map(line => {
    const parts = line.split(';');
    return {
      category: parts[0]?.trim() || 'Unbekannt',
      text: parts[1]?.trim() || 'Keine Frage gefunden'
    };
  }).filter(q => q.category !== 'Unbekannt' && q.text !== 'Keine Frage gefunden');
  
  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
  
  console.log(`✅ Successfully converted ${questions.length} questions to JSON`);
  console.log(`📁 Output saved to: ${outputPath}`);
} catch (error) {
  console.error('❌ Error converting CSV to JSON:', error);
  process.exit(1);
}
