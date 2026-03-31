#!/usr/bin/env python3
"""
Migrate inline styles in typography.html to CSS classes
"""

import re

def main():
    file_path = 'diagnostics/typography.html'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Font family samples
    font_families = ['text', 'title', 'subtitle', 'menu', 'button', 'mono']
    for family in font_families:
        old = f'<div class="sample-text" style="font-family: var(--font-family-{family});">'
        new = f'<div class="sample-text sample-font-{family}">'
        content = content.replace(old, new)
    
    # Font size demos
    sizes = ['large', 'normal', 'small', 'header-large', 'header-medium', 'header-small', 'button', 'nav']
    for size in sizes:
        old = f'<div style="font-size: var(--fontsize-{size});">'
        new = f'<div class="demo-fontsize-{size}">'
        content = content.replace(old, new)
    
    # Heading hierarchy demos
    for level in range(1, 7):
        old = f'<h{level} style="margin: 0;">'
        new = f'<h{level} class="heading-no-margin">'
        content = content.replace(old, new)
    
    # Font weight demos
    weights = {
        'var(--font-weight-light)': 'light',
        'var(--font-weight-normal)': 'normal',
        '600': 'semibold',
        'var(--font-weight-bold)': 'bold',
    }
    for weight_var, weight_name in weights.items():
        old = f'<div class="sample" style="font-weight: {weight_var};">'
        new = f'<div class="sample demo-weight-{weight_name}">'
        content = content.replace(old, new)
    
    # Line height demo
    old = '<div style="line-height: var(--line-height-normal); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; background: rgba(0,0,0,0.1);">'
    new = '<div class="demo-line-height">'
    content = content.replace(old, new)
    
    # Vertical margins demo
    old = '<div style="border: 1px solid rgba(255,255,255,0.1); padding: 1rem; background: rgba(0,0,0,0.1);">'
    new = '<div class="demo-spacing-container">'
    content = content.replace(old, new)
    
    old = '<p style="margin-top: var(--margin-vertical); margin-bottom: var(--margin-vertical);">'
    new = '<p class="demo-margins-vertical">'
    content = content.replace(old, new)
    
    # Horizontal margins demo
    old = '<div style="margin-left: var(--margin-horizontal); margin-right: var(--margin-horizontal); border: 1px dashed;">'
    new = '<div class="demo-margins-horizontal">'
    content = content.replace(old, new)
    
    # Text samples
    # Paragraph sample
    old = '<p style="font-family: var(--font-family-text); font-size: var(--fontsize-normal); line-height: var(--line-height-normal);">'
    new = '<p class="sample-paragraph">'
    content = content.replace(old, new)
    
    # Code block sample
    old = '<pre style="font-family: var(--font-family-mono); background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 4px; overflow-x: auto;">'
    new = '<pre class="sample-code-block">'
    content = content.replace(old, new)
    
    # Button container
    old = '<div style="display: flex; gap: 1rem; flex-wrap: wrap;">'
    new = '<div class="sample-button-container">'
    content = content.replace(old, new)
    
    # Button samples
    old = '<button type="button" style="font-family: var(--font-family-button); font-size: var(--fontsize-button); padding: 0.5rem 1rem;">'
    new = '<button type="button" class="sample-button">'
    content = content.replace(old, new)
    
    # Navigation sample
    old = '<nav style="font-family: var(--font-family-menu); font-size: var(--fontsize-nav);">'
    new = '<nav class="sample-nav">'
    content = content.replace(old, new)
    
    # Navigation links
    old = '<a href="#" style="margin-right: 1rem;">'
    new = '<a href="#" class="sample-nav-link">'
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
