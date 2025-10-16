/**
 * VIB3 Geometry Library with Polytope Architecture
 * 24 geometric types: 3 polytope cores × 8 style variations
 *
 * Polytope Cores (coreIndex):
 *   0 = Hypercube (Base) - Standard lattice
 *   1 = Hypersphere - Spherical shell warping
 *   2 = Hypertetrahedron - Tetrahedral plane warping
 *
 * Geometry Styles (styleIndex):
 *   0 = TETRAHEDRON, 1 = HYPERCUBE, 2 = SPHERE, 3 = TORUS,
 *   4 = KLEIN BOTTLE, 5 = FRACTAL, 6 = WAVE, 7 = CRYSTAL
 *
 * Encoding: geometryType = styleIndex + (coreIndex * 8)
 * Range: 0-23 (24 total geometries)
 *
 * WebGL 1.0 compatible shaders only
 */

import { HypercubePolytope } from './HypercubePolytope.js';
import { HyperspherePolytope } from './HyperspherePolytope.js';
import { HypertetrahedronPolytope } from './HypertetrahedronPolytope.js';

export class GeometryLibrary {
    static getBaseNames() {
        return ['Hypercube', 'Hypersphere', 'Hypertetrahedron'];
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
        const cores = this.getBaseNames();
        const styles = this.getStyleNames();
        const names = [];

        // Create 24 combinations: styleIndex + (coreIndex * 8)
        // Core 0: geometries 0-7 (Hypercube + styles)
        // Core 1: geometries 8-15 (Hypersphere + styles)
        // Core 2: geometries 16-23 (Hypertetrahedron + styles)
        for (let coreIdx = 0; coreIdx < cores.length; coreIdx++) {
            for (let styleIdx = 0; styleIdx < styles.length; styleIdx++) {
                names.push(`${cores[coreIdx]} ${styles[styleIdx]}`);
            }
        }

        return names;
    }

    static getGeometryName(type) {
        const names = this.getGeometryNames();
        return names[type] || 'UNKNOWN';
    }

    /**
     * Get core/polytope index from geometry type
     * @param {number} type - Geometry type (0-23)
     * @returns {number} Core index (0=Hypercube, 1=Hypersphere, 2=Hypertetrahedron)
     */
    static getCoreIndex(type) {
        return Math.floor(type / 8);
    }

    /**
     * Get style index from geometry type
     * @param {number} type - Geometry type (0-23)
     * @returns {number} Style index (0-7)
     */
    static getStyleIndex(type) {
        return type % 8;
    }

    /**
     * Legacy alias for getCoreIndex
     * @deprecated Use getCoreIndex instead
     */
    static getBaseIndex(type) {
        return this.getCoreIndex(type);
    }

    /**
     * Get polytope instance for geometry type
     * @param {number} type - Geometry type (0-23)
     * @returns {Polytope} Polytope instance
     */
    static getPolytope(type) {
        const coreIndex = this.getCoreIndex(type);
        switch (coreIndex) {
            case 0: return new HypercubePolytope();
            case 1: return new HyperspherePolytope();
            case 2: return new HypertetrahedronPolytope();
            default: return new HypercubePolytope();
        }
    }
    
    /**
     * Get variation parameters for specific geometry and level
     * Now uses polytope core adjustments
     */
    static getVariationParameters(geometryType, level) {
        const styleIndex = this.getStyleIndex(geometryType);
        const coreIndex = this.getCoreIndex(geometryType);
        const polytope = this.getPolytope(geometryType);
        const coreAdjustments = polytope.getCoreAdjustments();

        const baseParams = {
            gridDensity: 8 + (level * 4),
            morphFactor: 0.5 + (level * 0.3),
            chaos: level * 0.15,
            speed: 0.8 + (level * 0.2),
            hue: (geometryType * 15 + level * 15) % 360
        };

        // Apply polytope core adjustments
        baseParams.gridDensity *= coreAdjustments.density;
        baseParams.morphFactor *= coreAdjustments.morph;
        baseParams.chaos *= coreAdjustments.chaos;
        baseParams.speed *= coreAdjustments.speed;

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

    /**
     * Get shader code for specific geometry type
     * Combines polytope core warping with geometry style
     * @param {number} type - Geometry type (0-23)
     * @returns {string} Complete shader code
     */
    static getShaderCode(type) {
        const polytope = this.getPolytope(type);
        return polytope.getShaderCode();
    }
}