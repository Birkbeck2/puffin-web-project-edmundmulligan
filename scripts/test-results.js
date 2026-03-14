/*
**********************************************************************
 * File       : test-results.js
 * Author     : Edmund Mulligan <edmund@edmundmulligan.name>
 * Copyright  : (c) 2026 The Embodied Mind
 * License    : MIT License (see ../license-and-credits.html page)
 * Description:
 *    JavaScript for Test Results Dashboard - loads and displays
 *    automated test results with modal details view
**********************************************************************
*/

// Store full test data for modal display
let testData = {};

async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return null;
    }
}

function createTestCard(title, icon, status, metrics, testType, hasDetails) {
    const statusClass = status.toLowerCase();
    const statusBadge = `<span class="status-badge ${statusClass}">${status}</span>`;
    // Make card clickable if there are details to show, regardless of pass/fail status
    const clickableClass = hasDetails ? 'clickable' : '';
    const onClickAttr = clickableClass ? `onclick="showTestDetails('${testType}')"` : '';
    
    let metricsHTML = '';
    metrics.forEach(metric => {
        metricsHTML += `
            <div class="test-metric">
                <span class="metric-label">${metric.label}:</span>
                <span class="metric-value">${metric.value}</span>
            </div>
        `;
    });

    const clickHint = clickableClass ? '<div class="clickable-hint"><i class="fas fa-hand-pointer"></i> Click to view details</div>' : '';

    return `
        <div class="test-card ${clickableClass}" ${onClickAttr}>
            <div class="test-card-header">
                <div class="test-card-title">
                    <i class="${icon}"></i> ${title}
                </div>
                ${statusBadge}
            </div>
            <div class="test-card-body">
                ${metricsHTML}
                ${clickHint}
            </div>
        </div>
    `;
}

function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// showTestDetails is called from dynamically generated onclick handlers
/* exported showTestDetails */
function showTestDetails(testType) {
    const modal = document.getElementById('detailsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const data = testData[testType];
    if (!data) return;
    
    modalTitle.textContent = `${testType} - Details`;
    modalBody.innerHTML = formatTestDetails(testType, data);
    modal.style.display = 'block';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeModal();
    }
};

function formatTestDetails(testType, data) {
    switch(testType) {
    case 'Code Validation':
        return formatValidationDetails(data);
    case 'Broken Links':
        return formatBrokenLinksDetails(data);
    case 'Axe Accessibility':
        return formatAxeDetails(data);
    case 'Pa11y Accessibility':
        return formatPa11yDetails(data);
    case 'WAVE Accessibility':
        return formatWaveDetails(data);
    case 'Lighthouse':
        return formatLighthouseDetails(data);
    case 'Browser Compatibility':
        return formatBrowserDetails(data);
    case 'Reading Age':
        return formatReadabilityDetails(data);
    case 'Colour Audit':
        return formatColourAuditDetails(data);
    default:
        return '<p>No details available</p>';
    }
}

function formatValidationDetails(data) {
    let html = '';
    
    if (data.summary.htmlErrors > 0 || data.summary.htmlWarnings > 0) {
        html += '<h3>HTML Validation Issues</h3>';
        data.htmlFiles.forEach(file => {
            if (file.errors.length > 0 || file.warnings.length > 0) {
                html += `<div class="error-item"><h4>${file.file}</h4>`;
                file.errors.forEach(err => {
                    html += `<div class="error-detail">❌ Line ${err.line}: ${err.message}</div>`;
                });
                file.warnings.forEach(warn => {
                    html += `<div class="error-detail">⚠️ Line ${warn.line}: ${warn.message}</div>`;
                });
                html += '</div>';
            }
        });
    }
    
    if (data.summary.cssErrors > 0 || data.summary.cssWarnings > 0) {
        html += '<h3>CSS Validation Issues</h3>';
        data.cssFiles.forEach(file => {
            if (file.errors.length > 0 || file.warnings.length > 0) {
                html += `<div class="error-item"><h4>${file.file}</h4>`;
                file.errors.forEach(err => {
                    html += `<div class="error-detail">❌ Line ${err.line}: ${err.message}</div>`;
                });
                file.warnings.forEach(warn => {
                    html += `<div class="error-detail">⚠️ ${warn}</div>`;
                });
                html += '</div>';
            }
        });
    }
    
    return html || '<p>No validation errors found.</p>';
}

