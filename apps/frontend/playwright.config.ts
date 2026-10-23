import { defineConfig, devices } from "@playwright/test";

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export default defineConfig({
    testDir: "./e2e",
    outputDir: "./test-results/playwright",
    fullyParallel: false,
    workers: 1,
    timeout: 90_000,
    retries: 0,
    reporter: [["list"]],
    use: {
        baseURL: "http://127.0.0.1:3000",
        browserName: "chromium",
        launchOptions: { executablePath: chrome },
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
        { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } } },
    ],
});
