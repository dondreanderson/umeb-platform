import { test, expect } from '@playwright/test';

test.describe('Portfolio Management', () => {
    // Mock Data
    const mockEvents = [
        {
            id: 1,
            title: "NY Gala",
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: "PUBLISHED",
            event_type: "GALA",
            region: "North America",
            location: "NYC",
            capacity: 500,
            ticket_price: 200
        },
        {
            id: 2,
            title: "London Workshop",
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: "PUBLISHED",
            event_type: "WORKSHOP",
            region: "Europe",
            location: "London",
            capacity: 50,
            ticket_price: 500
        },
        {
            id: 3,
            title: "Remote Meetup",
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: "DRAFT",
            event_type: "MEETING",
            // No region (Unassigned)
            location: "Zoom",
            capacity: 100,
            ticket_price: 0
        }
    ];

    test.beforeEach(async ({ page }) => {
        // Log all requests
        page.on('request', request => console.log('REQ:', request.method(), request.url()));

        // Mock Login API
        await page.route(url => url.href.includes('/login/access-token'), async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ access_token: 'fake-token', token_type: 'bearer' })
            });
        });

        // Mock User Profile API
        await page.route(url => url.href.includes('/users/me'), async route => {
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

        // Mock Dashboard Stats (since dashboard loads first)
        await page.route(url => url.href.includes('/strategy/dashboard-stats'), async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    total_events: 3,
                    total_budget_planned: 1000,
                    total_budget_actual: 500,
                    total_carbon_footprint: 120
                })
            });
        });

        // Perform Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for navigation to admin
        await expect(page).toHaveURL(/\/admin/);
    });

    test('Navigate to Portfolio and verify breakdowns', async ({ page }) => {
        // Navigate to Dashboard
        await page.goto('/admin/events/dashboard');

        // Click "View Portfolio"
        await page.click('text=View Portfolio');
        await expect(page).toHaveURL(/\/admin\/events\/portfolio/);

        // Verify Header
        await expect(page.locator('h2:has-text("Portfolio Management")')).toBeVisible();

        // Verify Region Cards
        // "North America"
        await expect(page.locator('div').filter({ hasText: 'North America' }).first()).toBeVisible();

        // "Europe"
        await expect(page.locator('div').filter({ hasText: 'Europe' }).first()).toBeVisible();

        // "Unassigned"
        await expect(page.locator('div').filter({ hasText: 'Unassigned' }).first()).toBeVisible();

        // Verify Type Cards
        // "GALA"
        await expect(page.locator('div').filter({ hasText: 'GALA' }).first()).toBeVisible();

        // "WORKSHOP"
        await expect(page.locator('div').filter({ hasText: 'WORKSHOP' }).first()).toBeVisible();
    });
});
