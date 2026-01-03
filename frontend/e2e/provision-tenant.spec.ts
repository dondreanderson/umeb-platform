import { test, expect } from '@playwright/test';

test.describe('System Admin - Tenant Provisioning', () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', adminPassword);
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/\/admin/);
    });

    test('Provisioning a new organization works correctly', async ({ page }) => {
        // Navigate to System Admin Page
        await page.goto('/system-admin');

        // Verify Page Title
        await expect(page.locator('h1:has-text("Platform Overview")')).toBeVisible();

        // Open Provision Modal
        await page.click('button:has-text("Provision New Tenant")');
        await expect(page.locator('h2:has-text("Add New Organization")')).toBeVisible();

        // Generate unique tenant details
        const timestamp = Date.now();
        const tenantName = `Test Org ${timestamp}`;
        const tenantSlug = `test-org-${timestamp}`;

        // Fill Form
        await page.fill('input[placeholder="e.g. Hope Foundation"]', tenantName);

        // Slug auto-fills usually, but we can type to be sure or verify it
        // based on the component logic: onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
        // Let's manually fill the slug input to be robust
        await page.fill('input[placeholder="hope-foundation"]', tenantSlug);

        // Submit
        await page.click('button:has-text("Initiate Provisioning")');

        // Verify Toast Success
        await expect(page.locator('text="Tenant created successfully."')).toBeVisible();

        // Verify Tenant appears in table
        // We might need to wait for reload/refresh
        await expect(page.locator(`td:has-text("${tenantName}")`)).toBeVisible();
        await expect(page.locator(`td:has-text("${tenantSlug}")`)).toBeVisible();
    });
});
