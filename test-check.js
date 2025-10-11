import playwright from 'playwright';

(async () => {
    const browser = await playwright.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('[BROWSER]', msg.text()));
    page.on('pageerror', err => console.error('[ERROR]', err.message));
    
    await page.goto('http://localhost:8765/vib34d-modular-rebuild/check-variations.html');
    await page.waitForTimeout(3000);
    
    const text = await page.textContent('#test');
    console.log('\nResult:', text);
    
    await page.waitForTimeout(5000);
    await browser.close();
})();
