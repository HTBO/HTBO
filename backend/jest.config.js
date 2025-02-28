module.exports = {
    testEnvironment: "node",
    collectCoverage: false, // Disable coverage by default
    collectCoverageFrom: ["src/**/*.js"],
    coverageReporters: ["text", "html"],
    coverageDirectory: "tests/coverage",
    testMatch: ["**/*.test.js"],
    reporters: [
        "default",
        [
            "./custom-html-reporter.js",
            {
                pageTitle: "HTBO Backend Test Report",
                outputPath: "tests/test-reports/test-report.html",
            }
        ]
    ]
};
