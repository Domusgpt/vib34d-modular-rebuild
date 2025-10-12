/**
 * XYTouchpad - Interactive touch/mouse control
 * X-axis: Speed (0.1 - 10)
 * Y-axis: Density (1 - 100)
 * Double-tap: Cycle geometry
 */

export class XYTouchpad {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms
        this.isDragging = false;
        this.init();
    }

    init() {
        this.createTouchpad();
        this.attachListeners();
    }

    createTouchpad() {
        const container = document.getElementById('control-panel');
        if (!container) return;

        const touchpadHTML = `
            <div id="xy-touchpad" class="xy-touchpad">
                <div class="touchpad-label-x">SPEED</div>
                <div class="touchpad-label-y">DENSITY</div>
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
        if (!touchpad || !cursor) return;

        // Mouse events
        touchpad.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', () => this.handleEnd());

        // Touch events
        touchpad.addEventListener('touchstart', (e) => {
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
        touchpad.addEventListener('click', (e) => this.handleTap(e));
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

        // Map to parameter ranges (EXTREME VALUES for audio reactivity)
        // X-axis: Speed (0.1 - 10) EXTREME
        const speed = 0.1 + (normX * 9.9);

        // Y-axis: Density (1 - 100) EXTREME
        const density = 1 + (normY * 99);

        // Update choreographer
        this.choreographer.setParameter('speed', speed);
        this.choreographer.setParameter('gridDensity', Math.round(density));

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
