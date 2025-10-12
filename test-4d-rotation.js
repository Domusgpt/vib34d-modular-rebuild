/**
 * Test 4D Rotation Controls Integration
 * Verifies all 11 parameters including rot4dXW, rot4dYW, rot4dZW
 *
 * A Paul Phillips Manifestation
 */

import { chromium } from '@playwright/test';

async function test4DRotation() {
    console.log('🔄 Testing 4D Rotation Controls...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to local dev server
    await page.goto('http://localhost:8765/vib34d-modular-rebuild/');
    await page.waitForTimeout(3000);

    // Check that all 11 parameter controls exist
    console.log('📊 Checking parameter controls...');
    const params = [
        'geometry', 'gridDensity', 'morphFactor', 'chaos',
        'speed', 'hue', 'intensity', 'saturation',
        'rot4dXW', 'rot4dYW', 'rot4dZW'
    ];

    for (const param of params) {
        const slider = await page.$(`#param-${param}`);
        const valueDisplay = await page.$(`#param-${param}-val`);

        if (slider && valueDisplay) {
            console.log(`  ✅ ${param}: Control found`);
        } else {
            console.log(`  ❌ ${param}: Control MISSING`);
        }
    }

    // Test 4D rotation controls specifically
    console.log('\n🔄 Testing 4D Rotation Controls...');

    // Test rot4dXW
    console.log('\n  Testing rot4dXW (XW plane rotation):');
    const rot4dXWSlider = await page.$('#param-rot4dXW');
    const rot4dXWVal = await page.$('#param-rot4dXW-val');

    if (rot4dXWSlider && rot4dXWVal) {
        // Get initial value
        const initialVal = await rot4dXWVal.textContent();
        console.log(`    Initial value: ${initialVal}`);

        // Change value to 1.57 (π/2)
        await rot4dXWSlider.fill('1.57');
        await page.waitForTimeout(500);

        const newVal = await rot4dXWVal.textContent();
        console.log(`    New value: ${newVal}`);

        if (newVal === '1.57') {
            console.log('    ✅ rot4dXW slider working');
        } else {
            console.log(`    ❌ rot4dXW slider NOT working (expected 1.57, got ${newVal})`);
        }
    }

    // Test rot4dYW
    console.log('\n  Testing rot4dYW (YW plane rotation):');
    const rot4dYWSlider = await page.$('#param-rot4dYW');
    const rot4dYWVal = await page.$('#param-rot4dYW-val');

    if (rot4dYWSlider && rot4dYWVal) {
        const initialVal = await rot4dYWVal.textContent();
        console.log(`    Initial value: ${initialVal}`);

        await rot4dYWSlider.fill('-1.57');
        await page.waitForTimeout(500);

        const newVal = await rot4dYWVal.textContent();
        console.log(`    New value: ${newVal}`);

        if (newVal === '-1.57') {
            console.log('    ✅ rot4dYW slider working');
        } else {
            console.log(`    ❌ rot4dYW slider NOT working`);
        }
    }

    // Test rot4dZW
    console.log('\n  Testing rot4dZW (ZW plane rotation):');
    const rot4dZWSlider = await page.$('#param-rot4dZW');
    const rot4dZWVal = await page.$('#param-rot4dZW-val');

    if (rot4dZWSlider && rot4dZWVal) {
        const initialVal = await rot4dZWVal.textContent();
        console.log(`    Initial value: ${initialVal}`);

        await rot4dZWSlider.fill('3.14');
        await page.waitForTimeout(500);

        const newVal = await rot4dZWVal.textContent();
        console.log(`    New value: ${newVal}`);

        if (newVal === '3.14') {
            console.log('    ✅ rot4dZW slider working');
        } else {
            console.log(`    ❌ rot4dZW slider NOT working`);
        }
    }

    // Check console for parameter updates
    console.log('\n📝 Checking console for parameter updates...');

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('rot4d')) {
            console.log(`    Console: ${text}`);
        }
    });

    // Test one more time to trigger console output
    console.log('\n🔄 Testing parameter propagation to Choreographer...');
    await rot4dXWSlider.fill('0.5');
    await page.waitForTimeout(1000);

    // Verify 4D Rotation section is visible
    console.log('\n🎨 Checking UI visibility...');
    const rot4dSection = await page.$('text=🔄 4D ROTATION');
    if (rot4dSection) {
        console.log('  ✅ 4D Rotation section visible in UI');
    } else {
        console.log('  ❌ 4D Rotation section NOT visible');
    }

    // Check build info
    const buildInfo = await page.$('text=✅ 4D Rotation Controls Enabled');
    if (buildInfo) {
        console.log('  ✅ Build info shows 4D rotation enabled');
    } else {
        console.log('  ❌ Build info does NOT show 4D rotation');
    }

    console.log('\n✅ Test completed! Leave browser open for manual verification...');
    console.log('   - Check if 4D shape is rotating when sliders move');
    console.log('   - Verify XW, YW, ZW rotations affect hyperspace orientation');
    console.log('   - Look for console logs showing parameter updates');

    // Keep browser open for manual inspection
    await page.waitForTimeout(60000);

    await browser.close();
}

test4DRotation().catch(console.error);
