/**
 * VIB3 Geometry Library
 * 24 geometric types: 3 base geometries × 8 style variations
 * Base Geometries: Hypersphere, Hypertetrahedron, Hypercube
 * Styles: TETRAHEDRON, HYPERCUBE, SPHERE, TORUS, KLEIN BOTTLE, FRACTAL, WAVE, CRYSTAL
 * WebGL 1.0 compatible shaders only
 */

export class GeometryLibrary {
    static getBaseNames() {
        return ['Hypersphere', 'Hypertetrahedron', 'Hypercube'];
    }

    static getStyleNames() {
        return [
            'TETRAHEDRON',
            'HYPERCUBE',
            'SPHERE',
            'TORUS',
            'KLEIN BOTTLE',
            'FRACTAL',
            'WAVE',
            'CRYSTAL'
        ];
    }

    static getGeometryNames() {
        const bases = this.getBaseNames();
        const styles = this.getStyleNames();
        const names = [];

        // Create 24 combinations: base + style
        for (let baseIdx = 0; baseIdx < bases.length; baseIdx++) {
            for (let styleIdx = 0; styleIdx < styles.length; styleIdx++) {
                names.push(`${bases[baseIdx]} ${styles[styleIdx]}`);
            }
        }

        return names;
    }

    static getGeometryName(type) {
        const names = this.getGeometryNames();
        return names[type] || 'UNKNOWN';
    }

    static getBaseIndex(type) {
        return Math.floor(type / 8);
    }

    static getStyleIndex(type) {
        return type % 8;
    }
    
    /**
     * Get variation parameters for specific geometry and level
     */
    static getVariationParameters(geometryType, level) {
        const styleIndex = this.getStyleIndex(geometryType);
        const baseIndex = this.getBaseIndex(geometryType);

        const baseParams = {
            gridDensity: 8 + (level * 4),
            morphFactor: 0.5 + (level * 0.3),
            chaos: level * 0.15,
            speed: 0.8 + (level * 0.2),
            hue: (geometryType * 15 + level * 15) % 360
        };

        // Base geometry adjustments
        switch (baseIndex) {
            case 0: // Hypersphere
                baseParams.morphFactor *= 1.1;
                break;
            case 1: // Hypertetrahedron
                baseParams.gridDensity *= 1.15;
                break;
            case 2: // Hypercube
                baseParams.chaos *= 0.9;
                break;
        }

        // Style-specific adjustments
        switch (styleIndex) {
            case 0: // Tetrahedron style
                baseParams.gridDensity *= 1.2;
                break;
            case 1: // Hypercube style
                baseParams.morphFactor *= 0.8;
                break;
            case 2: // Sphere style
                baseParams.chaos *= 1.5;
                break;
            case 3: // Torus style
                baseParams.speed *= 1.3;
                break;
            case 4: // Klein Bottle style
                baseParams.gridDensity *= 0.7;
                baseParams.morphFactor *= 1.4;
                break;
            case 5: // Fractal style
                baseParams.gridDensity *= 0.5;
                baseParams.chaos *= 2.0;
                break;
            case 6: // Wave style
                baseParams.speed *= 1.8;
                baseParams.chaos *= 0.5;
                break;
            case 7: // Crystal style
                baseParams.gridDensity *= 1.5;
                baseParams.morphFactor *= 0.6;
                break;
        }

        return baseParams;
    }
}