#!/usr/bin/env python3
"""
Migrate inline styles in colourSwatches.html to CSS classes
"""

import re

def main():
    file_path = 'diagnostics/colourSwatches.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Base colour swatches - need to replace class attribute
    base_colours = {
        'grey': 'white',
        'red': 'white',
        'orange': 'black',
        'yellow': 'black',
        'lime': 'black',
        'green': 'black',
        'turquoise': 'black',
        'cyan': 'black',
        'blue': 'white',
        'navy': 'white',
        'purple': 'white',
        'magenta': 'white',
        'pink': 'black'
    }
    
    for colour, text_color in base_colours.items():
        # Replace swatch-color divs
        old = f'<div class="swatch-color" style="background: var(--colour-{colour}); color: {text_color};">'
        new = f'<div class="swatch-color swatch-color-{colour}">'
        content = content.replace(old, new)
    
    # Theme demo containers and their contents
    themes = [
        ('normal', 'light'),
        ('normal', 'dark'),
        ('subdued', 'light'),
        ('subdued', 'dark'),
        ('vibrant', 'light'),
        ('vibrant', 'dark'),
    ]
    
    for style, theme in themes:
        # Theme demo container
        old = f'<div class="theme-demo" style="background: var(--colour-{style}-{theme}-page-background); color: var(--colour-{style}-{theme}-page-text);">'
        new = f'<div class="theme-demo theme-demo-{style}-{theme}">'
        content = content.replace(old, new)
        
        # Theme headings (h3) - with margin-top
        old = f'<h3 style="background: var(--colour-{style}-{theme}-headings-background); color: var(--colour-{style}-{theme}-headings-text); padding: 0.75rem; border-radius: 4px; margin-top: 1rem;">'
        new = f'<h3 class="theme-heading theme-heading-{style}-{theme} theme-heading-with-margin">'
        content = content.replace(old, new)
        
        # Theme headings (h3) - without margin-top
        old = f'<h3 style="background: var(--colour-{style}-{theme}-headings-background); color: var(--colour-{style}-{theme}-headings-text); padding: 0.75rem; border-radius: 4px;">'
        new = f'<h3 class="theme-heading theme-heading-{style}-{theme}">'
        content = content.replace(old, new)
        
        # Color pairs for page, headings, code
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-page-background); color: var(--colour-{style}-{theme}-page-text);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-page">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-headings-background); color: var(--colour-{style}-{theme}-headings-text);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-headings">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-code-background); color: var(--colour-{style}-{theme}-code-text);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-code">'
        content = content.replace(old, new)
        
        # Button states
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-button-background); color: var(--colour-{style}-{theme}-button-text);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-button">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-button-background-hover); color: var(--colour-{style}-{theme}-button-text-hover);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-button-hover">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-button-background-selected); color: var(--colour-{style}-{theme}-button-text-selected);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-button-selected">'
        content = content.replace(old, new)
        
        # Menu states
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-menu-background); color: var(--colour-{style}-{theme}-menu-text);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-menu">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-menu-background-hover); color: var(--colour-{style}-{theme}-menu-text-hover);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-menu-hover">'
        content = content.replace(old, new)
        
        old = f'<div class="color-pair" style="background: var(--colour-{style}-{theme}-menu-background-visited); color: var(--colour-{style}-{theme}-menu-text-visited);">'
        new = f'<div class="color-pair color-pair-{style}-{theme}-menu-visited">'
        content = content.replace(old, new)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Report
    changes_made = original_content != content
    if changes_made:
        print(f"✓ Migrated inline styles in {file_path}")
        
        # Count remaining inline styles
        remaining = len(re.findall(r'style=', content))
        print(f"  Remaining inline styles: {remaining}")
    else:
        print(f"✗ No changes made to {file_path}")

if __name__ == '__main__':
    main()
