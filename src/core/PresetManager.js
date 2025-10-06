/**
 * PresetManager - Save, load, and manage visualization presets
 * Allows users to quickly switch between configurations
 */

export class PresetManager {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.presets = this.getDefaultPresets();
        this.currentPreset = null;

        // Load saved presets from localStorage
        this.loadPresetsFromStorage();

        console.log('🎨 PresetManager initialized with', Object.keys(this.presets).length, 'presets');
    }

    /**
     * Get default built-in presets
     */
    getDefaultPresets() {
        return {
            'chill-ambient': {
                name: 'Chill Ambient',
                description: 'Smooth, flowing visuals for ambient music',
                system: 'holographic',
                mode: 'flow',
                parameters: {
                    geometry: 3,
                    gridDensity: 8,
                    morphFactor: 0.5,
                    chaos: 0.1,
                    speed: 0.5,
                    hue: 200,
                    intensity: 0.3,
                    saturation: 0.6,
                    rot4dXW: 0.001,
                    rot4dYW: 0.002,
                    rot4dZW: 0.001
                },
                reactivity: 0.3,
                colorPalette: 'ocean',
                sweeps: []
            },

            'edm-drop': {
                name: 'EDM Drop',
                description: 'Intense, chaotic visuals for drops and heavy sections',
                system: 'quantum',
                mode: 'chaos',
                parameters: {
                    geometry: 7,
                    gridDensity: 25,
                    morphFactor: 2.0,
                    chaos: 0.8,
                    speed: 2.0,
                    hue: 330,
                    intensity: 0.9,
                    saturation: 1.0,
                    rot4dXW: 0.05,
                    rot4dYW: 0.08,
                    rot4dZW: 0.06
                },
                reactivity: 1.0,
                colorPalette: 'fire',
                sweeps: ['pulse-train', 'exponential-decay']
            },

            'techno-pulse': {
                name: 'Techno Pulse',
                description: 'Rhythmic, beat-locked visuals for techno',
                system: 'faceted',
                mode: 'pulse',
                parameters: {
                    geometry: 4,
                    gridDensity: 18,
                    morphFactor: 1.2,
                    chaos: 0.3,
                    speed: 1.5,
                    hue: 180,
                    intensity: 0.7,
                    saturation: 0.8,
                    rot4dXW: 0.02,
                    rot4dYW: 0.03,
                    rot4dZW: 0.02
                },
                reactivity: 0.8,
                colorPalette: 'neon',
                sweeps: ['sine-wave']
            },

            'progressive-build': {
                name: 'Progressive Build',
                description: 'Gradually intensifying visuals for buildups',
                system: 'quantum',
                mode: 'build',
                parameters: {
                    geometry: 5,
                    gridDensity: 12,
                    morphFactor: 0.8,
                    chaos: 0.2,
                    speed: 1.0,
                    hue: 270,
                    intensity: 0.4,
                    saturation: 0.7,
                    rot4dXW: 0.01,
                    rot4dYW: 0.015,
                    rot4dZW: 0.01
                },
                reactivity: 0.6,
                colorPalette: 'rainbow',
                sweeps: ['linear-sweep']
            },

            'glitch-experimental': {
                name: 'Glitch Experimental',
                description: 'Stuttering, glitchy visuals for IDM/experimental',
                system: 'holographic',
                mode: 'glitch',
                parameters: {
                    geometry: 9,
                    gridDensity: 20,
                    morphFactor: 1.5,
                    chaos: 0.9,
                    speed: 1.8,
                    hue: 120,
                    intensity: 0.8,
                    saturation: 0.9,
                    rot4dXW: 0.1,
                    rot4dYW: 0.15,
                    rot4dZW: 0.12
                },
                reactivity: 0.9,
                colorPalette: 'neon',
                sweeps: ['pulse-train', 'sawtooth']
            },

            'dnb-liquid': {
                name: 'Liquid DnB',
                description: 'Fluid, organic morphing for liquid drum & bass',
                system: 'faceted',
                mode: 'liquid',
                parameters: {
                    geometry: 6,
                    gridDensity: 15,
                    morphFactor: 1.8,
                    chaos: 0.4,
                    speed: 1.3,
                    hue: 180,
                    intensity: 0.6,
                    saturation: 0.75,
                    rot4dXW: 0.03,
                    rot4dYW: 0.04,
                    rot4dZW: 0.035
                },
                reactivity: 0.75,
                colorPalette: 'ocean',
                sweeps: ['triangle', 'sine-wave']
            },

            'minimal-deep': {
                name: 'Minimal Deep',
                description: 'Subtle, minimalist visuals for deep house',
                system: 'holographic',
                mode: 'wave',
                parameters: {
                    geometry: 2,
                    gridDensity: 10,
                    morphFactor: 0.6,
                    chaos: 0.15,
                    speed: 0.7,
                    hue: 240,
                    intensity: 0.4,
                    saturation: 0.5,
                    rot4dXW: 0.005,
                    rot4dYW: 0.008,
                    rot4dZW: 0.006
                },
                reactivity: 0.4,
                colorPalette: 'ocean',
                sweeps: []
            },

            'strobe-hard': {
                name: 'Hard Strobe',
                description: 'Extreme flashing for hard techno/industrial',
                system: 'quantum',
                mode: 'strobe',
                parameters: {
                    geometry: 8,
                    gridDensity: 30,
                    morphFactor: 2.5,
                    chaos: 1.0,
                    speed: 2.5,
                    hue: 0,
                    intensity: 1.0,
                    saturation: 1.0,
                    rot4dXW: 0.08,
                    rot4dYW: 0.1,
                    rot4dZW: 0.09
                },
                reactivity: 1.0,
                colorPalette: 'fire',
                sweeps: ['pulse-train']
            }
        };
    }

    /**
     * Apply a preset
     */
    async applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`Preset "${presetName}" not found`);
            return false;
        }

        console.log(`🎨 Applying preset: ${preset.name}`);

        try {
            // Switch system if different
            if (preset.system !== this.choreographer.currentSystem) {
                await this.choreographer.switchSystem(preset.system);
            }

            // Set choreography mode
            this.choreographer.choreographyMode = preset.mode;

            // Apply parameters
            Object.entries(preset.parameters).forEach(([param, value]) => {
                this.choreographer.baseParams[param] = value;
            });

            // Update current system with new parameters
            this.choreographer.updateSystemParameters(
                this.choreographer.systems[preset.system].engine
            );

            // Set reactivity
            this.choreographer.reactivityStrength = preset.reactivity;

            // Store current preset
            this.currentPreset = presetName;

            console.log(`✅ Preset "${preset.name}" applied successfully`);
            return true;

        } catch (error) {
            console.error(`Failed to apply preset "${presetName}":`, error);
            return false;
        }
    }

    /**
     * Save current state as new preset
     */
    saveCurrentAsPreset(name, description = '') {
        const preset = {
            name: name,
            description: description,
            system: this.choreographer.currentSystem,
            mode: this.choreographer.choreographyMode,
            parameters: { ...this.choreographer.baseParams },
            reactivity: this.choreographer.reactivityStrength,
            custom: true,
            createdAt: new Date().toISOString()
        };

        this.presets[name.toLowerCase().replace(/\s+/g, '-')] = preset;
        this.savePresetsToStorage();

        console.log(`💾 Saved preset: ${name}`);
        return preset;
    }

    /**
     * Delete a custom preset
     */
    deletePreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`Preset "${presetName}" not found`);
            return false;
        }

        if (!preset.custom) {
            console.warn(`Cannot delete built-in preset "${presetName}"`);
            return false;
        }

        delete this.presets[presetName];
        this.savePresetsToStorage();

        console.log(`🗑️ Deleted preset: ${preset.name}`);
        return true;
    }

    /**
     * Get list of all presets
     */
    getPresetList() {
        return Object.entries(this.presets).map(([key, preset]) => ({
            key,
            name: preset.name,
            description: preset.description,
            system: preset.system,
            mode: preset.mode,
            custom: preset.custom || false
        }));
    }

    /**
     * Get preset by key
     */
    getPreset(presetName) {
        return this.presets[presetName];
    }

    /**
     * Save presets to localStorage
     */
    savePresetsToStorage() {
        try {
            const customPresets = {};
            Object.entries(this.presets).forEach(([key, preset]) => {
                if (preset.custom) {
                    customPresets[key] = preset;
                }
            });

            localStorage.setItem('vib34d_custom_presets', JSON.stringify(customPresets));
        } catch (error) {
            console.error('Failed to save presets to localStorage:', error);
        }
    }

    /**
     * Load presets from localStorage
     */
    loadPresetsFromStorage() {
        try {
            const stored = localStorage.getItem('vib34d_custom_presets');
            if (stored) {
                const customPresets = JSON.parse(stored);
                Object.assign(this.presets, customPresets);
                console.log(`📂 Loaded ${Object.keys(customPresets).length} custom presets`);
            }
        } catch (error) {
            console.error('Failed to load presets from localStorage:', error);
        }
    }

    /**
     * Export presets to JSON file
     */
    exportPresets() {
        const data = JSON.stringify(this.presets, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `vib34d_presets_${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
        console.log('📥 Presets exported');
    }

    /**
     * Import presets from JSON file
     */
    async importPresets(file) {
        try {
            const text = await file.text();
            const imported = JSON.parse(text);

            let count = 0;
            Object.entries(imported).forEach(([key, preset]) => {
                preset.custom = true;
                preset.importedAt = new Date().toISOString();
                this.presets[key] = preset;
                count++;
            });

            this.savePresetsToStorage();
            console.log(`📤 Imported ${count} presets`);
            return count;

        } catch (error) {
            console.error('Failed to import presets:', error);
            throw error;
        }
    }
}
