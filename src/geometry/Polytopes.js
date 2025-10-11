/**
 * Polytopes.js - 20+ 4D Geometry Generators
 * Expanded geometry library for VIB34D
 *
 * A Paul Phillips Manifestation
 */

export class Polytopes {
    /**
     * Generate vertices for various 4D polytopes
     */

    // ==================== REGULAR POLYTOPES ====================

    static generate5Cell(size = 1) {
        // 4-Simplex (Pentachoron) - 5 vertices, 10 edges, 10 faces, 5 cells
        const vertices = [];
        const phi = Math.sqrt(5) * size;

        vertices.push([1, 1, 1, -1/phi]);
        vertices.push([1, -1, -1, -1/phi]);
        vertices.push([-1, 1, -1, -1/phi]);
        vertices.push([-1, -1, 1, -1/phi]);
        vertices.push([0, 0, 0, phi]);

        return vertices;
    }

    static generate16Cell(size = 1) {
        // Hyperoctahedron - 8 vertices, 24 edges, 32 faces, 16 cells
        const vertices = [];
        const s = size;

        // 4D orthoplex vertices (±1 on each axis)
        vertices.push([s, 0, 0, 0]);
        vertices.push([-s, 0, 0, 0]);
        vertices.push([0, s, 0, 0]);
        vertices.push([0, -s, 0, 0]);
        vertices.push([0, 0, s, 0]);
        vertices.push([0, 0, -s, 0]);
        vertices.push([0, 0, 0, s]);
        vertices.push([0, 0, 0, -s]);

        return vertices;
    }

    static generate24Cell(size = 1) {
        // 24-Cell - 24 vertices, 96 edges, 96 faces, 24 cells
        const vertices = [];
        const s = size;

        // All permutations of (±1, ±1, 0, 0)
        const perms = [
            [1, 1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [-1, -1, 0, 0],
            [1, 0, 1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [-1, 0, -1, 0],
            [1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, 1], [-1, 0, 0, -1],
            [0, 1, 1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, -1, -1, 0],
            [0, 1, 0, 1], [0, 1, 0, -1], [0, -1, 0, 1], [0, -1, 0, -1],
            [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, -1, -1]
        ];

        perms.forEach(p => vertices.push(p.map(x => x * s)));
        return vertices;
    }

    static generate120Cell(size = 1, detail = 2) {
        // 120-Cell (600 vertices) - simplified to fewer for performance
        // Using golden ratio construction
        const vertices = [];
        const phi = (1 + Math.sqrt(5)) / 2;
        const s = size * 0.5;

        // Generate subset of 120-cell vertices
        for (let i = 0; i < detail * 10; i++) {
            const angle = (i / (detail * 10)) * Math.PI * 2;
            vertices.push([
                Math.cos(angle) * s,
                Math.sin(angle) * s,
                Math.cos(angle * phi) * s,
                Math.sin(angle * phi) * s
            ]);
        }

        return vertices;
    }

    static generateHypercube(size = 1) {
        // Tesseract - 16 vertices, 32 edges, 24 faces, 8 cells
        const vertices = [];
        const s = size;

        for (let w = -1; w <= 1; w += 2) {
            for (let z = -1; z <= 1; z += 2) {
                for (let y = -1; y <= 1; y += 2) {
                    for (let x = -1; x <= 1; x += 2) {
                        vertices.push([x * s, y * s, z * s, w * s]);
                    }
                }
            }
        }

        return vertices;
    }

    // ==================== CURVED SURFACES ====================

    static generateHypersphere(size = 1, segments = 20) {
        // 4D Hypersphere using spherical coordinates
        const vertices = [];
        const s = size;

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI;
            for (let j = 0; j <= segments; j++) {
                const phi = (j / segments) * Math.PI * 2;
                for (let k = 0; k <= segments / 2; k++) {
                    const psi = (k / (segments / 2)) * Math.PI;

                    const x = s * Math.sin(theta) * Math.cos(phi) * Math.sin(psi);
                    const y = s * Math.sin(theta) * Math.sin(phi) * Math.sin(psi);
                    const z = s * Math.cos(theta) * Math.sin(psi);
                    const w = s * Math.cos(psi);

                    vertices.push([x, y, z, w]);
                }
            }
        }

        return vertices;
    }

    static generateHopfFibration(size = 1, segments = 15) {
        // Hopf Fibration - S³ → S² with circular fibers
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;

                const x = s * Math.cos(u) * Math.cos(v);
                const y = s * Math.cos(u) * Math.sin(v);
                const z = s * Math.sin(u) * Math.cos(v);
                const w = s * Math.sin(u) * Math.sin(v);

                vertices.push([x, y, z, w]);
            }
        }

