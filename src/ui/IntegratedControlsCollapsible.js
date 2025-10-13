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
            new CollapsibleSection('core-params', '⚙️ CORE PARAMETERS', this.renderCoreParameters(), false),
            new CollapsibleSection('4d-rotation', '🔄 4D ROTATION', this.render4DRotation(), false),
            new CollapsibleSection('audio', '🔊 AUDIO REACTIVITY', this.renderAudioControls(), true)
        ];

        // Render all sections
        panel.innerHTML = '<h2>🎛️ CONTROLS</h2>' + this.sections.map(s => s.render()).join('');

        // Attach listeners
        this.sections.forEach(section => section.attachListeners(panel));
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

    setupUpdateLoop() {
        setInterval(() => {
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
        }, 100);
    }
}
