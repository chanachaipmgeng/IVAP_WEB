/**
 * Verify Dependencies Usage
 *
 * This script searches the codebase for usage of dependencies
 * that are marked as "safe to remove" to ensure they're not actually used
 *
 * Usage: node scripts/verify-deps-usage.js [dependency-name]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const safeReportPath = path.join(projectRoot, 'safe-deps-analysis.json');

// Dependencies to verify (from safe-deps-analysis.json or command line)
const depsToVerify = process.argv.slice(2);

function searchInFiles(dir, searchTerms, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (!filePath.includes('node_modules') &&
          !filePath.includes('dist') &&
          !filePath.includes('.git')) {
        searchInFiles(filePath, searchTerms, fileList);
      }
    } else if (stat.isFile()) {
      // Check TypeScript, JavaScript, HTML, JSON files
      if (file.match(/\.(ts|js|html|json)$/)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const relativePath = path.relative(projectRoot, filePath);

          searchTerms.forEach(term => {
            // Search for import statements, require, or direct usage
            const patterns = [
              new RegExp(`import.*['"]${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'),
              new RegExp(`require\\(['"]${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'i'),
              new RegExp(`from ['"]${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'),
              new RegExp(`['"]${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i')
            ];

            patterns.forEach((pattern, index) => {
              if (pattern.test(content)) {
                // Extract line with match
                const lines = content.split('\n');
                const matchingLine = lines.findIndex(line => pattern.test(line));

                if (matchingLine !== -1) {
                  fileList.push({
                    file: relativePath,
                    line: matchingLine + 1,
                    content: lines[matchingLine].trim(),
                    pattern: index < 2 ? 'import/require' : 'usage'
                  });
                }
              }
            });
          });
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  });

  return fileList;
}

function verifyDependencies() {
  let dependencies = [];

  // Get dependencies from safe report or command line args
  if (depsToVerify.length > 0) {
    dependencies = depsToVerify;
  } else if (fs.existsSync(safeReportPath)) {
    const safeReport = JSON.parse(fs.readFileSync(safeReportPath, 'utf-8'));
    dependencies = [
      ...(safeReport.safeToRemove?.dependencies || []),
      ...(safeReport.safeToRemove?.devDependencies || [])
    ];
  } else {
    console.log('❌ No dependencies to verify. Either:');
    console.log('   1. Run "npm run analyze-deps-safe" first, or');
    console.log('   2. Provide dependencies as arguments: node scripts/verify-deps-usage.js <dep1> <dep2>...\n');
    return;
  }

  if (dependencies.length === 0) {
    console.log('✅ No dependencies marked as safe to remove.\n');
    return;
  }

  console.log('🔍 Verifying Dependencies Usage\n');
  console.log(`Checking ${dependencies.length} dependencies...\n`);

  const srcDir = path.join(projectRoot, 'src');
  const results = {};

  dependencies.forEach(dep => {
    console.log(`Checking: ${dep}...`);

    // Extract package name (remove scoped package prefix for search)
    const searchTerms = [
      dep,
      dep.replace(/^@[^/]+\//, ''), // Remove scope
      dep.split('/').pop() // Last part
    ].filter((term, index, self) => self.indexOf(term) === index);

    const matches = searchInFiles(srcDir, searchTerms, []);

    if (matches.length > 0) {
      results[dep] = {
        found: true,
        matches: matches.slice(0, 10) // Limit to first 10 matches
      };
      console.log(`   ⚠️  FOUND ${matches.length} usage(s)`);
    } else {
      results[dep] = {
        found: false,
        matches: []
      };
      console.log(`   ✅ Not found in codebase`);
    }
  });

  console.log('\n📊 Verification Results:\n');

  const foundDeps = Object.keys(results).filter(dep => results[dep].found);
  const notFoundDeps = Object.keys(results).filter(dep => !results[dep].found);

  if (foundDeps.length > 0) {
    console.log('⚠️  DEPENDENCIES FOUND IN CODEBASE (DO NOT REMOVE):');
    foundDeps.forEach(dep => {
      console.log(`\n   ${dep}:`);
      results[dep].matches.forEach(match => {
        console.log(`      ${match.file}:${match.line} - ${match.content.substring(0, 80)}...`);
      });
      if (results[dep].matches.length >= 10) {
        console.log(`      ... and more (showing first 10)`);
      }
    });
    console.log('');
  }

  if (notFoundDeps.length > 0) {
    console.log('✅ DEPENDENCIES NOT FOUND (Safe to remove after manual verification):');
    notFoundDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log(`\n💡 To remove: npm uninstall ${notFoundDeps.join(' ')}\n`);
  }

  // Save verification report
  const verificationReport = {
    verifiedAt: new Date().toISOString(),
    dependencies: results,
    summary: {
      total: dependencies.length,
      found: foundDeps.length,
      notFound: notFoundDeps.length
    }
  };

  const reportPath = path.join(projectRoot, 'deps-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(verificationReport, null, 2));
  console.log(`📄 Verification report saved to: ${reportPath}\n`);
}

verifyDependencies();
