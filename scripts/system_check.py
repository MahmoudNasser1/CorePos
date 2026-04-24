import asyncio
import os
from playwright.async_api import async_playwright

async def run_system_check():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800},
            locale='ar-EG',
            dir='rtl'
        )
        page = await context.new_page()

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(err.message))

        print("🚀 Starting System Check for Pos-Sahl...")
        
        try:
            # 1. Login Phase
            print("🔑 Attempting Login...")
            await page.goto("http://localhost:3000/login")
            await page.fill('input[type="email"]', "admin@pos-sahl.com")
            await page.fill('input[type="password"]', "admin-password-123")
            await page.click('button[type="submit"]')
            
            # Wait for navigation to dashboard
            await page.wait_for_url("**/dashboard", timeout=10000)
            print("✅ Login Successful.")

            pages_to_check = [
                ("/dashboard", "لوحة البيانات"),
                ("/dashboard/pos", "نقطة البيع"),
                ("/dashboard/inventory", "المخزون"),
                ("/dashboard/customers", "العملاء"),
                ("/dashboard/settings", "الإعدادات"),
            ]

            os.makedirs("scripts/screenshots", exist_ok=True)

            results = []

            for path, title in pages_to_check:
                print(f"📡 Checking {title} ({path})...")
                current_errors = len(console_errors)
                
                try:
                    await page.goto(f"http://localhost:3000{path}", wait_until="networkidle")
                    await asyncio.sleep(2) # Give it extra time for client-side rendering
                    
                    screenshot_path = f"scripts/screenshots/{path.replace('/', '_')}.png"
                    await page.screenshot(path=screenshot_path)
                    
                    new_errors = console_errors[current_errors:]
                    status = "❌ FAIL" if new_errors else "✅ PASS"
                    results.append({
                        "page": title,
                        "path": path,
                        "status": status,
                        "errors": new_errors
                    })
                    print(f"   Status: {status} ({len(new_errors)} new errors)")
                except Exception as e:
                    print(f"   ⚠️ Failed to load {path}: {str(e)}")
                    results.append({
                        "page": title,
                        "path": path,
                        "status": "⚠️ CRASH",
                        "errors": [str(e)]
                    })

            # Generate Report
            print("\n" + "="*50)
            print("📊 FINAL SYSTEM CHECK REPORT")
            print("="*50)
            for res in results:
                print(f"{res['status']} | {res['page']} ({res['path']})")
                if res['errors']:
                    for err in res['errors'][:3]: # Show first 3 errors
                        print(f"   └─ Error: {err[:100]}...")
            
            print("\n📸 Screenshots saved in scripts/screenshots/")
            print("="*50)

        except Exception as e:
            print(f"❌ Critical Error during test: {str(e)}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_system_check())
