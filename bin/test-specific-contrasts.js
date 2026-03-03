#!/usr/bin/env node

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

function relativeLuminance(rgb) {
    const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrast(hsl1, hsl2) {
    const rgb1 = hslToRgb(...hsl1);
    const rgb2 = hslToRgb(...hsl2);
    
    const lum1 = relativeLuminance(rgb1);
    const lum2 = relativeLuminance(rgb2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

console.log('\n=== Testing Specific colour combination ===\n');

const tests = [
    {
        name: 'Normal Light - Code',
        bg: [180, 100, 70],  // medium cyan
        fg: [271, 56, 30]    // dark purple
    },
    {
        name: 'Normal Light - Button Selected',
        bg: [180, 100, 18],  // very dark cyan
        fg: [0, 0, 100]      // white
    },
    {
        name: 'Normal Light - Link Normal',
        bg: [180, 100, 16],  // very dark cyan
        fg: [0, 0, 100]      // white
    },
    {
        name: 'Normal Light - Link Hover',
        bg: [180, 100, 10],  // even darker cyan
        fg: [180, 100, 94]   // light cyan
    },
    {
        name: 'Normal Dark - Code',
        bg: [271, 56, 50],   // medium purple
        fg: [0, 0, 100]      // white
    },
    {
        name: 'Normal Dark - Button Selected',
        bg: [180, 100, 18],  // very dark cyan
        fg: [0, 0, 100]      // white
    },
    {
        name: 'Normal Dark - Link Visited',
        bg: [300, 100, 16],  // very dark magenta
        fg: [300, 100, 94]   // light magenta
    }
];

tests.forEach(test => {
    const ratio = calculateContrast(test.bg, test.fg);
    let status = '';
    if (ratio >= 7) status = 'AAA ✅';
    else if (ratio >= 4.5) status = 'AA ✓';
    else if (ratio >= 3) status = 'A (large text only) ⚠️';
    else status = 'FAIL ❌';
    
    console.log(`${test.name}:`);
    console.log(`  BG: hsl(${test.bg.join(', ')})`);
    console.log(`  FG: hsl(${test.fg.join(', ')})`);
    console.log(`  Ratio: ${ratio.toFixed(2)}:1 - ${status}\n`);
});
