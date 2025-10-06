/**
 * VIB34D Timeline - Main Entry Point
 * Modular architecture with Vite build system
 */

// Import core modules
import { RecordingEngine } from '@core/RecordingEngine.js';
import { AudioAnalyzer } from '@core/AudioAnalyzer.js';

// Import choreography modules
import { applyParameterSweeps } from '@choreography/ParameterSweeps.js';
import { applyColorPalette, PRESET_PALETTES } from '@choreography/ColorPalettes.js';

console.log('🎬 VIB34D Timeline Loading...');
console.log('✅ RecordingEngine loaded');
console.log('✅ AudioAnalyzer loaded');
console.log('✅ Parameter Sweeps loaded');
console.log('✅ Color Palettes loaded');
console.log('📦 Preset Palettes:', Object.keys(PRESET_PALETTES));

// Module status
const MODULES_LOADED = {
    core: ['RecordingEngine', 'AudioAnalyzer'],
    choreography: ['ParameterSweeps', 'ColorPalettes'],
    presets: Object.keys(PRESET_PALETTES)
};

console.log('📊 Modules loaded:', MODULES_LOADED);

// TODO: Import and initialize full Choreographer class
// For now, just verify modules load correctly

window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Ready - VIB34D Timeline (Modular Build)');

    // Hide loading indicator
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.classList.add('hidden');
    }

    // Show system is modular
    const status = document.createElement('div');
    status.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,255,255,0.2);padding:10px;border:1px solid #0ff;color:#0ff;font-family:monospace;z-index:1000;font-size:12px;';
    status.innerHTML = `
        <div style="font-weight:bold;margin-bottom:5px;">🎯 MODULAR BUILD v2.0</div>
        <div>✅ Vite + ES Modules</div>
        <div>✅ RecordingEngine (with visualizer fixes)</div>
        <div>✅ AudioAnalyzer (beat detection)</div>
        <div>✅ Parameter Sweeps (6 types)</div>
        <div>✅ Color Palettes (${Object.keys(PRESET_PALETTES).length} presets)</div>
        <div style="margin-top:5px;font-size:10px;opacity:0.7;">Server: http://localhost:8765</div>
    `;
    document.body.appendChild(status);

    // Make modules available for debugging
    window.VIB34D_MODULES = MODULES_LOADED;
    console.log('🔧 Debug: window.VIB34D_MODULES available');
});

// Export for use in other modules
export {
    RecordingEngine,
    AudioAnalyzer,
    applyParameterSweeps,
    applyColorPalette,
    PRESET_PALETTES,
    MODULES_LOADED
};
