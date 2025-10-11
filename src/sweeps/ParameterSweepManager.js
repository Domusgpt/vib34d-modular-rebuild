/**
 * ParameterSweepManager - Automated parameter animation system
 * 16+ sweep types with curve editor and custom paths
 *
 * A Paul Phillips Manifestation
 */

export class ParameterSweepManager {
    constructor() {
        this.activeSweeps = new Map(); // parameter -> sweep config
        this.sweepTypes = this.generateSweepTypes();
        this.customCurves = new Map(); // name -> curve data
        this.time = 0;
        this.isRunning = false;
        this.animationFrameId = null;

        this.loadCustomCurves();
    }

    /**
     * Generate all 16+ sweep types
     */
    generateSweepTypes() {
        return {
            // === LINEAR & EXPONENTIAL (3) ===
            'linear': {
                name: 'Linear',
                description: 'Straight line progression',
                category: 'basic',
                function: (t) => t
            },
            'exponential': {
                name: 'Exponential',
                description: 'Exponential growth curve',
                category: 'basic',
                function: (t) => Math.pow(t, 2)
            },
            'logarithmic': {
                name: 'Logarithmic',
                description: 'Logarithmic slow start',
                category: 'basic',
                function: (t) => Math.log(t * 9 + 1) / Math.log(10)
            },

            // === WAVE FORMS (7) ===
            'sine': {
                name: 'Sine Wave',
                description: 'Smooth sine oscillation',
                category: 'wave',
                function: (t) => (Math.sin(t * Math.PI * 2) + 1) / 2
            },
            'cosine': {
                name: 'Cosine Wave',
                description: 'Cosine oscillation',
                category: 'wave',
                function: (t) => (Math.cos(t * Math.PI * 2) + 1) / 2
            },
            'triangle': {
                name: 'Triangle Wave',
                description: 'Linear up-down pattern',
                category: 'wave',
                function: (t) => {
                    const phase = t % 1;
                    return phase < 0.5 ? phase * 2 : (1 - phase) * 2;
                }
            },
            'square': {
                name: 'Square Wave',
                description: 'Binary on-off pattern',
                category: 'wave',
                function: (t) => (t % 1) < 0.5 ? 0 : 1
            },
            'sawtooth': {
                name: 'Sawtooth Wave',
                description: 'Sharp rise, instant drop',
                category: 'wave',
                function: (t) => t % 1
            },
            'reverse-sawtooth': {
                name: 'Reverse Sawtooth',
                description: 'Instant rise, sharp drop',
                category: 'wave',
                function: (t) => 1 - (t % 1)
            },
            'pulse': {
                name: 'Pulse Wave',
                description: 'Short burst pattern',
                category: 'wave',
                function: (t) => (t % 1) < 0.2 ? 1 : 0
            },

            // === EASING FUNCTIONS (8) ===
            'ease-in-quad': {
                name: 'Ease In Quad',
                description: 'Quadratic acceleration',
                category: 'easing',
                function: (t) => t * t
            },
            'ease-out-quad': {
                name: 'Ease Out Quad',
                description: 'Quadratic deceleration',
                category: 'easing',
                function: (t) => t * (2 - t)
            },
            'ease-in-out-quad': {
                name: 'Ease In-Out Quad',
                description: 'Quadratic acceleration/deceleration',
                category: 'easing',
                function: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            },
            'ease-in-cubic': {
                name: 'Ease In Cubic',
                description: 'Cubic acceleration',
                category: 'easing',
                function: (t) => t * t * t
            },
            'ease-out-cubic': {
                name: 'Ease Out Cubic',
                description: 'Cubic deceleration',
                category: 'easing',
                function: (t) => (--t) * t * t + 1
            },
            'ease-in-out-cubic': {
                name: 'Ease In-Out Cubic',
                description: 'Cubic acceleration/deceleration',
                category: 'easing',
                function: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
            },
            'ease-in-elastic': {
                name: 'Ease In Elastic',
                description: 'Elastic pull-back effect',
                category: 'easing',
                function: (t) => {
                    if (t === 0) return 0;
                    if (t === 1) return 1;
                    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
                }
            },
            'ease-out-elastic': {
                name: 'Ease Out Elastic',
                description: 'Elastic bounce effect',
                category: 'easing',
                function: (t) => {
                    if (t === 0) return 0;
                    if (t === 1) return 1;
                    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
                }
            },

            // === RANDOM & NOISE (3) ===
            'random': {
                name: 'Random',
                description: 'Random value jumps',
                category: 'random',
                function: (t) => Math.random()
            },
            'random-smooth': {
                name: 'Random Smooth',
                description: 'Interpolated random values',
                category: 'random',
                function: (t, context) => {
                    if (!context.randomValues) {
                        context.randomValues = [];
                        for (let i = 0; i < 20; i++) {
                            context.randomValues.push(Math.random());
                        }
                    }
                    const index = t * 19;
                    const i1 = Math.floor(index);
                    const i2 = Math.ceil(index);
                    const frac = index - i1;
                    const v1 = context.randomValues[i1];
                    const v2 = context.randomValues[i2 % 20];
                    return v1 + (v2 - v1) * frac;
                }
            },
            'perlin': {
                name: 'Perlin Noise',
                description: 'Smooth natural noise',
                category: 'random',
                function: (t) => {
                    // Simple perlin-like noise
                    const x = t * 10;
                    const xi = Math.floor(x);
                    const xf = x - xi;
                    const u = xf * xf * (3 - 2 * xf);
                    const a = this.noise(xi);
                    const b = this.noise(xi + 1);
                    return a + u * (b - a);
                }
            },

            // === BOUNCE & OVERSHOOT (2) ===
            'bounce': {
                name: 'Bounce',
                description: 'Bouncing ball physics',
                category: 'special',
                function: (t) => {
                    if (t < 1 / 2.75) {
                        return 7.5625 * t * t;
                    } else if (t < 2 / 2.75) {
                        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                    } else if (t < 2.5 / 2.75) {
                        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                    } else {
                        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                    }
                }
            },
            'overshoot': {
                name: 'Overshoot',
                description: 'Goes beyond target then returns',
                category: 'special',
                function: (t) => {
                    const c1 = 1.70158;
                    const c3 = c1 + 1;
                    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
                }
            }
        };
    }

