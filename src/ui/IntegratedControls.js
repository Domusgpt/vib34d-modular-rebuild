/**
 * IntegratedControls - Simple, properly connected UI controls
 * Directly calls choreographer.setParameter() for all changes
 *
 * A Paul Phillips Manifestation
 */

export class IntegratedControls {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.init();
    }

    init() {
        console.log('🎛️ Initializing Integrated Controls...');
        this.createControlPanel();
        this.setupParameterControls();
        this.setupUpdateLoop();
        console.log('✅ Integrated Controls initialized');
    }

    createControlPanel() {
        const panel = document.getElementById('control-panel');
        if (!panel) {
            console.error('❌ Control panel not found');
            return;
        }

        panel.innerHTML = `
            <h2>🎛️ PARAMETERS</h2>

            <div class="control-group">
                <label>GEOMETRY (1-22)</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-geometry" min="1" max="22" step="1" value="${this.choreographer.baseParams.geometry}" style="flex: 1;">
                    <span id="param-geometry-val" style="min-width: 30px; text-align: right;">${this.choreographer.baseParams.geometry}</span>
                </div>
            </div>

            <div class="control-group">
                <label>GRID DENSITY</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-gridDensity" min="5" max="40" step="1" value="${this.choreographer.baseParams.gridDensity}" style="flex: 1;">
                    <span id="param-gridDensity-val" style="min-width: 30px; text-align: right;">${this.choreographer.baseParams.gridDensity}</span>
                </div>
            </div>

            <div class="control-group">
                <label>MORPH FACTOR</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-morphFactor" min="0" max="2" step="0.01" value="${this.choreographer.baseParams.morphFactor}" style="flex: 1;">
                    <span id="param-morphFactor-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.morphFactor.toFixed(2)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>CHAOS</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-chaos" min="0" max="1" step="0.01" value="${this.choreographer.baseParams.chaos}" style="flex: 1;">
                    <span id="param-chaos-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.chaos.toFixed(2)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>SPEED</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-speed" min="0.1" max="5" step="0.1" value="${this.choreographer.baseParams.speed}" style="flex: 1;">
                    <span id="param-speed-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.speed.toFixed(1)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>HUE</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-hue" min="0" max="360" step="1" value="${this.choreographer.baseParams.hue}" style="flex: 1;">
                    <span id="param-hue-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.hue}°</span>
                </div>
            </div>

            <div class="control-group">
                <label>INTENSITY</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-intensity" min="0" max="1" step="0.01" value="${this.choreographer.baseParams.intensity}" style="flex: 1;">
                    <span id="param-intensity-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.intensity.toFixed(2)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>SATURATION</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="range" id="param-saturation" min="0" max="1" step="0.01" value="${this.choreographer.baseParams.saturation}" style="flex: 1;">
                    <span id="param-saturation-val" style="min-width: 40px; text-align: right;">${this.choreographer.baseParams.saturation.toFixed(2)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>🌐 VISUALIZATION SYSTEM</label>
                <div class="system-pills">
                    <div class="system-pill active" data-system="faceted">FACETED</div>
                    <div class="system-pill" data-system="quantum">QUANTUM</div>
                    <div class="system-pill" data-system="holographic">HOLO</div>
                </div>
            </div>

            <div class="control-group">
                <label>⚙️ AUDIO REACTIVITY</label>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="toggle-audio-reactive" style="flex: 1;">
                        ${this.choreographer.audioReactive ? '🔊 ON' : '🔇 OFF'}
                    </button>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 9px;">Strength:</span>
                    <input type="range" id="reactivity-strength" min="0" max="1" step="0.05" value="${this.choreographer.reactivityStrength}" style="flex: 1;">
                    <span id="reactivity-strength-val" style="min-width: 40px; text-align: right;">${this.choreographer.reactivityStrength.toFixed(2)}</span>
                </div>
            </div>

            <div class="control-group">
                <label>🎭 CHOREOGRAPHY MODE</label>
                <select id="choreography-mode" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-family: inherit; font-size: 10px;">
                    <option value="dynamic" ${this.choreographer.choreographyMode === 'dynamic' ? 'selected' : ''}>Dynamic</option>
                    <option value="smooth" ${this.choreographer.choreographyMode === 'smooth' ? 'selected' : ''}>Smooth</option>
                    <option value="aggressive" ${this.choreographer.choreographyMode === 'aggressive' ? 'selected' : ''}>Aggressive</option>
                    <option value="minimal" ${this.choreographer.choreographyMode === 'minimal' ? 'selected' : ''}>Minimal</option>
                </select>
            </div>

            <div class="build-info">
                VIB34D Modular Build v2.0<br>
                Integrated Controls Active<br>
                All parameters synced to Choreographer
            </div>
        `;
    }

    setupParameterControls() {
        // All base parameters
        const params = ['geometry', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation'];

        params.forEach(param => {
            const slider = document.getElementById(`param-${param}`);
            const valueDisplay = document.getElementById(`param-${param}-val`);

            if (!slider || !valueDisplay) {
                console.warn(`⚠️ Control not found for ${param}`);
                return;
            }

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);

                // Update display
                if (param === 'hue') {
                    valueDisplay.textContent = `${value}°`;
                } else if (param === 'geometry' || param === 'gridDensity') {
                    valueDisplay.textContent = value;
                } else {
                    valueDisplay.textContent = value.toFixed(2);
                }

                // Update Choreographer - THIS IS THE KEY
                this.choreographer.setParameter(param, value);
                console.log(`✅ Set ${param} = ${value}`);
            });
        });

        // System switching
        document.querySelectorAll('.system-pill').forEach(pill => {
            pill.addEventListener('click', async () => {
                const system = pill.dataset.system;
                try {
                    await this.choreographer.switchSystem(system);
                    document.querySelectorAll('.system-pill').forEach(p => {
                        p.classList.toggle('active', p.dataset.system === system);
                    });
                    const statusEl = document.getElementById('system-status-top');
                    if (statusEl) statusEl.textContent = `System: ${system.toUpperCase()}`;
                    console.log(`✅ Switched to ${system}`);
                } catch (error) {
                    console.error(`❌ System switch failed: ${error.message}`);
                }
            });
        });

        // Audio reactivity toggle
        const toggleBtn = document.getElementById('toggle-audio-reactive');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.choreographer.audioReactive = !this.choreographer.audioReactive;
                toggleBtn.textContent = this.choreographer.audioReactive ? '🔊 ON' : '🔇 OFF';
                console.log(`✅ Audio reactivity: ${this.choreographer.audioReactive ? 'ON' : 'OFF'}`);
            });
        }

        // Reactivity strength
        const strengthSlider = document.getElementById('reactivity-strength');
        const strengthVal = document.getElementById('reactivity-strength-val');
        if (strengthSlider && strengthVal) {
            strengthSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.choreographer.reactivityStrength = value;
                strengthVal.textContent = value.toFixed(2);
                console.log(`✅ Reactivity strength: ${value}`);
            });
        }

        // Choreography mode
        const modeSelect = document.getElementById('choreography-mode');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.choreographer.choreographyMode = e.target.value;
                console.log(`✅ Choreography mode: ${e.target.value}`);
            });
        }
    }

    setupUpdateLoop() {
        // Update displays periodically to reflect any programmatic changes
        setInterval(() => {
            const params = ['geometry', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation'];

            params.forEach(param => {
                const slider = document.getElementById(`param-${param}`);
                const valueDisplay = document.getElementById(`param-${param}-val`);
                const currentValue = this.choreographer.baseParams[param];

                if (slider && valueDisplay && slider.value != currentValue) {
                    slider.value = currentValue;
                    if (param === 'hue') {
                        valueDisplay.textContent = `${currentValue}°`;
                    } else if (param === 'geometry' || param === 'gridDensity') {
                        valueDisplay.textContent = currentValue;
                    } else {
                        valueDisplay.textContent = currentValue.toFixed(2);
                    }
                }
            });
        }, 100);
    }
}
