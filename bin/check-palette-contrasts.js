#!/usr/bin/env node

/**
 * Script to check all color contrasts in the palette
 * Parses colours.css and calculates WCAG contrast ratios
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculate relative luminance
 */
function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrast(hsl1, hsl2) {
    const rgb1 = hslToRgb(...hsl1);
    const rgb2 = hslToRgb(...hsl2);
    
    const lum1 = relativeLuminance(rgb1);
    const lum2 = relativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse HSL value from CSS
 */
function parseHSL(cssValue) {
    // Match patterns like: hsl(275deg 100% 25%) or hsl(0, 100%, 27%)
    const match = cssValue.match(/hsl\((\d+(?:\.\d+)?)(?:deg)?\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%\)/);
    if (match) {
        return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])];
    }
    return null;
}

/**
 * Parse the CSS file and extract color variables
 */
function parseCSSColors(cssPath) {
    const content = fs.readFileSync(cssPath, 'utf-8');
    const colors = {};
    const rawValues = {};
    
    // First pass: Extract all variable definitions
    const varRegex = /--([a-z0-9-]+):\s*([^;]+);/gi;
    let match;
    
    while ((match = varRegex.exec(content)) !== null) {
        const varName = match[1];
        const value = match[2].trim();
        rawValues[varName] = value;
        
        // Try to parse direct HSL values
        const hsl = parseHSL(value);
        if (hsl) {
            colors[varName] = hsl;
        }
    }
    
    // Second pass: Resolve "hsl(from var(--name) h s l)" references
    for (const [varName, value] of Object.entries(rawValues)) {
        if (!colors[varName]) {
            // Check if it references another variable directly
            const fromMatch = value.match(/hsl\(from var\(--([a-z0-9-]+)\) h s l\)/);
            if (fromMatch) {
                const refVar = fromMatch[1];
                if (colors[refVar]) {
                    colors[varName] = colors[refVar];
                }
            }
            
            // Check if it modifies a variable's lightness
            const modMatch = value.match(/hsl\(from var\(--([a-z0-9-]+)\) h s (\d+)%\)/);
            if (modMatch) {
                const refVar = modMatch[1];
                const newL = parseFloat(modMatch[2]);
                if (colors[refVar]) {
                    colors[varName] = [colors[refVar][0], colors[refVar][1], newL];
                }
            }
            
            // Check if it's a direct hsl without deg
            const directMatch = value.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
            if (directMatch) {
                colors[varName] = [parseFloat(directMatch[1]), parseFloat(directMatch[2]), parseFloat(directMatch[3])];
            }
        }
    }
    
    return colors;
}

