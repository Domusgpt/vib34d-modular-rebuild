/**
 * IntegratedControlsCollapsible - Collapsible menu version
 * Clean, organized UI with localStorage state
 */

import { CollapsibleSection } from './CollapsibleSection.js';

export class IntegratedControlsCollapsible {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.sections = [];
        this.init();
    }

    init() {
        console.log('🎛️ Initializing Collapsible Controls...');
        this.createControlPanel();
        this.setupParameterControls();
        this.setupUpdateLoop();
        console.log('✅ Collapsible Controls initialized');
    }

    createControlPanel() {
        const panel = document.getElementById('control-panel');
        if (!panel) return;

        // Create sections
        this.sections = [
            new CollapsibleSection('universal-sliders', '🎚️ UNIVERSAL SLIDERS', this.renderUniversalSliders(), false),
            new CollapsibleSection('core-params', '⚙️ CORE PARAMETERS', this.renderCoreParameters(), false),
            new CollapsibleSection('4d-rotation', '🔄 4D ROTATION', this.render4DRotation(), false),
            new CollapsibleSection('audio', '🔊 AUDIO REACTIVITY', this.renderAudioControls(), true)
        ];

        // Render with collapse button, tab label, and panel-content wrapper
        panel.innerHTML = `
            <div class="panel-collapse-btn" title="Collapse Panel">−</div>
            <div class="panel-tab-label">🎛️ CONTROLS</div>
            <div class="panel-content">
                <h2>🎛️ CONTROLS</h2>
                ${this.sections.map(s => s.render()).join('')}
            </div>
        `;

        // Attach section listeners
        this.sections.forEach(section => section.attachListeners(panel));

        // Attach collapse/expand handlers
        const collapseBtn = panel.querySelector('.panel-collapse-btn');

        const toggleCollapse = (e) => {
            if (e) e.stopPropagation();
            const isCollapsed = panel.classList.contains('collapsed');

            if (isCollapsed) {
                // Expand
                panel.classList.remove('collapsed');
                collapseBtn.textContent = '−';
                localStorage.setItem('controlPanelCollapsed', 'false');
            } else {
                // Collapse
                panel.classList.add('collapsed');
                collapseBtn.textContent = '+';
                localStorage.setItem('controlPanelCollapsed', 'true');
            }
        };

        // Click button to toggle
        collapseBtn.addEventListener('click', toggleCollapse);

        // Click anywhere on collapsed panel to expand
        panel.addEventListener('click', (e) => {
            if (panel.classList.contains('collapsed')) {
                toggleCollapse(e);
            }
        });

        // Restore collapsed state from localStorage (or default to expanded on desktop)
        const savedState = localStorage.getItem('controlPanelCollapsed');
        const isMobile = window.innerWidth <= 480 && window.matchMedia('(orientation: portrait)').matches;

        if (savedState === 'true' || (savedState === null && isMobile)) {
            panel.classList.add('collapsed');
            collapseBtn.textContent = '+';
        }
    }

    renderUniversalSliders() {
        // Define all available parameters with their ranges
        const parameterOptions = [
            { value: 'geometry', label: 'Geometry', min: 1, max: 24, step: 1 },
            { value: 'gridDensity', label: 'Grid Density', min: 1, max: 100, step: 1 },
            { value: 'morphFactor', label: 'Morph Factor', min: 0, max: 5, step: 0.01 },
            { value: 'chaos', label: 'Chaos', min: 0, max: 3, step: 0.01 },
            { value: 'speed', label: 'Speed', min: 0.1, max: 10, step: 0.1 },
            { value: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
            { value: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01 },
            { value: 'saturation', label: 'Saturation', min: 0, max: 1, step: 0.01 },
            { value: 'moireScale', label: 'Moire Scale', min: 0, max: 5, step: 0.01 },
            { value: 'glitchIntensity', label: 'Glitch Intensity', min: 0, max: 1, step: 0.01 },
            { value: 'lineThickness', label: 'Line Thickness', min: 0, max: 5, step: 0.01 },
            { value: 'rot4dXW', label: '4D Rotation XW', min: -3.14159, max: 3.14159, step: 0.01 },
            { value: 'rot4dYW', label: '4D Rotation YW', min: -3.14159, max: 3.14159, step: 0.01 },
            { value: 'rot4dZW', label: '4D Rotation ZW', min: -3.14159, max: 3.14159, step: 0.01 }
        ];

        // Get saved assignments or use defaults
        const savedAssignments = JSON.parse(localStorage.getItem('universalSliderAssignments') || '["morphFactor", "chaos", "speed", "hue"]');

        let html = '<div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">Assign any parameter to any slider</div>';

        // Create 4 universal sliders
        for (let i = 0; i < 4; i++) {
            const assignedParam = savedAssignments[i] || parameterOptions[i].value;
            const paramConfig = parameterOptions.find(p => p.value === assignedParam) || parameterOptions[i];
            const currentValue = this.choreographer.baseParams[assignedParam] || paramConfig.min;

            html += `
                <div class="control-group universal-slider-group" data-slider-index="${i}">
                    <select class="universal-param-select" data-slider-index="${i}" style="width: 100%; padding: 6px; background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.3); color: #0ff; font-family: inherit; font-size: 10px; margin-bottom: 4px;">
                        ${parameterOptions.map(opt =>
                            `<option value="${opt.value}" ${opt.value === assignedParam ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                    <div class="slider-row">
                        <input type="range"
                            class="universal-slider"
                            data-slider-index="${i}"
                            data-param="${assignedParam}"
                            min="${paramConfig.min}"
                            max="${paramConfig.max}"
                            step="${paramConfig.step}"
                            value="${currentValue}">
                        <span class="universal-value" data-slider-index="${i}">${this.formatValue(assignedParam, currentValue)}</span>
                    </div>
                </div>
            `;
        }

        return html;
    }

    formatValue(param, value) {
        if (param === 'hue') return `${Math.round(value)}°`;
        if (param === 'geometry' || param === 'gridDensity') return Math.round(value);
        return parseFloat(value).toFixed(2);
    }

    renderCoreParameters() {
        const p = this.choreographer.baseParams;
        return `
            <div class="control-group">
                <label>Geometry (1-24)</label>
                <div class="slider-row">
                    <input type="range" id="param-geometry" min="1" max="24" step="1" value="${p.geometry}">
                    <span id="param-geometry-val">${p.geometry}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Grid Density (1-100 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-gridDensity" min="1" max="100" step="1" value="${p.gridDensity}">
                    <span id="param-gridDensity-val">${p.gridDensity}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Morph Factor (0-5 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-morphFactor" min="0" max="5" step="0.01" value="${p.morphFactor}">
                    <span id="param-morphFactor-val">${p.morphFactor.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Chaos (0-3 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-chaos" min="0" max="3" step="0.01" value="${p.chaos}">
                    <span id="param-chaos-val">${p.chaos.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Speed (0.1-10 EXTREME)</label>
                <div class="slider-row">
                    <input type="range" id="param-speed" min="0.1" max="10" step="0.1" value="${p.speed}">
                    <span id="param-speed-val">${p.speed.toFixed(1)}</span>
                </div>
            </div>
        `;
    }

    render4DRotation() {
        const p = this.choreographer.baseParams;
        return `
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">
                Hyperspace rotation in XW, YW, ZW planes
            </div>
            <div class="control-group">
                <label>XW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dXW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dXW}">
                    <span id="param-rot4dXW-val">${p.rot4dXW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>YW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dYW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dYW}">
                    <span id="param-rot4dYW-val">${p.rot4dYW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>ZW Plane</label>
                <div class="slider-row">
                    <input type="range" id="param-rot4dZW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dZW}">
                    <span id="param-rot4dZW-val">${p.rot4dZW.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    renderAudioControls() {
        return `
            <div class="control-group">
                <button id="toggle-audio-reactive" style="width: 100%; margin-bottom: 10px;">
                    ${this.choreographer.audioReactive ? '🔊 ON' : '🔇 OFF'}
                </button>
                <label>Reactivity Strength</label>
                <div class="slider-row">
                    <input type="range" id="reactivity-strength" min="0" max="1" step="0.05" value="${this.choreographer.reactivityStrength}">
                    <span id="reactivity-strength-val">${this.choreographer.reactivityStrength.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Choreography Mode</label>
                <select id="choreography-mode" style="width: 100%; padding: 8px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-family: inherit; font-size: 11px;">
                    <option value="dynamic" ${this.choreographer.choreographyMode === 'dynamic' ? 'selected' : ''}>Dynamic</option>
                    <option value="smooth" ${this.choreographer.choreographyMode === 'smooth' ? 'selected' : ''}>Smooth</option>
                    <option value="aggressive" ${this.choreographer.choreographyMode === 'aggressive' ? 'selected' : ''}>Aggressive</option>
                    <option value="minimal" ${this.choreographer.choreographyMode === 'minimal' ? 'selected' : ''}>Minimal</option>
                </select>
            </div>
            <div class="control-group">
                <button id="toggle-extreme-mode" style="width: 100%; margin-top: 10px; background: ${this.choreographer.extremeMode ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 255, 0.1)'}; border: 1px solid ${this.choreographer.extremeMode ? '#f00' : '#0ff'}; color: ${this.choreographer.extremeMode ? '#f00' : '#0ff'};">
                    ${this.choreographer.extremeMode ? '🔥 EXTREME MODE: ON' : '⚡ EXTREME MODE: OFF'}
                </button>
                <div style="font-size: 9px; opacity: 0.7; margin-top: 5px;">
                    5x audio reactivity multiplier
                </div>
            </div>
        `;
    }

    renderVisualization() {
        return `
            <div class="system-pills" style="display: flex; gap: 5px; margin-bottom: 10px;">
                <div class="system-pill active" data-system="faceted" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">FACETED</div>
                <div class="system-pill" data-system="quantum" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">QUANTUM</div>
                <div class="system-pill" data-system="holographic" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">HOLO</div>
            </div>
        `;
    }

    setupParameterControls() {
        // Setup Universal Sliders first
        this.setupUniversalSliders();

        const params = ['geometry', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation', 'rot4dXW', 'rot4dYW', 'rot4dZW'];

        params.forEach(param => {
            const slider = document.getElementById(`param-${param}`);
            const valueDisplay = document.getElementById(`param-${param}-val`);
            if (!slider || !valueDisplay) return;

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (param === 'hue') {
                    valueDisplay.textContent = `${value}°`;
                } else if (param === 'geometry' || param === 'gridDensity') {
                    valueDisplay.textContent = value;
                } else {
                    valueDisplay.textContent = value.toFixed(2);
                }
                this.choreographer.setParameter(param, value);
            });
        });

        // System switching
        document.querySelectorAll('.system-pill').forEach(pill => {
            pill.addEventListener('click', async () => {
                const system = pill.dataset.system;
                await this.choreographer.switchSystem(system);
                document.querySelectorAll('.system-pill').forEach(p => {
                    p.classList.toggle('active', p.dataset.system === system);
                });
                const statusEl = document.getElementById('system-status-top');
                if (statusEl) statusEl.textContent = `System: ${system.toUpperCase()}`;
            });
        });

        // Audio reactivity
        const toggleBtn = document.getElementById('toggle-audio-reactive');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.choreographer.audioReactive = !this.choreographer.audioReactive;
                toggleBtn.textContent = this.choreographer.audioReactive ? '🔊 ON' : '🔇 OFF';
            });
        }

        const strengthSlider = document.getElementById('reactivity-strength');
        const strengthVal = document.getElementById('reactivity-strength-val');
        if (strengthSlider && strengthVal) {
            strengthSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.choreographer.reactivityStrength = value;
                strengthVal.textContent = value.toFixed(2);
            });
        }

        const modeSelect = document.getElementById('choreography-mode');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.choreographer.choreographyMode = e.target.value;
            });
        }

        // Extreme mode toggle
        const extremeBtn = document.getElementById('toggle-extreme-mode');
        if (extremeBtn) {
            extremeBtn.addEventListener('click', () => {
                this.choreographer.extremeMode = !this.choreographer.extremeMode;
                extremeBtn.textContent = this.choreographer.extremeMode ? '🔥 EXTREME MODE: ON' : '⚡ EXTREME MODE: OFF';
                extremeBtn.style.background = this.choreographer.extremeMode ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 255, 0.1)';
                extremeBtn.style.borderColor = this.choreographer.extremeMode ? '#f00' : '#0ff';
                extremeBtn.style.color = this.choreographer.extremeMode ? '#f00' : '#0ff';
                console.log(`🔥 Extreme mode: ${this.choreographer.extremeMode ? 'ON (5x multiplier)' : 'OFF'}`);
            });
        }
    }

    setupUniversalSliders() {
        const parameterOptions = [
            { value: 'geometry', label: 'Geometry', min: 1, max: 24, step: 1 },
            { value: 'gridDensity', label: 'Grid Density', min: 1, max: 100, step: 1 },
            { value: 'morphFactor', label: 'Morph Factor', min: 0, max: 5, step: 0.01 },
            { value: 'chaos', label: 'Chaos', min: 0, max: 3, step: 0.01 },
            { value: 'speed', label: 'Speed', min: 0.1, max: 10, step: 0.1 },
            { value: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
            { value: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01 },
            { value: 'saturation', label: 'Saturation', min: 0, max: 1, step: 0.01 },
            { value: 'moireScale', label: 'Moire Scale', min: 0, max: 5, step: 0.01 },
            { value: 'glitchIntensity', label: 'Glitch Intensity', min: 0, max: 1, step: 0.01 },
            { value: 'lineThickness', label: 'Line Thickness', min: 0, max: 5, step: 0.01 },
            { value: 'rot4dXW', label: '4D Rotation XW', min: -3.14159, max: 3.14159, step: 0.01 },
            { value: 'rot4dYW', label: '4D Rotation YW', min: -3.14159, max: 3.14159, step: 0.01 },
            { value: 'rot4dZW', label: '4D Rotation ZW', min: -3.14159, max: 3.14159, step: 0.01 }
        ];

        // Handle dropdown changes (parameter reassignment)
        document.querySelectorAll('.universal-param-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const sliderIndex = parseInt(e.target.dataset.sliderIndex);
                const newParam = e.target.value;
                const paramConfig = parameterOptions.find(p => p.value === newParam);

                // Update the slider element
                const slider = document.querySelector(`.universal-slider[data-slider-index="${sliderIndex}"]`);
                const valueDisplay = document.querySelector(`.universal-value[data-slider-index="${sliderIndex}"]`);

                if (slider && paramConfig) {
                    // Update slider attributes
                    slider.setAttribute('data-param', newParam);
                    slider.min = paramConfig.min;
                    slider.max = paramConfig.max;
                    slider.step = paramConfig.step;
                    slider.value = this.choreographer.baseParams[newParam] || paramConfig.min;

                    // Update value display
                    valueDisplay.textContent = this.formatValue(newParam, slider.value);

                    // Save assignments to localStorage
                    const assignments = [];
                    document.querySelectorAll('.universal-param-select').forEach(s => {
                        assignments.push(s.value);
                    });
                    localStorage.setItem('universalSliderAssignments', JSON.stringify(assignments));

                    console.log(`🎚️ Universal Slider ${sliderIndex + 1} reassigned to ${paramConfig.label}`);
                }
            });
        });

        // Handle slider input (parameter value changes)
        document.querySelectorAll('.universal-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const param = e.target.dataset.param;
                const value = parseFloat(e.target.value);
                const sliderIndex = e.target.dataset.sliderIndex;
                const valueDisplay = document.querySelector(`.universal-value[data-slider-index="${sliderIndex}"]`);

                if (valueDisplay) {
                    valueDisplay.textContent = this.formatValue(param, value);
                }

                this.choreographer.setParameter(param, value);
            });
        });

        console.log('🎚️ Universal Sliders initialized');
    }

    setupUpdateLoop() {
        setInterval(() => {
            // Update regular parameter sliders
            const params = ['geometry', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation', 'rot4dXW', 'rot4dYW', 'rot4dZW'];
            params.forEach(param => {
                const slider = document.getElementById(`param-${param}`);
                const valueDisplay = document.getElementById(`param-${param}-val`);
                const currentValue = this.choreographer.baseParams[param];
                if (slider && valueDisplay && slider.value != currentValue) {
                    slider.value = currentValue;
                    if (param === 'hue') {
                        valueDisplay.textContent = `${currentValue}°`;
                    } else if (param === 'geometry' || param === 'gridDensity') {
                        valueDisplay.textContent = currentValue;
                    } else {
                        valueDisplay.textContent = currentValue.toFixed(2);
                    }
                }
            });

            // Update universal sliders
            document.querySelectorAll('.universal-slider').forEach(slider => {
                const param = slider.dataset.param;
                const sliderIndex = slider.dataset.sliderIndex;
                const currentValue = this.choreographer.baseParams[param];
                const valueDisplay = document.querySelector(`.universal-value[data-slider-index="${sliderIndex}"]`);

                if (currentValue !== undefined && slider.value != currentValue) {
                    slider.value = currentValue;
                    if (valueDisplay) {
                        valueDisplay.textContent = this.formatValue(param, currentValue);
                    }
                }
            });
        }, 100);
    }
}
