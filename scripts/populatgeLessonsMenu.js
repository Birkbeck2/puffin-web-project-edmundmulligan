/*
 **********************************************************************
 * File       : scripts/populatgeLessonsMenu.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *   Dynamically generates the lessons navigation menu from data/lessons.json
 *   Creates popover windows for each lesson with title and description
 *   Handles missing files with warning popovers
 **********************************************************************
 */

/**
 * Check if a file exists by attempting a HEAD fetch
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - True if file exists, false otherwise
 */
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Determine the context and base paths based on current page location
 * @returns {Object} - Contains context ('students' or 'mentors'), pathPrefix, and lessonFolder
 */
function getPageContext() {
    const path = window.location.pathname;
    
    // Check if we're in a lesson page (students/lesson-*.html or mentors/lesson-*.html)
    if (path.includes('/students/lesson-')) {
        return {
            context: 'students',
            pathPrefix: '../',
            lessonFolder: 'students'
        };
    } else if (path.includes('/mentors/lesson-')) {
        return {
            context: 'mentors',
            pathPrefix: '../',
            lessonFolder: 'mentors'
        };
    }
    // Check if we're in pages folder (pages/students.html or pages/mentors.html)
    else if (path.includes('/pages/students.html')) {
        return {
            context: 'students',
            pathPrefix: '../',
            lessonFolder: 'students'
        };
    } else if (path.includes('/pages/mentors.html')) {
        return {
            context: 'mentors',
            pathPrefix: '../',
            lessonFolder: 'mentors'
        };
    }
    
    // Default to students context
    return {
        context: 'students',
        pathPrefix: '',
        lessonFolder: 'students'
    };
}

/**
 * Create a popover element for a lesson
 * @param {string} id - Unique popover ID
 * @param {Object} lesson - Lesson data from JSON
 * @param {boolean} isWarning - Whether this is a warning popover
 * @returns {HTMLElement} - The popover element
 */
function createPopover(id, lesson, isWarning) {
    const popover = document.createElement('div');
    popover.id = id;
    popover.setAttribute('popover', 'auto');
    
    if (isWarning) {
        popover.className = 'popover lesson-popover warning-popover';
        popover.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>This page has not been written yet.</p>
        `;
    } else {
        popover.className = 'popover lesson-popover info-popover';
        popover.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
        `;
    }
    
    return popover;
}

/**
 * Create a menu item (li element) for a lesson
 * @param {Object} lesson - Lesson data from JSON
 * @param {string} pathPrefix - Path prefix for URLs
 * @param {string} lessonFolder - Folder name (students or mentors)
 * @param {boolean} fileExistsInFolder - Whether the file exists
 * @returns {HTMLElement} - The list item element
 */
function createMenuItem(lesson, pathPrefix, lessonFolder, fileExistsInFolder) {
    const li = document.createElement('li');
    const popoverId = `lesson-popover-${lesson.id.replace(/\s+/g, '-')}`;
    
    if (lesson.file && fileExistsInFolder) {
        // File exists - create a link
        const link = document.createElement('a');
        link.href = `${pathPrefix}${lessonFolder}/${lesson.file}`;
        link.textContent = lesson.id;
        link.dataset.popoverId = popoverId;
        
        // Add hover and focus event listeners
        link.addEventListener('mouseenter', (e) => showPopoverById(popoverId, e.currentTarget));
        link.addEventListener('mouseleave', () => hidePopoverById(popoverId));
        link.addEventListener('focus', (e) => showPopoverById(popoverId, e.currentTarget));
        link.addEventListener('blur', () => hidePopoverById(popoverId));
        
        li.appendChild(link);
    } else {
        // File doesn't exist or is null - create a button
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = lesson.id;
        button.dataset.popoverId = popoverId;
        
        // Add hover and focus event listeners
        button.addEventListener('mouseenter', (e) => showPopoverById(popoverId, e.currentTarget));
        button.addEventListener('mouseleave', () => hidePopoverById(popoverId));
        button.addEventListener('focus', (e) => showPopoverById(popoverId, e.currentTarget));
        button.addEventListener('blur', () => hidePopoverById(popoverId));
        
        li.appendChild(button);
    }
    
    return li;
}

/**
 * Position a popover next to its trigger element
 * @param {HTMLElement} popover - The popover element
 * @param {HTMLElement} trigger - The trigger element (link or button)
 */
