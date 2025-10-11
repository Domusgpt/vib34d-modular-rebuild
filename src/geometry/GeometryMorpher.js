/**
 * GeometryMorpher.js - Geometry Blending & Morphing System
 * Smoothly interpolate between different 4D geometries
 *
 * A Paul Phillips Manifestation
 */

export class GeometryMorpher {
    constructor() {
        this.sourceGeometry = null;
        this.targetGeometry = null;
        this.morphProgress = 0; // 0 = source, 1 = target
        this.morphSpeed = 0.02;
        this.autoMorph = false;
        this.pingPong = true; // Reverse direction at endpoints
        this.morphDirection = 1; // 1 = forward, -1 = backward
    }

    /**
     * Set source and target geometries for morphing
     */
    setGeometries(source, target) {
        this.sourceGeometry = this.normalizeVertexCount(source);
        this.targetGeometry = this.normalizeVertexCount(target);
        this.morphProgress = 0;
    }

    /**
     * Normalize vertex counts between two geometries
     * Uses interpolation/decimation to match counts
     */
    normalizeVertexCount(vertices) {
        return vertices;
    }

    /**
     * Match vertex counts between geometries
     */
    matchVertexCounts(source, target) {
        const sourceCount = source.length;
        const targetCount = target.length;

        if (sourceCount === targetCount) {
            return { source, target };
        }

        // Interpolate to match counts
        if (sourceCount < targetCount) {
            return {
                source: this.interpolateVertices(source, targetCount),
                target
            };
        } else {
            return {
                source,
                target: this.interpolateVertices(target, sourceCount)
            };
        }
    }

    /**
     * Interpolate vertices to reach target count
     */
    interpolateVertices(vertices, targetCount) {
        if (vertices.length === 0) return vertices;
        if (vertices.length === targetCount) return vertices;

        const result = [];
        const ratio = vertices.length / targetCount;

        for (let i = 0; i < targetCount; i++) {
            const sourceIndex = i * ratio;
            const index1 = Math.floor(sourceIndex);
            const index2 = Math.ceil(sourceIndex) % vertices.length;
            const t = sourceIndex - index1;

            const v1 = vertices[index1];
            const v2 = vertices[index2];

            result.push([
                v1[0] * (1 - t) + v2[0] * t,
                v1[1] * (1 - t) + v2[1] * t,
                v1[2] * (1 - t) + v2[2] * t,
                v1[3] * (1 - t) + v2[3] * t
            ]);
        }

        return result;
    }

    /**
     * Update morph progress
     */
    update(deltaTime = 0.016) {
        if (!this.autoMorph) return;

        this.morphProgress += this.morphSpeed * this.morphDirection * (deltaTime / 0.016);

        if (this.pingPong) {
            if (this.morphProgress >= 1) {
                this.morphProgress = 1;
                this.morphDirection = -1;
            } else if (this.morphProgress <= 0) {
                this.morphProgress = 0;
                this.morphDirection = 1;
            }
        } else {
            this.morphProgress = (this.morphProgress % 1 + 1) % 1;
        }
    }

    /**
     * Get current morphed geometry
     */
    getMorphedGeometry() {
        if (!this.sourceGeometry || !this.targetGeometry) {
            return this.sourceGeometry || this.targetGeometry || [];
        }

        const matched = this.matchVertexCounts(this.sourceGeometry, this.targetGeometry);
        const t = this.easeInOutCubic(this.morphProgress);

        return matched.source.map((v1, i) => {
            const v2 = matched.target[i];
            return [
                v1[0] * (1 - t) + v2[0] * t,
                v1[1] * (1 - t) + v2[1] * t,
                v1[2] * (1 - t) + v2[2] * t,
                v1[3] * (1 - t) + v2[3] * t
            ];
        });
    }

    /**
     * Blend multiple geometries with weights
     */
    blendGeometries(geometries, weights) {
        if (geometries.length === 0) return [];
        if (geometries.length === 1) return geometries[0];

        // Normalize weights
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const normalizedWeights = weights.map(w => w / totalWeight);

        // Find max vertex count
        const maxCount = Math.max(...geometries.map(g => g.length));

        // Interpolate all geometries to match max count
        const interpolated = geometries.map(g => this.interpolateVertices(g, maxCount));

        // Blend
        const result = [];
        for (let i = 0; i < maxCount; i++) {
            const blended = [0, 0, 0, 0];

            for (let j = 0; j < interpolated.length; j++) {
                const vertex = interpolated[j][i];
                const weight = normalizedWeights[j];

                blended[0] += vertex[0] * weight;
                blended[1] += vertex[1] * weight;
                blended[2] += vertex[2] * weight;
                blended[3] += vertex[3] * weight;
            }

            result.push(blended);
        }

        return result;
    }

    /**
     * Easing function for smooth morphing
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Alternative easing functions
     */
    easeLinear(t) {
        return t;
    }

    easeInQuad(t) {
        return t * t;
    }

    easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }

    easeInOutQuad(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    easeInElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0
            : t === 1 ? 1
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }

    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0
            : t === 1 ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    easeInOutElastic(t) {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0
            : t === 1 ? 1
            : t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    }

    easeInBounce(t) {
        return 1 - this.easeOutBounce(1 - t);
    }

    easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }

    easeInOutBounce(t) {
        return t < 0.5
            ? (1 - this.easeOutBounce(1 - 2 * t)) / 2
            : (1 + this.easeOutBounce(2 * t - 1)) / 2;
    }

    /**
     * Set easing function by name
     */
    setEasing(easingName) {
        const easings = {
            'linear': this.easeLinear,
            'in-quad': this.easeInQuad,
            'out-quad': this.easeOutQuad,
            'in-out-quad': this.easeInOutQuad,
            'in-out-cubic': this.easeInOutCubic,
            'in-elastic': this.easeInElastic,
            'out-elastic': this.easeOutElastic,
            'in-out-elastic': this.easeInOutElastic,
            'in-bounce': this.easeInBounce,
            'out-bounce': this.easeOutBounce,
            'in-out-bounce': this.easeInOutBounce
        };

        if (easings[easingName]) {
            this.easingFunction = easings[easingName].bind(this);
        }
    }

    /**
     * Sphere-based morphing (maintain topology)
     */
    sphericalMorph(source, target, t) {
        const matched = this.matchVertexCounts(source, target);

        return matched.source.map((v1, i) => {
            const v2 = matched.target[i];

            // Convert to spherical coordinates
            const r1 = Math.sqrt(v1[0]**2 + v1[1]**2 + v1[2]**2 + v1[3]**2);
            const r2 = Math.sqrt(v2[0]**2 + v2[1]**2 + v2[2]**2 + v2[3]**2);

            // Interpolate radius
            const r = r1 * (1 - t) + r2 * t;

            // Interpolate direction (SLERP)
            const dot = (v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2] + v1[3]*v2[3]) / (r1 * r2);
            const theta = Math.acos(Math.max(-1, Math.min(1, dot)));

            if (theta < 0.001) {
                // Nearly parallel - use linear interpolation
                return [
                    v1[0] * (1 - t) + v2[0] * t,
                    v1[1] * (1 - t) + v2[1] * t,
                    v1[2] * (1 - t) + v2[2] * t,
                    v1[3] * (1 - t) + v2[3] * t
                ];
            }

            const sinTheta = Math.sin(theta);
            const w1 = Math.sin((1 - t) * theta) / sinTheta;
            const w2 = Math.sin(t * theta) / sinTheta;

            return [
                (v1[0] * w1 + v2[0] * w2) * r / r1,
                (v1[1] * w1 + v2[1] * w2) * r / r1,
                (v1[2] * w1 + v2[2] * w2) * r / r1,
                (v1[3] * w1 + v2[3] * w2) * r / r1
            ];
        });
    }

    /**
     * Chaotic morph (add noise during transition)
     */
    chaoticMorph(source, target, t, chaosAmount = 0.3) {
        const matched = this.matchVertexCounts(source, target);
        const chaos = Math.sin(t * Math.PI) * chaosAmount; // Peaks at t=0.5

        return matched.source.map((v1, i) => {
            const v2 = matched.target[i];

            const noise = [
                (Math.random() - 0.5) * chaos,
                (Math.random() - 0.5) * chaos,
                (Math.random() - 0.5) * chaos,
                (Math.random() - 0.5) * chaos
            ];

            return [
                v1[0] * (1 - t) + v2[0] * t + noise[0],
                v1[1] * (1 - t) + v2[1] * t + noise[1],
                v1[2] * (1 - t) + v2[2] * t + noise[2],
                v1[3] * (1 - t) + v2[3] * t + noise[3]
            ];
        });
    }

    /**
     * Radial morph (expand/contract through origin)
     */
    radialMorph(source, target, t) {
        const matched = this.matchVertexCounts(source, target);

        // Contract to origin, then expand to target
        const contractionPhase = t < 0.5;
        const phaseT = contractionPhase ? t * 2 : (t - 0.5) * 2;

        if (contractionPhase) {
            // Contract source to origin
            return matched.source.map(v => v.map(x => x * (1 - phaseT)));
        } else {
            // Expand from origin to target
            return matched.target.map(v => v.map(x => x * phaseT));
        }
    }

    /**
     * Twist morph (rotate during transition)
     */
    twistMorph(source, target, t, twists = 2) {
        const matched = this.matchVertexCounts(source, target);
        const angle = t * twists * Math.PI * 2;

        return matched.source.map((v1, i) => {
            const v2 = matched.target[i];

            // Linear interpolation
            const blended = [
                v1[0] * (1 - t) + v2[0] * t,
                v1[1] * (1 - t) + v2[1] * t,
                v1[2] * (1 - t) + v2[2] * t,
                v1[3] * (1 - t) + v2[3] * t
            ];

            // Apply 4D rotation (XY plane)
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            return [
                blended[0] * cos - blended[1] * sin,
                blended[0] * sin + blended[1] * cos,
                blended[2],
                blended[3]
            ];
        });
    }

    /**
     * Get morph type by name
     */
    getMorphFunction(type) {
        const morphFunctions = {
            'linear': (s, t, p) => this.getMorphedGeometry(),
            'spherical': (s, t, p) => this.sphericalMorph(s, t, p),
            'chaotic': (s, t, p) => this.chaoticMorph(s, t, p),
            'radial': (s, t, p) => this.radialMorph(s, t, p),
            'twist': (s, t, p) => this.twistMorph(s, t, p)
        };

        return morphFunctions[type] || morphFunctions['linear'];
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 */
