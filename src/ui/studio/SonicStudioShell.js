import { SonicMoodConductor } from '../../llm/SonicMoodConductor.js';

export class SonicStudioShell {
    constructor(choreographer, { isMobile = false } = {}) {
        this.choreographer = choreographer;
        this.isMobile = isMobile;

        this.elements = {};
        this.audioElement = null;
        this.animationFrame = null;
        this.currentTransportState = 'stop';
        this.moodConductor = null;

        this.onTimeUpdate = () => this.refreshTimecode();
        this.onPlay = () => this.setTransportState('play');
        this.onPause = () => this.setTransportState('pause');
        this.onEnded = () => this.setTransportState('stop');
        this.onLoadedMetadata = () => this.updateDuration();

        this.init();
    }

    init() {
        this.cacheElements();
        this.installEventHandlers();
        this.setTransportState('stop');
        this.updateSystemPills(this.choreographer.currentSystem);
        this.updateModeDisplay();
        this.startTelemetryLoop();
        this.bindAudioElement();
        this.initializeMoodConductor().catch(error => {
            console.warn('Sonic mood conductor setup deferred:', error);
        });
    }

    cacheElements() {
        this.elements.root = document.getElementById('studio-shell');
        this.elements.systemPills = Array.from(document.querySelectorAll('.system-pill'));
        this.elements.transportButtons = Array.from(document.querySelectorAll('[data-transport]'));
        this.elements.loadButton = document.querySelector('[data-action="load-audio"]');
        this.elements.fileInput = document.getElementById('audio-file-input');
        this.elements.audioStatusTop = document.getElementById('audio-status');
        this.elements.audioStatusBottom = document.getElementById('audio-status-bottom');
        this.elements.progressBar = document.querySelector('[data-progress]');
        this.elements.timecodeCurrent = document.querySelector('[data-time="current"]');
        this.elements.timecodeDuration = document.querySelector('[data-time="duration"]');
        this.elements.metricEnergyValue = document.querySelector('[data-metric-value="energy"]');
        this.elements.metricEnergyBar = document.querySelector('[data-metric-bar="energy"]');
        this.elements.metricIntensityValue = document.querySelector('[data-metric-value="intensity"]');
        this.elements.metricIntensityBar = document.querySelector('[data-metric-bar="intensity"]');
        this.elements.padReadouts = {
            controller: document.querySelector('[data-pad-readout="controller"]'),
            canvas: document.querySelector('[data-pad-readout="canvas"]')
        };
        this.elements.padCursors = {
            controller: document.querySelector('.trajectory-cursor[data-surface="controller"]'),
            canvas: document.querySelector('.trajectory-cursor[data-surface="canvas"]')
        };
        this.elements.controllerPadZone = document.getElementById('controller-pad-zone');
        this.elements.currentSystem = document.getElementById('current-system');
        this.elements.currentMode = document.getElementById('current-mode');
        this.elements.sequenceCount = document.getElementById('sequence-count');
        this.elements.moodButton = document.querySelector('[data-action="launch-ai-mood"]');
        this.elements.moodLabel = document.getElementById('sonic-mood-label');
        this.elements.moodDescription = document.getElementById('sonic-mood-description');
        this.elements.moodEnergy = document.getElementById('sonic-mood-energy');
        this.elements.moodTemperature = document.getElementById('sonic-mood-temperature');
        this.elements.moodKeywords = document.getElementById('sonic-mood-keywords');
    }

    installEventHandlers() {
        this.elements.systemPills.forEach(button => {
            button.addEventListener('click', () => this.handleSystemSwitch(button));
        });

        this.elements.transportButtons.forEach(button => {
            button.addEventListener('click', () => this.handleTransport(button.dataset.transport));
        });

        if (this.elements.loadButton && this.elements.fileInput) {
            this.elements.loadButton.addEventListener('click', () => this.elements.fileInput.click());
            this.elements.fileInput.addEventListener('change', (event) => {
                const file = event.target.files?.[0];
                if (file) {
                    this.handleAudioFile(file);
                }
            });
        }

        if (this.elements.moodButton) {
            this.elements.moodButton.addEventListener('click', () => this.launchMoodDesigner());
        }
    }

    async handleSystemSwitch(button) {
        const systemName = button?.dataset?.system;
        if (!systemName || systemName === this.choreographer.currentSystem) {
            return;
        }

        this.updateSystemPills(systemName);
        try {
            await this.choreographer.switchSystem(systemName);
            this.updateSystemLabels();
        } catch (error) {
            console.error('Failed to switch system:', error);
        }
    }

