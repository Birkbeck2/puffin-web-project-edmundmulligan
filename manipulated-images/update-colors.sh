#!/bin/bash

# Update LaTeX colors from CSS
# Run from anywhere in the project
# Usage: ./update-colors.sh

# Get the script's directory and resolve symlinks
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

echo "Updating LaTeX colors from CSS..."
echo "CSS source: $SCRIPT_DIR/styles/colors.css"
echo "LaTeX output: $SCRIPT_DIR/artwork/common/colours.tex"

"$SCRIPT_DIR/artwork/bin/generate-colors-from-css.py" \
    "$SCRIPT_DIR/styles/colors.css" \
    "$SCRIPT_DIR/artwork/common/colours.tex"

echo "Colors updated successfully!"
