/*
 **********************************************************************
 * File       : scripts/showSiteVersion.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 6 The Embodied Mind
 * License    : MIT License (see license.html page)
 * Description:
 *   Displays the current site version by reading package.json
 **********************************************************************
 */

(function() {
    'use strict';

    async function loadSiteVersion() {
        const versionElement = document.getElementById('site-version-value');

        if (!versionElement) {
            return;
        }

        try {
            const response = await fetch('../package.json', { cache: 'no-store' });

            if (!response.ok) {
                throw new Error('Failed to load package.json');
            }

            const packageData = await response.json();
            const version = typeof packageData.version === 'string' ? packageData.version.trim() : '';

            versionElement.textContent = version || 'unknown';
        } catch (error) {
            versionElement.textContent = 'unknown';
        }
    }

    document.addEventListener('DOMContentLoaded', loadSiteVersion);
})();
