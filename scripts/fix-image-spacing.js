/**
 * Fix Image Tag Spacing
 *
 * This script fixes missing spaces before loading/priority/alt attributes
 * that were added by apply-image-optimization.js
 *
 * Usage: node scripts/fix-image-spacing.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

let filesFixed = 0;
let tagsFixed = 0;

/**
 * Fix spacing in HTML file
 */
function fixHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let tagCount = 0;

    // Fix: "attribute"loading= -> "attribute" loading=
    const patterns = [
      { regex: /"([^"]*)"loading=/g, replacement: '"$1" loading=' },
      { regex: /'([^']*)'loading=/g, replacement: "'$1' loading=" },
      { regex: /"([^"]*)"priority/g, replacement: '"$1" priority' },
      { regex: /'([^']*)'priority/g, replacement: "'$1' priority" },
      { regex: /"([^"]*)"alt=/g, replacement: '"$1" alt=' },
      { regex: /'([^']*)'alt=/g, replacement: "'$1' alt=" }
    ];

    patterns.forEach(({ regex, replacement }) => {
      const matches = content.match(regex);
      if (matches) {
        tagCount += matches.length;
        content = content.replace(regex, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      tagsFixed += tagCount;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find all HTML files
 */
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') &&
          !filePath.includes('dist') &&
          !filePath.includes('.git')) {
        findHtmlFiles(filePath);
      }
    } else if (stat.isFile() && file.endsWith('.html')) {
      fixHtmlFile(filePath);
    }
  });
}

// Main execution
console.log('🔧 Fixing image tag spacing...\n');

if (fs.existsSync(srcDir)) {
  findHtmlFiles(srcDir);
}

console.log(`✅ Fixed ${tagsFixed} tags in ${filesFixed} files\n`);