    updateSystemPills(activeSystem) {
        this.elements.systemPills.forEach(button => {
            const isActive = button.dataset.system === activeSystem;
            button.classList.toggle('active', isActive);
        });
        this.updateSystemLabels();
    }

    updateSystemLabels() {
        if (this.elements.currentSystem) {
            this.elements.currentSystem.textContent = (this.choreographer.currentSystem || '—').toUpperCase();
        }
    }

    updateModeDisplay() {
        if (this.elements.currentMode) {
            this.elements.currentMode.textContent = (this.choreographer.choreographyMode || 'IDLE').toUpperCase();
        }
        if (this.elements.sequenceCount) {
            const count = Array.isArray(this.choreographer.sequences) ? this.choreographer.sequences.length : 0;
            this.elements.sequenceCount.textContent = count.toString();
        }
    }

    handleTransport(action) {
        switch (action) {
            case 'play':
                this.choreographer.play();
                this.setTransportState('play');
                break;
            case 'pause':
                this.choreographer.pause();
                this.setTransportState('pause');
                break;
            case 'stop':
                this.choreographer.stop();
                this.setTransportState('stop');
                break;
            default:
                break;
        }
    }

    setTransportState(state) {
        this.currentTransportState = state;
        this.elements.transportButtons.forEach(button => {
            const isActive = button.dataset.transport === state;
            button.setAttribute('data-state', isActive ? 'active' : 'idle');
        });
    }

    async handleAudioFile(file) {
        this.updateAudioStatus(`Loading ${file.name}`);
        try {
            await this.choreographer.loadAudioFile(file);
            this.updateAudioStatus(`Loaded ${file.name}`);
            this.bindAudioElement(true);
        } catch (error) {
            console.error('Failed to load audio file:', error);
            this.updateAudioStatus('Audio load failed');
        }
    }

    updateAudioStatus(message) {
        if (this.elements.audioStatusTop) {
            this.elements.audioStatusTop.textContent = message;
        }
        if (this.elements.audioStatusBottom) {
            this.elements.audioStatusBottom.textContent = message;
        }
    }

    bindAudioElement(force = false) {
        const element = this.choreographer.audioElement;
        if (!element) {
            if (force) {
                // try again after audio pipeline finishes attaching
                setTimeout(() => this.bindAudioElement(false), 50);
            }
            return;
        }

        if (this.audioElement === element) {
            return;
        }

        this.detachAudioElement();
        this.audioElement = element;
        this.audioElement.addEventListener('timeupdate', this.onTimeUpdate);
        this.audioElement.addEventListener('play', this.onPlay);
        this.audioElement.addEventListener('pause', this.onPause);
        this.audioElement.addEventListener('ended', this.onEnded);
        this.audioElement.addEventListener('loadedmetadata', this.onLoadedMetadata, { once: true });
        this.updateDuration();
        this.refreshTimecode();
    }

    detachAudioElement() {
        if (!this.audioElement) return;
        this.audioElement.removeEventListener('timeupdate', this.onTimeUpdate);
        this.audioElement.removeEventListener('play', this.onPlay);
        this.audioElement.removeEventListener('pause', this.onPause);
        this.audioElement.removeEventListener('ended', this.onEnded);
        this.audioElement.removeEventListener('loadedmetadata', this.onLoadedMetadata);
        this.audioElement = null;
    }

    async initializeMoodConductor() {
        if (this.moodConductor) {
            return this.moodConductor;
        }

        try {
            this.moodConductor = new SonicMoodConductor(this.choreographer);
            this.moodConductor.onProfileApplied((profile) => this.updateMoodProfile(profile));
            await this.moodConductor.initialize();
            const activeProfile = this.moodConductor.getActiveProfile();
            if (activeProfile) {
                this.updateMoodProfile(activeProfile);
            }
        } catch (error) {
            console.warn('Failed to initialize SonicMoodConductor:', error);
        }

        return this.moodConductor;
    }

    launchMoodDesigner() {
        if (!this.moodConductor) {
            this.initializeMoodConductor().then(() => {
                this.moodConductor?.openDesigner();
            }).catch(error => console.warn('Unable to launch mood designer:', error));
            return;
        }

        this.moodConductor.openDesigner();
    }

