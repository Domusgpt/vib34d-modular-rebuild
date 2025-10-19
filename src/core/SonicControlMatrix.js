import { clamp } from '../utils/math.js';

/**
 * SonicControlMatrix
 *
 * Central router that fuses audio analysis, keyboard macros and XY pads
 * into a single stream of visual parameter updates.  Rather than allowing
 * UI elements to manipulate the visualizers directly, the matrix sculpts
 * the output using audio features as the driving energy source.
 */
export class SonicControlMatrix {
    constructor(choreographer) {
        this.choreographer = choreographer;

        this.parameterDefinitions = this.buildParameterDefinitions();
        this.audioBindings = this.buildAudioBindings();

        this.surfaceConfigs = this.buildSurfaceConfigs();
        this.surfaceStates = {
            controller: this.createSurfaceState(),
            canvas: this.createSurfaceState()
        };

        this.padOffsets = {};
        this.keyboardOffsets = {};
        this.smoothedParameters = {};

        this.moodProfile = null;
        this.reactivityGroups = {
            color: new Set(['hue', 'intensity', 'saturation']),
            geometry: new Set(['geometry', 'gridDensity', 'morphFactor']),
            motion: new Set(['speed', 'rot4dXW', 'rot4dYW', 'rot4dZW']),
            texture: new Set(['chaos', 'glitchIntensity', 'lineThickness', 'moireScale'])
        };

        this.lastAudioFrame = this.createSilentAudioFrame();
        this.lastFrameInfo = null;
    }

    buildParameterDefinitions() {
        const base = this.choreographer?.baseParams || {};
        const definitions = {
            geometry: { min: 1, max: 24, default: base.geometry ?? 1, smoothing: 0.12, padDepth: 6 },
            gridDensity: { min: 1, max: 120, default: base.gridDensity ?? 15, smoothing: 0.2, padDepth: 35 },
            morphFactor: { min: 0, max: 5, default: base.morphFactor ?? 1, smoothing: 0.15, padDepth: 1.6 },
            chaos: { min: 0, max: 3, default: base.chaos ?? 0.2, smoothing: 0.18, padDepth: 0.9 },
            speed: { min: 0.1, max: 10, default: base.speed ?? 1, smoothing: 0.2, padDepth: 3 },
            hue: { min: 0, max: 360, default: base.hue ?? 200, smoothing: 0.12, padDepth: 120 },
            intensity: { min: 0, max: 1, default: base.intensity ?? 0.5, smoothing: 0.25, padDepth: 0.35 },
            saturation: { min: 0, max: 1, default: base.saturation ?? 0.8, smoothing: 0.25, padDepth: 0.3 },
            rot4dXW: { min: -6.28, max: 6.28, default: base.rot4dXW ?? 0, smoothing: 0.18, padDepth: 4.8 },
            rot4dYW: { min: -6.28, max: 6.28, default: base.rot4dYW ?? 0, smoothing: 0.18, padDepth: 4.8 },
            rot4dZW: { min: -6.28, max: 6.28, default: base.rot4dZW ?? 0, smoothing: 0.18, padDepth: 4.8 },
            glitchIntensity: { min: 0, max: 0.2, default: base.glitchIntensity ?? 0.05, smoothing: 0.3, padDepth: 0.18 },
            moireScale: { min: 0.95, max: 1.05, default: base.moireScale ?? 1.01, smoothing: 0.35, padDepth: 0.035 },
            lineThickness: { min: 0.01, max: 0.1, default: base.lineThickness ?? 0.02, smoothing: 0.3, padDepth: 0.03 }
        };
        return definitions;
    }

