/*
 **********************************************************************
 * File       : scripts/embodiedMindPopover.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Creates an interactive popover for the Embodied Mind logo in the footer.
 *   Clicking the logo displays information about The Embodied Mind.
 **********************************************************************
 */

(function() {
    'use strict';

    /**
     * Safe logging helper that checks if Debug is available
     */
    function log(message, ...args) {
        if (typeof Debug !== 'undefined' && Debug.log) {
            Debug.log(message, ...args);
        } else {
            console.log(message, ...args);
        }
    }

    /**
     * Class for managing the Embodied Mind logo popover
     */
    class EmbodiedMindPopover {
        /**
         * Initialize the popover manager
         */
        constructor() {
            this.popover = null;
            this.logo = null;
            this.backdrop = null;
            this.supportsPopoverAPI = this.checkPopoverAPISupport();
        }

        /**
         * Check if the browser supports the Popover API
         * @returns {boolean} True if Popover API is supported
         */
        checkPopoverAPISupport() {
            return typeof HTMLElement.prototype.showPopover === 'function';
        }

        /**
         * Create the popover element with content about The Embodied Mind
         * @returns {HTMLElement} The popover element
         */
        createPopover() {
            const popover = document.createElement('div');
            popover.id = 'embodied-mind-popover';
            popover.className = 'popover info-popover embodied-mind-popover';
            
            // Use Popover API if supported, otherwise use display toggle
            if (this.supportsPopoverAPI) {
                popover.popover = 'auto';
            } else {
                popover.style.display = 'none';
                popover.style.position = 'fixed';
                popover.style.zIndex = '1000';
                
                // Create backdrop for non-Popover API browsers
                this.backdrop = document.createElement('div');
                this.backdrop.className = 'embodied-mind-popover-backdrop';
                this.backdrop.addEventListener('click', () => this.hidePopover());
                document.body.appendChild(this.backdrop);
            }

            popover.innerHTML = `
                <h3>About The Embodied Mind</h3>
                <p>
                    <strong>The Embodied Mind</strong> is <strong>Edmund Mulligan</strong> — 
                    Therapist, Educator, and Mentor.
                </p>
                <p>
                    Edmund works as a technologist in the transport sector, specifically in 
                    software development for Transport for London. He is a Mental Health First Aider 
                    and has been an advanced student of Cognitive Behavioural Hypnotherapy and Movement Shiatsu.
                </p>
                <p>
                    He holds a BSc (First Class Honours) in Psychology from the Open University, 
                    a Postgraduate Diploma in Applied Statistics from Birkbeck College, and is 
                    currently pursuing a Postgraduate Diploma in Web Design at Birkbeck College.
                </p>
                <p>
                    Edmund is a Graduate Statistician Fellow of the Royal Statistical Society 
                    (GradStat FRSS) and a Chartered IT Professional Member of the British Computer 
                    Society (MBCS CITP). He is also a STEM Ambassador (Science, Technology, 
                    Engineering and Mathematics).
                </p>
                <p>
                    <a href="https://www.embodied-mind.org/" target="_blank" rel="noopener noreferrer">
                        Visit The Embodied Mind website
                    </a>
                </p>
                <button id="embodied-mind-popover-close">Close</button>
            `;

            document.body.appendChild(popover);
            
            // Set up close button
            const closeBtn = popover.querySelector('#embodied-mind-popover-close');
            closeBtn.addEventListener('click', () => this.hidePopover());
            
            log('EmbodiedMindPopover: Popover created', { supportsAPI: this.supportsPopoverAPI });
            return popover;
        }

        /**
         * Show the popover
         */
        showPopover() {
            if (!this.popover) return;
            
            if (this.supportsPopoverAPI) {
                try {
                    this.popover.showPopover();
                } catch (error) {
                    log('EmbodiedMindPopover: Error showing popover', error);
                    // Fallback to display toggle
                    this.popover.style.display = 'block';
                }
            } else {
                this.popover.style.display = 'block';
                if (this.backdrop) {
                    this.backdrop.classList.add('active');
                }
            }
            log('EmbodiedMindPopover: Popover shown');
        }

        /**
         * Hide the popover
         */
        hidePopover() {
            if (!this.popover) return;
            
            if (this.supportsPopoverAPI) {
                try {
                    this.popover.hidePopover();
                } catch (error) {
                    log('EmbodiedMindPopover: Error hiding popover', error);
                    this.popover.style.display = 'none';
                }
            } else {
                this.popover.style.display = 'none';
                if (this.backdrop) {
                    this.backdrop.classList.remove('active');
                }
            }
            log('EmbodiedMindPopover: Popover hidden');
        }

        /**
         * Set up the logo as a clickable trigger for the popover
         */
        setupLogoTrigger() {
            this.logo = document.getElementById('embodied-mind-logo');
            
            if (!this.logo) {
                log('EmbodiedMindPopover: Logo not found');
                return;
            }

            // Make the logo clickable
            this.logo.style.cursor = 'pointer';
            this.logo.setAttribute('role', 'button');
            this.logo.setAttribute('tabindex', '0');
            this.logo.setAttribute('aria-label', 'Click to learn more about The Embodied Mind');
            
            // Add click handler
            this.logo.addEventListener('click', () => {
                log('EmbodiedMindPopover: Logo clicked');
                this.showPopover();
            });

            // Also support keyboard interaction
            this.logo.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    log('EmbodiedMindPopover: Logo activated via keyboard');
                    this.showPopover();
                }
            });

            log('EmbodiedMindPopover: Logo click handler set up');
        }

        /**
         * Initialize the popover system
         */
        init() {
            log('EmbodiedMindPopover: Initializing...');
            
            // Wait for footer to be injected before setting up
            const setupPopover = () => {
                this.popover = this.createPopover();
                this.setupLogoTrigger();
                log('EmbodiedMindPopover: Setup complete');
            };

            // If footer already exists, set up immediately
            if (document.getElementById('embodied-mind-logo')) {
                log('EmbodiedMindPopover: Logo found immediately');
                setupPopover();
            } else {
                log('EmbodiedMindPopover: Waiting for footer injection');
                // Wait for footer injection event
                document.addEventListener('footerInjected', () => {
                    log('EmbodiedMindPopover: Footer injected event received');
                    setupPopover();
                });
            }
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        log('EmbodiedMindPopover: DOM ready, creating instance');
        const popoverManager = new EmbodiedMindPopover();
        popoverManager.init();
    });
})();
