import { test, expect } from '@playwright/test';

test.describe('Transfer Flow', () => {
  test('Complete transfer scenario', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('response', async (response) => {
      if (response.url().includes('wallet/transfer')) {
        console.log('TRANSFER STATUS:', response.status(), response.url());
        const body = await response.text().catch(() => 'no-body');
        console.log('TRANSFER RESPONSE:', body);
      }
    });

    const timestamp = Date.now();
    const sender = `sender_${timestamp}`;
    const recipient = `atharva_${timestamp}`; // Contains 'atharva' for testing the search

    // 1. Setup Data: Register Recipient
    await page.goto('/register');
    await page.fill('input[type="text"]', recipient);
    await page.fill('input[type="email"]', `${recipient}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create Wallet")');
    await expect(page).toHaveURL('/');
    
    // Clear auth and Go to Register again for Sender
    await page.evaluate(() => localStorage.clear());

    // 2. Setup Data: Register Sender
    await page.goto('/register');
    await page.fill('input[type="text"]', sender);
    await page.fill('input[type="email"]', `${sender}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Create Wallet")');
    await expect(page).toHaveURL('/');
    
    await page.evaluate(() => localStorage.clear());

    // Login: Go to /login, enter credentials, and verify redirect to /dashboard
    await page.goto('/login');
    await page.fill('input[type="text"]', sender);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Verify redirect to /dashboard (which is /)
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Successfully logged in!')).toBeVisible();

    // Auth Sync: Verify the balance is visible by asserting the Total Balance header
    await expect(page.locator('text=Total Balance')).toBeVisible({ timeout: 10000 });

    // User Search: Navigate to /transfer
    // Since TransferForm is on the Dashboard, we interact with it directly
    const searchInput = page.locator('input[placeholder="@username"]');
    await searchInput.fill('atharva'); 

    // Dropdown Interaction: Wait for the dropdown, click the first result
    const dropdownItem = page.locator('ul.absolute > li').first();
    await dropdownItem.waitFor({ state: 'visible' });
    
    // Extract the wallet address from the dropdown list item text
    const walletAddress = await dropdownItem.locator('span.font-mono').innerText();
    
    // Click the result
    await dropdownItem.click();

    // Assert that the toWallet input is filled
    // Based on TransferForm structure, it is the 2nd text input (searchTerm, toWallet)
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(1)).toHaveValue(walletAddress);

    // Submission: Enter an amount and click 'Send'
    await page.fill('input[type="number"]', '1.00');
    await page.click('button:has-text("Send Completely")');

    // Wait a brief moment to ensure network completes
    await page.waitForTimeout(2000);

    // Verify that a success Toast appears
    const successToast = page.locator('text=Transfer Successful!');
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Error Case: Try to send ₹1,000,000
    // Re-fill the recipient because the form resets after success!
    await searchInput.fill('atharva'); 
    await dropdownItem.waitFor({ state: 'visible' });
    await dropdownItem.click();

    // 2. Fill the oversized amount and submit
    await page.fill('input[type="number"]', '1000000');
    await page.click('button:has-text("Send Completely")');

    // Verify that an 'Insufficient Funds' Toast appears
    // The backend error propagates to the frontend toast
    const errorToast = page.locator('text=Insufficient Funds', { exact: false });
    await expect(errorToast).toBeVisible({ timeout: 10000 });
  });
});
