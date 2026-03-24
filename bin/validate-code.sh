#!/bin/bash

# This script validates HTML, CSS, and JavaScript code
# N.B. Do not use the W3C validator as that does not support CSS variables
#
# EXCLUDING FILES FROM VALIDATION:
# To skip validation for specific files, add one of these markers:
#
# HTML files: Add this meta tag in the <head> section:
#   <meta name="validate-code" content="skip">
#
# CSS files: Add this comment in the first 20 lines:
#   /* validate-code: skip */
#
# JavaScript files: Add one of these comments in the first 20 lines:
#   /* validate-code: skip */
#   // validate-code: skip

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 [folder] [options]" help exclude-validation
}

# Parse command line arguments
EXCLUDE_LIST=""
FOLDER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      print_usage
      exit 0
      ;;
    -x|--exclude)
      shift
      if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
        echo "❌ Error: --exclude requires at least one file or folder"
        exit 1
      fi
      while [[ $# -gt 0 ]] && [[ "$1" != -* ]]; do
        EXCLUDE_LIST="$(normalize_exclude_list "$EXCLUDE_LIST" "$1")"
        shift
      done
      ;;
    *)
      if [ -z "$FOLDER" ]; then
        FOLDER="$1"
      else
        echo "❌ Error: Unexpected argument '$1'"
        exit 1
      fi
      shift
      ;;
  esac
done

[ -z "$FOLDER" ] && FOLDER="."

# Silently install dependencies if not already installed
echo "Installing dependencies..."
npm install html-validate stylelint stylelint-config-standard eslint > /dev/null 2>&1

echo ""
echo "📄 Validating HTML, CSS, and JavaScript files..."
echo ""

ORIGINAL_DIR=$(pwd)
if [ ! -d "$FOLDER" ]; then
  echo "Error: Provided folder '$FOLDER' does not exist."
  exit 1
fi

# Setup results directory in application folder
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/test-results"
mkdir -p "$RESULTS_DIR"
RESULT_FILE="$RESULTS_DIR/validation-results.json"

# Initialize combined results
echo '{"files":[],"summary":{"htmlErrors":0,"htmlWarnings":0,"cssErrors":0,"cssWarnings":0,"jsErrors":0,"jsWarnings":0}}' > "$RESULT_FILE"

# Function to check if file should skip validation
should_skip_validation() {
  local file="$1"
  local extension="$2"
  
  if [ "$extension" = "html" ]; then
    # Check for meta tag: <meta name="validate-code" content="skip">
    if grep -q '<meta name="validate-code" content="skip">' "$file" 2>/dev/null; then
      return 0  # Skip validation
    fi
  elif [ "$extension" = "css" ] || [ "$extension" = "js" ]; then
    # Check for comment in first 20 lines: /* validate-code: skip */ or // validate-code: skip
    if head -n 20 "$file" | grep -qE '(/\*|//)\s*validate-code:\s*skip' 2>/dev/null; then
      return 0  # Skip validation
    fi
  fi
  
  return 1  # Don't skip
}

# Find all HTML, CSS, and JS files in the specified folder
FILES=$(find "$FOLDER" \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/tests/*" -not -path "*/bin/*" -not -name "eslint.config.js" -print)

if [ -n "$EXCLUDE_LIST" ]; then
  filter_excluded_paths "$FILES" "$EXCLUDE_LIST"
  FILES="$FILTERED_PATHS_RESULT"
  echo "Excluded $FILTERED_PATHS_EXCLUDED_COUNT files using: $EXCLUDE_LIST"
fi

FILE_COUNT=$(echo "$FILES" | sed '/^$/d' | wc -l)
TESTED=0

# Validate each file
for file in $FILES; do
  TESTED=$((TESTED + 1))
  echo "[$TESTED/$FILE_COUNT] Validating $file"

  # work out which validator to use
  extension="${file##*.}"
  if [ "$extension" = "html" ]
  then
    validator='html-validate'
  elif [ "$extension" = "css" ]
  then
    validator='stylelint'
  elif [ "$extension" = "js" ]
  then
    validator='eslint'
  else
    continue
  fi

  # Check if file should skip validation
  if should_skip_validation "$file" "$extension"; then
    echo "  ⏭️  Skipped (validation disabled)"
    continue
  fi

  # Run validator and save results to temp file
  TEMP_RESULT="$RESULTS_DIR/validation-temp-$TESTED.json"
  TEMP_ERROR="$RESULTS_DIR/validation-error-$TESTED.txt"

  if [ "$extension" = "html" ]; then
    npx ${validator} --formatter json "${file}" > "$TEMP_RESULT" 2>&1
  elif [ "$extension" = "css" ]; then
    npx ${validator} --formatter json "${file}" > "$TEMP_RESULT" 2>&1
  elif [ "$extension" = "js" ]; then
    # First, check for JS syntax errors using node --check
    node --check "$file" 2> "$TEMP_ERROR"
    if [ $? -ne 0 ]; then
      # Write a JSON error result for syntax error
      echo "[{\"filePath\": \"$file\", \"messages\": [{\"fatal\": true, \"message\": \"Syntax error detected by node --check\"}], \"errorCount\": 1, \"fatalErrorCount\": 1}]" > "$TEMP_RESULT"
    else
      # Run JSHint for stricter static analysis (plain text output)
      JSHINT_OUTPUT=$(npx jshint "$file" 2>&1)
      JSHINT_EXIT=$?
      
      # Parse JSHint plain text output and convert to JSON
      if [ $JSHINT_EXIT -eq 0 ]; then
        # No errors
        echo "[]" > "$TEMP_RESULT"
      else
        # Parse errors and convert to ESLint-like JSON format
        echo "$JSHINT_OUTPUT" | node -e "
          const fs = require('fs');
          const readline = require('readline');
          const rl = readline.createInterface({ input: process.stdin });
          
          const messages = [];
          rl.on('line', (line) => {
            // Parse JSHint output format: filename: line X, col Y, message
            const match = line.match(/^.*: line (\\d+), col (\\d+), (.+)$/);
            if (match) {
              const [, line, col, message] = match;
              messages.push({
                line: parseInt(line),
                column: parseInt(col),
                message: message,
                ruleId: null,
                severity: message.toLowerCase().includes('warning') ? 'warning' : 'error'
              });
            }
          });
          
          rl.on('close', () => {
            const formatted = [{
              filePath: '$file',
              messages: messages,
              errorCount: messages.filter(m => m.severity === 'error').length,
              warningCount: messages.filter(m => m.severity === 'warning').length,
              fatalErrorCount: 0
            }];
            fs.writeFileSync('$TEMP_RESULT', JSON.stringify(formatted, null, 2));
          });
        "
      fi
    fi
  else
    npx ${validator} --format json "${file}" > "$TEMP_RESULT" 2>"$TEMP_ERROR"
  fi

  # Merge results into combined file
  if [ -f "$TEMP_RESULT" ]; then
    node -e "
      try {
        const fs = require('fs');
        const combined = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));
        const tempResultContent = fs.readFileSync('$TEMP_RESULT', 'utf8');
        let newData = [];
        if (!tempResultContent.trim()) {
          // Treat empty output as valid (no errors/warnings)
          // newData remains as empty array
        } else {
          try {
            newData = JSON.parse(tempResultContent);
          } catch (e) {
            console.error('  ⚠️  Skipping: Validation result is not valid JSON.');
            process.exit(0);
          }
        }

        const fileResult = {
          file: '$file',
          type: '$extension',
          errors: [],
          warnings: []
        };

        if ('$extension' === 'html') {
          // html-validate format
          if (newData.length > 0 && newData[0].messages) {
            newData[0].messages.forEach(msg => {
              const issue = {
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId,
                severity: msg.severity === 2 ? 'error' : 'warning'
              };

              if (msg.severity === 2) {
                fileResult.errors.push(issue);
                combined.summary.htmlErrors++;
              } else {
                fileResult.warnings.push(issue);
                combined.summary.htmlWarnings++;
              }
            });
          }
        } else if ('$extension' === 'css') {
          // stylelint format
          if (newData.length > 0 && newData[0].warnings) {
            newData[0].warnings.forEach(w => {
              const issue = {
                line: w.line,
                column: w.column,
                message: w.text,
                ruleId: w.rule,
                severity: w.severity
              };

              if (w.severity === 'error') {
                fileResult.errors.push(issue);
                combined.summary.cssErrors++;
              } else {
                fileResult.warnings.push(issue);
                combined.summary.cssWarnings++;
              }
            });
          }
        } else if ('$extension' === 'js') {
          // JSHint/ESLint format
          if (newData.length > 0) {
            const result = newData[0];
            // Check for fatal parsing errors
            if (result.fatalErrorCount && result.fatalErrorCount > 0) {
              const fatalMsg = result.messages.find(m => m.fatal) || result.messages[0];
              const issue = {
                line: fatalMsg.line || 1,
                column: fatalMsg.column || 1,
                message: fatalMsg.message || 'Fatal parsing error',
                ruleId: fatalMsg.ruleId || null,
                severity: 'error'
              };
              fileResult.errors.push(issue);
              combined.summary.jsErrors++;
            } else if (result.messages && result.messages.length > 0) {
              result.messages.forEach(msg => {
                const issue = {
                  line: msg.line,
                  column: msg.column,
                  message: msg.message,
                  ruleId: msg.ruleId,
                  severity: msg.severity
                };
                // Check severity - handle both ESLint (severity === 2) and string format
                if (msg.severity === 'error' || msg.severity === 2) {
                  fileResult.errors.push(issue);
                  combined.summary.jsErrors++;
                } else {
                  fileResult.warnings.push(issue);
                  combined.summary.jsWarnings++;
                }
              });
            }
          }
        }

        // Only add file to results if it has errors or warnings
        if (fileResult.errors.length > 0 || fileResult.warnings.length > 0) {
          combined.files.push(fileResult);
          console.log('  ❌ ' + fileResult.errors.length + ' error(s), ⚠️  ' + fileResult.warnings.length + ' warning(s)');
        } else {
          console.log('  ✅ Valid');
        }

        fs.writeFileSync('$RESULT_FILE', JSON.stringify(combined, null, 2));
      } catch (e) {
        console.error('  ⚠️  Error parsing validation results: ' + e.message);
      }
    "

    rm -f "$TEMP_RESULT" "$TEMP_ERROR"
  fi
done

echo ""
echo "=================================="
echo "     VALIDATION SUMMARY"
echo "=================================="
echo ""

node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8'));

  const totalErrors = data.summary.htmlErrors + data.summary.cssErrors + data.summary.jsErrors;
  const totalWarnings = data.summary.htmlWarnings + data.summary.cssWarnings + data.summary.jsWarnings;

  console.log('Files validated: ' + ($FILE_COUNT));
  console.log('Files with issues: ' + data.files.length);
  console.log('');
  console.log('HTML errors: ' + data.summary.htmlErrors);
  console.log('HTML warnings: ' + data.summary.htmlWarnings);
  console.log('CSS errors: ' + data.summary.cssErrors);
  console.log('CSS warnings: ' + data.summary.cssWarnings);
  console.log('JavaScript errors: ' + data.summary.jsErrors);
  console.log('JavaScript warnings: ' + data.summary.jsWarnings);
  console.log('');
  console.log('Total errors: ' + totalErrors);
  console.log('Total warnings: ' + totalWarnings);
  console.log('');

  if (totalErrors === 0) {
    console.log('✅ No validation errors found!');
  } else {
    console.log('❌ Files with errors:');
    console.log('');
    data.files.filter(f => f.errors.length > 0).forEach(file => {
      console.log('📄 ' + file.file + ' (' + file.errors.length + ' error(s))');
      file.errors.slice(0, 5).forEach(err => {
        console.log('  ❌ Line ' + err.line + ':' + err.column + ' - ' + err.message);
        console.log('     Rule: ' + err.ruleId);
      });
      if (file.errors.length > 5) {
        console.log('  ... and ' + (file.errors.length - 5) + ' more error(s)');
      }
      console.log('');
    });
  }
"

# Check if we should delete the file
HAS_ERRORS=$(node -p "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('$RESULT_FILE', 'utf8')); (data.summary.htmlErrors + data.summary.cssErrors + data.summary.jsErrors) > 0 ? 1 : 0")

if [ "$HAS_ERRORS" -eq 0 ]; then
  echo ""
  echo "Detailed results: No errors."
else
  echo ""
  echo "Detailed results saved to: $RESULT_FILE"
  echo ""
  echo "❌ Validation errors found"
  exit 1
fi

exit 0

