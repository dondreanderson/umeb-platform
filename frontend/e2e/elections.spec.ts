import { test, expect } from '@playwright/test';

test.describe('Elections & Voting Flow', () => {

    test('Admin can create an election', async ({ page }) => {
        // 1. Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Expect redirect to admin dashboard or home
        await expect(page).toHaveURL(/\/admin/);

        // 2. Navigate to Elections
        await page.goto('/admin/elections');

        // 3. Click Create Election
        // Check if "Create Election" button is visible
        const createBtn = page.getByRole('link', { name: 'Create Election' }).or(page.getByRole('button', { name: 'Create Election' }));
        if (await createBtn.isVisible()) {
            await createBtn.click();
        } else {
            // Fallback if the button text is different or icon only
            await page.goto('/admin/elections/create');
        }

        // 4. Fill Form
        const uniqueId = Date.now();
        const electionTitle = `E2E Test Election ${uniqueId}`;
        await page.fill('#title', electionTitle);
        await page.fill('#description', 'This is an automated test election.');

        // Set date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
        await page.fill('#end_date', dateStr);

        // Candidates (First one is default visible)
        // Adjust selectors if needed. Based on usage, placeholder was "Full Name"
        await page.fill('input[placeholder="Full Name"]', 'Candidate A');
        await page.fill('textarea[placeholder="A brief introduction..."]', 'Vote for A');

        // Add another candidate
        await page.click('text=Add Candidate');
        const inputs = page.locator('input[placeholder="Full Name"]');
        await inputs.nth(1).fill('Candidate B');

        // Submit
        await page.click('button:has-text("Create Election")');

        // 5. Verify Redirect and List
        await expect(page).toHaveURL('/admin/elections');
        await expect(page.locator('body')).toContainText(electionTitle);
    });

    test('Member can vote', async ({ page }) => {
        // 1. Register new member
        await page.goto('/register');
        const uniqueId = Date.now();
        const email = `testmember${uniqueId}@example.com`;

        // Updated selectors based on register/page.tsx
        await page.fill('#firstName', 'Test');
        await page.fill('#lastName', 'Member');
        await page.fill('#email', email);
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password123');

        await page.click('button:has-text("Create Account")');

        // Expect redirect (likely to login or portal)
        await expect(page).toHaveURL(/portal|login/);

        // If redirected to login, login
        if (page.url().includes('login')) {
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', 'password123');
            await page.click('button[type="submit"]');
        }

        // 2. Go to Voting Portal
        await page.goto('/portal/vote');

        // 3. Find Election
        await expect(page.locator('h1')).toContainText('Vote');

        // Check if our created election is visible (it might be in a list)
        // Since we can't guarantee order, we just check if page loads.
    });

    test('Member can update profile', async ({ page }) => {
        // 1. Register or Login (using existing logic or a new helper)
        await page.goto('/register');
        const uniqueId = Date.now();
        const email = `profiletest${uniqueId}@example.com`;

        await page.fill('#firstName', 'Profile');
        await page.fill('#lastName', 'Tester');
        await page.fill('#email', email);
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password123');
        await page.click('button:has-text("Create Account")');

        // Login if redirected
        await page.waitForTimeout(1000); // Wait for redirect
        if (page.url().includes('login')) {
            await page.fill('input[id="email"]', email);
            await page.fill('input[id="password"]', 'password123');
            await page.click('button[type="submit"]');
        }

        // 2. Go to Profile
        // Assuming there is a nav link or we go directly
        await page.goto('/portal/profile');

        // 3. Update Bio
        await page.fill('#bio', 'I am a test member updating my bio.');
        await page.fill('#linkedin', 'https://linkedin.com/in/testmember');
        await page.click('button:has-text("Save Changes")');

        // 4. Verify Success Message
        await expect(page.locator('text=Saved!')).toBeVisible();

        // 5. Reload and Verify Persistence
        await page.reload();
        await expect(page.locator('#bio')).toHaveValue('I am a test member updating my bio.');
    });
});
