const HtmlReporter = require('jest-html-reporter');
const path = require('path');
const fs = require('fs');

class CustomHtmlReporter extends HtmlReporter {
    constructor(globalConfig, options) {
        options = options || {};
        options.outputPath = options.outputPath || 'tests/test-reports/test-report.html';

        const reportsDir = path.dirname(options.outputPath);
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

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
