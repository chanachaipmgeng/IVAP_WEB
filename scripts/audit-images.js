/**
 * Image Audit Script
 *
 * This script audits all images in the project:
 * - Finds all image files
 * - Finds all <img> tags in HTML templates
 * - Reports image usage and optimization opportunities
 *
 * Usage: node scripts/audit-images.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const publicDir = path.join(projectRoot, 'public');

// Image extensions to check
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 500 * 1024; // 500KB

// Results
const results = {
  imageFiles: [],
  imageTags: [],
  largeImages: [],
  unoptimizedTags: [],
  stats: {
    totalImages: 0,
    totalSize: 0,
    webpCount: 0,
    svgCount: 0,
    largeImageCount: 0,
    unoptimizedTagCount: 0
  }
};

/**
 * Find all image files recursively
 */
function findImageFiles(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, .git
      if (!filePath.includes('node_modules') &&
          !filePath.includes('dist') &&
          !filePath.includes('.git')) {
        findImageFiles(filePath, baseDir);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        const relativePath = path.relative(baseDir, filePath);
        const size = stat.size;
        const isLarge = size > MAX_FILE_SIZE;
        const isWebP = ext === '.webp';
        const isSVG = ext === '.svg';

        results.imageFiles.push({
          path: relativePath,
          fullPath: filePath,
          size: size,
          sizeKB: (size / 1024).toFixed(2),
          extension: ext,
          isLarge: isLarge,
          isWebP: isWebP,
          isSVG: isSVG
        });

        results.stats.totalImages++;
        results.stats.totalSize += size;

        if (isWebP) results.stats.webpCount++;
        if (isSVG) results.stats.svgCount++;
        if (isLarge) {
          results.stats.largeImageCount++;
          results.largeImages.push({
            path: relativePath,
            size: size,
            sizeKB: (size / 1024).toFixed(2)
          });
        }
      }
    }
  });
}

/**
 * Find all <img> tags in HTML files
 */
function findImageTags(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') &&
          !filePath.includes('dist') &&
          !filePath.includes('.git')) {
        findImageTags(filePath);
      }
    } else if (stat.isFile() && file.endsWith('.html')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(srcDir, filePath);

        // Find all <img> tags
        const imgRegex = /<img[^>]*>/gi;
        const matches = content.match(imgRegex);

        if (matches) {
          matches.forEach(match => {
            // Check if using ngSrc or appImageOptimization
            const hasNgSrc = match.includes('ngSrc') || match.includes('[ngSrc]');
            const hasDirective = match.includes('appImageOptimization');
            const hasLazy = match.includes('loading="lazy"') || match.includes('[loading]="\'lazy\'"');
            const hasPriority = match.includes('priority') || match.includes('[priority]');
            const hasSrcset = match.includes('srcset') || match.includes('[srcset]');
            const hasSizes = match.includes('sizes') || match.includes('[sizes]');

            const isOptimized = hasNgSrc || hasDirective;
            const hasOptimization = isOptimized && (hasLazy || hasPriority || hasSrcset);

            if (!isOptimized || !hasOptimization) {
              results.unoptimizedTags.push({
                file: relativePath,
                tag: match.substring(0, 100), // First 100 chars
                hasNgSrc: hasNgSrc,
                hasDirective: hasDirective,
                hasLazy: hasLazy,
                hasPriority: hasPriority,
                needsOptimization: !isOptimized || !hasOptimization
              });
              results.stats.unoptimizedTagCount++;
            }

            results.imageTags.push({
              file: relativePath,
              tag: match.substring(0, 100),
              hasNgSrc: hasNgSrc,
              hasDirective: hasDirective,
              hasLazy: hasLazy,
              hasPriority: hasPriority,
              hasSrcset: hasSrcset,
              hasSizes: hasSizes
            });
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });
}

/**
 * Generate report
 */
function generateReport() {
  console.log('📸 Image Audit Report\n');
  console.log('='.repeat(60));

  // Image Files Summary
  console.log('\n📁 Image Files Summary:');
  console.log(`   Total images: ${results.stats.totalImages}`);
  console.log(`   Total size: ${(results.stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   WebP images: ${results.stats.webpCount}`);
  console.log(`   SVG images: ${results.stats.svgCount}`);
  console.log(`   Large images (>500KB): ${results.stats.largeImageCount}`);

  // Large Images
  if (results.largeImages.length > 0) {
    console.log('\n⚠️  Large Images (>500KB):');
    results.largeImages
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(img => {
        console.log(`   ${img.path}: ${img.sizeKB} KB`);
      });
  }

  // Image Tags Summary
  console.log('\n🏷️  Image Tags Summary:');
  console.log(`   Total <img> tags: ${results.imageTags.length}`);
  console.log(`   Using ngSrc: ${results.imageTags.filter(t => t.hasNgSrc).length}`);
  console.log(`   Using directive: ${results.imageTags.filter(t => t.hasDirective).length}`);
  console.log(`   Using lazy loading: ${results.imageTags.filter(t => t.hasLazy).length}`);
  console.log(`   Using priority: ${results.imageTags.filter(t => t.hasPriority).length}`);
  console.log(`   Using srcset: ${results.imageTags.filter(t => t.hasSrcset).length}`);
  console.log(`   Unoptimized tags: ${results.stats.unoptimizedTagCount}`);

  // Unoptimized Tags
  if (results.unoptimizedTags.length > 0) {
    console.log('\n⚠️  Unoptimized Image Tags:');
    const grouped = {};
    results.unoptimizedTags.forEach(tag => {
      if (!grouped[tag.file]) {
        grouped[tag.file] = [];
      }
      grouped[tag.file].push(tag);
    });

    Object.keys(grouped).slice(0, 10).forEach(file => {
      console.log(`\n   ${file}:`);
      grouped[file].slice(0, 3).forEach(tag => {
        console.log(`      ${tag.tag}...`);
      });
      if (grouped[file].length > 3) {
        console.log(`      ... and ${grouped[file].length - 3} more`);
      }
    });
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (results.stats.webpCount < results.stats.totalImages * 0.5) {
    console.log('   - Convert images to WebP format for better compression');
  }
  if (results.stats.largeImageCount > 0) {
    console.log('   - Optimize large images (>500KB)');
  }
  if (results.stats.unoptimizedTagCount > 0) {
    console.log('   - Apply ImageOptimizationDirective to unoptimized tags');
    console.log('   - Add lazy loading for below-the-fold images');
    console.log('   - Add priority for above-the-fold images');
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Save detailed report to JSON
 */
function saveReport() {
  const reportPath = path.join(projectRoot, 'image-audit-report.json');
  const report = {
    generatedAt: new Date().toISOString(),
    stats: results.stats,
    imageFiles: results.imageFiles.sort((a, b) => b.size - a.size),
    largeImages: results.largeImages.sort((a, b) => b.size - a.size),
    unoptimizedTags: results.unoptimizedTags,
    top10LargestImages: results.imageFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(img => ({
        path: img.path,
        sizeKB: img.sizeKB,
        extension: img.extension
      }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
}

// Main execution
console.log('🔍 Starting image audit...\n');

// Find images in src directory
if (fs.existsSync(srcDir)) {
  findImageFiles(srcDir, srcDir);
}

// Find images in public directory
if (fs.existsSync(publicDir)) {
  findImageFiles(publicDir, publicDir);
}

// Find image tags in HTML files
if (fs.existsSync(srcDir)) {
  findImageTags(srcDir);
}

// Generate and save report
generateReport();
saveReport();

console.log('✅ Image audit complete!\n');
