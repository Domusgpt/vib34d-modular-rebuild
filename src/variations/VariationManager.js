/**
 * VIB34D Variation Management System 2.0
 * Manages 200 total variations: 60 default + 140 custom
 * EXPANDED from original 100 variations
 *
 * A Paul Phillips Manifestation
 */

import { Polytopes } from '../geometry/Polytopes.js';

export class VariationManager {
    constructor(choreographer) {
        this.choreographer = choreographer;

        // Expanded default variations (60 total - doubled from 30)
        this.variationNames = this.generateVariationNames();

        // Custom variations storage (140 slots - doubled from 70)
        this.customVariations = new Array(140).fill(null);

        // Total variation count (doubled from 100)
        this.totalVariations = 200;

        // Current variation index
        this.currentVariation = 0;

        // Variation categories for filtering
        this.categories = {
            minimal: [],
            balanced: [],
            intense: [],
            extreme: [],
            genre: [],
            mood: []
        };

        this.initializeCategories();
        this.loadCustomVariations();
    }

    /**
     * Generate all 60 default variation names
     */
    generateVariationNames() {
        const names = [];

        // Geometry-based variations (22 geometries × 2 levels = 44)
        const geometries = Polytopes.getAllGeometryNames();
        geometries.forEach((geom) => {
            names.push(`${geom} - BALANCED`);
            names.push(`${geom} - INTENSE`);
        });

        // Genre presets (8 variations)
        names.push('EDM DROP HEAVY', 'LO-FI CHILL', 'HEAVY METAL AGGRO', 'CLASSICAL ELEGANT',
                   'JAZZ SMOOTH', 'HIP-HOP BOUNCE', 'AMBIENT ETHEREAL', 'TECHNO PULSE');

        // Mood presets (8 variations)
        names.push('ENERGETIC ORANGE', 'CALM BLUE', 'ROMANTIC PURPLE', 'AGGRESSIVE RED',
                   'HAPPY YELLOW', 'MYSTERIOUS BLACK', 'PEACEFUL GREEN', 'PASSIONATE MAGENTA');

        return names.slice(0, 60);
    }

    /**
     * Initialize variation categories
     */
    initializeCategories() {
        for (let i = 0; i < 44; i += 2) this.categories.minimal.push(i);
        for (let i = 1; i < 44; i += 2) this.categories.balanced.push(i);
        for (let i = 44; i < 52; i++) this.categories.intense.push(i);
        for (let i = 52; i < 60; i++) this.categories.extreme.push(i);
        this.categories.genre = [44, 45, 46, 47, 48, 49, 50, 51];
        this.categories.mood = [52, 53, 54, 55, 56, 57, 58, 59];
    }

    getVariationName(index) {
        if (index < 60) {
            return this.variationNames[index] || `DEFAULT ${index + 1}`;
        } else {
            const customIndex = index - 60;
            const customVar = this.customVariations[customIndex];
            return customVar ? customVar.name : `CUSTOM ${customIndex + 1}`;
        }
    }

    generateDefaultVariation(index) {
        if (index >= 60) return null;

        if (index < 44) {
            const geomIndex = Math.floor(index / 2);
            const level = index % 2;
            const geometries = Polytopes.getAllGeometryNames();

            return {
                variation: index, geometry: geometries[geomIndex],
                geometryScale: 1.0 + level * 0.5, segments: 15 + level * 15,
                gridDensity: 20 + level * 20, morphFactor: 0.5 + level * 0.5,
                chaos: level * 0.5, speed: 1.0 + level * 1.0,
                hue: (geomIndex * 16.36) % 360, intensity: 0.5 + level * 0.3,
                saturation: 0.7 + level * 0.2
            };
        }

        if (index >= 44 && index < 52) {
            const presets = [
                { gridDensity: 50, chaos: 0.8, speed: 2.5, hue: 280, intensity: 0.9 },
                { gridDensity: 10, chaos: 0.1, speed: 0.5, hue: 200, intensity: 0.3 },
                { gridDensity: 60, chaos: 1.0, speed: 3.0, hue: 0, intensity: 1.0 },
                { gridDensity: 25, chaos: 0.2, speed: 0.8, hue: 45, intensity: 0.5 },
                { gridDensity: 30, chaos: 0.4, speed: 1.2, hue: 180, intensity: 0.6 },
                { gridDensity: 35, chaos: 0.6, speed: 1.5, hue: 320, intensity: 0.7 },
                { gridDensity: 15, chaos: 0.3, speed: 0.6, hue: 160, intensity: 0.4 },
                { gridDensity: 45, chaos: 0.7, speed: 2.0, hue: 260, intensity: 0.8 }
            ];
            return { variation: index, geometry: 'Hypercube (Tesseract)', ...presets[index - 44], morphFactor: 1.0, saturation: 0.8 };
        }

        if (index >= 52) {
            const moods = [
                { hue: 30, intensity: 0.9, chaos: 0.7, speed: 2.0 },
                { hue: 200, intensity: 0.3, chaos: 0.1, speed: 0.5 },
                { hue: 280, intensity: 0.6, chaos: 0.3, speed: 0.8 },
                { hue: 0, intensity: 1.0, chaos: 0.9, speed: 2.5 },
                { hue: 60, intensity: 0.8, chaos: 0.5, speed: 1.5 },
                { hue: 270, intensity: 0.4, chaos: 0.6, speed: 1.0 },
                { hue: 120, intensity: 0.5, chaos: 0.2, speed: 0.7 },
                { hue: 320, intensity: 0.9, chaos: 0.8, speed: 1.8 }
            ];
            return { variation: index, geometry: 'Hopf Fibration', gridDensity: 30, ...moods[index - 52], morphFactor: 1.0, saturation: 0.8 };
        }
        return null;
    }

