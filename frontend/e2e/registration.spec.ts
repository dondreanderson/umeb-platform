import { test, expect } from '@playwright/test';

test.describe('Event Registration Flow', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/portal/);
    });

    test('should allow user to view event, select ticket, and register', async ({ page }) => {
        // 2. Navigate to Events List
        await page.goto('/events');
        await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();

        // 3. Find and Click the "Annual Tech Gala 2025" event
        // Using text locator to find the card or link
        const eventCard = page.locator('text=Annual Tech Gala 2025').first();
        await eventCard.click();

        // 4. Verify Event Details Page
        await expect(page.getByRole('heading', { name: 'Get Tickets' })).toBeVisible();

        // 5. Select "General Admission" Ticket
        // Find the card containing "General Admission" and click its button
        const ticketCard = page.locator('.border', { hasText: 'General Admission' });
        await expect(ticketCard).toBeVisible();
        const selectButton = ticketCard.getByRole('button', { name: 'Select Ticket' });
        await selectButton.click();

        // 6. Verify Modal Opens
        const modal = page.locator('div[role="dialog"]');
        await expect(modal).toBeVisible();
        await expect(modal).toContainText('Confirm Registration');
        await expect(modal).toContainText('General Admission');

        // 7. Confirm Registration
        const confirmButton = modal.getByRole('button', { name: 'Pay & Register' });
        await confirmButton.click();

        // 8. Verify Success State
        await expect(modal).toContainText('Registration Confirmed!');
        await modal.getByRole('button', { name: 'Close' }).click();
        await expect(modal).not.toBeVisible();

        // 9. Verify "My Tickets"
        await page.goto('/portal/my-tickets');
        await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

        // Check if the event card is present in My Tickets
        await expect(page.locator('text=Annual Tech Gala 2025')).toBeVisible();
        await expect(page.locator('text=General Admission')).toBeVisible();

        // Check for QR Code
        const qrCode = page.locator('svg.lucide-qr-code'); // Or however the icon renders, usually checks class
        // Or check the text inside the QR container if we render data
        // The previous code rendered: <p className="...">...data...</p> inside
    });

});
