#!/bin/bash

# Generate all image files
# Run from the artwork folder to ensure correct paths
# Usage: ./generate-all-images.sh

# First, generate LaTeX colours from CSS
echo "Generating LaTeX colours from CSS..."
./bin/generate-colours-from-css.py styles/colours.css artwork/common/colours.tex
echo "Generating web background files..."
./bin/generate-web-backgrounds.py

echo "Generating image-1 images"
cd artwork/source/image-1
../../../bin/tex-to-svg.sh logo-embodied-mind-with-name-purple ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-with-name-cyan ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-with-name-black ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-with-name-white ../../generated
cd ../../..

echo "Generating image-2 images"
cd artwork/source/image-2
../../../bin/generate-web-backgrounds.py
../../../bin/tex-to-svg.sh background-web-landscape-normal-dark ../../generated
../../../bin/tex-to-svg.sh background-web-landscape-normal-light ../../generated
../../../bin/tex-to-svg.sh background-web-landscape-subdued-dark ../../generated
../../../bin/tex-to-svg.sh background-web-landscape-subdued-light ../../generated
../../../bin/tex-to-svg.sh background-web-landscape-vibrant-dark ../../generated
../../../bin/tex-to-svg.sh background-web-landscape-vibrant-light ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-normal-dark ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-normal-light ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-subdued-dark ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-subdued-light ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-vibrant-dark ../../generated
../../../bin/tex-to-svg.sh background-web-portrait-vibrant-light ../../generated
cd ../../..

