#!/usr/bin/env node

/**
 * Extract lesson content from original HTML and generate JSON data file
 * 
 * This script parses the original lesson-00-bak.html and extracts content
 * by section ID, generating a properly structured JSON data file.
 * 
 * Usage: node bin/extract-lesson-content.js
 */

const fs = require('fs');

function isValidIdentifier(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function formatKey(key) {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
}

function toJs(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const nextPad = '  '.repeat(indent + 1);

  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    const items = value.map(item => `${nextPad}${toJs(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    const props = entries.map(([k, v]) => `${nextPad}${formatKey(k)}: ${toJs(v, indent + 1)}`);
    return `{\n${props.join(',\n')}\n${pad}}`;
  }

  if (typeof value === 'string') {
    if (value.includes('\n')) {
      const escaped = value
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${');
      return `\`${escaped}\``;
    }

    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}
const path = require('path');

/**
 * Extract content from HTML file by section ID
 * @param {string} htmlContent - The HTML file content
 * @param {string} sectionId - The section ID to extract
 * @returns {string} - The HTML content inside the section, excluding the section tags
 */
function extractSectionContent(htmlContent, sectionId) {
  const regex = new RegExp(
    `<section[^>]*id="${sectionId}"[^>]*>([\\s\\S]*?)</section>`,
    'i'
  );
  const match = htmlContent.match(regex);
  
  if (!match) {
    console.warn(`⚠ Warning: Could not find section "${sectionId}"`);
    return '';
  }
  
  // Extract content inside the section, remove the section wrapper
  let content = match[1];
  
  // Remove student-image div (it's a comment and placeholder)
  content = content.replace(/<div class="student-image">[\s\S]*?<\/div>\s*/i, '');
  
  // Remove h3 title (we'll handle that separately in the template)
  content = content.replace(/<h3[^>]*>[\s\S]*?<\/h3>\s*/i, '');
  
  // Remove wrapping div id (e.g., <div id="vsc-windows">...</div>)
  content = content.replace(/<div id="[^"]*">\s*([\s\S]*)\s*<\/div>$/i, '$1');
  
  return content.trim();
}

/**
 * Main extraction function
 */
function extractContent() {
  console.log('📖 Extracting lesson content from original HTML...\n');
  
  // Read original file
  const originalPath = 'students/lesson-00-bak.html';
  if (!fs.existsSync(originalPath)) {
    console.error(`✗ Error: Cannot find ${originalPath}`);
    process.exit(1);
  }
  
  const htmlContent = fs.readFileSync(originalPath, 'utf8');
  
  // Extract content for each tool by OS
  const osTools = ['windows', 'macos', 'linux'];
  const toolIds = ['vsc', 'firefox', 'nodejs', 'git', 'sqlite'];
  
  // Extract non-developer platforms
  const platformIds = ['chromebook', 'android', 'ios'];
  const platforms = [];
  
  console.log('Processing non-developer platforms...');
  for (const platformId of platformIds) {
    const sectionId = `${platformId}`;
    const content = extractSectionContent(htmlContent, sectionId);
    
    if (content) {
      platforms.push({
        id: platformId,
        name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        cap_name: {
          'chromebook': 'Chromebook',
          'android': 'Android',
          'ios': 'iOS (iPhone/iPad)'
        }[platformId],
        non_developer: true,
        description: content
      });
      console.log(`  ✓ Extracted ${platformId}`);
    }
  }
  console.log();
  
  const developers = [];
  
  for (const os of osTools) {
    console.log(`Processing ${os.toUpperCase()}...`);
    
    const platform = {
      os_id: os,
      os_name: os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : 'Linux',
      tools: []
    };
    
    for (const toolId of toolIds) {
      const sectionId = `instructions-${os}-${toolId}`;
      const content = extractSectionContent(htmlContent, sectionId);
      
      if (content) {
        platform.tools.push({
          tool_id: toolId,
          tool_name: {
            'vsc': 'Visual Studio Code',
            'firefox': 'Mozilla Firefox',
            'nodejs': 'Node.js',
            'git': 'Git',
            'sqlite': 'SQLite'
          }[toolId],
          tool_content: content
        });
        console.log(`  ✓ Extracted ${toolId}`);
      } else {
        console.log(`  ⚠ Skipped ${toolId} (not found)`);
      }
    }
    
    developers.push(platform);
  }
  
  // Extract common sections (introduction, warning, installing-required-software)
  const commonSectionIds = ['introduction', 'warning', 'installing-required-software'];
  const commonSections = [];
  
  console.log('Processing common sections...');
  for (const sectionId of commonSectionIds) {
    const fullSectionId = `${sectionId}`;
    const content = extractSectionContent(htmlContent, fullSectionId);
    
    if (content) {
      commonSections.push({
        section: true,
        section_id: sectionId,
        title: {
          'introduction': 'Introduction',
          'warning': 'Warning',
          'installing-required-software': 'Installing Required Software'
        }[sectionId],
        container_class: {
          'introduction': 'intro-container',
          'warning': 'warning-container',
          'installing-required-software': ''
        }[sectionId],
        content_class: {
          'introduction': 'intro-content',
          'warning': 'warning-content',
          'installing-required-software': ''
        }[sectionId],
        title_class: 'lesson-title',
        class_list: 'lesson-install-windows lesson-install-macos lesson-install-linux',
        content: content
      });
      console.log(`  ✓ Extracted ${sectionId}`);
    }
  }
  console.log();
  
  // Extract common dev sections (extensions, projects folder, dev server)
  const commonDevSectionIds = ['vsc-extensions', 'projects-folder', 'dev-server'];
  const commonDevSections = [];
  
  console.log('\nProcessing common dev sections...');
  for (const sectionId of commonDevSectionIds) {
    // Try Windows version first (they should all be the same)
    const fullSectionId = `instructions-windows-${sectionId}`;
    const content = extractSectionContent(htmlContent, fullSectionId);
    
    if (content) {
      commonDevSections.push({
        section_id: sectionId,
        section_title: {
          'vsc-extensions': 'Visual Studio Code Extensions',
          'projects-folder': 'Create a Projects Folder',
          'dev-server': 'Setting Up the Development Server'
        }[sectionId],
        section_content: content
      });
      console.log(`  ✓ Extracted ${sectionId}`);
    }
  }
  
  // Create the base data structure
  const data = {
    lesson: {
      number: 0,
      title: 'Getting Started',
      page_title: 'Lesson 0 - Getting Started'
    },
    platforms: platforms,
    common_sections: commonSections,
    developer_platforms: developers,
    common_dev_sections: commonDevSections
  };
  
  // Write output
  const outputPath = 'data/lesson-00-student.js';
  const outputContent = `module.exports = ${toJs(data, 0)};\n`;
  fs.writeFileSync(outputPath, outputContent, 'utf8');
  
  console.log(`\n✓ Generated ${outputPath}`);
  console.log(`  Contains ${platforms.length} non-developer platforms`);
  console.log(`  Contains ${commonSections.length} common sections`);
  console.log(`  Contains ${developers.length} developer platforms (OS) with tools`);
  console.log(`  Contains ${commonDevSections.length} common dev sections`);
  const totalToolSections = developers.reduce((sum, dev) => sum + dev.tools.length, 0);
  console.log(`  Total tool sections: ${totalToolSections}`);
}

// Run extraction
try {
  extractContent();
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