    buildAudioBindings() {
        return {
            gridDensity: [
                { feature: 'momentum.bass', depth: 40, curve: 'easeOut', center: true },
                { feature: 'energy', depth: 20, curve: 'easeOut', center: true }
            ],
            morphFactor: [
                { feature: 'mid', depth: 1.2, curve: 'pow2', center: true }
            ],
            chaos: [
                { feature: 'energy', depth: 0.9, curve: 'pow2', center: true },
                { feature: 'momentum.high', depth: 0.6, curve: 'linear', center: true }
            ],
            speed: [
                { feature: 'high', depth: 2.6, curve: 'pow2', center: true },
                { feature: 'momentum.mid', depth: 1.2, curve: 'easeOut', center: true }
            ],
            hue: [
                { feature: 'beatPhase', depth: 180, curve: 'beat', baseShift: 0 },
                { feature: 'momentum.high', depth: 80, curve: 'linear', center: true }
            ],
            intensity: [
                { feature: 'energy', depth: 0.4, curve: 'easeOut', center: true },
                { feature: 'peaks.energy', depth: 0.35, curve: 'linear', center: true }
            ],
            saturation: [
                { feature: 'high', depth: 0.28, curve: 'linear', center: true },
                { feature: 'mid', depth: 0.18, curve: 'linear', center: true }
            ],
            rot4dXW: [
                { feature: 'momentum.bass', depth: 5.2, curve: 'pow2', center: true }
            ],
            rot4dYW: [
                { feature: 'momentum.mid', depth: 5.2, curve: 'pow2', center: true }
            ],
            rot4dZW: [
                { feature: 'momentum.high', depth: 5.2, curve: 'pow2', center: true }
            ],
            glitchIntensity: [
                { feature: 'peaks.high', depth: 0.15, curve: 'linear', center: true },
                { feature: 'isBeat', depth: 0.05, curve: 'pulse' }
            ],
            moireScale: [
                { feature: 'momentum.mid', depth: 0.03, curve: 'linear', center: true }
            ],
            lineThickness: [
                { feature: 'energy', depth: 0.025, curve: 'easeOut', center: true }
            ]
        };
    }

    buildSurfaceConfigs() {
        const controllerDepthX = this.getParameterDefinition('chaos').padDepth;
        const controllerDepthY = this.getParameterDefinition('speed').padDepth;
        return {
            controller: {
                axes: {
                    x: { parameter: 'chaos', depth: controllerDepthX, center: true, response: 'easeOut' },
                    y: { parameter: 'speed', depth: controllerDepthY, invert: true, center: true, response: 'easeOut' }
                }
            },
            canvas: {
                axes: {
                    x: [
                        { parameter: 'rot4dYW', depth: 4.5, center: true, response: 'pow2' },
                        { parameter: 'glitchIntensity', depth: 0.12, center: true, response: 'pow3' }
                    ],
                    y: [
                        { parameter: 'rot4dXW', depth: 4.5, invert: true, center: true, response: 'pow2' },
                        { parameter: 'intensity', depth: 0.4, invert: true, center: true, response: 'easeOut' }
                    ]
                },
                velocityMapping: { parameter: 'moireScale', depth: 0.02 }
            }
        };
    }

    createSurfaceState() {
        return {
            position: { x: 0.5, y: 0.5 },
            offsets: {},
            hold: false,
            lastPosition: null,
            velocity: { x: 0, y: 0 }
        };
    }

    createSilentAudioFrame() {
        return {
            bass: 0,
            mid: 0,
            high: 0,
            lowMid: 0,
            highMid: 0,
            energy: 0,
            beatPhase: 0,
            rhythmicPulse: 0,
            isBeat: false,
            momentum: { bass: 0, mid: 0, high: 0 },
            peaks: { bass: 0, mid: 0, high: 0, energy: 0 }
        };
    }

    getParameterDefinition(param) {
        return this.parameterDefinitions[param] || { min: 0, max: 1, default: 0.5, smoothing: 0.2, padDepth: 0.5 };
    }

    getBaseParameters() {
        const snapshot = {};
        const source = this.choreographer?.baseParams || {};
        Object.keys({ ...this.parameterDefinitions, ...source }).forEach(param => {
            const value = source[param];
            if (value !== undefined) {
                snapshot[param] = value;
            }
        });
        return snapshot;
    }

    updateBaseParameter(param, value) {
        const def = this.getParameterDefinition(param);
        def.default = value;
    }

    applyParameterBatch(params = {}, { immediate = true } = {}) {
        const clamped = this.clampParameterSet(params);
        const deltas = {};
        let changed = false;

        Object.entries(clamped).forEach(([param, value]) => {
            if (!Number.isFinite(value)) return;
            const previous = this.choreographer.baseParams[param];
            this.choreographer.baseParams[param] = value;
            this.updateBaseParameter(param, value);
            changed = true;
            if (previous !== value) {
                const numericPrev = Number.isFinite(previous) ? previous : undefined;
                const deltaValue = numericPrev !== undefined ? value - numericPrev : value;
                deltas[param] = {
                    from: numericPrev,
                    to: value,
                    delta: deltaValue
                };
            }
        });

        if (changed && immediate) {
            this.applyImmediate();
        }

        return { values: clamped, deltas };
    }

