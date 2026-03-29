#!/usr/bin/env node

/*
 **********************************************************************
 * File       : check-palette-contrasts.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Script to check all colour contrasts in the palette
 *   Parses colours.css and calculates WCAG contrast ratios
 **********************************************************************
*/

const fs = require('fs');
const path = require('path');

/**
 * Convert an HSL colour into RGB channel values.
 *
 * @remarks Preconditions:
 * - `h` is expected in degrees.
 * - `s` and `l` are expected as percentages in the range 0-100.
 *
 * @param {number} h - Hue in degrees.
 * @param {number} s - Saturation percentage.
 * @param {number} l - Lightness percentage.
 * @returns {number[]} RGB values as `[r, g, b]`.
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
 * Calculate WCAG relative luminance for an RGB colour.
 *
 * @remarks Preconditions:
 * - `rgb` must contain exactly three 0-255 sRGB channel values.
 *
 * @param {number[]} rgb - RGB triplet.
 * @returns {number} Relative luminance in the range 0-1.
 */
function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate the WCAG contrast ratio between two HSL colours.
 *
 * @remarks Preconditions:
 * - Each input must be an `[h, s, l]` array using degrees and percentages.
 *
 * @param {number[]} hsl1 - First HSL colour.
 * @param {number[]} hsl2 - Second HSL colour.
 * @returns {number} Contrast ratio.
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
 * Parse a CSS HSL string into numeric channel values.
 *
 * @remarks Preconditions:
 * - The parser only handles direct `hsl(...)` syntax supported by the stylesheet in this project.
 *
 * @param {string} cssValue - CSS value to parse.
 * @returns {(number[]|null)} Parsed `[h, s, l]` values or `null`.
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
 * Parse the colour stylesheet and resolve supported variable references.
 *
 * @remarks Preconditions:
 * - `cssPath` must point to a readable CSS file.
 * - The stylesheet is expected to use direct HSL values or the limited `hsl(from var(...))` patterns handled below.
 *
 * @param {string} cssPath - Path to the CSS file to analyse.
 * @returns {Object<string, number[]>} Resolved colour variables keyed by variable name.
 */
function parseCSSColours(cssPath) {
    const content = fs.readFileSync(cssPath, 'utf-8');
    const colours = {};
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
            colours[varName] = hsl;
        }
    }
    
    // Second pass: Resolve "hsl(from var(--name) h s l)" references
    for (const [varName, value] of Object.entries(rawValues)) {
        if (!colours[varName]) {
            // Check if it references another variable directly
            const fromMatch = value.match(/hsl\(from var\(--([a-z0-9-]+)\) h s l\)/);
            if (fromMatch) {
                const refVar = fromMatch[1];
                if (colours[refVar]) {
                    colours[varName] = colours[refVar];
                }
            }
            
            // Check if it modifies a variable's lightness
            const modMatch = value.match(/hsl\(from var\(--([a-z0-9-]+)\) h s (\d+)%\)/);
            if (modMatch) {
                const refVar = modMatch[1];
                const newL = parseFloat(modMatch[2]);
                if (colours[refVar]) {
                    colours[varName] = [colours[refVar][0], colours[refVar][1], newL];
                }
            }
            
            // Check if it's a direct hsl without deg
            const directMatch = value.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
            if (directMatch) {
                colours[varName] = [parseFloat(directMatch[1]), parseFloat(directMatch[2]), parseFloat(directMatch[3])];
            }
        }
    }
    
    return colours;
}

