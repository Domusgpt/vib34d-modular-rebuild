/**
 * VisualStylePanel - Color and visual effects controls
 * Tabs: [Color] [Effects]
 *
 * Color Tab:
 * - Hue (0-360)
 * - Saturation (0-100)
 * - Brightness (0-100)
 * - Color Shift Speed (0-5)
 *
 * Effects Tab:
 * - Moire Scale (0-2)
 * - Glitch Intensity (0-1)
 * - Glow Intensity (0-2)
 * - Trail Effect (0-1)
 */

import { CollapsibleDraggablePanel } from '../components/CollapsibleDraggablePanel.js';
import { ParameterSlider } from '../components/ParameterSlider.js';

console.log('✅ VisualStylePanel module loaded');

export class VisualStylePanel {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.panel = null;
        this.sliders = {};

        this.init();
    }

    init() {
        // Create panel with 2 tabs
        this.panel = new CollapsibleDraggablePanel({
            id: 'visual-style',
            title: 'VISUAL STYLE - COLORS & EFFECTS',
            icon: '🎨',
            defaultPosition: { top: 440, right: 10 }, // Below Transform panel
            defaultSize: { width: 340, height: 'auto' },
            defaultCollapsed: false, // START EXPANDED
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'color', label: 'Color', content: this.createColorTab() },
                { id: 'effects', label: 'Effects', content: this.createEffectsTab() }
            ],
            zIndex: 1000
        });

        // Wire up sliders after panel is created
        this.setupSliders();

        // Start update loop
        this.startUpdateLoop();
    }

    createColorTab() {
        return `
            <div class="tab-section">
                <div id="slider-hue-container"></div>
                <div id="slider-saturation-container"></div>
                <div id="slider-brightness-container"></div>
                <div id="slider-colorShiftSpeed-container"></div>
            </div>
        `;
    }

    createEffectsTab() {
        return `
            <div class="tab-section">
                <div id="slider-moireScale-container"></div>
                <div id="slider-glitchIntensity-container"></div>
                <div id="slider-glowIntensity-container"></div>
                <div id="slider-trailEffect-container"></div>
            </div>
        `;
    }

    setupSliders() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // Color Tab Sliders
            this.createSlider('hue', {
                label: 'Hue',
                min: 0,
                max: 360,
                step: 1,
                defaultValue: 180,
                unit: '°',
                decimals: 0
            });

            this.createSlider('saturation', {
                label: 'Saturation',
                min: 0,
                max: 100,
                step: 1,
                defaultValue: 70,
                unit: '%',
                decimals: 0
            });

            this.createSlider('brightness', {
                label: 'Brightness',
                min: 0,
                max: 100,
                step: 1,
                defaultValue: 50,
                unit: '%',
                decimals: 0
            });

            this.createSlider('colorShiftSpeed', {
                label: 'Color Shift Speed',
                min: 0,
                max: 5,
                step: 0.1,
                defaultValue: 0.5,
                unit: '',
                decimals: 1
            });

            // Effects Tab Sliders - DEFAULTS TO 0 TO NOT INTERFERE WITH FACETED GEOMETRIES
            this.createSlider('moireScale', {
                label: 'Moire Scale',
                min: 0,
                max: 2,
                step: 0.01,
                defaultValue: 0.0, // START AT 0 - no interference
                unit: '',
                decimals: 2
            });

            this.createSlider('glitchIntensity', {
                label: 'Glitch Intensity',
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.0, // START AT 0 - no interference
                unit: '',
                decimals: 2
            });

            this.createSlider('glowIntensity', {
                label: 'Glow Intensity',
                min: 0,
                max: 2,
                step: 0.01,
                defaultValue: 0.8,
                unit: '',
                decimals: 2
            });

            this.createSlider('trailEffect', {
                label: 'Trail Effect',
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.0,
                unit: '',
                decimals: 2
            });

            // Initialize with current choreographer values
            this.syncFromChoreographer();
        }, 100);
    }

    createSlider(paramName, config) {
        const slider = new ParameterSlider({
            name: paramName,
            label: config.label,
            min: config.min,
            max: config.max,
            step: config.step,
            defaultValue: config.defaultValue,
            unit: config.unit,
            decimals: config.decimals,
            onChange: (name, value) => {
                // Update choreographer when slider changes
                this.choreographer.setParameter(name, value);
                console.log(`Visual Style: ${name} = ${value}`);
            }
        });

        // Store reference
        this.sliders[paramName] = slider;

        // Append to container
        const container = document.getElementById(`slider-${paramName}-container`);
        if (container) {
            container.appendChild(slider.getElement());
        } else {
            console.warn(`Container not found for ${paramName}`);
        }
    }

    syncFromChoreographer() {
        // Update all sliders from choreographer's current values
        if (!this.choreographer || !this.choreographer.baseParams) return;

        Object.keys(this.sliders).forEach(paramName => {
            const value = this.choreographer.baseParams[paramName];
            if (value !== undefined && this.sliders[paramName]) {
                this.sliders[paramName].setValue(value);
            }
        });
    }

    startUpdateLoop() {
        // Update slider values from choreographer every 100ms
        setInterval(() => {
            this.syncFromChoreographer();
        }, 100);
    }

    show() {
        if (this.panel) this.panel.show();
    }

    hide() {
        if (this.panel) this.panel.hide();
    }

    destroy() {
        if (this.panel) this.panel.destroy();
        Object.values(this.sliders).forEach(slider => slider.destroy());
    }
}
