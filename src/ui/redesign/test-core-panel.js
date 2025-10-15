/**
 * Test harness for all UI Redesign panels
 * Initializes complete multi-panel system
 */

import { CoreParametersPanel } from './panels/CoreParametersPanel.js';
import { VisualStylePanel } from './panels/VisualStylePanel.js';
import { TransformPanel } from './panels/TransformPanel.js';
import { XYControlPanel } from './panels/XYControlPanel.js';
import { AudioPanel } from './panels/AudioPanel.js';
import { StatusBadge } from './components/StatusBadge.js';
import { CanvasTouchControl } from './components/CanvasTouchControl.js';

export function initTestUI(choreographer) {
    console.log('🧪 Initializing complete UI Redesign system...');

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/src/ui/redesign/redesign-styles.css';
    document.head.appendChild(link);

    // Create all 5 panels
    console.log('Creating panels...');

    const corePanel = new CoreParametersPanel(choreographer);
    console.log('✅ CoreParametersPanel created');

    const visualStylePanel = new VisualStylePanel(choreographer);
    console.log('✅ VisualStylePanel created');

    const transformPanel = new TransformPanel(choreographer);
    console.log('✅ TransformPanel created');

    const xyControlPanel = new XYControlPanel(choreographer);
    console.log('✅ XYControlPanel created');

    const audioPanel = new AudioPanel(choreographer);
    console.log('✅ AudioPanel created');

    // Create Status Badge
    const statusBadge = new StatusBadge(choreographer);
    console.log('✅ StatusBadge created');

    // Create Canvas Touch Control
    let canvasTouchControl = null;
    const canvas = document.getElementById('content-canvas') ||
                  document.querySelector('.canvas-layer');
    if (canvas) {
        // Note: CanvasTouchControl will read parameter mappings from xyControlPanel
        canvasTouchControl = new CanvasTouchControl(
            canvas,
            choreographer,
            xyControlPanel // Pass XY control panel instead of old touchpad
        );
        console.log('✅ CanvasTouchControl created');
        console.log('   Move cursor on canvas to test crosshair');
        console.log('   Double-tap canvas to cycle geometry');
    }

    console.log('');
    console.log('🎛️ UI REDESIGN SYSTEM READY');
    console.log('   5 panels created (most start collapsed)');
    console.log('   Drag panels by header');
    console.log('   Double-click header to collapse/expand');
    console.log('   Positions saved to localStorage');
    console.log('');

    // Return all components with cleanup function
    return {
        corePanel,
        visualStylePanel,
        transformPanel,
        xyControlPanel,
        audioPanel,
        statusBadge,
        canvasTouchControl,
        destroy: () => {
            corePanel.destroy();
            visualStylePanel.destroy();
            transformPanel.destroy();
            xyControlPanel.destroy();
            audioPanel.destroy();
            statusBadge.destroy();
            if (canvasTouchControl) canvasTouchControl.destroy();
        }
    };
}
