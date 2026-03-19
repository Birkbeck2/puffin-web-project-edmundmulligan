/*
 **********************************************************************
 * File       : scripts/toggleHeaderAndFooter.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles toggle functionality for collapsible header and footer
 *   sections. Works with both header-minimal/header-full and
 *   footer-minimal/footer-full elements.
 *   This script sets up listeners after the header and footer are injected.
 *   Saves state to localStorage to persist across pages.
 **********************************************************************
 */

(function() {
    'use strict';

    /**
     * Manage expand/collapse behaviour for injected header and footer variants.
     *
     * @remarks Preconditions:
     * - `injectCommonCode.js` must dispatch the `headerInjected` and `footerInjected` events.
     * - The generated markup must contain the expected minimal/full wrappers and toggle buttons.
     */
    class HeaderFooterToggler {
        /**
         * Create storage keys used to persist header and footer state between page loads.
         *
         * @returns {void}
         */
        constructor() {
            this.HEADER_STATE_KEY = 'headerState';
            this.FOOTER_STATE_KEY = 'footerState';
        }

        /**
         * Set up header toggle functionality
         */
        setupHeaderToggle() {
            const header = document.querySelector('header.header');
            if (!header) {
                return;
            }

            const headerMinimal = header.querySelector('.header-minimal');
            const headerFull = header.querySelector('.header-full');
            const headerButtons = header.querySelectorAll('.header-button button');
        
            // Load saved state
            const savedState = localStorage.getItem(this.HEADER_STATE_KEY);
            if (savedState === 'expanded') {
                headerMinimal.style.display = 'none';
                headerFull.style.display = 'grid';
            } else if (savedState === 'compact') {
                headerMinimal.style.display = 'block';
                headerFull.style.display = 'none';
            }
        
            headerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const icon = button.querySelector('i');
                
                    if (icon.classList.contains('fa-chevron-down')) {
                        // Down arrow clicked - show full header
                        headerMinimal.style.display = 'none';
                        headerFull.style.display = 'grid';
                        localStorage.setItem(this.HEADER_STATE_KEY, 'expanded');
                    } else {
                        // Up arrow clicked - show minimal header
                        headerMinimal.style.display = 'block';
                        headerFull.style.display = 'none';
                        localStorage.setItem(this.HEADER_STATE_KEY, 'compact');
                    }
                });
            });
        }

        /**
         * Set up footer toggle functionality
         */
        setupFooterToggle() {
            const footer = document.querySelector('footer.footer');
            if (!footer) {
                return;
            }

            const footerMinimal = footer.querySelector('.footer-minimal');
            const footerFull = footer.querySelector('.footer-full');
            const footerButtons = footer.querySelectorAll('.footer-button button');
        
            // Load saved state
            const savedState = localStorage.getItem(this.FOOTER_STATE_KEY);
            if (savedState === 'expanded') {
                footerMinimal.style.display = 'none';
                footerFull.style.display = 'flex';
            } else if (savedState === 'compact') {
                footerMinimal.style.display = 'flex';
                footerFull.style.display = 'none';
            }
        
            footerButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const icon = button.querySelector('i');
                
                    if (icon.classList.contains('fa-chevron-up')) {
                        // Up arrow clicked - show full footer
                        footerMinimal.style.display = 'none';
                        footerFull.style.display = 'flex';
                        localStorage.setItem(this.FOOTER_STATE_KEY, 'expanded');
                    } else {
                        // Down arrow clicked - show minimal footer
                        footerMinimal.style.display = 'flex';
                        footerFull.style.display = 'none';
                        localStorage.setItem(this.FOOTER_STATE_KEY, 'compact');
                    }
                });
            });
        }

        /**
         * Initialize the toggler
         */
        init() {
            // Listen for custom events from inject scripts
            document.addEventListener('headerInjected', () => this.setupHeaderToggle());
            document.addEventListener('footerInjected', () => this.setupFooterToggle());
        }
    }

    // Create instance and initialize
    const toggler = new HeaderFooterToggler();
    toggler.init();
})();
