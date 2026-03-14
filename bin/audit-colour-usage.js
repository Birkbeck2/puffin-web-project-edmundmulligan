#!/usr/bin/env node

/*
 **********************************************************************
 * File       : audit-colour-usage.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Audit all HTML and CSS files for colour usage
 *   Identifies hardcoded colours and non-theme-compliant color references
 **********************************************************************
*/

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Approved generic variables that should be used (set by themeSwitcher.js)
const APPROVED_GENERIC_VARS = [
    '--colour-page-background',
    '--colour-page-text',
    '--colour-headings-background',
    '--colour-headings-text',
    '--colour-code-background',
    '--colour-code-text',
    '--colour-link-text',
    '--colour-link-text-hover',
    '--colour-link-text-visited',
    '--colour-link-text-focus',
    '--colour-button-background',
    '--colour-button-text',
    '--colour-button-background-hover',
    '--colour-button-text-hover',
    '--colour-button-background-active',
    '--colour-button-text-active',
    '--colour-button-background-disabled',
    '--colour-button-text-disabled',
    '--colour-error-background',
    '--colour-error-text',
    '--colour-warning-background',
    '--colour-warning-text',
    '--bg-landscape',
    '--bg-portrait',
    '--svg-filter',
    '--header-svg-filter'
];

// Direct use of theme-specific variables is allowed in:
const THEME_SPECIFIC_ALLOWED_FILES = [
    'styles/colours.css',          // Defines them
    'scripts/themeSwitcher.js',    // Maps them
    'diagnostics/colourPalette.html', // Shows them
    'scripts/colourPalette.js',    // Analyses them
    'styles/colourPalette.css'     // Diagnostic stylesheet
];

// Files/folders exempt from colour compliance checks (diagnostic/test files)
const EXEMPT_FROM_COLOR_CHECKS = [
    'diagnostics/',                // All diagnostic/test pages
    'bin/',                        // Build and test scripts
    'styles/test-results.css'      // Styles for test results
];

/**
 * Check if a file should be exempt from colour compliance checks
 * @param {string} filePath - Relative path to file
 * @returns {boolean} - True if file is exempt
 */
function isExemptFromColorChecks(filePath) {
    return EXEMPT_FROM_COLOR_CHECKS.some(exempt => filePath.startsWith(exempt));
}

function findHardcodedColors(filePath, content) {
    const issues = [];
    
    // Skip files exempt from colour checks
    if (isExemptFromColorChecks(filePath)) {
        return issues;
    }
    
    const lines = content.split('\n');
    
    // Regex patterns for hardcoded colours
    const patterns = [
        { type: 'Hex Color', regex: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g },
        { type: 'RGB', regex: /\brgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g },
        { type: 'RGBA', regex: /\brgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g },
        { type: 'HSL', regex: /\bhsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g },
        { type: 'HSLA', regex: /\bhsla\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g },
        { type: 'Named Color', regex: /:\s*(black|white|red|blue|green|yellow|orange|purple|pink|gray|grey|cyan|magenta)\s*[;}]/gi }
    ];
    
    patterns.forEach(({ type, regex }) => {
        let match;
        lines.forEach((line, lineNum) => {
            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                return;
            }
            
            regex.lastIndex = 0;
            while ((match = regex.exec(line)) !== null) {
                // Allow rgba/rgb for shadows and overlays with transparency
                if ((type === 'RGB' || type === 'RGBA') && (
                    line.includes('shadow') || 
                    line.includes('overlay') ||
                    line.includes('rgba(0 0 0') ||
                    line.includes('rgb(0 0 0')
                )) {
                    continue;
                }
                
                // Allow #fff and #000 in some special cases
                if (type === 'Hex Color' && (match[0] === '#fff' || match[0] === '#000') && 
                    line.includes('fallback')) {
                    continue;
                }
                
                // Skip hex patterns that are part of CSS ID selectors
                // ID selectors have additional identifier characters after the hex portion
                if (type === 'Hex Color') {
                    const matchEnd = match.index + match[0].length;
                    const nextChar = line[matchEnd];
                    // If followed by -, _, or any letter, it's likely an ID selector, not a color
                    if (nextChar && /[-_a-zA-Z]/.test(nextChar)) {
                        continue;
                    }
                }
                
                issues.push({
                    file: filePath,
                    line: lineNum + 1,
                    type,
                    value: match[0],
                    context: line.trim()
                });
            }
        });
    });
    
    return issues;
}

function findThemeSpecificVars(filePath, content) {
    const issues = [];
    
    // Skip files exempt from colour checks
    if (isExemptFromColorChecks(filePath)) {
        return issues;
    }
    
    const lines = content.split('\n');
    
    // Check if this file is allowed to use theme-specific variables
    const isAllowed = THEME_SPECIFIC_ALLOWED_FILES.some(allowed => 
        filePath.includes(allowed.replace('/', path.sep))
    );
    
    if (isAllowed) {
        return issues;
    }
    
    // Pattern for theme-specific variables
    const themeVarPattern = /--colour-(normal|subdued|vibrant)-(light|dark)-/g;
    
    lines.forEach((line, lineNum) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
            return;
        }
        
        let match;
        themeVarPattern.lastIndex = 0;
        while ((match = themeVarPattern.exec(line)) !== null) {
            issues.push({
                file: filePath,
                line: lineNum + 1,
                type: 'Theme-Specific Variable',
                value: match[0] + '...',
                context: line.trim(),
                suggestion: 'Use generic variable from themeSwitcher instead'
            });
        }
    });
    
    return issues;
}