// colour pair definitions from the palette
const colorPairs = [
    // Non-theme colors
    { bg: 'color-warning-background', fg: 'color-warning-text', name: 'Warning Popovers' },
    { bg: 'color-error-background', fg: 'color-error-text', name: 'Error Popovers' },
    
    // Normal Light Theme
    { bg: 'color-normal-light-page-background', fg: 'color-normal-light-page-text', name: 'Normal Light - Page' },
    { bg: 'color-normal-light-headings-background', fg: 'color-normal-light-headings-text', name: 'Normal Light - Header/Footer' },
    { bg: 'color-normal-light-code-background', fg: 'color-normal-light-code-text', name: 'Normal Light - Code' },
    { bg: 'color-normal-light-button-background', fg: 'color-normal-light-button-text', name: 'Normal Light - Button Normal' },
    { bg: 'color-normal-light-button-background-hover', fg: 'color-normal-light-button-text-hover', name: 'Normal Light - Button Hover' },
    { bg: 'color-normal-light-button-background-selected', fg: 'color-normal-light-button-text-selected', name: 'Normal Light - Button Selected' },
    { bg: 'color-normal-light-link-background', fg: 'color-normal-light-link-text', name: 'Normal Light - Link Normal' },
    { bg: 'color-normal-light-link-background-hover', fg: 'color-normal-light-link-text-hover', name: 'Normal Light - Link Hover' },
    { bg: 'color-normal-light-link-background-visited', fg: 'color-normal-light-link-text-visited', name: 'Normal Light - Link Visited' },
    
    // Normal Dark Theme
    { bg: 'color-normal-dark-page-background', fg: 'color-normal-dark-page-text', name: 'Normal Dark - Page' },
    { bg: 'color-normal-dark-headings-background', fg: 'color-normal-dark-headings-text', name: 'Normal Dark - Header/Footer' },
    { bg: 'color-normal-dark-code-background', fg: 'color-normal-dark-code-text', name: 'Normal Dark - Code' },
    { bg: 'color-normal-dark-button-background', fg: 'color-normal-dark-button-text', name: 'Normal Dark - Button Normal' },
    { bg: 'color-normal-dark-button-background-hover', fg: 'color-normal-dark-button-text-hover', name: 'Normal Dark - Button Hover' },
    { bg: 'color-normal-dark-button-background-selected', fg: 'color-normal-dark-button-text-selected', name: 'Normal Dark - Button Selected' },
    { bg: 'color-normal-dark-link-background', fg: 'color-normal-dark-link-text', name: 'Normal Dark - Link Normal' },
    { bg: 'color-normal-dark-link-background-hover', fg: 'color-normal-dark-link-text-hover', name: 'Normal Dark - Link Hover' },
    { bg: 'color-normal-dark-link-background-visited', fg: 'color-normal-dark-link-text-visited', name: 'Normal Dark - Link Visited' },
    
    // Subdued Light Theme
    { bg: 'color-subdued-light-page-background', fg: 'color-subdued-light-page-text', name: 'Subdued Light - Page' },
    { bg: 'color-subdued-light-headings-background', fg: 'color-subdued-light-headings-text', name: 'Subdued Light - Header/Footer' },
    { bg: 'color-subdued-light-code-background', fg: 'color-subdued-light-code-text', name: 'Subdued Light - Code' },
    { bg: 'color-subdued-light-button-background', fg: 'color-subdued-light-button-text', name: 'Subdued Light - Button Normal' },
    { bg: 'color-subdued-light-button-background-hover', fg: 'color-subdued-light-button-text-hover', name: 'Subdued Light - Button Hover' },
    { bg: 'color-subdued-light-button-background-selected', fg: 'color-subdued-light-button-text-selected', name: 'Subdued Light - Button Selected' },
    { bg: 'color-subdued-light-link-background', fg: 'color-subdued-light-link-text', name: 'Subdued Light - Link Normal' },
    { bg: 'color-subdued-light-link-background-hover', fg: 'color-subdued-light-link-text-hover', name: 'Subdued Light - Link Hover' },
    { bg: 'color-subdued-light-link-background-visited', fg: 'color-subdued-light-link-text-visited', name: 'Subdued Light - Link Visited' },
    
    // Subdued Dark Theme
    { bg: 'color-subdued-dark-page-background', fg: 'color-subdued-dark-page-text', name: 'Subdued Dark - Page' },
    { bg: 'color-subdued-dark-headings-background', fg: 'color-subdued-dark-headings-text', name: 'Subdued Dark - Header/Footer' },
    { bg: 'color-subdued-dark-code-background', fg: 'color-subdued-dark-code-text', name: 'Subdued Dark - Code' },
    { bg: 'color-subdued-dark-button-background', fg: 'color-subdued-dark-button-text', name: 'Subdued Dark - Button Normal' },
    { bg: 'color-subdued-dark-button-background-hover', fg: 'color-subdued-dark-button-text-hover', name: 'Subdued Dark - Button Hover' },
    { bg: 'color-subdued-dark-button-background-selected', fg: 'color-subdued-dark-button-text-selected', name: 'Subdued Dark - Button Selected' },
    { bg: 'color-subdued-dark-link-background', fg: 'color-subdued-dark-link-text', name: 'Subdued Dark - Link Normal' },
    { bg: 'color-subdued-dark-link-background-hover', fg: 'color-subdued-dark-link-text-hover', name: 'Subdued Dark - Link Hover' },
    { bg: 'color-subdued-dark-link-background-visited', fg: 'color-subdued-dark-link-text-visited', name: 'Subdued Dark - Link Visited' },
    
    // Vibrant Light Theme
    { bg: 'color-vibrant-light-page-background', fg: 'color-vibrant-light-page-text', name: 'Vibrant Light - Page' },
    { bg: 'color-vibrant-light-headings-background', fg: 'color-vibrant-light-headings-text', name: 'Vibrant Light - Header/Footer' },
    { bg: 'color-vibrant-light-code-background', fg: 'color-vibrant-light-code-text', name: 'Vibrant Light - Code' },
    { bg: 'color-vibrant-light-button-background', fg: 'color-vibrant-light-button-text', name: 'Vibrant Light - Button Normal' },
    { bg: 'color-vibrant-light-button-background-hover', fg: 'color-vibrant-light-button-text-hover', name: 'Vibrant Light - Button Hover' },
    { bg: 'color-vibrant-light-button-background-selected', fg: 'color-vibrant-light-button-text-selected', name: 'Vibrant Light - Button Selected' },
    { bg: 'color-vibrant-light-link-background', fg: 'color-vibrant-light-link-text', name: 'Vibrant Light - Link Normal' },
    { bg: 'color-vibrant-light-link-background-hover', fg: 'color-vibrant-light-link-text-hover', name: 'Vibrant Light - Link Hover' },
    { bg: 'color-vibrant-light-link-background-visited', fg: 'color-vibrant-light-link-text-visited', name: 'Vibrant Light - Link Visited' },
    
    // Vibrant Dark Theme
    { bg: 'color-vibrant-dark-page-background', fg: 'color-vibrant-dark-page-text', name: 'Vibrant Dark - Page' },
    { bg: 'color-vibrant-dark-headings-background', fg: 'color-vibrant-dark-headings-text', name: 'Vibrant Dark - Header/Footer' },
    { bg: 'color-vibrant-dark-code-background', fg: 'color-vibrant-dark-code-text', name: 'Vibrant Dark - Code' },
    { bg: 'color-vibrant-dark-button-background', fg: 'color-vibrant-dark-button-text', name: 'Vibrant Dark - Button Normal' },
    { bg: 'color-vibrant-dark-button-background-hover', fg: 'color-vibrant-dark-button-text-hover', name: 'Vibrant Dark - Button Hover' },
    { bg: 'color-vibrant-dark-button-background-selected', fg: 'color-vibrant-dark-button-text-selected', name: 'Vibrant Dark - Button Selected' },
    { bg: 'color-vibrant-dark-link-background', fg: 'color-vibrant-dark-link-text', name: 'Vibrant Dark - Link Normal' },
    { bg: 'color-vibrant-dark-link-background-hover', fg: 'color-vibrant-dark-link-text-hover', name: 'Vibrant Dark - Link Hover' },
    { bg: 'color-vibrant-dark-link-background-visited', fg: 'color-vibrant-dark-link-text-visited', name: 'Vibrant Dark - Link Visited' },
];

