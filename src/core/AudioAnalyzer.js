/**
 * AudioAnalyzer - Real-time audio analysis and beat detection
 * Multi-band frequency analysis with tempo tracking
 */

export class AudioAnalyzer {
    constructor(choreographer) {
        this.choreographer = choreographer;

        // Beat detection
        this.lastBeatTime = 0;
        this.beatHistory = [];
        this.avgBeatInterval = 0;
        this.beatPhase = 0;
        this.rhythmicPulse = 0;

        // Peak detection
        this.peakDetector = {
            bass: 0,
            mid: 0,
            high: 0,
            energy: 0
        };

        // Energy momentum
        this.energyMomentum = {
            bass: 0,
            mid: 0,
            high: 0
        };

        // Energy history for mode switching
        this.energyHistory = [];
        this.lastModeChange = 0;
    }

    /**
     * Get current audio data for choreography and telemetry consumers.
     * Consolidates smoothed band momentum, peak data, rhythm phase, and
     * derived tempo metrics so downstream systems can operate off one
     * canonical structure.
     */
    getAudioData() {
        const bpm = this.getTempoBPM();
        const spectral = this.getSpectralBalance();

        return {
            // Smoothed momentum values (great for choreography easing)
            bass: this.energyMomentum.bass,
            mid: this.energyMomentum.mid,
            high: this.energyMomentum.high,

            // Peak values (excellent for extreme hits / glitch bursts)
            bassPeak: this.peakDetector.bass,
            midPeak: this.peakDetector.mid,
            highPeak: this.peakDetector.high,

            // Combined energy and rhythm intelligence
            energy: this.peakDetector.energy,
            beatPhase: this.beatPhase,
            rhythmicPulse: this.rhythmicPulse,
            isBeat: (performance.now() - this.lastBeatTime) < 100,

            // Derived telemetry
            bpm,
            spectral,
            genre: this.detectGenre(bpm, spectral),
            genreConfidence: this.estimateGenreConfidence(spectral, bpm)
        };
    }

