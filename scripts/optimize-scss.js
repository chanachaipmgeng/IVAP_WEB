/**
 * SCSS Optimization Helper
 *
 * This script helps identify large SCSS files that need optimization
 *
 * Usage: node scripts/optimize-scss.js
 */

const fs = require('fs');
const path = require('path');

const SCSS_BUDGET = 100 * 1024; // 100KB in bytes
const MAX_FILE_SIZE = 1000 * 1024; // 1MB in bytes

function findScssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findScssFiles(filePath, fileList);
    } else if (file.endsWith('.scss')) {
      fileList.push({
        path: filePath,
        size: stat.size,
        sizeKB: (stat.size / 1024).toFixed(2)
      });
    }
  });

  return fileList;
}

function analyzeScssFiles() {
  const srcDir = path.join(__dirname, '..', 'src');
  const scssFiles = findScssFiles(srcDir);

  // Sort by size (largest first)
  scssFiles.sort((a, b) => b.size - a.size);

  console.log('📊 SCSS Files Analysis\n');
  console.log(`Total SCSS files: ${scssFiles.length}\n`);

  // Find files exceeding budget
  const largeFiles = scssFiles.filter(file => file.size > SCSS_BUDGET);
  const veryLargeFiles = scssFiles.filter(file => file.size > MAX_FILE_SIZE);

  if (largeFiles.length > 0) {
    console.log(`⚠️  Files exceeding budget (${SCSS_BUDGET / 1024}KB):`);
    largeFiles.forEach(file => {
      const relativePath = path.relative(path.join(__dirname, '..'), file.path);
      const status = file.size > MAX_FILE_SIZE ? '🔴' : '🟡';
      console.log(`   ${status} ${relativePath}: ${file.sizeKB} KB`);
    });
    console.log('');
  }

  if (veryLargeFiles.length > 0) {
    console.log(`🔴 Very large files (>${MAX_FILE_SIZE / 1024}KB) - Need immediate attention:`);
    veryLargeFiles.forEach(file => {
      const relativePath = path.relative(path.join(__dirname, '..'), file.path);
      console.log(`   ${relativePath}: ${file.sizeKB} KB`);
    });
    console.log('');
  }

  // Top 10 largest files
  console.log('📈 Top 10 Largest SCSS Files:');
  scssFiles.slice(0, 10).forEach((file, index) => {
    const relativePath = path.relative(path.join(__dirname, '..'), file.path);
    console.log(`   ${index + 1}. ${relativePath}: ${file.sizeKB} KB`);
  });

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (largeFiles.length > 0) {
    console.log('   1. Split large SCSS files into smaller modules');
    console.log('   2. Extract common styles to shared files');
    console.log('   3. Use CSS optimization tools (e.g., purgecss)');
    console.log('   4. Consider using Tailwind CSS for utility classes');
  } else {
    console.log('   ✅ All SCSS files are within budget!');
  }

  // Save report
  const report = {
    totalFiles: scssFiles.length,
    largeFiles: largeFiles.map(f => ({
      path: path.relative(path.join(__dirname, '..'), f.path),
      size: f.size,
      sizeKB: parseFloat(f.sizeKB)
    })),
    veryLargeFiles: veryLargeFiles.map(f => ({
      path: path.relative(path.join(__dirname, '..'), f.path),
      size: f.size,
      sizeKB: parseFloat(f.sizeKB)
    })),
    top10: scssFiles.slice(0, 10).map(f => ({
      path: path.relative(path.join(__dirname, '..'), f.path),
      size: f.size,
      sizeKB: parseFloat(f.sizeKB)
    }))
  };

  const reportPath = path.join(__dirname, '..', 'scss-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

// Run analysis
try {
  analyzeScssFiles();
} catch (error) {
  console.error('❌ Error analyzing SCSS files:', error.message);
  process.exit(1);
}
