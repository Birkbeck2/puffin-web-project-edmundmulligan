# Lesson HTML Template System

This project uses **Mustache** templating to generate lesson HTML files from reusable templates and data files. This approach significantly reduces code duplication and makes maintenance easier.

## Directory Structure

```
project-root/
├── templates/
│   ├── lesson-00-student.mustache      # Template for student version
│   └── lesson-00-mentor.mustache       # Template for mentor version (if needed)
├── data/
│   ├── lesson-00-student.js            # Data for student version
│   └── lesson-00-mentor.json           # Data for mentor version (if needed)
├── bin/
│   └── build-lessons.js                # Build script to generate HTML
├── students/
│   └── lesson-00.html                  # Generated student lesson (auto-generated)
├── mentors/
│   └── lesson-00.html                  # Generated mentor lesson (auto-generated)
└── package.json                        # Updated with build script and mustache dependency
```

## How It Works

1. **Templates** (`.mustache` files) contain the HTML structure with Mustache placeholders like `{{variable_name}}` and `{{#section}}...{{/section}}`
2. **Data files** (`.js` or `.json` files) contain all the content values that fill in those placeholders
3. **Build script** (`bin/build-lessons.js`) reads templates and data, then generates final HTML using Mustache rendering
4. **Deployment** automatically runs the build script before serving files

## Building the Lessons

### Build Command

```bash
npm run build
```

This command:
- Reads template files from `templates/`
- Reads data files from `data/`
- Generates HTML output files in `students/` and `mentors/`
- Reports success or errors

### Before Deployment

Add to your deployment process:

```bash
npm install
npm run build
npm start
```

## Making Changes

### To Add/Edit Content

1. **Edit the data file**, not the generated HTML:
  - Modify `data/lesson-00-student.js` with new content
   - Update OS-specific sections, tool descriptions, etc.

2. **Rebuild the lesson**:
   ```bash
   npm run build
   ```

3. **Never edit** the generated `students/lesson-00.html` or `mentors/lesson-00.html` directly—your changes will be overwritten on next build.

### To Change Structure/Layout

1. **Edit the template file**:
   - Modify `templates/lesson-00-student.mustache`
   - Update HTML structure and Mustache syntax

2. **Ensure data matches template**:
   - Make sure data file includes all variables referenced in template
   - Verify nesting matches template sections

3. **Rebuild**:
   ```bash
   npm run build
   ```

## Mustache Syntax Reference

### Basic Variable Substitution

```mustache
<!-- Template -->
<h1>{{title}}</h1>
<p>{{description}}</p>

<!-- Data -->
{
  "title": "My Lesson",
  "description": "Learn something new"
}

<!-- Output -->
<h1>My Lesson</h1>
<p>Learn something new</p>
```

### Sections (Arrays/Loops)

```mustache
<!-- Template -->
{{#items}}
  <li>{{name}}</li>
{{/items}}

<!-- Data -->
{
  "items": [
    {"name": "Item 1"},
    {"name": "Item 2"}
  ]
}

<!-- Output -->
  <li>Item 1</li>
  <li>Item 2</li>
```

### Conditional Sections

```mustache
<!-- Template -->
{{#show_content}}
  <p>This is shown if show_content is true</p>
{{/show_content}}

{{^show_content}}
  <p>This is shown if show_content is false</p>
{{/show_content}}

<!-- Data -->
{
  "show_content": true
}
```

### Unescaped HTML

```mustache
<!-- Template (triple braces to preserve HTML) -->
{{{html_content}}}

<!-- Data -->
{
  "html_content": "<strong>Bold text</strong>"
}

<!-- Output -->
<strong>Bold text</strong>
```

## Example: Adding a New Tool Installation Section

### 1. Update the data file (`data/lesson-00-student.js`)

```javascript
module.exports = {
  developer_platforms: [
    {
      os_id: "linux",
      os_name: "Linux",
      tools: [
        {
          tool_id: "python",
          tool_name: "Python",
          tool_content: `<p>Installation instructions here...</p>`
        }
      ]
    }
  ]
};
```

### 2. The template automatically generates the section:

```mustache
{{#developer_platforms}}
  {{#tools}}
    <section id="instructions-{{os_id}}-{{tool_id}}">
      <h3>{{tool_name}}</h3>
      {{{tool_content}}}
    </section>
  {{/tools}}
{{/developer_platforms}}
```

### 3. Rebuild and deploy:

```bash
npm run build
git add .
git commit -m "Add Python installation instructions"
git push
```

## Adding a New Lesson

1. Create new template file: `templates/lesson-01-student.mustache`
2. Create new data file: `data/lesson-01-student.js`
3. Add task to `bin/build-lessons.js`:
   ```javascript
   const buildTasks = [
     // ... existing tasks
     {
       lesson: 1,
       studentTemplate: 'templates/lesson-01-student.mustache',
       studentData: 'data/lesson-01-student.js',
       studentOutput: 'students/lesson-01.html'
     }
   ];
   ```
4. Run `npm run build`

## Maintenance Benefits

✅ **DRY (Don't Repeat Yourself)**: Common content appears once in data files, not duplicated across HTML.

✅ **Consistent Structure**: All OS-specific sections follow the same pattern.

✅ **Easy Updates**: Change content in one data file instead of editing multiple locations in HTML.

✅ **Prevents Errors**: Template structure is defined once; data fills in values.

✅ **Version Control**: Data files (JSON) are easier to review in diffs than HTML.

✅ **Scalability**: Adding new platforms or tools doesn't require duplicating entire sections.

## Troubleshooting

### "Command not found: mustache"

Make sure to install dependencies:
```bash
npm install
```

### "Error: ENOENT: no such file or directory"

Check that all referenced template and data files exist in their correct locations.

### HTML output looks wrong

1. Verify JSON is valid (use a JSON validator)
2. Check variable names match exactly between template and data
3. Ensure triple braces `{{{...}}}` are used for HTML content
4. Check array nesting in template matches data structure

## Additional Resources

- [Mustache Documentation](https://mustache.github.io/)
- [Mustache GitHub](https://github.com/janl/mustache.js/)
