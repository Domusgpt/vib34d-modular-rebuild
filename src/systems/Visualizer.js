/**
 * VIB34D Integrated Holographic Visualizer
 * WebGL-based renderer for individual holographic layers
 */

import { GeometryLibrary } from '../geometry/GeometryLibrary.js';

export class IntegratedHolographicVisualizer {
    constructor(canvasId, role, reactivity, variant) {
        this.canvas = document.getElementById(canvasId);
        this.role = role;
        this.reactivity = reactivity;
        this.variant = variant;
        
        if (!this.canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }
        let rect = this.canvas.getBoundingClientRect();
        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
        
        // Store context options for later use
        this.contextOptions = {
            alpha: true,
            depth: true,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
        };
        
        // CRITICAL FIX: Ensure canvas is properly sized BEFORE creating WebGL context
        this.ensureCanvasSizedThenInitWebGL(rect, devicePixelRatio);
        
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.startTime = Date.now();
        
        // Default parameters
        this.params = {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.5,
            saturation: 0.8,
            dimension: 3.5,
            // All 6 4D rotation planes
            rot4dXY: 0.0,
            rot4dXZ: 0.0,
            rot4dYZ: 0.0,
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0,
            // MVEP-style audio reactivity enhancements
            moireScale: 1.01,
            glitchIntensity: 0.05,
            lineThickness: 0.02
        };
        
        // Initialization now happens in ensureCanvasSizedThenInitWebGL after sizing
        // this.init(); // MOVED
    }
    
    /**
     * CRITICAL FIX: Ensure canvas is properly sized before creating WebGL context
     */
    async ensureCanvasSizedThenInitWebGL(rect, devicePixelRatio) {
        // If canvas has no dimensions, wait for layout or use viewport
        if (rect.width === 0 || rect.height === 0) {
            // Wait for layout with promise
            await new Promise(resolve => {
                setTimeout(() => {
                    rect = this.canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        // Use viewport dimensions as fallback
                        const viewWidth = window.innerWidth;
                        const viewHeight = window.innerHeight;
                        this.canvas.width = viewWidth * devicePixelRatio;
                        this.canvas.height = viewHeight * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`);
                        }
                    } else {
                        this.canvas.width = rect.width * devicePixelRatio;
                        this.canvas.height = rect.height * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);
                        }
                    }
                    resolve();
                }, 100);
            });
        } else {
            this.canvas.width = rect.width * devicePixelRatio;
            this.canvas.height = rect.height * devicePixelRatio;
            
            if (window.mobileDebug) {
                window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${devicePixelRatio})`);
            }
        }
        
        // NOW create WebGL context with properly sized canvas
        this.createWebGLContext();
        
        // Initialize rendering pipeline
        if (this.gl) {
            this.init();
        }
    }
    
    /**
     * Create WebGL context after canvas is properly sized
     */
    createWebGLContext() {
        // CRITICAL FIX: Check if context already exists from CanvasManager
        let existingContext = this.canvas.getContext('webgl2') || 
                             this.canvas.getContext('webgl') || 
                             this.canvas.getContext('experimental-webgl');
        
        if (existingContext && !existingContext.isContextLost()) {
            console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`);
            this.gl = existingContext;
            return;
        }
        
        // Try WebGL2 first (better mobile support), then WebGL1
        this.gl = this.canvas.getContext('webgl2', this.contextOptions) || 
                  this.canvas.getContext('webgl', this.contextOptions) ||
                  this.canvas.getContext('experimental-webgl', this.contextOptions);
        
        if (!this.gl) {
            console.error(`WebGL not supported for ${this.canvas.id}`);
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ WebGL context failed for ${this.canvas.id} (size: ${this.canvas.width}x${this.canvas.height})`);
            }
            // Show user-friendly error instead of white screen
            this.showWebGLError();
            return;
        } else {
            if (window.mobileDebug) {
                const version = this.gl.getParameter(this.gl.VERSION);
                window.mobileDebug.log(`✅ WebGL context created for ${this.canvas.id}: ${version} (size: ${this.canvas.width}x${this.canvas.height})`);
            }
        }
    }

