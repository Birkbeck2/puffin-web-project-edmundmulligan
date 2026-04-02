/*
 **********************************************************************
 * File       : prototypes.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see ../../license-and-credits.html page)
 * Description:
 *   JavaScript for the prototypes viewer diagnostic page.
 *   Handles tab switching, screenshot loading, interactive controls
 *   for viewing screenshots across different themes, styles, and viewports,
 *   and modal/lightbox functionality for viewing full-size images.
 **********************************************************************
 */

(function() {
    'use strict';

    // Configuration
    const VIEWPORTS = [
        { width: 199, label: 'Tiny (<200px)' },
        { width: 401, label: 'Mobile (<600px)' },
        { width: 901, label: 'Tablet (<1200px)' },
        { width: 2001, label: 'Desktop (>1200px)' }
    ];

    const OUTPUT_PATH = '../output/';

    /**
     * Set up tab switching functionality
     */
    function setupTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    /**
     * Generate filename based on page type and options
     * @param {string} pageType - Type of page (landing, students, lesson)
     * @param {number} viewport - Viewport width
     * @param {Object} options - Theme, style, expand, and section options
     * @returns {string} Generated filename
     */
    function generateFilename(pageType, viewport, options) {
        const { theme, style, expand, section } = options;
        
        if (pageType === 'landing') {
            return `homepage-${viewport}-${theme}-${style}-${expand}.png`;
        } else if (pageType === 'students') {
            return `students-${viewport}-${theme}-${style}-${expand}.png`;
        } else if (pageType === 'lesson') {
            return `lesson-01-${viewport}-${theme}-${style}-${expand}-section-${section}.png`;
        }
        
        return '';
    }

    /**
     * Create screenshot display element
     * @param {string} filename - Screenshot filename
     * @param {string} label - Display label for the screenshot
     * @returns {HTMLElement} Screenshot container element
     */
    function createScreenshotElement(filename, label) {
        const container = document.createElement('div');
        container.className = 'screenshot-container';
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'screenshot-label';
        labelDiv.textContent = label;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'screenshot-wrapper';
        
        const img = document.createElement('img');
        img.src = OUTPUT_PATH + filename;
        img.alt = `Screenshot: ${label}`;
        
        // Handle image load errors
        img.onerror = () => {
            img.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Image not found';
            wrapper.appendChild(errorMsg);
        };
        
        // Add click handler to open modal (only if image loads successfully)
        img.addEventListener('click', () => {
            if (!img.classList.contains('error')) {
                openImageModal(img.src, img.alt);
            }
        });
        
        wrapper.appendChild(img);
        container.appendChild(labelDiv);
        container.appendChild(wrapper);
        
        return container;
    }

    /**
     * Update screenshots for a given page type
     * @param {string} pageType - Type of page to update screenshots for
     */
    function updateScreenshots(pageType) {
        const container = document.getElementById(`${pageType}-screenshots`);
        container.innerHTML = '';
        
        // Get current options
        const theme = document.querySelector(`input[name="${pageType}-theme"]:checked`).value;
        const style = document.querySelector(`input[name="${pageType}-style"]:checked`).value;
        const expand = document.querySelector(`input[name="${pageType}-expand"]:checked`).value;
        
        let section = '0';
        if (pageType === 'lesson') {
            section = document.querySelector('input[name="lesson-section"]:checked').value;
        }
        
        const options = { theme, style, expand, section };
        
        // Generate screenshots for each viewport
        VIEWPORTS.forEach(viewport => {
            const filename = generateFilename(pageType, viewport.width, options);
            const element = createScreenshotElement(filename, viewport.label);
            container.appendChild(element);
        });
    }

    /**
     * Add event listeners to all radio buttons
     */
    function setupEventListeners() {
        ['landing', 'students', 'lesson'].forEach(pageType => {
            // Theme radios
            document.querySelectorAll(`input[name="${pageType}-theme"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
            
            // Style radios
            document.querySelectorAll(`input[name="${pageType}-style"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
            
            // Expand radios
            document.querySelectorAll(`input[name="${pageType}-expand"]`).forEach(radio => {
                radio.addEventListener('change', () => updateScreenshots(pageType));
            });
        });
        
        // Section radios (lesson only)
        document.querySelectorAll('input[name="lesson-section"]').forEach(radio => {
            radio.addEventListener('change', () => updateScreenshots('lesson'));
        });
    }

    /**
     * Create and setup the image modal
     */
    function setupImageModal() {
        // Create modal element if it doesn't exist
        let modal = document.getElementById('image-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'image-modal';
            modal.className = 'image-modal';
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'image-modal-close';
            closeBtn.textContent = '×';
            closeBtn.setAttribute('aria-label', 'Close modal');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeImageModal();
            });
            
            // Create image element
            const img = document.createElement('img');
            img.alt = 'Full size screenshot';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            modal.appendChild(closeBtn);
            modal.appendChild(img);
            document.body.appendChild(modal);
            
            // Close modal when clicking on backdrop
            modal.addEventListener('click', closeImageModal);
            
            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeImageModal();
                }
            });
        }
    }

    /**
     * Open the image modal with specified image
     * @param {string} src - Image source URL
     * @param {string} alt - Image alt text
     */
    function openImageModal(src, alt) {
        const modal = document.getElementById('image-modal');
        const img = modal.querySelector('img');
        
        img.src = src;
        img.alt = alt;
        modal.classList.add('active');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close the image modal
     */
    function closeImageModal() {
        const modal = document.getElementById('image-modal');
        modal.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Initialize the screenshot viewer
     */
    function init() {
        setupTabs();
        setupEventListeners();
        setupImageModal();
        
        // Load initial screenshots for all tabs
        updateScreenshots('landing');
        updateScreenshots('students');
        updateScreenshots('lesson');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
