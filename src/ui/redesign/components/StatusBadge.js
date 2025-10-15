/**
 * StatusBadge - Minimal corner status display
 * Shows: Current system, audio status, extreme mode
 * Position: Bottom-right corner
 * Size: Small as possible, out of the way
 */

export class StatusBadge {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.element = null;
        this.systemElement = null;
        this.audioIcon = null;
        this.extremeIcon = null;

        this.init();
    }

    init() {
        this.createElement();
        this.attachListeners();
        this.update();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'status-badge';
        this.element.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            background: rgba(10, 10, 20, 0.9);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 6px;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
            font-family: 'Orbitron', monospace;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.9);
            z-index: 9999;
            opacity: 0.8;
            transition: all 0.2s ease;
            cursor: pointer;
            user-select: none;
        `;

        this.element.innerHTML = `
            <span class="system-name" id="status-system">FACETED</span>
            <span class="audio-icon" id="status-audio" style="display:none; margin-left: 6px;">🔊</span>
            <span class="extreme-icon" id="status-extreme" style="display:none; margin-left: 4px;">⚡</span>
        `;

        this.systemElement = this.element.querySelector('#status-system');
        this.audioIcon = this.element.querySelector('#status-audio');
        this.extremeIcon = this.element.querySelector('#status-extreme');

        // Hover effect
        this.element.addEventListener('mouseenter', () => {
            this.element.style.opacity = '1';
            this.element.style.transform = 'scale(1.05)';
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.opacity = '0.8';
            this.element.style.transform = 'scale(1)';
        });

        document.body.appendChild(this.element);
    }

    attachListeners() {
        // Update every 500ms
        setInterval(() => this.update(), 500);
    }

    update() {
        if (!this.choreographer) return;

        // Update system name and color
        const system = this.choreographer.currentSystem || 'FACETED';
        this.systemElement.textContent = system;

        // Apply system color
        this.element.classList.remove('system-faceted', 'system-quantum', 'system-holographic');
        this.element.classList.add(`system-${system.toLowerCase()}`);

        // Update border color based on system
        const colorMap = {
            'FACETED': 'rgba(0, 255, 255, 0.5)',
            'QUANTUM': 'rgba(136, 0, 255, 0.5)',
            'HOLOGRAPHIC': 'rgba(255, 0, 255, 0.5)'
        };
        this.element.style.borderColor = colorMap[system] || 'rgba(0, 255, 255, 0.3)';
        this.element.style.boxShadow = `0 0 10px ${colorMap[system] || 'rgba(0, 255, 255, 0.3)'}`;

        // Update audio reactive indicator
        if (window.audioEnabled && this.choreographer.audioReactive) {
            this.audioIcon.style.display = 'inline';
        } else {
            this.audioIcon.style.display = 'none';
        }

        // Update extreme mode indicator
        if (this.choreographer.extremeMode) {
            this.extremeIcon.style.display = 'inline';
            // Add red glow when extreme mode is on
            this.element.style.boxShadow = `0 0 15px rgba(255, 68, 68, 0.5)`;
        } else {
            this.extremeIcon.style.display = 'none';
        }
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }
}