    /**
     * Initialize WebGL rendering pipeline
     */
    init() {
        this.initShaders();
        this.initBuffers();
        this.resize();
    }
    
    /**
     * Initialize shaders with 4D mathematics
     */
    initShaders() {
        const vertexShaderSource = `attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
        
        const fragmentShaderSource = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// MVEP-style audio reactivity enhancements
uniform float u_moireScale;
uniform float u_glitchIntensity;
uniform float u_lineThickness;

// Additional uniforms for polytope system
uniform float u_rot4dXY;
uniform float u_rot4dXZ;
uniform float u_rot4dYZ;
uniform float u_audioHigh;
uniform float u_audioMid;

// 6 Independent 4D rotation matrices
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

// 4D to 3D projection
vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// Interactive 4D rotation with mouse, scroll, and touch
vec4 applyInteractiveRotation(vec4 pos, vec2 mouseOffset, float scrollRotation, float touchRotation) {
    float timeFactor = u_time * 0.0004 * u_speed;
    float audioOffset = (u_chaos + u_morphFactor) * 0.2;

    // AMPLIFIED MANUAL ROTATIONS - User control is 5x stronger than auto-rotation
    pos = rotateXY(u_rot4dXY * 5.0 + timeFactor * 0.18 + mouseOffset.x * 0.4 + scrollRotation * 0.15) * pos;
    pos = rotateXZ(u_rot4dXZ * 5.0 + timeFactor * 0.16 + mouseOffset.y * 0.35 + touchRotation * 0.2) * pos;
    pos = rotateYZ(u_rot4dYZ * 5.0 + timeFactor * 0.12 + u_clickIntensity * 0.2) * pos;
    pos = rotateXW(u_rot4dXW * 5.0 + timeFactor * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * pos;
    pos = rotateYW(u_rot4dYW * 5.0 + timeFactor * 0.15 + mouseOffset.x * 0.5 + touchRotation) * pos;
    pos = rotateZW(u_rot4dZW * 5.0 + timeFactor * 0.25 + u_clickIntensity * 0.3 + audioOffset) * pos;
    return pos;
}

// Hypersphere core warping (coreIndex = 1) - AMPLIFIED
vec3 warpHypersphereCore(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
    float radius = length(p);
    float morphBlend = clamp(u_morphFactor + u_audioMid * 0.5, 0.0, 2.0);
    float audioLift = (u_audioHigh * 0.5 + u_audioMid * 0.35);

    // AMPLIFIED: Stronger radial oscillation and W coordinate
    float w = sin(radius * (2.0 + float(geometryIndex) * 0.15) + u_time * 0.002 * u_speed);
    w *= (0.8 + morphBlend * 0.8 + audioLift);  // 2x stronger

    vec4 p4d = vec4(p * (1.0 + morphBlend * 0.5), w);
    p4d = applyInteractiveRotation(p4d, mouseOffset, scrollRotation, touchRotation);
    vec3 projected = project4Dto3D(p4d);

    // AMPLIFIED: Much stronger blending - spherical warping is obvious
    float blend = clamp(0.7 + morphBlend * 0.3, 0.0, 1.0);
    return mix(p, projected, blend);
}

// Hypertetrahedron core warping (coreIndex = 2) - AMPLIFIED
vec3 warpHypertetraCore(vec3 p, int geometryIndex, vec2 mouseOffset, float scrollRotation, float touchRotation) {
    vec3 c1 = normalize(vec3(1.0, 1.0, 1.0));
    vec3 c2 = normalize(vec3(-1.0, -1.0, 1.0));
    vec3 c3 = normalize(vec3(-1.0, 1.0, -1.0));
    vec3 c4 = normalize(vec3(1.0, -1.0, -1.0));

    float morphBlend = clamp(u_morphFactor * 0.8 + u_audioHigh * 0.4, 0.0, 2.0);

    // AMPLIFIED: Stronger tetrahedral basis mixing
    float basisMix = dot(p, c1) * 0.25 + dot(p, c2) * 0.18 + dot(p, c3) * 0.12;
    float w = sin(basisMix * 8.0 + u_time * 0.0015 * u_speed);
    w *= cos(dot(p, c4) * 6.0 - u_time * 0.0012 * u_speed);
    w *= (0.9 + morphBlend * 0.7 + u_audioHigh * 0.5);  // 2x stronger

    // AMPLIFIED: Stronger offset for tetrahedral structure
    vec3 offset = vec3(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.25 * morphBlend;
    vec4 p4d = vec4(p + offset, w);
    p4d = applyInteractiveRotation(p4d, mouseOffset, scrollRotation, touchRotation);
    vec3 projected = project4Dto3D(p4d);

    // AMPLIFIED: Much stronger tetrahedral plane influence
    float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))), min(abs(dot(p, c3)), abs(dot(p, c4))));
    vec3 blended = mix(p, projected, clamp(0.75 + morphBlend * 0.25, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInfluence * 0.9), 0.6 + morphBlend * 0.4);
}

// Core warp dispatcher
vec3 applyCoreWarp(vec3 p, float geometryType, vec2 mouseOffset, float scrollRotation, float touchRotation) {
    float totalBase = 8.0;
    float coreFloat = floor(geometryType / totalBase);
    int coreIndex = int(clamp(coreFloat, 0.0, 2.0));
    float baseGeomFloat = mod(geometryType, totalBase);
    int geometryIndex = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

    if (coreIndex == 1) {
        return warpHypersphereCore(p, geometryIndex, mouseOffset, scrollRotation, touchRotation);
    }
    if (coreIndex == 2) {
        return warpHypertetraCore(p, geometryIndex, mouseOffset, scrollRotation, touchRotation);
    }

    return p; // Hypercube core (no warping)
}

// Enhanced VIB3 Geometry Library - 8 geometry styles
float tetrahedronLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;

    // Enhanced tetrahedron vertices with holographic shimmer
    float d1 = length(q);
    float d2 = length(q - vec3(0.35, 0.0, 0.0));
    float d3 = length(q - vec3(0.0, 0.35, 0.0));
    float d4 = length(q - vec3(0.0, 0.0, 0.35));
    float d5 = length(q - vec3(0.2, 0.2, 0.0));
    float d6 = length(q - vec3(0.2, 0.0, 0.2));
    float d7 = length(q - vec3(0.0, 0.2, 0.2));

    float vertices = 1.0 - smoothstep(0.0, 0.03, min(min(min(d1, d2), min(d3, d4)), min(min(d5, d6), d7)));

    // Enhanced edge network with interference patterns
    float edges = 0.0;
    float shimmer = sin(u_time * 0.002) * 0.02;
    edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xy) - (0.18 + shimmer))));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.yz) - (0.18 + shimmer * 0.8))));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xz) - (0.18 + shimmer * 1.2))));

    // Add interference patterns between vertices
    float interference = sin(d1 * 25.0 + u_time * 0.003) * sin(d2 * 22.0 + u_time * 0.0025) * 0.1;

    // Volumetric density based on distance field
    float volume = exp(-length(q) * 3.0) * 0.15;

    return max(vertices, edges * 0.7) + interference + volume;
}

float hypercubeLattice(vec3 p, float gridSize) {
    vec3 grid = fract(p * gridSize);
    vec3 q = grid - 0.5;

    // Enhanced hypercube with 4D projection effects
    vec3 edges = 1.0 - smoothstep(0.0, 0.025, abs(q));
    float wireframe = max(max(edges.x, edges.y), edges.z);

    // Add 4D hypercube vertices (8 corners + 8 hypervertices)
    float vertices = 0.0;
    for(int i = 0; i < 8; i++) {
        float iFloat = float(i);
        vec3 corner = vec3(
            floor(iFloat - floor(iFloat / 2.0) * 2.0) - 0.5,
            floor((iFloat / 2.0) - floor((iFloat / 2.0) / 2.0) * 2.0) - 0.5,
            float(i / 4) - 0.5
        );
        float dist = length(q - corner * 0.4);
        vertices = max(vertices, 1.0 - smoothstep(0.0, 0.04, dist));
    }

    // Holographic interference patterns
    float interference = sin(length(q) * 20.0 + u_time * 0.002) * 0.08;

    // Cross-dimensional glow
    float glow = exp(-length(q) * 2.5) * 0.12;

    return wireframe * 0.8 + vertices + interference + glow;
}

float sphereLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float r = length(q);
    return 1.0 - smoothstep(0.2, 0.5, r);
}

float torusLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float r1 = sqrt(q.x*q.x + q.y*q.y);
    float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
    return 1.0 - smoothstep(0.0, 0.1, r2);
}

float kleinLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize);
    float u = q.x * 2.0 * 3.14159;
    float v = q.y * 2.0 * 3.14159;
    float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
    float klein = length(vec2(x, q.z)) - 0.1;
    return 1.0 - smoothstep(0.0, 0.05, abs(klein));
}

float fractalLattice(vec3 p, float gridSize) {
    vec3 q = p * gridSize;
    float scale = 1.0;
    float fractal = 0.0;
    for(int i = 0; i < 4; i++) {
      q = fract(q) - 0.5;
      fractal += abs(length(q)) / scale;
      scale *= 2.0;
      q *= 2.0;
    }
    return 1.0 - smoothstep(0.0, 1.0, fractal);
}

float waveLattice(vec3 p, float gridSize) {
    vec3 q = p * gridSize;
    float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
    return smoothstep(-0.5, 0.5, wave);
}

float crystalLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
    return 1.0 - smoothstep(0.3, 0.5, d);
}

// Dynamic geometry with polytope core integration
float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
    float totalBase = 8.0;
    float coreFloat = clamp(floor(geometryType / totalBase), 0.0, 2.0);
    float baseGeomFloat = mod(geometryType, totalBase);
    int baseGeom = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

    float variation = coreFloat / 2.0;
    float variedGridSize = gridSize * mix(0.85, 1.25, variation);

    float baseValue;
    if (baseGeom == 0) baseValue = tetrahedronLattice(p, variedGridSize);
    else if (baseGeom == 1) baseValue = hypercubeLattice(p, variedGridSize);
    else if (baseGeom == 2) baseValue = sphereLattice(p, variedGridSize);
    else if (baseGeom == 3) baseValue = torusLattice(p, variedGridSize);
    else if (baseGeom == 4) baseValue = kleinLattice(p, variedGridSize);
    else if (baseGeom == 5) baseValue = fractalLattice(p, variedGridSize);
    else if (baseGeom == 6) baseValue = waveLattice(p, variedGridSize);
    else baseValue = crystalLattice(p, variedGridSize);

    float hypersphereInfluence = 0.35 + variation * 0.35;
    float hypertetraInfluence = 0.45 + variation * 0.4;

    if (coreFloat == 1.0) {
        float radius = length(p);
        float shell = 0.5 + 0.5 * sin(radius * variedGridSize * 0.6 + u_time * 0.0006 * u_speed);
        baseValue = mix(baseValue, smoothstep(0.75, 1.0, shell), hypersphereInfluence);
    } else if (coreFloat == 2.0) {
        vec3 diag = normalize(vec3(1.0, 1.0, 1.0));
        float plane = abs(dot(normalize(p + 0.0001), diag));
        float striated = smoothstep(0.6, 1.0, plane);
        baseValue = mix(baseValue, striated, hypertetraInfluence);
    }

    return baseValue;
}

// MVEP-style moiré pattern function
float moirePattern(vec2 uv, float intensity) {
    float freq1 = 12.0 * u_moireScale + intensity * 6.0;
    float freq2 = 14.0 * u_moireScale + intensity * 8.0;
    float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
    float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
    return (pattern1 * pattern2) * intensity * 0.2 * u_moireScale;
}

// MVEP-style RGB color splitting glitch
vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
    vec2 offset = vec2(intensity * 0.005, 0.0);
    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);

    // 4D position with mouse interaction
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec3 pos3d = vec3(uv * 3.0, sin(timeSpeed * 3.0));
    vec2 mouseOffset = (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    pos3d.xy += mouseOffset;

    // Apply polytope core warping
    vec3 warpedPos = applyCoreWarp(pos3d, u_geometry, mouseOffset, 0.0, 0.0);

    // Calculate geometry with polytope system
    float gridSize = u_gridDensity * 0.08;
    float lattice = getDynamicGeometry(warpedPos, gridSize, u_geometry);

    // Apply line thickness
    lattice = lattice / u_lineThickness;

    // Apply chaos
    float noise = sin(warpedPos.x * 7.0) * cos(warpedPos.y * 11.0) * sin(warpedPos.z * 13.0);
    lattice += noise * u_chaos;

    // Color based on geometry value
    float geometryIntensity = lattice;
    geometryIntensity += u_clickIntensity * 0.3;
    float finalIntensity = geometryIntensity * u_intensity;

    float hue = u_hue / 360.0 + lattice * 0.1;

    // Create color with saturation control
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );

    // Apply saturation
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;

    // MVEP-style enhancements
    color += vec3(moirePattern(uv, u_glitchIntensity));
    color = rgbGlitch(color, uv, u_glitchIntensity);

    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}`;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            hue: this.gl.getUniformLocation(this.program, 'u_hue'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
            dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
            rot4dXY: this.gl.getUniformLocation(this.program, 'u_rot4dXY'),
            rot4dXZ: this.gl.getUniformLocation(this.program, 'u_rot4dXZ'),
            rot4dYZ: this.gl.getUniformLocation(this.program, 'u_rot4dYZ'),
            rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
            rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
            rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity'),
            audioHigh: this.gl.getUniformLocation(this.program, 'u_audioHigh'),
            audioMid: this.gl.getUniformLocation(this.program, 'u_audioMid'),
            moireScale: this.gl.getUniformLocation(this.program, 'u_moireScale'),
            glitchIntensity: this.gl.getUniformLocation(this.program, 'u_glitchIntensity'),
            lineThickness: this.gl.getUniformLocation(this.program, 'u_lineThickness')
        };
    }
    
