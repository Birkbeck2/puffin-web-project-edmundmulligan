#!/usr/bin/env node

/*
 **********************************************************************
 * File       : test-failing-colours.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Calculate exact contrast ratios for reportedly failing colour pairs
 **********************************************************************
*/

// Function to convert HSL to RGB
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

// Function to calculate relative luminance
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Function to calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

console.log('\n' + '='.repeat(100));
console.log('FAILING colour pair - EXACT CONTRAST CALCULATION');
console.log('='.repeat(100) + '\n');

const tests = [
    {
        name: 'Normal Light Button Selected',
        bg: { h: 180, s: 100, l: 18, desc: 'hsl(180deg 100% 18%) - from dark-cyan' },
        fg: { h: 0, s: 0, l: 100, desc: 'hsl(0deg 0% 100%) - white' }
    },
    {
        name: 'Normal Light Link Normal',
        bg: { h: 180, s: 100, l: 16, desc: 'hsl(180deg 100% 16%) - from dark-cyan' },
        fg: { h: 0, s: 0, l: 100, desc: 'hsl(0deg 0% 100%) - white' }
    },
    {
        name: 'Normal Light Link Hover',
        bg: { h: 180, s: 100, l: 10, desc: 'hsl(180deg 100% 10%) - from dark-cyan' },
        fg: { h: 180, s: 100, l: 94, desc: 'hsl(180deg 100% 94%) - light-cyan' }
    },
    {
        name: 'Normal Dark Button Selected',
        bg: { h: 180, s: 100, l: 18, desc: 'hsl(180deg 100% 18%) - from cyan' },
        fg: { h: 0, s: 0, l: 100, desc: 'hsl(0deg 0% 100%) - white' }
    },
    {
        name: 'Normal Dark Link Visited',
        bg: { h: 300, s: 100, l: 16, desc: 'hsl(300deg 100% 16%) - from purple' },
        fg: { h: 300, s: 100, l: 94, desc: 'hsl(300deg 100% 94%) - from magenta' }
    }
];

let allPassing = true;

tests.forEach(test => {
    const bgRgb = hslToRgb(test.bg.h, test.bg.s, test.bg.l);
    const fgRgb = hslToRgb(test.fg.h, test.fg.s, test.fg.l);
    const ratio = getContrastRatio(bgRgb, fgRgb);
    
    const wcagAAA = ratio >= 7.0;
    const wcagAA = ratio >= 4.5;
    
    let status, level;
    if (wcagAAA) {
        status = '✅ PASS';
        level = 'AAA';
    } else if (wcagAA) {
        status = '✅ PASS';
        level = 'AA ';
    } else {
        status = '❌ FAIL';
        level = 'NONE';
        allPassing = false;
    }
    
    console.log(`${status} [${level}] ${test.name}`);
    console.log(`  Contrast Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  Background: ${test.bg.desc}`);
    console.log(`    RGB: rgb(${bgRgb.join(', ')})`);
    console.log(`  Foreground: ${test.fg.desc}`);
    console.log(`    RGB: rgb(${fgRgb.join(', ')})`);
    console.log('');
});

console.log('='.repeat(100));
console.log('CONCLUSION');
console.log('='.repeat(100));

if (allPassing) {
    console.log('✅ All reported "failing" colors actually PASS WCAG standards.');
    console.log('   Issue: JavaScript parsing error in colourPalette.html');
    console.log('   Solution: Fix the JavaScript/HTML parsing logic\n');
} else {
    console.log('❌ Genuine WCAG failures detected.');
    console.log('   Solution: Update colour values in colours.css\n');
}

process.exit(allPassing ? 0 : 1);