        return vertices;
    }

    static generateCliffordTorus(size = 1, segments = 20) {
        // Clifford Torus - flat torus embedded in S³
        const vertices = [];
        const s = size * 0.7; // Scale for visualization

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;

                const x = s * Math.cos(u);
                const y = s * Math.sin(u);
                const z = s * Math.cos(v);
                const w = s * Math.sin(v);

                vertices.push([x, y, z, w]);
            }
        }

        return vertices;
    }

    static generateDuocylinder(size = 1, segments = 20) {
        // Duocylinder - Cartesian product of two circles
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;

                vertices.push([
                    s * Math.cos(u),
                    s * Math.sin(u),
                    s * Math.cos(v),
                    s * Math.sin(v)
                ]);
            }
        }

        return vertices;
    }

    static generateSpheritorus(size = 1, segments = 15) {
        // Spheritorus - 3-sphere rotated around axis
        const vertices = [];
        const s = size;
        const r = s * 0.3; // Inner radius

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI;
                for (let k = 0; k < segments; k++) {
                    const w = (k / segments) * Math.PI * 2;

                    const x = (s + r * Math.cos(v)) * Math.cos(u);
                    const y = (s + r * Math.cos(v)) * Math.sin(u);
                    const z = r * Math.sin(v) * Math.cos(w);
                    const w4 = r * Math.sin(v) * Math.sin(w);

                    vertices.push([x, y, z, w4]);
                }
            }
        }

        return vertices;
    }

    // ==================== SPECIAL SURFACES ====================

    static generateKleinBottle4D(size = 1, segments = 20) {
        // 4D Klein Bottle (immersed without self-intersection)
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;

                const r = s * (2 + Math.cos(v));
                const x = r * Math.cos(u);
                const y = r * Math.sin(u);
                const z = s * Math.sin(v) * Math.cos(u / 2);
                const w = s * Math.sin(v) * Math.sin(u / 2);

                vertices.push([x, y, z, w]);
            }
        }

        return vertices;
    }

    static generateMobiusStrip4D(size = 1, segments = 20) {
        // 4D Mobius Strip with twist in 4th dimension
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = -1; j <= 1; j += 0.2) {
                const v = j;

                const twist = u / 2;
                const x = (s + v * Math.cos(twist)) * Math.cos(u);
                const y = (s + v * Math.cos(twist)) * Math.sin(u);
                const z = v * Math.sin(twist) * Math.cos(u);
                const w = v * Math.sin(twist) * Math.sin(u);

                vertices.push([x, y, z, w]);
            }
        }

        return vertices;
    }

    static generateCalabiYau(size = 1, segments = 10) {
        // Simplified Calabi-Yau manifold approximation
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI * 2;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;

                const x = s * Math.cos(u) * (1 + 0.3 * Math.sin(3 * v));
                const y = s * Math.sin(u) * (1 + 0.3 * Math.sin(3 * v));
                const z = s * Math.cos(v) * (1 + 0.3 * Math.sin(3 * u));
                const w = s * Math.sin(v) * (1 + 0.3 * Math.sin(3 * u));

                vertices.push([x, y, z, w]);
            }
        }

        return vertices;
    }

    // ==================== FRACTALS ====================

    static generateTesseractFractal(size = 1, iterations = 2) {
        // Recursive tesseract subdivision
        const vertices = [];

        function subdivide(center, s, depth) {
            if (depth === 0) {
                vertices.push(center);
                return;
            }

            const half = s / 3;
            for (let w = -1; w <= 1; w++) {
                for (let z = -1; z <= 1; z++) {
                    for (let y = -1; y <= 1; y++) {
                        for (let x = -1; x <= 1; x++) {
                            if (x === 0 && y === 0 && z === 0 && w === 0) continue;
                            subdivide([
                                center[0] + x * half,
                                center[1] + y * half,
                                center[2] + z * half,
                                center[3] + w * half
                            ], half, depth - 1);
                        }
                    }
                }
            }
        }

        subdivide([0, 0, 0, 0], size, iterations);
        return vertices;
    }

    static generateSierpinski4D(size = 1, iterations = 3) {
        // 4D Sierpinski Gasket
        const vertices = [];
        const s = size;

        // Base 5-cell vertices
        const base = Polytopes.generate5Cell(s);

        function subdivide(verts, depth) {
            if (depth === 0) {
                verts.forEach(v => vertices.push(v));
                return;
            }

            // Generate midpoints
            for (let i = 0; i < verts.length; i++) {
                for (let j = i + 1; j < verts.length; j++) {
                    const mid = [
                        (verts[i][0] + verts[j][0]) / 2,
                        (verts[i][1] + verts[j][1]) / 2,
                        (verts[i][2] + verts[j][2]) / 2,
                        (verts[i][3] + verts[j][3]) / 2
                    ];
                    subdivide([verts[i], mid], depth - 1);
                }
            }
        }

        subdivide(base, iterations);
        return vertices;
    }

    static generateQuaternionJulia(size = 1, segments = 15, c = [0, 0.5, 0, 0]) {
        // Quaternion Julia Set in 4D
        const vertices = [];
        const s = size;
        const maxIter = 10;

        for (let i = 0; i < segments; i++) {
            const x = (i / segments - 0.5) * 2 * s;
            for (let j = 0; j < segments; j++) {
                const y = (j / segments - 0.5) * 2 * s;
                for (let k = 0; k < segments; k++) {
                    const z = (k / segments - 0.5) * 2 * s;
                    for (let l = 0; l < segments; l++) {
                        const w = (l / segments - 0.5) * 2 * s;

                        let qx = x, qy = y, qz = z, qw = w;
                        let iter = 0;

                        while (iter < maxIter && qx*qx + qy*qy + qz*qz + qw*qw < 4) {
                            // Quaternion multiplication
                            const tx = qx*qx - qy*qy - qz*qz - qw*qw + c[0];
                            const ty = 2*qx*qy + c[1];
                            const tz = 2*qx*qz + c[2];
                            const tw = 2*qx*qw + c[3];
                            qx = tx; qy = ty; qz = tz; qw = tw;
                            iter++;
                        }

                        if (iter >= maxIter) {
                            vertices.push([x, y, z, w]);
                        }
                    }
                }
            }
        }

        return vertices;
    }

    // ==================== DYNAMIC/CHAOTIC ====================

    static generateLorenz4D(size = 1, segments = 100) {
        // 4D Lorenz Attractor
        const vertices = [];
        const s = size * 0.1;

        let x = 0.1, y = 0, z = 0, w = 0;
        const dt = 0.01;
        const sigma = 10, rho = 28, beta = 8/3, mu = 1;

        for (let i = 0; i < segments; i++) {
            const dx = sigma * (y - x);
            const dy = x * (rho - z) - y;
            const dz = x * y - beta * z;
            const dw = mu * (x - w);

            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
            w += dw * dt;

            vertices.push([x * s, y * s, z * s, w * s]);
        }

        return vertices;
    }

    static generateLissajous4D(size = 1, segments = 50, freq = [1, 2, 3, 4]) {
        // 4D Lissajous Curves
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const t = (i / segments) * Math.PI * 2;

            vertices.push([
                s * Math.sin(freq[0] * t),
                s * Math.sin(freq[1] * t),
                s * Math.sin(freq[2] * t),
                s * Math.sin(freq[3] * t)
            ]);
        }

        return vertices;
    }

    // ==================== SLICED PROJECTIONS ====================

    static generateHypersphereSlices(size = 1, slices = 10, segments = 20) {
        // Multiple 3D slices through 4D hypersphere
        const vertices = [];
        const s = size;

        for (let slice = 0; slice < slices; slice++) {
            const w = (slice / (slices - 1) - 0.5) * 2 * s;
            const r = Math.sqrt(Math.max(0, s*s - w*w));

            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI;
                for (let j = 0; j <= segments; j++) {
                    const phi = (j / segments) * Math.PI * 2;

                    const x = r * Math.sin(theta) * Math.cos(phi);
                    const y = r * Math.sin(theta) * Math.sin(phi);
                    const z = r * Math.cos(theta);

                    vertices.push([x, y, z, w]);
                }
            }
        }

        return vertices;
    }

    static generateStereographicProjection(size = 1, segments = 20) {
        // Stereographic projection from S³ to R³
        const vertices = [];
        const s = size;

        for (let i = 0; i < segments; i++) {
            const u = (i / segments) * Math.PI;
            for (let j = 0; j < segments; j++) {
                const v = (j / segments) * Math.PI * 2;
                for (let k = 0; k < segments; k++) {
                    const w = (k / segments) * Math.PI * 2;

                    // Point on S³
                    const x = Math.sin(u) * Math.cos(v);
                    const y = Math.sin(u) * Math.sin(v);
                    const z = Math.cos(u) * Math.cos(w);
                    const w4 = Math.cos(u) * Math.sin(w);

                    // Stereographic projection (avoid singularity)
                    if (w4 < 0.99) {
                        const scale = s / (1 - w4);
                        vertices.push([x * scale, y * scale, z * scale, 0]);
                    }
                }
            }
        }

        return vertices;
    }

    // ==================== HYPERBOLIC ====================

    static generateHyperbolicTesseract(size = 1, curvature = 0.3) {
        // Hyperbolic space tesseract
        const vertices = Polytopes.generateHypercube(size);
        const k = curvature;

        return vertices.map(v => {
            const r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2] + v[3]*v[3]);
            const scale = Math.sinh(r * k) / (r * k || 1);
            return v.map(x => x * scale);
        });
    }

    static generatePenroseTiling4D(size = 1, segments = 15) {
        // 4D Penrose-like quasicrystal tiling
        const vertices = [];
        const s = size;
        const phi = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                for (let k = 0; k < segments; k++) {
                    for (let l = 0; l < segments; l++) {
                        const x = (i - segments/2) * s / segments;
                        const y = (j - segments/2) * s / segments;
                        const z = (k - segments/2) * s / segments;
                        const w = (l - segments/2) * s / segments;

                        // Penrose-like lattice condition
                        const val = Math.cos(x * phi) + Math.cos(y * phi) +
                                  Math.cos(z * phi) + Math.cos(w * phi);

                        if (Math.abs(val) > 3) {
                            vertices.push([x, y, z, w]);
                        }
                    }
                }
            }
        }

        return vertices;
    }

    // ==================== UTILITY ====================

    static getAllGeometryNames() {
        return [
            '5-Cell (Pentachoron)',
            '16-Cell (Hyperoctahedron)',
            '24-Cell',
            '120-Cell',
            'Hypercube (Tesseract)',
            'Hypersphere',
            'Hopf Fibration',
            'Clifford Torus',
            'Duocylinder',
            'Spheritorus',
            'Klein Bottle 4D',
            'Mobius Strip 4D',
            'Calabi-Yau',
            'Tesseract Fractal',
            'Sierpinski 4D',
            'Quaternion Julia',
            'Lorenz 4D',
            'Lissajous 4D',
            'Hypersphere Slices',
            'Stereographic Projection',
            'Hyperbolic Tesseract',
            'Penrose Tiling 4D'
        ];
    }

    static getGeometry(name, size = 1, params = {}) {
        const map = {
            '5-Cell (Pentachoron)': () => Polytopes.generate5Cell(size),
            '16-Cell (Hyperoctahedron)': () => Polytopes.generate16Cell(size),
            '24-Cell': () => Polytopes.generate24Cell(size),
            '120-Cell': () => Polytopes.generate120Cell(size, params.detail || 2),
            'Hypercube (Tesseract)': () => Polytopes.generateHypercube(size),
            'Hypersphere': () => Polytopes.generateHypersphere(size, params.segments || 20),
            'Hopf Fibration': () => Polytopes.generateHopfFibration(size, params.segments || 15),
            'Clifford Torus': () => Polytopes.generateCliffordTorus(size, params.segments || 20),
            'Duocylinder': () => Polytopes.generateDuocylinder(size, params.segments || 20),
            'Spheritorus': () => Polytopes.generateSpheritorus(size, params.segments || 15),
            'Klein Bottle 4D': () => Polytopes.generateKleinBottle4D(size, params.segments || 20),
            'Mobius Strip 4D': () => Polytopes.generateMobiusStrip4D(size, params.segments || 20),
            'Calabi-Yau': () => Polytopes.generateCalabiYau(size, params.segments || 10),
            'Tesseract Fractal': () => Polytopes.generateTesseractFractal(size, params.iterations || 2),
            'Sierpinski 4D': () => Polytopes.generateSierpinski4D(size, params.iterations || 3),
            'Quaternion Julia': () => Polytopes.generateQuaternionJulia(size, params.segments || 15, params.c || [0, 0.5, 0, 0]),
            'Lorenz 4D': () => Polytopes.generateLorenz4D(size, params.segments || 100),
            'Lissajous 4D': () => Polytopes.generateLissajous4D(size, params.segments || 50, params.freq || [1, 2, 3, 4]),
            'Hypersphere Slices': () => Polytopes.generateHypersphereSlices(size, params.slices || 10, params.segments || 20),
            'Stereographic Projection': () => Polytopes.generateStereographicProjection(size, params.segments || 20),
            'Hyperbolic Tesseract': () => Polytopes.generateHyperbolicTesseract(size, params.curvature || 0.3),
            'Penrose Tiling 4D': () => Polytopes.generatePenroseTiling4D(size, params.segments || 15)
        };

        return map[name] ? map[name]() : Polytopes.generateHypercube(size);
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 */