    applyVariation(index) {
        if (index < 0 || index >= this.totalVariations) return false;

        let params = index < 60 ? this.generateDefaultVariation(index) :
            (this.customVariations[index - 60] ? { ...this.customVariations[index - 60].parameters, variation: index } :
            { ...this.choreographer.baseParams, variation: index });

        if (params) {
            Object.keys(params).forEach(key => {
                if (key !== 'variation' && key !== 'geometry') {
                    this.choreographer.setParameter(key, params[key]);
                }
            });

            if (params.geometry && window.enhancedControls?.geometryControls) {
                window.enhancedControls.geometryControls.setGeometry(params.geometry);
            }

            this.currentVariation = index;
            console.log(`✅ Applied variation ${index}: ${this.getVariationName(index)}`);
            return true;
        }
        return false;
    }

    saveCurrentAsCustom(name = null) {
        const emptyIndex = this.customVariations.findIndex(slot => slot === null);
        if (emptyIndex === -1) { console.warn('⚠️ No empty slots'); return -1; }

        const currentParams = { ...this.choreographer.baseParams };
        const currentGeometry = window.enhancedControls?.geometryControls?.currentGeometry || 'Hypercube (Tesseract)';

        this.customVariations[emptyIndex] = {
            name: name || `${currentGeometry} CUSTOM ${emptyIndex + 1}`,
            timestamp: new Date().toISOString(),
            parameters: { ...currentParams, geometry: currentGeometry },
            metadata: { basedOnVariation: this.currentVariation, createdFrom: 'current-state' }
        };

        this.saveCustomVariations();
        console.log(`💾 Saved custom variation ${60 + emptyIndex}`);
        return 60 + emptyIndex;
    }

    deleteCustomVariation(customIndex) {
        if (customIndex >= 0 && customIndex < 140) {
            this.customVariations[customIndex] = null;
            this.saveCustomVariations();
            console.log(`🗑️ Deleted custom variation ${customIndex}`);
            return true;
        }
        return false;
    }

    getByCategory(category) {
        return (this.categories[category] || []).map(index => ({
            index, name: this.getVariationName(index), params: this.generateDefaultVariation(index)
        }));
    }

    searchVariations(query) {
        const results = [], lowerQuery = query.toLowerCase();
        this.variationNames.forEach((name, index) => {
            if (name.toLowerCase().includes(lowerQuery)) results.push({ index, name, isCustom: false });
        });
        this.customVariations.forEach((variation, customIndex) => {
            if (variation && variation.name.toLowerCase().includes(lowerQuery)) {
                results.push({ index: 60 + customIndex, name: variation.name, isCustom: true });
            }
        });
        return results;
    }

    loadCustomVariations() {
        try {
            const stored = localStorage.getItem('vib34d-custom-variations-v2');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length === 140) {
                    this.customVariations = parsed;
                    console.log('✅ Loaded custom variations');
                }
            }
        } catch (error) { console.warn('Failed to load:', error); }
    }

    saveCustomVariations() {
        try {
            localStorage.setItem('vib34d-custom-variations-v2', JSON.stringify(this.customVariations));
        } catch (error) { console.warn('Failed to save:', error); }
    }

    exportCustomVariations() {
        const exportData = {
            type: 'vib34d-custom-variations-v2', version: '2.0.0',
            timestamp: new Date().toISOString(),
            variations: this.customVariations.filter(v => v !== null)
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vib34d-variations-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log('💾 Exported custom variations');
    }

    async importCustomVariations(file) {
        try {
            const data = JSON.parse(await file.text());
            if ((data.type === 'vib34d-custom-variations-v2' || data.type === 'vib34d-custom-variations') && Array.isArray(data.variations)) {
                let importCount = 0;
                data.variations.forEach(variation => {
                    const emptyIndex = this.customVariations.findIndex(slot => slot === null);
                    if (emptyIndex !== -1) { this.customVariations[emptyIndex] = variation; importCount++; }
                });
                this.saveCustomVariations();
                console.log(`✅ Imported ${importCount} variations`);
                return importCount;
            }
        } catch (error) { console.error('Import failed:', error); }
        return 0;
    }

    getStatistics() {
        const customCount = this.customVariations.filter(v => v !== null).length;
        return {
            totalVariations: this.totalVariations, defaultVariations: 60,
            customVariations: customCount, emptySlots: 140 - customCount,
            currentVariation: this.currentVariation, isCustom: this.currentVariation >= 60,
            categories: Object.keys(this.categories).map(cat => ({ name: cat, count: this.categories[cat].length }))
        };
    }

    getRandomFromCategory(category) {
        const variations = this.categories[category] || [];
        return variations.length > 0 ? variations[Math.floor(Math.random() * variations.length)] : -1;
    }

    getNextVariation() { return (this.currentVariation + 1) % this.totalVariations; }
    getPreviousVariation() { return (this.currentVariation - 1 + this.totalVariations) % this.totalVariations; }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 */