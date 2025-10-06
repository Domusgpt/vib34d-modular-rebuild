/**
 * Automated browser test for VIB34D Modular Rebuild
 * Tests that the page loads and engines initialize
 */

import puppeteer from 'puppeteer';

(async () => {
    console.log('🚀 Starting browser test...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console messages
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log(`[Browser] ${text}`);
    });

    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
        console.error(`[ERROR] ${error.message}`);
    });

    // Navigate to the page
    console.log('📄 Loading page: http://localhost:8765/vib34d-timeline-dev/\n');
    await page.goto('http://localhost:8765/vib34d-timeline-dev/', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
    });

    // Wait for Choreographer to initialize
    console.log('⏳ Waiting for Choreographer to initialize...\n');
    await page.waitForFunction(() => {
        return window.choreographer !== undefined && window.choreographer.systems !== undefined;
    }, { timeout: 20000 });

    // Check if engines are loaded
    const engineStatus = await page.evaluate(() => {
        const c = window.choreographer;
        if (!c || !c.systems) {
            return { error: 'Choreographer not fully initialized' };
        }
        return {
            currentSystem: c.currentSystem || 'unknown',
            facetedEngine: (c.systems.faceted && c.systems.faceted.engine) ? 'loaded' : 'missing',
            quantumEngine: (c.systems.quantum && c.systems.quantum.engine) ? 'loaded' : 'missing',
            holographicEngine: (c.systems.holographic && c.systems.holographic.engine) ? 'loaded' : 'missing',
            canvasManager: c.canvasManager ? 'loaded' : 'missing',
            audioAnalyzer: c.audioAnalyzer ? 'loaded' : 'missing',
        };
    });

    console.log('\n✅ TEST RESULTS:\n');
    console.log('Current System:', engineStatus.currentSystem);
    console.log('Faceted Engine:', engineStatus.facetedEngine);
    console.log('Quantum Engine:', engineStatus.quantumEngine);
    console.log('Holographic Engine:', engineStatus.holographicEngine);
    console.log('Canvas Manager:', engineStatus.canvasManager);
    console.log('Audio Analyzer:', engineStatus.audioAnalyzer);

    console.log('\n📊 STATISTICS:\n');
    console.log('Total console logs:', logs.length);
    console.log('Total errors:', errors.length);

    if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }

    // Check for success indicators in logs
    const successIndicators = [
        'VIB34D Integrated Holographic Engine',
        'Choreographer ready',
        'Canvas layer manager initialized'
    ];

    const foundIndicators = successIndicators.filter(indicator =>
        logs.some(log => log.includes(indicator))
    );

    console.log('\n🎯 SUCCESS INDICATORS FOUND:', foundIndicators.length, '/', successIndicators.length);
    foundIndicators.forEach(ind => console.log('  ✅', ind));

    await browser.close();

    // Exit with appropriate code
    const success = errors.length === 0 && foundIndicators.length === successIndicators.length;
    console.log('\n' + (success ? '✅ ALL TESTS PASSED!' : '❌ TESTS FAILED'));
    process.exit(success ? 0 : 1);
})();
