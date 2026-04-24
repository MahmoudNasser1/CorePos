import { test, expect } from '@playwright/test';

test.describe('Pos-Sahl End-to-End User Flow', () => {
  test('Complete login and sale flow', async ({ page }) => {
    // 1. Visit Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@pos-sahl.com');
    await page.fill('input[type="password"]', 'admin-password-123');
    await page.click('button[type="submit"]');

    // 2. Verify Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=الرئيسية')).toBeVisible();

    // 3. Open POS
    await page.click('text=نقطة البيع (POS)');
    await expect(page).toHaveURL(/.*pos/);

    // 4. Perform a Sale (Mock/Test selection)
    // Wait for products to load
    await page.waitForSelector('.product-card', { timeout: 5000 });
    await page.click('.product-card:first-child');
    
    // Check if added to cart
    await expect(page.locator('text=إتمام البيع')).toBeEnabled();

    // 5. Finalize Sale
    await page.click('text=إتمام البيع');
    await page.waitForSelector('text=دفع نقدي');
    await page.click('text=تأكيد العملية');

    // 6. Verify Success
    await expect(page.locator('text=تمت العملية بنجاح')).toBeVisible();
  });
});
