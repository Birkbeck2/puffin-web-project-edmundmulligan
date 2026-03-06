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
  echo "⚡ Quick mode enabled: Skipping Wave and Lighthouse tests"
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
bin/run-axe-tests.sh "$FOLDER" || exit 1
if [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🏮 Running lighthouse accessibility tests..."
  bin/run-lighthouse-tests.sh "$FOLDER" || exit 1
else
  echo ""
  echo "⏭️  Skipping Lighthouse tests (quick mode enabled)"
fi

echo ""
echo "🦜 Running pa11y accessibility tests..."
bin/run-pa11y-tests.sh "$FOLDER" || exit 1

if [ "$RUN_WAVE" = true ] && [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🌊 Running Wave accessibility tests..."
  bin/run-wave-tests.sh "$FOLDER" || exit 1
else
  echo ""
  if [ "$QUICK_MODE" = true ]; then
    echo "⏭️  Skipping Wave accessibility tests (quick mode enabled)"
  else
    echo "⏭️  Skipping Wave accessibility tests (use -w or --run-wave to enable)"
  fi
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
