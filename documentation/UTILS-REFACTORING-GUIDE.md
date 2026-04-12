# Utility Class Refactoring Guide

## Overview

The new `utils.js` file contains a centralized `Utils` class with static helper methods. This eliminates code duplication and provides a consistent API across all JavaScript files.

## Integration Steps

### 1. Add utils.js to Your HTML Files

Add the utils script **before** other scripts that depend on it:

```html
<!-- In your HTML head or before closing body tag -->
<script src="../scripts/queryParams.js" defer></script>
<script src="../scripts/debug.js" defer></script>
<script src="../scripts/utils.js" defer></script>  <!-- Add this -->
<script src="../scripts/localStorage.js" defer></script>
<script src="../scripts/themeSwitcher.js" defer></script>
<!-- Other scripts... -->
```

**Note:** Load order matters! Put `utils.js` after `debug.js` (since Utils uses Debug) but before scripts that use Utils.

## Refactoring Examples

### Refactor 1: Replace Duplicate `escapeHtml()` Functions

#### Before (localStorage.js):
```javascript
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Later in code...
const altText = escapeHtml(`Your avatar: ${data.avatarChoice}`);
output.innerHTML = `<img src="${escapeHtml(imagePath)}" alt="${altText}">`;
```

#### After (localStorage.js):
```javascript
// Remove the escapeHtml function entirely
// Use Utils.escapeHtml() instead

const altText = Utils.escapeHtml(`Your avatar: ${data.avatarChoice}`);
output.innerHTML = `<img src="${Utils.escapeHtml(imagePath)}" alt="${altText}">`;
```

#### Before (displayTestResults.js):
```javascript
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

#### After (displayTestResults.js):
```javascript
// Remove the escapeHtml function entirely - use Utils.escapeHtml() instead
```

### Refactor 2: Replace `fileExists()` Function

#### Before (populateLessonsMenu.js):
```javascript
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Later...
const exists = await fileExists('../data/lessons.json');
```

#### After (populateLessonsMenu.js):
```javascript
// Remove fileExists function
// Use Utils.fileExists() instead

const exists = await Utils.fileExists('../data/lessons.json');
```

### Refactor 3: Replace `loadJSON()` Function

#### Before (displayTestResults.js):
```javascript
async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return null;
    }
}

// Later...
const data = await loadJSON('../diagnostics/test-results/validation.json');
```

#### After (displayTestResults.js):
```javascript
// Remove loadJSON function
// Use Utils.loadJSON() instead

const data = await Utils.loadJSON('../diagnostics/test-results/validation.json');
```

### Refactor 4: Replace `getPageContext()` Function

#### Before (populateLessonsMenu.js):
```javascript
function getPageContext() {
    const path = window.location.pathname;
    // ... lots of code ...
    return {
        context: 'students',
        pathPrefix: '',
        lessonFolder: 'students'
    };
}

// Later...
const { context, pathPrefix } = getPageContext();
```

#### After (populateLessonsMenu.js):
```javascript
// Remove getPageContext function
// Use Utils.getPageContext() instead

const { context, pathPrefix } = Utils.getPageContext();
```

### Refactor 5: Replace setTimeout() with delay()

#### Before:
```javascript
setTimeout(() => {
    submitButton.textContent = originalText;
    submitButton.style.backgroundColor = '';
}, 2000);
```

#### After:
```javascript
await Utils.delay(2000);
submitButton.textContent = originalText;
submitButton.style.backgroundColor = '';
```

### Refactor 6: Safe JSON Parsing

#### Before:
```javascript
try {
    const data = JSON.parse(localStorage.getItem('key'));
    // use data...
} catch (error) {
    console.error('Parse error:', error);
    const data = {};
}
```

#### After:
```javascript
const data = Utils.parseJSON(localStorage.getItem('key'), {});
// No try-catch needed - default value returned on error
```

## New Utility Methods Available

### Debounce (for search inputs, resize events)
```javascript
const debouncedSearch = Utils.debounce((query) => {
    performSearch(query);
}, 300);

searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
```

### Throttle (for scroll events, mouse movement)
```javascript
const throttledScroll = Utils.throttle(() => {
    updateScrollPosition();
}, 100);

window.addEventListener('scroll', throttledScroll);
```

### String Utilities
```javascript
Utils.capitalise('hello world'); // "Hello world"
Utils.toKebabCase('Hello World'); // "hello-world"
Utils.toCamelCase('hello-world'); // "helloWorld"
```

### Number Utilities
```javascript
Utils.clamp(150, 0, 100); // 100 (constrained to max)
Utils.randomInt(1, 6); // Random number 1-6
```

### Object Utilities
```javascript
Utils.isEmpty({}); // true
Utils.isEmpty([1, 2]); // false
Utils.deepClone(complexObject); // Creates deep copy
```

### Date Formatting
```javascript
Utils.formatDate(new Date()); // "12 April 2026"
Utils.formatDate('2026-04-12', { dateStyle: 'short' }); // "12/04/26"
```

## Complete Refactoring Checklist

- [ ] Add `utils.js` to all HTML files that load JavaScript
- [ ] Remove `escapeHtml()` from `localStorage.js` and replace calls with `Utils.escapeHtml()`
- [ ] Remove `escapeHtml()` from `displayTestResults.js` and replace calls with `Utils.escapeHtml()`
- [ ] Remove `fileExists()` from `populateLessonsMenu.js` and replace with `Utils.fileExists()`
- [ ] Remove `loadJSON()` from `displayTestResults.js` and replace with `Utils.loadJSON()`
- [ ] Remove `getPageContext()` from `populateLessonsMenu.js` and replace with `Utils.getPageContext()`
- [ ] Consider replacing `setTimeout()` calls with `await Utils.delay()` where appropriate
- [ ] Consider using `Utils.parseJSON()` and `Utils.stringifyJSON()` for safer JSON operations

## Testing After Refactoring

After making changes, test:

1. **Student/Mentor Forms**: Verify avatar preview and form submission work
2. **Lessons Menu**: Check that lesson navigation populates correctly
3. **Test Results Dashboard**: Verify test data loads and displays
4. **All Pages**: Check browser console for errors

## Benefits

✅ **No Code Duplication**: Single source of truth for utility functions  
✅ **Consistent API**: All utilities follow the same pattern (`Utils.method()`)  
✅ **Easy to Test**: Static methods are simple to unit test  
✅ **Better Error Handling**: Built-in error handling in fetch/JSON methods  
✅ **More Utilities**: Access to debounce, throttle, string formatting, etc.  
✅ **Type Safety**: JSDoc comments provide IDE autocomplete and type hints  
✅ **Maintainable**: Update one place to fix bugs everywhere

## Documentation

Full API documentation with examples is included in the JSDoc comments in `utils.js`. Your IDE should show these when you type `Utils.` and get autocomplete suggestions.
