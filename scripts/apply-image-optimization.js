/**
 * Apply Image Optimization Directive Script
 *
 * This script helps apply ImageOptimizationDirective to <img> tags in HTML templates.
 * It finds unoptimized <img> tags and suggests replacements.
 *
 * Usage: node scripts/apply-image-optimization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const isDryRun = process.argv.includes('--dry-run');

// Results
const results = {
  filesProcessed: [],
  tagsFound: 0,
  tagsOptimized: 0,
  tagsNeedingOptimization: [],
  changes: []
};

/**
 * Check if directive is imported in component
 */
function checkDirectiveImport(tsFilePath) {
  if (!fs.existsSync(tsFilePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(tsFilePath, 'utf-8');
    return content.includes('ImageOptimizationDirective') ||
           content.includes('image-optimization.directive');
  } catch (error) {
    return false;
  }
}

/**
 * Optimize img tag
 */
function optimizeImgTag(tag, isAboveFold = false) {
  // Skip if already optimized
  if (tag.includes('appImageOptimization') || tag.includes('ngSrc')) {
    return tag;
  }

  let optimized = tag;

  // Check for Angular binding [src]="..."
  const bindingMatch = tag.match(/\[src\]\s*=\s*["']([^"']+)["']/i);
  // Check for static src="..."
  const staticMatch = tag.match(/src\s*=\s*["']([^"']+)["']/i);
  // Check for Angular binding with expression [src]="expression"
  const expressionMatch = tag.match(/\[src\]\s*=\s*["']([^"']+)["']/i);

  // Handle Angular binding [src]="expression"
  if (tag.includes('[src]=')) {
    // Extract the binding expression
    const bindingRegex = /\[src\]\s*=\s*["']([^"']+)["']/g;
    const bindingContent = tag.match(/\[src\]\s*=\s*["']([^"']+)["']/);

    if (bindingContent) {
      // Replace [src] with [ngSrc]
      optimized = optimized.replace(/\[src\]\s*=\s*["']([^"']+)["']/i, `[ngSrc]="$1"`);
    } else {
      // Handle [src]="expression" (without quotes, like [src]="slide.image")
      optimized = optimized.replace(/\[src\]\s*=\s*["']([^"']+)["']/gi, (match, expr) => {
        return `[ngSrc]="${expr}"`;
      });
      // Also handle [src]="expression" directly
      optimized = optimized.replace(/\[src\]\s*=\s*["']([^"']+)["']/gi, `[ngSrc]="$1"`);
      // Handle [src]="expression" without quotes in the binding
      optimized = optimized.replace(/\[src\]\s*=\s*["']([^"']+)["']/gi, (match) => {
        return match.replace('[src]', '[ngSrc]');
      });
    }

    // Simple replacement for [src]="anything"
    optimized = optimized.replace(/\[src\]/gi, '[ngSrc]');
  }
  // Handle static src="..."
  else if (staticMatch) {
    optimized = optimized.replace(/src\s*=\s*["']([^"']+)["']/i, `ngSrc="$1"`);
  }
  // If no src found, can't optimize
  else {
    return tag;
  }

  // Add directive
  if (!optimized.includes('appImageOptimization')) {
    optimized = optimized.replace(/<img/i, '<img appImageOptimization');
  }

  // Add loading attribute (before closing > or />)
  if (!optimized.includes('loading=') && !optimized.includes('[loading]')) {
    if (isAboveFold) {
      // Add priority before closing tag (with space)
      if (!optimized.includes('priority')) {
        optimized = optimized.replace(/(\s+)(\/?>)/, '$1priority$2');
        if (!optimized.includes('priority')) {
          optimized = optimized.replace(/(\s*)(\/?>)/, ' priority$2');
        }
      }
    } else {
      // Add loading="lazy" before closing tag (with space)
      optimized = optimized.replace(/(\s+)(\/?>)/, '$1loading="lazy"$2');
      if (!optimized.includes('loading=')) {
        optimized = optimized.replace(/(\s*)(\/?>)/, ' loading="lazy"$2');
      }
    }
  }

  // Add alt if missing (but keep existing [alt] bindings)
  if (!optimized.includes('alt=') && !optimized.includes('[alt]')) {
    // Add alt before closing tag, but after other attributes
    if (optimized.includes('loading=') || optimized.includes('priority')) {
      // Insert before loading/priority
      optimized = optimized.replace(/(\s+)(loading=|priority)/, '$1alt=""$2');
    } else {
      // Add before closing tag (with space)
      optimized = optimized.replace(/(\s+)(\/?>)/, '$1alt=""$2');
      if (!optimized.includes('alt=')) {
        optimized = optimized.replace(/(\s*)(\/?>)/, ' alt=""$2');
      }
    }
  }

  return optimized;
}

/**
 * Process HTML file
 */
function processHtmlFile(htmlPath) {
  const relativePath = path.relative(srcDir, htmlPath);
  const tsPath = htmlPath.replace('.html', '.ts');
  const hasDirective = checkDirectiveImport(tsPath);

  try {
    let content = fs.readFileSync(htmlPath, 'utf-8');
    let modified = false;
    const fileChanges = [];

    // Find all <img> tags
    const imgRegex = /<img[^>]*>/gi;
    const matches = content.match(imgRegex);

    if (!matches) {
      return; // No images in this file
    }

    results.tagsFound += matches.length;

    matches.forEach(match => {
      // Check if already optimized
      const isOptimized = match.includes('appImageOptimization') ||
                         (match.includes('ngSrc') && (match.includes('loading=') || match.includes('priority')));

      if (!isOptimized) {
        results.tagsNeedingOptimization.push({
          file: relativePath,
          tag: match.substring(0, 100)
        });

        // Determine if above-the-fold (simple heuristic: first image in file)
        const isAboveFold = content.indexOf(match) < 500;

        // Optimize tag
        const optimized = optimizeImgTag(match, isAboveFold);

        if (optimized !== match) {
          content = content.replace(match, optimized);
          modified = true;
          fileChanges.push({
            original: match.substring(0, 80),
            optimized: optimized.substring(0, 80)
          });
          results.tagsOptimized++;
        }
      } else {
        results.tagsOptimized++;
      }
    });

    // Add directive import if needed
    if (modified && !hasDirective && fs.existsSync(tsPath)) {
      let tsContent = fs.readFileSync(tsPath, 'utf-8');

      // Check if it's a standalone component
      if (tsContent.includes('standalone: true')) {
        // Add import
        const importStatement = `import { ImageOptimizationDirective } from '../../shared/directives/image-optimization.directive';\n`;

        // Calculate correct relative path
        const directiveFile = path.join(projectRoot, 'src/app/shared/directives/image-optimization.directive.ts');
        const componentFile = tsPath;
        const relativePath = path.relative(path.dirname(componentFile), path.dirname(directiveFile))
          .replace(/\\/g, '/')
          .replace(/^\.\.\//, '')
          .replace(/^app\//, '')
          .replace(/^shared\//, '../shared/')
          .replace(/^features\//, '../features/');

        // Use correct path based on component location
        let correctImportPath;
        if (componentFile.includes('shared/components')) {
          correctImportPath = '../directives/image-optimization.directive';
        } else if (componentFile.includes('features')) {
          correctImportPath = '../../../shared/directives/image-optimization.directive';
        } else {
          correctImportPath = '../../shared/directives/image-optimization.directive';
        }

        const importStatement = `import { ImageOptimizationDirective } from '${correctImportPath}';\n`;

        // Find imports section
        const importMatch = tsContent.match(/(import\s+.*?from\s+['"].*?['"];?\s*\n)+/);
        if (importMatch) {
          const insertIndex = importMatch.index + importMatch[0].length;
          tsContent = tsContent.slice(0, insertIndex) + importStatement + tsContent.slice(insertIndex);

          // Add to imports array - find the last item before closing bracket
          const importsMatch = tsContent.match(/imports:\s*\[([^\]]*)\]/s);
          if (importsMatch) {
            const importsContent = importsMatch[1].trim();
            const lastItem = importsContent.split(',').pop().trim();
            const newImports = importsContent + (importsContent ? ',\n    ' : '') + 'ImageOptimizationDirective';
            tsContent = tsContent.replace(
              /imports:\s*\[([^\]]*)\]/s,
              `imports: [${newImports}]`
            );
          }

          if (!isDryRun) {
            fs.writeFileSync(tsPath, tsContent, 'utf-8');
          }
        }
      }
    }

    if (modified) {
      if (!isDryRun) {
        fs.writeFileSync(htmlPath, content, 'utf-8');
      }

      results.filesProcessed.push({
        file: relativePath,
        changes: fileChanges.length
      });

      results.changes.push({
        file: relativePath,
        changes: fileChanges
      });
    }
  } catch (error) {
    console.error(`Error processing ${relativePath}:`, error.message);
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
      processHtmlFile(filePath);
    }
  });
}

/**
 * Generate report
 */
function generateReport() {
  console.log('🖼️  Image Optimization Application Report\n');
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  console.log(`📁 Files processed: ${results.filesProcessed.length}`);
  console.log(`🏷️  Total <img> tags found: ${results.tagsFound}`);
  console.log(`✅ Already optimized: ${results.tagsOptimized - results.tagsNeedingOptimization.length}`);
  console.log(`⚠️  Needs optimization: ${results.tagsNeedingOptimization.length}`);
  console.log(`✨ Tags optimized: ${results.changes.reduce((sum, f) => sum + f.changes.length, 0)}`);

  if (results.changes.length > 0) {
    console.log('\n📝 Files Modified:');
    results.changes.slice(0, 10).forEach(change => {
      console.log(`\n   ${change.file}:`);
      change.changes.slice(0, 3).forEach(c => {
        console.log(`      Before: ${c.original}...`);
        console.log(`      After:  ${c.optimized}...`);
      });
      if (change.changes.length > 3) {
        console.log(`      ... and ${change.changes.length - 3} more changes`);
      }
    });
    if (results.changes.length > 10) {
      console.log(`\n   ... and ${results.changes.length - 10} more files`);
    }
  }

  if (results.tagsNeedingOptimization.length > 0 && results.changes.length === 0) {
    console.log('\n⚠️  Tags Needing Manual Optimization:');
    const grouped = {};
    results.tagsNeedingOptimization.forEach(tag => {
      if (!grouped[tag.file]) {
        grouped[tag.file] = [];
      }
      grouped[tag.file].push(tag);
    });

    Object.keys(grouped).slice(0, 5).forEach(file => {
      console.log(`\n   ${file}:`);
      grouped[file].slice(0, 2).forEach(tag => {
        console.log(`      ${tag.tag}...`);
      });
    });
  }

  console.log('\n' + '='.repeat(60));

  if (isDryRun && results.changes.length > 0) {
    console.log('\n💡 Run without --dry-run to apply changes\n');
  }
}

// Main execution
console.log('🔍 Finding HTML files...\n');

if (fs.existsSync(srcDir)) {
  findHtmlFiles(srcDir);
}

generateReport();

// Save report
const reportPath = path.join(projectRoot, 'image-optimization-application-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  isDryRun: isDryRun,
  results: results
}, null, 2));

console.log(`\n📄 Report saved to: ${reportPath}\n`);

if (!isDryRun && results.changes.length > 0) {
  console.log('✅ Image optimization applied!\n');
} else if (isDryRun) {
  console.log('💡 Review the report and run without --dry-run to apply changes\n');
}