    /**
     * Simple noise function for perlin-like noise
     */
    noise(x) {
        x = (x << 13) ^ x;
        return (1.0 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0 + 1.0) / 2.0;
    }

    /**
     * Start a parameter sweep
     */
    startSweep(parameter, config) {
        const sweepConfig = {
            parameter,
            type: config.type || 'linear',
            min: config.min || 0,
            max: config.max || 1,
            duration: config.duration || 5000, // milliseconds
            loop: config.loop !== undefined ? config.loop : true,
            reverse: config.reverse || false,
            startTime: Date.now(),
            context: {} // for sweep types that need state
        };

        this.activeSweeps.set(parameter, sweepConfig);

        if (!this.isRunning) {
            this.start();
        }

        console.log(`✅ Started sweep: ${parameter} (${sweepConfig.type})`);
        return sweepConfig;
    }

    /**
     * Stop a parameter sweep
     */
    stopSweep(parameter) {
        if (this.activeSweeps.has(parameter)) {
            this.activeSweeps.delete(parameter);
            console.log(`⏹️  Stopped sweep: ${parameter}`);
        }

        if (this.activeSweeps.size === 0) {
            this.stop();
        }
    }

    /**
     * Stop all sweeps
     */
    stopAll() {
        this.activeSweeps.clear();
        this.stop();
        console.log('⏹️  Stopped all sweeps');
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.animate();
        console.log('▶️  Parameter sweep animation started');
    }

    /**
     * Stop animation loop
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('⏸️  Parameter sweep animation stopped');
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;

        const now = Date.now();
        const updates = {};

        for (const [parameter, config] of this.activeSweeps) {
            const elapsed = now - config.startTime;
            let t = (elapsed % config.duration) / config.duration;

            // Handle reverse
            if (config.reverse) {
                t = 1 - t;
            }

            // Get sweep function
            const sweepType = this.sweepTypes[config.type];
            if (!sweepType) {
                console.error(`❌ Unknown sweep type: ${config.type}`);
                continue;
            }

            // Calculate normalized value (0-1)
            let normalizedValue = sweepType.function(t, config.context);

            // Map to min-max range
            const value = config.min + normalizedValue * (config.max - config.min);

            updates[parameter] = value;

            // Stop if not looping and duration elapsed
            if (!config.loop && elapsed >= config.duration) {
                this.stopSweep(parameter);
            }
        }

        // Emit update event with all changed parameters
        if (Object.keys(updates).length > 0) {
            this.onUpdate(updates);
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Update callback (override this)
     */
    onUpdate(updates) {
        // To be overridden by consumer
        // updates = { parameter: value, ... }
    }

