/**
 * Hypertetrahedron Polytope (Tetrahedral Core)
 *
 * 4D simplex (5-cell) geometry with tetrahedral plane projections
 * coreIndex = 2
 *
 * Features:
 * - Tetrahedral corner basis vectors
 * - Planar distance calculations
 * - Complex 4D rotations with basis mixing
 * - Maximum morphing capability
 */

import { Polytope } from './Polytope.js';

export class HypertetrahedronPolytope extends Polytope {
    constructor() {
        super(2); // coreIndex = 2
    }

    /**
     * Hypertetrahedron core warping function
     * Uses tetrahedral corner vectors to create 4D simplex structure
     * @returns {string} GLSL shader code
     */
    getCoreWarpCode() {
        return `
            vec3 warpHypertetraCore(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                // Tetrahedral corner vectors
                vec3 c1 = normalize(vec3(1.0, 1.0, 1.0));
                vec3 c2 = normalize(vec3(-1.0, -1.0, 1.0));
                vec3 c3 = normalize(vec3(-1.0, 1.0, -1.0));
                vec3 c4 = normalize(vec3(1.0, -1.0, -1.0));

                float morphBlend = clamp(u_morph * 0.8 + u_audioMorphBoost * 0.4 + u_touchMorph * 0.6, 0.0, 2.0);

                // Mix corner basis vectors to create W coordinate
                float basisMix = dot(p, c1) * 0.12 + dot(p, c2) * 0.08 + dot(p, c3) * 0.05;
                float w = sin(basisMix * 6.0 + u_time * 0.0012 * u_speed);
                w *= cos(dot(p, c4) * 4.5 - u_time * 0.0010 * u_speed);
                w *= (0.45 + morphBlend * 0.35 + u_audioHigh * 0.3);

                // Add tetrahedral offset based on corner projections
                vec3 offset = vec3(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.12 * morphBlend;
                vec4 p4d = vec4(p + offset, w);
                p4d = applyInteractiveRotation(p4d, mouseOffset, scrollRotation, touchRotation);
                vec3 projected = project4Dto3D(p4d);

                // Calculate tetrahedral plane influence
                float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))), min(abs(dot(p, c3)), abs(dot(p, c4))));
                vec3 blended = mix(p, projected, clamp(0.4 + morphBlend * 0.4, 0.0, 1.0));

                // Final mix with plane influence for tetrahedral structure
                return mix(blended, blended * (1.0 - planeInfluence * 0.6), 0.25 + morphBlend * 0.15);
            }

            vec3 applyCoreWarp(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                return warpHypertetraCore(p, geometryIndex, mouseOffset, scrollRotation, touchRotation);
            }
        `;
    }

    /**
     * Hypertetrahedron has reduced density but enhanced morphing
     * @returns {Object}
     */
    getCoreAdjustments() {
        return {
            density: 0.95,
            speed: 1.1,
            chaos: 1.15,
            morph: 1.35
        };
    }

    /**
     * Hypertetrahedron has maximum tetrahedral influence
     * @returns {number}
     */
    getHypertetraInfluence() {
        return 0.85; // 45% base + 40% bonus
    }
}
