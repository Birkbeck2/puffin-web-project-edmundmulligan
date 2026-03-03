#!/bin/bash
# This script runs all tests: accessibility, HTML/CSS validation, broken links

# Parse command line arguments
RUN_WAVE=false
QUICK_MODE=false
FOLDER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -w|--run-wave)
      RUN_WAVE=true
      shift
      ;;
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

# Validate folder parameter
if [ -z "$FOLDER" ]; then
  echo "❌ Error: Folder parameter is required"
  echo "Usage: $0 <folder> [-w|--run-wave] [-q|--quick]"
  exit 1
fi

if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: '$FOLDER' is not a valid directory"
  exit 1
fi

bin/clear-tests.sh "$FOLDER"

# Run all tests and collect exit codes
echo "Running all tests..."
if [ "$QUICK_MODE" = true ]; then
  echo "⚡ Quick mode enabled: Testing only at 900px viewport width"
fi
echo ""

FAILED=0

echo "📄 Running code validation..."
bin/validate-code.sh "$FOLDER" || exit 1

echo ""
echo "🎨 Running colour usage audit..."
node bin/audit-colour-usage.js || exit 1

echo ""
echo "Running comments check..."
bin/check-file-comments.sh "$FOLDER" || exit 1

echo ""
echo "🔗 Running link checks..."
bin/check-links.sh "$FOLDER" || exit 1

echo ""
echo "🪓 Running axe accessibility tests..."
if [ "$QUICK_MODE" = true ]; then
  bin/run-axe-tests.sh "$FOLDER" -q || exit 1
else
  bin/run-axe-tests.sh "$FOLDER" || exit 1
fi
echo ""
echo "🏮 Running lighthouse accessibility tests..."
if [ "$QUICK_MODE" = true ]; then
  bin/run-lighthouse-tests.sh "$FOLDER" -q || exit 1
else
  bin/run-lighthouse-tests.sh "$FOLDER" || exit 1
fi

echo ""
echo "🦜 Running pa11y accessibility tests..."
if [ "$QUICK_MODE" = true ]; then
  bin/run-pa11y-tests.sh "$FOLDER" -q || exit 1
else
  bin/run-pa11y-tests.sh "$FOLDER" || exit 1
fi

if [ "$RUN_WAVE" = true ]; then
  echo ""
  echo "🌊 Running Wave accessibility tests..."
  if [ "$QUICK_MODE" = true ]; then
    bin/run-wave-tests.sh "$FOLDER" -q || exit 1
  else
    bin/run-wave-tests.sh "$FOLDER" || exit 1
  fi
else
  echo ""
  echo "⏭️  Skipping Wave accessibility tests (use -w or --run-wave to enable)"
fi

echo ""
echo "📖 Running reading age checks..."
bin/check-reading-age.sh "$FOLDER" || exit 1

echo ""
echo "🌐 Running cross-browser tests..."
bin/run-browser-tests.sh "$FOLDER" || exit 1

echo ""
echo "📊 Generating test summary..."
bin/summarise-tests.sh "$FOLDER"

if [ "$FAILED" -eq 1 ]; then
  echo ""
  echo "❌ Some tests failed!"
  exit 1
else
  echo ""
  echo "✅ All tests passed!"
  exit 0
fi
