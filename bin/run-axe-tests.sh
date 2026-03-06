#!/bin/bash

# This script validates accessibility using axe-core CLI.
# It starts a local web server if one is not running.

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

# Get any command line options
TEST_URL="http://localhost:8080"
QUICK_MODE=false

# Parse command line arguments
FOLDER=""
while [[ $# -gt 0 ]]; do
  case $1 in
    -q|--quick)
      QUICK_MODE=true
      shift
      ;;
    *)
      if [ -z "$FOLDER" ]; then
        FOLDER="$1"
      fi
      shift
      ;;
  esac
done

parse_test_options

# Silently install dependencies if not already installed
npm install -g @axe-core/cli serve > /dev/null 2>&1


# Set default folder if not provided
if [ -z "$FOLDER" ]; then
  FOLDER="."
fi
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

# Change to the specified folder to serve files from there
ORIGINAL_DIR=$(pwd)
RESULTS_DIR="$ORIGINAL_DIR/$FOLDER/test-results"
mkdir -p "$RESULTS_DIR"
cd "$FOLDER" || exit 1

# Start server and setup
start_server_if_needed "$TEST_URL"
discover_html_pages "."

# Initialize combined results
echo '{"violations":[],"passes":[],"incomplete":[]}' > "$RESULTS_DIR/axe-results.json"

# Define viewport widths to test
if [ "$QUICK_MODE" = true ]; then
  VIEWPORTS=(900)
  echo "⚡ Quick mode: Testing only at 900px viewport width"
else
  VIEWPORTS=(150 400 900 1300)
fi

# Define styles to test
STYLES=(normal subdued vibrant)

TOTAL_TESTS=$((PAGE_COUNT * 6 * ${#VIEWPORTS[@]}))

# Test each page at different viewport widths, in all theme/style combinations
TESTED=0
for VIEWPORT in "${VIEWPORTS[@]}"; do
  echo ""
  echo "📐 Testing at ${VIEWPORT}px width..."
  echo ""
  
  for STYLE in "${STYLES[@]}"; do
    echo "  🎨 $STYLE style"
    
    for THEME in light dark; do
      echo "    💡 $THEME mode"
      
      for page in $PAGES; do
        TESTED=$((TESTED + 1))
        # Convert file path to URL path
        URL_PATH="${page#./}"
        
        # Add theme and style parameters to URL
        if [[ "$URL_PATH" == *"?"* ]]; then
          FULL_URL="$TEST_URL/$URL_PATH&theme=$THEME&style=$STYLE"
        else
          FULL_URL="$TEST_URL/$URL_PATH?theme=$THEME&style=$STYLE"
        fi

        echo "    [$TESTED/$TOTAL_TESTS] Testing $URL_PATH (${VIEWPORT}px, $STYLE-$THEME)"

        # Run axe on this page with color scheme emulation and viewport size
        TEMP_RESULT="$RESULTS_DIR/axe-temp-$TESTED.json"
        axe "$FULL_URL" --disable page-has-heading-one --save "$TEMP_RESULT" \
          --chromedriver-options="{\"args\":[\"--force-prefers-color-scheme=$THEME\",\"--window-size=${VIEWPORT},768\"]}" \
          2>&1 | grep -E "(violations|Testing|Saved)" || true

    # Merge violations into combined results if file exists
    if [ -f "$TEMP_RESULT" ]; then
      node -e "
        try {
          const fs = require('fs');
          const combined = JSON.parse(fs.readFileSync('$RESULTS_DIR/axe-results.json'));
          const newData = JSON.parse(fs.readFileSync('$TEMP_RESULT'));

          // Axe saves results as an array [{violations: [...]}]
          const result = Array.isArray(newData) ? newData[0] : newData;

          // Add page URL, theme, and viewport to each violation
          if (result.violations && result.violations.length > 0) {
            result.violations.forEach(v => {
              v.pageUrl = '$URL_PATH';
              v.theme = '$THEME';
              v.viewport = '$VIEWPORT';
              
              // Downgrade severity for 150px viewport (expected issues at extreme narrow width)
              if ('$VIEWPORT' === '150' && (v.impact === 'critical' || v.impact === 'serious')) {
                v.originalImpact = v.impact;
                v.impact = 'moderate';
                v.downgradedFrom150px = true;
              }
              
              combined.violations.push(v);
            });
          }

          fs.writeFileSync('$RESULTS_DIR/axe-results.json', JSON.stringify(combined, null, 2));
          fs.unlinkSync('$TEMP_RESULT');
        } catch (e) {
          console.error('Error merging results:', e.message);
        }
      "
    fi
      done
    done
  done
done

# Stop server if we started it
stop_server_if_started

# Parse and display summary of results using node
RESULT_FILE="$RESULTS_DIR/axe-results.json"
echo ""
echo "📊 Analysis Summary:"

node -e "
  const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));
  const total = data.violations.length;

  // Count by impact
  const bySeverity = {
    critical: data.violations.filter(v => v.impact === 'critical').length,
    serious: data.violations.filter(v => v.impact === 'serious').length,
    moderate: data.violations.filter(v => v.impact === 'moderate').length,
    minor: data.violations.filter(v => v.impact === 'minor').length
  };

  // Count contrast issues
  const contrastIssues = data.violations.filter(v => v.id === 'color-contrast').length;

  console.log('  Total violations: ' + total);
  console.log('  🔴 Critical: ' + bySeverity.critical);
  console.log('  🟠 Serious: ' + bySeverity.serious);
  console.log('  🟡 Moderate: ' + bySeverity.moderate);
  console.log('  ⚪ Minor: ' + bySeverity.minor);
  if (contrastIssues > 0) {
    console.log('  🎨 Color Contrast Issues: ' + contrastIssues);
  }
  console.log('');
"

# Get total violations count
TOTAL_VIOLATIONS=$(node -p "const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE')); data.violations.length")

if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
  echo "✅ No accessibility violations found across all pages."
  exit 0
else
  echo "❌ Accessibility violations found:"
  echo ""

  # Display violations grouped by type
  node -e "
    const data = JSON.parse(require('fs').readFileSync('$RESULT_FILE'));

    // Group by violation ID
    const grouped = {};
    data.violations.forEach(v => {
      if (!grouped[v.id]) {
        grouped[v.id] = {
          impact: v.impact,
          description: v.description,
          help: v.help,
          pages: []
        };
      }
      grouped[v.id].pages.push(v.pageUrl || 'unknown');
    });

    // Display grouped violations
    Object.keys(grouped).forEach(id => {
      const v = grouped[id];
      const icon = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : v.impact === 'moderate' ? '🟡' : '⚪';
      const isContrast = id === 'color-contrast' ? ' 🎨' : '';

      console.log(icon + isContrast + ' ' + id + ' (' + v.impact + ')');
      console.log('  Description: ' + v.description);
      console.log('  Help: ' + v.help);
      
      // Group by theme and style
      const byThemeStyle = {};
      data.violations.forEach(violation => {
        if (violation.id === id) {
          const theme = violation.theme || 'unknown';
          const style = violation.style || 'unknown';
          const key = style + '-' + theme;
          if (!byThemeStyle[key]) byThemeStyle[key] = [];
          byThemeStyle[key].push(violation.pageUrl || 'unknown');
        }
      });
      
      Object.keys(byThemeStyle).forEach(key => {
        console.log('  ' + key + ': ' + byThemeStyle[key].join(', '));
      });
      console.log('');
    });
  "
  exit 1
fi