    updateMoodProfile(profile) {
        if (!profile || !profile.mood) {
            return;
        }

        if (this.elements.moodLabel) {
            this.elements.moodLabel.textContent = profile.mood.label || 'Custom Sculpt';
        }

        if (this.elements.moodDescription) {
            this.elements.moodDescription.textContent = profile.mood.description || 'Describe a feeling to sculpt the stage.';
        }

        if (this.elements.moodEnergy) {
            const energy = typeof profile.mood.energy === 'number'
                ? Math.round(profile.mood.energy * 100)
                : Math.round((profile.metrics?.energy ?? 0.5) * 100);
            this.elements.moodEnergy.textContent = `${energy}% ENERGY`;
        }

        if (this.elements.moodTemperature) {
            const temp = profile.mood.colorTemperature || 'ambient';
            this.elements.moodTemperature.textContent = temp.toUpperCase();
            this.elements.moodTemperature.dataset.temperature = temp.toLowerCase();
        }

        if (this.elements.moodKeywords) {
            const keywords = Array.isArray(profile.mood.keywords) ? profile.mood.keywords : [];
            if (keywords.length) {
                this.elements.moodKeywords.innerHTML = keywords
                    .slice(0, 4)
                    .map(keyword => `<span>${keyword}</span>`)
                    .join('');
            } else {
                this.elements.moodKeywords.innerHTML = '<span>adaptive</span><span>audio-linked</span>';
            }
        }

        if (this.elements.audioStatusBottom) {
            this.elements.audioStatusBottom.textContent = `Sonic mood: ${profile.mood.label || 'Custom Sculpt'}`;
        }
    }

    updateDuration() {
        if (!this.audioElement || !this.elements.timecodeDuration) return;
        const duration = Number.isFinite(this.audioElement.duration) ? this.audioElement.duration : this.choreographer.duration;
        if (!duration || !Number.isFinite(duration)) {
            this.elements.timecodeDuration.textContent = '--:--';
            return;
        }
        this.elements.timecodeDuration.textContent = this.formatTime(duration);
    }

    refreshTimecode() {
        if (!this.audioElement) return;
        const current = this.audioElement.currentTime || 0;
        const duration = Number.isFinite(this.audioElement.duration) ? this.audioElement.duration : this.choreographer.duration;
        if (this.elements.timecodeCurrent) {
            this.elements.timecodeCurrent.textContent = this.formatTime(current);
        }
        if (duration && Number.isFinite(duration) && this.elements.progressBar) {
            const progress = Math.max(0, Math.min(1, current / duration));
            this.elements.progressBar.style.transform = `scaleX(${progress})`;
        }
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return '--:--';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    startTelemetryLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const loop = () => {
            this.animationFrame = requestAnimationFrame(loop);
            const matrix = this.choreographer?.sonicMatrix;
            if (!matrix) return;
            const frame = matrix.getLastFrameInfo();
            if (!frame) return;
            this.renderFrame(frame);
        };

        loop();
    }

    stopTelemetryLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    renderFrame(frame) {
        const audio = frame.audio || {};
        const finalParams = frame.finalParams || {};
        const surfaces = frame.surfaces || {};

        this.updateMetric(this.elements.metricEnergyValue, this.elements.metricEnergyBar, audio.energy || 0, 100, '%');
        this.updateMetric(this.elements.metricIntensityValue, this.elements.metricIntensityBar, finalParams.intensity || 0, 100, '%');

        this.updatePadTelemetry('controller', surfaces.controller);
        this.updatePadTelemetry('canvas', surfaces.canvas);

        this.updateModeDisplay();
    }

    updateMetric(valueElement, barElement, rawValue, scale, suffix) {
        if (valueElement) {
            const percent = Math.max(0, Math.min(1, rawValue));
            valueElement.textContent = `${Math.round(percent * scale)}${suffix}`;
        }
        if (barElement) {
            const clamped = Math.max(0, Math.min(1, rawValue));
            barElement.style.transform = `scaleX(${clamped})`;
        }
    }

    updatePadTelemetry(surfaceId, surfaceData = {}) {
        const position = surfaceData.position || { x: 0.5, y: 0.5 };
        const readout = this.elements.padReadouts?.[surfaceId];
        if (readout) {
            const x = Math.round(position.x * 100);
            const y = Math.round(position.y * 100);
            readout.textContent = `${x} · ${y}`;
        }
        const cursor = this.elements.padCursors?.[surfaceId];
        if (cursor) {
            cursor.style.left = `${position.x * 100}%`;
            cursor.style.top = `${(1 - position.y) * 100}%`;
        }
    }
}
