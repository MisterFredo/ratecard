from playwright.sync_api import sync_playwright

URL = "https://www.adweek.com/brand-marketing/ai-battle-microsoft-yusuf-mehdi/"

with sync_playwright() as p:

    browser = p.chromium.launch(
        headless=True
    )

    page = browser.new_page()

    page.goto(
        URL,
        wait_until="networkidle",
        timeout=60000
    )

    print("\n====================")
    print("TITLE")
    print("====================")

    print(page.title())

    print("\n====================")
    print("CONTENT")
    print("====================")

    text = page.locator("body").inner_text()

    print(text[:15000])

    browser.close()