// colour pair definitions from the palette
const colourPairs = [
    // Non-theme colours
    { bg: 'colour-warning-background', fg: 'colour-warning-text', name: 'Warning Popovers' },
    { bg: 'colour-error-background', fg: 'colour-error-text', name: 'Error Popovers' },
    
    // Normal Light Theme
    { bg: 'colour-normal-light-page-background', fg: 'colour-normal-light-page-text', name: 'Normal Light - Page' },
    { bg: 'colour-normal-light-headings-background', fg: 'colour-normal-light-headings-text', name: 'Normal Light - Header/Footer' },
    { bg: 'colour-normal-light-code-background', fg: 'colour-normal-light-code-text', name: 'Normal Light - Code' },
    { bg: 'colour-normal-light-button-background', fg: 'colour-normal-light-button-text', name: 'Normal Light - Button Normal' },
    { bg: 'colour-normal-light-button-background-hover', fg: 'colour-normal-light-button-text-hover', name: 'Normal Light - Button Hover' },
    { bg: 'colour-normal-light-button-background-selected', fg: 'colour-normal-light-button-text-selected', name: 'Normal Light - Button Selected' },
    { bg: 'colour-normal-light-link-background', fg: 'colour-normal-light-link-text', name: 'Normal Light - Link Normal' },
    { bg: 'colour-normal-light-link-background-hover', fg: 'colour-normal-light-link-text-hover', name: 'Normal Light - Link Hover' },
    { bg: 'colour-normal-light-link-background-visited', fg: 'colour-normal-light-link-text-visited', name: 'Normal Light - Link Visited' },
    
    // Normal Dark Theme
    { bg: 'colour-normal-dark-page-background', fg: 'colour-normal-dark-page-text', name: 'Normal Dark - Page' },
    { bg: 'colour-normal-dark-headings-background', fg: 'colour-normal-dark-headings-text', name: 'Normal Dark - Header/Footer' },
    { bg: 'colour-normal-dark-code-background', fg: 'colour-normal-dark-code-text', name: 'Normal Dark - Code' },
    { bg: 'colour-normal-dark-button-background', fg: 'colour-normal-dark-button-text', name: 'Normal Dark - Button Normal' },
    { bg: 'colour-normal-dark-button-background-hover', fg: 'colour-normal-dark-button-text-hover', name: 'Normal Dark - Button Hover' },
    { bg: 'colour-normal-dark-button-background-selected', fg: 'colour-normal-dark-button-text-selected', name: 'Normal Dark - Button Selected' },
    { bg: 'colour-normal-dark-link-background', fg: 'colour-normal-dark-link-text', name: 'Normal Dark - Link Normal' },
    { bg: 'colour-normal-dark-link-background-hover', fg: 'colour-normal-dark-link-text-hover', name: 'Normal Dark - Link Hover' },
    { bg: 'colour-normal-dark-link-background-visited', fg: 'colour-normal-dark-link-text-visited', name: 'Normal Dark - Link Visited' },
    
    // Subdued Light Theme
    { bg: 'colour-subdued-light-page-background', fg: 'colour-subdued-light-page-text', name: 'Subdued Light - Page' },
    { bg: 'colour-subdued-light-headings-background', fg: 'colour-subdued-light-headings-text', name: 'Subdued Light - Header/Footer' },
    { bg: 'colour-subdued-light-code-background', fg: 'colour-subdued-light-code-text', name: 'Subdued Light - Code' },
    { bg: 'colour-subdued-light-button-background', fg: 'colour-subdued-light-button-text', name: 'Subdued Light - Button Normal' },
    { bg: 'colour-subdued-light-button-background-hover', fg: 'colour-subdued-light-button-text-hover', name: 'Subdued Light - Button Hover' },
    { bg: 'colour-subdued-light-button-background-selected', fg: 'colour-subdued-light-button-text-selected', name: 'Subdued Light - Button Selected' },
    { bg: 'colour-subdued-light-link-background', fg: 'colour-subdued-light-link-text', name: 'Subdued Light - Link Normal' },
    { bg: 'colour-subdued-light-link-background-hover', fg: 'colour-subdued-light-link-text-hover', name: 'Subdued Light - Link Hover' },
    { bg: 'colour-subdued-light-link-background-visited', fg: 'colour-subdued-light-link-text-visited', name: 'Subdued Light - Link Visited' },
    
    // Subdued Dark Theme
    { bg: 'colour-subdued-dark-page-background', fg: 'colour-subdued-dark-page-text', name: 'Subdued Dark - Page' },
    { bg: 'colour-subdued-dark-headings-background', fg: 'colour-subdued-dark-headings-text', name: 'Subdued Dark - Header/Footer' },
    { bg: 'colour-subdued-dark-code-background', fg: 'colour-subdued-dark-code-text', name: 'Subdued Dark - Code' },
    { bg: 'colour-subdued-dark-button-background', fg: 'colour-subdued-dark-button-text', name: 'Subdued Dark - Button Normal' },
    { bg: 'colour-subdued-dark-button-background-hover', fg: 'colour-subdued-dark-button-text-hover', name: 'Subdued Dark - Button Hover' },
    { bg: 'colour-subdued-dark-button-background-selected', fg: 'colour-subdued-dark-button-text-selected', name: 'Subdued Dark - Button Selected' },
    { bg: 'colour-subdued-dark-link-background', fg: 'colour-subdued-dark-link-text', name: 'Subdued Dark - Link Normal' },
    { bg: 'colour-subdued-dark-link-background-hover', fg: 'colour-subdued-dark-link-text-hover', name: 'Subdued Dark - Link Hover' },
    { bg: 'colour-subdued-dark-link-background-visited', fg: 'colour-subdued-dark-link-text-visited', name: 'Subdued Dark - Link Visited' },
    
    // Vibrant Light Theme
    { bg: 'colour-vibrant-light-page-background', fg: 'colour-vibrant-light-page-text', name: 'Vibrant Light - Page' },
    { bg: 'colour-vibrant-light-headings-background', fg: 'colour-vibrant-light-headings-text', name: 'Vibrant Light - Header/Footer' },
    { bg: 'colour-vibrant-light-code-background', fg: 'colour-vibrant-light-code-text', name: 'Vibrant Light - Code' },
    { bg: 'colour-vibrant-light-button-background', fg: 'colour-vibrant-light-button-text', name: 'Vibrant Light - Button Normal' },
    { bg: 'colour-vibrant-light-button-background-hover', fg: 'colour-vibrant-light-button-text-hover', name: 'Vibrant Light - Button Hover' },
    { bg: 'colour-vibrant-light-button-background-selected', fg: 'colour-vibrant-light-button-text-selected', name: 'Vibrant Light - Button Selected' },
    { bg: 'colour-vibrant-light-link-background', fg: 'colour-vibrant-light-link-text', name: 'Vibrant Light - Link Normal' },
    { bg: 'colour-vibrant-light-link-background-hover', fg: 'colour-vibrant-light-link-text-hover', name: 'Vibrant Light - Link Hover' },
    { bg: 'colour-vibrant-light-link-background-visited', fg: 'colour-vibrant-light-link-text-visited', name: 'Vibrant Light - Link Visited' },
    
    // Vibrant Dark Theme
    { bg: 'colour-vibrant-dark-page-background', fg: 'colour-vibrant-dark-page-text', name: 'Vibrant Dark - Page' },
    { bg: 'colour-vibrant-dark-headings-background', fg: 'colour-vibrant-dark-headings-text', name: 'Vibrant Dark - Header/Footer' },
    { bg: 'colour-vibrant-dark-code-background', fg: 'colour-vibrant-dark-code-text', name: 'Vibrant Dark - Code' },
    { bg: 'colour-vibrant-dark-button-background', fg: 'colour-vibrant-dark-button-text', name: 'Vibrant Dark - Button Normal' },
    { bg: 'colour-vibrant-dark-button-background-hover', fg: 'colour-vibrant-dark-button-text-hover', name: 'Vibrant Dark - Button Hover' },
    { bg: 'colour-vibrant-dark-button-background-selected', fg: 'colour-vibrant-dark-button-text-selected', name: 'Vibrant Dark - Button Selected' },
    { bg: 'colour-vibrant-dark-link-background', fg: 'colour-vibrant-dark-link-text', name: 'Vibrant Dark - Link Normal' },
    { bg: 'colour-vibrant-dark-link-background-hover', fg: 'colour-vibrant-dark-link-text-hover', name: 'Vibrant Dark - Link Hover' },
    { bg: 'colour-vibrant-dark-link-background-visited', fg: 'colour-vibrant-dark-link-text-visited', name: 'Vibrant Dark - Link Visited' },
];

