/**
 * Hypercube Polytope (Base Core)
 *
 * Standard 4D hypercube geometry with lattice structures
 * This is the default polytope core (coreIndex = 0)
 *
 * Features:
 * - Classic hypercubic lattice patterns
 * - No additional warping (clean geometric structure)
 * - Base parameters with standard adjustments
 */

import { Polytope } from './Polytope.js';

export class HypercubePolytope extends Polytope {
    constructor() {
        super(0); // coreIndex = 0
    }

    /**
     * Hypercube core does no additional warping
     * @returns {string} GLSL shader code
     */
    getCoreWarpCode() {
        return `
            vec3 applyCoreWarp(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                // Hypercube core: No additional warping, pure geometric structure
                return p;
            }
        `;
    }

    /**
     * Standard adjustments for hypercube
     * @returns {Object}
     */
    getCoreAdjustments() {
        return {
            density: 1.0,
            speed: 1.0,
            chaos: 1.0,
            morph: 1.0
        };
    }
}
