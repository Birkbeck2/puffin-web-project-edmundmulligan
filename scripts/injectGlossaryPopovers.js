/*
 **********************************************************************
 * File       : scripts/injectGlossaryPopovers.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically loads glossary definitions from glossary.html into
 *   popover elements to follow DRY principle. Used in all lessons.
 *   
 *   Supports two modes:
 *   1. Individual popovers with IDs like glossary-{term}-popover
 *   2. Shared popover (glossary-popover) with buttons having data-glossary-term attribute
 **********************************************************************
 */

(function() {
    'use strict';

    /**
     * Class for injecting glossary definitions into popovers
     */
    class GlossaryPopoverInjector {
        constructor() {
            this.glossaryDoc = null;
        }

        /**
         * Fetch the glossary page and parse it
         * @returns {Promise<Document>} Parsed glossary document
         */
        async fetchGlossary() {
            if (this.glossaryDoc) {
                return this.glossaryDoc;
            }

            const response = await fetch('../pages/glossary.html');
            if (!response.ok) {
                throw new Error('Failed to fetch glossary');
            }

            const html = await response.text();
            const parser = new DOMParser();
            this.glossaryDoc = parser.parseFromString(html, 'text/html');
            return this.glossaryDoc;
        }

        /**
         * Sanitise text content to prevent XSS attacks
         * @param {string} text - Text to sanitise
         * @returns {string} Sanitised text
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Extract term ID from popover ID
         * @param {string} popoverId - The popover element ID
         * @returns {string|null} The term identifier or null
         */
        extractTermFromId(popoverId) {
            const match = popoverId.match(/^glossary-(.+)-popover$/);
            return match ? match[1] : null;
        }

        /**
         * Get glossary term and definition content
         * @param {string} term - The term identifier (e.g., 'html', 'css')
         * @returns {Object|null} Object with termText and definition, or null if not found
         */
        getGlossaryContent(term) {
            const glossaryId = `glossary-${term}`;

            // Find the term and definition in the glossary
            const dt = this.glossaryDoc.getElementById(glossaryId);
            if (!dt) {
                console.warn(`Glossary term not found: ${glossaryId}`);
                return null;
            }

            const termText = dt.textContent.trim();

            // Get the next sibling dd element (definition)
            const dd = dt.nextElementSibling;
            if (!dd || dd.tagName !== 'DD') {
                console.warn(`Definition not found for term: ${glossaryId}`);
                return null;
            }

            const definition = dd.innerHTML.trim(); // Use innerHTML to preserve formatting

            return { termText, definition };
        }

        /**
         * Populate shared popover with glossary content for a specific term
         * @param {HTMLElement} popover - The shared popover element
         * @param {string} term - The term to display
         */
        populateSharedPopover(popover, term) {
            const content = this.getGlossaryContent(term);
            if (!content) {
                return;
            }

            // Populate the popover with sanitised content
            popover.innerHTML = `
<h2>${this.escapeHtml(content.termText)}</h2>
<div>${content.definition}</div>
<button type="button" popovertarget="${popover.id}" popovertargetaction="hide" class="popover-close-button">Close</button>
`;
        }

        /**
         * Populate a single popover with glossary content
         * @param {HTMLElement} popover - The popover element to populate
         */
        populatePopover(popover) {
            const popoverId = popover.id;
            const term = this.extractTermFromId(popoverId);
            
            if (!term) {
                return;
            }

            const content = this.getGlossaryContent(term);
            if (!content) {
                return;
            }

            // Populate the popover with sanitised content
            popover.innerHTML = `
<h2>${this.escapeHtml(content.termText)}</h2>
<div>${content.definition}</div>
<button type="button" popovertarget="${popoverId}" popovertargetaction="hide" class="popover-close-button">Close</button>
`;
        }

        /**
         * Setup event listeners for glossary icon buttons that use a shared popover
         */
        setupSharedPopover() {
            const sharedPopover = document.getElementById('glossary-popover');
            if (!sharedPopover) {
                return;
            }

            // Find all glossary icon buttons with data-glossary-term attribute
            const glossaryButtons = document.querySelectorAll('.glossary-icon-button[data-glossary-term]');
            
            glossaryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const term = button.getAttribute('data-glossary-term');
                    if (term) {
                        this.populateSharedPopover(sharedPopover, term);
                    }
                });
            });
        }

        /**
         * Find and populate all glossary popovers on the page
         */
        async init() {
            try {
                await this.fetchGlossary();

                // Setup shared popover if it exists
                this.setupSharedPopover();

                // Also support individual popovers (legacy)
                const glossaryPopovers = document.querySelectorAll('.glossary-popover');
                glossaryPopovers.forEach(popover => {
                    // Only populate if it has a term-specific ID
                    if (this.extractTermFromId(popover.id)) {
                        this.populatePopover(popover);
                    }
                });
            } catch (error) {
                console.error('Error loading glossary:', error);
            }
        }
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', async function() {
        const injector = new GlossaryPopoverInjector();
        await injector.init();
    });
})();
