/**
 * KeyboardController - Comprehensive keyboard shortcuts for power users
 * Provides quick access to all major functions
 */

export class KeyboardController {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.enabled = true;
        this.shortcuts = this.getDefaultShortcuts();
        this.pressedKeys = new Set();

        this.setupEventListeners();
        console.log('⌨️ KeyboardController initialized');
    }

    /**
     * Get default keyboard shortcuts
     */
    getDefaultShortcuts() {
        return {
            // Playback controls
            'Space': {
                name: 'Play/Pause',
                action: () => this.togglePlayback(),
                category: 'playback'
            },
            'KeyS': {
                name: 'Stop',
                action: () => this.choreographer.stop(),
                category: 'playback'
            },

            // System switching
            'Digit1': {
                name: 'Switch to Faceted',
                action: () => this.choreographer.switchSystem('faceted'),
                category: 'system'
            },
            'Digit2': {
                name: 'Switch to Quantum',
                action: () => this.choreographer.switchSystem('quantum'),
                category: 'system'
            },
            'Digit3': {
                name: 'Switch to Holographic',
                action: () => this.choreographer.switchSystem('holographic'),
                category: 'system'
            },

            // Choreography modes (Shift + number)
            'shift+Digit1': {
                name: 'Chaos Mode',
                action: () => this.setMode('chaos'),
                category: 'mode'
            },
            'shift+Digit2': {
                name: 'Pulse Mode',
                action: () => this.setMode('pulse'),
                category: 'mode'
            },
            'shift+Digit3': {
                name: 'Wave Mode',
                action: () => this.setMode('wave'),
                category: 'mode'
            },
            'shift+Digit4': {
                name: 'Flow Mode',
                action: () => this.setMode('flow'),
                category: 'mode'
            },
            'shift+Digit5': {
                name: 'Dynamic Mode',
                action: () => this.setMode('dynamic'),
                category: 'mode'
            },

            // Parameter adjustments
            'ArrowUp': {
                name: 'Increase Intensity',
                action: () => this.adjustParameter('intensity', 0.1),
                category: 'parameters'
            },
            'ArrowDown': {
                name: 'Decrease Intensity',
                action: () => this.adjustParameter('intensity', -0.1),
                category: 'parameters'
            },
            'ArrowRight': {
                name: 'Increase Speed',
                action: () => this.adjustParameter('speed', 0.2),
                category: 'parameters'
            },
            'ArrowLeft': {
                name: 'Decrease Speed',
                action: () => this.adjustParameter('speed', -0.2),
                category: 'parameters'
            },
            'BracketRight': {
                name: 'Increase Grid Density',
                action: () => this.adjustParameter('gridDensity', 2),
                category: 'parameters'
            },
            'BracketLeft': {
                name: 'Decrease Grid Density',
                action: () => this.adjustParameter('gridDensity', -2),
                category: 'parameters'
            },
            'Equal': {
                name: 'Increase Chaos',
                action: () => this.adjustParameter('chaos', 0.1),
                category: 'parameters'
            },
            'Minus': {
                name: 'Decrease Chaos',
                action: () => this.adjustParameter('chaos', -0.1),
                category: 'parameters'
            },

            // Reactivity
            'KeyR': {
                name: 'Toggle Audio Reactivity',
                action: () => this.toggleReactivity(),
                category: 'audio'
            },
            'shift+KeyR': {
                name: 'Increase Reactivity',
                action: () => this.adjustReactivity(0.1),
                category: 'audio'
            },
            'ctrl+KeyR': {
                name: 'Decrease Reactivity',
                action: () => this.adjustReactivity(-0.1),
                category: 'audio'
            },

            // Export/Recording
            'KeyE': {
                name: 'Start/Stop Export',
                action: () => this.toggleExport(),
                category: 'export'
            },
            'shift+KeyE': {
                name: 'Quick Screenshot',
                action: () => this.takeScreenshot(),
                category: 'export'
            },

            // View controls
            'KeyF': {
                name: 'Toggle Fullscreen',
                action: () => this.toggleFullscreen(),
                category: 'view'
            },
            'KeyH': {
                name: 'Toggle UI',
                action: () => this.toggleUI(),
                category: 'view'
            },
            'KeyP': {
                name: 'Toggle Performance Monitor',
                action: () => this.togglePerformanceMonitor(),
                category: 'view'
            },

            // Utility
            'ctrl+KeyZ': {
                name: 'Undo Last Change',
                action: () => this.undo(),
                category: 'utility'
            },
            'ctrl+KeyS': {
                name: 'Save Current State',
                action: () => this.saveState(),
                category: 'utility'
            },
            'Escape': {
                name: 'Cancel/Close',
                action: () => this.cancel(),
                category: 'utility'
            },
            'slash': {
                name: 'Show Shortcuts Help',
                action: () => this.showHelp(),
                category: 'utility'
            }
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    /**
     * Handle keydown event
     */
    handleKeyDown(e) {
        if (!this.enabled) return;

        // Don't intercept if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        this.pressedKeys.add(e.code);

        // Build shortcut key
        const modifiers = [];
        if (e.ctrlKey) modifiers.push('ctrl');
        if (e.shiftKey) modifiers.push('shift');
        if (e.altKey) modifiers.push('alt');
        const key = [...modifiers, e.code].join('+');

        // Check for exact match first
        let shortcut = this.shortcuts[key];

        // Try without modifiers if exact match not found
        if (!shortcut && modifiers.length > 0) {
            shortcut = this.shortcuts[e.code];
        }

        if (shortcut) {
            e.preventDefault();
            try {
                shortcut.action();
                console.log(`⌨️ Executed: ${shortcut.name}`);
            } catch (error) {
                console.error(`Failed to execute ${shortcut.name}:`, error);
            }
        }
    }

    /**
     * Handle keyup event
     */
    handleKeyUp(e) {
        this.pressedKeys.delete(e.code);
    }

    /**
     * Toggle playback
     */
    togglePlayback() {
        if (this.choreographer.audioElement && !this.choreographer.audioElement.paused) {
            this.choreographer.pause();
        } else {
            this.choreographer.play().catch(e => console.error('Play failed:', e));
        }
    }

    /**
     * Set choreography mode
     */
    setMode(mode) {
        this.choreographer.choreographyMode = mode;
        console.log(`🎭 Mode set to: ${mode}`);
    }

    /**
     * Adjust parameter value
     */
    adjustParameter(param, delta) {
        const current = this.choreographer.baseParams[param] || 0;
        let newValue = current + delta;

        // Clamp values
        if (param === 'intensity' || param === 'chaos') {
            newValue = Math.max(0, Math.min(1, newValue));
        } else if (param === 'speed') {
            newValue = Math.max(0.1, Math.min(5, newValue));
        } else if (param === 'gridDensity') {
            newValue = Math.max(1, Math.min(50, newValue));
        }

        this.choreographer.baseParams[param] = newValue;

        const sys = this.choreographer.systems[this.choreographer.currentSystem];
        if (sys.engine) {
            this.choreographer.updateSystemParameters(sys.engine);
        }

        console.log(`📊 ${param} = ${newValue.toFixed(2)}`);
    }

    /**
     * Toggle audio reactivity
     */
    toggleReactivity() {
        this.choreographer.audioReactive = !this.choreographer.audioReactive;
        console.log(`🔊 Audio reactivity: ${this.choreographer.audioReactive ? 'ON' : 'OFF'}`);
    }

    /**
     * Adjust reactivity strength
     */
    adjustReactivity(delta) {
        this.choreographer.reactivityStrength = Math.max(0, Math.min(1,
            this.choreographer.reactivityStrength + delta
        ));
        console.log(`🔊 Reactivity strength: ${this.choreographer.reactivityStrength.toFixed(2)}`);
    }

    /**
     * Toggle export/recording
     */
    toggleExport() {
        // TODO: Implement when RecordingEngine is integrated
        console.log('📹 Export toggled (not yet implemented)');
    }

    /**
     * Take screenshot
     */
    takeScreenshot() {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vib34d_${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                console.log('📸 Screenshot saved');
            });
        }
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.error('Fullscreen failed:', e);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Toggle UI visibility
     */
    toggleUI() {
        const panel = document.getElementById('control-panel');
        const modeDisplay = document.getElementById('mode-display');

        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        if (modeDisplay) {
            modeDisplay.style.display = modeDisplay.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Toggle performance monitor
     */
    togglePerformanceMonitor() {
        // TODO: Implement when performance UI is added
        console.log('📊 Performance monitor toggled (UI pending)');
    }

    /**
     * Undo last change
     */
    undo() {
        // TODO: Implement state history
        console.log('↶ Undo (history system pending)');
    }

    /**
     * Save current state
     */
    saveState() {
        if (this.choreographer.presetManager) {
            const name = prompt('Enter preset name:');
            if (name) {
                this.choreographer.presetManager.saveCurrentAsPreset(name);
            }
        }
    }

    /**
     * Cancel/close dialogs
     */
    cancel() {
        // Close any open modals/dialogs
        console.log('❌ Cancel');
    }

    /**
     * Show shortcuts help
     */
    showHelp() {
        const categories = {};

        Object.entries(this.shortcuts).forEach(([key, shortcut]) => {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push({
                key: this.formatKey(key),
                name: shortcut.name
            });
        });

        console.log('⌨️ KEYBOARD SHORTCUTS:');
        Object.entries(categories).forEach(([category, shortcuts]) => {
            console.log(`\n${category.toUpperCase()}:`);
            shortcuts.forEach(s => {
                console.log(`  ${s.key.padEnd(20)} - ${s.name}`);
            });
        });

        // Also show in UI if possible
        this.showHelpUI(categories);
    }

    /**
     * Format key for display
     */
    formatKey(key) {
        return key
            .replace('shift+', '⇧ ')
            .replace('ctrl+', '⌃ ')
            .replace('alt+', '⌥ ')
            .replace('Key', '')
            .replace('Digit', '')
            .replace('Arrow', '⬆️⬇️⬅️➡️ ');
    }

    /**
     * Show help UI
     */
    showHelpUI(categories) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('shortcuts-help-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shortcuts-help-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                border: 2px solid #0ff;
                padding: 30px;
                z-index: 10000;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                display: none;
                font-family: 'Courier New', monospace;
                color: #0ff;
            `;
            document.body.appendChild(modal);
        }

        let html = '<h2 style="margin-top: 0; text-align: center;">⌨️ KEYBOARD SHORTCUTS</h2>';
        html += '<p style="text-align: center; font-size: 10px; opacity: 0.7;">Press ESC or / to close</p>';

        Object.entries(categories).forEach(([category, shortcuts]) => {
            html += `<h3 style="margin-top: 20px; color: #0ff;">${category.toUpperCase()}</h3>`;
            html += '<table style="width: 100%; font-size: 11px;">';
            shortcuts.forEach(s => {
                html += `<tr>
                    <td style="padding: 5px; color: #fff;">${s.key}</td>
                    <td style="padding: 5px;">${s.name}</td>
                </tr>`;
            });
            html += '</table>';
        });

        html += '<p style="text-align: center; margin-top: 20px;"><button onclick="this.parentElement.parentElement.style.display=\'none\'" style="background: #0ff; color: #000; border: none; padding: 10px 20px; cursor: pointer;">Close</button></p>';

        modal.innerHTML = html;
        modal.style.display = 'block';

        // Close on ESC or /
        const closeHandler = (e) => {
            if (e.key === 'Escape' || e.key === '/') {
                modal.style.display = 'none';
                window.removeEventListener('keydown', closeHandler);
            }
        };
        window.addEventListener('keydown', closeHandler);
    }

    /**
     * Enable/disable keyboard controls
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`⌨️ Keyboard controls: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Add custom shortcut
     */
    addShortcut(key, name, action, category = 'custom') {
        this.shortcuts[key] = { name, action, category };
        console.log(`⌨️ Added shortcut: ${key} -> ${name}`);
    }

    /**
     * Remove shortcut
     */
    removeShortcut(key) {
        delete this.shortcuts[key];
        console.log(`⌨️ Removed shortcut: ${key}`);
    }
}
