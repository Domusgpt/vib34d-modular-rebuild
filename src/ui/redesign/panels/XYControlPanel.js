/**
 * XYControlPanel - Floating XY touchpad with parameter mapping
 * Tab: [XY Pad]
 *
 * Features:
 * - Interactive XY touchpad area
 * - X-axis parameter dropdown mapping
 * - Y-axis parameter dropdown mapping
 * - Visual feedback on touch/drag
 * - Real-time parameter updates
 */

import { CollapsibleDraggablePanel } from '../components/CollapsibleDraggablePanel.js';

export class XYControlPanel {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.panel = null;
        this.padElement = null;
        this.cursorElement = null;
        this.xDropdown = null;
        this.yDropdown = null;

        // Parameter mappings - Default to 4D rotations for intuitive control
        this.xParam = 'rotationXW';  // Horizontal touch = XW plane rotation (4D)
        this.yParam = 'rotationYW';  // Vertical touch = YW plane rotation (4D)

        // Touch state
        this.isActive = false;
        this.currentX = 0.5; // 0-1 normalized
        this.currentY = 0.5; // 0-1 normalized

        this.init();
    }

    init() {
        // Create panel with XY pad content
        this.panel = new CollapsibleDraggablePanel({
            id: 'xy-control',
            title: 'XY CONTROL',
            icon: '🎯',
            defaultPosition: 'auto',
            defaultSize: { width: 320, height: 'auto' },
            defaultCollapsed: true, // Start collapsed
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'xypad', label: 'XY Pad', content: this.createXYPadTab() }
            ],
            zIndex: 1001 // Higher than other panels
        });

        // Wire up touchpad after panel is created
        setTimeout(() => {
            this.setupXYPad();
            this.setupDropdowns();
        }, 100);
    }

    createXYPadTab() {
        return `
            <div class="tab-section">
                <!-- Parameter Mapping Controls -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <label style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7);">X-AXIS:</label>
                        <select id="xy-x-param" class="vib-dropdown" style="width: 60%; font-size: 11px;">
                            <option value="rotationXW" selected>Rotation XW (4D)</option>
                            <option value="rotationXY">Rotation XY</option>
                            <option value="rotationXZ">Rotation XZ</option>
                            <option value="rotationZW">Rotation ZW (4D)</option>
                            <option value="speed">Speed</option>
                            <option value="chaos">Chaos</option>
                            <option value="gridDensity">Grid Density</option>
                            <option value="morphFactor">Morph Factor</option>
                            <option value="hue">Hue</option>
                            <option value="saturation">Saturation</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <label style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7);">Y-AXIS:</label>
                        <select id="xy-y-param" class="vib-dropdown" style="width: 60%; font-size: 11px;">
                            <option value="rotationYW" selected>Rotation YW (4D)</option>
                            <option value="rotationYZ">Rotation YZ</option>
                            <option value="rotationXW">Rotation XW (4D)</option>
                            <option value="rotationZW">Rotation ZW (4D)</option>
                            <option value="speed">Speed</option>
                            <option value="chaos">Chaos</option>
                            <option value="gridDensity">Grid Density</option>
                            <option value="morphFactor">Morph Factor</option>
                            <option value="brightness">Brightness</option>
                            <option value="glowIntensity">Glow Intensity</option>
                        </select>
                    </div>
                </div>

                <!-- XY Touchpad Area -->
                <div id="xy-touchpad" style="
                    position: relative;
                    width: 100%;
                    height: 280px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 6px;
                    cursor: crosshair;
                    overflow: hidden;
                ">
                    <!-- Grid lines -->
                    <div style="
                        position: absolute;
                        top: 0; left: 0;
                        width: 100%; height: 100%;
                        background:
                            linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px);
                        background-size: 25% 25%;
                        pointer-events: none;
                    "></div>

                    <!-- Center crosshair -->
                    <div style="
                        position: absolute;
                        top: 50%; left: 0;
                        width: 100%; height: 1px;
                        background: rgba(255,255,255,0.1);
                        pointer-events: none;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 0; left: 50%;
                        width: 1px; height: 100%;
                        background: rgba(255,255,255,0.1);
                        pointer-events: none;
                    "></div>

                    <!-- Touch cursor -->
                    <div id="xy-cursor" style="
                        position: absolute;
                        width: 20px; height: 20px;
                        border: 2px solid rgba(0, 255, 255, 0.8);
                        border-radius: 50%;
                        background: rgba(0, 255, 255, 0.2);
                        box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
                        pointer-events: none;
                        transform: translate(-50%, -50%);
                        left: 50%; top: 50%;
                        transition: all 0.05s ease-out;
                    "></div>
                </div>

                <!-- Value Display -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-family: 'Space Mono', monospace;
                    font-size: 11px;
                    color: rgba(0, 255, 255, 0.8);
                ">
                    <div id="xy-x-value">X: 0.50</div>
                    <div id="xy-y-value">Y: 0.50</div>
                </div>
            </div>
        `;
    }

    setupXYPad() {
        this.padElement = document.getElementById('xy-touchpad');
        this.cursorElement = document.getElementById('xy-cursor');

        if (!this.padElement || !this.cursorElement) {
            console.warn('XY touchpad elements not found');
            return;
        }

        // Touch/Mouse events
        this.padElement.addEventListener('mousedown', (e) => this.onTouchStart(e));
        this.padElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });

        document.addEventListener('mousemove', (e) => this.onTouchMove(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        document.addEventListener('mouseup', () => this.onTouchEnd());
        document.addEventListener('touchend', () => this.onTouchEnd());
    }

    setupDropdowns() {
        this.xDropdown = document.getElementById('xy-x-param');
        this.yDropdown = document.getElementById('xy-y-param');

        if (!this.xDropdown || !this.yDropdown) {
            console.warn('XY param dropdowns not found');
            return;
        }

        // Set initial values
        this.xDropdown.value = this.xParam;
        this.yDropdown.value = this.yParam;

        // Listen for changes
        this.xDropdown.addEventListener('change', (e) => {
            this.xParam = e.target.value;
            console.log('XY Control: X-axis mapped to', this.xParam);
        });

        this.yDropdown.addEventListener('change', (e) => {
            this.yParam = e.target.value;
            console.log('XY Control: Y-axis mapped to', this.yParam);
        });
    }

    onTouchStart(e) {
        e.preventDefault();
        this.isActive = true;
        this.updatePosition(e);

        // Visual feedback
        this.cursorElement.style.borderWidth = '3px';
        this.cursorElement.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.8)';
    }

    onTouchMove(e) {
        if (!this.isActive) return;
        e.preventDefault();
        this.updatePosition(e);
    }

    onTouchEnd() {
        if (!this.isActive) return;
        this.isActive = false;

        // Visual feedback
        this.cursorElement.style.borderWidth = '2px';
        this.cursorElement.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.6)';
    }

    updatePosition(e) {
        if (!this.padElement) return;

        const rect = this.padElement.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Calculate normalized position (0-1)
        let x = (clientX - rect.left) / rect.width;
        let y = 1 - (clientY - rect.top) / rect.height; // Invert Y

        // Clamp to 0-1
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        this.currentX = x;
        this.currentY = y;

        // Update cursor position
        this.cursorElement.style.left = `${x * 100}%`;
        this.cursorElement.style.top = `${(1 - y) * 100}%`;

        // Update value displays
        document.getElementById('xy-x-value').textContent = `X: ${x.toFixed(2)}`;
        document.getElementById('xy-y-value').textContent = `Y: ${y.toFixed(2)}`;

        // Update parameters
        this.updateParameters(x, y);
    }

    updateParameters(x, y) {
        if (!this.choreographer || !this.choreographer.baseParams) return;

        // Get parameter configs
        const xParamConfig = this.getParameterConfig(this.xParam);
        const yParamConfig = this.getParameterConfig(this.yParam);

        if (xParamConfig) {
            const xValue = xParamConfig.min + (x * (xParamConfig.max - xParamConfig.min));
            this.choreographer.setParameter(this.xParam, xValue);
        }

        if (yParamConfig) {
            const yValue = yParamConfig.min + (y * (yParamConfig.max - yParamConfig.min));
            this.choreographer.setParameter(this.yParam, yValue);
        }
    }

    getParameterConfig(paramName) {
        const configs = {
            'speed': { min: 0.1, max: 10 },
            'chaos': { min: 0, max: 3 },
            'gridDensity': { min: 1, max: 100 },
            'morphFactor': { min: 0, max: 5 },
            'rotationXY': { min: -180, max: 180 },
            'rotationXZ': { min: -180, max: 180 },
            'rotationXW': { min: -180, max: 180 },  // 4D rotation
            'rotationYZ': { min: -180, max: 180 },
            'rotationYW': { min: -180, max: 180 },  // 4D rotation
            'rotationZW': { min: -180, max: 180 },  // 4D rotation
            'hue': { min: 0, max: 360 },
            'saturation': { min: 0, max: 100 },
            'brightness': { min: 0, max: 100 },
            'glowIntensity': { min: 0, max: 2 }
        };
        return configs[paramName];
    }

    show() {
        if (this.panel) this.panel.show();
    }

    hide() {
        if (this.panel) this.panel.hide();
    }

    destroy() {
        if (this.panel) this.panel.destroy();
    }
}
