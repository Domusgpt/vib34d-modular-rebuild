/**
 * CanvasTouchControl - Makes the visualizer canvas itself act as a touchpad
 * Features:
 * - Invisible control (no UI clutter on canvas)
 * - Crosshair feedback (option C - thin lines during movement)
 * - Maps to X/Y parameters from XY Touchpad panel
 * - Double-tap to cycle geometry
 * - Enable/disable toggle
 */

export class CanvasTouchControl {
    constructor(canvasContainer, choreographer, xyTouchpad) {
        this.container = canvasContainer; // Container element (or any canvas)
        this.choreographer = choreographer;
        this.xyTouchpad = xyTouchpad; // Reference to XY touchpad for parameter mapping

        this.enabled = true;
        this.lastTapTime = 0;
        this.doubleTapDelay = 300; // ms

        // Crosshair overlay elements
        this.crosshairOverlay = null;
        this.crosshairH = null; // Horizontal line
        this.crosshairV = null; // Vertical line
        this.fadeTimeout = null;

        this.init();
    }

    init() {
        this.createCrosshairOverlay();
        this.attachListeners();
    }

    createCrosshairOverlay() {
        // Create overlay container
        this.crosshairOverlay = document.createElement('div');
        this.crosshairOverlay.className = 'canvas-crosshair-overlay';
        this.crosshairOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.1s ease-out;
        `;

        // Horizontal line
        this.crosshairH = document.createElement('div');
        this.crosshairH.className = 'crosshair-h';
        this.crosshairH.style.cssText = `
            position: absolute;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg,
                transparent 0%,
                rgba(0, 255, 255, 0.3) 40%,
                rgba(0, 255, 255, 0.8) 50%,
                rgba(0, 255, 255, 0.3) 60%,
                transparent 100%
            );
            box-shadow: 0 0 4px rgba(0, 255, 255, 0.6);
            top: 50%;
        `;

        // Vertical line
        this.crosshairV = document.createElement('div');
        this.crosshairV.className = 'crosshair-v';
        this.crosshairV.style.cssText = `
            position: absolute;
            top: 0;
            height: 100%;
            width: 1px;
            background: linear-gradient(180deg,
                transparent 0%,
                rgba(0, 255, 255, 0.3) 40%,
                rgba(0, 255, 255, 0.8) 50%,
                rgba(0, 255, 255, 0.3) 60%,
                transparent 100%
            );
            box-shadow: 0 0 4px rgba(0, 255, 255, 0.6);
            left: 50%;
        `;

        this.crosshairOverlay.appendChild(this.crosshairH);
        this.crosshairOverlay.appendChild(this.crosshairV);

        // Find canvas container and append overlay
        const canvasWrapper = document.getElementById('canvas-container') || this.container;
        if (canvasWrapper) {
            canvasWrapper.style.position = 'relative'; // Ensure positioning context
            canvasWrapper.appendChild(this.crosshairOverlay);
        } else {
            // Fallback: append to body with fixed positioning
            this.crosshairOverlay.style.position = 'fixed';
            document.body.appendChild(this.crosshairOverlay);
        }
    }

    attachListeners() {
        // Get the actual canvas element to listen to
        const canvas = document.querySelector('.canvas-layer') ||
                      document.getElementById('content-canvas') ||
                      this.container;

        if (!canvas) {
            console.error('CanvasTouchControl: No canvas found');
            return;
        }

        // Mouse move
        canvas.addEventListener('mousemove', (e) => this.handleMove(e));

        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        }, { passive: false });

        // Mouse leave - hide crosshair
        canvas.addEventListener('mouseleave', () => this.hideCrosshair());

        // Touch end - hide crosshair
        canvas.addEventListener('touchend', () => this.hideCrosshair());

        // Double-tap detection
        canvas.addEventListener('click', (e) => this.handleTap(e));
        canvas.addEventListener('touchend', (e) => this.handleTap(e));
    }

    handleMove(e) {
        if (!this.enabled) return;

        // Get container bounds
        const container = this.crosshairOverlay.parentElement;
        const rect = container.getBoundingClientRect();

        // Calculate normalized position (0-1)
        const clientX = e.clientX || e.pageX;
        const clientY = e.clientY || e.pageY;

        const x = (clientX - rect.left) / rect.width;
        const y = 1 - ((clientY - rect.top) / rect.height); // Inverted Y

        // Clamp to 0-1
        const normalizedX = Math.max(0, Math.min(1, x));
        const normalizedY = Math.max(0, Math.min(1, y));

        // Update crosshair position
        this.updateCrosshair(clientX - rect.left, clientY - rect.top);

        // Show crosshair
        this.showCrosshair();

        // Update parameters
        this.updateParameters(normalizedX, normalizedY);
    }

    updateCrosshair(x, y) {
        this.crosshairH.style.top = `${y}px`;
        this.crosshairV.style.left = `${x}px`;
    }

    showCrosshair() {
        this.crosshairOverlay.style.opacity = '1';

        // Clear existing fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }

        // Fade out after 150ms of no movement
        this.fadeTimeout = setTimeout(() => {
            this.hideCrosshair();
        }, 150);
    }

    hideCrosshair() {
        this.crosshairOverlay.style.opacity = '0';
    }

    updateParameters(x, y) {
        if (!this.xyTouchpad) {
            console.warn('CanvasTouchControl: No XY touchpad reference');
            return;
        }

        // Get current X/Y parameter assignments from XY touchpad
        const xParam = this.xyTouchpad.xParam; // e.g., 'speed'
        const yParam = this.xyTouchpad.yParam; // e.g., 'gridDensity'

        if (!xParam || !yParam) return;

        // Get parameter configs for range mapping
        const xConfig = this.xyTouchpad.paramConfigs[xParam];
        const yConfig = this.xyTouchpad.paramConfigs[yParam];

        if (!xConfig || !yConfig) return;

        // Map 0-1 normalized values to parameter ranges
        const xValue = xConfig.min + (x * (xConfig.max - xConfig.min));
        const yValue = yConfig.min + (y * (yConfig.max - yConfig.min));

        // Round if integer parameter
        const xFinal = xConfig.step >= 1 ? Math.round(xValue) : xValue;
        const yFinal = yConfig.step >= 1 ? Math.round(yValue) : yValue;

        // Update choreographer
        this.choreographer.setParameter(xParam, xFinal);
        this.choreographer.setParameter(yParam, yFinal);

        // Optional: Update XY touchpad cursor to match
        if (this.xyTouchpad.updateCursorPosition) {
            this.xyTouchpad.updateCursorPosition(x, y);
        }
    }

    handleTap(e) {
        if (!this.enabled) return;

        const now = performance.now();
        if (now - this.lastTapTime < this.doubleTapDelay) {
            // Double-tap detected - cycle geometry
            this.cycleGeometry();

            // Visual feedback
            this.flashCrosshair();
        }
        this.lastTapTime = now;
    }

    cycleGeometry() {
        const current = this.choreographer.baseParams.geometry;
        const next = (current % 24) + 1;
        this.choreographer.setParameter('geometry', next);
        console.log(`🔄 Canvas double-tap: Geometry cycled ${current} → ${next}`);
    }

    flashCrosshair() {
        // Quick flash animation for visual feedback
        this.crosshairOverlay.style.opacity = '1';
        this.crosshairH.style.boxShadow = '0 0 10px rgba(0, 255, 255, 1)';
        this.crosshairV.style.boxShadow = '0 0 10px rgba(0, 255, 255, 1)';

        setTimeout(() => {
            this.crosshairH.style.boxShadow = '0 0 4px rgba(0, 255, 255, 0.6)';
            this.crosshairV.style.boxShadow = '0 0 4px rgba(0, 255, 255, 0.6)';
        }, 200);
    }

    enable() {
        this.enabled = true;
        console.log('Canvas touch control enabled');
    }

    disable() {
        this.enabled = false;
        this.hideCrosshair();
        console.log('Canvas touch control disabled');
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.hideCrosshair();
        }
        console.log(`Canvas touch control: ${this.enabled ? 'ON' : 'OFF'}`);
        return this.enabled;
    }

    destroy() {
        if (this.crosshairOverlay) {
            this.crosshairOverlay.remove();
        }
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }
    }
}