// Main execution
const cssPath = path.join(__dirname, '..', 'styles', 'colours.css');
const colours = parseCSSColours(cssPath);

console.log('\n=== WCAG Contrast Analysis ===\n');
console.log('AA Standard: 4.5:1 for normal text, 3:1 for large text');
console.log('AAA Standard: 7:1 for normal text, 4.5:1 for large text\n');

let failCount = 0;
let warningCount = 0;

colourPairs.forEach(pair => {
    const bgColour = colours[pair.bg];
    const fgColour = colours[pair.fg];
    
    if (!bgColour || !fgColour) {
        console.log(`⚠️  ${pair.name}: Missing colour definition`);
        return;
    }
    
    const ratio = calculateContrast(bgColour, fgColour);
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
        console.log(`   BG: hsl(${bgColour.join(', ')}) | FG: hsl(${fgColour.join(', ')})\n`);
    } else if (ratio >= 3) {
        status = 'FAIL (only passes large text)';
        emoji = '⚠️';
        failCount++;
        console.log(`${emoji} ${pair.name}`);
        console.log(`   Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
        console.log(`   BG: hsl(${bgColour.join(', ')}) | FG: hsl(${fgColour.join(', ')})\n`);
    } else {
        status = 'FAIL';
        emoji = '❌';
        failCount++;
        console.log(`${emoji} ${pair.name}`);
        console.log(`   Ratio: ${ratio.toFixed(2)}:1 - ${status}`);
        console.log(`   BG: hsl(${bgColour.join(', ')}) | FG: hsl(${fgColour.join(', ')})\n`);
    }
});

console.log('\n=== Summary ===');
console.log(`Total pairs checked: ${colourPairs.length}`);
console.log(`Failing AA (< 4.5:1): ${failCount}`);
console.log(`Passing AA only (4.5-7): ${warningCount}`);
console.log(`Passing AAA (>= 7): ${colourPairs.length - failCount - warningCount}`);

if (failCount > 0) {
    console.log('\n⚠️  WARNING: Some colour pair do not meet WCAG AA standards!');
    process.exit(1);
} else {
    console.log('\n✅ All colour pair meet at least WCAG AA standards!');
}
