/**
 * Canvas Layer Manager
 * Manages 5-layer canvas systems with smart initialization and destruction
 *
 * Each visualization system uses 5 layered canvases:
 * - background: Lowest layer (reactivity: 0.4-0.5)
 * - shadow: Shadow effects (reactivity: 0.6-0.7)
 * - content: Main content (reactivity: 0.9-1.0)
 * - highlight: Bright highlights (reactivity: 1.1-1.3)
 * - accent: Top layer accents (reactivity: 1.5-1.6)
 *
 * 🌟 A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */

export class CanvasLayerManager {
    constructor(containerElement) {
        this.container = containerElement;
        this.activeLayers = new Map(); // systemName -> { canvases: [], wrapper: element }
        this.layerDefinitions = {
            faceted: [
                { id: 'background-canvas', role: 'background', reactivity: 0.5 },
                { id: 'shadow-canvas', role: 'shadow', reactivity: 0.7 },
                { id: 'content-canvas', role: 'content', reactivity: 0.9 },
                { id: 'highlight-canvas', role: 'highlight', reactivity: 1.1 },
                { id: 'accent-canvas', role: 'accent', reactivity: 1.5 }
            ],
            quantum: [
                { id: 'quantum-background-canvas', role: 'background', reactivity: 0.4 },
                { id: 'quantum-shadow-canvas', role: 'shadow', reactivity: 0.6 },
                { id: 'quantum-content-canvas', role: 'content', reactivity: 1.0 },
                { id: 'quantum-highlight-canvas', role: 'highlight', reactivity: 1.3 },
                { id: 'quantum-accent-canvas', role: 'accent', reactivity: 1.6 }
            ],
            holographic: [
                { id: 'holo-background-canvas', role: 'background', reactivity: 0.5 },
                { id: 'holo-shadow-canvas', role: 'shadow', reactivity: 0.7 },
                { id: 'holo-content-canvas', role: 'content', reactivity: 0.9 },
                { id: 'holo-highlight-canvas', role: 'highlight', reactivity: 1.1 },
                { id: 'holo-accent-canvas', role: 'accent', reactivity: 1.5 }
            ]
        };
    }

    /**
     * Create 5-layer canvas system for a given visualization system
     * @param {string} systemName - 'faceted', 'quantum', or 'holographic'
     * @returns {Object} { canvases: Canvas[], layerSpecs: Object[] }
     */
    createLayers(systemName) {
        // If layers already exist, destroy them first
        if (this.activeLayers.has(systemName)) {
            console.warn(`⚠️ Layers for ${systemName} already exist, destroying old ones...`);
            this.destroyLayers(systemName);
        }

        const specs = this.layerDefinitions[systemName];
        if (!specs) {
            throw new Error(`Unknown system: ${systemName}`);
        }

        // Create wrapper div for this system
        const wrapper = document.createElement('div');
        wrapper.id = `${systemName}Layers`;
        wrapper.className = 'canvas-layer-system';
        wrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        const canvases = [];
        const layerSpecs = [];

        specs.forEach((spec, index) => {
            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.id = spec.id;
            canvas.className = `layer-${spec.role}`;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${index + 1};
                pointer-events: none;
            `;

            wrapper.appendChild(canvas);
            canvases.push(canvas);
            layerSpecs.push({
                canvas,
                id: spec.id,
                role: spec.role,
                reactivity: spec.reactivity,
                index
            });

            console.log(`✅ Created layer ${index + 1}/5: ${spec.id} (${spec.role})`);
        });

        // Add wrapper to container
        this.container.appendChild(wrapper);

        // Store reference
        this.activeLayers.set(systemName, {
            canvases,
            layerSpecs,
            wrapper
        });

        console.log(`🎨 Created ${canvases.length}-layer system for: ${systemName}`);

        return { canvases, layerSpecs };
    }

    /**
     * Destroy 5-layer canvas system for a given visualization system
     * CRITICAL: Properly cleans up WebGL contexts to prevent memory leaks
     */
    destroyLayers(systemName) {
        const system = this.activeLayers.get(systemName);
        if (!system) {
            console.warn(`⚠️ No layers to destroy for: ${systemName}`);
            return;
        }

        console.log(`🧹 Destroying ${system.canvases.length} layers for: ${systemName}`);

        // Clean up each canvas
        system.canvases.forEach((canvas, index) => {
            // CRITICAL: Lose WebGL context before removing
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
            if (gl) {
                const loseContext = gl.getExtension('WEBGL_lose_context');
                if (loseContext) {
                    loseContext.loseContext();
                    console.log(`🧹 Lost WebGL context for layer ${index + 1}`);
                }
            }

            // Clear 2D context if present
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // Remove canvas from DOM
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });

        // Remove wrapper from DOM
        if (system.wrapper && system.wrapper.parentNode) {
            system.wrapper.parentNode.removeChild(system.wrapper);
        }

        // Remove from active layers
        this.activeLayers.delete(systemName);

        console.log(`✅ Destroyed all layers for: ${systemName}`);
    }

    /**
     * Switch from one system to another with proper cleanup
     */
    switchSystem(fromSystem, toSystem) {
        console.log(`🔄 Switching from ${fromSystem} to ${toSystem}...`);

        // Destroy old system
        if (fromSystem && this.activeLayers.has(fromSystem)) {
            this.destroyLayers(fromSystem);
        }

        // Create new system
        const result = this.createLayers(toSystem);

        console.log(`✅ System switch complete: ${fromSystem} → ${toSystem}`);

        return result;
    }

    /**
     * Get active layers for a system
     */
    getLayers(systemName) {
        return this.activeLayers.get(systemName);
    }

    /**
     * Check if a system has active layers
     */
    hasLayers(systemName) {
        return this.activeLayers.has(systemName);
    }

    /**
     * Resize all active canvases (call on window resize)
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.activeLayers.forEach((system, systemName) => {
            system.canvases.forEach(canvas => {
                canvas.width = width;
                canvas.height = height;
            });
            console.log(`📐 Resized ${system.canvases.length} canvases for ${systemName}`);
        });
    }

    /**
     * Hide a system's layers without destroying them
     */
    hideLayers(systemName) {
        const system = this.activeLayers.get(systemName);
        if (system && system.wrapper) {
            system.wrapper.style.display = 'none';
            console.log(`👁️ Hidden layers for: ${systemName}`);
        }
    }

    /**
     * Show a system's layers
     */
    showLayers(systemName) {
        const system = this.activeLayers.get(systemName);
        if (system && system.wrapper) {
            system.wrapper.style.display = 'block';
            console.log(`👁️ Showing layers for: ${systemName}`);
        }
    }

    /**
     * Destroy all active systems (cleanup on app shutdown)
     */
    destroyAll() {
        console.log(`🧹 Destroying all active canvas systems...`);
        const systems = Array.from(this.activeLayers.keys());
        systems.forEach(systemName => {
            this.destroyLayers(systemName);
        });
        console.log(`✅ All canvas systems destroyed`);
    }
}