function formatBrokenLinksDetails(data) {
    let brokenLinks = [];
    
    // Extract broken links from pages array
    if (data.pages && Array.isArray(data.pages)) {
        data.pages.forEach(page => {
            if (page.links && Array.isArray(page.links) && page.links.length > 0) {
                page.links.forEach(link => {
                    brokenLinks.push({
                        link: link.url || link.href || link.link || link,
                        status: link.status || link.statusCode || 'broken',
                        message: link.message || link.error || '',
                        page: page.url || page.page || page.file
                    });
                });
            }
        });
    }
    
    if (brokenLinks.length === 0) {
        return '<p>No broken links found. All links are working correctly!</p>';
    }
    
    let html = '<h3>Broken Links</h3>';
    brokenLinks.forEach(link => {
        html += `<div class="error-item">
            <h4>${link.link}</h4>
            <div class="error-detail">Status: ${link.status}</div>
            ${link.message ? `<div class="error-detail">${link.message}</div>` : ''}
            <div class="error-location">Found in: ${link.page}</div>
        </div>`;
    });
    return html;
}

function formatAxeDetails(data) {
    if (!data.violations || data.violations.length === 0) {
        return '<p>No accessibility violations found.</p>';
    }
    
    let html = '<h3>Accessibility Violations</h3>';
    const grouped = {};
    
    data.violations.forEach(v => {
        if (!grouped[v.id]) {
            grouped[v.id] = {
                impact: v.impact,
                description: v.description,
                help: v.help,
                pages: []
            };
        }
        grouped[v.id].pages.push(`${v.pageUrl} (${v.theme}-${v.style}, ${v.viewport}px)`);
    });
    
    Object.entries(grouped).forEach(([id, info]) => {
        const impactIcon = info.impact === 'critical' ? '🔴' :
            info.impact === 'serious' ? '🟠' :
                info.impact === 'moderate' ? '🟡' : '⚪';
        html += `<div class="error-item">
            <h4>${impactIcon} ${id} (${info.impact})</h4>
            <div class="error-detail">${info.help}</div>
            <div class="error-location">Affected pages: ${info.pages.join(', ')}</div>
        </div>`;
    });
    
    return html;
}

function formatPa11yDetails(data) {
    const errors = [];
    const warnings = [];
    
    data.pages.forEach(page => {
        page.issues.forEach(issue => {
            const item = {
                page: page.page,
                code: issue.code,
                message: issue.message,
                context: issue.context,
                selector: issue.selector
            };
            if (issue.type === 'error') errors.push(item);
            else if (issue.type === 'warning') warnings.push(item);
        });
    });
    
    let html = '';
    if (errors.length > 0) {
        html += '<h3>Errors</h3>';
        errors.forEach(err => {
            html += `<div class="error-item">
                <h4>${err.code}</h4>
                <div class="error-detail">${err.message}</div>
                <div class="error-location">Page: ${err.page}<br>Selector: ${err.selector}</div>
            </div>`;
        });
    }
    
    if (warnings.length > 0) {
        html += '<h3>Warnings</h3>';
        warnings.forEach(warn => {
            html += `<div class="warning-item">
                <h4>${warn.code}</h4>
                <div class="error-detail">${warn.message}</div>
                <div class="error-location">Page: ${warn.page}<br>Selector: ${warn.selector}</div>
            </div>`;
        });
    }
    
    return html || '<p>No issues found.</p>';
}

