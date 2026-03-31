#!/usr/bin/env node

/**
 * Capture Full Web Page Screenshot
 * 
 * Captures entire web page as PNG, including content beyond viewport.
 * Supports clicking elements to reveal hidden content before capturing.
 * 
 * @license MIT
 * @author Edmund Mulligan / Puffin Web Project
 * 
 * Usage:
 *   node capture-webpage.js <url> <output-name> [options]
 * 
 * Options:
 *   --width <pixels>        Viewport width (default: 1920)
 *   --height <pixels>       Viewport height (default: 1080)
 *   --scale <factor>        Device scale factor for retina (default: 2)
 *   --selector <css>        Capture specific element only
 *   --wait <ms>             Wait time after page load (default: 500ms)
 *   --no-full-page          Capture viewport only (not full page)
 *   --click <selector>      Click element before capturing (can use multiple times)
 *   --click-delay <ms>      Delay after each click (default: 300ms)
 *   --wait-for <selector>   Wait for element to be visible before capturing
 *   --wait-timeout <ms>     Timeout for wait-for (default: 5000ms)
 * 
 * Examples:
 *   # Capture full page
 *   node bin/capture-webpage.js http://localhost:8080 homepage
 *   
 *   # Click button to reveal hidden content
 *   node bin/capture-webpage.js http://localhost:8080 modal --click "#open-modal"
 *   
 *   # Click multiple buttons in sequence
 *   node bin/capture-webpage.js http://localhost:8080 nested --click "#tab1" --click "#subtab"
 *   
 *   # Click and wait for specific element to appear
 *   node bin/capture-webpage.js http://localhost:8080 menu --click "#menu-btn" --wait-for ".menu-panel"
 *   
 *   # Capture specific element after clicking
 *   node bin/capture-webpage.js http://localhost:8080 dropdown --click ".dropdown-toggle" --selector ".dropdown-menu"
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function info(message) {
  log(`ℹ ${message}`, 'cyan');
}

function checkDependencies() {
  try {
    require.resolve('puppeteer');
    success('Puppeteer found');
  } catch (e) {
    error('Puppeteer is not installed');
    log('\nPuppeteer should already be installed (used by pa11y)', 'yellow');
    log('If not, install with: npm install --save-dev puppeteer');
    process.exit(1);
  }
}

async function captureWebpage(url, outputName, options = {}) {
  const {
    width = 1920,
    height = 1080,
    scale = 2,
    selector = null,
    wait = 500,
    fullPage = true,
    clickSelectors = [],
    clickDelay = 300,
    waitForSelector = null,
    waitTimeout = 5000
  } = options;
  
  log('\n' + '='.repeat(60), 'blue');
  log('  Web Page Screenshot Capture', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  info(`URL: ${url}`);
  info(`Output: ${outputName}.png`);
  info(`Viewport: ${width}x${height} @ ${scale}x scale`);
  if (selector) info(`Capture selector: ${selector}`);
  info(`Full page: ${fullPage ? 'Yes' : 'No (viewport only)'}`);
  if (clickSelectors.length > 0) {
    info(`Click sequence: ${clickSelectors.length} element(s)`);
    clickSelectors.forEach((sel, i) => log(`  ${i + 1}. ${sel}`, 'cyan'));
  }
  if (waitForSelector) info(`Wait for: ${waitForSelector}`);
  
  const puppeteer = require('puppeteer');
  
  log('\nLaunching browser...', 'yellow');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: scale
    });
    
    log('Navigating to page...', 'yellow');
    await page.goto(url, {
      waitUntil: 'networkidle0'
    });
    
    // Wait for any animations or dynamic content
    if (wait > 0) {
      log(`Waiting ${wait}ms for page to settle...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, wait));
    }
    
    // Click elements in sequence if specified
    if (clickSelectors.length > 0) {
      log('Clicking elements...', 'yellow');
      for (let i = 0; i < clickSelectors.length; i++) {
        const clickSel = clickSelectors[i];
        log(`  Clicking: ${clickSel}`, 'cyan');
        
        const clickElement = await page.$(clickSel);
        if (!clickElement) {
          error(`Click element not found: ${clickSel}`);
          await browser.close();
          process.exit(1);
        }
        
        await clickElement.click();
        
        // Wait after clicking
        if (clickDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, clickDelay));
        }
      }
      success('All clicks completed');
    }
    
    // Wait for specific element to appear if specified
    if (waitForSelector) {
      log(`Waiting for element to appear: ${waitForSelector}`, 'yellow');
      try {
        await page.waitForSelector(waitForSelector, {
          visible: true,
          timeout: waitTimeout
        });
        success('Element appeared');
      } catch (err) {
        error(`Element did not appear within ${waitTimeout}ms: ${waitForSelector}`);
        await browser.close();
        process.exit(1);
      }
    }
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `${outputName}.png`);
    
    log('Capturing screenshot...', 'yellow');
    
    if (selector) {
      // Capture specific element
      const element = await page.$(selector);
      if (!element) {
        error(`Element not found: ${selector}`);
        await browser.close();
        process.exit(1);
      }
      await element.screenshot({ path: outputPath });
    } else {
      // Capture page or viewport
      await page.screenshot({
        path: outputPath,
        fullPage: fullPage
      });
    }
    
    success('Screenshot captured');
    
    await browser.close();
    
    // Show file info
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    log('\n' + '='.repeat(60), 'blue');
    log('  Capture Complete!', 'green');
    log('='.repeat(60), 'blue');
    log('\nOutput file:', 'cyan');
    log(`  ${outputPath}`, 'cyan');
    log(`  Size: ${sizeMB} MB`);
    log('\n' + '='.repeat(60) + '\n', 'blue');
    
  } catch (err) {
    error(`Error during capture: ${err.message}`);
    await browser.close();
    throw err;
  }
}

// Parse command-line arguments
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log('Usage: node capture-webpage.js <url> <output-name> [options]', 'yellow');
    log('\nOptions:');
    log('  --width <pixels>        Viewport width (default: 1920)');
    log('  --height <pixels>       Viewport height (default: 1080)');
    log('  --scale <factor>        Device scale factor (default: 2)');
    log('  --selector <css>        Capture specific element only');
    log('  --wait <ms>             Wait time after page load (default: 500ms)');
    log('  --no-full-page          Capture viewport only (not full page)');
    log('  --click <selector>      Click element before capturing (repeatable)');
    log('  --click-delay <ms>      Delay after each click (default: 300ms)');
    log('  --wait-for <selector>   Wait for element to be visible');
    log('  --wait-timeout <ms>     Timeout for wait-for (default: 5000ms)');
    log('\nExamples:');
    log('  # Capture full page at default resolution');
    log('  node bin/capture-webpage.js http://localhost:8080 homepage');
    log('');
    log('  # Click button to reveal modal, then capture');
    log('  node bin/capture-webpage.js http://localhost:8080 modal --click "#open-modal-btn"');
    log('');
    log('  # Click multiple buttons in sequence');
    log('  node bin/capture-webpage.js http://localhost:8080 nested --click "#tab1" --click "#subtab2"');
    log('');
    log('  # Click and wait for element to appear');
    log('  node bin/capture-webpage.js http://localhost:8080 menu --click "#menu-btn" --wait-for ".menu-panel"');
    log('');
    log('  # Click, wait, then capture specific element');
    log('  node bin/capture-webpage.js http://localhost:8080 dropdown --click ".toggle" --selector ".dropdown-menu"');
    log('');
    log('  # Mobile viewport with click');
    log('  node bin/capture-webpage.js http://localhost:8080 mobile --width 375 --height 667 --click "#hamburger"');
    log('\nArguments:');
    log('  url          - URL of the page to capture');
    log('  output-name  - Name for output file (without .png extension)');
    process.exit(1);
  }
  
  const url = args[0];
  const outputName = args[1];
  
  // Parse options
  const options = {
    clickSelectors: [] // Array to store multiple click selectors
  };
  
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--width' && args[i + 1]) {
      options.width = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--height' && args[i + 1]) {
      options.height = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--scale' && args[i + 1]) {
      options.scale = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--selector' && args[i + 1]) {
      options.selector = args[i + 1];
      i++;
    } else if (args[i] === '--wait' && args[i + 1]) {
      options.wait = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--click' && args[i + 1]) {
      options.clickSelectors.push(args[i + 1]);
      i++;
    } else if (args[i] === '--click-delay' && args[i + 1]) {
      options.clickDelay = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--wait-for' && args[i + 1]) {
      options.waitForSelector = args[i + 1];
      i++;
    } else if (args[i] === '--wait-timeout' && args[i + 1]) {
      options.waitTimeout = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--no-full-page') {
      options.fullPage = false;
    }
  }
  
  checkDependencies();
  
  captureWebpage(url, outputName, options)
    .then(() => {
      success('All done! 📸');
      process.exit(0);
    })
    .catch(err => {
      error(`Fatal error: ${err.message}`);
      console.error(err);
      process.exit(1);
    });
}

main();
