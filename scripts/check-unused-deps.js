/**
 * Check for unused dependencies
 *
 * Usage: node scripts/check-unused-deps.js
 *
 * This script uses depcheck to identify unused dependencies
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for unused dependencies...\n');

const projectRoot = path.join(__dirname, '..');
const depcheckPath = path.join(projectRoot, 'node_modules', '.bin', 'depcheck');

function runDepcheck() {
  return new Promise((resolve, reject) => {
    // Try to use local depcheck first, then fallback to npx
    const command = fs.existsSync(depcheckPath)
      ? depcheckPath
      : 'npx';

    const args = fs.existsSync(depcheckPath)
      ? ['--json']
      : ['depcheck', '--json'];

    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const report = JSON.parse(stdout);
          resolve(report);
        } catch (parseError) {
          // If JSON parse fails, try to parse as text output
          console.log('⚠️  Could not parse JSON output, showing text output:\n');
          console.log(stdout);
          resolve(null);
        }
      } else {
        // depcheck exits with code 1 if unused deps are found (this is normal)
        if (stdout) {
          try {
            const report = JSON.parse(stdout);
            resolve(report);
          } catch (parseError) {
            // If JSON parse fails, show error
            reject(new Error(stderr || `depcheck exited with code ${code}`));
          }
        } else {
          reject(new Error(stderr || `depcheck exited with code ${code}`));
        }
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    const report = await runDepcheck();

    if (!report) {
      console.log('⚠️  Could not generate report. Please ensure depcheck is installed:');
      console.log('   npm install --save-dev depcheck\n');
      return;
    }

    // Display results
    if (report.dependencies && report.dependencies.length > 0) {
      console.log('❌ Unused Dependencies:');
      console.log('   ' + report.dependencies.join(', '));
      console.log('\n💡 To remove: npm uninstall ' + report.dependencies.join(' '));
    } else {
      console.log('✅ No unused dependencies found!');
    }

    if (report.devDependencies && report.devDependencies.length > 0) {
      console.log('\n❌ Unused Dev Dependencies:');
      console.log('   ' + report.devDependencies.join(', '));
      console.log('\n💡 To remove: npm uninstall --save-dev ' + report.devDependencies.join(' '));
    } else {
      console.log('\n✅ No unused dev dependencies found!');
    }

    if (report.missing && Object.keys(report.missing).length > 0) {
      console.log('\n⚠️  Missing Dependencies (used but not in package.json):');
      Object.keys(report.missing).forEach(dep => {
        console.log(`   ${dep}: ${report.missing[dep].join(', ')}`);
      });
    }

    // Save report to file
    const reportPath = path.join(projectRoot, 'depcheck-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error running depcheck:', error.message);
    console.log('\n💡 Try installing depcheck locally:');
    console.log('   npm install --save-dev depcheck\n');
    process.exit(1);
  }
}

main();
