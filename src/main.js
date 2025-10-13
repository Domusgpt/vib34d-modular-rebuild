/**
 * VIB34D Timeline - Main Entry Point
 * Modular architecture with Vite build system
 */

// Import core modules
import { RecordingEngine } from '@core/RecordingEngine.js';
import { AudioAnalyzer } from '@core/AudioAnalyzer.js';
import { Choreographer } from '@core/Choreographer.js';

// Import choreography modules
import { applyParameterSweeps } from '@choreography/ParameterSweeps.js';
import { applyColorPalette, PRESET_PALETTES } from '@choreography/ColorPalettes.js';
import { applyChoreographyMode, CHOREOGRAPHY_MODES } from '@choreography/ChoreographyModes.js';

// Import UI modules
import { IntegratedControlsCollapsible } from './ui/IntegratedControlsCollapsible.js';
import { VisualsMenu } from './ui/VisualsMenu.js';
import { XYTouchpad } from './ui/XYTouchpad.js';
import { VisualizerXYPad } from './ui/VisualizerXYPad.js';

console.log('🎬 VIB34D Timeline Loading...');
console.log('✅ RecordingEngine loaded');
console.log('✅ AudioAnalyzer loaded');
console.log('✅ Choreographer loaded');
console.log('✅ Parameter Sweeps loaded');
console.log('✅ Color Palettes loaded');
console.log('✅ Choreography Modes loaded');
console.log('📦 Preset Palettes:', Object.keys(PRESET_PALETTES));
console.log('🎭 Choreography Modes:', Object.values(CHOREOGRAPHY_MODES));

// Module status
const MODULES_LOADED = {
    core: ['RecordingEngine', 'AudioAnalyzer', 'Choreographer'],
    choreography: ['ParameterSweeps', 'ColorPalettes', 'ChoreographyModes'],
    presets: Object.keys(PRESET_PALETTES),
    modes: Object.values(CHOREOGRAPHY_MODES)
};

console.log('📊 Modules loaded:', MODULES_LOADED);

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 DOM Ready - VIB34D Timeline (Modular Build)');

    // Initialize Choreographer
    try {
        console.log('Creating Choreographer instance...');
        const choreographer = new Choreographer();

        console.log('Initializing systems...');
        await choreographer.init();

        console.log('Choreographer ready!');

        // Update status displays
        const currentMode = document.getElementById('current-mode');
        const currentSystem = document.getElementById('current-system');
        if (currentMode) currentMode.textContent = 'READY';
        if (currentSystem) currentSystem.textContent = choreographer.currentSystem;

        // Hide loading indicator
        const loading = document.getElementById('loading-indicator');
        if (loading) {
            loading.classList.add('hidden');
        }

        // Make available globally for debugging/testing
        window.choreographer = choreographer;

        // Initialize collapsible controls (properly connected to Choreographer)
        console.log('Initializing IntegratedControlsCollapsible...');
        window.integratedControls = new IntegratedControlsCollapsible(choreographer);

        // Initialize separate Visuals Menu
        console.log('Initializing VisualsMenu...');
        window.visualsMenu = new VisualsMenu(choreographer);

        // Initialize XY Touchpad (with dropdowns)
        console.log('Initializing XYTouchpad...');
        window.xyTouchpad = new XYTouchpad(choreographer);

        // Initialize Visualizer XY Pad
        console.log('Initializing VisualizerXYPad...');
        window.visualizerXYPad = new VisualizerXYPad(choreographer);

        console.log('✅ All UI components initialized');

        // Make modules available for debugging
        window.VIB34D_MODULES = MODULES_LOADED;
        console.log('🔧 Debug: window.VIB34D_MODULES available');
        console.log('🔧 Debug: window.choreographer available');
        console.log('🔧 Debug: window.integratedControls available');
        console.log('🔧 Debug: window.visualsMenu available');

    } catch (error) {
        console.error('❌ Failed to initialize:', error);
    }
});

// Export for use in other modules
export {
    RecordingEngine,
    AudioAnalyzer,
    Choreographer,
    applyParameterSweeps,
    applyColorPalette,
    applyChoreographyMode,
    PRESET_PALETTES,
    CHOREOGRAPHY_MODES,
    MODULES_LOADED
};