function formatWaveDetails(data) {
    const pagesWithIssues = data.pages.filter(p => p.errors > 0 || p.alerts > 0 || p.contrast > 0);
    
    if (pagesWithIssues.length === 0) {
        return '<p>No WAVE accessibility issues found.</p>';
    }
    
    let html = '';
    pagesWithIssues.forEach(page => {
        // Use error-item for pages with errors, warning-item for pages with only alerts/contrast
        const itemClass = page.errors > 0 ? 'error-item' : 'warning-item';
        
        html += `<div class="${itemClass}">
            <h4>${page.url}</h4>
            <div class="error-detail">
                ${page.errors > 0 ? `❌ Errors: ${page.errors}` : ''}
                ${page.errors > 0 && (page.alerts > 0 || page.contrast > 0) ? ' | ' : ''}
                ${page.alerts > 0 ? `⚠️ Alerts: ${page.alerts}` : ''}
                ${page.alerts > 0 && page.contrast > 0 ? ' | ' : ''}
                ${page.contrast > 0 ? `🎨 Contrast: ${page.contrast}` : ''}
            </div>`;
        
        if (page.errorItems && page.errorItems.length > 0) {
            html += '<div style="margin-top: 0.5rem;"><strong>Errors:</strong>';
            page.errorItems.forEach(item => {
                html += `<div style="margin-left: 1rem;">❌ ${item.description} (${item.count})</div>`;
            });
            html += '</div>';
        }
        
        if (page.alertItems && page.alertItems.length > 0) {
            html += '<div style="margin-top: 0.5rem;"><strong>Alerts:</strong>';
            page.alertItems.forEach(item => {
                html += `<div style="margin-left: 1rem;">⚠️ ${item.description} (${item.count})</div>`;
            });
            html += '</div>';
        }
        
        if (page.contrastItems && page.contrastItems.length > 0) {
            html += '<div style="margin-top: 0.5rem;"><strong>Contrast Issues:</strong>';
            page.contrastItems.forEach(item => {
                html += `<div style="margin-left: 1rem;">🎨 ${item.description} (${item.count})</div>`;
            });
            html += '</div>';
        }
        
        html += `<div class="error-location">Theme: ${page.theme}, Style: ${page.style}, Viewport: ${page.viewport}px</div>`;
        html += '</div>';
    });
    
    return html;
}

function formatLighthouseDetails(data) {
    const pagesWithIssues = data.pages.filter(p => p.failedAudits && p.failedAudits.length > 0);
    
    if (pagesWithIssues.length === 0) {
        return '<p>All pages passed Lighthouse audits.</p>';
    }
    
    let html = '<h3>Pages with Issues</h3>';
    pagesWithIssues.forEach(page => {
        html += `<div class="error-item">
            <h4>${page.url} [${page.viewport}px, ${page.style}-${page.theme}]</h4>
            <div class="error-detail">Score: ${Math.round(page.score * 100)}%</div>`;
        
        if (page.failedAudits) {
            html += '<div style="margin-top: 0.5rem;">';
            page.failedAudits.forEach(audit => {
                html += `<div>• ${audit.title || audit}</div>`;
            });
            html += '</div>';
        }
        html += '</div>';
    });
    
    return html;
}

function formatBrowserDetails(data) {
    const browserList = data.browsers || data.results || [];
    const failed = browserList.filter(b => b.status === 'failed' || b.passed === false);
    
    if (failed.length === 0) {
        return '<p>All browser tests passed.</p>';
    }
    
    let html = '<h3>Failed Browsers</h3>';
    failed.forEach(browser => {
        html += `<div class="error-item">
            <h4>${browser.browser}</h4>
            <div class="error-detail">${browser.error || browser.message || 'Test failed'}</div>
        </div>`;
    });
    
    return html;
}

function formatReadabilityDetails(data) {
    if (!data.pages || data.pages.length === 0) {
        return '<p>No readability data available.</p>';
    }
    
    const highGradePages = data.pages.filter(p => p.averageGradeLevel > 12);
    
    if (highGradePages.length === 0) {
        return '<p>All pages have appropriate reading levels.</p>';
    }
    
    let html = '<h3>Pages Above Grade 12 Reading Level</h3>';
    highGradePages.forEach(page => {
        html += `<div class="warning-item">
            <h4>${page.page}</h4>
            <div class="error-detail">
                Grade Level: ${page.averageGradeLevel.toFixed(1)} | 
                Words: ${page.wordCount} | 
                Sentences: ${page.sentenceCount}
            </div>
        </div>`;
    });
    
    return html;
}

