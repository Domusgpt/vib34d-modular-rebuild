/**
 * GeometryControls.js - Advanced Geometry Control UI
 * 22 geometries + morphing + blending controls
 *
 * A Paul Phillips Manifestation
 */

import { Polytopes } from '../../geometry/Polytopes.js';
import { GeometryMorpher } from '../../geometry/GeometryMorpher.js';

export class GeometryControls {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.morpher = new GeometryMorpher();
        this.currentGeometry = 'Hypercube (Tesseract)';
        this.morphTargetGeometry = 'Hypersphere';
        this.morphEnabled = false;

        this.init();
    }

    init() {
        this.createGeometryControls();
        this.setupEventListeners();
    }

    createGeometryControls() {
        const container = document.getElementById('control-panel');
        if (!container) {
            console.warn('⚠️ Control panel not found');
            return;
        }

        const geometryGroup = document.createElement('div');
        geometryGroup.className = 'control-group geometry-controls';
        geometryGroup.id = 'geometry-controls-section';
        geometryGroup.innerHTML = `
            <label>🔺 GEOMETRY SYSTEM</label>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Primary Geometry</label>
                <select id="geometry-primary" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                    ${this.createGeometryOptions()}
                </select>
            </div>

            <div style="margin-bottom: 10px;">
                <input type="checkbox" id="geometry-morph-toggle" style="margin-right: 5px;">
                <label for="geometry-morph-toggle" style="font-size: 10px; display: inline;">Enable Morphing</label>
            </div>

            <div id="morph-controls" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); border-radius: 3px;">
                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Morph Target</label>
                    <select id="geometry-morph-target" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        ${this.createGeometryOptions()}
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Morph Progress: <span id="morph-progress-val">0%</span></label>
                    <input type="range" id="morph-progress" min="0" max="100" value="0" style="width: 100%;">
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Morph Speed: <span id="morph-speed-val">0.02</span></label>
                    <input type="range" id="morph-speed" min="0.01" max="0.2" step="0.01" value="0.02" style="width: 100%;">
                </div>

                <div style="margin-bottom: 10px;">
                    <input type="checkbox" id="morph-auto-toggle" style="margin-right: 5px;">
                    <label for="morph-auto-toggle" style="font-size: 10px; display: inline;">Auto-Morph</label>
                </div>

                <div style="margin-bottom: 10px;">
                    <input type="checkbox" id="morph-pingpong-toggle" checked style="margin-right: 5px;">
                    <label for="morph-pingpong-toggle" style="font-size: 10px; display: inline;">Ping-Pong</label>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Morph Type</label>
                    <select id="morph-type" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="linear">Linear</option>
                        <option value="spherical">Spherical (SLERP)</option>
                        <option value="chaotic">Chaotic (Noise)</option>
                        <option value="radial">Radial (Contract/Expand)</option>
                        <option value="twist">Twist</option>
                    </select>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px; opacity: 0.7;">Easing</label>
                    <select id="morph-easing" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="linear">Linear</option>
                        <option value="in-out-cubic" selected>Cubic</option>
                        <option value="in-out-quad">Quadratic</option>
                        <option value="in-out-elastic">Elastic</option>
                        <option value="in-out-bounce">Bounce</option>
                    </select>
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Geometry Parameters</label>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Vertex Scale: <span id="geom-scale-val">1.0</span></label>
                    <input type="range" id="geom-scale" min="0.1" max="2" step="0.1" value="1.0" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Segments: <span id="geom-segments-val">20</span></label>
                    <input type="range" id="geom-segments" min="5" max="50" step="1" value="20" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px; opacity: 0.7;">Edge Rendering</label>
                    <select id="geom-edge-mode" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="solid">Solid</option>
                        <option value="wireframe">Wireframe</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="glow">Glow</option>
                    </select>
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px; opacity: 0.7;">Face Culling</label>
                    <select id="geom-culling" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="none">None</option>
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                    </select>
                </div>
            </div>

            <div style="margin-top: 10px; font-size: 8px; opacity: 0.5; text-align: center;">
                22 4D Geometries Available
            </div>
        `;

        // Insert before existing controls
        const systemPills = container.querySelector('.system-pills');
        if (systemPills) {
            systemPills.before(geometryGroup);
        } else {
            container.appendChild(geometryGroup);
        }

        console.log('✅ GeometryControls UI created');
    }

    createGeometryOptions() {
        const geometries = Polytopes.getAllGeometryNames();
        return geometries.map(name => {
            const selected = name === this.currentGeometry ? 'selected' : '';
            return `<option value="${name}" ${selected}>${name}</option>`;
        }).join('');
    }

    setupEventListeners() {
        // Primary geometry selection
        const primarySelect = document.getElementById('geometry-primary');
        if (primarySelect) {
            primarySelect.addEventListener('change', (e) => {
                this.currentGeometry = e.target.value;
                this.updateGeometry();
            });
        }

        // Morph toggle
        const morphToggle = document.getElementById('geometry-morph-toggle');
        const morphControls = document.getElementById('morph-controls');
        if (morphToggle && morphControls) {
            morphToggle.addEventListener('change', (e) => {
                this.morphEnabled = e.target.checked;
                morphControls.style.display = e.target.checked ? 'block' : 'none';
                if (e.target.checked) {
                    this.initMorphing();
                }
            });
        }

        // Morph target selection
        const morphTarget = document.getElementById('geometry-morph-target');
        if (morphTarget) {
            morphTarget.addEventListener('change', (e) => {
                this.morphTargetGeometry = e.target.value;
                this.initMorphing();
            });
        }

        // Morph progress manual control
        const morphProgress = document.getElementById('morph-progress');
        const morphProgressVal = document.getElementById('morph-progress-val');
        if (morphProgress) {
            morphProgress.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) / 100;
                this.morpher.morphProgress = value;
                this.morpher.autoMorph = false; // Disable auto when manually adjusting
                document.getElementById('morph-auto-toggle').checked = false;
                if (morphProgressVal) morphProgressVal.textContent = `${Math.round(value * 100)}%`;
                this.updateMorphedGeometry();
            });
        }

        // Morph speed
        const morphSpeed = document.getElementById('morph-speed');
        const morphSpeedVal = document.getElementById('morph-speed-val');
        if (morphSpeed) {
            morphSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.morpher.morphSpeed = value;
                if (morphSpeedVal) morphSpeedVal.textContent = value.toFixed(2);
            });
        }

        // Auto-morph toggle
        const autoMorphToggle = document.getElementById('morph-auto-toggle');
        if (autoMorphToggle) {
            autoMorphToggle.addEventListener('change', (e) => {
                this.morpher.autoMorph = e.target.checked;
                if (e.target.checked) {
                    this.startAutoMorph();
                } else {
                    this.stopAutoMorph();
                }
            });
        }

        // Ping-pong toggle
        const pingPongToggle = document.getElementById('morph-pingpong-toggle');
        if (pingPongToggle) {
            pingPongToggle.addEventListener('change', (e) => {
                this.morpher.pingPong = e.target.checked;
            });
        }

        // Morph type
        const morphType = document.getElementById('morph-type');
        if (morphType) {
            morphType.addEventListener('change', (e) => {
                this.morphType = e.target.value;
            });
        }

        // Easing
        const morphEasing = document.getElementById('morph-easing');
        if (morphEasing) {
            morphEasing.addEventListener('change', (e) => {
                this.morpher.setEasing(e.target.value);
            });
        }

        // Geometry scale
        const geomScale = document.getElementById('geom-scale');
        const geomScaleVal = document.getElementById('geom-scale-val');
        if (geomScale) {
            geomScale.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.geometryScale = value;
                if (geomScaleVal) geomScaleVal.textContent = value.toFixed(1);
                this.updateGeometry();
            });
        }

        // Segments
        const geomSegments = document.getElementById('geom-segments');
        const geomSegmentsVal = document.getElementById('geom-segments-val');
        if (geomSegments) {
            geomSegments.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.geometrySegments = value;
                if (geomSegmentsVal) geomSegmentsVal.textContent = value;
                this.updateGeometry();
            });
        }

        console.log('✅ GeometryControls event listeners setup');
    }

    initMorphing() {
        const source = Polytopes.getGeometry(this.currentGeometry, this.geometryScale || 1, { segments: this.geometrySegments || 20 });
        const target = Polytopes.getGeometry(this.morphTargetGeometry, this.geometryScale || 1, { segments: this.geometrySegments || 20 });

        this.morpher.setGeometries(source, target);
        console.log(`🔀 Morphing initialized: ${this.currentGeometry} → ${this.morphTargetGeometry}`);
    }

    startAutoMorph() {
        if (this.morphAnimationFrame) return;

        const animate = () => {
            this.morpher.update();
            this.updateMorphedGeometry();

            // Update progress display
            const progressSlider = document.getElementById('morph-progress');
            const progressVal = document.getElementById('morph-progress-val');
            if (progressSlider && progressVal) {
                progressSlider.value = this.morpher.morphProgress * 100;
                progressVal.textContent = `${Math.round(this.morpher.morphProgress * 100)}%`;
            }

            if (this.morpher.autoMorph) {
                this.morphAnimationFrame = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    stopAutoMorph() {
        if (this.morphAnimationFrame) {
            cancelAnimationFrame(this.morphAnimationFrame);
            this.morphAnimationFrame = null;
        }
    }

    updateGeometry() {
        const geometry = Polytopes.getGeometry(this.currentGeometry, this.geometryScale || 1, { segments: this.geometrySegments || 20 });

        // Use choreographer's updateGeometry method
        this.choreographer.updateGeometry(geometry);

        console.log(`🔺 Geometry updated: ${this.currentGeometry} (${geometry.length} vertices)`);
    }

    updateMorphedGeometry() {
        if (!this.morphEnabled) return;

        const morphed = this.morpher.getMorphedGeometry();

        // Use choreographer's updateGeometry method
        this.choreographer.updateGeometry(morphed);
    }

    // Public API for external control
    setGeometry(geometryName) {
        this.currentGeometry = geometryName;
        const select = document.getElementById('geometry-primary');
        if (select) select.value = geometryName;
        this.updateGeometry();
    }

    enableMorphing(targetGeometry) {
        this.morphTargetGeometry = targetGeometry;
        const toggle = document.getElementById('geometry-morph-toggle');
        if (toggle) {
            toggle.checked = true;
            toggle.dispatchEvent(new Event('change'));
        }
    }

    setMorphProgress(progress) {
        this.morpher.morphProgress = Math.max(0, Math.min(1, progress));
        const slider = document.getElementById('morph-progress');
        if (slider) slider.value = this.morpher.morphProgress * 100;
        this.updateMorphedGeometry();
    }

    startAutoMorphing() {
        const toggle = document.getElementById('morph-auto-toggle');
        if (toggle) {
            toggle.checked = true;
            toggle.dispatchEvent(new Event('change'));
        }
    }

    stopAutoMorphing() {
        const toggle = document.getElementById('morph-auto-toggle');
        if (toggle) {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change'));
        }
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 */