    clampParameterSet(params = {}) {
        const clamped = {};
        Object.entries(params).forEach(([param, value]) => {
            const def = this.getParameterDefinition(param);
            const numeric = parseFloat(value);
            if (!Number.isFinite(numeric)) return;
            clamped[param] = clamp(numeric, def.min, def.max);
        });
        return clamped;
    }

    normalizeReactivity(reactivity = {}) {
        if (typeof reactivity === 'number') {
            return { global: clamp(reactivity, 0, 2) };
        }

        const normalized = {};

        Object.entries(reactivity).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            const numeric = parseFloat(value);
            if (!Number.isFinite(numeric)) return;
            normalized[key] = clamp(numeric, 0, 2);
        });

        if (!('global' in normalized)) {
            normalized.global = 1;
        }

        return normalized;
    }

    setMoodProfile(profile = {}) {
        const normalizedParameters = this.clampParameterSet(
            profile.parameters || profile.parameterTargets || {}
        );

        const normalizedProfile = {
            ...profile,
            parameters: normalizedParameters,
            reactivity: this.normalizeReactivity(profile.reactivity || profile.reactivityBias || {}),
            timestamp: profile.timestamp || Date.now(),
            prompt: profile.prompt || profile.description || ''
        };

        this.moodProfile = normalizedProfile;

        let batchResult = null;
        if (Object.keys(normalizedParameters).length > 0) {
            batchResult = this.applyParameterBatch(normalizedParameters, { immediate: false });
        }

        this.applyImmediate();
        if (batchResult) {
            this.moodProfile = { ...this.moodProfile, deltas: batchResult.deltas };
        }
        return this.moodProfile;
    }

    clearMoodProfile() {
        this.moodProfile = null;
        this.applyImmediate();
    }

    getMoodProfile() {
        return this.moodProfile;
    }

    getReactivityScale(param) {
        if (!this.moodProfile || !this.moodProfile.reactivity) {
            return 1;
        }

        const { reactivity } = this.moodProfile;

        if (reactivity[param] !== undefined) {
            return reactivity[param];
        }

        for (const [group, params] of Object.entries(this.reactivityGroups)) {
            if (reactivity[group] !== undefined && params.has(param)) {
                return reactivity[group];
            }
        }

        return reactivity.global ?? 1;
    }

    setSurfaceAxisParameter(surfaceId, axis, parameter) {
        const config = this.surfaceConfigs[surfaceId];
        if (!config || !config.axes) return;

        const def = this.getParameterDefinition(parameter);
        const mapping = config.axes[axis];

        if (Array.isArray(mapping)) {
            if (!mapping.length) {
                mapping.push({ parameter, depth: def.padDepth, center: true });
            } else {
                mapping[0] = { ...mapping[0], parameter, depth: def.padDepth };
            }
        } else {
            config.axes[axis] = {
                ...(mapping || {}),
                parameter,
                depth: def.padDepth
            };
        }

        this.recalculateSurfaceOffsets(surfaceId);
        this.applyImmediate();
    }

    setSurfaceHold(surfaceId, hold) {
        const surface = this.surfaceStates[surfaceId];
        if (!surface) return;
        surface.hold = hold;
        if (!hold) {
            // When releasing hold, allow offsets to be rebuilt from current position
            this.recalculateSurfaceOffsets(surfaceId);
            this.applyImmediate();
        }
    }

    toggleSurfaceHold(surfaceId) {
        const surface = this.surfaceStates[surfaceId];
        if (!surface) return;
        surface.hold = !surface.hold;
        if (!surface.hold) {
            this.recalculateSurfaceOffsets(surfaceId);
        }
        this.applyImmediate();
        return surface.hold;
    }

    updatePadPosition(surfaceId, normX, normY) {
        const config = this.surfaceConfigs[surfaceId];
        const surface = this.surfaceStates[surfaceId];
        if (!config || !surface) return;

        const clampedX = clamp(normX, 0, 1);
        const clampedY = clamp(normY, 0, 1);

        const last = surface.position;
        surface.position = { x: clampedX, y: clampedY };
        if (surface.lastPosition) {
            surface.velocity = {
                x: clampedX - surface.lastPosition.x,
                y: clampedY - surface.lastPosition.y
            };
        }
        surface.lastPosition = { ...surface.position };

        if (surface.hold && Object.keys(surface.offsets).length) {
            // Respect hold state – keep offsets frozen
            return;
        }

        const offsets = {};
        ['x', 'y'].forEach(axis => {
            const mapping = config.axes[axis];
            if (!mapping) return;
            const rawValue = axis === 'x' ? clampedX : clampedY;
            if (Array.isArray(mapping)) {
                mapping.forEach(entry => {
                    const offset = this.computePadOffset(entry, rawValue, axis);
                    if (!Number.isFinite(offset)) return;
                    offsets[entry.parameter] = (offsets[entry.parameter] || 0) + offset;
                });
            } else {
                const offset = this.computePadOffset(mapping, rawValue, axis);
                if (Number.isFinite(offset)) {
                    offsets[mapping.parameter] = (offsets[mapping.parameter] || 0) + offset;
                }
            }
        });

        if (config.velocityMapping) {
            const speed = Math.hypot(surface.velocity.x, surface.velocity.y);
            const velOffset = speed * config.velocityMapping.depth;
            offsets[config.velocityMapping.parameter] = (offsets[config.velocityMapping.parameter] || 0) + velOffset;
        }

        surface.offsets = offsets;
        this.rebuildPadOffsets();
        this.applyImmediate();
    }

    computePadOffset(mapping, rawValue, axis) {
        if (!mapping || !mapping.parameter) return 0;
        let value = mapping.invert ? 1 - rawValue : rawValue;
        const center = mapping.center ?? false;
        let normalized = center ? (value - 0.5) : value;

        const response = mapping.response || 'linear';
        switch (response) {
            case 'pow2':
                normalized = Math.sign(normalized) * Math.pow(Math.abs(normalized), 2);
                break;
            case 'pow3':
                normalized = Math.sign(normalized) * Math.pow(Math.abs(normalized), 3);
                break;
            case 'easeOut':
                normalized = Math.sign(normalized) * (1 - Math.pow(1 - Math.abs(normalized), 2));
                break;
            case 'beat':
                normalized = Math.sin(normalized * Math.PI * 2);
                break;
            default:
                break;
        }

        const def = this.getParameterDefinition(mapping.parameter);
        const depth = mapping.depth ?? def.padDepth ?? ((def.max - def.min) / 2);
        return normalized * depth;
    }

    rebuildPadOffsets() {
        this.padOffsets = {};
        Object.values(this.surfaceStates).forEach(surface => {
            Object.entries(surface.offsets).forEach(([param, value]) => {
                this.padOffsets[param] = (this.padOffsets[param] || 0) + value;
            });
        });
    }

    recalculateSurfaceOffsets(surfaceId) {
        const surface = this.surfaceStates[surfaceId];
        if (!surface) return;
        this.updatePadPosition(surfaceId, surface.position.x, surface.position.y);
    }

    nudgeBaseParameter(param, delta, { quantize = false, wrap } = {}) {
        const def = this.getParameterDefinition(param);
        const base = this.choreographer.baseParams[param] ?? def.default ?? 0;
        let value = base + delta;

        if (wrap) {
            const min = wrap.min;
            const inc = wrap.increment ?? 1;
            const span = wrap.max - wrap.min + inc;
            const offset = value - min;
            value = min + (((offset % span) + span) % span);
        }

        if (quantize) {
            const precision = typeof quantize === 'number' ? quantize : 1;
            value = Math.round(value / precision) * precision;
        }

        value = clamp(value, def.min, def.max);
        this.choreographer.baseParams[param] = value;
        this.updateBaseParameter(param, value);
        this.applyImmediate();
        return value;
    }

    setKeyboardOffset(param, offset) {
        this.keyboardOffsets[param] = offset;
        this.applyImmediate();
    }

    apply(audioData, choreographyTargets = {}) {
        this.lastAudioFrame = { ...this.lastAudioFrame, ...audioData };

        const finalParams = {};
        const telemetry = {};

        const keys = new Set([
            ...Object.keys(this.parameterDefinitions),
            ...Object.keys(this.audioBindings),
            ...Object.keys(choreographyTargets || {})
        ]);

        keys.forEach(param => {
            const def = this.getParameterDefinition(param);
            const base = (choreographyTargets && param in choreographyTargets)
                ? choreographyTargets[param]
                : (this.choreographer.baseParams[param] ?? def.default ?? 0);

            const reactivityScale = this.getReactivityScale(param);
            const audioContribution = this.computeAudioContribution(param, audioData, def) * reactivityScale;
            const padContribution = this.padOffsets[param] || 0;
            const keyboardContribution = this.keyboardOffsets[param] || 0;

            let target = base + audioContribution + padContribution + keyboardContribution;
            target = clamp(target, def.min, def.max);

            const previous = this.smoothedParameters[param] ?? base;
            const smoothing = clamp(def.smoothing ?? 0.2, 0, 1);
            const smoothed = previous + (target - previous) * (1 - Math.pow(1 - smoothing, 2));

            this.smoothedParameters[param] = smoothed;
            finalParams[param] = smoothed;
            telemetry[param] = {
                base,
                audio: audioContribution,
                pad: padContribution,
                keyboard: keyboardContribution,
                final: smoothed
            };

            this.choreographer.applyLiveParameter(param, smoothed);
        });

        const frameInfo = {
            audio: { ...audioData },
            finalParams,
            telemetry,
            surfaces: this.getSurfaceSnapshot(),
            assignments: this.getSurfaceAssignments(),
            baseParams: { ...this.choreographer.baseParams }
        };

        this.lastFrameInfo = frameInfo;
        return frameInfo;
    }

    computeAudioContribution(param, audioData, def) {
        const bindings = this.audioBindings[param];
        if (!bindings) return 0;

        const contributions = bindings.map(binding => {
            const value = this.extractFeature(audioData, binding.feature);
            if (value === undefined || value === null) return 0;

            let processed = value;
            if (binding.center) {
                processed = (processed - 0.5);
            }

            switch (binding.curve) {
                case 'pow2':
                    processed = Math.sign(processed) * Math.pow(Math.abs(processed), 2);
                    break;
                case 'pow3':
                    processed = Math.sign(processed) * Math.pow(Math.abs(processed), 3);
                    break;
                case 'easeOut':
                    processed = Math.sign(processed) * (1 - Math.pow(1 - Math.abs(processed), 2));
                    break;
                case 'pulse':
                    processed = binding.feature === 'isBeat' && audioData.isBeat ? 1 : 0;
                    break;
                case 'beat':
                    processed = Math.sin(processed * Math.PI * 2);
                    break;
                default:
                    break;
            }

            if (binding.baseShift) {
                processed += binding.baseShift;
            }

            const depth = binding.depth ?? ((def.max - def.min) / 2);
            return processed * depth;
        });

        return contributions.reduce((sum, contribution) => sum + contribution, 0);
    }

    extractFeature(audioData, featurePath) {
        if (!featurePath) return 0;
        if (featurePath === 'isBeat') {
            return audioData.isBeat ? 1 : 0;
        }
        const parts = featurePath.split('.');
        let value = audioData;
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return 0;
            }
        }
        return value ?? 0;
    }

    getSurfaceSnapshot() {
        const snapshot = {};
        Object.entries(this.surfaceStates).forEach(([key, surface]) => {
            snapshot[key] = {
                position: { ...surface.position },
                hold: surface.hold,
                offsets: { ...surface.offsets }
            };
        });
        return snapshot;
    }

    getSurfaceAssignments() {
        const assignments = {};
        Object.entries(this.surfaceConfigs).forEach(([key, config]) => {
            assignments[key] = { x: null, y: null };
            if (!config.axes) return;
            ['x', 'y'].forEach(axis => {
                const mapping = config.axes[axis];
                if (Array.isArray(mapping)) {
                    assignments[key][axis] = mapping.map(entry => entry.parameter);
                } else if (mapping && mapping.parameter) {
                    assignments[key][axis] = mapping.parameter;
                }
            });
        });
        return assignments;
    }

    applyImmediate() {
        const audioFrame = this.lastAudioFrame || this.createSilentAudioFrame();
        const lastTargets = this.lastFrameInfo?.finalParams || {};
        this.apply(audioFrame, lastTargets);
    }

    getLastFrameInfo() {
        return this.lastFrameInfo;
    }
}
