# Quick Reference Guide

This document provides a quick reference for developers working with the Puffin Web Project JavaScript API.

## Quick Class Reference

| Class | File | Purpose | Key Methods |
|-------|------|---------|-------------|
| `ColourPalette` | `colourPalette.js` | Colour conversion & WCAG compliance | `hslToRgb()`, `calculateContrast()`, `getWCAGLevel()` |
| `ThemeSwitcher` | `themeSwitcher.js` | Theme management | `applyTheme()`, localStorage integration |
| `DebugLogger` | `debug.js` | Conditional logging | `log()`, `warn()`, `error()`, `methodEntry()` |
| `ImageModal` | `modalImage.js` | Full-screen image overlay | Auto keyboard navigation, modal display |
| `CommonCodeInjector` | `injectCommonCode.js` | Header/footer injection | `injectHeader()`, DRY principle |
| `LocalStorage` | `localStorage.js` | Encrypted data storage | `deriveKey()`, form data persistence |
| `LessonNavigationInjector` | `injectLessonNavigation.js` | Dynamic navigation | Auto lesson section detection |

## Common Usage Patterns

### Debug Logging
```javascript
// Enable debug mode via URL: ?debug=on
Debug.log('Debug message');
Debug.warn('Warning message');
Debug.methodEntry('ClassName', 'methodName', {param1: 'value'});
```

### Theme Management
```javascript
// Switch themes programmatically
themeSwitcher.applyTheme('dark', 'vibrant');
themeSwitcher.applyTheme('light', 'normal'); 
```

### Colour Utilities
```javascript 
// Calculate WCAG contrast ratios
const ratio = colourPalette.calculateContrast('hsl(210, 50%, 20%)', 'hsl(210, 50%, 90%)');
const level = colourPalette.getWCAGLevel(ratio); // 'AAA', 'AA', 'A', or 'Fail'
```

### Image Modals
```javascript
// Images with class 'image-button' and data-image-src automatically work
<img class="image-button" data-image-src="path/to/image.jpg" alt="Description">
```

## Architecture Principles

**Modular Design**: Each class handles a specific concern (separation of responsibilities)

**Progressive Enhancement**: JavaScript gracefully enhances HTML/CSS foundation

**Accessibility First**: WCAG 2.2 AAA compliance built into all components

**Debug Support**: Comprehensive logging with conditional output

**Performance**: Efficient DOM manipulation and event handling

**Storage**: Encrypted localStorage for sensitive form data

## Development Standards

### JavaDoc Documentation
All public methods include:
- Parameter types and descriptions
- Return value documentation  
- Usage examples where applicable
- Preconditions and requirements

### Code Style
- Strict mode enabled
- ES6+ class syntax
- Consistent naming conventions
- Error handling for localStorage operations
- Cross-browser compatibility considerations

### Testing & Validation
- Automated colour contrast auditing
- Browser testing utilities
- Accessibility validation scripts
- Link checking and validation

---

*See [JavaScript API Documentation](JavaScript-API-Documentation.md) for complete method signatures and detailed descriptions.*