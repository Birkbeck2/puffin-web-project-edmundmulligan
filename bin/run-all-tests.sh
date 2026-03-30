#!/bin/bash
# This script runs all tests: accessibility, HTML/CSS validation, broken links

# Source common helper functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

print_usage() {
  print_standard_usage "$0 <folder> [options]" help quick-all run-wave exclude-tests
}

# Parse command line arguments
RUN_WAVE=false
QUICK_MODE=false
FOLDER=""
EXCLUDE_LIST=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      print_usage
      exit 0
      ;;
    -w|--run-wave)
      RUN_WAVE=true
      shift
      ;;
    -q|--quick)
      QUICK_MODE=true
      shift
      ;;
    -x|--exclude)
      shift
      if [ $# -eq 0 ] || [[ "$1" == -* ]]; then
        echo "❌ Error: --exclude requires at least one file or folder"
        print_usage
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
        echo "❌ Error: Unknown option: $1"
        print_usage
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate folder parameter
if [ -z "$FOLDER" ]; then
  echo "❌ Error: Folder parameter is required"
  print_usage
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

EXCLUDE_ARGS=()
if [ -n "$EXCLUDE_LIST" ]; then
  EXCLUDE_ARGS=("-x" "$EXCLUDE_LIST")
  echo "🚫 Excluding pages/files/folders: $EXCLUDE_LIST"
fi

echo "📄 Running code validation..."
if ! bin/validate-code.sh "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Code validation failed"
  FAILED=1
fi

echo ""
echo "🎨 Running colour usage audit..."
if ! node bin/audit-colour-usage.js "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Colour audit failed"
  FAILED=1
fi

echo ""
echo "Running comments check..."
if ! bin/check-file-comments.sh "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Comments check failed"
  FAILED=1
fi

echo ""
echo "🔗 Running link checks..."
if ! bin/check-links.sh "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Link checks failed"
  FAILED=1
fi

echo ""
echo "🪓 Running axe accessibility tests..."
if ! bin/run-axe-tests.sh -q "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Axe tests failed"
  FAILED=1
fi
if [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🏮 Running lighthouse accessibility tests..."
  if ! bin/run-lighthouse-tests.sh -q "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
    echo "⚠️  Lighthouse tests failed"
    FAILED=1
  fi
else
  echo ""
  echo "⏭️  Skipping Lighthouse tests (quick mode enabled)"
fi

echo ""
echo "🦜 Running pa11y accessibility tests..."
if ! bin/run-pa11y-tests.sh -q "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Pa11y tests failed"
  FAILED=1
fi

if [ "$RUN_WAVE" = true ] && [ "$QUICK_MODE" = false ]; then
  echo ""
  echo "🌊 Running Wave accessibility tests..."
  if ! bin/run-wave-tests.sh -q "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
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
if ! bin/check-reading-age.sh "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
  echo "⚠️  Reading age checks failed"
  FAILED=1
fi

echo ""
echo "🌐 Running cross-browser tests..."
if ! bin/run-browser-tests.sh "$FOLDER" "${EXCLUDE_ARGS[@]}"; then
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
