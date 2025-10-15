/**
 * TransformPanel - 4D rotation and transformation controls
 * Tab: [4D Rotation]
 *
 * 4D Rotation Tab:
 * - XY Rotation (-180 to 180)
 * - XZ Rotation (-180 to 180)
 * - XW Rotation (-180 to 180)
 * - YZ Rotation (-180 to 180)
 * - YW Rotation (-180 to 180)
 * - ZW Rotation (-180 to 180)
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
                <div id="slider-rotationXY-container"></div>
                <div id="slider-rotationXZ-container"></div>
                <div id="slider-rotationXW-container"></div>
                <div id="slider-rotationYZ-container"></div>
                <div id="slider-rotationYW-container"></div>
                <div id="slider-rotationZW-container"></div>
            </div>
        `;
    }

    setupSliders() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // 4D Rotation Sliders
            this.createSlider('rotationXY', {
                label: 'XY Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rotationXZ', {
                label: 'XZ Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rotationXW', {
                label: 'XW Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rotationYZ', {
                label: 'YZ Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rotationYW', {
                label: 'YW Rotation',
                min: -180,
                max: 180,
                step: 1,
                defaultValue: 0,
                unit: '°',
                decimals: 0
            });

            this.createSlider('rotationZW', {
                label: 'ZW Rotation',
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
                // Update choreographer when slider changes
                this.choreographer.setParameter(name, value);
                console.log(`Transform: ${name} = ${value}`);
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
