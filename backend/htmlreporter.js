const HtmlReporter = require('jest-html-reporter');
const path = require('path');
const fs = require('fs');

class CustomHtmlReporter extends HtmlReporter {
    constructor(globalConfig, options) {
        const mergedOptions = options || {};
        
        // Set path to backend/tests/test-results
        const reportsDir = path.resolve(
            process.cwd(), 
            'tests/test-results'  // New path location
        );

        // Create directory structure if needed
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Get existing report count
        const files = fs.readdirSync(reportsDir);
        const reportCount = files.filter(file => 
            file.startsWith('test-report-') && file.endsWith('.html')
        ).length + 1;

        // Configure output path
        mergedOptions.outputPath = path.join(
            reportsDir,
            `test-report-${reportCount}.html`
        );

        mergedOptions.pageTitle = `HTBO Backend Test Report - Test ${reportCount}`;

        super(globalConfig, mergedOptions);
    }
}

module.exports = CustomHtmlReporter;