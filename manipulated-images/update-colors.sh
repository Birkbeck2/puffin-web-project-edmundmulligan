#!/bin/bash

# Update LaTeX colours from CSS
# Run from anywhere in the project
# Usage: ./update-colours.sh

# Get the script's directory and resolve symlinks
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

echo "Updating LaTeX colours from CSS..."
echo "CSS source: $SCRIPT_DIR/styles/colours.css"
echo "LaTeX output: $SCRIPT_DIR/artwork/common/colours.tex"

"$SCRIPT_DIR/artwork/bin/generate-colours-from-css.py" \
    "$SCRIPT_DIR/styles/colours.css" \
    "$SCRIPT_DIR/artwork/common/colours.tex"

echo "Colours updated successfully!"
