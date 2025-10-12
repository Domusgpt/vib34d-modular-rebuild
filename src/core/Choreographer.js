/**
 * VIB34D Ultimate Choreographer
 * Main orchestrator for 4D music video choreography system
 * Coordinates systems, audio analysis, sequences, and recording
 */

import { RecordingEngine } from './RecordingEngine.js';
import { AudioAnalyzer } from './AudioAnalyzer.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';
import { PresetManager } from './PresetManager.js';
import { KeyboardController } from './KeyboardController.js';
import { applyChoreographyMode } from '../choreography/ChoreographyModes.js';
import { applyParameterSweeps } from '../choreography/ParameterSweeps.js';
import { applyColorPalette } from '../choreography/ColorPalettes.js';
import { VIB34DIntegratedEngine } from '../systems/VIB34DIntegratedEngine.js';
import { QuantumEngine } from '../systems/QuantumEngine.js';
import { RealHolographicSystem } from '../systems/RealHolographicSystem.js';
import { CanvasLayerManager } from '../systems/CanvasLayerManager.js';

export class Choreographer {
    constructor() {
        this.currentSystem = 'faceted';
        this.systemSwitchInProgress = false;
        this.systems = {
            faceted: { engine: null, canvases: [], active: true },
            quantum: { engine: null, canvases: [], active: false },
            holographic: { engine: null, canvases: [], active: false }
        };

        // CRITICAL: Canvas layer manager for smart 5-layer canvas handling
        this.canvasManager = null;

        // Base parameters - NEVER modified by audio
        this.baseParams = {
            geometry: 1,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.5,
            saturation: 0.8,
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };

        // Audio system
        this.audioContext = null;
        this.audioElement = null;
        this.audioReactive = true;
        this.reactivityStrength = 0.5;

        // Timeline
        this.sequences = [];
        this.currentTime = 0;
        this.duration = 0;
        this.isPlaying = false;

        // Enhanced choreography systems
        this.activeColorPalette = null;
        this.activeSweeps = {};

        // Choreography mode (from ChoreographyModes.js)
        this.choreographyMode = 'dynamic';
        this.lastModeChange = 0;

        // Pattern recognition
        this.patternTemplates = {};
        this.sectionPatterns = [];
        this.songStructure = '';

        // Initialize sub-systems
        this.recordingEngine = null;
        this.audioAnalyzer = null;
        this.sequenceMonitorInterval = null;

        // Enhanced systems
        this.performanceMonitor = null;
        this.presetManager = null;
        this.keyboardController = null;
    }

    async init() {
        console.log('🎬 Initializing Choreographer...');

        // Initialize enhanced systems
        this.performanceMonitor = new PerformanceMonitor();
        this.presetManager = new PresetManager(this);
        this.keyboardController = new KeyboardController(this);

        await this.initCanvases();
        await this.initCurrentSystem();

        // Start performance monitoring
        this.performanceMonitor.start();
        this.setupAudio();
        this.setupUI();

        // Initialize recording engine
        this.recordingEngine = new RecordingEngine(this);

        // Initialize audio analyzer
        this.audioAnalyzer = new AudioAnalyzer(this);

        console.log('✅ Choreographer ready!');
    }

    async initCanvases() {
        // CRITICAL: Initialize canvas layer manager with stage container
        const stageContainer = document.getElementById('stage-container');
        if (!stageContainer) {
            throw new Error('stage-container element not found');
        }

        this.canvasManager = new CanvasLayerManager(stageContainer);
        console.log('✅ Canvas layer manager initialized');
    }

    async initCurrentSystem() {
        // CRITICAL: Only initialize the active system to save resources
        await this.createSystem(this.currentSystem);
    }