function positionPopover(popover, trigger) {
    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    
    // Position to the right of the trigger element
    let left = triggerRect.right + 10; // 10px gap
    let top = triggerRect.top;
    
    // Check if popover would go off the right edge of viewport
    if (left + popoverRect.width > window.innerWidth) {
        // Position to the left of trigger instead
        left = triggerRect.left - popoverRect.width - 10;
    }
    
    // Check if popover would go off the bottom of viewport
    if (top + popoverRect.height > window.innerHeight) {
        top = window.innerHeight - popoverRect.height - 10;
    }
    
    // Ensure popover doesn't go off the top
    if (top < 10) {
        top = 10;
    }
    
    // Ensure popover doesn't go off the left
    if (left < 10) {
        left = 10;
    }
    
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
}

/**
 * Show a popover by its ID
 * @param {string} popoverId - The ID of the popover to show
 * @param {HTMLElement} trigger - The trigger element (optional)
 */
function showPopoverById(popoverId, trigger) {
    const popover = document.getElementById(popoverId);
    if (popover && !popover.matches(':popover-open')) {
        popover.showPopover();
        if (trigger) {
            // Use requestAnimationFrame to ensure popover is rendered before positioning
            requestAnimationFrame(() => {
                positionPopover(popover, trigger);
            });
        }
    }
}

/**
 * Hide a popover by its ID
 * @param {string} popoverId - The ID of the popover to hide
 */
function hidePopoverById(popoverId) {
    const popover = document.getElementById(popoverId);
    if (popover && popover.matches(':popover-open')) {
        popover.hidePopover();
    }
}

/**
 * Generate the lessons navigation menu
 */
async function populateLessonsNav() {
    const navContainer = document.getElementById('lessons-nav-container');
    if (!navContainer) {
        console.warn('lessons-nav-container not found on this page');
        return;
    }
    
    try {
        const { pathPrefix, lessonFolder } = getPageContext();
        
        // Fetch lessons data
        const response = await fetch(`${pathPrefix}data/lessons.json`);
        if (!response.ok) {
            throw new Error('Failed to load lessons.json');
        }
        
        const data = await response.json();
        const lessons = data.lessons;
        
        // Create hamburger button for lessons menu
        const hamburger = document.createElement('button');
        hamburger.className = 'lessons-hamburger';
        hamburger.setAttribute('aria-label', 'Toggle lessons menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        
        // Create nav element
        const nav = document.createElement('nav');
        nav.className = 'sidebar';
        nav.setAttribute('aria-label', 'Lessons menu');
        nav.id = 'lessons-sidebar';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Lessons';
        nav.appendChild(heading);
        
        // Create list
        const ul = document.createElement('ul');
        ul.className = 'lesson-nav';
        
        // Create fragment for popovers
        const popoverContainer = document.createDocumentFragment();
        
        // Check file existence and create menu items
        for (const lesson of lessons) {
            let fileExistsInFolder = false;
            
            // Check if file exists in the appropriate folder
            if (lesson.file) {
                const fileUrl = `${pathPrefix}${lessonFolder}/${lesson.file}`;
                fileExistsInFolder = await fileExists(fileUrl);
            }
            
            // Create menu item
            const menuItem = createMenuItem(lesson, pathPrefix, lessonFolder, fileExistsInFolder);
            ul.appendChild(menuItem);
            
            // Create popover
            const popoverId = `lesson-popover-${lesson.id.replace(/\s+/g, '-')}`;
            const isWarning = !lesson.file || !fileExistsInFolder;
            const popover = createPopover(popoverId, lesson, isWarning);
            popoverContainer.appendChild(popover);
        }
        
        // Append list to nav
        nav.appendChild(ul);
        
        // Clear container and add hamburger button and nav
        navContainer.innerHTML = '';
        navContainer.appendChild(hamburger);
        navContainer.appendChild(nav);
        
        // Create overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        navContainer.appendChild(overlay);
        
        // Setup hamburger toggle
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('sidebar-open');
            overlay.classList.toggle('sidebar-overlay-visible');
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', () => {
            hamburger.setAttribute('aria-expanded', 'false');
            nav.classList.remove('sidebar-open');
            overlay.classList.remove('sidebar-overlay-visible');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 400) {
                if (!navContainer.contains(e.target)) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    nav.classList.remove('sidebar-open');
                    overlay.classList.remove('sidebar-overlay-visible');
                }
            }
        });
        
        // Add popovers to body
        document.body.appendChild(popoverContainer);
        
    } catch (error) {
        console.error('Error populating lessons navigation:', error);
        navContainer.innerHTML = '<p>Error loading lessons navigation</p>';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateLessonsNav);
} else {
    populateLessonsNav();
}
