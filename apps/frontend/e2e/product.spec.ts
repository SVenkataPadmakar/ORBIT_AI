import { expect, test, type Page } from "@playwright/test";

function collectFailures(page: Page) {
    const failures: string[] = [];
    page.on("console", (message) => {
        const text = message.text();
        const expectedStatus = /status of (401|404)/.test(text);
        if (message.type() === "error" && !expectedStatus) failures.push(`console: ${text}`);
    });
    page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
    page.on("requestfailed", (request) => {
        const abortedRscNavigation = request.url().includes("_rsc=") && request.failure()?.errorText === "net::ERR_ABORTED";
        if (!abortedRscNavigation) failures.push(`network: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    });
    return failures;
}

async function assertNoPageOverflow(page: Page) {
    const metrics = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
    }));
    expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
}

test("login reports invalid credentials and remains usable", async ({ page }, testInfo) => {
    const failures = collectFailures(page);
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Enter your startup workspace" })).toBeVisible();
    await page.getByLabel("Email address").fill("missing-founder@example.com");
    await page.locator("#password").fill("invalid-password");
    await page.getByRole("button", { name: "Enter workspace" }).click();
    await expect(page.locator("#auth-error")).toContainText("email and password combination is not valid");
    await expect(page.getByRole("button", { name: "Enter workspace" })).toBeEnabled();
    await assertNoPageOverflow(page);
    await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });
    expect(failures).toEqual([]);
});

test("founder can register, create a startup, and operate the workspace", async ({ page }, testInfo) => {
    const failures = collectFailures(page);
    const email = `founder-${testInfo.project.name}-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Product Verification Founder");
    await page.getByLabel("Email address").fill(email);
    await page.locator("#password").fill("verified-password-2026");
    await page.getByRole("button", { name: "Create workspace" }).click();
    await expect(page).toHaveURL(/\/projects\/new$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /What should exist/i })).toBeVisible();

    await page.getByLabel("Working name").fill(`Signal Foundry ${testInfo.project.name}`);
    await page.getByLabel("Problem and proposed change").fill("Independent product teams lose launch evidence across disconnected planning tools. Build one workflow that turns assumptions into verified missions and decisions.");
    await page.getByLabel("Who experiences this most?").fill("Early-stage B2B founders preparing their first customer-backed launch.");
    await page.getByLabel("Market or domain").fill("Founder operations");
    await page.getByRole("button", { name: "Create first mission" }).click();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Mission Control" })).toBeVisible();
    await expect(page.getByText("Highest-value next action")).toBeVisible();
    await expect(page.getByText("Demo analysis · not live research")).toBeVisible();

    if (testInfo.project.name === "desktop") {
        await page.getByRole("link", { name: "Evidence Lab" }).click();
        await expect(page.getByRole("heading", { name: "Evidence Lab" })).toBeVisible();
        await expect(page.getByText("No live market connector is configured")).toBeVisible();
        await page.getByRole("link", { name: "Agent Council" }).click();
        await expect(page.getByRole("heading", { name: "Agent Council" })).toBeVisible();
        await expect(page.getByText(/does not invent debate events/i)).toBeVisible();
        await page.getByRole("button", { name: "Open Gemini co-founder" }).click();
        await expect(page.getByRole("heading", { name: "Gemini Co-Founder" })).toBeVisible();
        await page.reload();
        await expect(page.getByRole("heading", { name: "Agent Council" })).toBeVisible();
    } else {
        await page.getByRole("button", { name: "Open navigation" }).click();
        await expect(page.getByRole("navigation", { name: "Startup workspace" })).toBeVisible();
    }

    await assertNoPageOverflow(page);
    await page.screenshot({ path: testInfo.outputPath("workspace.png"), fullPage: true });
    expect(failures).toEqual([]);
});
