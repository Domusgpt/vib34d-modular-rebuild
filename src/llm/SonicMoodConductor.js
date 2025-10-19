import { LLMParameterInterface } from './LLMParameterInterface.js';
import { LLMParameterUI } from './LLMParameterUI.js';
import { clamp } from '../utils/math.js';

/**
 * SonicMoodConductor
 * Bridges LLM mood descriptions with the SonicControlMatrix so prompts
 * sculpt the stage instead of mutating visualizers directly.
 */
export class SonicMoodConductor {
    constructor(choreographer, options = {}) {
        this.choreographer = choreographer;
        this.sonicMatrix = choreographer?.sonicMatrix || null;

        this.llmInterface = options.llmInterface || new LLMParameterInterface();
        this.ui = options.ui || new LLMParameterUI(this.llmInterface);

        this.listeners = new Set();
        this.logListeners = new Set();
        this.sessionLog = [];
        this.sessionIndex = new Map();
        this.maxLogEntries = options.maxLogEntries || 50;
        this.activeProfile = null;
        this.quickAdjustState = {
            energy: 0,
            texture: 0,
            color: 0,
            baselineParameters: null,
            baselinePalette: null,
            baselineMoodEnergy: 0.5
        };
        this.adjustableParameters = [
            'speed',
            'intensity',
            'chaos',
            'glitchIntensity',
            'lineThickness',
            'hue',
            'saturation'
        ];

        this.llmInterface.setParameterCallback((profile) => {
            this.applyProfile(profile);
        });
    }

    async initialize() {
        await this.llmInterface.initialize();
        return this;
    }

    openDesigner() {
        if (this.ui && this.ui.show) {
            return this.ui.show();
        }
        return null;
    }

    onProfileApplied(listener) {
        if (typeof listener === 'function') {
            this.listeners.add(listener);
        }
    }

    offProfileApplied(listener) {
        if (listener && this.listeners.has(listener)) {
            this.listeners.delete(listener);
        }
    }

    onLogEntry(listener) {
        if (typeof listener === 'function') {
            this.logListeners.add(listener);
        }
    }

    offLogEntry(listener) {
        if (listener && this.logListeners.has(listener)) {
            this.logListeners.delete(listener);
        }
    }

    notifyListeners(profile) {
        this.listeners.forEach(listener => {
            try {
                listener(profile);
            } catch (error) {
                console.error('SonicMoodConductor listener error:', error);
            }
        });
    }

    notifyLogListeners(latestEntry = null) {
        const snapshot = this.getSessionLog();
        const entryClone = latestEntry ? this.cloneForLog(latestEntry) : null;
        this.logListeners.forEach(listener => {
            try {
                listener(snapshot, entryClone);
            } catch (error) {
                console.error('SonicMoodConductor log listener error:', error);
            }
        });
    }

    normalizeProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            return {
                prompt: '',
                timestamp: Date.now(),
                source: 'llm-fallback',
                parameters: {},
                reactivity: { global: 1 },
                palette: {
                    primaryHue: 200,
                    accentHue: 340,
                    saturation: 0.7,
                    intensity: 0.6,
                    narrative: 'Fallback palette'
                },
                mood: {
                    label: 'Custom Sculpt',
                    description: 'Manual settings',
                    energy: 0.5,
                    colorTemperature: 'ambient',
                    keywords: []
                },
                metrics: {},
                keywords: []
            };
        }

        const normalized = {
            ...profile,
            timestamp: profile.timestamp || Date.now(),
            parameters: profile.parameters || profile.parameterTargets || {},
            reactivity: profile.reactivity || { global: 1 },
            palette: profile.palette || {
                primaryHue: 200,
                accentHue: 340,
                saturation: 0.7,
                intensity: 0.6,
                narrative: 'Auto palette'
            },
            mood: profile.mood || {
                label: profile.moodLabel || 'Custom Sculpt',
                description: profile.moodDescription || profile.prompt || 'AI sculpted mood',
                energy: profile.energy ?? 0.5,
                colorTemperature: profile.colorTemperature || 'ambient',
                keywords: profile.keywords || []
            },
            metrics: profile.metrics || {},
            keywords: profile.keywords || profile.mood?.keywords || []
        };

        if (normalized.mood && typeof normalized.mood.energy !== 'number') {
            normalized.mood.energy = normalized.metrics?.energy ?? 0.5;
        }

        if (!normalized.mood.keywords || !normalized.mood.keywords.length) {
            normalized.mood.keywords = normalized.keywords || [];
        }

        return normalized;
    }

    applyProfile(profile) {
        const normalized = this.normalizeProfile(profile);
        const matrix = this.choreographer?.sonicMatrix;
        const before = matrix?.getBaseParameters?.() || {};
        let appliedParameters = { ...(normalized.parameters || {}) };
        let deltas = {};

        if (matrix) {
            const appliedProfile = matrix.setMoodProfile(normalized) || normalized;
            const after = matrix.getBaseParameters();
            appliedParameters = { ...after };
            if (appliedProfile?.deltas && Object.keys(appliedProfile.deltas).length) {
                deltas = appliedProfile.deltas;
            } else {
                deltas = this.computeParameterDeltas(before, after, normalized.parameters);
            }
        }

        const quickAdjust = { energy: 0, texture: 0, color: 0 };

        const rawResponse = normalized?.metadata?.rawResponse || normalized?.metadata?.raw || null;

        const enrichedProfile = {
            ...normalized,
            parameters: { ...appliedParameters },
            deltas,
            quickAdjust
        };

        this.activeProfile = enrichedProfile;
        this.quickAdjustState = {
            ...quickAdjust,
            baselineParameters: this.extractAdjustableBaseline(appliedParameters),
            baselinePalette: enrichedProfile.palette ? this.cloneForLog(enrichedProfile.palette) : null,
            baselineMoodEnergy: enrichedProfile.mood?.energy ?? enrichedProfile.metrics?.energy ?? 0.5
        };

        this.recordSessionEntry('ai-profile', {
            prompt: enrichedProfile.prompt,
            source: enrichedProfile.source,
            profile: this.cloneForLog(enrichedProfile),
            deltas: this.cloneForLog(deltas),
            parameters: this.cloneForLog(appliedParameters),
            response: this.cloneForLog(rawResponse)
        });

        this.notifyListeners(enrichedProfile);
        return enrichedProfile;
    }

    computeParameterDeltas(before = {}, after = {}, focus = {}) {
        const keys = new Set([
            ...Object.keys(before || {}),
            ...Object.keys(after || {}),
            ...Object.keys(focus || {})
        ]);

        const deltas = {};

        keys.forEach(param => {
            const prevRaw = before ? before[param] : undefined;
            const nextRaw = after ? after[param] : undefined;
            const prev = Number.isFinite(prevRaw) ? prevRaw : undefined;
            const next = Number.isFinite(nextRaw) ? nextRaw : undefined;

            if (prev === undefined && next === undefined) {
                return;
            }

            if (prev !== undefined && next !== undefined) {
                const deltaValue = next - prev;
                if (Math.abs(deltaValue) < 1e-6) {
                    return;
                }
                deltas[param] = { from: prev, to: next, delta: deltaValue };
                return;
            }

            deltas[param] = {
                from: prev,
                to: next,
                delta: next !== undefined ? next : undefined
            };
        });

        return deltas;
    }

    extractAdjustableBaseline(source = null) {
        const matrix = this.choreographer?.sonicMatrix;
        const baseSource = source || matrix?.getBaseParameters?.() || {};
        const baseline = {};

        this.adjustableParameters.forEach(param => {
            if (baseSource[param] !== undefined) {
                baseline[param] = baseSource[param];
                return;
            }
            if (this.activeProfile?.parameters?.[param] !== undefined) {
                baseline[param] = this.activeProfile.parameters[param];
                return;
            }
            if (matrix) {
                const def = matrix.getParameterDefinition(param);
                if (def?.default !== undefined) {
                    baseline[param] = def.default;
                } else if (def?.min !== undefined && def?.max !== undefined) {
                    baseline[param] = (def.min + def.max) / 2;
                } else {
                    baseline[param] = 0;
                }
            } else {
                baseline[param] = 0;
            }
        });

        return baseline;
    }

    applyQuickAdjustments(adjustments = {}, { record = false } = {}) {
        if (!this.choreographer?.sonicMatrix) {
            return this.activeProfile;
        }

        this.quickAdjustState.energy = adjustments.energy ?? this.quickAdjustState.energy ?? 0;
        this.quickAdjustState.texture = adjustments.texture ?? this.quickAdjustState.texture ?? 0;
        this.quickAdjustState.color = adjustments.color ?? this.quickAdjustState.color ?? 0;

        if (!this.quickAdjustState.baselineParameters) {
            this.quickAdjustState.baselineParameters = this.extractAdjustableBaseline();
        }
        if (!this.quickAdjustState.baselinePalette) {
            this.quickAdjustState.baselinePalette = this.activeProfile?.palette
                ? this.cloneForLog(this.activeProfile.palette)
                : null;
        }
        if (this.quickAdjustState.baselineMoodEnergy === undefined || this.quickAdjustState.baselineMoodEnergy === null) {
            this.quickAdjustState.baselineMoodEnergy = this.activeProfile?.mood?.energy
                ?? this.activeProfile?.metrics?.energy
                ?? 0.5;
        }

        const matrix = this.choreographer.sonicMatrix;
        const baseline = this.quickAdjustState.baselineParameters;
        const finalTargets = {};

        const getBaseValue = (param) => {
            if (baseline[param] !== undefined) return baseline[param];
            if (this.activeProfile?.parameters?.[param] !== undefined) return this.activeProfile.parameters[param];
            const def = matrix.getParameterDefinition(param);
            if (def?.default !== undefined) return def.default;
            if (def?.min !== undefined && def?.max !== undefined) return (def.min + def.max) / 2;
            return 0;
        };

        const ensureInitial = (param) => {
            if (finalTargets[param] === undefined) {
                const base = getBaseValue(param);
                if (param === 'hue') {
                    finalTargets[param] = this.wrapHue(base);
                } else {
                    const def = matrix.getParameterDefinition(param);
                    finalTargets[param] = clamp(base, def.min ?? base, def.max ?? base);
                }
            }
        };

        const adjustParam = (param, delta) => {
            ensureInitial(param);
            const def = matrix.getParameterDefinition(param);
            if (param === 'hue') {
                finalTargets[param] = this.wrapHue((finalTargets[param] ?? getBaseValue(param)) + delta);
            } else {
                const base = finalTargets[param] ?? getBaseValue(param);
                const next = base + delta;
                finalTargets[param] = clamp(next, def.min ?? next, def.max ?? next);
            }
        };

        this.adjustableParameters.forEach(ensureInitial);

        const energyFactor = clamp(this.quickAdjustState.energy, -1, 1);
        if (energyFactor !== 0) {
            const speedDef = matrix.getParameterDefinition('speed');
            adjustParam('speed', (speedDef.max - speedDef.min) * 0.18 * energyFactor);
            adjustParam('intensity', 0.35 * energyFactor);
            adjustParam('chaos', 0.5 * energyFactor);
        }

        const textureFactor = clamp(this.quickAdjustState.texture, -1, 1);
        if (textureFactor !== 0) {
            adjustParam('chaos', 0.35 * textureFactor);
            adjustParam('glitchIntensity', 0.12 * textureFactor);
            adjustParam('lineThickness', -0.03 * textureFactor);
        }

        const colorFactor = clamp(this.quickAdjustState.color, -1, 1);
        let hueShift = 0;
        if (colorFactor !== 0) {
            const hueDef = matrix.getParameterDefinition('hue');
            const span = (hueDef.max ?? 360) - (hueDef.min ?? 0);
            hueShift = span * 0.25 * colorFactor;
            adjustParam('hue', hueShift);
            adjustParam('saturation', 0.35 * colorFactor);
        }

        const before = matrix.getBaseParameters();
        const batchResult = matrix.applyParameterBatch(finalTargets, { immediate: true }) || {};
        const after = matrix.getBaseParameters();
        const appliedValues = batchResult.values || finalTargets;
        const deltas = batchResult.deltas && Object.keys(batchResult.deltas).length
            ? batchResult.deltas
            : this.computeParameterDeltas(before, after, appliedValues);

        let updatedPalette = this.quickAdjustState.baselinePalette
            ? this.cloneForLog(this.quickAdjustState.baselinePalette)
            : (this.activeProfile?.palette ? this.cloneForLog(this.activeProfile.palette) : null);

        if (updatedPalette) {
            if (hueShift !== 0) {
                updatedPalette.primaryHue = this.wrapHue((this.quickAdjustState.baselinePalette?.primaryHue
                    ?? updatedPalette.primaryHue
                    ?? after.hue
                    ?? appliedValues.hue
                    ?? finalTargets.hue) + hueShift);
                updatedPalette.accentHue = this.wrapHue((this.quickAdjustState.baselinePalette?.accentHue
                    ?? updatedPalette.accentHue
                    ?? this.wrapHue((updatedPalette.primaryHue ?? after.hue ?? 0) + 120)) + hueShift * 0.6);
            } else {
                updatedPalette.primaryHue = this.wrapHue(this.quickAdjustState.baselinePalette?.primaryHue
                    ?? updatedPalette.primaryHue
                    ?? after.hue
                    ?? finalTargets.hue);
                updatedPalette.accentHue = this.wrapHue(this.quickAdjustState.baselinePalette?.accentHue
                    ?? updatedPalette.accentHue
                    ?? this.wrapHue((updatedPalette.primaryHue ?? after.hue ?? 0) + 120));
            }

            const paletteSatBase = this.quickAdjustState.baselinePalette?.saturation
                ?? updatedPalette.saturation
                ?? after.saturation
                ?? appliedValues.saturation
                ?? finalTargets.saturation
                ?? 0.6;
            updatedPalette.saturation = clamp(paletteSatBase + colorFactor * 0.3, 0, 1);

            const paletteIntBase = this.quickAdjustState.baselinePalette?.intensity
                ?? updatedPalette.intensity
                ?? after.intensity
                ?? appliedValues.intensity
                ?? finalTargets.intensity
                ?? 0.5;
            updatedPalette.intensity = clamp(paletteIntBase + energyFactor * 0.25 - colorFactor * 0.1, 0, 1);
        }

        const moodEnergy = clamp((this.quickAdjustState.baselineMoodEnergy ?? 0.5) + energyFactor * 0.35, 0, 1);

        if (this.activeProfile) {
            this.activeProfile = {
                ...this.activeProfile,
                parameters: { ...after },
                palette: updatedPalette || this.activeProfile.palette,
                mood: this.activeProfile.mood
                    ? { ...this.activeProfile.mood, energy: moodEnergy }
                    : this.activeProfile.mood,
                metrics: this.activeProfile.metrics
                    ? { ...this.activeProfile.metrics, energy: moodEnergy }
                    : this.activeProfile.metrics,
                quickAdjust: {
                    energy: this.quickAdjustState.energy,
                    texture: this.quickAdjustState.texture,
                    color: this.quickAdjustState.color
                },
                deltas
            };
        }

        if (record) {
            this.recordSessionEntry('quick-adjust', {
                adjustments: {
                    energy: this.quickAdjustState.energy,
                    texture: this.quickAdjustState.texture,
                    color: this.quickAdjustState.color
                },
                parameters: this.cloneForLog(appliedValues),
                deltas: this.cloneForLog(deltas),
                profile: this.cloneForLog(this.activeProfile),
                prompt: this.activeProfile?.prompt,
                source: this.activeProfile?.source
            });
        }

        this.notifyListeners(this.activeProfile);
        return this.activeProfile;
    }

    resetQuickAdjustments({ record = false } = {}) {
        if (!this.choreographer?.sonicMatrix) {
            return this.activeProfile;
        }

        if (!this.quickAdjustState.baselineParameters) {
            this.quickAdjustState.baselineParameters = this.extractAdjustableBaseline();
        }

        const matrix = this.choreographer.sonicMatrix;
        const before = matrix.getBaseParameters();
        const batchResult = matrix.applyParameterBatch({ ...this.quickAdjustState.baselineParameters }, { immediate: true }) || {};
        const after = matrix.getBaseParameters();
        const appliedValues = batchResult.values || this.quickAdjustState.baselineParameters;
        const deltas = batchResult.deltas && Object.keys(batchResult.deltas).length
            ? batchResult.deltas
            : this.computeParameterDeltas(before, after, appliedValues);

        this.quickAdjustState.energy = 0;
        this.quickAdjustState.texture = 0;
        this.quickAdjustState.color = 0;

        if (this.activeProfile) {
            const baselineEnergy = this.quickAdjustState.baselineMoodEnergy ?? (this.activeProfile.mood?.energy ?? 0.5);
            this.activeProfile = {
                ...this.activeProfile,
                parameters: { ...after },
                palette: this.quickAdjustState.baselinePalette
                    ? this.cloneForLog(this.quickAdjustState.baselinePalette)
                    : this.activeProfile.palette,
                mood: this.activeProfile.mood
                    ? { ...this.activeProfile.mood, energy: baselineEnergy }
                    : this.activeProfile.mood,
                metrics: this.activeProfile.metrics
                    ? { ...this.activeProfile.metrics, energy: baselineEnergy }
                    : this.activeProfile.metrics,
                quickAdjust: { energy: 0, texture: 0, color: 0 },
                deltas
            };
        }

        if (record) {
            this.recordSessionEntry('quick-adjust-reset', {
                parameters: this.cloneForLog(appliedValues),
                deltas: this.cloneForLog(deltas),
                profile: this.cloneForLog(this.activeProfile),
                prompt: this.activeProfile?.prompt,
                source: this.activeProfile?.source
            });
        }

        this.notifyListeners(this.activeProfile);
        return this.activeProfile;
    }

    recordSessionEntry(type, data = {}) {
        const entry = {
            id: this.generateEntryId(),
            type,
            timestamp: Date.now(),
            ...data
        };

        this.sessionLog.push(entry);
        this.sessionIndex.set(entry.id, entry);

        if (this.sessionLog.length > this.maxLogEntries) {
            const excess = this.sessionLog.length - this.maxLogEntries;
            const removed = this.sessionLog.splice(0, excess);
            removed.forEach(oldEntry => {
                if (oldEntry?.id) {
                    this.sessionIndex.delete(oldEntry.id);
                }
            });
        }

        this.notifyLogListeners(entry);
        return entry;
    }

    getSessionLog() {
        return this.sessionLog.map(entry => ({
            ...entry,
            deltas: entry.deltas ? this.cloneForLog(entry.deltas) : undefined,
            parameters: entry.parameters ? this.cloneForLog(entry.parameters) : undefined,
            adjustments: entry.adjustments ? { ...entry.adjustments } : undefined,
            profile: entry.profile ? this.cloneForLog(entry.profile) : undefined,
            response: entry.response ? this.cloneForLog(entry.response) : undefined
        }));
    }

    getSessionEntry(entryId) {
        if (!entryId) {
            return null;
        }
        if (this.sessionIndex.has(entryId)) {
            return this.sessionIndex.get(entryId);
        }
        return this.sessionLog.find(entry => entry.id === entryId) || null;
    }

    recallSessionEntry(entryId, { record = true } = {}) {
        const entry = this.getSessionEntry(entryId);
        if (!entry || !entry.profile) {
            return this.activeProfile;
        }

        const storedProfile = this.cloneForLog(entry.profile);
        const normalizedProfile = this.normalizeProfile({
            ...storedProfile,
            prompt: storedProfile.prompt || entry.prompt,
            source: storedProfile.source || entry.source,
            timestamp: Date.now()
        });

        const matrix = this.choreographer?.sonicMatrix;
        let appliedProfile = normalizedProfile;

        if (matrix) {
            const before = matrix.getBaseParameters();
            const applied = matrix.setMoodProfile(normalizedProfile) || normalizedProfile;
            const after = matrix.getBaseParameters();
            const deltas = applied.deltas && Object.keys(applied.deltas).length
                ? applied.deltas
                : this.computeParameterDeltas(before, after, normalizedProfile.parameters);

            appliedProfile = {
                ...normalizedProfile,
                ...applied,
                parameters: { ...after },
                deltas,
                quickAdjust: { energy: 0, texture: 0, color: 0 }
            };
        } else {
            appliedProfile = {
                ...normalizedProfile,
                parameters: normalizedProfile.parameters ? { ...normalizedProfile.parameters } : {},
                deltas: normalizedProfile.deltas || {},
                quickAdjust: { energy: 0, texture: 0, color: 0 }
            };
        }

        this.activeProfile = appliedProfile;
        this.quickAdjustState = {
            energy: 0,
            texture: 0,
            color: 0,
            baselineParameters: this.extractAdjustableBaseline(appliedProfile.parameters),
            baselinePalette: appliedProfile.palette ? this.cloneForLog(appliedProfile.palette) : null,
            baselineMoodEnergy: appliedProfile.mood?.energy
                ?? appliedProfile.metrics?.energy
                ?? 0.5
        };

        if (record) {
            this.recordSessionEntry('mood-recall', {
                referenceId: entryId,
                prompt: appliedProfile.prompt,
                source: appliedProfile.source,
                profile: this.cloneForLog(appliedProfile),
                parameters: this.cloneForLog(appliedProfile.parameters),
                deltas: this.cloneForLog(appliedProfile.deltas)
            });
        }

        this.notifyListeners(this.activeProfile);
        return this.activeProfile;
    }

    exportSessionLog(filenamePrefix = 'vib34d-mood-log') {
        if (typeof document === 'undefined') {
            return this.getSessionLog();
        }

        const data = JSON.stringify(this.getSessionLog(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:]/g, '-');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filenamePrefix}-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 0);
        return url;
    }

    generateEntryId() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `mood-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
    }

    cloneForLog(data) {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof structuredClone === 'function') {
            try {
                return structuredClone(data);
            } catch (error) {
                // Fallback to JSON
            }
        }
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            if (Array.isArray(data)) {
                return data.slice();
            }
            if (typeof data === 'object') {
                return { ...data };
            }
        }
        return data;
    }

    wrapHue(value) {
        if (!Number.isFinite(value)) {
            return value;
        }
        const wrapped = value % 360;
        return wrapped < 0 ? wrapped + 360 : wrapped;
    }

    async generateFromPrompt(description) {
        const profile = await this.llmInterface.generateParameters(description);
        return this.applyProfile(profile);
    }

    getActiveProfile() {
        return this.activeProfile;
    }
}
