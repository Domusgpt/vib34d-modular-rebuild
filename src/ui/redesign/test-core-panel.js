/**
 * Test harness for CoreParametersPanel
 * This file tests the first panel implementation
 * Import this in main.js temporarily to test
 */

import { CoreParametersPanel } from './panels/CoreParametersPanel.js';
import { StatusBadge } from './components/StatusBadge.js';
import { CanvasTouchControl } from './components/CanvasTouchControl.js';

export function initTestUI(choreographer) {
    console.log('🧪 Testing CoreParametersPanel...');

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/ui/redesign/redesign-styles.css';
    document.head.appendChild(link);

    // Create Core Parameters Panel
    const corePanel = new CoreParametersPanel(choreographer);
    console.log('✅ CoreParametersPanel created');

    // Create Status Badge
    const statusBadge = new StatusBadge(choreographer);
    console.log('✅ StatusBadge created');

    // Create Canvas Touch Control (if XY touchpad exists)
    let canvasTouchControl = null;
    if (window.xyTouchpad) {
        const canvas = document.getElementById('content-canvas') ||
                      document.querySelector('.canvas-layer');
        if (canvas) {
            canvasTouchControl = new CanvasTouchControl(
                canvas,
                choreographer,
                window.xyTouchpad
            );
            console.log('✅ CanvasTouchControl created');
            console.log('   Move cursor on canvas to test crosshair');
            console.log('   Double-tap canvas to cycle geometry');
        }
    }

    // Return cleanup function
    return {
        corePanel,
        statusBadge,
        canvasTouchControl,
        destroy: () => {
            corePanel.destroy();
            statusBadge.destroy();
            if (canvasTouchControl) canvasTouchControl.destroy();
        }
    };
}