// Main execution
const cssPath = path.join(__dirname, '..', 'styles', 'globals.css');
const colors = parseCSSColors(cssPath);

console.log('\n=== WCAG Contrast Analysis ===\n');
console.log('AA Standard: 4.5:1 for normal text, 3:1 for large text');
console.log('AAA Standard: 7:1 for normal text, 4.5:1 for large text\n');

let failCount = 0;
let warningCount = 0;

colorPairs.forEach(pair => {
    const bgColor = colors[pair.bg];
    const fgColor = colors[pair.fg];
    
    if (!bgColor || !fgColor) {
        console.log(`⚠️  ${pair.name}: Missing colour definition`);
        return;
    }
    
    const ratio = calculateContrast(bgColor, fgColor);
    let status = '';
    let emoji = '';
    
    if (ratio >= 7) {
        status = 'AAA';
        emoji = '✅';
    } else if (ratio >= 4.5) {
        status = 'AA';
        emoji = '✓';
        warningCount++;
        // Show AA-only (not AAA) contrasts
        console.log(`${emoji} ${pair.name}`);
        console.log(`   Ratio: ${ratio.toFixed(2)}:1 - ${status} (below AAA threshold)`);
        console.log(`   BG: hsl(${bgColor.join(', ')}) | FG: hsl(${fgColor.join(', ')})\n`);
    } else if (ratio >= 3) {
        status = 'FAIL (only passes large text)';
        emoji = '⚠️';
        failCount++;
        console.log(`${emoji} ${pair.name}`);
        console.log(`   Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
        console.log(`   BG: hsl(${bgColor.join(', ')}) | FG: hsl(${fgColor.join(', ')})\n`);
    } else {
        status = 'FAIL';
        emoji = '❌';
        failCount++;
        console.log(`${emoji} ${pair.name}`);
        console.log(`   Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
        console.log(`   BG: hsl(${bgColor.join(', ')}) | FG: hsl(${fgColor.join(', ')})\n`);
    }
});

console.log('\n=== Summary ===');
console.log(`Total pairs checked: ${colorPairs.length}`);
console.log(`Failing AA (< 4.5:1): ${failCount}`);
console.log(`Passing AA only (4.5-7): ${warningCount}`);
console.log(`Passing AAA (>= 7): ${colorPairs.length - failCount - warningCount}`);

if (failCount > 0) {
    console.log('\n⚠️  WARNING: Some colour pair do not meet WCAG AA standards!');
    process.exit(1);
} else {
    console.log('\n✅ All colour pair meet at least WCAG AA standards!');
}
