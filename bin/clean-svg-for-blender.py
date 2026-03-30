#!/usr/bin/env python3
"""
Clean SVG files for Blender import by removing Inkscape-specific attributes.
"""

import re
import sys

def clean_svg(input_file, output_file):
    """Remove Inkscape/Sodipodi attributes from SVG for Blender compatibility."""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove Inkscape and Sodipodi namespace declarations
    content = re.sub(r'\s+xmlns:inkscape="[^"]*"', '', content)
    content = re.sub(r'\s+xmlns:sodipodi="[^"]*"', '', content)
    
    # Remove Inkscape export attributes from svg tag
    content = re.sub(r'\s+inkscape:export-[^=]+="[^"]*"', '', content)
    
    # Remove sodipodi:docname attribute
    content = re.sub(r'\s+sodipodi:docname="[^"]*"', '', content)
    
    # Remove inkscape:version attribute
    content = re.sub(r'\s+inkscape:version="[^"]*"', '', content)
    
    # Remove the entire sodipodi:namedview element
    content = re.sub(r'<sodipodi:namedview[^>]*(?:/>|>.*?</sodipodi:namedview>)', '', content, flags=re.DOTALL)
    
    # Remove inkscape attributes from g elements and others
    content = re.sub(r'\s+inkscape:[^=]+="[^"]*"', '', content)
    content = re.sub(r'\s+sodipodi:[^=]+="[^"]*"', '', content)
    
    # Clean up any double spaces or newlines that might have been created
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = re.sub(r'  +', ' ', content)
    
    # Write cleaned content
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Cleaned SVG written to {output_file}")

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: clean-svg-for-blender.py <input.svg> <output.svg>")
        sys.exit(1)
    
    clean_svg(sys.argv[1], sys.argv[2])
