/**
 * PerformanceMonitor - Real-time performance tracking and optimization
 * Monitors FPS, memory usage, render times, and provides optimization suggestions
 */

export class PerformanceMonitor {
    constructor() {
        this.enabled = true;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            renderTime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            gpuStalls: 0,
            activeVisualizers: 0,
            canvasCount: 0
        };

        this.history = {
            fps: [],
            frameTime: [],
            renderTime: [],
            maxHistorySize: 300 // 5 seconds at 60fps
        };

        this.thresholds = {
            targetFPS: 60,
            minAcceptableFPS: 30,
            maxFrameTime: 33.33, // ms (for 30fps)
            memoryWarning: 500, // MB
            memoryCritical: 1000 // MB
        };

        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startTime = performance.now();

        this.optimizationSuggestions = [];
        this.warningCallbacks = [];

        console.log('📊 PerformanceMonitor initialized');
    }

    /**
     * Start the monitoring loop
     */
    start() {
        if (!this.enabled) return;

        this.monitoringLoop();
    }

    /**
     * Main monitoring loop
     */
    monitoringLoop() {
        if (!this.enabled) return;

        requestAnimationFrame(() => {
            this.update();
            this.monitoringLoop();
        });
    }

    /**
     * Update all metrics
     */
    update() {
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;

        // FPS calculation
        this.frameCount++;
        const elapsed = now - this.startTime;
        this.metrics.fps = Math.round((this.frameCount / elapsed) * 1000);

        // Frame time
        this.metrics.frameTime = deltaTime;

        // Update history
        this.addToHistory('fps', this.metrics.fps);
        this.addToHistory('frameTime', deltaTime);

        // Reset counters every second
        if (elapsed >= 1000) {
            this.frameCount = 0;
            this.startTime = now;
        }

        this.lastFrameTime = now;

        // Check for performance issues
        this.checkPerformance();
    }

    /**
     * Add value to history array
     */
    addToHistory(metric, value) {
        if (!this.history[metric]) return;

        this.history[metric].push(value);
        if (this.history[metric].length > this.history.maxHistorySize) {
            this.history[metric].shift();
        }
    }

    /**
     * Mark start of render operation
     */
    startRender() {
        this.renderStartTime = performance.now();
    }

    /**
     * Mark end of render operation
     */
    endRender() {
        if (this.renderStartTime) {
            this.metrics.renderTime = performance.now() - this.renderStartTime;
            this.addToHistory('renderTime', this.metrics.renderTime);
        }
    }

    /**
     * Update visualizer count
     */
    setVisualizerCount(count) {
        this.metrics.activeVisualizers = count;
    }

    /**
     * Update canvas count
     */
    setCanvasCount(count) {
        this.metrics.canvasCount = count;
    }

    /**
     * Record GPU stall
     */
    recordGPUStall() {
        this.metrics.gpuStalls++;
    }

    /**
     * Check for performance issues
     */
    checkPerformance() {
        this.optimizationSuggestions = [];

        // Low FPS warning
        if (this.metrics.fps < this.thresholds.minAcceptableFPS) {
            this.optimizationSuggestions.push({
                severity: 'high',
                message: `Low FPS detected: ${this.metrics.fps} (target: ${this.thresholds.targetFPS})`,
                suggestions: [
                    'Reduce number of active visualizers',
                    'Lower grid density parameter',
                    'Disable some canvas layers',
                    'Switch to simpler visualization system'
                ]
            });
            this.triggerWarning('low_fps', this.metrics.fps);
        }

        // High frame time
        if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
            this.optimizationSuggestions.push({
                severity: 'medium',
                message: `High frame time: ${this.metrics.frameTime.toFixed(2)}ms`,
                suggestions: [
                    'Optimize render loop',
                    'Reduce complexity of active geometry',
                    'Consider using lower quality settings'
                ]
            });
        }

        // Too many visualizers
        if (this.metrics.activeVisualizers > 10) {
            this.optimizationSuggestions.push({
                severity: 'medium',
                message: `High visualizer count: ${this.metrics.activeVisualizers}`,
                suggestions: [
                    'Some systems may be creating redundant visualizers',
                    'Consider cleaning up unused visualizers'
                ]
            });
        }

        // GPU stalls
        if (this.metrics.gpuStalls > 100) {
            this.optimizationSuggestions.push({
                severity: 'high',
                message: `Frequent GPU stalls detected: ${this.metrics.gpuStalls}`,
                suggestions: [
                    'Reduce ReadPixels operations',
                    'Optimize shader complexity',
                    'Use texture pooling'
                ]
            });
        }
    }

    /**
     * Get average metric value
     */
    getAverage(metric) {
        if (!this.history[metric] || this.history[metric].length === 0) return 0;

        const sum = this.history[metric].reduce((a, b) => a + b, 0);
        return sum / this.history[metric].length;
    }

    /**
     * Get performance summary
     */
    getSummary() {
        return {
            current: { ...this.metrics },
            averages: {
                fps: Math.round(this.getAverage('fps')),
                frameTime: this.getAverage('frameTime').toFixed(2),
                renderTime: this.getAverage('renderTime').toFixed(2)
            },
            status: this.getPerformanceStatus(),
            suggestions: this.optimizationSuggestions
        };
    }

    /**
     * Get overall performance status
     */
    getPerformanceStatus() {
        if (this.metrics.fps >= this.thresholds.targetFPS) {
            return 'excellent';
        } else if (this.metrics.fps >= this.thresholds.minAcceptableFPS) {
            return 'good';
        } else if (this.metrics.fps >= 20) {
            return 'poor';
        } else {
            return 'critical';
        }
    }

    /**
     * Register warning callback
     */
    onWarning(callback) {
        this.warningCallbacks.push(callback);
    }

    /**
     * Trigger warning
     */
    triggerWarning(type, value) {
        this.warningCallbacks.forEach(cb => {
            try {
                cb(type, value, this.getSummary());
            } catch (error) {
                console.error('Performance warning callback error:', error);
            }
        });
    }

    /**
     * Get performance grade (A-F)
     */
    getGrade() {
        const avgFPS = this.getAverage('fps');
        if (avgFPS >= 55) return 'A';
        if (avgFPS >= 45) return 'B';
        if (avgFPS >= 35) return 'C';
        if (avgFPS >= 25) return 'D';
        return 'F';
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.frameCount = 0;
        this.startTime = performance.now();
        this.history.fps = [];
        this.history.frameTime = [];
        this.history.renderTime = [];
        this.metrics.gpuStalls = 0;
        console.log('📊 Performance metrics reset');
    }

    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            console.log('📊 Performance monitoring enabled');
            this.start();
        } else {
            console.log('📊 Performance monitoring disabled');
        }
    }

    /**
     * Get detailed report
     */
    getReport() {
        return {
            summary: this.getSummary(),
            grade: this.getGrade(),
            recommendations: this.getRecommendations(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get optimization recommendations
     */
    getRecommendations() {
        const status = this.getPerformanceStatus();
        const recommendations = [];

        if (status === 'poor' || status === 'critical') {
            recommendations.push({
                priority: 'high',
                category: 'quality',
                action: 'Reduce visual quality settings',
                impact: 'Will improve FPS by 20-40%'
            });
            recommendations.push({
                priority: 'high',
                category: 'system',
                action: 'Switch to simpler visualization system',
                impact: 'Faceted system is lighter than Quantum or Holographic'
            });
        }

        if (this.metrics.activeVisualizers > 5) {
            recommendations.push({
                priority: 'medium',
                category: 'optimization',
                action: 'Reduce number of canvas layers',
                impact: 'Each layer adds ~10-20% overhead'
            });
        }

        return recommendations;
    }
}
