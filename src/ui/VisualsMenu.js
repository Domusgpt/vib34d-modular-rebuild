/**
 * VisualsMenu - Separate menu for visualization-specific settings
 * Color controls, rendering options, and visual effects
 */

import { CollapsibleSection } from './CollapsibleSection.js';

export class VisualsMenu {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.sections = [];
        this.init();
    }

    init() {
        console.log('🎨 Initializing Visuals Menu...');
        this.createVisualsPanel();
        this.setupVisualControls();
        this.setupUpdateLoop();
        console.log('✅ Visuals Menu initialized');
    }

    createVisualsPanel() {
        const panel = document.getElementById('visuals-panel');
        if (!panel) return;

        // Create sections for visuals - ALL VISUAL PARAMETERS
        this.sections = [
            new CollapsibleSection('geometry-controls', '🔷 GEOMETRY', this.renderGeometryControls(), false),
            new CollapsibleSection('4d-projection', '🔄 4D PROJECTION', this.render4DProjection(), false),
            new CollapsibleSection('visual-morphing', '✨ VISUAL MORPHING', this.renderVisualMorphing(), false),
            new CollapsibleSection('color-controls', '🎨 COLOR CONTROLS', this.renderColorControls(), false),
            new CollapsibleSection('system-selection', '🌐 SYSTEM SELECTION', this.renderSystemSelection(), false)
        ];

        // Render with collapse button, tab label, and panel-content wrapper
        panel.innerHTML = `
            <div class="panel-collapse-btn" title="Collapse Panel">−</div>
            <div class="panel-tab-label">🎨 VISUALS</div>
            <div class="panel-content">
                <h2>🎨 VISUALS</h2>
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
                localStorage.setItem('visualsPanelCollapsed', 'false');
            } else {
                // Collapse
                panel.classList.add('collapsed');
                collapseBtn.textContent = '+';
                localStorage.setItem('visualsPanelCollapsed', 'true');
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
        const savedState = localStorage.getItem('visualsPanelCollapsed');
        const isMobile = window.innerWidth <= 480 && window.matchMedia('(orientation: portrait)').matches;

        if (savedState === 'true' || (savedState === null && isMobile)) {
            panel.classList.add('collapsed');
            collapseBtn.textContent = '+';
        }
    }

    renderGeometryControls() {
        const p = this.choreographer.baseParams;
        return `
            <div class="control-group">
                <label>Geometry Type (1-24)</label>
                <div class="slider-row">
                    <input type="range" id="visual-geometry" min="1" max="24" step="1" value="${p.geometry}">
                    <span id="visual-geometry-val">${p.geometry}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 5px;">
                💠 Tesseract, 24-cell, 120-cell, 600-cell, etc.
            </div>
        `;
    }

    render4DProjection() {
        const p = this.choreographer.baseParams;
        return `
            <div style="font-size: 9px; opacity: 0.7; margin-bottom: 10px;">
                4D hyperspace rotation angles
            </div>
            <div class="control-group">
                <label>XW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dXW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dXW}">
                    <span id="visual-rot4dXW-val">${p.rot4dXW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>YW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dYW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dYW}">
                    <span id="visual-rot4dYW-val">${p.rot4dYW.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>ZW Plane Rotation</label>
                <div class="slider-row">
                    <input type="range" id="visual-rot4dZW" min="-3.14159" max="3.14159" step="0.01" value="${p.rot4dZW}">
                    <span id="visual-rot4dZW-val">${p.rot4dZW.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    renderVisualMorphing() {
        const p = this.choreographer.baseParams;
        return `
            <div class="control-group">
                <label>Grid Density (1-100)</label>
                <div class="slider-row">
                    <input type="range" id="visual-gridDensity" min="1" max="100" step="1" value="${p.gridDensity}">
                    <span id="visual-gridDensity-val">${p.gridDensity}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Morph Factor (0-5)</label>
                <div class="slider-row">
                    <input type="range" id="visual-morphFactor" min="0" max="5" step="0.01" value="${p.morphFactor}">
                    <span id="visual-morphFactor-val">${p.morphFactor.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Chaos (0-3)</label>
                <div class="slider-row">
                    <input type="range" id="visual-chaos" min="0" max="3" step="0.01" value="${p.chaos}">
                    <span id="visual-chaos-val">${p.chaos.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Speed (0.1-10)</label>
                <div class="slider-row">
                    <input type="range" id="visual-speed" min="0.1" max="10" step="0.1" value="${p.speed}">
                    <span id="visual-speed-val">${p.speed.toFixed(1)}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 10px;">
                ✨ Shape transformation and animation
            </div>
        `;
    }

    renderColorControls() {
        const p = this.choreographer.baseParams;
        return `
            <div class="control-group">
                <label>Hue</label>
                <div class="slider-row">
                    <input type="range" id="visual-hue" min="0" max="360" step="1" value="${p.hue}">
                    <span id="visual-hue-val">${p.hue}°</span>
                </div>
            </div>
            <div class="control-group">
                <label>Intensity</label>
                <div class="slider-row">
                    <input type="range" id="visual-intensity" min="0" max="1" step="0.01" value="${p.intensity}">
                    <span id="visual-intensity-val">${p.intensity.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Saturation</label>
                <div class="slider-row">
                    <input type="range" id="visual-saturation" min="0" max="1" step="0.01" value="${p.saturation}">
                    <span id="visual-saturation-val">${p.saturation.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Moiré Scale</label>
                <div class="slider-row">
                    <input type="range" id="visual-moire" min="0.95" max="1.05" step="0.001" value="${p.moireScale}">
                    <span id="visual-moire-val">${p.moireScale.toFixed(3)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Glitch Intensity</label>
                <div class="slider-row">
                    <input type="range" id="visual-glitch" min="0" max="0.2" step="0.01" value="${p.glitchIntensity}">
                    <span id="visual-glitch-val">${p.glitchIntensity.toFixed(2)}</span>
                </div>
            </div>
            <div class="control-group">
                <label>Line Thickness</label>
                <div class="slider-row">
                    <input type="range" id="visual-line" min="0.01" max="0.1" step="0.005" value="${p.lineThickness}">
                    <span id="visual-line-val">${p.lineThickness.toFixed(3)}</span>
                </div>
            </div>
            <div style="font-size: 9px; opacity: 0.7; margin-top: 10px;">
                💡 Color, moiré, glitch, and line rendering
            </div>
        `;
    }

    renderSystemSelection() {
        return `
            <div class="system-pills" style="display: flex; gap: 5px; margin-bottom: 10px;">
                <div class="system-pill-vis active" data-system="faceted" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">FACETED</div>
                <div class="system-pill-vis" data-system="quantum" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">QUANTUM</div>
                <div class="system-pill-vis" data-system="holographic" style="flex: 1; padding: 8px; text-align: center; background: rgba(0, 255, 255, 0.1); border: 1px solid #0ff; font-size: 9px; cursor: pointer;">HOLO</div>
            </div>
            <div style="font-size: 9px; opacity: 0.7;">
                Choose visualization engine
            </div>
        `;
    }

    setupVisualControls() {
        // ALL Visual parameter controls
        const allVisualParams = [
            // Geometry
            { id: 'geometry', param: 'geometry', decimals: 0 },
            // 4D Projection
            { id: 'rot4dXW', param: 'rot4dXW', decimals: 2 },
            { id: 'rot4dYW', param: 'rot4dYW', decimals: 2 },
            { id: 'rot4dZW', param: 'rot4dZW', decimals: 2 },
            // Visual Morphing
            { id: 'gridDensity', param: 'gridDensity', decimals: 0 },
            { id: 'morphFactor', param: 'morphFactor', decimals: 2 },
            { id: 'chaos', param: 'chaos', decimals: 2 },
            { id: 'speed', param: 'speed', decimals: 1 },
            // Color Controls
            { id: 'hue', param: 'hue', decimals: 0, suffix: '°' },
            { id: 'intensity', param: 'intensity', decimals: 2 },
            { id: 'saturation', param: 'saturation', decimals: 2 },
            { id: 'moire', param: 'moireScale', decimals: 3 },
            { id: 'glitch', param: 'glitchIntensity', decimals: 2 },
            { id: 'line', param: 'lineThickness', decimals: 3 }
        ];

        allVisualParams.forEach(({ id, param, decimals, suffix }) => {
            const slider = document.getElementById(`visual-${id}`);
            const valueDisplay = document.getElementById(`visual-${id}-val`);
            if (!slider || !valueDisplay) return;

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (decimals === 0) {
                    valueDisplay.textContent = `${value}${suffix || ''}`;
                } else {
                    valueDisplay.textContent = value.toFixed(decimals) + (suffix || '');
                }
                this.choreographer.setParameter(param, value);
            });
        });

        // System switching (within visuals menu)
        document.querySelectorAll('.system-pill-vis').forEach(pill => {
            pill.addEventListener('click', async () => {
                const system = pill.dataset.system;
                await this.choreographer.switchSystem(system);

                // Update both visuals menu pills and top bar tabs
                document.querySelectorAll('.system-pill-vis').forEach(p => {
                    p.classList.toggle('active', p.dataset.system === system);
                });
                document.querySelectorAll('.viz-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.system === system);
                });
                document.querySelectorAll('.system-pill').forEach(p => {
                    p.classList.toggle('active', p.dataset.system === system);
                });
            });
        });
    }

    setupUpdateLoop() {
        // Update ALL visual parameter displays periodically
        setInterval(() => {
            const p = this.choreographer.baseParams;

            // Geometry
            const geometryVal = document.getElementById('visual-geometry-val');
            const geometrySlider = document.getElementById('visual-geometry');
            if (geometryVal && geometrySlider) {
                geometryVal.textContent = p.geometry;
                geometrySlider.value = p.geometry;
            }

            // 4D Projection
            const rot4dXWVal = document.getElementById('visual-rot4dXW-val');
            const rot4dXWSlider = document.getElementById('visual-rot4dXW');
            if (rot4dXWVal && rot4dXWSlider) {
                rot4dXWVal.textContent = p.rot4dXW.toFixed(2);
                rot4dXWSlider.value = p.rot4dXW;
            }

            const rot4dYWVal = document.getElementById('visual-rot4dYW-val');
            const rot4dYWSlider = document.getElementById('visual-rot4dYW');
            if (rot4dYWVal && rot4dYWSlider) {
                rot4dYWVal.textContent = p.rot4dYW.toFixed(2);
                rot4dYWSlider.value = p.rot4dYW;
            }

            const rot4dZWVal = document.getElementById('visual-rot4dZW-val');
            const rot4dZWSlider = document.getElementById('visual-rot4dZW');
            if (rot4dZWVal && rot4dZWSlider) {
                rot4dZWVal.textContent = p.rot4dZW.toFixed(2);
                rot4dZWSlider.value = p.rot4dZW;
            }

            // Visual Morphing
            const gridDensityVal = document.getElementById('visual-gridDensity-val');
            const gridDensitySlider = document.getElementById('visual-gridDensity');
            if (gridDensityVal && gridDensitySlider) {
                gridDensityVal.textContent = p.gridDensity;
                gridDensitySlider.value = p.gridDensity;
            }

            const morphFactorVal = document.getElementById('visual-morphFactor-val');
            const morphFactorSlider = document.getElementById('visual-morphFactor');
            if (morphFactorVal && morphFactorSlider) {
                morphFactorVal.textContent = p.morphFactor.toFixed(2);
                morphFactorSlider.value = p.morphFactor;
            }

            const chaosVal = document.getElementById('visual-chaos-val');
            const chaosSlider = document.getElementById('visual-chaos');
            if (chaosVal && chaosSlider) {
                chaosVal.textContent = p.chaos.toFixed(2);
                chaosSlider.value = p.chaos;
            }

            const speedVal = document.getElementById('visual-speed-val');
            const speedSlider = document.getElementById('visual-speed');
            if (speedVal && speedSlider) {
                speedVal.textContent = p.speed.toFixed(1);
                speedSlider.value = p.speed;
            }

            // Color Controls
            const hueVal = document.getElementById('visual-hue-val');
            const hueSlider = document.getElementById('visual-hue');
            if (hueVal && hueSlider) {
                hueVal.textContent = `${p.hue}°`;
                hueSlider.value = p.hue;
            }

            const intensityVal = document.getElementById('visual-intensity-val');
            const intensitySlider = document.getElementById('visual-intensity');
            if (intensityVal && intensitySlider) {
                intensityVal.textContent = p.intensity.toFixed(2);
                intensitySlider.value = p.intensity;
            }

            const saturationVal = document.getElementById('visual-saturation-val');
            const saturationSlider = document.getElementById('visual-saturation');
            if (saturationVal && saturationSlider) {
                saturationVal.textContent = p.saturation.toFixed(2);
                saturationSlider.value = p.saturation;
            }

            const moireVal = document.getElementById('visual-moire-val');
            const moireSlider = document.getElementById('visual-moire');
            if (moireVal && moireSlider) {
                moireVal.textContent = p.moireScale.toFixed(3);
                moireSlider.value = p.moireScale;
            }

            const glitchVal = document.getElementById('visual-glitch-val');
            const glitchSlider = document.getElementById('visual-glitch');
            if (glitchVal && glitchSlider) {
                glitchVal.textContent = p.glitchIntensity.toFixed(2);
                glitchSlider.value = p.glitchIntensity;
            }

            const lineVal = document.getElementById('visual-line-val');
            const lineSlider = document.getElementById('visual-line');
            if (lineVal && lineSlider) {
                lineVal.textContent = p.lineThickness.toFixed(3);
                lineSlider.value = p.lineThickness;
            }
        }, 100);
    }
}