    async createSystem(systemName) {
        console.log(`🔧 Creating ${systemName} system...`);

        const sys = this.systems[systemName];

        // Prevent console spam from visualizers
        const originalLog = console.log;
        const logThrottle = {};
        console.log = (...args) => {
            const msg = args.join(' ');
            const key = msg.substring(0, 50);
            const now = Date.now();
            if (!logThrottle[key] || now - logThrottle[key] > 1000) {
                logThrottle[key] = now;
                originalLog.apply(console, args);
            }
        };

        // Destroy existing engine if present
        if (sys.engine) {
            await this.destroySystem(systemName);
        }

        // CRITICAL: Use CanvasLayerManager for smart 5-layer canvas creation
        if (!this.canvasManager) {
            throw new Error('CanvasLayerManager not initialized');
        }

        // Create 5-layer canvas system with proper canvas IDs
        const { canvases, layerSpecs } = this.canvasManager.createLayers(systemName);
        sys.canvases = canvases;

        console.log(`✅ Created ${canvases.length} layers for ${systemName}`);

        // Wait for canvases to be fully laid out
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));

        // Create new engine
        try {
            if (systemName === 'faceted') {
                sys.engine = new VIB34DIntegratedEngine();
                console.log('✅ Faceted engine created (stub)');
            } else if (systemName === 'quantum') {
                sys.engine = new QuantumEngine();
                console.log('✅ Quantum engine created (stub)');
            } else if (systemName === 'holographic') {
                sys.engine = new RealHolographicSystem();
                console.log('✅ Holographic engine created (stub)');

                // Disable built-in audio reactivity
                sys.engine.audioEnabled = false;
                sys.engine.audioContext = null;
                sys.engine.analyser = null;
                sys.engine.initAudio = () => {};
                sys.engine.updateAudio = () => {};
                sys.engine.disableAudio = () => {};
                sys.engine.applyAudioReactivityGrid = () => {};
            }

            // Real engines initialize their own visualizers
            // Just set the engine as active and update parameters
            this.updateSystemParameters(sys.engine);

            if (sys.engine && sys.engine.setActive) {
                sys.engine.setActive(true);
            }

            console.log(`✅ ${systemName} system created with real WebGL engine`);

        } catch (error) {
            console.error(`❌ Failed to create ${systemName}:`, error);
            console.error('Error details:', error.stack);
        } finally {
            console.log = originalLog;
        }
    }

    async switchSystem(systemName) {
        if (systemName === this.currentSystem) return;

        console.log(`🔄 Switching from ${this.currentSystem} to ${systemName}`);

        // CRITICAL: Use CanvasLayerManager's smart switching
        // This properly cleans up WebGL contexts and prevents memory leaks
        const oldSystem = this.currentSystem;

        await this.destroySystem(oldSystem);
        this.currentSystem = systemName;
        await this.createSystem(systemName);

        // Update UI
        document.querySelectorAll('.system-pill').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.system === systemName);
        });

        console.log(`✅ Switched from ${oldSystem} to ${systemName} with proper layer cleanup`);
    }

    async destroySystem(systemName) {
        const sys = this.systems[systemName];

        console.log(`🗑️ Destroying ${systemName} system...`);

        if (sys.engine) {
            if (sys.engine.setActive) {
                sys.engine.setActive(false);
            }

            // Destroy all visualizers
            if (sys.engine.visualizers && Array.isArray(sys.engine.visualizers)) {
                sys.engine.visualizers.forEach(viz => {
                    // Stop animation if it has a stop method
                    if (viz.stop) {
                        viz.stop();
                    }

                    // Lose WebGL context if it exists
                    if (viz.gl) {
                        const ext = viz.gl.getExtension('WEBGL_lose_context');
                        if (ext) ext.loseContext();
                    }
                });
                sys.engine.visualizers = [];
            }

            sys.engine = null;
        }

        // CRITICAL: Use CanvasLayerManager for smart canvas cleanup
        if (this.canvasManager) {
            this.canvasManager.destroyLayers(systemName);
        }

        sys.canvases = [];
        console.log(`✅ ${systemName} destroyed with proper WebGL context cleanup`);
    }

    updateSystemParameters(engine) {
        if (!engine) return;

        Object.entries(this.baseParams).forEach(([param, value]) => {
            if (engine.parameterManager && engine.parameterManager.setParameter) {
                engine.parameterManager.setParameter(param, value);
            } else if (engine.updateParameter) {
                engine.updateParameter(param, value);
            }
        });
    }

    setParameter(param, value) {
        // Update base parameter
        this.baseParams[param] = value;

        // Update ALL systems
        Object.values(this.systems).forEach(sys => {
            if (!sys.engine) return;

            if (sys.engine.parameterManager && sys.engine.parameterManager.setParameter) {
                sys.engine.parameterManager.setParameter(param, value);
                if (sys.engine.updateVisualizers) {
                    sys.engine.updateVisualizers();
                }
            }

            if (sys.engine.visualizers && Array.isArray(sys.engine.visualizers)) {
                const params = this.baseParams;
                sys.engine.visualizers.forEach(visualizer => {
                    if (visualizer.updateParameters) {
                        visualizer.updateParameters(params);
                    }
                });
            }

            if (sys.engine.updateParameter) {
                sys.engine.updateParameter(param, value);
            }
        });
    }

    getCurrentParameters() {
        return { ...this.baseParams };
    }

    setupAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // CREATE THE ANALYSER NODE - CRITICAL FOR AUDIO!
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        console.log('✅ Audio system initialized with analyser node');
    }

    async loadAudioFile(file) {
        if (!file) return;

        const url = URL.createObjectURL(file);

        // Resume AudioContext
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🎵 AudioContext resumed');
        }

        // If we already have an audio element and source, disconnect and reuse
        console.log(`🔍 Audio state check: element=${!!this.audioElement}, source=${!!this.mediaSource}`);

        if (this.audioElement && this.mediaSource) {
            console.log('🔄 Reusing existing audio element and source');
            this.audioElement.pause();
            this.audioElement.src = url;
            this.audioElement.load();
        } else {
            // First time setup - create audio element and connect to Web Audio API
            console.log('🎵 Creating new audio element and Web Audio connection');

            // If there's an existing element but no source, something went wrong
            if (this.audioElement && !this.mediaSource) {
                console.warn('⚠️  Audio element exists but mediaSource is missing!');
            }

            this.audioElement = new Audio(url);
            this.audioElement.crossOrigin = 'anonymous';

            // Create MediaElementSource ONCE and store it
            this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
            this.mediaSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            console.log('✅ Web Audio API connected - mediaSource stored');
            console.log(`✅ Verification: element=${!!this.audioElement}, source=${!!this.mediaSource}`);
        }

        // Start audio analysis loop
        if (this.audioAnalyzer) {
            this.audioAnalyzer.startAnalysisLoop();
        }

        this.audioElement.addEventListener('loadedmetadata', () => {
            this.duration = this.audioElement.duration;
            console.log(`🎵 Audio loaded: ${this.duration.toFixed(2)}s`);
        });

        this.audioElement.addEventListener('error', (e) => {
            console.error('Audio element error:', e);
        });
    }

    applyAdvancedChoreography(audioData) {
        const strength = this.reactivityStrength;
        const sys = this.systems[this.currentSystem];
        if (!sys.engine) return;

        const setParam = (param, value) => {
            if (sys.engine.parameterManager && sys.engine.parameterManager.setParameter) {
                sys.engine.parameterManager.setParameter(param, value);
            } else if (sys.engine.updateParameter) {
                sys.engine.updateParameter(param, value);
            }
        };

        // Use ChoreographyModes module
        applyChoreographyMode(this.choreographyMode, audioData, setParam, strength, this.baseParams);
    }

    async analyzeSongWithAI(apiKey) {
        if (!apiKey) throw new Error('No API key provided');
        if (!this.audioElement) throw new Error('No audio file loaded');

        const songDuration = this.duration || 180;
        const currentBPM = this.audioAnalyzer ?
            (this.audioAnalyzer.avgBeatInterval > 0 ? (60000 / this.audioAnalyzer.avgBeatInterval).toFixed(0) : 120)
            : 120;

        // Build AI prompt (simplified version)
        const prompt = `Create a music choreography plan for a ${songDuration.toFixed(0)} second song at ${currentBPM} BPM. Return JSON with sections array containing: name, pattern, startTime, duration, system (faceted/quantum/holographic), geometry (0-7), choreographyMode, parameters, colorPalette, parameterSweeps.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.candidates[0].content.parts[0].text.trim();

        // Extract JSON from response
        if (text.startsWith('```json')) {
            text = text.replace(/```json\n/, '').replace(/\n```$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n/, '').replace(/\n```$/, '');
        }

        return JSON.parse(text);
    }

    applyAIChoreography(analysis) {
        console.log('🎭 Applying AI Choreography:', analysis);

        this.sequences = [];

        if (analysis.sections && Array.isArray(analysis.sections)) {
            const processedSections = this.processPatternRecognition(analysis.sections);

            processedSections.forEach((section, index) => {
                const sequence = {
                    name: section.name,
                    startTime: section.startTime,
                    duration: section.duration,
                    system: section.system,
                    geometry: section.geometry,
                    mode: section.choreographyMode,
                    parameters: section.parameters,
                    pattern: section.pattern,
                    colorPalette: section.colorPalette,
                    parameterSweeps: section.parameterSweeps,
                    active: false
                };

                this.sequences.push(sequence);
            });

            this.startSequenceMonitoring();
            this.renderTimeline();
        }
    }

    processPatternRecognition(sections) {
        const patternOccurrences = {};

        return sections.map((section, index) => {
            const pattern = section.pattern;

            if (!pattern) return section;

            if (!patternOccurrences[pattern]) {
                patternOccurrences[pattern] = 0;
            }
            patternOccurrences[pattern]++;

            const occurrence = patternOccurrences[pattern];

            // First occurrence stores the template
            if (occurrence === 1) {
                this.patternTemplates[pattern] = this.createPatternTemplate(section, pattern);
                section.patternVariation = 'first';
                return section;
            }

            // Subsequent occurrences reuse the template
            const template = this.patternTemplates[pattern];

            let variation = 'second';
            if (occurrence >= 3) variation = 'final-climax';

            this.applyPatternToSection(template, section, section.system, variation);
            section.patternVariation = variation;

            return section;
        });
    }

    createPatternTemplate(section, patternType) {
        return {
            type: patternType,
            geometry: section.geometry,
            mode: section.mode || section.choreographyMode,
            parameters: { ...section.parameters },
            colorPalette: section.colorPalette ? { ...section.colorPalette } : null,
            parameterSweeps: section.parameterSweeps ? { ...section.parameterSweeps } : null
        };
    }

    applyPatternToSection(template, section, systemOverride = null, variation = null) {
        section.geometry = template.geometry;
        section.mode = template.mode;
        section.parameters = { ...template.parameters };

        if (template.colorPalette) {
            section.colorPalette = {
                ...template.colorPalette,
                colors: template.colorPalette.colors ?
                    template.colorPalette.colors.map(c => ({ ...c })) : []
            };

            if (variation) {
                this.applyPatternVariation(section, variation);
            }
        }

        if (template.parameterSweeps) {
            section.parameterSweeps = {};
            Object.entries(template.parameterSweeps).forEach(([key, sweep]) => {
                section.parameterSweeps[key] = { ...sweep };
            });
        }

        if (systemOverride) {
            section.system = systemOverride;
        }
    }

    applyPatternVariation(section, variation) {
        switch (variation) {
            case 'second':
                if (section.parameters) {
                    section.parameters.gridDensity = Math.min(95, (section.parameters.gridDensity || 50) * 1.1);
                    section.parameters.intensity = Math.min(1.0, (section.parameters.intensity || 0.8) * 1.1);
                }
                break;

            case 'final-climax':
                if (section.parameters) {
                    section.parameters.gridDensity = Math.min(100, (section.parameters.gridDensity || 50) * 1.5);
                    section.parameters.chaos = Math.min(0.95, (section.parameters.chaos || 0.5) * 1.3);
                    section.parameters.speed = Math.min(3.0, (section.parameters.speed || 1.0) * 1.5);
                }
                if (section.colorPalette && section.colorPalette.colors) {
                    section.colorPalette.colors = section.colorPalette.colors.map(c => ({
                        ...c,
                        intensity: Math.min(1.0, (c.intensity || 0.8) * 1.2),
                        saturation: Math.min(1.0, (c.saturation || 0.9) * 1.1)
                    }));
                }
                break;
        }
    }

    startSequenceMonitoring() {
        if (this.sequenceMonitorInterval) {
            clearInterval(this.sequenceMonitorInterval);
        }

        this.sequenceMonitorInterval = setInterval(() => {
            if (!this.audioElement || !this.isPlaying) return;

            const currentTime = this.audioElement.currentTime;
            this.updateChoreographyAtTime(currentTime);
        }, 100);
    }

    updateChoreographyAtTime(currentTime) {
        this.sequences.forEach(seq => {
            const inSequence = currentTime >= seq.startTime && currentTime < (seq.startTime + seq.duration);

            if (inSequence && !seq.active) {
                seq.active = true;

                if (seq.system && seq.system !== this.currentSystem) {
                    this.switchSystem(seq.system);
                }

                if (seq.parameters) {
                    Object.entries(seq.parameters).forEach(([param, value]) => {
                        this.setParameter(param, value);
                        this.baseParams[param] = value;
                    });
                }

                if (seq.mode) {
                    this.choreographyMode = seq.mode;
                }

                if (seq.geometry !== undefined) {
                    this.setParameter('geometry', seq.geometry);
                }
            }

            if (inSequence && seq.colorPalette) {
                const sectionTime = currentTime - seq.startTime;
                const progress = sectionTime / seq.duration;
                const beatPhase = this.audioAnalyzer ? this.audioAnalyzer.beatPhase : 0;
                const audioData = this.audioAnalyzer ? this.audioAnalyzer.getAudioData() : null;

                applyColorPalette(seq.colorPalette, progress, beatPhase, audioData, (p, v) => this.setParameter(p, v));
            }

            if (inSequence && seq.parameterSweeps) {
                const sectionTime = currentTime - seq.startTime;
                const progress = sectionTime / seq.duration;

                applyParameterSweeps(seq.parameterSweeps, progress, seq.duration, (p, v) => this.setParameter(p, v));
            }

            if (!inSequence && seq.active) {
                seq.active = false;
            }
        });
    }

    async play() {
        if (!this.audioElement) {
            console.warn('⚠️ No audio file loaded');
            return;
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        await this.audioElement.play();
        this.isPlaying = true;

        // Start audio analysis loop (FIXED: was calling wrong method name)
        if (this.audioAnalyzer) {
            this.audioAnalyzer.startAnalysisLoop();
        }

        console.log('✅ Playback started');
    }

    pause() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }

    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
        }
    }

    renderTimeline() {
        // TODO: Implement timeline rendering
        console.log('📝 TODO: Implement timeline rendering UI');
    }

    setupUI() {
        // TODO: Implement full UI setup
        console.log('📝 TODO: Implement UI setup');
    }

    exportChoreography() {
        const data = {
            version: '1.0',
            duration: this.duration,
            sequences: this.sequences,
            baseParams: this.baseParams
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `choreography-${Date.now()}.json`;
        a.click();

        console.log('💾 Choreography exported');
    }

    /**
     * Get current active engine for external control
     */
    get currentEngine() {
        const sys = this.systems[this.currentSystem];
        return sys ? sys.engine : null;
    }

    /**
     * Update geometry for current engine
     * @param {Array} vertices - 4D vertex array [[x,y,z,w], ...]
     */
    updateGeometry(vertices) {
        const engine = this.currentEngine;
        if (!engine) {
            console.warn('⚠️ No active engine to update geometry');
            return;
        }

        console.log(`🔺 Updating geometry for ${this.currentSystem} engine (${vertices.length} vertices)`);

        // Different engines may have different update methods
        if (engine.updateGeometry) {
            engine.updateGeometry(vertices);
        } else if (engine.parameterManager && engine.parameterManager.setGeometry) {
            engine.parameterManager.setGeometry(vertices);
        } else if (engine.setParameter) {
            engine.setParameter('vertices', vertices);
        } else {
            console.warn(`⚠️ Engine ${this.currentSystem} does not support geometry updates`);
        }

        // Force visualizer update
        if (engine.updateVisualizers) {
            engine.updateVisualizers();
        } else if (engine.update) {
            engine.update();
        }
    }

    /**
     * Set geometry by index (for backwards compatibility)
     * @param {number} geometryIndex
     */
    setGeometry(geometryIndex) {
        this.baseParams.geometry = geometryIndex;
        this.updateParameter('geometry', geometryIndex);
    }
}
