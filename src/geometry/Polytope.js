/**
 * Polytope Base Class - 4D Geometric Entities
 *
 * Base class for all 4D polytope geometries (Hypercube, Hypersphere, Hypertetrahedron)
 * Provides core warping functions, 4D rotation matrices, and shader code generation
 *
 * Architecture:
 * - Polytope (base) → defines core warping behavior
 * - HypercubePolytope → standard hypercubic lattice (default)
 * - HyperspherePolytope → spherical shell concentric structures
 * - HypertetrahedronPolytope → tetrahedral plane projections
 *
 * Each polytope can be combined with 8 geometry styles:
 * TETRAHEDRON, HYPERCUBE, SPHERE, TORUS, KLEIN BOTTLE, FRACTAL, WAVE, CRYSTAL
 *
 * Total: 3 cores × 8 styles = 24 geometry variants
 */

export class Polytope {
    /**
     * @param {number} coreIndex - Core type (0=Base/Hypercube, 1=Hypersphere, 2=Hypertetrahedron)
     */
    constructor(coreIndex = 0) {
        this.coreIndex = coreIndex;
        this.coreName = this.getCoreNames()[coreIndex] || 'Unknown';
    }

    /**
     * Get all polytope core names
     * @returns {string[]}
     */
    getCoreNames() {
        return ['Hypercube', 'Hypersphere', 'Hypertetrahedron'];
    }

    /**
     * Get 4D rotation matrix shader code
     * All polytopes share these rotation functions
     * @returns {string} GLSL shader code for 4D rotations
     */
    getRotationMatrixCode() {
        return `
            // 4D Rotation Matrices - 6 rotation planes
            mat4 rotateXY(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, -s, 0.0, 0.0,
                            s,  c, 0.0, 0.0,
                            0.0, 0.0, 1.0, 0.0,
                            0.0, 0.0, 0.0, 1.0);
            }

            mat4 rotateXZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0.0, -s, 0.0,
                            0.0, 1.0, 0.0, 0.0,
                            s, 0.0,  c, 0.0,
                            0.0, 0.0, 0.0, 1.0);
            }

            mat4 rotateYZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0,
                            0.0, c, -s, 0.0,
                            0.0, s,  c, 0.0,
                            0.0, 0.0, 0.0, 1.0);
            }

            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }

            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }

            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
        `;
    }

    /**
     * Get 4D to 3D projection shader code
     * @returns {string} GLSL shader code for projection
     */
    getProjectionCode() {
        return `
            // 4D to 3D Perspective Projection
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
        `;
    }

    /**
     * Get interactive rotation application
     * Combines manual rotations with automatic/interactive rotations
     * @returns {string} GLSL shader code
     */
    getInteractiveRotationCode() {
        return `
            vec4 applyInteractiveRotation(vec4 pos, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                float timeFactor = u_time * 0.0004 * u_speed * u_roleSpeed;
                float audioOffset = (u_audioChaosBoost + u_audioMorphBoost) * 0.2;

                pos = rotateXY(u_rot4dXY + timeFactor * 0.18 + mouseOffset.x * 0.4 + scrollRotation * 0.15) * pos;
                pos = rotateXZ(u_rot4dXZ + timeFactor * 0.16 + mouseOffset.y * 0.35 + touchRotation * 0.2) * pos;
                pos = rotateYZ(u_rot4dYZ + timeFactor * 0.12 + u_touchChaos * 0.3 + u_clickIntensity * 0.2) * pos;
                pos = rotateXW(u_rot4dXW + timeFactor * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * pos;
                pos = rotateYW(u_rot4dYW + timeFactor * 0.15 + mouseOffset.x * 0.5 + touchRotation) * pos;
                pos = rotateZW(u_rot4dZW + timeFactor * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4 + audioOffset) * pos;
                return pos;
            }
        `;
    }

    /**
     * Get core-specific warping shader code
     * MUST BE OVERRIDDEN in subclasses
     * @returns {string} GLSL shader code
     */
    getCoreWarpCode() {
        // Base implementation does no warping (standard hypercube)
        return `
            vec3 applyCoreWarp(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
                // Base core: no additional warping
                return p;
            }
        `;
    }

    /**
     * Get complete shader code including rotations, projections, and core warp
     * @returns {string} Complete GLSL shader code
     */
    getShaderCode() {
        return `
            ${this.getRotationMatrixCode()}
            ${this.getProjectionCode()}
            ${this.getInteractiveRotationCode()}
            ${this.getCoreWarpCode()}
        `;
    }

    /**
     * Get adjustment multipliers for this polytope core
     * Used to scale base geometry parameters
     * @returns {Object} Adjustment factors
     */
    getCoreAdjustments() {
        return {
            density: 1.0,
            speed: 1.0,
            chaos: 1.0,
            morph: 1.0
        };
    }

    /**
     * Get hypersphere influence strength (0-1)
     * How much the spherical shell warping affects the geometry
     * @returns {number}
     */
    getHypersphereInfluence() {
        return 0.35 + (this.coreIndex === 1 ? 0.35 : 0.0);
    }

    /**
     * Get hypertetrahedron influence strength (0-1)
     * How much the tetrahedral plane warping affects the geometry
     * @returns {number}
     */
    getHypertetraInfluence() {
        return 0.45 + (this.coreIndex === 2 ? 0.4 : 0.0);
    }
}