    /**
     * Get all active sweeps
     */
    getActiveSweeps() {
        return Array.from(this.activeSweeps.entries()).map(([param, config]) => ({
            parameter: param,
            type: config.type,
            min: config.min,
            max: config.max,
            duration: config.duration,
            loop: config.loop,
            reverse: config.reverse
        }));
    }

    /**
     * Get sweep types by category
     */
    getSweepTypesByCategory(category) {
        const types = [];
        for (const [key, sweep] of Object.entries(this.sweepTypes)) {
            if (sweep.category === category) {
                types.push({ key, ...sweep });
            }
        }
        return types;
    }

    /**
     * Get all sweep categories
     */
    getCategories() {
        const categories = new Set();
        for (const sweep of Object.values(this.sweepTypes)) {
            categories.add(sweep.category);
        }
        return Array.from(categories);
    }

    /**
     * Create custom curve from points
     */
    createCustomCurve(name, points) {
        // points = [{x: 0-1, y: 0-1}, ...]
        if (points.length < 2) {
            console.error('❌ Custom curve needs at least 2 points');
            return false;
        }

        // Sort by x
        points.sort((a, b) => a.x - b.x);

        // Create interpolation function
        const curveFunction = (t) => {
            if (t <= points[0].x) return points[0].y;
            if (t >= points[points.length - 1].x) return points[points.length - 1].y;

            // Find surrounding points
            let i = 0;
            while (i < points.length - 1 && points[i + 1].x < t) {
                i++;
            }

            const p1 = points[i];
            const p2 = points[i + 1];
            const localT = (t - p1.x) / (p2.x - p1.x);

            // Cubic interpolation for smooth curves
            return this.cubicInterpolate(p1.y, p2.y, localT);
        };

        this.customCurves.set(name, {
            points,
            function: curveFunction
        });

        // Add to sweep types
        this.sweepTypes[`custom-${name}`] = {
            name: `Custom: ${name}`,
            description: 'User-defined curve',
            category: 'custom',
            function: curveFunction
        };

        this.saveCustomCurves();
        console.log(`✅ Created custom curve: ${name}`);
        return true;
    }

    /**
     * Cubic interpolation
     */
    cubicInterpolate(y1, y2, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * y1 + (-2 * t3 + 3 * t2) * y2;
    }

    /**
     * Delete custom curve
     */
    deleteCustomCurve(name) {
        if (this.customCurves.has(name)) {
            this.customCurves.delete(name);
            delete this.sweepTypes[`custom-${name}`];
            this.saveCustomCurves();
            console.log(`🗑️  Deleted custom curve: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Save custom curves to localStorage
     */
    saveCustomCurves() {
        try {
            const curves = {};
            for (const [name, curve] of this.customCurves) {
                curves[name] = curve.points;
            }
            localStorage.setItem('vib34d-custom-curves', JSON.stringify(curves));
        } catch (err) {
            console.error('❌ Failed to save custom curves:', err);
        }
    }

    /**
     * Load custom curves from localStorage
     */
    loadCustomCurves() {
        try {
            const saved = localStorage.getItem('vib34d-custom-curves');
            if (saved) {
                const curves = JSON.parse(saved);
                for (const [name, points] of Object.entries(curves)) {
                    this.createCustomCurve(name, points);
                }
            }
        } catch (err) {
            console.error('❌ Failed to load custom curves:', err);
        }
    }

    /**
     * Export sweep configuration
     */
    exportSweepConfig() {
        const config = {
            version: '1.0',
            sweeps: this.getActiveSweeps(),
            customCurves: {}
        };

        for (const [name, curve] of this.customCurves) {
            config.customCurves[name] = curve.points;
        }

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vib34d-sweeps-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📤 Sweep configuration exported');
    }

    /**
     * Import sweep configuration
     */
    async importSweepConfig(file) {
        try {
            const text = await file.text();
            const config = JSON.parse(text);

            // Import custom curves
            if (config.customCurves) {
                for (const [name, points] of Object.entries(config.customCurves)) {
                    this.createCustomCurve(name, points);
                }
            }

            console.log(`📥 Imported ${Object.keys(config.customCurves || {}).length} custom curves`);
            return true;
        } catch (err) {
            console.error('❌ Failed to import sweep config:', err);
            return false;
        }
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            activeSweeps: this.activeSweeps.size,
            totalSweepTypes: Object.keys(this.sweepTypes).length,
            customCurves: this.customCurves.size,
            isRunning: this.isRunning
        };
    }
}
