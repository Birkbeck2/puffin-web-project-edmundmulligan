[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/tHmyOiMX)

## Test Script Excludes

The `bin/run-*-tests.sh` scripts now support excluding files and folders from page discovery.

### Option

- `-x`, `--exclude`: Exclude one or more files or folders.

You can pass excludes as:

- comma-separated values: `--exclude pages,students/lesson-00.html`
- space-separated values after the flag: `--exclude pages students/lesson-00.html`

### Examples

Run all tests while excluding a folder and one file:

```bash
bin/run-all-tests.sh . --exclude pages,students/lesson-00.html
```

Run axe tests in quick mode and exclude a folder:

```bash
bin/run-axe-tests.sh -q . --exclude pages
```

Run lighthouse tests and exclude multiple paths:

```bash
bin/run-lighthouse-tests.sh . --exclude pages students mentors/lesson-00.html
```

Run pa11y tests and exclude one file:

```bash
bin/run-pa11y-tests.sh . --exclude pages/start.html
```

Run browser tests and exclude specific pages used in `bin/browser-tests.js`:

```bash
bin/run-browser-tests.sh . --exclude start.html students
```
