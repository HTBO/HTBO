const HtmlReporter = require('jest-html-reporter');
const path = require('path');
const fs = require('fs');

class CustomHtmlReporter extends HtmlReporter {
    constructor(globalConfig, options) {
        options = options || {};
        
        const reportsDir = path.dirname(options.outputPath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        options.outputPath = path.join(
            reportsDir,
            `test-report-${Date.now()}.html`  // Use timestamp instead of count
        );

        const files = fs.readdirSync(reportsDir);
        const reportCount = files.filter(file => file.startsWith('test-report-')).length + 1;

        options.outputPath = path.join(
            reportsDir,
            `test-report-${reportCount}.html`
        );
        options.pageTitle = `HTBO Backend Test Report - Test ${reportCount}`;
        super(globalConfig, options);
    }
}

module.exports = CustomHtmlReporter;
