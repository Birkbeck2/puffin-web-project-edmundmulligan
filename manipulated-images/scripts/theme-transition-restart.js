/*
 **********************************************************************
 * File       : theme-transition-restart.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Restart theme transition GIF animation on button click
 **********************************************************************
 */

document.addEventListener('DOMContentLoaded', () => {
    const restartButton = document.getElementById('restart-theme-transition');
    const themeTransitionImg = document.getElementById('theme-transition');
    
    if (!restartButton || !themeTransitionImg) return;
    
    // Store the original src to restore it
    const originalSrc = themeTransitionImg.src;
    
    restartButton.addEventListener('click', () => {
        // Remove src to stop the GIF
        themeTransitionImg.src = '';
        
        // Use requestAnimationFrame to ensure the browser processes the change
        requestAnimationFrame(() => {
            // Restore src with cache-buster to force reload
            themeTransitionImg.src = originalSrc + '?t=' + Date.now();
        });
    });
});
