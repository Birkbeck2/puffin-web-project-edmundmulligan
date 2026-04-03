# Mustache Template System - Quick Start Guide

## What Has Been Created

I've set up a complete Mustache templating system to replace the 3000+ line `lesson-00.html` with maintainable templates and data files.

### New Files

```
├── templates/
│   ├── lesson-00-student.mustache      (1 template instead of 3000+ lines of HTML)
│   └── lesson-00-mentor.mustache       (mentor-specific version)
│
├── data/
│   ├── lesson-00-student.js            (all student content organized by OS/tool)
│   └── lesson-00-mentor.json           (mentor-specific guidance)
│
├── bin/
│   └── build-lessons.js                (Node.js build script - handles template rendering)
│
├── TEMPLATING.md                        (detailed documentation)
└── TEMPLATE-QUICKSTART.md               (this file)
```

### Updated Files

- **package.json** - Added `mustache` dependency and `build` script

## How to Use

### 1. Install Dependencies

```bash
npm install
```

This installs Mustache.js that powers the template rendering.

### 2. Build HTML Files

```bash
npm run build
```

This script:
- Reads templates from `templates/`
- Reads data from `data/`  
- Generates `students/lesson-00.html` and `mentors/lesson-00.html`

### 3. Make Content Changes

**Never edit the generated HTML files directly!**

Instead:
1. Edit `data/lesson-00-student.js` (or mentor version)
2. Change content, add tools, modify instructions
3. Run `npm run build`
4. Commit and deploy

## Example: Adding a New Tool

### For Linux - Add Python Installation

Edit `data/lesson-00-student.js`:

```javascript
{
  os_id: "linux",
  os_name: "Linux",
  tools: [
    // ... existing tools ...
    {
      tool_id: "python",
      tool_name: "Python 3",
      tool_content: `<p>Installation instructions...</p>
<h4>Ubuntu:</h4>
<p><code>sudo apt install python3</code></p>`
    }
  ]
}
```

Then:
```bash
npm run build
```

Done! The template automatically generates the new section.

## Key Benefits

| Benefit | Before | After |
|---------|--------|-------|
| **Size** | 3000+ lines of HTML | ~2KB template + 10KB data |
| **Duplication** | Same structure repeated for each OS | One template, all OSes |
| **Maintenance** | Edit HTML in 3-6 places per change | Edit data in one place |
| **Multiline content** | Escaped `\n` is hard to read | Real line breaks in template literals |
| **Readability** | Hard to see structure in HTML | Clear data structure |
| **Error-prone** | Easy to miss updates | Consistent structure |

## Structure Overview

### Template Variables

Templates use Mustache syntax:
- `{{variable}}` - Insert variable value
- `{{{html}}}` - Insert HTML (triple braces prevent escaping)
- `{{#array}}...{{/array}}` - Loop through array items
- `{{^value}}...{{/value}}` - Show if value is false/empty

### Data Organization

The data files organize content by:
- **Operating System**: windows, macos, linux
- **Tools**: VSCode, Firefox, Node.js, Git, SQLite
- **Platforms**: Non-developer devices (chromebook, android, ios)
- **Common Sections**: Extensions, Projects Folder, Dev Server (shared across all OSes)

## Next Steps

1. **Run the build**: `npm run build`
2. **Verify output**: Check that `students/lesson-00.html` was generated
3. **Test**: Open it in a browser and ensure it displays correctly
4. **Extend**: Add more lessons by creating:
   - `templates/lesson-01-student.mustache`
  - `data/lesson-01-student.js`
   - Add task to `bin/build-lessons.js`

## Making the System Production-Ready

To ensure templates are always built before deployment:

```bash
# In your CI/CD pipeline:
npm install
npm run build
# Then deploy the generated HTML files
```

## Rollback (if needed)

The original `lesson-00.html` is still in version control. If you need it:

```bash
git checkout HEAD -- students/lesson-00.html
```

But with the new system, you won't need to—just fix the data and rebuild!

## Questions?

Refer to `TEMPLATING.md` for:
- Full Mustache syntax reference
- Adding new lessons
- Troubleshooting
- Best practices

---

**Status**: ✅ System is ready to use. Run `npm run build` to generate the HTML files.
