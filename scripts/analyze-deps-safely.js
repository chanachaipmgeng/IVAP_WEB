/**
 * Safe Dependency Analysis
 *
 * This script analyzes depcheck results and filters out:
 * - Build-time dependencies (should NOT be removed)
 * - Dependencies that might be used in config files
 * - Dependencies that might be dynamically imported
 *
 * Usage: node scripts/analyze-deps-safely.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const depcheckReportPath = path.join(projectRoot, 'depcheck-report.json');

// Dependencies that should NEVER be removed (build/runtime critical)
const CRITICAL_DEPS = {
  dependencies: [
    '@angular/localize', // Required for i18n
    'tslib', // TypeScript library helpers
  ],
  devDependencies: [
    '@angular/build', // Angular build system
    '@angular/compiler-cli', // Angular compiler
    'typescript', // TypeScript compiler
    'autoprefixer', // PostCSS plugin (used in Tailwind)
    'postcss', // CSS processor (used in Tailwind)
    'karma', // Test runner
    'karma-chrome-launcher', // Karma launcher
    'karma-coverage', // Karma coverage
    'karma-jasmine', // Karma jasmine adapter
    'karma-jasmine-html-reporter', // Karma reporter
    'jasmine-core', // Jasmine test framework
  ]
};

// Dependencies that might be used but depcheck can't detect
const POTENTIALLY_USED = {
  dependencies: [
    '@angular/google-maps', // Might be used in templates
    '@angular/youtube-player', // Might be used in templates
    '@fortawesome/angular-fontawesome', // FontAwesome icons
    '@fortawesome/fontawesome-svg-core', // FontAwesome core
    '@fortawesome/free-brands-svg-icons', // FontAwesome icons
    '@fortawesome/free-regular-svg-icons', // FontAwesome icons
    '@fortawesome/free-solid-svg-icons', // FontAwesome icons
    '@ng-icons/core', // Icon library
    '@ng-icons/heroicons', // Icon library
    '@ng-icons/lucide', // Icon library
    '@ngx-translate/http-loader', // Translation loader
    'sweetalert2', // Alert library (might be used in templates)
    'ngx-bar-rating', // Rating component
    'ngx-color-picker', // Color picker
    'ngx-colors', // Color picker
    'ngx-skeleton-loader', // Skeleton loader
    'ngx-validators', // Form validators
    // Face recognition and ML dependencies
    // Note: These might be used but depcheck can't detect dynamic imports
    // ALWAYS verify with: npm run verify-deps before removing
    '@mediapipe/face_mesh', // Face detection (verify usage)
    '@tensorflow-models/face-landmarks-detection', // Face detection (verify usage)
    '@tensorflow/tfjs', // Face recognition (verify usage)
    '@tensorflow/tfjs-core', // Face recognition (verify usage)
    'canvas', // Image processing (verify usage)
    '@ks89/angular-modal-gallery', // Gallery component (verify usage)
  ],
  devDependencies: [
    'depcheck', // Used by our script
  ]
};

function analyzeDependencies() {
  if (!fs.existsSync(depcheckReportPath)) {
    console.log('❌ depcheck-report.json not found. Please run "npm run check-deps" first.\n');
    return;
  }

  const report = JSON.parse(fs.readFileSync(depcheckReportPath, 'utf-8'));

  console.log('🔍 Safe Dependency Analysis\n');
  console.log('⚠️  WARNING: Always verify dependencies manually before removing!\n');

  // Filter dependencies
  const safeToRemoveDeps = (report.dependencies || []).filter(dep => {
    return !CRITICAL_DEPS.dependencies.includes(dep) &&
           !POTENTIALLY_USED.dependencies.includes(dep);
  });

  const potentiallyUsedDeps = (report.dependencies || []).filter(dep => {
    return POTENTIALLY_USED.dependencies.includes(dep);
  });

  const criticalDeps = (report.dependencies || []).filter(dep => {
    return CRITICAL_DEPS.dependencies.includes(dep);
  });

  // Filter devDependencies
  const safeToRemoveDevDeps = (report.devDependencies || []).filter(dep => {
    return !CRITICAL_DEPS.devDependencies.includes(dep) &&
           !POTENTIALLY_USED.devDependencies.includes(dep);
  });

  const potentiallyUsedDevDeps = (report.devDependencies || []).filter(dep => {
    return POTENTIALLY_USED.devDependencies.includes(dep);
  });

  const criticalDevDeps = (report.devDependencies || []).filter(dep => {
    return CRITICAL_DEPS.devDependencies.includes(dep);
  });

  // Display results
  if (criticalDeps.length > 0) {
    console.log('🔴 CRITICAL - DO NOT REMOVE (Required for build/runtime):');
    criticalDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('');
  }

  if (criticalDevDeps.length > 0) {
    console.log('🔴 CRITICAL DEV - DO NOT REMOVE (Required for build):');
    criticalDevDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('');
  }

  if (potentiallyUsedDeps.length > 0) {
    console.log('🟡 REVIEW CAREFULLY (Might be used in templates/config):');
    potentiallyUsedDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('   → Search codebase before removing\n');
  }

  if (potentiallyUsedDevDeps.length > 0) {
    console.log('🟡 REVIEW CAREFULLY DEV (Might be used in scripts/config):');
    potentiallyUsedDevDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('   → Search codebase before removing\n');
  }

  if (safeToRemoveDeps.length > 0) {
    console.log('✅ SAFE TO REMOVE (Verify manually first):');
    safeToRemoveDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log(`\n💡 To remove: npm uninstall ${safeToRemoveDeps.join(' ')}\n`);
  } else {
    console.log('✅ No safe-to-remove dependencies found!\n');
  }

  if (safeToRemoveDevDeps.length > 0) {
    console.log('✅ SAFE TO REMOVE DEV (Verify manually first):');
    safeToRemoveDevDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log(`\n💡 To remove: npm uninstall --save-dev ${safeToRemoveDevDeps.join(' ')}\n`);
  } else {
    console.log('✅ No safe-to-remove dev dependencies found!\n');
  }

  // Save safe analysis report
  const safeReport = {
    critical: {
      dependencies: criticalDeps,
      devDependencies: criticalDevDeps
    },
    potentiallyUsed: {
      dependencies: potentiallyUsedDeps,
      devDependencies: potentiallyUsedDevDeps
    },
    safeToRemove: {
      dependencies: safeToRemoveDeps,
      devDependencies: safeToRemoveDevDeps
    }
  };

  const safeReportPath = path.join(projectRoot, 'safe-deps-analysis.json');
  fs.writeFileSync(safeReportPath, JSON.stringify(safeReport, null, 2));
  console.log(`📄 Safe analysis report saved to: ${safeReportPath}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Critical (DO NOT REMOVE): ${criticalDeps.length + criticalDevDeps.length}`);
  console.log(`   Review Carefully: ${potentiallyUsedDeps.length + potentiallyUsedDevDeps.length}`);
  console.log(`   Safe to Remove: ${safeToRemoveDeps.length + safeToRemoveDevDeps.length}\n`);
}

analyzeDependencies();
