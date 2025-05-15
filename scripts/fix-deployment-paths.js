/**
 * fix-deployment-paths.js
 * 
 * This script fixes path issues in the build output for deployment to a custom domain.
 * It ensures all paths are correctly formatted for both GitHub Pages and custom domain.
 * 
 * Run this script after the build process: node scripts/fix-deployment-paths.js
 */

const fs = require('fs');
const path = require('path');

// Define paths
const DIST_DIR = path.join(__dirname, '..', 'dist');
const CNAME_PATH = path.join(DIST_DIR, 'CNAME');

// Recursively find all files of a certain extension
const findAllFiles = (dirPath, extension) => {
  let results = [];
  
  // Get all files in the directory
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // If it's a directory, recursively search it
      results = results.concat(findAllFiles(itemPath, extension));
    } else if (item.endsWith(extension)) {
      // If it's a file with the right extension, add it
      results.push(itemPath);
    }
  }
  
  return results;
};

// Ensure the CNAME file exists
const ensureCNAME = () => {
  try {
    if (!fs.existsSync(CNAME_PATH)) {
      console.log('Creating CNAME file in dist directory...');
      fs.writeFileSync(CNAME_PATH, 'blamegame.leagueoffun.de');
      console.log('✅ CNAME file created successfully');
    } else {
      console.log('✅ CNAME file already exists');
    }
  } catch (error) {
    console.error('❌ Error creating CNAME file:', error);
  }
};

// Fix absolute paths in HTML files
const fixHtmlPaths = () => {
  try {
    // Find all HTML files in the dist directory and subdirectories
    const htmlFiles = findAllFiles(DIST_DIR, '.html');
    
    if (htmlFiles.length === 0) {
      console.error('❌ No HTML files found in dist directory');
      return;
    }
    
    console.log(`Found ${htmlFiles.length} HTML files to check...`);
    
    let fixedFiles = 0;
    
    htmlFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix absolute paths that incorrectly reference /blamegame/
      content = content.replace(/("|\s)(\/blamegame\/)/g, '$1/');
      
      // Write the file back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        fixedFiles++;
        console.log(`✅ Fixed paths in: ${path.relative(DIST_DIR, filePath)}`);
      }
    });
    
    console.log(`✅ Fixed paths in ${fixedFiles} HTML files`);
  } catch (error) {
    console.error('❌ Error fixing HTML paths:', error);
  }
};

// Fix JSON paths in JavaScript files
const fixJsAssetPaths = () => {
  try {
    // Find all JS files in the dist directory and subdirectories
    const jsFiles = findAllFiles(DIST_DIR, '.js');
    
    console.log(`Found ${jsFiles.length} JS files to check...`);
    
    let fixedFiles = 0;
    
    jsFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix paths in JavaScript that might reference /blamegame/questions/
      content = content.replace(/("|\s)(\/blamegame\/questions\/)/g, '$1/questions/');
      
      // Write the file back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        fixedFiles++;
        console.log(`✅ Fixed paths in: ${path.relative(DIST_DIR, filePath)}`);
      }
    });
    
    console.log(`✅ Fixed paths in ${fixedFiles} JS files`);
  } catch (error) {
    console.error('❌ Error fixing JS asset paths:', error);
  }
};

// Fix other asset references in all files
const fixAssetReferences = () => {
  try {
    // Combine common file types that might contain asset references
    const allFiles = [
      ...findAllFiles(DIST_DIR, '.css'),
      ...findAllFiles(DIST_DIR, '.json')
    ];
    
    console.log(`Found ${allFiles.length} additional files to check for asset references...`);
    
    let fixedFiles = 0;
    
    allFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix any asset references with /blamegame/ prefix
      content = content.replace(/("|\s|:)(\/blamegame\/assets\/)/g, '$1/assets/');
      content = content.replace(/("|\s|:)(\/blamegame\/public\/)/g, '$1/public/');
      content = content.replace(/("|\s|:)(\/blamegame\/questions\/)/g, '$1/questions/');
      
      // Write the file back if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        fixedFiles++;
        console.log(`✅ Fixed paths in: ${path.relative(DIST_DIR, filePath)}`);
      }
    });
    
    console.log(`✅ Fixed paths in ${fixedFiles} additional files`);
  } catch (error) {
    console.error('❌ Error fixing asset references:', error);
  }
};

// Main function
const fixDeploymentPaths = () => {
  console.log('Fixing deployment paths for custom domain...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  ensureCNAME();
  fixHtmlPaths();
  fixJsAssetPaths();
  fixAssetReferences();
  
  console.log('✅ Deployment path fixes completed');
};

// Run the fix
fixDeploymentPaths();