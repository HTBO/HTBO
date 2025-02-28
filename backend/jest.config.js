module.exports = {
    testEnvironment: "node",
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.js"],
    coverageReporters: ["text", "html"],
    coverageDirectory: "coverage",
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