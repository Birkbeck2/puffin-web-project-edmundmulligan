#!/usr/bin/env node

/*
 **********************************************************************
 * File       : verify-all-contrasts.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Comprehensive contrast verification for all colors in colourPalette.html
 **********************************************************************
*/

const fs = require('fs');
const path = require('path');

/**
 * Convert HSL values into RGB channel values.
 *
 * @remarks Preconditions:
 * - `h` should be supplied in degrees.
 * - `s` and `l` should be supplied as percentages between 0 and 100.
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
 * - Channel inputs are expected to be 0-255 sRGB values.
 *
 * @param {number} r - Red channel.
 * @param {number} g - Green channel.
 * @param {number} b - Blue channel.
 * @returns {number} Relative luminance value.
 */
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate the WCAG contrast ratio between two RGB colours.
 *
 * @remarks Preconditions:
 * - Each input must be a three-item RGB array in the same colour space.
 *
 * @param {number[]} rgb1 - First RGB colour.
 * @param {number[]} rgb2 - Second RGB colour.
 * @returns {number} Contrast ratio.
 */
function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse a CSS `hsl(...)` string into numeric HSL channels.
 *
 * @remarks Preconditions:
 * - The function expects either degree-based or comma-separated HSL syntax.
 * - Unsupported colour syntaxes return `null` rather than throwing.
 *
 * @param {string} hslString - CSS HSL string to parse.
 * @returns {{h: number, s: number, l: number}|null} Parsed channels or `null`.
 */
function parseHSL(hslString) {
    // Handle both "hsl(180deg 100% 50%)" and "hsl(180, 100%, 50%)" formats
    const match = hslString.match(/hsl\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d+(?:\.\d+)?)\s*%\s*[,\s]?\s*(\d+(?:\.\d+)?)\s*%/);
    if (match) {
        return {
            h: parseFloat(match[1]),
            s: parseFloat(match[2]),
            l: parseFloat(match[3])
        };
    }
    return null;
}

/**
 * Extract theme colour definitions from the CSS source.
 *
 * @remarks Preconditions:
 * - `cssContent` should contain the full contents of `styles/colours.css`.
 * - This parser only understands `--colour-*` variables expressed directly in HSL syntax.
 *
 * @param {string} cssContent - CSS source to inspect.
 * @returns {Object<string, {hsl: string, h: number, s: number, l: number, rgb: number[]}>}
 * Extracted colour map keyed by CSS variable name.
 */
function extractColors(cssContent) {
    const colors = {};
    const lines = cssContent.split('\n');
    
    for (const line of lines) {
        const match = line.match(/--colour-([a-z-]+):\s*(hsl\([^)]+\))/);
        if (match) {
            const varName = '--colour-' + match[1];
            const hslValue = match[2];
            const parsed = parseHSL(hslValue);
            if (parsed) {
                colors[varName] = {
                    hsl: hslValue,
                    h: parsed.h,
                    s: parsed.s,
                    l: parsed.l,
                    rgb: hslToRgb(parsed.h, parsed.s, parsed.l)
                };
            }
        }
    }
    
    return colors;
}

/**
 * Extract unique background/foreground variable pairs from the diagnostic HTML.
 *
 * @remarks Preconditions:
 * - `htmlContent` should come from the diagnostics page that uses `data-bg-var` and `data-fg-var` attributes.
 *
 * @param {string} htmlContent - Diagnostic HTML content to scan.
 * @returns {Array<{bg: string, fg: string}>} Unique colour-variable pairs.
 */
function extractColorPairs(htmlContent) {
    const pairs = [];
    const regex = /data-bg-var="(--colour-[^"]+)"\s+data-fg-var="(--colour-[^"]+)"/g;
    let match;
    
    while ((match = regex.exec(htmlContent)) !== null) {
        pairs.push({
            bg: match[1],
            fg: match[2]
        });
    }
    
    // Remove duplicates
    const uniquePairs = [];
    const seen = new Set();
    for (const pair of pairs) {
        const key = `${pair.bg}|${pair.fg}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePairs.push(pair);
        }
    }
    
    return uniquePairs;
}

/**
 * Run the full contrast verification for every unique pair defined in the diagnostics page.
 *
 * @remarks Preconditions:
 * - `styles/colours.css` and `diagnostics/colourPalette.html` must both exist.
 * - The diagnostic HTML must reference colour pairs using the expected data attributes.
 *
 * @returns {void}
 */
function main() {
    const cssPath = path.join(__dirname, '../styles/colours.css');
    const htmlPath = path.join(__dirname, '../diagnostics/colourPalette.html');
    
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const colors = extractColors(cssContent);
    const pairs = extractColorPairs(htmlContent);
    
    console.log('\n' + '='.repeat(100));
    console.log('COMPREHENSIVE COLOR CONTRAST VERIFICATION');
    console.log('='.repeat(100) + '\n');
    
    console.log(`Total unique color variables: ${Object.keys(colors).length}`);
    console.log(`Total colour pair to test: ${pairs.length}\n`);
    
    let passing = 0;
    let aaOnly = 0;
    let failing = 0;
    const results = [];
    
    for (const pair of pairs) {
        const bgColor = colors[pair.bg];
        const fgColor = colors[pair.fg];
        
        if (!bgColor || !fgColor) {
            console.warn(`Warning: Missing colour definition for ${pair.bg} or ${pair.fg}`);
            continue;
        }
        
        const ratio = getContrastRatio(bgColor.rgb, fgColor.rgb);
        const wcagAAA = ratio >= 7.0;
        const wcagAA = ratio >= 4.5;
        
        let status, level;
        if (wcagAAA) {
            status = 'PASS';
            level = 'AAA';
            passing++;
        } else if (wcagAA) {
            status = 'PASS';
            level = 'AA ';
            aaOnly++;
            passing++;
        } else {
            status = 'FAIL';
            level = '-- ';
            failing++;
        }
        
        results.push({
            pair,
            bgColor,
            fgColor,
            ratio,
            status,
            level
        });
    }
    
    // Sort by status (failing first) then by ratio
    results.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'FAIL' ? -1 : 1;
        }
        return a.ratio - b.ratio;
    });
    
    // Display results
    for (const result of results) {
        const { pair, bgColor, fgColor, ratio, status, level } = result;
        
        console.log(`${status} [${level}] ${ratio.toFixed(2)}:1`);
        console.log(`  Background: ${pair.bg}`);
        console.log(`    Value: ${bgColor.hsl} = rgb(${bgColor.rgb.join(', ')})`);
        console.log(`  Foreground: ${pair.fg}`);
        console.log(`    Value: ${fgColor.hsl} = rgb(${fgColor.rgb.join(', ')})`);
        console.log('');
    }
    
    console.log('='.repeat(100));
    console.log('SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total pairs tested: ${results.length}`);
    console.log(`Passing (AAA 7:1+): ${passing - aaOnly} (${((passing - aaOnly) / results.length * 100).toFixed(1)}%)`);
    console.log(`Passing (AA 4.5:1): ${aaOnly} (${(aaOnly / results.length * 100).toFixed(1)}%)`);
    console.log(`Failing (<4.5:1): ${failing} (${(failing / results.length * 100).toFixed(1)}%)`);
    console.log('='.repeat(100) + '\n');
    
    if (failing > 0) {
        console.error('❌ VERIFICATION FAILED: Some colour pair do not meet WCAG AA standards\n');
        process.exit(1);
    } else {
        console.log('✅ VERIFICATION PASSED: All colour pair meet at least WCAG AA standards\n');
        process.exit(0);
    }
}

main();
