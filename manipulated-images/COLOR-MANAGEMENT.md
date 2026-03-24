# Color Management System

## Overview

This project uses a unified color system where colors are defined once in CSS (using HSL) and automatically converted to LaTeX (using HSB) during the build process.

## How It Works

### Source of Truth
- **File**: `styles/colors.css`
- **Format**: CSS custom properties with HSL colors
- All colors must be defined using the HSL format: `--color-name: hsl(h, s%, l%);`

### Automatic Conversion
- **Script**: `artwork/bin/generate-colors-from-css.py`
- **Output**: `artwork/common/colours.tex`
- Converts HSL (Hue, Saturation, Lightness) to HSB (Hue, Saturation, Brightness)
- Runs automatically during the image generation process

### Build Integration
The color conversion is integrated into `artwork/bin/generate-all-images.sh` and runs automatically before generating any images.

## Usage

### Defining Colors

Edit `styles/colors.css` and add your colors using HSL format:

```css
:root {
    --color-my-blue: hsl(210, 80%, 50%);
    --color-my-red: hsl(0, 100%, 50%);
}
```

### Using Colors in CSS

Reference the CSS custom properties:

```css
.my-element {
    background-color: var(--color-my-blue);
}
```

### Using Colors in LaTeX

The colors are automatically available in LaTeX. The color name is converted from kebab-case to snake_case:

```latex
\usepackage{xcolor}
\input{common/colours.tex}

% Use the color
\textcolor{color_my_blue}{This text is blue}
```

### Manual Color Generation

If you need to regenerate colors without building images:

```bash
cd artwork
./bin/generate-colors-from-css.py ../styles/colors.css common/colours.tex
```

## Color Format Conversion

### HSL (used in CSS)
- **Hue**: 0-360 degrees (color wheel)
- **Saturation**: 0-100% (intensity)
- **Lightness**: 0-100% (light to dark)

### HSB (used in LaTeX)
- **Hue**: 0-1 (normalized from 0-360°)
- **Saturation**: 0-1 (normalized from %)
- **Brightness**: 0-1 (normalized from %)

The conversion formula ensures colors look the same in both web and LaTeX documents.

## Benefits

1. **Single Source of Truth**: Define colors once in CSS
2. **Automatic Sync**: LaTeX colors update automatically
3. **No Manual Conversion**: Script handles HSL → HSB conversion
4. **Build Integration**: Runs seamlessly during image generation
5. **Human-Readable**: HSL is more intuitive than RGB

## Files

- `styles/colors.css` - Source color definitions (edit this)
- `artwork/bin/generate-colors-from-css.py` - Conversion script
- `artwork/common/colours.tex` - Generated LaTeX colors (auto-generated, don't edit)
- `artwork/bin/generate-all-images.sh` - Build script with automatic color generation

## Troubleshooting

### Colors not updating in LaTeX?
Run the image generation script:
```bash
cd artwork
./bin/generate-all-images.sh
```

### Want to verify color conversion?
Check the generated `artwork/common/colours.tex` file - it includes comments showing the original CSS HSL values.

### Need RGB instead?
While this system avoids RGB, you can still get RGB values from HSL using online converters if needed for other tools.
