import { test, expect } from '@playwright/test';

test.describe('Admin UI & Layout', () => {
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

    test('Sidebar navigation is present and links work', async ({ page }) => {
        // Check for Sidebar Title (Desktop)
        await expect(page.locator('text=UMEB Platform').first()).toBeVisible();

        // Check Sidebar Links exist
        const links = [
            { name: 'Dashboard', href: '/admin' },
            { name: 'Members', href: '/admin/members' },
            { name: 'Elections', href: '/admin/elections' },
            { name: 'Events', href: '/admin/events' },
            { name: 'Fees', href: '/admin/fees' },
        ];

        for (const link of links) {
            // Use strict locator to find link in sidebar
            const linkLocator = page.locator(`a[href="${link.href}"]`);
            await expect(linkLocator.first()).toBeVisible();
        }
    });

    test('Members page displays Data Table', async ({ page }) => {
        // Navigate to Members
        await page.goto('/admin/members');

        // Verify Page Title
        await expect(page.locator('h2:has-text("Members")')).toBeVisible();

        // Verify Search and Filter exist
        await expect(page.locator('input[placeholder="Search members..."]')).toBeVisible();
        await expect(page.locator('button:has-text("Filter Role")')).toBeVisible(); // Select trigger often behaves like button or is identifiable text

        // Verify Table exists
        await expect(page.locator('table')).toBeVisible();

        // Verify Table Headers
        const headers = ['Name / Email', 'Role', 'Tier', 'Status', 'Actions'];
        for (const header of headers) {
            await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
        }

        // Verify "Add Member" button
        await expect(page.locator('button:has-text("Add Member")')).toBeVisible();
    });
});