    /**
     * Get average value for a frequency range
     */
    getFrequencyRange(dataArray, startIdx, endIdx) {
        let sum = 0;
        for (let i = startIdx; i < endIdx && i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return sum / (endIdx - startIdx);
    }

    /**
     * Start the audio analysis loop
     */
    startAnalysisLoop() {
        const analyser = this.choreographer.analyser;
        if (!analyser) {
            console.warn('⚠️ No analyser available');
            return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let lastTime = performance.now();

        const loop = () => {
            requestAnimationFrame(loop);

            if (!this.choreographer.audioReactive || !analyser) return;

            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            analyser.getByteFrequencyData(dataArray);

            // ADVANCED MULTI-BAND FREQUENCY ANALYSIS
            const bass = this.getFrequencyRange(dataArray, 0, 100) / 255;
            const lowMid = this.getFrequencyRange(dataArray, 100, 250) / 255;
            const mid = this.getFrequencyRange(dataArray, 250, 500) / 255;
            const highMid = this.getFrequencyRange(dataArray, 500, 800) / 255;
            const high = this.getFrequencyRange(dataArray, 800, 1024) / 255;
            const energy = (bass * 2 + lowMid + mid + highMid + high) / 6; // Bass weighted

            // BEAT DETECTION (kick drum detection via bass spike)
            const beatThreshold = this.peakDetector.bass * 0.7 + 0.3;
            let isBeat = false;
            if (bass > beatThreshold && (now - this.lastBeatTime) > 250) {
                isBeat = true;
                this.lastBeatTime = now;
                this.beatHistory.push(now);
                if (this.beatHistory.length > 8) this.beatHistory.shift();

                // Calculate tempo from beat intervals
                if (this.beatHistory.length >= 4) {
                    const intervals = [];
                    for (let i = 1; i < this.beatHistory.length; i++) {
                        intervals.push(this.beatHistory[i] - this.beatHistory[i-1]);
                    }
                    this.avgBeatInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
                }
            }

            // RHYTHMIC PULSE (tempo-synced animation phase)
            if (this.avgBeatInterval > 0) {
                const timeSinceLastBeat = now - this.lastBeatTime;
                this.beatPhase = (timeSinceLastBeat / this.avgBeatInterval) % 1;
                this.rhythmicPulse = Math.sin(this.beatPhase * Math.PI * 2) * 0.5 + 0.5;
            }

            // PEAK DETECTION (smooth decay for adaptive thresholds)
            this.peakDetector.bass = Math.max(this.peakDetector.bass * 0.99, bass);
            this.peakDetector.mid = Math.max(this.peakDetector.mid * 0.99, mid);
            this.peakDetector.high = Math.max(this.peakDetector.high * 0.99, high);
            this.peakDetector.energy = Math.max(this.peakDetector.energy * 0.99, energy);

            // MOMENTUM (smooth acceleration/deceleration)
            this.energyMomentum.bass += (bass - this.energyMomentum.bass) * 0.15;
            this.energyMomentum.mid += (mid - this.energyMomentum.mid) * 0.12;
            this.energyMomentum.high += (high - this.energyMomentum.high) * 0.18;

            // ENERGY HISTORY (for dynamic mode switching)
            this.energyHistory.push(energy);
            if (this.energyHistory.length > 120) this.energyHistory.shift(); // 2 second window at 60fps

            // DYNAMIC MODE SWITCHING (based on song intensity)
            if ((now - this.lastModeChange) > 5000) { // Check every 5 seconds
                const avgEnergy = this.energyHistory.reduce((a,b) => a+b, 0) / this.energyHistory.length;
                const energyVariance = this.energyHistory.map(e => Math.abs(e - avgEnergy)).reduce((a,b) => a+b, 0) / this.energyHistory.length;

                let newMode = this.choreographer.choreographyMode;
                if (avgEnergy > 0.7 && energyVariance > 0.2) {
                    newMode = 'chaos';
                } else if (avgEnergy > 0.5) {
                    newMode = 'pulse';
                } else if (energyVariance > 0.15) {
                    newMode = 'dynamic';
                } else if (avgEnergy < 0.3) {
                    newMode = 'flow';
                } else {
                    newMode = 'wave';
                }

                if (newMode !== this.choreographer.choreographyMode) {
                    this.choreographer.choreographyMode = newMode;
                    this.lastModeChange = now;
                    console.log(`🎭 Choreography mode: ${newMode} (energy=${avgEnergy.toFixed(2)}, variance=${energyVariance.toFixed(2)})`);
                }
            }

            // Apply choreography with audio data
            this.choreographer.applyAdvancedChoreography({
                bass, lowMid, mid, highMid, high, energy,
                isBeat,
                beatPhase: this.beatPhase,
                rhythmicPulse: this.rhythmicPulse,
                momentum: this.energyMomentum,
                peaks: this.peakDetector,
                dt
            });
        };

        loop();
    }

    getTempoBPM() {
        if (!this.avgBeatInterval) {
            return 0;
        }
        return Math.round(60000 / this.avgBeatInterval);
    }

    getSpectralBalance() {
        const bass = Math.max(this.energyMomentum.bass, 0);
        const mid = Math.max(this.energyMomentum.mid, 0);
        const high = Math.max(this.energyMomentum.high, 0);
        const total = bass + mid + high || 1;
        return {
            low: bass / total,
            mid: mid / total,
            high: high / total
        };
    }

    getMoodTelemetry() {
        const audio = this.getAudioData();
        return {
            bpm: audio.bpm,
            spectralBalance: audio.spectral,
            genre: audio.genre,
            genreConfidence: audio.genreConfidence,
            energy: audio.energy,
            rhythm: {
                beatPhase: audio.beatPhase,
                rhythmicPulse: audio.rhythmicPulse,
                isBeat: audio.isBeat
            },
            peaks: {
                bass: audio.bassPeak,
                mid: audio.midPeak,
                high: audio.highPeak
            }
        };
    }

    detectGenre(bpm, spectral) {
        if (!spectral) return 'ambient';
        const { low, mid, high } = spectral;

        if (bpm >= 150 && high > 0.35) return 'drum-and-bass';
        if (bpm >= 132 && high > 0.3) return 'techno';
        if (bpm >= 118 && mid > 0.4) return 'progressive-house';
        if (bpm >= 108 && low > 0.45) return 'future-bass';
        if (bpm >= 90 && low > 0.5) return 'hip-hop';
        if (bpm >= 70 && mid > 0.5) return 'downtempo';
        return 'ambient';
    }

    estimateGenreConfidence(spectral, bpm) {
        if (!spectral) return 0.3;
        const spread = Math.max(spectral.low, spectral.mid, spectral.high);
        const tempoWeight = bpm ? Math.min(1, bpm / 180) : 0.2;
        return Math.min(1, (spread * 0.6) + (tempoWeight * 0.4));
    }

    /**
     * Get tempo in BPM
     */
    getBPM() {
        return this.getTempoBPM();
    }
}
