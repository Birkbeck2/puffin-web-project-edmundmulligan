/**
 * File: colourPalette.js
 * Author: Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright: (c) 2026 The Embodied Mind
 * License: MIT
 * Description: JavaScript for the colour palette preview page
 */

/**
 * ColourPalette class for managing color conversion, contrast calculation, and display
 */
class ColourPalette {
    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {Array} [r, g, b] values (0-255)
     */
    hslToRgb(h, s, l) {
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
 * @param {Array} rgb - [r, g, b] values (0-255)
 * @returns {number} Relative luminance (0-1)
 */
    relativeLuminance(rgb) {
        const [r, g, b] = rgb.map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - HSL or RGB color string
 * @param {string} color2 - HSL or RGB color string
 * @returns {number} Contrast ratio
 */
    calculateContrast(color1, color2) {
    // Convert RGB to HSL if needed
        if (color1.startsWith('rgb(') || color1.startsWith('rgb ')) {
            color1 = this.rgbToHsl(color1);
        }
        if (color2.startsWith('rgb(') || color2.startsWith('rgb ')) {
            color2 = this.rgbToHsl(color2);
        }
    
        // Normalize both colors to handle different HSL formats
        const normalized1 = this.normalizeHSL(color1);
        const normalized2 = this.normalizeHSL(color2);
    
        // More flexible regex that handles optional decimals and whitespace
        const hslRegex = /hsl\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*,?\s*(\d+(?:\.\d+)?)\s*%\s*\)/;
    
        const match1 = normalized1.match(hslRegex);
        const match2 = normalized2.match(hslRegex);
    
        if (!match1 || !match2) {
            console.warn('Could not parse colors:', {
                original1: color1,
                original2: color2,
                normalized1: normalized1,
                normalized2: normalized2
            });
            return 0;
        }
    
        const rgb1 = this.hslToRgb(parseFloat(match1[1]), parseFloat(match1[2]), parseFloat(match1[3]));
        const rgb2 = this.hslToRgb(parseFloat(match2[1]), parseFloat(match2[2]), parseFloat(match2[3]));
    
        const lum1 = this.relativeLuminance(rgb1);
        const lum2 = this.relativeLuminance(rgb2);
    
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
    
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
 * Determine WCAG compliance level
 * @param {number} ratio - Contrast ratio
 * @returns {string} WCAG level (AAA, AA, A, or Fail)
 */
    getWCAGLevel(ratio) {
        if (ratio >= 7) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        if (ratio >= 3) return 'A';
        return 'Fail';
    }

    /**
 * Parse RGB color to HSL format
 * @param {string} rgbString - RGB color string like 'rgb(255, 0, 0)' or 'rgb(255 0 0)'
 * @returns {string} HSL color string
 */
    rgbToHsl(rgbString) {
    // Parse RGB values - handle both comma and space separated formats
        const match = rgbString.match(/rgb[a]?\(\s*(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
        if (!match) {
            console.warn('Could not parse RGB:', rgbString);
            return rgbString;
        }
    
        let r = parseInt(match[1]) / 255;
        let g = parseInt(match[2]) / 255;
        let b = parseInt(match[3]) / 255;
    
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
            switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
    
        // Use more precision for hue to avoid rounding errors
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
    
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    /**
 * Get computed CSS variable value
 * @param {string} varName - CSS variable name (e.g., '--color-warning-background')
 * @returns {string} Computed color value in HSL format
 */
    getCSSVariableValue(varName) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    
        if (!value) {
            console.warn('No value found for CSS variable:', varName);
            return '';
        }
    
        // If the value is in RGB format (which browsers often return for computed styles), convert to HSL
        if (value.startsWith('rgb(') || value.startsWith('rgb ') || value.startsWith('rgba(')) {
            const hsl = this.rgbToHsl(value);
            return hsl;
        }
    
        return value;
    }

    /**
 * Normalize HSL color string to standard format
 * @param {string} hslString - HSL color string (may have 'deg' suffix) or RGB string
 * @returns {string} Normalized HSL string
 */
    normalizeHSL(hslString) {
    // If it's an RGB string, convert it first
        if (hslString.startsWith('rgb(') || hslString.startsWith('rgb ') || hslString.startsWith('rgba(')) {
            hslString = this.rgbToHsl(hslString);
        }
    
        // Match HSL patterns with or without 'deg' suffix, with commas or spaces
        // Handles: hsl(275deg 100% 25%), hsl(275, 100%, 25%), hsl(275 100% 25%)
        const match = hslString.match(/hsl[a]?\(\s*(\d+(?:\.\d+)?)(?:deg)?\s*[,\s]\s*(\d+(?:\.\d+)?)\s*%\s*[,\s]?\s*(\d+(?:\.\d+)?)\s*%/);
        if (match) {
            return `hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`;
        }
    
        console.warn('Could not normalize HSL:', hslString);
        return hslString;
    }

    /**
 * Initialize color values from CSS variables
 */
    initializeColorValues() {
        const colorValueDivs = document.querySelectorAll('.color-value[data-var]');
    
        colorValueDivs.forEach(div => {
            const varName = div.getAttribute('data-var');
            if (varName) {
                const rawValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                const computedValue = this.getCSSVariableValue(varName);
                const normalizedValue = this.normalizeHSL(computedValue);
            
                // Debug: log the transformation when RGB is converted
                if (rawValue.startsWith('rgb')) {
                    console.log(`${varName}: ${rawValue} -> ${normalizedValue}`);
                }
            
                div.textContent = normalizedValue || computedValue;
            }
        });
    }

    /**
 * Initialize contrast information for all color swatches
 */
    initializeContrastInfo() {
        const contrastDivs = document.querySelectorAll('.contrast-info');
    
        contrastDivs.forEach(div => {
        // Check if we have CSS variable references or direct color values
            const bgVar = div.getAttribute('data-bg-var');
            const fgVar = div.getAttribute('data-fg-var');
        
            let bg = div.getAttribute('data-bg');
            let fg = div.getAttribute('data-fg');
        
            // If CSS variables are specified, get their computed values
            if (bgVar) {
                bg = this.getCSSVariableValue(bgVar);
            }
            if (fgVar) {
                fg = this.getCSSVariableValue(fgVar);
            }
        
            if (bg && fg) {
                const normalizedBg = this.normalizeHSL(bg);
                const normalizedFg = this.normalizeHSL(fg);
                const ratio = this.calculateContrast(normalizedBg, normalizedFg);
            
                if (ratio === 0) {
                    console.error('Contrast calculation failed:', {
                        bgVar,
                        fgVar,
                        bg,
                        fg,
                        normalizedBg,
                        normalizedFg
                    });
                    div.innerHTML = `
                    <span class="wcag-badge" style="background-color: red;">Error</span>
                    Could not calculate contrast
                `;
                } else {
                    const level = this.getWCAGLevel(ratio);
                    div.innerHTML = `
                    Contrast: ${ratio.toFixed(2)}:1
                    <span class="wcag-badge">WCAG ${level}</span>
                `;
                }
            } else {
                console.warn('Missing color values for contrast calculation:', { bgVar, fgVar, bg, fg });
            }
        });
    }

    /**
 * Initialize the color palette display
 */
    initialize() {
        this.initializeColorValues();
        this.initializeContrastInfo();
    }
}

// Create singleton instance and initialize when DOM is loaded
const colourPalette = new ColourPalette();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        colourPalette.initialize();
    });
} else {
    colourPalette.initialize();
}
