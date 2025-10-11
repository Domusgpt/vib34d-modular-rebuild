/**
 * EnhancedControls - Advanced UI components for the choreographer
 * Performance monitoring, preset management, real-time parameter controls
 */

import { GeometryControls } from './controls/GeometryControls.js';
import { VariationControls } from './controls/VariationControls.js';

export class EnhancedControls {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.elements = {};
        this.geometryControls = null;
        this.variationControls = null;

        this.init();
    }

    init() {
        console.log('🎛️ Initializing EnhancedControls...');

        console.log('  📊 Creating performance display...');
        this.createPerformanceDisplay();

        console.log('  🎨 Creating preset selector...');
        this.createPresetSelector();

        console.log('  🎛️ Creating parameter controls...');
        this.createParameterControls();

        console.log('  🎨 Initializing variation controls...');
        this.variationControls = new VariationControls(this.choreographer);
        window.variationControls = this.variationControls; // Global access for search results

        console.log('  🔺 Initializing geometry controls...');
        this.geometryControls = new GeometryControls(this.choreographer);

        console.log('  ⏱️ Setting up update loop...');
        this.setupUpdateLoop();

        // Verify components exist
        const checks = {
            perfDisplay: !!document.getElementById('performance-display'),
            presetSelector: !!document.getElementById('preset-selector'),
            intensitySlider: !!document.getElementById('intensity-slider'),
            speedSlider: !!document.getElementById('speed-slider'),
            chaosSlider: !!document.getElementById('chaos-slider')
        };

        console.log('✅ EnhancedControls initialized:', checks);

        if (!checks.presetSelector) {
            console.error('❌ Preset selector missing! Check control panel structure');
        }
        if (!checks.intensitySlider) {
            console.error('❌ Parameter sliders missing! Check control panel structure');
        }
    }

    /**
     * Create performance monitoring display
     */
    createPerformanceDisplay() {
        const existing = document.getElementById('performance-display');
        if (existing) {
            this.elements.performanceDisplay = existing;
            return;
        }

        const container = document.createElement('div');
        container.id = 'performance-display';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #0ff;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #0ff;
            min-width: 200px;
            z-index: 200;
            display: none;
        `;

        container.innerHTML = `
            <h4 style="margin: 0 0 10px 0; font-size: 12px;">📊 PERFORMANCE</h4>
            <div id="perf-fps">FPS: --</div>
            <div id="perf-frame-time">Frame Time: --</div>
            <div id="perf-render-time">Render Time: --</div>
            <div id="perf-visualizers">Visualizers: --</div>
            <div id="perf-canvases">Canvases: --</div>
            <div id="perf-grade" style="margin-top: 5px; font-size: 14px; font-weight: bold;">Grade: --</div>
            <div id="perf-status" style="margin-top: 5px; font-size: 10px;">Status: --</div>
        `;

        document.body.appendChild(container);
        this.elements.performanceDisplay = container;

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '📊';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid #0ff;
            color: #0ff;
            cursor: pointer;
            padding: 5px 10px;
            font-size: 14px;
            z-index: 199;
        `;
        toggleBtn.onclick = () => {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            toggleBtn.style.left = isHidden ? '240px' : '20px';
        };
        document.body.appendChild(toggleBtn);
    }

    /**
     * Create preset selector dropdown
     */
    createPresetSelector() {
        const container = document.getElementById('control-panel');
        if (!container) {
            console.warn('⚠️ Control panel not found - cannot add preset selector');
            return;
        }

        // Check if already exists
        if (document.getElementById('preset-selector')) {
            console.log('✅ Preset selector already exists');
            return;
        }

        const presetGroup = document.createElement('div');
        presetGroup.className = 'control-group';
        presetGroup.innerHTML = `
            <label>🎨 PRESETS</label>
            <select id="preset-selector" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-family: inherit; font-size: 10px;">
                <option value="">-- Select Preset --</option>
            </select>
            <button id="save-preset-btn" style="margin-top: 5px; padding: 5px; width: 100%;">💾 Save Current</button>
        `;

        // Insert after VISUALIZATION SYSTEM group (3rd control-group)
        const allGroups = container.querySelectorAll('.control-group');
        console.log(`📊 Found ${allGroups.length} control groups`);

        if (allGroups.length >= 3) {
            // Insert after 3rd group (VISUALIZATION SYSTEM)
            allGroups[2].after(presetGroup);
            console.log('✅ Preset selector inserted after VISUALIZATION SYSTEM');
        } else {
            // Fallback: insert at beginning
            const firstChild = container.querySelector('.control-group');
            if (firstChild) {
                firstChild.before(presetGroup);
            } else {
                container.insertBefore(presetGroup, container.firstChild);
            }
            console.log('⚠️ Preset selector inserted at fallback position');
        }

        this.populatePresets();

        // Setup event listeners
        const selector = document.getElementById('preset-selector');
        const saveBtn = document.getElementById('save-preset-btn');

        if (selector) {
            selector.addEventListener('change', (e) => {
                if (e.target.value) {
                    console.log(`🎨 Applying preset: ${e.target.value}`);
                    this.choreographer.presetManager.applyPreset(e.target.value);
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const name = prompt('Enter preset name:');
                if (name) {
                    this.choreographer.presetManager.saveCurrentAsPreset(name);
                    this.populatePresets();
                    console.log(`💾 Saved preset: ${name}`);
                }
            });
        }
    }

    /**
     * Populate preset dropdown
     */
    populatePresets() {
        const select = document.getElementById('preset-selector');
        if (!select || !this.choreographer.presetManager) return;

        const presets = this.choreographer.presetManager.getPresetList();
        select.innerHTML = '<option value="">-- Select Preset --</option>';

        // Group by custom/built-in
        const builtIn = presets.filter(p => !p.custom);
        const custom = presets.filter(p => p.custom);

        if (builtIn.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Built-in Presets';
            builtIn.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.key;
                option.textContent = preset.name;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }

        if (custom.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Custom Presets';
            custom.forEach(preset => {
                const option = document.createElement('option');
                option.value = preset.key;
                option.textContent = preset.name;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }
    }

    /**
     * Create real-time parameter controls
     */
    createParameterControls() {
        const container = document.getElementById('control-panel');
        if (!container) {
            console.warn('⚠️ Control panel not found - cannot add parameter controls');
            return;
        }

        // Check if already exists
        const existingParam = Array.from(document.querySelectorAll('.control-group label')).find(
            label => label.textContent.includes('PARAMETERS')
        );
        if (existingParam) {
            console.log('✅ Parameter controls already exist');
            return;
        }

        const paramGroup = document.createElement('div');
        paramGroup.className = 'control-group';
        paramGroup.innerHTML = `
            <label>🎛️ PARAMETERS</label>
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 5px;">Use arrow keys and [ ] to adjust</div>
            ${this.createSlider('intensity', 'Intensity', 0, 1, 0.01)}
            ${this.createSlider('speed', 'Speed', 0.1, 5, 0.1)}
            ${this.createSlider('chaos', 'Chaos', 0, 1, 0.01)}
            ${this.createSlider('gridDensity', 'Grid Density', 1, 50, 1)}
            ${this.createSlider('hue', 'Hue', 0, 360, 1)}
            ${this.createSlider('saturation', 'Saturation', 0, 1, 0.01)}
        `;

        // Insert before STATUS LOG group (last group)
        const statusGroup = Array.from(container.querySelectorAll('.control-group')).find(g =>
            g.querySelector('label')?.textContent.includes('STATUS LOG')
        );

        if (statusGroup) {
            statusGroup.before(paramGroup);
            console.log('✅ Parameter controls inserted before STATUS LOG');
        } else {
            // Fallback: append to end
            container.appendChild(paramGroup);
            console.log('⚠️ Parameter controls appended to end');
        }

        // Setup sliders
        this.setupParameterSliders();
    }

    /**
     * Create slider HTML
     */
    createSlider(param, label, min, max, step) {
        const value = this.choreographer.baseParams[param] || min;
        return `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 2px;">
                    <span>${label}</span>
                    <span id="${param}-value">${value.toFixed(2)}</span>
                </div>
                <input type="range" id="${param}-slider"
                    min="${min}" max="${max}" step="${step}" value="${value}"
                    style="width: 100%; height: 20px; background: rgba(0,255,255,0.1); cursor: pointer;">
            </div>
        `;
    }

    /**
     * Setup parameter slider event listeners
     */
    setupParameterSliders() {
        const params = ['intensity', 'speed', 'chaos', 'gridDensity', 'hue', 'saturation'];

        params.forEach(param => {
            const slider = document.getElementById(`${param}-slider`);
            const valueDisplay = document.getElementById(`${param}-value`);

            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.choreographer.baseParams[param] = value;

                    // Update display
                    if (valueDisplay) {
                        valueDisplay.textContent = value.toFixed(2);
                    }

                    // Update system
                    const sys = this.choreographer.systems[this.choreographer.currentSystem];
                    if (sys.engine) {
                        this.choreographer.updateSystemParameters(sys.engine);
                    }
                });
            }
        });
    }

    /**
     * Update performance display
     */
    updatePerformanceDisplay() {
        if (!this.choreographer.performanceMonitor) return;

        const summary = this.choreographer.performanceMonitor.getSummary();

        const fpsEl = document.getElementById('perf-fps');
        const frameTimeEl = document.getElementById('perf-frame-time');
        const renderTimeEl = document.getElementById('perf-render-time');
        const visualizersEl = document.getElementById('perf-visualizers');
        const canvasesEl = document.getElementById('perf-canvases');
        const gradeEl = document.getElementById('perf-grade');
        const statusEl = document.getElementById('perf-status');

        if (fpsEl) fpsEl.textContent = `FPS: ${summary.current.fps}`;
        if (frameTimeEl) frameTimeEl.textContent = `Frame Time: ${summary.current.frameTime.toFixed(2)}ms`;
        if (renderTimeEl) renderTimeEl.textContent = `Render Time: ${summary.current.renderTime.toFixed(2)}ms`;
        if (visualizersEl) visualizersEl.textContent = `Visualizers: ${summary.current.activeVisualizers}`;
        if (canvasesEl) canvasesEl.textContent = `Canvases: ${summary.current.canvasCount}`;

        if (gradeEl) {
            const grade = this.choreographer.performanceMonitor.getGrade();
            const gradeColors = {
                'A': '#0f0',
                'B': '#8f0',
                'C': '#ff0',
                'D': '#f80',
                'F': '#f00'
            };
            gradeEl.textContent = `Grade: ${grade}`;
            gradeEl.style.color = gradeColors[grade] || '#0ff';
        }

        if (statusEl) {
            const statusColors = {
                'excellent': '#0f0',
                'good': '#8f0',
                'poor': '#ff0',
                'critical': '#f00'
            };
            statusEl.textContent = `Status: ${summary.status}`;
            statusEl.style.color = statusColors[summary.status] || '#0ff';
        }
    }

    /**
     * Setup update loop
     */
    setupUpdateLoop() {
        setInterval(() => {
            this.updatePerformanceDisplay();
        }, 100); // Update 10 times per second
    }

    /**
     * Show notification
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 20px 40px;
            border: 2px solid #0ff;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}