    /**
     * Create WebGL program from shaders
     */
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    /**
     * Create individual shader
     */
    createShader(type, source) {
        // CRITICAL FIX: Check WebGL context state before shader operations
        if (!this.gl) {
            console.error('❌ Cannot create shader: WebGL context is null');
            return null;
        }
        
        if (this.gl.isContextLost()) {
            console.error('❌ Cannot create shader: WebGL context is lost');
            return null;
        }
        
        try {
            const shader = this.gl.createShader(type);
            
            if (!shader) {
                console.error('❌ Failed to create shader object - WebGL context may be invalid');
                return null;
            }
            
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                const error = this.gl.getShaderInfoLog(shader);
                const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
                
                // CRITICAL FIX: Show actual error instead of null
                if (error) {
                    console.error(`❌ ${shaderType} shader compilation failed:`, error);
                } else {
                    console.error(`❌ ${shaderType} shader compilation failed: WebGL returned no error info (context may be invalid)`);
                }
                
                console.error('Shader source:', source);
                this.gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        } catch (error) {
            console.error('❌ Exception during shader creation:', error);
            return null;
        }
    }
    
    /**
     * Initialize vertex buffers
     */
    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Resize canvas and viewport
     */
    resize() {
        // Mobile-optimized canvas sizing
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for mobile performance
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        // Only resize if dimensions actually changed (mobile optimization)
        if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Show user-friendly WebGL error message
     */
    showWebGLError() {
        if (!this.canvas) return;
        
        // Try 2D canvas fallback
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            
            ctx.fillStyle = '#1a0033';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Mobile-friendly error display
            ctx.fillStyle = '#ff6b6b';
            ctx.font = `${Math.min(20, this.canvas.width / 15)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ WebGL Error', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            ctx.fillStyle = '#ffd93d';
            ctx.font = `${Math.min(14, this.canvas.width / 20)}px sans-serif`;
            
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                ctx.fillText('Mobile device detected', this.canvas.width / 2, this.canvas.height / 2);
                ctx.fillText('Enable hardware acceleration', this.canvas.width / 2, this.canvas.height / 2 + 20);
                ctx.fillText('or try Chrome/Firefox', this.canvas.width / 2, this.canvas.height / 2 + 40);
            } else {
                ctx.fillText('Please enable WebGL', this.canvas.width / 2, this.canvas.height / 2);
                ctx.fillText('in your browser settings', this.canvas.width / 2, this.canvas.height / 2 + 20);
            }
            
            // Log to mobile debug
            if (window.mobileDebug) {
                window.mobileDebug.log(`📱 WebGL error fallback shown for canvas ${this.canvas.id}`);
            }
        } else {
            // Even 2D canvas failed - create HTML fallback
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #1a0033;
                    color: #ff6b6b;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-family: sans-serif;
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 18px; margin-bottom: 10px;">Graphics Error</div>
                    <div style="font-size: 14px; color: #ffd93d;">
                        Your device doesn't support<br>
                        the required graphics features
                    </div>
                </div>
            `;
            this.canvas.parentNode.insertBefore(errorDiv, this.canvas.nextSibling);
        }
    }
    