function formatColourAuditDetails(data) {
    let html = '';
    
    if (data.hardcodedColors && data.hardcodedColors.length > 0) {
        html += '<h3>Hardcoded Colors</h3>';
        data.hardcodedColors.forEach(item => {
            html += `<div class="error-item">
                <h4>${item.file}</h4>
                <div class="error-detail">Line ${item.line}: ${item.value}</div>
                ${item.context ? `<div class="error-location">${item.context}</div>` : ''}
            </div>`;
        });
    }
    
    if (data.themeSpecificVars && data.themeSpecificVars.length > 0) {
        html += '<h3>Theme-Specific Variables</h3>';
        data.themeSpecificVars.forEach(item => {
            html += `<div class="warning-item">
                <h4>${item.file}</h4>
                <div class="error-detail">Line ${item.line}: ${item.variable}</div>
                <div class="error-location">Should use generic variables like --colour-page-background instead</div>
            </div>`;
        });
    }
    
    if (data.missingThemeSystem && data.missingThemeSystem.length > 0) {
        html += '<h3>Missing Theme System</h3>';
        data.missingThemeSystem.forEach(item => {
            html += `<div class="warning-item">
                <h4>${item.file}</h4>
                <div class="error-detail">${item.message || 'Not using theme variable system'}</div>
            </div>`;
        });
    }
    
    return html || '<p>No colour issues found. All colours use the theme system correctly.</p>';
}

