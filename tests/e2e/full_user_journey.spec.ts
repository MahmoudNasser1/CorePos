import { test, expect } from '@playwright/test'

test.describe('CorePOS — Full user journey (Pilot)', () => {
  test('login → POS cash sale → invoice number shown → daily report loads', async ({ page, request }) => {
    await page.context().clearCookies()

    // Prevent print dialog from breaking CI/local runs
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.print = () => {}
    })

    page.on('request', (req) => {
      const url = req.url()
      if (url.includes('localhost:4000')) {
        // eslint-disable-next-line no-console
        console.log('[e2e][request]', req.method(), url)
      }
    })
    page.on('response', (res) => {
      const url = res.url()
      if (url.includes('localhost:4000') && url.includes('/auth/login')) {
        // eslint-disable-next-line no-console
        console.log('[e2e][response]', res.status(), url)
      }
    })
    page.on('console', (msg) => {
      const text = msg.text()
      if (msg.type() === 'error' || text.includes('POS Store:')) {
        // eslint-disable-next-line no-console
        console.log(`[e2e][console:${msg.type()}]`, text)
      }
    })

    // 0) Ensure a fresh user exists (backend)
    const email = `e2e_${Date.now()}@example.com`
    const password = 'password123'
    await request.post('http://localhost:4000/v1/auth/register', {
      data: { email, password, fullName: 'E2E Tester', company: 'شركة الاختبار' },
    })

    // 1) Login
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    // 2) Ensure auth cookies exist then load dashboard
    await page.waitForResponse((r) => r.url().includes('/auth/login') && r.status() === 200)
    const cookies = await page.context().cookies()
    const hasAccessToken = cookies.some((c) => c.name === 'access_token')
    expect(hasAccessToken).toBeTruthy()

    // 2.1) Seed backend sample data (products/stock/treasury defaults)
    const backendCookies = await page.context().cookies('http://localhost:4000')
    const cookieHeader = backendCookies.map((c) => `${c.name}=${c.value}`).join('; ')
    await request.post('http://localhost:4000/v1/onboarding/sample-data', {
      headers: { cookie: cookieHeader },
      data: {},
    })

    // Fetch product list to select a deterministic item name
    const invRes = await request.get('http://localhost:4000/v1/inventory/products?limit=10', {
      headers: { cookie: cookieHeader },
    })
    expect(invRes.ok()).toBeTruthy()
    const invJson: any = await invRes.json()
    const items = invJson?.data?.items ?? invJson?.items ?? []
    expect(Array.isArray(items) && items.length > 0).toBeTruthy()
    const productName = items[0].name as string

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText('الرئيسية')).toBeVisible()

    // 3) Go to POS (direct navigation is more stable than sidebar click)
    await page.goto('/dashboard/pos')
    await expect(page).toHaveURL(/\/dashboard\/pos/)

    // 4) Add first product from backend-seeded inventory
    await expect(page.getByPlaceholder('بحث بالاسم أو الباركود... (F1)')).toBeVisible()
    await page.getByPlaceholder('بحث بالاسم أو الباركود... (F1)').fill(productName)
    const productButton = page.getByRole('button', { name: new RegExp(productName) })
    await expect(productButton).toBeVisible()
    await productButton.click({ force: true })

    // Ensure cart updated (avoid racing state updates)
    await expect(page.getByText('السلة فارغة. ابدأ بإضافة أصناف')).toBeHidden()

    // 5) Checkout (cash)
    const checkoutButton = page.getByRole('button', { name: 'إتمام البيع' })
    await expect(checkoutButton).toBeEnabled()
    await checkoutButton.click()

    await page.getByRole('button', { name: 'نقدي' }).click()
    const confirmButton = page.getByRole('button', { name: 'تأكيد الدفع وطباعة' })
    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    // 6) Success screen + invoice number visible
    await expect(page.getByText('تم البيع بنجاح!')).toBeVisible({ timeout: 30_000 })
    const invoiceLine = page.getByText(/رقم الفاتورة:/)
    await expect(invoiceLine).toBeVisible()

    // Extract invoice number for simple validation (format: YYMM-NNN)
    const invoiceText = (await invoiceLine.textContent()) ?? ''
    expect(invoiceText).toMatch(/\d{4}-\d{3}/)

    // 7) Reports daily page loads (sanity)
    await page.goto('/dashboard/reports/daily')
    await expect(page.getByRole('heading', { name: 'التقرير اليومي' })).toBeVisible()
  })
})

