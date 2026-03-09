/*
 **********************************************************************
 * File       : scripts/lessonNavigation.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Handles navigation functionality for lesson pages including:
 *   - Section navigation within lessons
 *   - Lesson navigation (fast forward/backward)
 *   - Progress bar updates with wand icons
 *   - Keyboard navigation support
 **********************************************************************
 */

(function() {
    'use strict';

    /**
     * Class for managing lesson navigation
     */
    class LessonNavigator {
        constructor() {
            this.sections = [];
            this.currentSectionIndex = 0;
            this.totalSections = 0;
            this.lessonNumber = null;
            
            this.init();
        }

        /**
         * Initialize the lesson navigator
         */
        init() {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
            } else {
                this.setupNavigation();
            }
        }

        /**
         * Set up navigation elements and event listeners
         */
        setupNavigation() {
            // Find all lesson sections
            this.sections = document.querySelectorAll('.lesson-section');
            this.totalSections = this.sections.length;
            
            if (this.totalSections === 0) {
                console.warn('No lesson sections found');
                return;
            }

            // Extract lesson number from URL
            this.lessonNumber = this.extractLessonNumber();

            // Set up button event listeners
            this.setupButtonListeners();

            // Set up progress bar click listeners
            this.setupProgressBarListeners();

            // Set up keyboard navigation
            this.setupKeyboardNavigation();

            // Initialize display
            this.showSection(0);
            this.updateProgress();
            this.updateNavigationButtons();
        }

        /**
         * Extract lesson number from current URL
         */
        extractLessonNumber() {
            const path = window.location.pathname;
            const match = path.match(/lesson-(\d+)\.html/);
            return match ? parseInt(match[1], 10) : 1;
        }

        /**
         * Set up button event listeners
         */
        setupButtonListeners() {
            // Section navigation buttons
            const backwardBtn = document.getElementById('backwardBtn');
            const forwardBtn = document.getElementById('forwardBtn');
            const fastBackwardBtn = document.getElementById('fastBackwardBtn');
            const fastForwardBtn = document.getElementById('fastForwardBtn');

            if (backwardBtn) {
                backwardBtn.addEventListener('click', () => this.previousSection());
            }
            if (forwardBtn) {
                forwardBtn.addEventListener('click', () => this.nextSection());
            }
            if (fastBackwardBtn) {
                fastBackwardBtn.addEventListener('click', () => this.previousLesson());
            }
            if (fastForwardBtn) {
                fastForwardBtn.addEventListener('click', () => this.nextLesson());
            }
        }

        /**
         * Set up progress bar click listeners
         */
        setupProgressBarListeners() {
            const wandIcons = document.querySelectorAll('.wand-icon');
            wandIcons.forEach((wand, index) => {
                wand.addEventListener('click', () => this.goToSection(index));
                wand.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.goToSection(index);
                    }
                });
                // Make wands focusable
                wand.setAttribute('tabindex', '0');
            });
        }

        /**
         * Set up keyboard navigation
         */
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (event) => {
                // Only handle keyboard shortcuts if not in an input field
                if (event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.isContentEditable) {
                    return;
                }

                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault();
                        this.previousSection();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        this.nextSection();
                        break;
                    case 'Home':
                        event.preventDefault();
                        this.goToSection(0);
                        break;
                    case 'End':
                        event.preventDefault();
                        this.goToSection(this.totalSections - 1);
                        break;
                }
            });
        }

        /**
         * Show a specific section
         */
        showSection(index) {
            if (index < 0 || index >= this.totalSections) {
                return;
            }

            // Hide all sections
            this.sections.forEach(section => {
                section.classList.add('hidden');
            });

            // Show the selected section
            this.sections[index].classList.remove('hidden');

            // Update current index
            this.currentSectionIndex = index;

            // Scroll to section accounting for sticky header
            this.scrollToSectionWithHeader(this.sections[index]);

            // Update navigation state
            this.updateProgress();
            this.updateNavigationButtons();

            // Announce to screen readers
            this.announceCurrentSection();
        }

        /**
         * Scroll to section accounting for sticky header height
         */
        scrollToSectionWithHeader(sectionElement) {
            const stickyHeader = document.querySelector('.lesson-header-fixed');
            const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
            const elementTop = sectionElement.offsetTop;
            const offsetPosition = elementTop - headerHeight - 20; // 20px extra spacing

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        /**
         * Navigate to next section
         */
        nextSection() {
            if (this.currentSectionIndex < this.totalSections - 1) {
                this.showSection(this.currentSectionIndex + 1);
            }
        }

        /**
         * Navigate to previous section
         */
        previousSection() {
            if (this.currentSectionIndex > 0) {
                this.showSection(this.currentSectionIndex - 1);
            }
        }

        /**
         * Go to specific section
         */
        goToSection(index) {
            this.showSection(index);
        }

        /**
         * Navigate to next lesson
         */
        nextLesson() {
            const nextLessonNumber = this.lessonNumber + 1;
            const nextLessonUrl = `lesson-${nextLessonNumber.toString().padStart(2, '0')}.html`;
            
            // Check if next lesson exists (you might want to load this from lessons.json)
            // For now, we'll assume lessons go up to 20
            if (nextLessonNumber <= 20) {
                window.location.href = nextLessonUrl;
            } else {
                this.showMessage('This is the last lesson!');
            }
        }

        /**
         * Navigate to previous lesson
         */
        previousLesson() {
            const prevLessonNumber = this.lessonNumber - 1;
            
            if (prevLessonNumber >= 0) {
                const prevLessonUrl = `lesson-${prevLessonNumber.toString().padStart(2, '0')}.html`;
                window.location.href = prevLessonUrl;
            } else {
                this.showMessage('This is the first lesson!');
            }
        }

        /**
         * Update progress bar display
         */
        updateProgress() {
            const wandIcons = document.querySelectorAll('.wand-icon');
            const progressBar = document.querySelector('.progress-bar');
            
            if (progressBar) {
                const progressPercent = ((this.currentSectionIndex + 1) / this.totalSections) * 100;
                progressBar.style.setProperty('--progress-percent', `${progressPercent}%`);
            }

            wandIcons.forEach((wand, index) => {
                // Remove all state classes
                wand.classList.remove('current', 'previous', 'next');

                // Set appropriate class based on position relative to current section
                if (index < this.currentSectionIndex) {
                    wand.classList.add('previous');
                    // Update to sparkling wand for previous sections
                    const img = wand.querySelector('img');
                    if (img) {
                        img.src = '../images/fontawesome/wand-magic-sparkles-sharp-duotone-regular-full.svg';
                        img.alt = 'Completed section';
                    }
                } else if (index === this.currentSectionIndex) {
                    wand.classList.add('current');
                    // Current section gets the sparkling wand with favicon colors
                    const img = wand.querySelector('img');
                    if (img) {
                        img.src = '../images/fontawesome/wand-magic-sparkles-sharp-duotone-regular-full.svg';
                        img.alt = 'Current section';
                    }
                } else {
                    wand.classList.add('next');
                    // Future sections get non-sparkling wand
                    const img = wand.querySelector('img');
                    if (img) {
                        img.src = '../images/fontawesome/wand-magic-duotone-regular-full.svg';
                        img.alt = 'Future section';
                    }
                }
            });

            // Update ARIA attributes
            const progressElement = document.getElementById('progressBar');
            if (progressElement) {
                progressElement.setAttribute('aria-valuenow', this.currentSectionIndex + 1);
            }
        }

        /**
         * Update navigation button states
         */
        updateNavigationButtons() {
            const backwardBtn = document.getElementById('backwardBtn');
            const forwardBtn = document.getElementById('forwardBtn');

            if (backwardBtn) {
                backwardBtn.disabled = this.currentSectionIndex === 0;
            }
            if (forwardBtn) {
                forwardBtn.disabled = this.currentSectionIndex === this.totalSections - 1;
            }
        }

        /**
         * Announce current section to screen readers
         */
        announceCurrentSection() {
            const currentSection = this.sections[this.currentSectionIndex];
            if (currentSection) {
                const sectionTitle = currentSection.querySelector('.lesson-title');
                if (sectionTitle) {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.className = 'sr-only';
                    announcement.textContent = `Now viewing section ${this.currentSectionIndex + 1} of ${this.totalSections}: ${sectionTitle.textContent}`;
                    
                    document.body.appendChild(announcement);
                    
                    // Remove the announcement after it's been read
                    setTimeout(() => {
                        document.body.removeChild(announcement);
                    }, 1000);
                }
            }
        }

        /**
         * Show a temporary message to the user
         */
        showMessage(message) {
            // Create a temporary message element
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--colour-effective-accent);
                color: white;
                padding: 1rem;
                border-radius: var(--border-radius);
                z-index: 1000;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            
            document.body.appendChild(messageElement);
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (messageElement.parentNode) {
                    document.body.removeChild(messageElement);
                }
            }, 3000);
        }
    }

    // Initialize the lesson navigator
    new LessonNavigator();
})();