async function loadAllResults() {
    const resultsContainer = document.getElementById('test-results');
    resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading test results...</div>';

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalWarnings = 0;

    const cards = [];

    // Load Validation Results
    const validation = await loadJSON('../test-results/validation-results.json');
    if (validation) {
        const hasErrors = validation.summary.htmlErrors > 0 || 
                        validation.summary.cssErrors > 0 || 
                        validation.summary.jsErrors > 0;
        const status = hasErrors ? 'fail' : 'pass';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;
        totalWarnings += validation.summary.htmlWarnings + 
                       validation.summary.cssWarnings + 
                       validation.summary.jsWarnings;

        testData['Code Validation'] = validation;
        cards.push(createTestCard(
            'Code Validation',
            'fas fa-check-circle',
            status,
            [
                { label: 'HTML Errors', value: validation.summary.htmlErrors },
                { label: 'CSS Errors', value: validation.summary.cssErrors },
                { label: 'JS Errors', value: validation.summary.jsErrors },
                { label: 'Total Warnings', value: totalWarnings }
            ],
            'Code Validation',
            hasErrors || totalWarnings > 0
        ));
    }

    // Load Broken Links Results
    const links = await loadJSON('../test-results/broken-links-results.json');
    if (links) {
        const totalBroken = links.pages.reduce((sum, page) => sum + page.brokenCount, 0);
        const totalLinks = links.pages.reduce((sum, page) => sum + page.totalCount, 0);
        const status = totalBroken === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;

        testData['Broken Links'] = links;
        cards.push(createTestCard(
            'Broken Links Check',
            'fas fa-link',
            status,
            [
                { label: 'Pages Checked', value: links.pages.length },
                { label: 'Total Links', value: totalLinks },
                { label: 'Broken Links', value: totalBroken }
            ],
            'Broken Links',
            totalBroken > 0
        ));
    }

    // Load Axe Results
    const axe = await loadJSON('../test-results/axe-results.json');
    if (axe) {
        // Count violations across all pages if structure has pages array
        let totalViolations = 0;
        let totalPasses = 0;
        let totalIncomplete = 0;
        let pagesTestedCount = 0;
        
        if (Array.isArray(axe.violations)) {
            // Direct violations array
            totalViolations = axe.violations.length;
            
            // Calculate passes - could be array of objects with counts or simple array
            if (Array.isArray(axe.passes)) {
                totalPasses = axe.passes.reduce((sum, p) => {
                    // If passes are stored as {pageUrl, count}, sum the counts
                    // Otherwise just count the array length
                    return sum + (p.count || 1);
                }, 0);
            }
            
            totalIncomplete = axe.incomplete ? axe.incomplete.length : 0;
            
            // Get metadata if available
            if (axe.metadata && axe.metadata.pagesTestedCount) {
                pagesTestedCount = axe.metadata.pagesTestedCount;
            }
        } else if (axe.pages && Array.isArray(axe.pages)) {
            // Pages array structure
            axe.pages.forEach(page => {
                totalViolations += page.violations ? page.violations.length : 0;
                totalPasses += page.passes ? page.passes.length : 0;
                totalIncomplete += page.incomplete ? page.incomplete.length : 0;
            });
            pagesTestedCount = axe.pages.length;
        }
        
        const status = totalViolations === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;

        const metrics = [
            { label: 'Total Violations', value: totalViolations },
            { label: 'Total Passes', value: totalPasses },
            { label: 'Incomplete', value: totalIncomplete }
        ];
        
        // Add pages tested count if available
        if (pagesTestedCount > 0) {
            metrics.unshift({ label: 'Pages Tested', value: pagesTestedCount });
        }

        testData['Axe Accessibility'] = axe;
        cards.push(createTestCard(
            'Axe Accessibility',
            'fas fa-universal-access',
            status,
            metrics,
            'Axe Accessibility',
            totalViolations > 0
        ));
    }

    // Load Pa11y Results
    const pa11y = await loadJSON('../test-results/pa11y-results.json');
    if (pa11y) {
        const totalErrors = pa11y.pages.reduce((sum, page) => 
            sum + page.issues.filter(i => i.type === 'error').length, 0);
        const totalWarningsP = pa11y.pages.reduce((sum, page) => 
            sum + page.issues.filter(i => i.type === 'warning').length, 0);
        const status = totalErrors === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;
        totalWarnings += totalWarningsP;

        testData['Pa11y Accessibility'] = pa11y;
        cards.push(createTestCard(
            'Pa11y Accessibility',
            'fas fa-wheelchair',
            status,
            [
                { label: 'Pages Tested', value: pa11y.pages.length },
                { label: 'Errors', value: totalErrors },
                { label: 'Warnings', value: totalWarningsP }
            ],
            'Pa11y Accessibility',
            totalErrors > 0 || totalWarningsP > 0
        ));
    }

    // Load WAVE Results
    const wave = await loadJSON('../test-results/wave-results.json');
    if (wave) {
        const totalErrorsW = wave.pages.reduce((sum, page) => sum + (page.errors || 0), 0);
        const totalAlertsW = wave.pages.reduce((sum, page) => sum + (page.alerts || 0), 0);
        const totalContrastW = wave.pages.reduce((sum, page) => sum + (page.contrast || 0), 0);
        
        // Determine status: fail if errors, warning if alerts/contrast, pass otherwise
        let status = 'pass';
        if (totalErrorsW > 0) {
            status = 'fail';
        } else if (totalAlertsW > 0 || totalContrastW > 0) {
            status = 'warning';
        }
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else if (status === 'fail') failedTests++;
        else if (status === 'warning') totalWarnings++;
        totalWarnings += totalAlertsW;

        testData['WAVE Accessibility'] = wave;
        cards.push(createTestCard(
            'WAVE Accessibility',
            'fas fa-water',
            status,
            [
                { label: 'Pages Tested', value: wave.pages.length },
                { label: 'Errors', value: totalErrorsW },
                { label: 'Alerts', value: totalAlertsW },
                { label: 'Contrast Issues', value: totalContrastW }
            ],
            'WAVE Accessibility',
            totalErrorsW > 0 || totalAlertsW > 0 || totalContrastW > 0
        ));
    }

    // Load Lighthouse Results
    const lighthouse = await loadJSON('../test-results/lighthouse-results.json');
    if (lighthouse) {
        const avgScore = lighthouse.pages.length > 0 ?
            Math.round((lighthouse.pages.reduce((sum, page) => sum + page.score, 0) / lighthouse.pages.length) * 100) :
            0;
        const pagesWithIssues = lighthouse.pages.filter(p => p.failedAudits && p.failedAudits.length > 0).length;
        const status = pagesWithIssues === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;

        testData.Lighthouse = lighthouse;
        cards.push(createTestCard(
            'Lighthouse',
            'fas fa-lightbulb',
            status,
            [
                { label: 'Pages Tested', value: lighthouse.pages.length },
                { label: 'Average Score', value: `${avgScore}%` },
                { label: 'Pages with Issues', value: pagesWithIssues }
            ],
            'Lighthouse',
            pagesWithIssues > 0
        ));
    }

    // Load Browser Results
    const browser = await loadJSON('../test-results/browser-results.json');
    if (browser) {
        // Handle both 'browsers' and 'results' array structures
        const browserList = browser.browsers || browser.results || [];
        const passed = browserList.filter(b => b.status === 'passed' || b.passed === true).length;
        const failed = browserList.filter(b => b.status === 'failed' || b.passed === false).length;
        const status = failed === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;

        testData['Browser Compatibility'] = browser;
        cards.push(createTestCard(
            'Browser Compatibility',
            'fas fa-browser',
            status,
            [
                { label: 'Browsers Tested', value: browserList.length },
                { label: 'Passed', value: passed },
                { label: 'Failed', value: failed }
            ],
            'Browser Compatibility',
            failed > 0
        ));
    }

    // Load Readability Results
    const readability = await loadJSON('../test-results/readability-results.json');
    if (readability) {
        let avgGrade = 0;
        let totalWords = 0;
        
        if (readability.pages && Array.isArray(readability.pages) && readability.pages.length > 0) {
            // Calculate from pages array
            totalWords = readability.pages.reduce((sum, page) => sum + (page.wordCount || 0), 0);
            const totalGrade = readability.pages.reduce((sum, page) => sum + (page.averageGradeLevel || 0), 0);
            avgGrade = (totalGrade / readability.pages.length).toFixed(1);
        } else {
            // Fallback to root level properties if they exist
            avgGrade = readability.averageGradeLevel || 0;
            totalWords = readability.totalWords || 0;
        }
        
        const status = avgGrade <= 12 ? 'pass' : 'warning';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else if (status === 'warning') totalWarnings++;

        testData['Reading Age'] = readability;
        cards.push(createTestCard(
            'Reading Age',
            'fas fa-book-reader',
            status,
            [
                { label: 'Pages Analyzed', value: readability.pages ? readability.pages.length : 0 },
                { label: 'Average Grade Level', value: avgGrade },
                { label: 'Total Words', value: totalWords }
            ],
            'Reading Age',
            avgGrade > 12
        ));
    }

    // Load Colour Audit Results
    const colourAudit = await loadJSON('../test-results/colour-audit-report.json');
    if (colourAudit) {
        const totalIssues = (colourAudit.hardcodedColors ? colourAudit.hardcodedColors.length : 0) +
                          (colourAudit.themeSpecificVars ? colourAudit.themeSpecificVars.length : 0) +
                          (colourAudit.missingThemeSystem ? colourAudit.missingThemeSystem.length : 0);
        const status = totalIssues === 0 ? 'pass' : 'fail';
        
        totalTests++;
        if (status === 'pass') passedTests++;
        else failedTests++;

        testData['Colour Audit'] = colourAudit;
        cards.push(createTestCard(
            'Colour Audit',
            'fas fa-palette',
            status,
            [
                { label: 'Hardcoded Colors', value: colourAudit.hardcodedColors ? colourAudit.hardcodedColors.length : 0 },
                { label: 'Theme-Specific Vars', value: colourAudit.themeSpecificVars ? colourAudit.themeSpecificVars.length : 0 },
                { label: 'Missing Theme System', value: colourAudit.missingThemeSystem ? colourAudit.missingThemeSystem.length : 0 },
                { label: 'Total Issues', value: totalIssues }
            ],
            'Colour Audit',
            totalIssues > 0
        ));
    }

    // Update summary
    document.getElementById('total-tests').textContent = totalTests;
    document.getElementById('passed-tests').textContent = passedTests;
    document.getElementById('failed-tests').textContent = failedTests;
    document.getElementById('warnings').textContent = totalWarnings;

    // Display cards
    if (cards.length > 0) {
        resultsContainer.innerHTML = cards.join('');
    } else {
        resultsContainer.innerHTML = '<div class="error-message">No test results found. Please run tests first.</div>';
    }

    // Update timestamp
    const now = new Date();
    document.getElementById('timestamp').textContent = `Last updated: ${now.toLocaleString()}`;
}

// Load results on page load
window.addEventListener('DOMContentLoaded', loadAllResults);
