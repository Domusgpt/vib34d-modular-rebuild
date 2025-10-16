/**
 * Hypersphere Polytope (Spherical Core)
 *
 * 3-sphere (S³) geometry with concentric shell structures
 * coreIndex = 1
 *
 * Features:
 * - Spherical coordinate warping
 * - Concentric shell patterns
 * - Radial phase oscillations
 * - Enhanced density and morphing
 */

import { Polytope } from './Polytope.js';

export class HyperspherePolytope extends Polytope {
    constructor() {
        super(1); // coreIndex = 1
    }

    /**
     * Hypersphere core warping function
     * Creates spherical 4D structure with radial oscillations
     * @returns {string} GLSL shader code
     */
    getCoreWarpCode() {
        return `
            vec3 warpHypersphereCore(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                float radius = length(p);
                float morphBlend = clamp(u_morph + u_touchMorph * 0.6 + u_audioMorphBoost * 0.5, 0.0, 2.0);
                float audioLift = (u_audioHigh * 0.5 + u_audioMid * 0.35);

                // Generate W coordinate using radial oscillation
                float w = sin(radius * (1.4 + float(geometryIndex) * 0.1) + u_time * 0.0015 * u_speed);
                w *= (0.35 + morphBlend * 0.4 + audioLift);

                // Create 4D point and apply rotations
                vec4 p4d = vec4(p * (1.0 + morphBlend * 0.25), w);
                p4d = applyInteractiveRotation(p4d, mouseOffset, scrollRotation, touchRotation);
                vec3 projected = project4Dto3D(p4d);

                // Blend between 3D and 4D based on morph factor
                float blend = clamp(0.35 + morphBlend * 0.35 + u_audioDensityBoost * 0.2, 0.0, 1.0);
                return mix(p, projected, blend);
            }

            vec3 applyCoreWarp(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                return warpHypersphereCore(p, geometryIndex, mouseOffset, scrollRotation, touchRotation);
            }
        `;
    }

    /**
     * Hypersphere has enhanced density and morphing
     * @returns {Object}
     */
    getCoreAdjustments() {
        return {
            density: 1.15,
            speed: 0.9,
            chaos: 1.2,
            morph: 1.25
        };
    }

    /**
     * Hypersphere has maximum spherical influence
     * @returns {number}
     */
    getHypersphereInfluence() {
        return 0.70; // 35% base + 35% bonus
    }
}
