import { test, expect } from '@playwright/test';

test.describe('Event Calendar', () => {
    // Mock Data
    const mockEvents = [
        {
            id: 1,
            title: "Strategy Workshop",
            start_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
            end_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
            status: "PUBLISHED",
            event_type: "WORKSHOP",
            location: "Room A",
        },
        {
            id: 2,
            title: "Annual Gala",
            start_time: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // In 5 days
            end_time: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            status: "DRAFT",
            event_type: "GALA",
            location: "Grand Hall",
        }
    ];

    test.beforeEach(async ({ page }) => {
        // Log all requests
        page.on('request', request => console.log('REQ:', request.method(), request.url()));

        // Mock Login API
        await page.route(url => url.href.includes('/login/access-token'), async route => {
            console.log("Mock hit (Login): " + route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'fake-token', token_type: 'bearer' })
            });
        });

        // Mock User Profile API
        await page.route(url => url.href.includes('/users/me'), async route => {
            console.log("Mock hit (Me): " + route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    email: 'admin@example.com',
                    full_name: 'Admin User',
                    role: 'admin',
                    is_superuser: true
                })
            });
        });

        // Mock Events API
        await page.route(url => url.href.includes('/api/v1/events'), async route => {
            console.log("Mock hit (Events): " + route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockEvents)
            });
        });

        // Debug console
        page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

        // Perform Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for navigation to admin (should happen upon successful login mock)
        await expect(page).toHaveURL(/\/admin/);
    });

    test('Can toggle between List and Calendar views', async ({ page }) => {
        // Navigate to Events
        await page.goto('/admin/events');

        // Verify "List" and "Calendar" buttons exist
        const listBtn = page.locator('button:has-text("List")');
        const calendarBtn = page.locator('button:has-text("Calendar")');

        await expect(listBtn).toBeVisible();
        await expect(calendarBtn).toBeVisible();

        // Default: List view should be visible (check for card title from mock)
        await expect(page.locator('text=Strategy Workshop')).toBeVisible();

        // Calendar container should NOT be visible yet
        await expect(page.locator('.rbc-calendar')).not.toBeVisible();

        // Switch to Calendar
        await calendarBtn.click();

        // Check for React Big Calendar container
        await expect(page.locator('.rbc-calendar')).toBeVisible();

        // Check for Month view controls
        await expect(page.locator('.rbc-toolbar')).toBeVisible();

        // Verify events are in the DOM (RBC renders them as div with class rbc-event)
        // Note: RBC might truncate text, but "Strategy Workshop" title should appear in the event content
        await expect(page.locator('.rbc-event', { hasText: 'Strategy Workshop' })).toBeVisible();

        // Switch back to List
        await listBtn.click();
        await expect(page.locator('.rbc-calendar')).not.toBeVisible();
        await expect(page.locator('text=Strategy Workshop')).toBeVisible();
    });
});
