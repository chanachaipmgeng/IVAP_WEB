/**
 * Fix Import Errors Script
 *
 * This script fixes import path errors and syntax errors in component files
 * that were introduced by apply-image-optimization.js
 *
 * Usage: node scripts/fix-import-errors.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const directivePath = 'src/app/shared/directives/image-optimization.directive';

let filesFixed = 0;
let errorsFixed = 0;

/**
 * Calculate relative path from component to directive
 */
function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const toDir = path.dirname(toFile);
  const relative = path.relative(fromDir, toDir);
  return relative.replace(/\\/g, '/') + '/image-optimization.directive';
}

/**
 * Fix import path and syntax errors in TypeScript file
 */
function fixTsFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Fix 1: Correct import path
    const wrongImportRegex = /import\s+{\s*ImageOptimizationDirective\s*}\s+from\s+['"]\.\.\/\.\.\/shared\/directives\/image-optimization\.directive['"];?/g;
    if (wrongImportRegex.test(content)) {
      // Calculate correct relative path
      const directiveFile = path.join(projectRoot, 'src/app/shared/directives/image-optimization.directive.ts');
      const relativePath = getRelativePath(filePath, directiveFile);

      // Fix import path
      content = content.replace(
        wrongImportRegex,
        `import { ImageOptimizationDirective } from '${relativePath}';`
      );
      modified = true;
      errorsFixed++;
    }

    // Fix 2: Fix comma errors in imports array
    // Pattern: ImageOptimizationDirective, ,
    content = content.replace(/ImageOptimizationDirective,\s*,/g, 'ImageOptimizationDirective,');
    if (content.includes('ImageOptimizationDirective, ,')) {
      modified = true;
      errorsFixed++;
    }

    // Fix 3: Fix missing closing bracket in imports array
    // Pattern: ImageOptimizationDirective, ,\n  templateUrl
    content = content.replace(
      /(ImageOptimizationDirective,\s*)\n\s*templateUrl/g,
      '$1],\n  templateUrl'
    );
    if (content.match(/ImageOptimizationDirective[^]]*templateUrl/)) {
      modified = true;
      errorsFixed++;
    }

    // Fix 4: Fix merged imports (FormsModuleImageOptimizationDirective, etc.)
    content = content.replace(
      /(\w+Module)ImageOptimizationDirective/g,
      '$1,\n    ImageOptimizationDirective'
    );
    if (content.match(/\w+ModuleImageOptimizationDirective/)) {
      modified = true;
      errorsFixed++;
    }

    // Fix 5: Fix RouterModuleImageOptimizationDirective
    content = content.replace(
      /RouterModuleImageOptimizationDirective/g,
      'RouterModule,\n    ImageOptimizationDirective'
    );
    if (content.includes('RouterModuleImageOptimizationDirective')) {
      modified = true;
      errorsFixed++;
    }

    // Fix 6: Fix CommonModuleImageOptimizationDirective
    content = content.replace(
      /CommonModuleImageOptimizationDirective/g,
      'CommonModule,\n    ImageOptimizationDirective'
    );
    if (content.includes('CommonModuleImageOptimizationDirective')) {
      modified = true;
      errorsFixed++;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find all TypeScript component files
 */
function findTsFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') &&
          !filePath.includes('dist') &&
          !filePath.includes('.git')) {
        findTsFiles(filePath);
      }
    } else if (stat.isFile() && file.endsWith('.component.ts')) {
      fixTsFile(filePath);
    }
  });
}

// Main execution
console.log('🔧 Fixing import errors...\n');

if (fs.existsSync(srcDir)) {
  findTsFiles(srcDir);
}

console.log(`✅ Fixed ${errorsFixed} errors in ${filesFixed} files\n`);
