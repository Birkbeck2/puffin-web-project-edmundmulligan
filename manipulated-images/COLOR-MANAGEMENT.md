# Colour Management System

## Overview

This project uses a unified colour system where colours are defined once in CSS (using HSL) and automatically converted to LaTeX (using HSB) during the build process.

## How It Works

### Source of Truth
- **File**: `styles/colours.css`
- **Format**: CSS custom properties with HSL colours
- All colours must be defined using the HSL format: `--color-name: hsl(h, s%, l%);`

### Automatic Conversion
- **Script**: `artwork/bin/generate-colours-from-css.py`
- **Output**: `artwork/common/colours.tex`
- Converts HSL (Hue, Saturation, Lightness) to HSB (Hue, Saturation, Brightness)
- Runs automatically during the image generation process

### Build Integration
The colour conversion is integrated into `artwork/bin/generate-all-images.sh` and runs automatically before generating any images.

## Usage

### Defining Colours

Edit `styles/colours.css` and add your colours using HSL format:

```css
:root {
    --colour-my-blue: hsl(210, 80%, 50%);
    --colour-my-red: hsl(0, 100%, 50%);
}
```

### Using Colours in CSS

Reference the CSS custom properties:

```css
.my-element {
    background-color: var(--colour-my-blue);
}
```

### Using Colours in LaTeX

The colours are automatically available in LaTeX. The colour name is converted from kebab-case to snake_case:

```latex
\usepackage{xcolor}
\input{common/colours.tex}

% Use the colour
\textcolor{colour_my_blue}{This text is blue}
```

### Manual Colour Generation

If you need to regenerate colours without building images:

```bash
cd artwork
./bin/generate-colours-from-css.py ../styles/colours.css common/colours.tex
```

## Colour Format Conversion

### HSL (used in CSS)
- **Hue**: 0-360 degrees (colour wheel)
- **Saturation**: 0-100% (intensity)
- **Lightness**: 0-100% (light to dark)

### HSB (used in LaTeX)
- **Hue**: 0-1 (normalised from 0-360°)
- **Saturation**: 0-1 (normalised from %)
- **Brightness**: 0-1 (normalised from %)

The conversion formula ensures colours look the same in both web and LaTeX documents.

## Benefits

1. **Single Source of Truth**: Define colours once in CSS
2. **Automatic Sync**: LaTeX colours update automatically
3. **No Manual Conversion**: Script handles HSL → HSB conversion
4. **Build Integration**: Runs seamlessly during image generation
5. **Human-Readable**: HSL is more intuitive than RGB

## Files

- `styles/colours.css` - Source colour definitions (edit this)
- `artwork/bin/generate-colours-from-css.py` - Conversion script
- `artwork/common/colours.tex` - Generated LaTeX colours (auto-generated, don't edit)
- `artwork/bin/generate-all-images.sh` - Build script with automatic colour generation

## Troubleshooting

### Colours not updating in LaTeX?
Run the image generation script:
```bash
cd artwork
./bin/generate-all-images.sh
```

### Want to verify colour conversion?
Check the generated `artwork/common/colours.tex` file - it includes comments showing the original CSS HSL values.

### Need RGB instead?
While this system avoids RGB, you can still get RGB values from HSL using online converters if needed for other tools.
