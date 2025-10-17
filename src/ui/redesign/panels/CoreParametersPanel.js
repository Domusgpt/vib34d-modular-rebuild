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
            title: 'CORE PARAMETERS - POLYTOPES HERE',
            icon: '🎛️',
            defaultPosition: { top: 60, right: 700 },
            defaultSize: { width: 340, height: 'auto' },
            defaultCollapsed: false, // START EXPANDED
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'geometry', label: 'Geometry', content: this.createGeometryTab() },
                { id: 'motion', label: 'Motion', content: this.createMotionTab() }
            ],
            zIndex: 1002  // Highest
        });

        // Wire up sliders after panel is created
        this.setupSliders();

        // Start update loop
        this.startUpdateLoop();
    }

    createGeometryTab() {
        return `
            <div class="tab-section">
                <div class="param-group" style="margin-bottom: 16px;">
                    <label class="param-label" style="display: block; margin-bottom: 6px; color: #00ffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        🔮 Polytope Core
                    </label>
                    <select id="polytope-core-select" class="vib-dropdown" style="width: 100%; padding: 8px 12px; background: rgba(0, 255, 255, 0.05); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 6px; color: #00ffff; font-size: 12px; font-family: 'Orbitron', monospace; cursor: pointer; transition: all 0.3s ease;">
                        <option value="0">Hypercube (Standard Lattice)</option>
                        <option value="1">Hypersphere (Spherical Warping)</option>
                        <option value="2">Hypertetrahedron (Tetrahedral Planes)</option>
                    </select>
                </div>

                <div class="param-group" style="margin-bottom: 16px;">
                    <label class="param-label" style="display: block; margin-bottom: 6px; color: #00ffff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                        🎨 Geometry Style
                    </label>
                    <select id="geometry-style-select" class="vib-dropdown" style="width: 100%; padding: 8px 12px; background: rgba(0, 255, 255, 0.05); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 6px; color: #00ffff; font-size: 12px; font-family: 'Orbitron', monospace; cursor: pointer; transition: all 0.3s ease;">
                        <option value="0">Tetrahedron</option>
                        <option value="1">Hypercube</option>
                        <option value="2">Sphere</option>
                        <option value="3">Torus</option>
                        <option value="4">Klein Bottle</option>
                        <option value="5">Fractal</option>
                        <option value="6">Wave</option>
                        <option value="7">Crystal</option>
                    </select>
                </div>

                <div class="param-group" style="margin-bottom: 8px; padding: 8px 12px; background: rgba(0, 255, 255, 0.03); border-radius: 6px; border: 1px solid rgba(0, 255, 255, 0.2);">
                    <div style="color: #00ffff; font-size: 10px; font-family: 'Orbitron', monospace; opacity: 0.7; text-align: center;" id="geometry-name-display">
                        Hypercube Tetrahedron
                    </div>
                </div>

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
            // Setup polytope core and geometry style dropdowns
            this.setupPolytopeSelectors();

            // Geometry Tab Sliders
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

    setupPolytopeSelectors() {
        const coreSelect = document.getElementById('polytope-core-select');
        const styleSelect = document.getElementById('geometry-style-select');
        const nameDisplay = document.getElementById('geometry-name-display');

        if (!coreSelect || !styleSelect) {
            console.warn('Polytope selectors not found in DOM');
            return;
        }

        // Get core names for display
        const coreNames = ['Hypercube', 'Hypersphere', 'Hypertetrahedron'];
        const styleNames = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus', 'Klein Bottle', 'Fractal', 'Wave', 'Crystal'];

        const updateGeometry = () => {
            const coreIndex = parseInt(coreSelect.value);
            const styleIndex = parseInt(styleSelect.value);

            // Calculate geometry type: styleIndex + (coreIndex * 8)
            const geometryType = styleIndex + (coreIndex * 8);

            // Update choreographer
            this.choreographer.setParameter('geometry', geometryType);

            // Update display name
            if (nameDisplay) {
                nameDisplay.textContent = `${coreNames[coreIndex]} ${styleNames[styleIndex]}`;
            }

            console.log(`Polytope: Core=${coreNames[coreIndex]}, Style=${styleNames[styleIndex]}, Type=${geometryType}`);
        };

        // Add change listeners
        coreSelect.addEventListener('change', updateGeometry);
        styleSelect.addEventListener('change', updateGeometry);

        // Initialize from current geometry value
        if (this.choreographer && this.choreographer.baseParams) {
            const currentGeometry = this.choreographer.baseParams.geometry || 0;
            const currentCore = Math.floor(currentGeometry / 8);
            const currentStyle = currentGeometry % 8;

            coreSelect.value = currentCore;
            styleSelect.value = currentStyle;

            if (nameDisplay) {
                nameDisplay.textContent = `${coreNames[currentCore]} ${styleNames[currentStyle]}`;
            }
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

        // Update polytope selectors
        const coreSelect = document.getElementById('polytope-core-select');
        const styleSelect = document.getElementById('geometry-style-select');
        const nameDisplay = document.getElementById('geometry-name-display');

        if (coreSelect && styleSelect && this.choreographer.baseParams.geometry !== undefined) {
            const currentGeometry = this.choreographer.baseParams.geometry;
            const currentCore = Math.floor(currentGeometry / 8);
            const currentStyle = currentGeometry % 8;

            coreSelect.value = currentCore;
            styleSelect.value = currentStyle;

            const coreNames = ['Hypercube', 'Hypersphere', 'Hypertetrahedron'];
            const styleNames = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus', 'Klein Bottle', 'Fractal', 'Wave', 'Crystal'];

            if (nameDisplay) {
                nameDisplay.textContent = `${coreNames[currentCore]} ${styleNames[currentStyle]}`;
            }
        }
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
