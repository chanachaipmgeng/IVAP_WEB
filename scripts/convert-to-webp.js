/**
 * WebP Conversion Helper Script
 *
 * This script helps convert images to WebP format.
 * Note: Requires sharp-cli or sharp package to be installed.
 *
 * Usage:
 *   node scripts/convert-to-webp.js <input-dir> [output-dir]
 *
 * Example:
 *   node scripts/convert-to-webp.js src/assets/images src/assets/images/webp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const inputDir = process.argv[2] || path.join(projectRoot, 'src/assets/images');
const outputDir = process.argv[3] || path.join(inputDir, 'webp');

// Image extensions to convert
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const SKIP_EXTENSIONS = ['.svg', '.gif', '.webp'];

/**
 * Check if sharp-cli is available
 */
function checkSharpCLI() {
  try {
    execSync('sharp --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if sharp package is available
 */
function checkSharpPackage() {
  try {
    require.resolve('sharp');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert image using sharp-cli
 */
function convertWithSharpCLI(inputPath, outputPath) {
  try {
    execSync(`sharp -i "${inputPath}" -o "${outputPath}" -f webp`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Convert image using sharp package
 */
function convertWithSharp(inputPath, outputPath) {
  try {
    const sharp = require('sharp');
    return sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Converted: ${path.basename(inputPath)}`);
        return true;
      })
      .catch(error => {
        console.error(`❌ Error converting ${inputPath}:`, error.message);
        return false;
      });
  } catch (error) {
    console.error(`Error: sharp package not available`);
    return false;
  }
}

/**
 * Find and convert images
 */
function convertImages(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(dir);
  const results = {
    converted: [],
    skipped: [],
    errors: []
  };

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subResults = convertImages(filePath, baseDir);
      results.converted.push(...subResults.converted);
      results.skipped.push(...subResults.skipped);
      results.errors.push(...subResults.errors);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(ext)) {
        const relativePath = path.relative(baseDir, filePath);
        const outputPath = path.join(
          outputDir,
          relativePath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        );

        // Create output subdirectory if needed
        const outputSubDir = path.dirname(outputPath);
        if (!fs.existsSync(outputSubDir)) {
          fs.mkdirSync(outputSubDir, { recursive: true });
        }

        // Convert image
        let success = false;
        if (checkSharpCLI()) {
          success = convertWithSharpCLI(filePath, outputPath);
        } else if (checkSharpPackage()) {
          // For async sharp, we'll need to handle this differently
          console.log(`⚠️  Using sharp package (async conversion not fully supported in this script)`);
          console.log(`   Please use sharp-cli or convert manually: sharp -i "${filePath}" -o "${outputPath}" -f webp`);
          results.skipped.push(relativePath);
          return;
        } else {
          console.log(`⚠️  sharp-cli or sharp package not found`);
          console.log(`   Install: npm install -g sharp-cli`);
          console.log(`   Or: npm install --save-dev sharp`);
          results.errors.push(relativePath);
          return;
        }

        if (success) {
          results.converted.push({
            original: relativePath,
            webp: path.relative(outputDir, outputPath)
          });
        } else {
          results.errors.push(relativePath);
        }
      } else if (SKIP_EXTENSIONS.includes(ext)) {
        const relativePath = path.relative(baseDir, filePath);
        results.skipped.push(relativePath);
      }
    }
  });

  return results;
}

/**
 * Generate conversion report
 */
function generateReport(results) {
  console.log('\n📊 WebP Conversion Report\n');
  console.log('='.repeat(60));
  console.log(`✅ Converted: ${results.converted.length} images`);
  console.log(`⏭️  Skipped: ${results.skipped.length} files`);
  console.log(`❌ Errors: ${results.errors.length} files`);

  if (results.converted.length > 0) {
    console.log('\n✅ Converted Images:');
    results.converted.slice(0, 10).forEach(img => {
      console.log(`   ${img.original} → ${img.webp}`);
    });
    if (results.converted.length > 10) {
      console.log(`   ... and ${results.converted.length - 10} more`);
    }
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(file => {
      console.log(`   ${file}`);
    });
  }

  console.log('\n💡 Next Steps:');
  console.log('   1. Update image references in HTML templates');
  console.log('   2. Use <picture> tag with WebP source and fallback');
  console.log('   3. Or use ImageOptimizationDirective which handles WebP automatically');
  console.log('\n' + '='.repeat(60));
}

// Main execution
console.log('🖼️  WebP Conversion Script\n');
console.log(`Input directory: ${inputDir}`);
console.log(`Output directory: ${outputDir}\n`);

// Check for conversion tools
if (!checkSharpCLI() && !checkSharpPackage()) {
  console.log('⚠️  sharp-cli or sharp package not found!');
  console.log('\nTo install:');
  console.log('  npm install -g sharp-cli');
  console.log('  OR');
  console.log('  npm install --save-dev sharp');
  console.log('\nThen run this script again.\n');
  process.exit(1);
}

// Convert images
const results = convertImages(inputDir, inputDir);

// Generate report
generateReport(results);

// Save report
const reportPath = path.join(projectRoot, 'webp-conversion-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  inputDir: inputDir,
  outputDir: outputDir,
  results: results
}, null, 2));

console.log(`\n📄 Report saved to: ${reportPath}\n`);
