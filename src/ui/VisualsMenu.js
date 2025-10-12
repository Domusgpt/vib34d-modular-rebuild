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

        // Render all sections
        panel.innerHTML = '<h2>🎨 VISUALS</h2>' + this.sections.map(s => s.render()).join('');

        // Attach listeners
        this.sections.forEach(section => section.attachListeners(panel));
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
            <div style="font-size: 9px; opacity: 0.7; margin-top: 10px;">
                💡 Control color and visual appearance
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
            { id: 'hue', param: 'hue' },
            { id: 'intensity', param: 'intensity' },
            { id: 'saturation', param: 'saturation' }
        ];

        colorParams.forEach(({ id, param }) => {
            const slider = document.getElementById(`visual-${id}`);
            const valueDisplay = document.getElementById(`visual-${id}-val`);
            if (!slider || !valueDisplay) return;

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (id === 'hue') {
                    valueDisplay.textContent = `${value}°`;
                } else {
                    valueDisplay.textContent = value.toFixed(2);
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

            if (hueVal) hueVal.textContent = `${p.hue}°`;
            if (intensityVal) intensityVal.textContent = p.intensity.toFixed(2);
            if (saturationVal) saturationVal.textContent = p.saturation.toFixed(2);
        }, 100);
    }
}