function checkFileLoadsThemeSystem(filePath, content) {
    if (!filePath.endsWith('.html')) {
        return null;
    }
    
    // Skip files exempt from colour checks
    if (isExemptFromColorChecks(filePath)) {
        return null;
    }
    
    const hasGlobalsCSS = content.includes('styles/globals.css') || content.includes('styles/colours.css');
    const hasThemeSwitcher = content.includes('scripts/themeSwitcher.js');
    
    if (!hasGlobalsCSS || !hasThemeSwitcher) {
        return {
            file: filePath,
            missing: {
                globals: !hasGlobalsCSS,
                themeSwitcher: !hasThemeSwitcher
            }
        };
    }
    
    return null;
}

function getAllFiles(dir, extensions) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            // Skip node_modules, .git, test-results, etc.
            if (!['node_modules', '.git', 'test-results', 'artwork'].includes(file)) {
                results = results.concat(getAllFiles(filePath, extensions));
            }
        } else {
            if (extensions.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        }
    });
    
    return results;
}

function main() {
    console.log('\n' + '='.repeat(100));
    console.log('colour usage AUDIT - Theme Compliance Check');
    console.log('='.repeat(100) + '\n');
    
    const rootDir = path.join(__dirname, '..');
    
    // Find all CSS and HTML files
    const cssFiles = getAllFiles(rootDir, ['.css']);
    const htmlFiles = getAllFiles(rootDir, ['.html']);
    
    console.log(`Scanning ${cssFiles.length} CSS files and ${htmlFiles.length} HTML files...\n`);
    
    const allIssues = {
        hardcodedColors: [],
        themeSpecificVars: [],
        missingThemeSystem: []
    };
    
    // Check CSS files
    cssFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(rootDir, file);
        
        allIssues.hardcodedColors.push(...findHardcodedColors(relativePath, content));
        allIssues.themeSpecificVars.push(...findThemeSpecificVars(relativePath, content));
    });
    
    // Check HTML files
    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(rootDir, file);
        
        allIssues.hardcodedColors.push(...findHardcodedColors(relativePath, content));
        allIssues.themeSpecificVars.push(...findThemeSpecificVars(relativePath, content));
        
        const missing = checkFileLoadsThemeSystem(relativePath, content);
        if (missing) {
            allIssues.missingThemeSystem.push(missing);
        }
    });
    
    // Report findings
    console.log('='.repeat(100));
    console.log('RESULTS');
    console.log('='.repeat(100) + '\n');
    
    if (allIssues.hardcodedColors.length > 0) {
        console.log(`❌ Found ${allIssues.hardcodedColors.length} hardcoded color(s):\n`);
        allIssues.hardcodedColors.slice(0, 20).forEach(issue => {
            console.log(`  ${issue.file}:${issue.line}`);
            console.log(`    Type: ${issue.type}`);
            console.log(`    Value: ${issue.value}`);
            console.log(`    Context: ${issue.context.substring(0, 80)}...`);
            console.log('');
        });
        if (allIssues.hardcodedColors.length > 20) {
            console.log(`  ... and ${allIssues.hardcodedColors.length - 20} more\n`);
        }
    } else {
        console.log('✅ No hardcoded colours found\n');
    }
    
    if (allIssues.themeSpecificVars.length > 0) {
        console.log(`⚠️  Found ${allIssues.themeSpecificVars.length} direct theme-specific variable usage(s):\n`);
        allIssues.themeSpecificVars.slice(0, 10).forEach(issue => {
            console.log(`  ${issue.file}:${issue.line}`);
            console.log(`    Found: ${issue.value}`);
            console.log(`    Suggestion: ${issue.suggestion}`);
            console.log('');
        });
        if (allIssues.themeSpecificVars.length > 10) {
            console.log(`  ... and ${allIssues.themeSpecificVars.length - 10} more\n`);
        }
    } else {
        console.log('✅ No improper theme-specific variable usage found\n');
    }
    
    if (allIssues.missingThemeSystem.length > 0) {
        console.log(`⚠️  Found ${allIssues.missingThemeSystem.length} page(s) missing theme system:\n`);
        allIssues.missingThemeSystem.forEach(issue => {
            console.log(`  ${issue.file}`);
            if (issue.missing.globals) {
                console.log(`    ❌ Missing: globals.css or colours.css`);
            }
            if (issue.missing.themeSwitcher) {
                console.log(`    ❌ Missing: themeSwitcher.js`);
            }
            console.log('');
        });
    } else {
        console.log('✅ All HTML pages load theme system correctly\n');
    }
    
    console.log('='.repeat(100));
    console.log('SUMMARY');
    console.log('='.repeat(100));
    console.log(`hardcoded colours: ${allIssues.hardcodedColors.length}`);
    console.log(`Theme-specific var usage: ${allIssues.themeSpecificVars.length}`);
    console.log(`Missing theme system: ${allIssues.missingThemeSystem.length}`);
    console.log('='.repeat(100) + '\n');
    
    // Write detailed report to file
    const reportPath = path.join(rootDir, 'test-results/colour-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(allIssues, null, 2));
    console.log(`Detailed report written to: ${reportPath}\n`);
    
    process.exit(allIssues.hardcodedColors.length + allIssues.themeSpecificVars.length + allIssues.missingThemeSystem.length);
}

main();
