#!/usr/bin/env node

/*
 **********************************************************************
 * File       : test-button-lesson-contrasts.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License
 * Description:
 *   Test contrast ratios for button and lesson navigation colors
 **********************************************************************
*/

/**
 * Convert an HSL triplet into integer RGB channel values.
 *
 * @remarks Preconditions:
 * - `h` is expected to be in degrees.
 * - `s` and `l` are expected to be percentages in the range 0-100.
 *
 * @param {number} h - Hue in degrees.
 * @param {number} s - Saturation percentage.
 * @param {number} l - Lightness percentage.
 * @returns {number[]} RGB values as `[r, g, b]` in the range 0-255.
 */
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

/**
 * Calculate WCAG relative luminance for an RGB colour.
 *
 * @remarks Preconditions:
 * - Channel values should already be gamma-encoded sRGB integers between 0 and 255.
 *
 * @param {number} r - Red channel.
 * @param {number} g - Green channel.
 * @param {number} b - Blue channel.
 * @returns {number} Relative luminance in the range 0-1.
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
 * - Each RGB argument must be a three-item array produced in the same colour space.
 *
 * @param {number[]} rgb1 - First RGB colour as `[r, g, b]`.
 * @param {number[]} rgb2 - Second RGB colour as `[r, g, b]`.
 * @returns {number} Contrast ratio where `1` means no contrast and larger is better.
 */
function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Test colors
const tests = [
    {
        name: "Normal Light Buttons Selected",
        bg: { h: 180, s: 100, l: 18 }, // hsl(180deg 100% 18%)
        fg: { h: 0, s: 0, l: 100 }     // white
    },
    {
        name: "Normal Light Lessons Navigation Normal",
        bg: { h: 180, s: 100, l: 16 }, // hsl(180deg 100% 16%)
        fg: { h: 0, s: 0, l: 100 }     // white
    },
    {
        name: "Normal Light Lessons Navigation Hover",
        bg: { h: 180, s: 100, l: 10 }, // hsl(180deg 100% 10%)
        fg: { h: 180, s: 100, l: 94 }  // light cyan
    },
    {
        name: "Normal Dark Buttons Selected",
        bg: { h: 180, s: 100, l: 18 }, // hsl(180deg 100% 18%)
        fg: { h: 0, s: 0, l: 100 }     // white
    },
    {
        name: "Normal Dark Lessons Navigation Visited",
        bg: { h: 300, s: 100, l: 16 }, // hsl(300deg 100% 16%)
        fg: { h: 300, s: 100, l: 94 }  // light magenta
    }
];

console.log('\nButton and Lesson Navigation Contrast Tests:\n');
console.log('='.repeat(80));

tests.forEach(test => {
    const bgRgb = hslToRgb(test.bg.h, test.bg.s, test.bg.l);
    const fgRgb = hslToRgb(test.fg.h, test.fg.s, test.fg.l);
    const ratio = getContrastRatio(bgRgb, fgRgb);
    const wcagAA = ratio >= 4.5 ? 'PASS' : 'FAIL';
    const wcagAAA = ratio >= 7.0 ? 'PASS' : 'FAIL';
    
    console.log(`\n${test.name}`);
    console.log(`  Background: hsl(${test.bg.h}deg ${test.bg.s}% ${test.bg.l}%) = rgb(${bgRgb.join(', ')})`);
    console.log(`  Foreground: hsl(${test.fg.h}deg ${test.fg.s}% ${test.fg.l}%) = rgb(${fgRgb.join(', ')})`);
    console.log(`  Contrast Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  WCAG AA (4.5:1): ${wcagAA}`);
    console.log(`  WCAG AAA (7:1): ${wcagAAA}`);
});

console.log('\n' + '='.repeat(80) + '\n');
