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
../../../bin/tex-to-svg.sh logo-embodied-mind-normal-dark ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-normal-light ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-subdued-dark ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-subdued-light ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-vibrant-dark ../../generated
../../../bin/tex-to-svg.sh logo-embodied-mind-vibrant-light ../../generated
cd ../../..

echo "Generating image-2 images"
cd artwork/source/image-2
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

# copy the images to the website folder
echo "Copying generated images to website folder..."
cp artwork/generated/background-web-*.svg images/backgrounds/
cp artwork/generated/logo-embodied-mind-*.svg images/logos/