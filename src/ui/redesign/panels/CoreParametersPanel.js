/**
 * CoreParametersPanel - Primary geometry and motion controls
 * Tabs: [Geometry] [Motion]
 *
 * Geometry Tab:
 * - Geometry Type (1-24)
 * - Grid Density (1-100)
 * - Morph Factor (0-5)
 * - Line Thickness (0.01-0.1)
 *
 * Motion Tab:
 * - Speed (0.1-10)
 * - Chaos (0-3)
 */

import { CollapsibleDraggablePanel } from '../components/CollapsibleDraggablePanel.js';
import { ParameterSlider } from '../components/ParameterSlider.js';

export class CoreParametersPanel {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.panel = null;
        this.sliders = {};

        this.init();
    }

    init() {
        // Create panel with 2 tabs
        this.panel = new CollapsibleDraggablePanel({
            id: 'core-params',
            title: 'CORE PARAMETERS',
            icon: '🎛️',
            defaultPosition: 'auto',
            defaultSize: { width: 320, height: 'auto' },
            defaultCollapsed: false, // Start expanded (main panel)
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'geometry', label: 'Geometry', content: this.createGeometryTab() },
                { id: 'motion', label: 'Motion', content: this.createMotionTab() }
            ],
            zIndex: 1000
        });

        // Wire up sliders after panel is created
        this.setupSliders();

        // Start update loop
        this.startUpdateLoop();
    }

    createGeometryTab() {
        return `
            <div class="tab-section">
                <div id="slider-geometry-container"></div>
                <div id="slider-gridDensity-container"></div>
                <div id="slider-morphFactor-container"></div>
                <div id="slider-lineThickness-container"></div>
            </div>
        `;
    }

    createMotionTab() {
        return `
            <div class="tab-section">
                <div id="slider-speed-container"></div>
                <div id="slider-chaos-container"></div>
            </div>
        `;
    }

    setupSliders() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // Geometry Tab Sliders
            this.createSlider('geometry', {
                label: 'Geometry Type',
                min: 1,
                max: 24,
                step: 1,
                defaultValue: 1,
                unit: '',
                decimals: 0
            });

            this.createSlider('gridDensity', {
                label: 'Grid Density',
                min: 1,
                max: 100,
                step: 1,
                defaultValue: 15,
                unit: '',
                decimals: 0
            });

            this.createSlider('morphFactor', {
                label: 'Morph Factor',
                min: 0,
                max: 5,
                step: 0.01,
                defaultValue: 1.0,
                unit: '',
                decimals: 2
            });

            this.createSlider('lineThickness', {
                label: 'Line Thickness',
                min: 0.01,
                max: 0.1,
                step: 0.005,
                defaultValue: 0.02,
                unit: '',
                decimals: 3
            });

            // Motion Tab Sliders
            this.createSlider('speed', {
                label: 'Speed',
                min: 0.1,
                max: 10,
                step: 0.1,
                defaultValue: 1.0,
                unit: '',
                decimals: 1
            });

            this.createSlider('chaos', {
                label: 'Chaos',
                min: 0,
                max: 3,
                step: 0.01,
                defaultValue: 0.2,
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
                console.log(`Core Params: ${name} = ${value}`);
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
        // This keeps UI in sync if parameters change elsewhere
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
