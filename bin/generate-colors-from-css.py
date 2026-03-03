#!/usr/bin/env python3
"""
Generate LaTeX color definitions from CSS custom properties
Reads HSL colors from CSS and converts them to HSB for LaTeX
Author: Edmund Mulligan <edmund@edmundmulligan.name>
License: MIT
"""

import re
import sys
import os
from pathlib import Path


def hsl_to_hsb(h, s, l):
    """
    Convert HSL to HSB (HSV) color space
    
    Args:
        h: Hue (0-360 degrees)
        s: Saturation (0-100%)
        l: Lightness (0-100%)
    
    Returns:
        tuple: (h, s_hsb, b) where h is 0-1, s_hsb is 0-1, b is 0-1
    """
    # Convert percentages to 0-1 range
    s = s / 100.0
    l = l / 100.0
    
    # Convert HSL to HSB
    b = l + s * min(l, 1 - l)
    
    if b == 0:
        s_hsb = 0
    else:
        s_hsb = 2 * (1 - l / b)
    
    # Convert hue to 0-1 range for LaTeX
    h_normalized = h / 360.0
    
    return (h_normalized, s_hsb, b)


def parse_css_colors(css_file_path):
    """
    Parse CSS file and extract color definitions
    
    Args:
        css_file_path: Path to CSS file
    
    Returns:
        dict: Dictionary mapping color names to HSL values
    """
    colors = {}
    
    with open(css_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match CSS custom properties with HSL values
    # Pattern: --color-name: hsl(h, s%, l%);
    pattern = r'--([a-z0-9-]+):\s*hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)'
    
    matches = re.finditer(pattern, content)
    
    for match in matches:
        name = match.group(1)
        h = float(match.group(2))
        s = float(match.group(3))
        l = float(match.group(4))
        colors[name] = (h, s, l)
    
    return colors


def generate_latex_colors(colors):
    """
    Generate LaTeX color definitions from HSL colors
    
    Args:
        colors: Dictionary mapping color names to HSL tuples
    
    Returns:
        str: LaTeX color definitions
    """
    output = []
    output.append('%' * 75)
    output.append('% File: colours.tex')
    output.append('% Author: Edmund Mulligan <edmund@edmundmulligan.name>')
    output.append('% Auto-generated from CSS - DO NOT EDIT MANUALLY')
    output.append('% Run generate-colors-from-css.py to regenerate')
    output.append('% Description: Contains color definitions converted from CSS HSL to LaTeX HSB')
    output.append('%' * 75)
    output.append('')
    
    for name, (h, s, l) in sorted(colors.items()):
        # Convert HSL to HSB
        h_hsb, s_hsb, b = hsl_to_hsb(h, s, l)
        
        # Replace hyphens with underscores for LaTeX color names
        latex_name = name.replace('-', '_')
        
        # Format with 3 decimal places
        output.append(f'\\definecolor{{{latex_name}}}{{hsb}}{{{h_hsb:.3f}, {s_hsb:.3f}, {b:.3f}}}')
        output.append(f'% Original CSS: hsl({h}, {s}%, {l}%)')
        output.append('')
    
    return '\n'.join(output)


def main():
    """Main execution function"""
    if len(sys.argv) < 2:
        print('Usage: generate-colors-from-css.py <css-file> [output-file]')
        print('Example: generate-colors-from-css.py ../../styles/main.css ../common/colours.tex')
        sys.exit(1)
    
    css_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else '../common/colours.tex'
    
    # Check if CSS file exists
    if not os.path.exists(css_file):
        print(f'Error: CSS file not found: {css_file}')
        sys.exit(1)
    
    # Parse colors from CSS
    print(f'Reading colors from {css_file}...')
    colors = parse_css_colors(css_file)
    
    if not colors:
        print('Warning: No HSL colors found in CSS file')
        print('Make sure your CSS uses custom properties with HSL format:')
        print('  --color-name: hsl(180, 100%, 50%);')
    else:
        print(f'Found {len(colors)} color definitions')
    
    # Generate LaTeX color definitions
    latex_output = generate_latex_colors(colors)
    
    # Write to output file
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex_output)
    
    print(f'Generated LaTeX colors in {output_file}')
    print('Done!')


if __name__ == '__main__':
    main()
