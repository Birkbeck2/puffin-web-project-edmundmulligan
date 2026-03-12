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
if ! bin/validate-code.sh "$FOLDER"; then
  echo "⚠️  Code validation failed"
  FAILED=1
fi

echo ""
echo "🎨 Running colour usage audit..."
if ! node bin/audit-colour-usage.js; then
  echo "⚠️  Colour audit failed"
  FAILED=1
fi

echo ""
echo "Running comments check..."
if ! bin/check-file-comments.sh "$FOLDER"; then
  echo "⚠️  Comments check failed"
  FAILED=1
fi

echo ""
echo "🔗 Running link checks..."
if ! bin/check-links.sh "$FOLDER"; then
  echo "⚠️  Link checks failed"
  FAILED=1
fi

echo ""
echo "🪓 Running axe accessibility tests..."
if [ "$QUICK_MODE" = true ]; then
  AXE_CMD="bin/run-axe-tests.sh \"$FOLDER\" -q"
else
  AXE_CMD="bin/run-axe-tests.sh \"$FOLDER\""
fi
if ! eval "$AXE_CMD"; then
  echo "⚠️  Axe tests failed"
  FAILED=1
fi
if [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🏮 Running lighthouse accessibility tests..."
  if ! bin/run-lighthouse-tests.sh "$FOLDER"; then
    echo "⚠️  Lighthouse tests failed"
    FAILED=1
  fi
else
  echo ""
  echo "⏭️  Skipping Lighthouse tests (quick mode enabled)"
fi

echo ""
echo "🦜 Running pa11y accessibility tests..."
if ! bin/run-pa11y-tests.sh "$FOLDER"; then
  echo "⚠️  Pa11y tests failed"
  FAILED=1
fi

if [ "$RUN_WAVE" = true ] && [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🌊 Running Wave accessibility tests..."
  if ! bin/run-wave-tests.sh "$FOLDER"; then
    echo "⚠️  Wave tests failed"
    FAILED=1
  fi
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
if ! bin/check-reading-age.sh "$FOLDER"; then
  echo "⚠️  Reading age checks failed"
  FAILED=1
fi

echo ""
echo "🌐 Running cross-browser tests..."
if ! bin/run-browser-tests.sh "$FOLDER"; then
  echo "⚠️  Browser tests failed"
  FAILED=1
fi

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
