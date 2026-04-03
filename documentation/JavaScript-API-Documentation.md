# JavaScript API Documentation

This document contains the complete API documentation for the Web Witchcraft and Wizardry Project JavaScript modules, derived from JavaDoc comments in the source code.

## Table of Contents

- [ColourPalette Class](#colourpalette-class)
- [ThemeSwitcher Class](#themeswitcher-class) 
- [CommonCodeInjector Class](#commoncodeinjector-class)
- [ImageModal Class](#imagemodal-class)
- [DebugLogger Class](#debuglogger-class)
- [LocalStorage Class](#localstorage-class)
- [LessonNavigationInjector Class](#lessonnavigationinjector-class)
- [Utility Scripts](#utility-scripts)

---

## ColourPalette Class

**File**: `scripts/diagnostics/colourPalette.js`

**Description**: JavaScript for the colour palette preview page. Handles colour conversion, contrast calculation, and display of results. Reads CSS variables, including relative colour syntax, and computes contrast ratios. Displays WCAG compliance levels and logs detailed information for debugging.

### Methods

#### `hslToRgb(h, s, l)`

Convert HSL to RGB. Adapted from https://www.w3.org/TR/css-color-4/#hsl-to-rgb

**Parameters:**
- `h` (number) - Hue (0-360)
- `s` (number) - Saturation (0-100)
- `l` (number) - Lightness (0-100)

**Returns:** `Array` - [r, g, b] values (0-255)

#### `relativeLuminance(rgb)`

Calculate relative luminance. Adapted from https://www.w3.org/TR/WCAG22/#dfn-relative-luminance

**Parameters:**
- `rgb` (Array) - [r, g, b] values (0-255)

**Returns:** `number` - Relative luminance (0-1)

#### `calculateContrast(colour1, colour2)`

Calculate contrast ratio between two colours. Adapted from https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio

**Parameters:**
- `colour1` (string) - HSL or RGB colour string
- `colour2` (string) - HSL or RGB colour string

**Returns:** `number` - Contrast ratio

#### `blendColours(fgColour, bgColour, opacity)`

Blend a foreground colour with a background colour at given opacity.

**Parameters:**
- `fgColour` (string) - Foreground HSL colour string
- `bgColour` (string) - Background HSL colour string  
- `opacity` (number) - Opacity value (0-1)

**Returns:** `string` - Blended HSL colour string

#### `getWCAGLevel(ratio)`

Determine WCAG compliance level.

**Parameters:**
- `ratio` (number) - Contrast ratio

**Returns:** `string` - WCAG level (AAA, AA, A, or Fail)

#### `rgbToHsl(rgbString)`

Parse RGB colour to HSL format. Adapted from https://www.w3.org/TR/css-color-4/#color-conversion-code

**Parameters:**
- `rgbString` (string) - RGB colour string

**Returns:** `string` - HSL colour string

#### `parseRelativeColourSyntax(relativeColourString)`

Parse relative colour syntax: hsl(from var(...) h s 18%)

**Parameters:**
- `relativeColourString` (string) - String like "hsl(from var(...) h s 18%)" or "hsl(from hsl(...) h s 18%)"

**Returns:** `string` - Computed HSL string

---

## ThemeSwitcher Class

**File**: `scripts/themeSwitcher.js`

**Description**: Handles switching between light and dark themes and style variants (normal, subdued, vibrant) based on user preference. Saves choices to localStorage and loads them when pages load. Falls back to browser/system preference if no user choice is saved. Also allows for theme/style to be set via URL parameter for testing purposes. All colour combinations meet WCAG 2.2 AAA standards.

**Preconditions:**
- The page must load the theme variable definitions from the stylesheet layer first.
- Theme and style controls are expected to use the selectors referenced throughout this class.

### Methods

#### `constructor()`

Create the switcher and configure the localStorage keys used for persistence.

**Returns:** `void`

#### `applyTheme(theme, style = null)`

Apply the theme and style to the page.

**Parameters:**
- `theme` (string) - 'light', 'dark', or 'auto'
- `style` (string) - 'normal', 'subdued', or 'vibrant' (optional, defaults to saved or 'normal')

---

## CommonCodeInjector Class

**File**: `scripts/injectCommonCode.js`

**Description**: Injects header and footer into all pages to follow DRY principle.

**Preconditions:**
- The page must contain `header.header` and `footer.footer` placeholders.
- `Debug` must already be available because this class logs during setup.

### Methods

#### `constructor()`

Create the injector and determine the resource prefix for the current page depth.

**Returns:** `void`

#### `determinePathPrefix()`

Determine path prefix based on current page location.

**Returns:** `string` - Path prefix for resources

#### `injectHeader()`

Inject header HTML into the page.

---

## ImageModal Class

**File**: `scripts/modalImage.js`

**Description**: Handles image modal functionality for displaying images in a fullscreen overlay. Provides functions to open and close the modal, handles keyboard navigation (Escape key to close), and prevents body scroll when the modal is open.

**Preconditions:**
- The page must define `#imageModal`, `#modalImage`, and `#modalCaption` elements.
- Clickable triggers are expected to use the `.image-button` convention with `data-image-src`.

### Methods

#### `constructor()`

Create the modal controller, cache DOM references, and register global listeners.

**Returns:** `void`

#### `initElements()`

Initialize DOM element references.

#### `setupEventListeners()`

Set up event listeners for modal functionality.

---

## DebugLogger Class

**File**: `scripts/debug.js`

**Description**: Centralised debug utility for conditional console logging. Controls logging across all scripts via ?debug=on|off query parameter. Usage: Debug.log('message'), Debug.warn('warning'), Debug.error('error')

**Preconditions:**
- Browser support for `URLSearchParams` is assumed.
- localStorage access may fail in restricted contexts, so callers should treat logging as best effort.

### Methods

#### `constructor()`

Create the logger, resolve its enabled state, and emit the current status.

**Returns:** `void`

#### `checkDebugMode()`

Check if debug mode is enabled via query parameter or localStorage.

**Returns:** `boolean` - True if debug mode is enabled

#### `log(...args)`

Conditional console.log.

**Parameters:**
- `...args` (any) - Arguments to log

#### `warn(...args)`

Conditional console.warn.

**Parameters:**
- `...args` (any) - Arguments to log

#### `error(...args)`

Conditional console.error (always logs, but adds context in debug mode).

**Parameters:**
- `...args` (any) - Arguments to log

#### `info(...args)`

Conditional console.info.

**Parameters:**
- `...args` (any) - Arguments to log

#### `debug(...args)`

Conditional console.debug.

**Parameters:**
- `...args` (any) - Arguments to log

#### `table(data)`

Conditional console.table.

**Parameters:**
- `data` (any) - Data to display in table

#### `methodEntry(className, methodName, params = {})`

Log method entry with parameters.

**Parameters:**
- `className` (string) - Name of the class
- `methodName` (string) - Name of the method
- `params` (object) - Parameters passed to method

---

## LocalStorage Class

**File**: `scripts/localStorage.js`

**Description**: Generic form data storage utility with encryption support. Allows storing and retrieving form data with custom storage keys. Can be used with multiple independent forms on the same site.

### Methods

#### `constructor(encryptionKey = 'witchcraft-and-wizardry-school-secure-key-2026')`

Create the storage manager with optional custom encryption key.

#### `deriveKey()`

Derive a cryptographic key from a password.

**Returns:** `Promise<CryptoKey>`

---

## LessonNavigationInjector Class

**File**: `scripts/injectLessonNavigation.js`

**Description**: Dynamically generates and injects the lesson navigation panel based on the number of lesson-section elements on the page. Allows for dynamic updates when sections are added or removed.

**Usage:**
- Automatically injects navigation on page load
- Counts all `.lesson-section` elements (excluding hidden OS-specific sections)
- Generates appropriate number of wand icons for progress bar
- To update when sections change: `window.lessonNavigationInjector.reinitialize()`
- Dispatches 'lessonNavigationInjected' event when complete

**Preconditions:**
- Lesson pages must use the `.lesson-section` convention.
- Hidden OS-specific sections must keep the `lesson-install-` naming scheme so they can be excluded.

### Methods

#### `constructor()`

Create the injector, reset derived state, and begin initialization.

**Returns:** `void`

#### `init()`

Initialize the injector.

---

## Utility Scripts

### audit-colour-usage.js

**File**: `bin/audit-colour-usage.js`

**Description**: Audit all HTML and CSS files for colour usage. Identifies hardcoded colours and non-theme-compliant color references.

**Purpose**: Node.js utility script for ensuring colour theme compliance across the project.

---

## License

All scripts are licensed under the MIT License.

**Author**: Edmund Mulligan <edmund@edmundmulligan.name>  
**Copyright**: (c) 2026 The Embodied Mind

---

*This documentation was automatically generated from JavaDoc comments in the source code.*