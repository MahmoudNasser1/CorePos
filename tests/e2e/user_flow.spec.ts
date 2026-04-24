import { test, expect } from '@playwright/test'

test.describe.skip('Pos-Sahl End-to-End User Flow (legacy)', () => {
  test('Complete login and sale flow', async ({ page, request }) => {
    await page.context().clearCookies()
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.print = () => {}
    })

    const email = `e2e_${Date.now()}@example.com`
    const password = 'password123'
    await request.post('http://localhost:4000/v1/auth/register', {
      data: { email, password, fullName: 'E2E Tester', company: 'شركة الاختبار' },
    })

    // 1. Visit Login
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    const loginResponse = page.waitForResponse((r) => r.url().includes('/auth/login') && r.status() === 200)
    await page.click('button[type="submit"]')

    // 2. Verify Dashboard
    await loginResponse
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('text=الرئيسية')).toBeVisible()

    // 3. Open POS
    await page.goto('/dashboard/pos')
    await expect(page).toHaveURL(/.*pos/)

    // 4. Perform a Sale (Mock/Test selection)
    await expect(page.getByPlaceholder('بحث بالاسم أو الباركود... (F1)')).toBeVisible()
    await page.getByRole('button', { name: /Samsung Galaxy A15/ }).click({ force: true })
    
    // Check if added to cart
    await expect(page.locator('text=إتمام البيع')).toBeEnabled()

    // 5. Finalize Sale
    await page.click('text=إتمام البيع')
    await page.getByRole('button', { name: 'نقدي' }).click()
    await page.getByRole('button', { name: 'تأكيد الدفع وطباعة' }).click()

    // 6. Verify Success
    await expect(page.locator('text=تم البيع بنجاح!')).toBeVisible()
  })
})
