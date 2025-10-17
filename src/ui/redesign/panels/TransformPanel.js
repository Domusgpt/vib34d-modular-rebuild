/**
 * TransformPanel - 4D rotation and transformation controls
 * Tab: [4D Rotation]
 *
 * 4D Rotation Tab:
 * - XY Rotation (-180 to 180)
 * - XZ Rotation (-180 to 180)
 * - XW Rotation (-180 to 180) - 4D
 * - YZ Rotation (-180 to 180)
 * - YW Rotation (-180 to 180) - 4D
 * - ZW Rotation (-180 to 180) - 4D
 */

import { CollapsibleDraggablePanel } from '../components/CollapsibleDraggablePanel.js';
import { ParameterSlider } from '../components/ParameterSlider.js';

export class TransformPanel {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.panel = null;
        this.sliders = {};

        this.init();
    }

    init() {
        // Create panel with 1 tab
        this.panel = new CollapsibleDraggablePanel({
            id: 'transform',
            title: 'TRANSFORM',
            icon: '🔄',
            defaultPosition: 'auto',
            defaultSize: { width: 320, height: 'auto' },
            defaultCollapsed: true, // Start collapsed
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'rotation', label: '4D Rotation', content: this.createRotationTab() }
            ],
            zIndex: 1000
        });

        // Wire up sliders after panel is created
        this.setupSliders();

        // Start update loop
        this.startUpdateLoop();
    }

    createRotationTab() {
        return `
            <div class="tab-section">
                <div id="slider-rot4dXY-container"></div>
                <div id="slider-rot4dXZ-container"></div>
                <div id="slider-rot4dXW-container"></div>
                <div id="slider-rot4dYZ-container"></div>
                <div id="slider-rot4dYW-container"></div>
                <div id="slider-rot4dZW-container"></div>
            </div>
        `;
    }

    setupSliders() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // 4D Rotation Sliders - FIXED: Use correct parameter names that match Choreographer
            this.createSlider('rot4dXY', {
                label: 'XY Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rot4dXZ', {
                label: 'XZ Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rot4dXW', {
                label: 'XW Rotation (4D)',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rot4dYZ', {
                label: 'YZ Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rot4dYW', {
                label: 'YW Rotation (4D)',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rot4dZW', {
                label: 'ZW Rotation (4D)',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
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
                // Convert degrees to radians for shader
                const radians = (value * Math.PI) / 180.0;
                // Update choreographer when slider changes
                this.choreographer.setParameter(name, radians);
                console.log(`Transform: ${name} = ${value}° (${radians.toFixed(3)} rad)`);
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
                // Convert radians back to degrees for display
                const degrees = (value * 180.0) / Math.PI;
                this.sliders[paramName].setValue(degrees);
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
