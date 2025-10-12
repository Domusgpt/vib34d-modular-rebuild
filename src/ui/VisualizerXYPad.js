/**
 * VisualizerXYPad - Invisible XY control overlay on visualization canvas
 * X-axis: Speed (0.1 - 10) - FIXED
 * Y-axis: Density (1 - 100) - FIXED
 * No UI or styling, pure functionality
 */

export class VisualizerXYPad {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.isDragging = false;
        this.init();
    }

    init() {
        this.attachToCanvas();
    }

    attachToCanvas() {
        const stageContainer = document.getElementById('stage-container');
        if (!stageContainer) {
            console.warn('⚠️ stage-container not found for VisualizerXYPad');
            return;
        }

        // Mouse events
        stageContainer.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', () => this.handleEnd());

        // Touch events
        stageContainer.addEventListener('touchstart', (e) => {
            // Don't prevent default - let visualization handle touch too
            this.handleStart(e.touches[0]);
        });
        stageContainer.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.handleMove(e.touches[0]);
            }
        });
        stageContainer.addEventListener('touchend', () => {
            this.handleEnd();
        });

        console.log('✅ VisualizerXYPad attached to canvas');
    }

    handleStart(e) {
        // Only activate if clicking on the visualization canvas, not UI elements
        if (e.target.id !== 'stage-container' && !e.target.closest('#stage-container canvas')) {
            return;
        }
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

    updateFromPosition(e) {
        const stageContainer = document.getElementById('stage-container');
        if (!stageContainer) return;

        const rect = stageContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize to 0-1
        const normX = Math.max(0, Math.min(1, x / rect.width));
        const normY = Math.max(0, Math.min(1, 1 - (y / rect.height))); // Invert Y

        // FIXED MAPPING:
        // X-axis: Speed (0.1 - 10)
        const speed = 0.1 + (normX * 9.9);

        // Y-axis: Density (1 - 100)
        const density = 1 + (normY * 99);

        // Update choreographer (no UI feedback)
        this.choreographer.setParameter('speed', speed);
        this.choreographer.setParameter('gridDensity', Math.round(density));
    }
}
