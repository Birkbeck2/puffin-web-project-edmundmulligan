#!/usr/bin/env node
/*
 **********************************************************************
 * File       : bin/build-lessons.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see license-and-credits.html page)
 * Description:
 *     Build script for generating lesson HTML files from Mustache templates
 * 
 *     Usage: npm run build
 * 
 *     This script:
 *       1. Reads template files from templates/
 *       2. Reads data files from data/
 *       3. Generates HTML output files in students/ and mentors/
 *       4. Uses Mustache for templating
 **********************************************************************
 */

const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

function loadData(dataPath) {
  const ext = path.extname(dataPath).toLowerCase();

  if (ext === '.js' || ext === '.cjs') {
    // Ensure fresh reads for iterative editing during development.
    const resolvedPath = path.resolve(dataPath);
    delete require.cache[resolvedPath];
    return require(resolvedPath);
  }

  const dataStr = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(dataStr);
}

// Define the build tasks (student versions only)
const buildTasks = [
  {
    lesson: 0,
    studentTemplate: 'templates/lesson-00-student.mustache',
    studentData: 'data/lesson-00-student.js',
    studentOutput: 'students/lesson-00.html'
  }
  // Add more lessons as needed
];

/**
 * Build a single lesson (student version only)
 * @param {Object} task - The build task configuration
 */
function buildLesson(task) {
  console.log(`Building Lesson ${task.lesson}...`);

  try {
    // Read template and data for student version
    if (fs.existsSync(task.studentTemplate) && fs.existsSync(task.studentData)) {
      const template = fs.readFileSync(task.studentTemplate, 'utf8');
      const data = loadData(task.studentData);

      // Render using Mustache
      const output = Mustache.render(template, data);

      // Write output file
      fs.writeFileSync(task.studentOutput, output, 'utf8');
      console.log(`✓ Generated ${task.studentOutput}`);
    } else {
      console.log(`⚠ Skipping student version (template or data not found)`);
    }

  } catch (error) {
    console.error(`✗ Error building Lesson ${task.lesson}: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main build function
 */
function build() {
  console.log('🔨 Building lessons from templates...\n');

  buildTasks.forEach(task => {
    buildLesson(task);
  });

  console.log('\n✓ Build complete!');
}

// Run the build
build();
