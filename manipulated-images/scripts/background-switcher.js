/*
 **********************************************************************
 * File       : background-switcher.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles switching between different background themes and orientations
 **********************************************************************
 */

function switchBackground() {
    const selectedTheme = document.querySelector('input[name="backgroundTheme"]:checked').value;
    const selectedOrientation = document.querySelector('input[name="backgroundOrientation"]:checked').value;
    const backgroundImage = document.getElementById('backgroundImage');
    backgroundImage.src = `images/background-web-${selectedOrientation}-${selectedTheme}.svg`;
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="backgroundTheme"], input[name="backgroundOrientation"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', switchBackground);
    });
});