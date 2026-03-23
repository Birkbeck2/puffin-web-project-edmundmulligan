/*
 **********************************************************************
 * File       : scripts/animateConclusionWand.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Loads the conclusion wand SVG inline so sparkle paths can animate
 *   via styles/components/favicon.css (same mechanism as image 3).
 **********************************************************************
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('conclusion-wand-container');
        if (!container) {
            return;
        }

        try {
            const response = await fetch('../images/icons/favicon-inline.svg');
            if (!response.ok) {
                throw new Error('Failed to load wand SVG');
            }

            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svg = svgDoc.querySelector('svg');

            if (!svg) {
                throw new Error('Wand SVG markup is missing <svg> root');
            }

            svg.setAttribute('width', '150');
            svg.setAttribute('height', '150');
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-label', 'Sparkling wand icon');

            // Make wand body/outline track effective theme/style text colour
            // while keeping sparkle fills animated.
            const effectiveTextColour = 'var(--colour-effective-page-text)';
            const paths = svg.querySelectorAll('path');
            paths.forEach((path) => {
                const isSparkle =
                    path.classList.contains('sparkle-1') ||
                    path.classList.contains('sparkle-2') ||
                    path.classList.contains('sparkle-3');

                path.removeAttribute('style');
                path.style.stroke = effectiveTextColour;

                if (!isSparkle) {
                    path.style.fill = effectiveTextColour;
                }
            });

            svg.classList.add('animated', 'conclusion-wand-icon');

            container.appendChild(svg);
        } catch (error) {
            console.error('Error loading conclusion wand SVG:', error);

            // Fallback for robustness if inline loading fails.
            const fallback = document.createElement('img');
            fallback.src = '../images/icons/favicon-inline.svg';
            fallback.alt = 'Sparkling wand icon';
            fallback.width = 150;
            fallback.height = 150;
            fallback.className = 'conclusion-wand-fallback';
            container.appendChild(fallback);
        }
    });
}());