    /**
     * Update visualization parameters
     */
    updateParameters(params) {
        this.params = { ...this.params, ...params };
    }
    
    /**
     * Update mouse interaction state
     */
    updateInteraction(x, y, intensity) {
        // Check if interactions are enabled globally
        if (window.interactivityEnabled === false) {
            // Reset to default when disabled
            this.mouseX = 0.5;
            this.mouseY = 0.5;
            this.mouseIntensity = 0.0;
            return;
        }
        
        this.mouseX = x;
        this.mouseY = y;
        this.mouseIntensity = intensity;
    }
    
    /**
     * Render frame
     */
    render() {
        if (!this.program) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: No WebGL program compiled`);
            }
            return;
        }
        
        if (!this.gl) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: No WebGL context`);
            }
            return;
        }
        
        try {
            this.resize();
            this.gl.useProgram(this.program);
            
            // CRITICAL FIX: Clear framebuffer before rendering
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        } catch (error) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: WebGL render error: ${error.message}`);
            }
            return;
        }
        
        // Role-specific intensity (ORIGINAL FACETED VALUES)
        const roleIntensities = {
            'background': 0.3,
            'shadow': 0.5,
            'content': 0.8,
            'highlight': 1.0,
            'accent': 1.2
        };
        
        const time = Date.now() - this.startTime;
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);

        // 🎵 ENHANCED AUDIO REACTIVITY - Rich, musical, volumetric
        let gridDensity = this.params.gridDensity;
        let morphFactor = this.params.morphFactor;
        let chaos = this.params.chaos;
        let speed = this.params.speed;
        let hue = this.params.hue;
        let intensity = this.params.intensity;
        let glitchIntensity = this.params.glitchIntensity || 0.05;

        if (window.audioEnabled && window.audioReactive) {
            const audio = window.audioReactive;

            // Holographic audio mapping: Create volumetric reactive space
            gridDensity += audio.bass * 50;              // Bass creates density in holographic layers
            morphFactor += audio.mid * 1.5;              // Mid frequencies morph the geometry
            speed += audio.high * 2.5;                   // High frequencies speed up animation
            chaos += audio.energy * 0.8;                 // Energy creates chaotic holographic distortion
            hue += (audio.bass * 45 + audio.mid * 30);   // Bass + Mid affect holographic color shifts
            intensity += audio.high * 0.6;               // High frequencies brighten
            glitchIntensity += audio.energy * 0.3;       // Energy adds glitch effects

            // Beat pulse effect - make visualization react to rhythm
            if (audio.bass > 0.7 || audio.energy > 0.8) {
                this.clickIntensity = Math.max(this.clickIntensity, 0.8);
            }
        }

        this.gl.uniform1f(this.uniforms.gridDensity, Math.min(100, gridDensity));
        this.gl.uniform1f(this.uniforms.morphFactor, Math.min(5, morphFactor));
        this.gl.uniform1f(this.uniforms.chaos, Math.min(3, chaos));
        this.gl.uniform1f(this.uniforms.speed, Math.min(10, speed));
        this.gl.uniform1f(this.uniforms.hue, hue % 360);
        this.gl.uniform1f(this.uniforms.intensity, Math.min(1, intensity));
        this.gl.uniform1f(this.uniforms.saturation, this.params.saturation);
        this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);

        // 4D rotation uniforms (all 6 planes)
        this.gl.uniform1f(this.uniforms.rot4dXY, this.params.rot4dXY || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXZ, this.params.rot4dXZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYZ, this.params.rot4dYZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);

        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.roleIntensity, roleIntensities[this.role] || 1.0);

        // Audio uniforms for polytope system
        let audioHigh = 0.0;
        let audioMid = 0.0;
        if (window.audioEnabled && window.audioReactive) {
            audioHigh = window.audioReactive.high || 0.0;
            audioMid = window.audioReactive.mid || 0.0;
        }
        this.gl.uniform1f(this.uniforms.audioHigh, audioHigh);
        this.gl.uniform1f(this.uniforms.audioMid, audioMid);

        // MVEP-style audio-reactive parameters
        this.gl.uniform1f(this.uniforms.moireScale, this.params.moireScale || 1.01);
        this.gl.uniform1f(this.uniforms.glitchIntensity, Math.min(2, glitchIntensity));
        this.gl.uniform1f(this.uniforms.lineThickness, this.params.lineThickness || 0.02);

        // Decay click intensity for beat pulses
        this.clickIntensity *= 0.92;

        try {
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            
            // Mobile success logging (only once per canvas)
            if (window.mobileDebug && !this._renderSuccessLogged) {
                window.mobileDebug.log(`✅ ${this.canvas?.id}: WebGL render successful`);
                this._renderSuccessLogged = true;
            }
        } catch (error) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: WebGL draw error: ${error.message}`);
            }
        }
    }
    
    /**
     * CRITICAL FIX: Reinitialize WebGL program after context recreation
     */
    reinitializeContext() {
        console.log(`🔄 Reinitializing WebGL context for ${this.canvas?.id}`);
        
        // Clear ALL old WebGL references
        this.program = null;
        this.buffer = null;
        this.uniforms = null;
        this.gl = null;
        
        // CRITICAL FIX: Don't create new context - CanvasManager already did this
        // Just get the existing context that CanvasManager created
        this.gl = this.canvas.getContext('webgl2') || 
                  this.canvas.getContext('webgl') ||
                  this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error(`❌ No WebGL context available for ${this.canvas?.id} - CanvasManager should have created one`);
            return false;
        }
        
        if (this.gl.isContextLost()) {
            console.error(`❌ WebGL context is lost for ${this.canvas?.id}`);
            return false;
        }
        
        // Reinitialize shaders and buffers if context is valid
        try {
            this.init();
            console.log(`✅ ${this.canvas?.id}: Context reinitialized successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to reinitialize WebGL resources for ${this.canvas?.id}:`, error);
            return false;
        }
    }

    // Audio reactivity now handled directly in render() loop - no complex methods needed
    
    /**
     * Clean up WebGL resources
     */
    destroy() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.gl && this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}