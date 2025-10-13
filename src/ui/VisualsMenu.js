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

        // Create sections for visuals
        this.sections = [
            new CollapsibleSection('color-controls', '🎨 COLOR CONTROLS', this.renderColorControls(), true),
            new CollapsibleSection('system-selection', '🌐 SYSTEM SELECTION', this.renderSystemSelection(), false)
        ];

        // Render with collapse button and panel-content wrapper
        panel.innerHTML = `
            <div class="panel-collapse-btn" title="Collapse Panel">−</div>
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
        // Color parameter controls
        const colorParams = [
            { id: 'hue', param: 'hue', decimals: 0, suffix: '°' },
            { id: 'intensity', param: 'intensity', decimals: 2 },
            { id: 'saturation', param: 'saturation', decimals: 2 },
            { id: 'moire', param: 'moireScale', decimals: 3 },
            { id: 'glitch', param: 'glitchIntensity', decimals: 2 },
            { id: 'line', param: 'lineThickness', decimals: 3 }
        ];

        colorParams.forEach(({ id, param, decimals, suffix }) => {
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
        // Update value displays periodically
        setInterval(() => {
            const p = this.choreographer.baseParams;

            const hueVal = document.getElementById('visual-hue-val');
            const intensityVal = document.getElementById('visual-intensity-val');
            const saturationVal = document.getElementById('visual-saturation-val');
            const moireVal = document.getElementById('visual-moire-val');
            const glitchVal = document.getElementById('visual-glitch-val');
            const lineVal = document.getElementById('visual-line-val');

            if (hueVal) hueVal.textContent = `${p.hue}°`;
            if (intensityVal) intensityVal.textContent = p.intensity.toFixed(2);
            if (saturationVal) saturationVal.textContent = p.saturation.toFixed(2);
            if (moireVal) moireVal.textContent = p.moireScale.toFixed(3);
            if (glitchVal) glitchVal.textContent = p.glitchIntensity.toFixed(2);
            if (lineVal) lineVal.textContent = p.lineThickness.toFixed(3);
        }, 100);
    }
}
