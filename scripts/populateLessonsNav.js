/*
 **********************************************************************
 * File       : scripts/populateLessonsNav.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2025 The Embodied Mind
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
        link.addEventListener('mouseenter', () => showPopoverById(popoverId));
        link.addEventListener('mouseleave', () => hidePopoverById(popoverId));
        link.addEventListener('focus', () => showPopoverById(popoverId));
        link.addEventListener('blur', () => hidePopoverById(popoverId));
        
        li.appendChild(link);
    } else {
        // File doesn't exist or is null - create a button
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = lesson.id;
        button.dataset.popoverId = popoverId;
        
        // Add hover and focus event listeners
        button.addEventListener('mouseenter', () => showPopoverById(popoverId));
        button.addEventListener('mouseleave', () => hidePopoverById(popoverId));
        button.addEventListener('focus', () => showPopoverById(popoverId));
        button.addEventListener('blur', () => hidePopoverById(popoverId));
        
        li.appendChild(button);
    }
    
    return li;
}

/**
 * Show a popover by its ID
 * @param {string} popoverId - The ID of the popover to show
 */
function showPopoverById(popoverId) {
    const popover = document.getElementById(popoverId);
    if (popover && !popover.matches(':popover-open')) {
        popover.showPopover();
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
        
        // Create nav element
        const nav = document.createElement('nav');
        nav.className = 'sidebar';
        nav.setAttribute('aria-label', 'Lesson navigation');
        
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
        
        // Clear container and add new nav
        navContainer.innerHTML = '';
        navContainer.appendChild(nav);
        
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
