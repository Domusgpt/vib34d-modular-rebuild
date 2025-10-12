/**
 * XYTouchpad - Interactive touch/mouse control with configurable parameters
 * Dropdowns allow assignment of any parameter to X/Y axes
 * Double-tap: Cycle geometry
 */

export class XYTouchpad {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms
        this.isDragging = false;

        // Default parameter assignments
        this.xParam = 'speed';
        this.yParam = 'gridDensity';

        // Parameter configurations
        this.paramConfigs = {
            geometry: { min: 1, max: 24, step: 1, label: 'Geometry' },
            gridDensity: { min: 1, max: 100, step: 1, label: 'Grid Density' },
            morphFactor: { min: 0, max: 5, step: 0.01, label: 'Morph Factor' },
            chaos: { min: 0, max: 3, step: 0.01, label: 'Chaos' },
            speed: { min: 0.1, max: 10, step: 0.1, label: 'Speed' },
            hue: { min: 0, max: 360, step: 1, label: 'Hue' },
            intensity: { min: 0, max: 1, step: 0.01, label: 'Intensity' },
            saturation: { min: 0, max: 1, step: 0.01, label: 'Saturation' },
            rot4dXW: { min: -3.14159, max: 3.14159, step: 0.01, label: '4D XW' },
            rot4dYW: { min: -3.14159, max: 3.14159, step: 0.01, label: '4D YW' },
            rot4dZW: { min: -3.14159, max: 3.14159, step: 0.01, label: '4D ZW' }
        };

        this.init();
    }

    init() {
        this.createTouchpad();
        this.attachListeners();
    }

    createTouchpad() {
        const container = document.getElementById('control-panel');
        if (!container) return;

        // Generate parameter options
        const paramOptions = Object.keys(this.paramConfigs).map(key =>
            `<option value="${key}" ${key === 'speed' ? 'selected' : ''}>${this.paramConfigs[key].label}</option>`
        ).join('');

        const paramOptionsY = Object.keys(this.paramConfigs).map(key =>
            `<option value="${key}" ${key === 'gridDensity' ? 'selected' : ''}>${this.paramConfigs[key].label}</option>`
        ).join('');

        const touchpadHTML = `
            <div id="xy-touchpad" class="xy-touchpad">
                <div class="touchpad-controls">
                    <div class="touchpad-dropdown-wrapper">
                        <label>X:</label>
                        <select id="xy-param-x" class="touchpad-dropdown">
                            ${paramOptions}
                        </select>
                    </div>
                    <div class="touchpad-dropdown-wrapper">
                        <label>Y:</label>
                        <select id="xy-param-y" class="touchpad-dropdown">
                            ${paramOptionsY}
                        </select>
                    </div>
                </div>
                <div class="touchpad-cursor"></div>
                <div class="touchpad-hint">Double-tap to cycle geometry</div>
            </div>
        `;

        // Insert at top of control panel
        const h2 = container.querySelector('h2');
        if (h2) {
            h2.insertAdjacentHTML('afterend', touchpadHTML);
        }
    }

    attachListeners() {
        const touchpad = document.getElementById('xy-touchpad');
        const cursor = touchpad?.querySelector('.touchpad-cursor');
        const xDropdown = document.getElementById('xy-param-x');
        const yDropdown = document.getElementById('xy-param-y');

        if (!touchpad || !cursor) return;

        // Dropdown change handlers
        if (xDropdown) {
            xDropdown.addEventListener('change', (e) => {
                this.xParam = e.target.value;
                console.log(`XY Pad X-axis → ${this.paramConfigs[this.xParam].label}`);
            });
        }

        if (yDropdown) {
            yDropdown.addEventListener('change', (e) => {
                this.yParam = e.target.value;
                console.log(`XY Pad Y-axis → ${this.paramConfigs[this.yParam].label}`);
            });
        }

        // Mouse events
        touchpad.addEventListener('mousedown', (e) => {
            // Don't trigger on dropdown clicks
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
            this.handleStart(e);
        });
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', () => this.handleEnd());

        // Touch events
        touchpad.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'SELECT') return;
            e.preventDefault();
            this.handleStart(e.touches[0]);
        });
        touchpad.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        });
        touchpad.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd();
        });

        // Double-tap detection
        touchpad.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
            this.handleTap(e);
        });
    }

    handleStart(e) {
        this.isDragging = true;
        this.updateFromPosition(e);
    }

    handleMove(e) {
        if (!this.isDragging) return;
        this.updateFromPosition(e);
    }

    handleEnd() {
        this.isDragging = false;
    }

    handleTap(e) {
        const now = performance.now();
        if (now - this.lastTapTime < this.doubleTapDelay) {
            // Double-tap detected - cycle geometry
            this.cycleGeometry();
        }
        this.lastTapTime = now;
    }

    updateFromPosition(e) {
        const touchpad = document.getElementById('xy-touchpad');
        const cursor = touchpad?.querySelector('.touchpad-cursor');
        if (!touchpad || !cursor) return;

        const rect = touchpad.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize to 0-1
        const normX = Math.max(0, Math.min(1, x / rect.width));
        const normY = Math.max(0, Math.min(1, 1 - (y / rect.height))); // Invert Y

        // Get current parameter configs
        const xConfig = this.paramConfigs[this.xParam];
        const yConfig = this.paramConfigs[this.yParam];

        // Map to parameter ranges
        const xValue = xConfig.min + (normX * (xConfig.max - xConfig.min));
        const yValue = yConfig.min + (normY * (yConfig.max - yConfig.min));

        // Round if integer parameter
        const xFinal = xConfig.step >= 1 ? Math.round(xValue) : xValue;
        const yFinal = yConfig.step >= 1 ? Math.round(yValue) : yValue;

        // Update choreographer
        this.choreographer.setParameter(this.xParam, xFinal);
        this.choreographer.setParameter(this.yParam, yFinal);

        // Update cursor position
        cursor.style.left = `${normX * 100}%`;
        cursor.style.top = `${(1 - normY) * 100}%`;

        // Update visual feedback
        touchpad.style.background = `
            radial-gradient(
                circle at ${normX * 100}% ${(1 - normY) * 100}%,
                rgba(0, 255, 255, 0.3),
                rgba(0, 255, 255, 0.05)
            )
        `;
    }

    cycleGeometry() {
        const currentGeometry = this.choreographer.baseParams.geometry;
        const nextGeometry = (currentGeometry % 24) + 1; // Cycle 1-24
        this.choreographer.setParameter('geometry', nextGeometry);

        // Visual feedback
        const touchpad = document.getElementById('xy-touchpad');
        if (touchpad) {
            touchpad.classList.add('geometry-cycle-flash');
            setTimeout(() => {
                touchpad.classList.remove('geometry-cycle-flash');
            }, 200);
        }

        console.log(`🔄 Geometry cycled: ${currentGeometry} → ${nextGeometry}`);
    }

    updateCursorFromParams() {
        const touchpad = document.getElementById('xy-touchpad');
        const cursor = touchpad?.querySelector('.touchpad-cursor');
        if (!touchpad || !cursor) return;

        const speed = this.choreographer.baseParams.speed;
        const density = this.choreographer.baseParams.gridDensity;

        // Reverse map to normalized values
        const normX = (speed - 0.1) / 9.9;
        const normY = (density - 1) / 99;

        cursor.style.left = `${normX * 100}%`;
        cursor.style.top = `${(1 - normY) * 100}%`;
    }
}
