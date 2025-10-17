/**
 * AudioPanel - Audio input and reactivity controls
 * Tabs: [Input] [Reactive] [Status]
 *
 * Input Tab:
 * - Audio Source Selector (dropdown)
 * - Enable/Disable Audio button
 * - Volume meter
 *
 * Reactive Tab:
 * - Audio Reactive Enable (toggle)
 * - Audio Intensity (0-2)
 * - Frequency Response (Low/Mid/High)
 * - Smoothing (0-1)
 *
 * Status Tab:
 * - Audio Level Indicator
 * - Frequency Spectrum Visual
 * - Connection Status
 */

import { CollapsibleDraggablePanel } from '../components/CollapsibleDraggablePanel.js';
import { ParameterSlider } from '../components/ParameterSlider.js';

export class AudioPanel {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.panel = null;
        this.sliders = {};

        this.init();
    }

    init() {
        // Create panel with 3 tabs
        this.panel = new CollapsibleDraggablePanel({
            id: 'audio',
            title: 'AUDIO - INPUT & REACTIVITY',
            icon: '🔊',
            defaultPosition: { top: 440, left: 10 }, // Left side, below XY Control
            defaultSize: { width: 340, height: 'auto' },
            defaultCollapsed: false, // START EXPANDED
            collapsible: true,
            draggable: true,
            tabs: [
                { id: 'input', label: 'Input', content: this.createInputTab() },
                { id: 'reactive', label: 'Reactive', content: this.createReactiveTab() },
                { id: 'status', label: 'Status', content: this.createStatusTab() }
            ],
            zIndex: 998
        });

        // Wire up controls after panel is created
        setTimeout(() => {
            this.setupControls();
            this.setupSliders();
            this.startUpdateLoop();
        }, 100);
    }

    createInputTab() {
        return `
            <div class="tab-section">
                <!-- Audio Source Selector -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); display: block; margin-bottom: 6px;">
                        AUDIO SOURCE
                    </label>
                    <select id="audio-source-select" class="vib-dropdown" style="width: 100%;">
                        <option value="microphone">Microphone</option>
                        <option value="file">Audio File</option>
                        <option value="system">System Audio</option>
                    </select>
                </div>

                <!-- Enable/Disable Button -->
                <button id="audio-enable-btn" class="vib-button primary" style="width: 100%; margin-bottom: 12px;">
                    ENABLE AUDIO
                </button>

                <!-- Volume Meter -->
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7);">
                        INPUT LEVEL
                    </label>
                </div>
                <div id="audio-volume-meter" style="
                    width: 100%;
                    height: 24px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                ">
                    <div id="audio-volume-bar" style="
                        position: absolute;
                        left: 0; top: 0;
                        height: 100%;
                        width: 0%;
                        background: linear-gradient(90deg,
                            rgba(0, 255, 255, 0.6),
                            rgba(0, 255, 255, 0.9)
                        );
                        transition: width 0.05s ease-out;
                    "></div>
                </div>
            </div>
        `;
    }

    createReactiveTab() {
        return `
            <div class="tab-section">
                <!-- Audio Reactive Toggle -->
                <div style="margin-bottom: 12px;">
                    <button id="audio-reactive-toggle" class="vib-button" style="width: 100%;">
                        AUDIO REACTIVE: OFF
                    </button>
                </div>

                <!-- Audio Intensity Slider -->
                <div id="slider-audioIntensity-container"></div>

                <!-- Frequency Response -->
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); display: block; margin-bottom: 6px;">
                        FREQUENCY RESPONSE
                    </label>
                    <select id="audio-freq-response" class="vib-dropdown" style="width: 100%;">
                        <option value="bass">Low (Bass)</option>
                        <option value="mid" selected>Mid</option>
                        <option value="treble">High (Treble)</option>
                        <option value="all">All Frequencies</option>
                    </select>
                </div>

                <!-- Smoothing Slider -->
                <div id="slider-audioSmoothing-container"></div>
            </div>
        `;
    }

    createStatusTab() {
        return `
            <div class="tab-section">
                <!-- Connection Status -->
                <div style="
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 6px;
                    border-left: 3px solid rgba(0, 255, 255, 0.5);
                    margin-bottom: 12px;
                ">
                    <div style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 4px;">
                        CONNECTION STATUS
                    </div>
                    <div id="audio-status-text" style="font-size: 12px; color: rgba(0, 255, 255, 0.8);">
                        ⚪ Not Connected
                    </div>
                </div>

                <!-- Audio Level Indicator -->
                <div style="
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 6px;
                    margin-bottom: 12px;
                ">
                    <div style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
                        AUDIO LEVEL
                    </div>
                    <div id="audio-level-display" style="
                        font-family: 'Space Mono', monospace;
                        font-size: 24px;
                        font-weight: 700;
                        color: rgba(0, 255, 255, 0.9);
                        text-align: center;
                    ">
                        0 dB
                    </div>
                </div>

                <!-- Frequency Spectrum Visual -->
                <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 6px;">
                        FREQUENCY SPECTRUM
                    </div>
                </div>
                <div id="audio-spectrum-visual" style="
                    width: 100%;
                    height: 80px;
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 4px;
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    padding: 4px;
                    overflow: hidden;
                ">
                    <!-- Spectrum bars will be generated dynamically -->
                </div>
            </div>
        `;
    }

    setupControls() {
        // Audio Enable Button
        const enableBtn = document.getElementById('audio-enable-btn');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => {
                const isEnabled = window.audioEnabled || false;
                if (isEnabled) {
                    // Disable audio
                    enableBtn.textContent = 'ENABLE AUDIO';
                    enableBtn.classList.remove('primary');
                    window.audioEnabled = false;
                } else {
                    // Enable audio
                    enableBtn.textContent = 'DISABLE AUDIO';
                    enableBtn.classList.add('primary');
                    window.audioEnabled = true;
                    this.initAudio();
                }
            });
        }

        // Audio Reactive Toggle
        const reactiveToggle = document.getElementById('audio-reactive-toggle');
        if (reactiveToggle) {
            reactiveToggle.addEventListener('click', () => {
                if (this.choreographer.audioReactive) {
                    this.choreographer.audioReactive = false;
                    reactiveToggle.textContent = 'AUDIO REACTIVE: OFF';
                    reactiveToggle.classList.remove('primary');
                } else {
                    this.choreographer.audioReactive = true;
                    reactiveToggle.textContent = 'AUDIO REACTIVE: ON';
                    reactiveToggle.classList.add('primary');
                }
            });
        }

        // Setup spectrum bars
        this.setupSpectrumBars();
    }

    setupSliders() {
        // Audio Intensity
        this.createSlider('audioIntensity', {
            label: 'Audio Intensity',
            min: 0,
            max: 2,
            step: 0.01,
            defaultValue: 1.0,
            unit: '',
            decimals: 2
        });

        // Audio Smoothing
        this.createSlider('audioSmoothing', {
            label: 'Smoothing',
            min: 0,
            max: 1,
            step: 0.01,
            defaultValue: 0.5,
            unit: '',
            decimals: 2
        });
    }

    createSlider(paramName, config) {
        const slider = new ParameterSlider({
            name: paramName,
            label: config.label,
            min: config.min,
            max: config.max,
            step: config.step,
            defaultValue: config.defaultValue,
            unit: config.unit,
            decimals: config.decimals,
            onChange: (name, value) => {
                // Update choreographer when slider changes
                this.choreographer.setParameter(name, value);
                console.log(`Audio: ${name} = ${value}`);
            }
        });

        // Store reference
        this.sliders[paramName] = slider;

        // Append to container
        const container = document.getElementById(`slider-${paramName}-container`);
        if (container) {
            container.appendChild(slider.getElement());
        }
    }

    setupSpectrumBars() {
        const spectrumContainer = document.getElementById('audio-spectrum-visual');
        if (!spectrumContainer) return;

        // Create 16 frequency bars
        for (let i = 0; i < 16; i++) {
            const bar = document.createElement('div');
            bar.style.cssText = `
                flex: 1;
                min-width: 4px;
                height: 0%;
                background: linear-gradient(to top,
                    rgba(0, 255, 255, 0.8),
                    rgba(0, 255, 255, 0.4)
                );
                border-radius: 2px 2px 0 0;
                transition: height 0.05s ease-out;
            `;
            spectrumContainer.appendChild(bar);
        }
    }

    initAudio() {
        // Placeholder for audio initialization
        const statusText = document.getElementById('audio-status-text');
        if (statusText) {
            statusText.innerHTML = '🟢 Connected';
            statusText.style.color = 'rgba(0, 255, 136, 0.9)';
        }
        console.log('Audio: Initialization requested');
    }

    startUpdateLoop() {
        // Update audio meters and spectrum every 50ms
        setInterval(() => {
            this.updateAudioVisuals();
        }, 50);
    }

    updateAudioVisuals() {
        if (!window.audioEnabled) return;

        // Update volume bar (simulated for now)
        const volumeBar = document.getElementById('audio-volume-bar');
        if (volumeBar) {
            // In real implementation, this would read from audio analyzer
            const fakeVolume = Math.random() * 100;
            volumeBar.style.width = `${fakeVolume}%`;
        }

        // Update audio level display
        const levelDisplay = document.getElementById('audio-level-display');
        if (levelDisplay) {
            const fakeLevel = Math.floor(Math.random() * 60 - 30);
            levelDisplay.textContent = `${fakeLevel} dB`;
        }

        // Update spectrum bars
        const spectrumContainer = document.getElementById('audio-spectrum-visual');
        if (spectrumContainer) {
            const bars = spectrumContainer.children;
            for (let i = 0; i < bars.length; i++) {
                const fakeHeight = Math.random() * 100;
                bars[i].style.height = `${fakeHeight}%`;
            }
        }
    }

    show() {
        if (this.panel) this.panel.show();
    }

    hide() {
        if (this.panel) this.panel.hide();
    }

    destroy() {
        if (this.panel) this.panel.destroy();
        Object.values(this.sliders).forEach(slider => slider.destroy());
    }
}
