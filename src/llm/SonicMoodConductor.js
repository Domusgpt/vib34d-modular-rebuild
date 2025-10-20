import { LLMParameterInterface } from './LLMParameterInterface.js';
import { LLMParameterUI } from './LLMParameterUI.js';
import { SonicMoodStoryboard } from './SonicMoodStoryboard.js';
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
        this.storyboardListeners = new Set();
        this.collaborationListeners = new Set();
        this.feedbackListeners = new Set();
        this.sessionLog = [];
        this.sessionIndex = new Map();
        this.maxLogEntries = options.maxLogEntries || 50;
        this.activeProfile = null;
        this.storyboard = new SonicMoodStoryboard();
        this.quickAdjustState = {
            energy: 0,
            texture: 0,
            color: 0,
            baselineParameters: null,
            baselinePalette: null,
            baselineMoodEnergy: 0.5
        };
        this.responsivePresets = new Map();
        this.liveContext = {
            bpm: 0,
            spectralBalance: { bass: 0.33, mid: 0.34, high: 0.33, signature: 'flat' },
            genre: 'ambient',
            energy: 0
        };
        this.latestFrameInfo = null;
        this.latestManualBlend = {};
        this.coCreativeTemplates = this.buildCoCreativeTemplates();
        this.pendingSuggestions = new Map();
        this.collaborationSessions = new Map();
        this.feedbackStats = {
            totalRatings: 0,
            averageRating: 0,
            motionBias: 0.5,
            colorBias: 0.5,
            lastNotes: ''
        };
        this.feedbackByEntry = new Map();
        this.feedbackByProfile = new Map();
        this.feedbackKeywordTotals = new Map();
        this.adaptiveWeights = {
            global: 1,
            motion: 1,
            color: 1,
            texture: 1
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

    buildCoCreativeTemplates() {
        return [
            {
                id: 'intensify',
                label: 'Intensify Pulse',
                description: 'Lift the energy with brighter motion, deeper bass geometry, and sharper contrasts.',
                operations: [
                    { param: 'speed', type: 'scale', factor: 1.22 },
                    { param: 'intensity', type: 'add', amount: 0.14 },
                    { param: 'chaos', type: 'add', amount: 0.12 },
                    { param: 'gridDensity', type: 'scale', factor: 0.94 }
                ],
                palette: [
                    { field: 'saturation', type: 'add', amount: 0.12 },
                    { field: 'intensity', type: 'add', amount: 0.1 },
                    { field: 'accentHue', type: 'shift', amount: 18 }
                ],
                reactivityMultipliers: { global: 1.08, motion: 1.16, texture: 1.1 },
                moodEnergyDelta: 0.16,
                keywords: ['intense', 'lift', 'climax']
            },
            {
                id: 'cool-drift',
                label: 'Cool Drift',
                description: 'Float the scene into chilled territory with cooler hues and slower oscillations.',
                operations: [
                    { param: 'speed', type: 'scale', factor: 0.78 },
                    { param: 'chaos', type: 'scale', factor: 0.68 },
                    { param: 'morphFactor', type: 'add', amount: 0.4 }
                ],
                palette: [
                    { field: 'primaryHue', type: 'shift', amount: -60 },
                    { field: 'accentHue', type: 'shift', amount: -32 },
                    { field: 'saturation', type: 'scale', factor: 0.88 },
                    { field: 'intensity', type: 'scale', factor: 0.92 }
                ],
                reactivityMultipliers: { global: 0.94, motion: 0.84, color: 1.06 },
                moodEnergyDelta: -0.18,
                keywords: ['cool', 'chill', 'drift']
            },
            {
                id: 'prism-wash',
                label: 'Prismatic Bloom',
                description: 'Expand the palette with shimmering color bloom and gentle geometry expansion.',
                operations: [
                    { param: 'gridDensity', type: 'scale', factor: 1.18 },
                    { param: 'morphFactor', type: 'add', amount: 0.55 },
                    { param: 'lineThickness', type: 'scale', factor: 0.82 }
                ],
                palette: [
                    { field: 'primaryHue', type: 'shift', amount: 36 },
                    { field: 'accentHue', type: 'shift', amount: 54 },
                    { field: 'saturation', type: 'add', amount: 0.08 },
                    { field: 'narrative', type: 'setText', value: 'Prismatic bloom with layered holograms' }
                ],
                reactivityMultipliers: { color: 1.14, texture: 1.08 },
                moodEnergyDelta: 0.04,
                keywords: ['prismatic', 'bloom', 'color']
            },
            {
                id: 'aerial-glide',
                label: 'Aerial Glide',
                description: 'Open the stage with wide aerial sweeps, lighter rotation, and airy motion arcs.',
                operations: [
                    { param: 'rot4dXW', type: 'add', amount: 0.9 },
                    { param: 'rot4dYW', type: 'add', amount: -0.7 },
                    { param: 'speed', type: 'scale', factor: 1.05 },
                    { param: 'moireScale', type: 'add', amount: -0.01 }
                ],
                palette: [
                    { field: 'intensity', type: 'scale', factor: 0.9 },
                    { field: 'saturation', type: 'scale', factor: 0.95 },
                    { field: 'narrative', type: 'setText', value: 'Weightless aerial glide with glass reflections' }
                ],
                reactivityMultipliers: { motion: 1.08, global: 1.02 },
                moodEnergyDelta: 0.06,
                keywords: ['aerial', 'wide', 'glide']
            }
        ];
    }

    getCoCreativeTemplates() {
        return this.coCreativeTemplates.map(template => ({ ...template }));
    }

    resolveSuggestionTemplate(templateId, cueText = '') {
        if (templateId) {
            const found = this.coCreativeTemplates.find(template => template.id === templateId);
            if (found) {
                return found;
            }
        }
        if (cueText && cueText.trim()) {
            return this.buildCustomTemplate(cueText);
        }
        return this.coCreativeTemplates[0] || null;
    }

    buildCustomTemplate(cueText) {
        const cue = (cueText || '').toLowerCase();
        const template = {
            id: `custom-${Date.now().toString(36)}`,
            label: `Cue · ${cueText}`,
            description: `Interpret “${cueText}” as a nuanced sonic nudge.`,
            operations: [],
            palette: [],
            reactivityMultipliers: {},
            moodEnergyDelta: 0,
            keywords: cueText
                .split(/[,\s]+/)
                .map(part => part.trim())
                .filter(Boolean)
        };

        const pushOperation = (operation) => {
            template.operations.push(operation);
        };

        const pushPalette = (operation) => {
            template.palette.push(operation);
        };

        if (cue.includes('warm') || cue.includes('sun') || cue.includes('fire')) {
            pushPalette({ field: 'primaryHue', type: 'shift', amount: -36 });
            pushPalette({ field: 'accentHue', type: 'shift', amount: -24 });
            pushPalette({ field: 'saturation', type: 'add', amount: 0.09 });
            template.moodEnergyDelta += 0.08;
        }

        if (cue.includes('cool') || cue.includes('blue') || cue.includes('ice')) {
            pushPalette({ field: 'primaryHue', type: 'shift', amount: 54 });
            pushPalette({ field: 'saturation', type: 'scale', factor: 0.92 });
            template.reactivityMultipliers.color = 1.04;
        }

        if (cue.includes('calm') || cue.includes('slow') || cue.includes('ambient')) {
            pushOperation({ param: 'speed', type: 'scale', factor: 0.75 });
            pushOperation({ param: 'chaos', type: 'scale', factor: 0.7 });
            template.moodEnergyDelta -= 0.12;
            template.reactivityMultipliers.motion = 0.86;
        }

        if (cue.includes('fast') || cue.includes('hype') || cue.includes('drive')) {
            pushOperation({ param: 'speed', type: 'scale', factor: 1.25 });
            pushOperation({ param: 'chaos', type: 'add', amount: 0.15 });
            template.moodEnergyDelta += 0.16;
            template.reactivityMultipliers.motion = 1.12;
        }

        if (cue.includes('wide') || cue.includes('open') || cue.includes('space')) {
            pushOperation({ param: 'morphFactor', type: 'add', amount: 0.6 });
            pushOperation({ param: 'gridDensity', type: 'scale', factor: 1.15 });
            pushPalette({ field: 'intensity', type: 'scale', factor: 0.95 });
        }

        if (cue.includes('dark') || cue.includes('noir') || cue.includes('shadow')) {
            pushPalette({ field: 'intensity', type: 'scale', factor: 0.82 });
            pushPalette({ field: 'saturation', type: 'scale', factor: 0.88 });
            template.reactivityMultipliers.texture = 1.08;
        }

        if (cue.includes('glitch') || cue.includes('fracture')) {
            pushOperation({ param: 'glitchIntensity', type: 'add', amount: 0.06 });
            pushOperation({ param: 'chaos', type: 'add', amount: 0.1 });
            template.reactivityMultipliers.texture = 1.12;
        }

        if (cue.includes('sparkle') || cue.includes('shine') || cue.includes('shine')) {
            pushPalette({ field: 'accentHue', type: 'shift', amount: 42 });
            pushPalette({ field: 'intensity', type: 'add', amount: 0.08 });
        }

        if (template.operations.length === 0) {
            pushOperation({ param: 'intensity', type: 'add', amount: 0.08 });
            pushOperation({ param: 'chaos', type: 'add', amount: 0.05 });
        }

        if (template.palette.length === 0) {
            pushPalette({ field: 'saturation', type: 'add', amount: 0.05 });
        }

        if (!template.reactivityMultipliers.global) {
            template.reactivityMultipliers.global = 1.02;
        }

        return template;
    }

    composeSuggestionPrompt(baseProfile, template, cueText) {
        if (!baseProfile) {
            return '';
        }

        const label = baseProfile.mood?.label || 'Custom Sculpt';
        const description = baseProfile.mood?.description || baseProfile.prompt || 'Abstract holographic mood';
        const keywords = (baseProfile.mood?.keywords || baseProfile.keywords || []).slice(0, 6);
        const cue = cueText && cueText.trim() ? cueText.trim() : template?.description || 'Refine the existing mood slightly.';

        const lines = [
            `You are refining the existing sonic mood "${label}" described as: ${description}.`,
            'Preserve the identity of this mood and provide only incremental adjustments.',
            `Apply the following performer cue: ${cue}.`,
            'Return updated parameters as JSON while keeping changes subtle and performance-ready.'
        ];

        if (keywords.length) {
            lines.splice(1, 0, `Core mood keywords: ${keywords.join(', ')}.`);
        }

        return lines.join(' ');
    }

    async requestCoCreativeSuggestion(templateId, options = {}) {
        const cueText = (options.customText || '').trim();
        const template = this.resolveSuggestionTemplate(templateId, cueText);
        if (!template) {
            throw new Error('No co-creative template available');
        }

        const intensity = clamp(options.intensity ?? 1, 0.25, 1.75);
        const baseProfile = this.activeProfile
            ? this.cloneForLog(this.activeProfile)
            : this.normalizeProfile({
                prompt: 'Current stage state',
                source: 'live-state',
                parameters: this.choreographer?.sonicMatrix?.getBaseParameters?.() || {},
                mood: {
                    label: 'Current Stage',
                    description: 'Live sculpted mix',
                    energy: this.liveContext?.energy ?? 0.5,
                    colorTemperature: this.liveContext?.spectralSignature || 'ambient'
                }
            });

        let llmProfile = null;
        const context = this.buildLLMContext();
        if (this.llmInterface?.previewParameters) {
            try {
                const prompt = this.composeSuggestionPrompt(baseProfile, template, cueText);
                if (prompt) {
                    llmProfile = await this.llmInterface.previewParameters(prompt, context);
                }
            } catch (error) {
                console.warn('LLM suggestion preview failed, using heuristic blend:', error.message);
            }
        }

        const suggestion = this.composeSuggestionFromTemplate(template, {
            baseProfile,
            llmProfile,
            intensity,
            cueText
        });

        this.pendingSuggestions.set(suggestion.id, suggestion);

        this.recordSessionEntry('co-creative-suggestion', {
            suggestionId: suggestion.id,
            cueId: template.id,
            cueText,
            summary: suggestion.summary,
            parameters: this.cloneForLog(suggestion.parameters),
            palette: suggestion.palette ? this.cloneForLog(suggestion.palette) : undefined,
            reactivity: suggestion.reactivity ? this.cloneForLog(suggestion.reactivity) : undefined,
            referenceProfileId: suggestion.referenceProfileId
        });

        return suggestion;
    }

    composeSuggestionFromTemplate(template, { baseProfile, llmProfile, intensity = 1, cueText = '' } = {}) {
        const matrix = this.choreographer?.sonicMatrix;
        const baseParameters = baseProfile?.parameters || matrix?.getBaseParameters?.() || {};
        const parameters = { ...baseParameters };

        (template.operations || []).forEach(operation => {
            const param = operation.param;
            if (!param) return;
            const def = matrix?.getParameterDefinition?.(param) || { min: 0, max: 1, default: 0.5 };
            const baseValue = baseParameters[param];
            const next = this.applyParameterOperation(baseValue, def, operation, intensity);
            if (Number.isFinite(next)) {
                parameters[param] = next;
            }
        });

        if (llmProfile?.parameters) {
            Object.entries(llmProfile.parameters).forEach(([param, value]) => {
                const def = matrix?.getParameterDefinition?.(param) || null;
                if (!Number.isFinite(value)) return;
                const baseValue = Number.isFinite(parameters[param])
                    ? parameters[param]
                    : Number.isFinite(baseParameters[param])
                        ? baseParameters[param]
                        : value;
                const mix = 0.35 * intensity;
                const blended = baseValue + (value - baseValue) * mix;
                const clamped = def ? clamp(blended, def.min, def.max) : blended;
                parameters[param] = Number.isFinite(clamped) ? Number(clamped.toFixed(4)) : clamped;
            });
        }

        const basePalette = baseProfile?.palette ? { ...baseProfile.palette } : null;
        const palette = this.applyPaletteOperations(basePalette, template.palette || [], intensity, llmProfile?.palette || null);

        const baseReactivity = baseProfile?.reactivity || baseProfile?.metadata?.reactivity || { global: 1 };
        const reactivity = this.mergeReactivity(baseReactivity, template.reactivityMultipliers, intensity, llmProfile?.reactivity || null);

        const moodEnergy = this.computeMoodEnergyTarget(baseProfile, template, intensity, llmProfile);

        const suggestion = {
            id: `suggest-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`,
            cueId: template.id,
            cueText,
            label: template.label,
            description: template.description,
            parameters,
            palette,
            reactivity,
            moodEnergy,
            referenceProfileId: baseProfile?.id || null,
            source: llmProfile ? 'llm-nudge' : 'template-nudge',
            keywords: template.keywords || []
        };

        suggestion.summary = this.summarizeSuggestion(suggestion, baseProfile);
        return suggestion;
    }

    applyParameterOperation(baseValue, def, operation, intensity = 1) {
        const base = Number.isFinite(baseValue) ? baseValue : def?.default ?? 0;
        const scaledIntensity = clamp(intensity, 0.25, 2);
        let next = base;

        switch (operation.type) {
            case 'scale': {
                const factor = Number.isFinite(operation.factor) ? operation.factor : 1;
                const scaled = base * factor;
                next = base + (scaled - base) * scaledIntensity;
                break;
            }
            case 'set': {
                const target = Number.isFinite(operation.value) ? operation.value : base;
                next = base + (target - base) * scaledIntensity;
                break;
            }
            case 'add':
            default: {
                const amount = Number(operation.amount) || 0;
                next = base + amount * scaledIntensity;
                break;
            }
        }

        const min = def?.min ?? Number.NEGATIVE_INFINITY;
        const max = def?.max ?? Number.POSITIVE_INFINITY;
        let clamped = clamp(next, min, max);
        if (operation.wrap || (operation.param && operation.param.toLowerCase().includes('hue'))) {
            clamped = this.wrapHue(clamped);
        }

        return Number.isFinite(clamped) ? Number(clamped.toFixed(4)) : clamped;
    }

    applyPaletteOperations(basePalette = null, operations = [], intensity = 1, llmPalette = null) {
        const palette = basePalette ? { ...basePalette } : {
            primaryHue: 200,
            accentHue: 340,
            saturation: 0.7,
            intensity: 0.6,
            narrative: 'Glass aurora wash'
        };

        const scaledIntensity = clamp(intensity, 0.25, 2);

        operations.forEach(operation => {
            const field = operation.field;
            if (!field) return;
            const key = field;
            const isHue = key.toLowerCase().includes('hue');
            const base = Number.isFinite(palette[key]) ? palette[key] : isHue ? 0 : 0.5;
            let next = base;

            switch (operation.type) {
                case 'scale': {
                    const factor = Number.isFinite(operation.factor) ? operation.factor : 1;
                    const scaled = base * factor;
                    next = base + (scaled - base) * scaledIntensity;
                    break;
                }
                case 'setText': {
                    palette[key] = operation.value || palette[key];
                    return;
                }
                case 'set': {
                    const target = Number.isFinite(operation.value) ? operation.value : base;
                    next = base + (target - base) * scaledIntensity;
                    break;
                }
                case 'shift': {
                    const amount = Number(operation.amount) || 0;
                    next = base + amount * scaledIntensity;
                    break;
                }
                case 'add':
                default: {
                    const amount = Number(operation.amount) || 0;
                    next = base + amount * scaledIntensity;
                }
            }

            if (isHue) {
                palette[key] = this.wrapHue(next);
            } else {
                palette[key] = clamp(next, 0, 1);
            }
        });

        if (llmPalette) {
            ['primaryHue', 'accentHue', 'saturation', 'intensity'].forEach(key => {
                if (llmPalette[key] === undefined) return;
                const base = Number.isFinite(palette[key]) ? palette[key] : (key.toLowerCase().includes('hue') ? 0 : 0.5);
                const target = llmPalette[key];
                if (!Number.isFinite(target)) return;
                const mix = 0.35 * scaledIntensity;
                const blended = base + (target - base) * mix;
                if (key.toLowerCase().includes('hue')) {
                    palette[key] = this.wrapHue(blended);
                } else {
                    palette[key] = clamp(blended, 0, 1);
                }
            });
            if (llmPalette.narrative) {
                palette.narrative = llmPalette.narrative;
            }
        }

        return palette;
    }

    mergeReactivity(baseReactivity = {}, multipliers = {}, intensity = 1, llmReactivity = null) {
        const result = { ...baseReactivity };
        if (result.global === undefined) {
            result.global = 1;
        }

        Object.entries(multipliers || {}).forEach(([key, multiplier]) => {
            if (!Number.isFinite(multiplier)) return;
            const base = Number.isFinite(result[key]) ? result[key] : (key === 'global' ? result.global : result.global ?? 1);
            const mix = 0.55 * clamp(intensity, 0.25, 2);
            const blended = base + (base * multiplier - base) * mix;
            result[key] = clamp(blended, 0, 2);
        });

        if (llmReactivity) {
            Object.entries(llmReactivity).forEach(([key, value]) => {
                if (!Number.isFinite(value)) return;
                const base = Number.isFinite(result[key]) ? result[key] : (result.global ?? 1);
                const blended = base + (value - base) * 0.35 * intensity;
                result[key] = clamp(blended, 0, 2);
            });
        }

        return result;
    }

    applyAdaptiveWeights(profile = {}) {
        if (!profile) {
            return profile;
        }

        const weights = this.adaptiveWeights || {};
        const reactivity = { ...(profile.reactivity || {}) };
        const baseGlobal = reactivity.global ?? 1;
        const weightedGlobal = weights.global ? clamp(baseGlobal * weights.global, 0, 2) : baseGlobal;
        reactivity.global = weightedGlobal;

        ['motion', 'color', 'texture'].forEach(group => {
            if (weights[group]) {
                const base = reactivity[group] ?? weightedGlobal;
                reactivity[group] = clamp(base * weights[group], 0, 2);
            }
        });

        return {
            ...profile,
            reactivity
        };
    }

    computeMoodEnergyTarget(baseProfile, template, intensity = 1, llmProfile = null) {
        const baseEnergy = Number.isFinite(baseProfile?.mood?.energy)
            ? baseProfile.mood.energy
            : this.liveContext?.energy ?? 0.5;
        const templateDelta = Number.isFinite(template?.moodEnergyDelta) ? template.moodEnergyDelta : 0;
        const llmEnergy = Number.isFinite(llmProfile?.mood?.energy) ? llmProfile.mood.energy : null;
        let energy = baseEnergy + templateDelta * clamp(intensity, 0.25, 2);
        if (llmEnergy !== null) {
            energy = energy + (llmEnergy - energy) * 0.35 * intensity;
        }
        return clamp(energy, 0, 1);
    }

    summarizeSuggestion(suggestion, baseProfile) {
        const baseParameters = baseProfile?.parameters || {};
        const diffs = Object.entries(suggestion.parameters || {}).map(([param, value]) => {
            const previous = baseParameters[param];
            if (!Number.isFinite(value)) {
                return null;
            }
            const delta = Number.isFinite(previous) ? value - previous : value;
            return { param, delta, value };
        }).filter(Boolean);

        diffs.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        const top = diffs.slice(0, 3).map(info => {
            const sign = info.delta > 0 ? '+' : '';
            return `${info.param} ${sign}${info.delta.toFixed(2)}`;
        });

        const energy = Number.isFinite(suggestion.moodEnergy)
            ? `energy ${Math.round(suggestion.moodEnergy * 100)}%`
            : null;

        return [suggestion.label, top.join(', '), energy].filter(Boolean).join(' • ');
    }

    async applyCoCreativeSuggestion(suggestionOrId, { record = true } = {}) {
        if (!suggestionOrId) {
            return this.activeProfile;
        }

        const suggestion = typeof suggestionOrId === 'string'
            ? this.pendingSuggestions.get(suggestionOrId)
            : suggestionOrId;

        if (!suggestion) {
            return this.activeProfile;
        }

        const matrix = this.choreographer?.sonicMatrix;
        const before = matrix?.getBaseParameters?.() || (this.activeProfile?.parameters ? { ...this.activeProfile.parameters } : {});

        const baseProfile = this.activeProfile
            ? this.cloneForLog(this.activeProfile)
            : this.normalizeProfile({
                prompt: suggestion.cueText || suggestion.description,
                source: 'co-creative',
                parameters: before
            });

        const mergedProfile = {
            ...baseProfile,
            id: baseProfile.id || suggestion.referenceProfileId || `nudge-${suggestion.id}`,
            source: 'co-creative-nudge',
            prompt: suggestion.cueText || suggestion.description || baseProfile.prompt,
            parameters: { ...baseProfile.parameters, ...suggestion.parameters },
            palette: suggestion.palette ? { ...baseProfile.palette, ...suggestion.palette } : baseProfile.palette,
            reactivity: this.mergeReactivity(baseProfile.reactivity || { global: 1 }, suggestion.reactivity || {}, 1),
            mood: baseProfile.mood ? { ...baseProfile.mood } : null,
            metadata: {
                ...(baseProfile.metadata || {}),
                suggestionId: suggestion.id,
                suggestionCue: suggestion.cueText || suggestion.description,
                suggestionSource: suggestion.source
            }
        };

        if (mergedProfile.mood) {
            mergedProfile.mood.energy = suggestion.moodEnergy ?? mergedProfile.mood.energy;
        }

        let appliedProfile = mergedProfile;
        let after = { ...mergedProfile.parameters };
        let deltas = {};

        if (matrix) {
            const weighted = this.applyAdaptiveWeights(mergedProfile);
            const applied = matrix.setMoodProfile(weighted) || weighted;
            after = matrix.getBaseParameters();
            deltas = applied.deltas && Object.keys(applied.deltas).length
                ? applied.deltas
                : this.computeParameterDeltas(before, after, mergedProfile.parameters);
            appliedProfile = {
                ...mergedProfile,
                ...applied,
                parameters: { ...after },
                deltas,
                reactivity: applied.reactivity || weighted.reactivity
            };
        } else {
            deltas = this.computeParameterDeltas(before, after, mergedProfile.parameters);
            appliedProfile = {
                ...mergedProfile,
                parameters: after,
                deltas
            };
        }

        if (!appliedProfile.quickAdjust) {
            appliedProfile.quickAdjust = this.activeProfile?.quickAdjust || { energy: 0, texture: 0, color: 0 };
        }

        this.activeProfile = appliedProfile;
        this.quickAdjustState.baselineParameters = this.extractAdjustableBaseline(appliedProfile.parameters);
        if (appliedProfile.palette) {
            this.quickAdjustState.baselinePalette = this.cloneForLog(appliedProfile.palette);
        }
        this.quickAdjustState.baselineMoodEnergy = appliedProfile.mood?.energy ?? this.quickAdjustState.baselineMoodEnergy;

        const preset = this.trainResponsivePreset(this.activeProfile, before, after);
        if (preset) {
            this.activeProfile.responsivePreset = preset;
        }
        const storyboardEntry = this.ensureStoryboardEntry(this.activeProfile, {
            envelopes: preset?.envelopes,
            manualInfluence: preset?.manualInfluence
        });
        if (storyboardEntry) {
            this.activeProfile.storyboardEntryId = storyboardEntry.id;
        }

        if (record) {
            this.recordSessionEntry('co-creative-apply', {
                suggestionId: suggestion.id,
                cueId: suggestion.cueId,
                cueText: suggestion.cueText,
                summary: suggestion.summary,
                profile: this.cloneForLog(this.activeProfile),
                parameters: this.cloneForLog(this.activeProfile.parameters),
                deltas: this.cloneForLog(deltas),
                storyboardEntryId: storyboardEntry?.id
            });
        }

        this.pendingSuggestions.delete(suggestion.id);
        this.notifyListeners(this.activeProfile);
        return this.activeProfile;
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

    getCollaborations() {
        return Array.from(this.collaborationSessions.values()).map(session => ({
            ...session,
            entries: session.entries.map(entry => ({
                ...entry,
                profile: entry.profile ? this.cloneForLog(entry.profile) : null
            }))
        }));
    }

    onCollaborationUpdate(listener) {
        if (typeof listener === 'function') {
            this.collaborationListeners.add(listener);
        }
    }

    offCollaborationUpdate(listener) {
        if (listener && this.collaborationListeners.has(listener)) {
            this.collaborationListeners.delete(listener);
        }
    }

    notifyCollaborationListeners(snapshot = null) {
        const data = snapshot || this.getCollaborations();
        this.collaborationListeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('SonicMoodConductor collaboration listener error:', error);
            }
        });
    }

    ensureCollaborationSession(collaboratorId, name, color) {
        const id = collaboratorId || `collab-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}`;
        if (!this.collaborationSessions.has(id)) {
            this.collaborationSessions.set(id, {
                id,
                name: name || 'Remote Artist',
                color: color || this.pickCollaborationColor(this.collaborationSessions.size),
                entries: [],
                lastUpdated: 0,
                latestPrompt: '',
                averageRating: null
            });
        }
        return this.collaborationSessions.get(id);
    }

    pickCollaborationColor(index = 0) {
        const palette = ['#76f7ff', '#ff7de9', '#ffd26f', '#8cff8a', '#c89bff'];
        return palette[index % palette.length];
    }

    registerCollaboratorContribution(contribution = {}) {
        if (Array.isArray(contribution)) {
            return contribution.map(item => this.registerCollaboratorContribution(item));
        }

        const collaboratorId = contribution.collaboratorId || contribution.id || null;
        const collaboratorName = contribution.collaboratorName || contribution.name || 'Remote Artist';
        const session = this.ensureCollaborationSession(collaboratorId, collaboratorName, contribution.color);

        const profileSource = `collab:${session.id}`;
        const profile = contribution.profile
            ? this.normalizeProfile({ ...contribution.profile, source: contribution.profile.source || profileSource })
            : this.normalizeProfile({
                id: contribution.profileId,
                prompt: contribution.prompt || contribution.description || 'Remote mood contribution',
                source: profileSource,
                parameters: contribution.parameters || {},
                palette: contribution.palette,
                reactivity: contribution.reactivity,
                mood: contribution.mood
            });

        const entry = {
            id: contribution.entryId || contribution.logId || this.generateEntryId(),
            collaboratorId: session.id,
            collaboratorName: session.name,
            profileId: profile.id,
            prompt: contribution.prompt || profile.prompt,
            notes: contribution.notes || '',
            profile: this.cloneForLog(profile),
            timestamp: Number.isFinite(contribution.timestamp) ? contribution.timestamp : Date.now(),
            revision: Number.isFinite(contribution.revision) ? contribution.revision : session.entries.length + 1
        };

        if (Number.isFinite(contribution.lastAppliedAt)) {
            entry.lastAppliedAt = contribution.lastAppliedAt;
        }

        session.entries.push(entry);
        session.lastUpdated = entry.timestamp;
        session.latestPrompt = entry.prompt;

        this.recordSessionEntry('collaboration-received', {
            collaborationId: session.id,
            collaborator: session.name,
            revision: entry.revision,
            prompt: entry.prompt,
            notes: entry.notes,
            profile: this.cloneForLog(profile)
        });

        this.notifyCollaborationListeners();
        return entry;
    }

    ingestCollaborationsSnapshot(snapshot = []) {
        if (!Array.isArray(snapshot)) {
            return this.getCollaborations();
        }

        this.collaborationSessions.clear();

        snapshot.forEach(sessionData => {
            if (!sessionData || typeof sessionData !== 'object') {
                return;
            }

            const session = this.ensureCollaborationSession(sessionData.id, sessionData.name, sessionData.color);
            session.entries = [];
            session.averageRating = Number.isFinite(sessionData.averageRating) ? sessionData.averageRating : null;
            session.lastAppliedEntryId = sessionData.lastAppliedEntryId || null;
            session.lastAppliedProfileId = sessionData.lastAppliedProfileId || null;

            const entries = Array.isArray(sessionData.entries) ? sessionData.entries : [];

            entries.forEach(entryData => {
                if (!entryData || typeof entryData !== 'object') {
                    return;
                }

                let profile = null;
                if (entryData.profile && typeof entryData.profile === 'object') {
                    profile = this.normalizeProfile({
                        ...entryData.profile,
                        source: entryData.profile.source || `collab:${session.id}`
                    });
                } else if (entryData.parameters || entryData.palette || entryData.mood) {
                    profile = this.normalizeProfile({
                        id: entryData.profileId,
                        prompt: entryData.prompt || sessionData.name || 'Remote mood contribution',
                        source: `collab:${session.id}`,
                        parameters: entryData.parameters || {},
                        palette: entryData.palette,
                        reactivity: entryData.reactivity,
                        mood: entryData.mood,
                        metadata: entryData.metadata
                    });
                }

                if (!profile) {
                    return;
                }

                const entry = {
                    id: entryData.id || this.generateEntryId(),
                    collaboratorId: session.id,
                    collaboratorName: session.name,
                    profileId: profile.id,
                    prompt: entryData.prompt || profile.prompt,
                    notes: entryData.notes || '',
                    profile: this.cloneForLog(profile),
                    timestamp: Number.isFinite(entryData.timestamp) ? entryData.timestamp : Date.now(),
                    revision: Number.isFinite(entryData.revision) ? entryData.revision : session.entries.length + 1
                };

                if (Number.isFinite(entryData.lastAppliedAt)) {
                    entry.lastAppliedAt = entryData.lastAppliedAt;
                }

                session.entries.push(entry);
            });

            session.entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            session.entries.forEach((entry, index) => {
                entry.revision = index + 1;
            });
            session.lastUpdated = session.entries.length ? session.entries[session.entries.length - 1].timestamp : 0;
            session.latestPrompt = session.entries.length ? session.entries[session.entries.length - 1].prompt : '';
        });

        this.notifyCollaborationListeners();
        return this.getCollaborations();
    }

    findCollaborationEntry(collaborationId, entryId) {
        const session = this.collaborationSessions.get(collaborationId);
        if (!session) {
            return null;
        }
        return session.entries.find(entry => entry.id === entryId) || null;
    }

    getCollaborationEntry(collaborationId, entryId) {
        const entry = this.findCollaborationEntry(collaborationId, entryId);
        if (!entry) {
            return null;
        }
        return {
            ...entry,
            profile: entry.profile ? this.cloneForLog(entry.profile) : null
        };
    }

    applyCollaboratorEntry(collaborationId, entryId, { record = true } = {}) {
        const entry = this.findCollaborationEntry(collaborationId, entryId);
        if (!entry || !entry.profile) {
            return this.activeProfile;
        }

        const session = this.collaborationSessions.get(collaborationId);
        const profile = { ...entry.profile, source: `collab:${collaborationId}` };
        const applied = this.applyProfile(profile, {
            logType: 'collaboration-apply',
            logExtras: {
                collaborationId,
                collaborator: session?.name,
                revision: entry.revision
            }
        });

        entry.lastAppliedAt = Date.now();
        if (session) {
            session.lastAppliedEntryId = entry.id;
            session.lastAppliedProfileId = applied?.id;
        }

        if (record) {
            this.recordSessionEntry('collaboration-apply-meta', {
                collaborationId,
                collaborator: session?.name,
                revision: entry.revision,
                profile: this.cloneForLog(applied)
            });
        }

        this.notifyCollaborationListeners();
        return applied;
    }

    summarizeCollaborations(limit = 4) {
        const sessions = Array.from(this.collaborationSessions.values());
        sessions.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        return sessions.slice(0, limit).map(session => ({
            id: session.id,
            name: session.name,
            revisions: session.entries.length,
            lastUpdated: session.lastUpdated,
            latestPrompt: session.latestPrompt,
            averageRating: session.averageRating
        }));
    }

    updateCollaborationFeedback(profileId) {
        if (!profileId) {
            return;
        }
        const ratings = this.feedbackByProfile.get(profileId);
        if (!ratings || !ratings.length) {
            return;
        }
        const average = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
        this.collaborationSessions.forEach(session => {
            const linked = session.entries.some(entry => entry.profileId === profileId);
            if (linked) {
                session.averageRating = average;
            }
        });
    }

    recordMoodFeedback(feedback = {}) {
        const rating = clamp(Number(feedback.rating ?? feedback.score ?? 0.5), 0, 1);
        const motion = clamp(Number(feedback.motionBias ?? feedback.motion ?? 0.5), 0, 1);
        const color = clamp(Number(feedback.colorBias ?? feedback.color ?? 0.5), 0, 1);
        const notes = feedback.notes ? String(feedback.notes).trim() : '';
        const profileId = feedback.profileId || this.activeProfile?.id || null;
        const entryId = feedback.entryId || null;
        const keywords = Array.isArray(feedback.keywords) ? feedback.keywords : [];

        const entry = this.recordSessionEntry('feedback', {
            rating,
            motionBias: motion,
            colorBias: color,
            notes,
            profileId,
            entryId,
            keywords: keywords.slice(0, 6)
        });

        this.feedbackStats.totalRatings += 1;
        const total = this.feedbackStats.totalRatings;
        this.feedbackStats.averageRating = ((this.feedbackStats.averageRating * (total - 1)) + rating) / total;
        this.feedbackStats.motionBias = ((this.feedbackStats.motionBias * (total - 1)) + motion) / total;
        this.feedbackStats.colorBias = ((this.feedbackStats.colorBias * (total - 1)) + color) / total;
        if (notes) {
            this.feedbackStats.lastNotes = notes;
        }

        if (profileId) {
            const list = this.feedbackByProfile.get(profileId) || [];
            list.push({ rating, motion, color, notes, timestamp: entry.timestamp });
            this.feedbackByProfile.set(profileId, list);
        }

        if (entryId) {
            const list = this.feedbackByEntry.get(entryId) || [];
            list.push({ rating, motion, color, notes, timestamp: entry.timestamp, profileId });
            this.feedbackByEntry.set(entryId, list);
        }

        const keywordSet = new Set();
        const activeKeywords = this.activeProfile?.mood?.keywords || [];
        activeKeywords.forEach(keyword => keywordSet.add(keyword));
        if (profileId) {
            const targetEntry = this.sessionLog.find(item => item.profile?.id === profileId);
            const targetProfile = targetEntry?.profile || (this.activeProfile?.id === profileId ? this.activeProfile : null);
            const targetKeywords = targetProfile?.mood?.keywords || [];
            targetKeywords.forEach(keyword => keywordSet.add(keyword));
        }
        keywords.forEach(keyword => keywordSet.add(keyword));

        keywordSet.forEach(keyword => {
            const key = keyword ? keyword.toString().toLowerCase() : '';
            if (!key) return;
            const stats = this.feedbackKeywordTotals.get(key) || { total: 0, count: 0 };
            stats.total += rating;
            stats.count += 1;
            this.feedbackKeywordTotals.set(key, stats);
        });

        const globalAdjust = (rating - 0.5) * 0.4;
        const motionAdjust = (motion - 0.5) * 0.3;
        const colorAdjust = (color - 0.5) * 0.3;
        this.adaptiveWeights.global = clamp((this.adaptiveWeights.global ?? 1) + globalAdjust, 0.6, 1.6);
        this.adaptiveWeights.motion = clamp((this.adaptiveWeights.motion ?? 1) + globalAdjust * 0.4 + motionAdjust, 0.6, 1.6);
        this.adaptiveWeights.texture = clamp((this.adaptiveWeights.texture ?? 1) + globalAdjust * 0.3 + motionAdjust * 0.5, 0.6, 1.6);
        this.adaptiveWeights.color = clamp((this.adaptiveWeights.color ?? 1) + globalAdjust * 0.2 + colorAdjust, 0.6, 1.6);

        if (profileId) {
            this.updateCollaborationFeedback(profileId);
        }

        const stats = this.getFeedbackStats();
        this.notifyFeedbackListeners(stats);
        return entry;
    }

    getFeedbackStats() {
        return {
            total: this.feedbackStats.totalRatings,
            average: this.feedbackStats.averageRating,
            motionBias: this.feedbackStats.motionBias,
            colorBias: this.feedbackStats.colorBias,
            lastNotes: this.feedbackStats.lastNotes,
            trending: this.computeTrendingKeywords()
        };
    }

    computeTrendingKeywords(limit = 5) {
        const entries = Array.from(this.feedbackKeywordTotals.entries()).map(([keyword, data]) => ({
            keyword,
            score: data.count ? data.total / data.count : 0,
            count: data.count
        }));
        entries.sort((a, b) => b.score - a.score);
        return entries.slice(0, limit);
    }

    onFeedbackUpdate(listener) {
        if (typeof listener === 'function') {
            this.feedbackListeners.add(listener);
        }
    }

    offFeedbackUpdate(listener) {
        if (listener && this.feedbackListeners.has(listener)) {
            this.feedbackListeners.delete(listener);
        }
    }

    notifyFeedbackListeners(stats = null) {
        const snapshot = stats || this.getFeedbackStats();
        this.feedbackListeners.forEach(listener => {
            try {
                listener(snapshot);
            } catch (error) {
                console.error('SonicMoodConductor feedback listener error:', error);
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

        if (!normalized.id) {
            normalized.id = profile.id || profile.profileId || this.generateEntryId();
        }

        if (normalized.mood && typeof normalized.mood.energy !== 'number') {
            normalized.mood.energy = normalized.metrics?.energy ?? 0.5;
        }

        if (!normalized.mood.keywords || !normalized.mood.keywords.length) {
            normalized.mood.keywords = normalized.keywords || [];
        }

        return normalized;
    }

    applyProfile(profile, { logType = 'ai-profile', logExtras = {} } = {}) {
        const normalized = this.normalizeProfile(profile);
        const matrix = this.choreographer?.sonicMatrix;
        const before = matrix?.getBaseParameters?.() || {};
        const existingPreset = normalized.id ? this.responsivePresets.get(normalized.id) : null;
        if (existingPreset) {
            normalized.parameters = this.applyResponsiveBlend(normalized.parameters || {}, existingPreset);
        }

        let appliedParameters = { ...(normalized.parameters || {}) };
        let afterParams = { ...appliedParameters };
        let deltas = {};

        if (matrix) {
            const weightedProfile = this.applyAdaptiveWeights(normalized);
            const appliedProfile = matrix.setMoodProfile(weightedProfile) || weightedProfile;
            const after = matrix.getBaseParameters();
            appliedParameters = { ...after };
            afterParams = { ...after };
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

        const preset = this.trainResponsivePreset(enrichedProfile, before, afterParams);
        if (preset) {
            enrichedProfile.responsivePreset = preset;
        }
        const storyboardEntry = this.ensureStoryboardEntry(enrichedProfile, {
            startTime: this.getPlaybackTime(),
            bpm: this.liveContext?.bpm,
            envelopes: preset?.envelopes,
            manualInfluence: preset?.manualInfluence
        });
        if (storyboardEntry) {
            enrichedProfile.storyboardEntryId = storyboardEntry.id;
        }

        this.activeProfile = enrichedProfile;
        this.quickAdjustState = {
            ...quickAdjust,
            baselineParameters: this.extractAdjustableBaseline(appliedParameters),
            baselinePalette: enrichedProfile.palette ? this.cloneForLog(enrichedProfile.palette) : null,
            baselineMoodEnergy: enrichedProfile.mood?.energy ?? enrichedProfile.metrics?.energy ?? 0.5
        };

        this.recordSessionEntry(logType, {
            prompt: enrichedProfile.prompt,
            source: enrichedProfile.source,
            profile: this.cloneForLog(enrichedProfile),
            deltas: this.cloneForLog(deltas),
            parameters: this.cloneForLog(appliedParameters),
            response: this.cloneForLog(rawResponse),
            storyboardEntryId: storyboardEntry?.id,
            ...logExtras
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

    buildLLMContext() {
        return {
            bpm: this.liveContext?.bpm ?? 0,
            energy: this.liveContext?.energy ?? 0,
            spectralBalance: this.liveContext?.spectralBalance
                ? { ...this.liveContext.spectralBalance }
                : null,
            spectralSignature: this.liveContext?.spectralSignature
                || this.liveContext?.spectralBalance?.signature
                || 'balanced',
            genre: this.liveContext?.genre || 'ambient',
            timeline: this.storyboard ? this.storyboard.getSummary(8) : [],
            collaborators: this.summarizeCollaborations(5),
            feedback: this.getFeedbackStats(),
            adaptiveWeights: { ...this.adaptiveWeights }
        };
    }

    updateLiveContext(frameInfo = {}) {
        if (!frameInfo) {
            return;
        }

        this.latestFrameInfo = frameInfo;
        const audio = frameInfo.audio || {};
        const context = audio.context || {};

        const bpm = Number.isFinite(context.bpm) ? context.bpm : (this.liveContext?.bpm ?? 0);
        const energy = clamp(audio.energy ?? this.liveContext?.energy ?? 0, 0, 1);
        const spectralBalance = context.spectralBalance
            ? { ...context.spectralBalance }
            : (this.liveContext?.spectralBalance ? { ...this.liveContext.spectralBalance } : null);
        const genre = context.estimatedGenre || context.genre || this.liveContext?.genre || 'ambient';

        const balanceSnapshot = spectralBalance || { bass: 0.33, mid: 0.34, high: 0.33, signature: 'flat' };

        this.liveContext = {
            bpm,
            energy,
            spectralBalance: balanceSnapshot,
            spectralSignature: context.spectralSignature || balanceSnapshot.signature || 'balanced',
            genre
        };

        this.latestManualBlend = this.deriveManualBlend(frameInfo.telemetry);
        if (this.storyboard) {
            this.storyboard.setLiveContext(this.liveContext);
        }
    }

    deriveManualBlend(telemetry = {}) {
        const blend = {};
        Object.entries(telemetry || {}).forEach(([param, info]) => {
            if (!info) return;
            const pad = Math.abs(info.pad ?? 0);
            const keyboard = Math.abs(info.keyboard ?? 0);
            const audio = Math.abs(info.audio ?? 0);
            const total = pad + keyboard + audio + 1e-6;
            blend[param] = clamp((pad + keyboard) / total, 0, 1);
        });
        return blend;
    }

    trainResponsivePreset(profile, before = {}, after = {}) {
        if (!profile || !profile.id) {
            return null;
        }

        const finalParams = after && Object.keys(after).length ? after : (profile.parameters || {});
        if (!finalParams || Object.keys(finalParams).length === 0) {
            return null;
        }

        const manualBlend = this.latestManualBlend || {};
        const liveFinal = this.latestFrameInfo?.finalParams || {};
        const envelopes = {};
        const manualWeights = [];

        Object.entries(finalParams).forEach(([param, targetValue]) => {
            if (!Number.isFinite(targetValue)) {
                return;
            }
            const startValue = Number.isFinite(before?.[param]) ? before[param] : targetValue;
            const manualWeight = clamp(manualBlend[param] ?? 0, 0, 1);
            manualWeights.push(manualWeight);
            envelopes[param] = {
                start: startValue,
                target: targetValue,
                manualWeight,
                live: Number.isFinite(liveFinal?.[param]) ? liveFinal[param] : targetValue
            };
        });

        const manualInfluence = manualWeights.length
            ? manualWeights.reduce((sum, value) => sum + value, 0) / manualWeights.length
            : 0;

        const preset = {
            id: `preset-${profile.id}`,
            profileId: profile.id,
            createdAt: Date.now(),
            envelopes,
            manualInfluence
        };

        this.responsivePresets.set(profile.id, preset);
        return preset;
    }

    applyResponsiveBlend(parameters = {}, preset = null) {
        if (!preset) {
            return { ...parameters };
        }

        const blended = { ...parameters };
        const live = this.latestFrameInfo?.finalParams || {};

        Object.entries(preset.envelopes || {}).forEach(([param, info]) => {
            if (!Number.isFinite(blended[param])) {
                return;
            }
            const manualWeight = clamp(info?.manualWeight ?? preset.manualInfluence ?? 0, 0, 1);
            if (manualWeight <= 1e-3) {
                return;
            }
            const liveValue = Number.isFinite(live?.[param])
                ? live[param]
                : Number.isFinite(info?.live)
                    ? info.live
                    : blended[param];
            const mix = manualWeight * 0.6;
            blended[param] = blended[param] * (1 - mix) + liveValue * mix;
        });

        return blended;
    }

    ensureStoryboardEntry(profile, options = {}) {
        if (!this.storyboard || !profile) {
            return null;
        }
        const entry = this.storyboard.addOrUpdate(profile, options);
        this.notifyStoryboardListeners(entry);
        return entry;
    }

    activateStoryboardEntry(entryId, { record = true } = {}) {
        if (!this.storyboard) {
            return this.activeProfile;
        }
        const entry = this.storyboard.getEntry(entryId);
        if (!entry || !entry.profileSnapshot) {
            return this.activeProfile;
        }

        const snapshot = entry.profileSnapshot;
        const profile = {
            id: entry.profileId,
            prompt: entry.prompt || snapshot.mood?.description || '',
            source: 'storyboard',
            parameters: snapshot.parameters ? { ...snapshot.parameters } : {},
            palette: snapshot.palette ? { ...snapshot.palette } : null,
            mood: snapshot.mood ? { ...snapshot.mood } : null,
            metadata: { storyboardId: entry.id }
        };

        const applied = this.applyProfile(profile);
        if (applied) {
            applied.storyboardEntryId = entry.id;
            if (record) {
                this.recordSessionEntry('storyboard-activate', {
                    storyboardEntryId: entry.id,
                    prompt: applied.prompt,
                    source: applied.source,
                    profile: this.cloneForLog(applied)
                });
            }
        }

        return applied;
    }

    getStoryboard() {
        return this.storyboard ? this.storyboard.getEntries() : [];
    }

    onStoryboardUpdate(listener) {
        if (typeof listener === 'function') {
            this.storyboardListeners.add(listener);
        }
    }

    offStoryboardUpdate(listener) {
        if (listener && this.storyboardListeners.has(listener)) {
            this.storyboardListeners.delete(listener);
        }
    }

    notifyStoryboardListeners(latest = null) {
        const snapshot = this.getStoryboard();
        const latestClone = latest ? { ...latest, envelopes: latest.envelopes ? { ...latest.envelopes } : undefined } : null;
        this.storyboardListeners.forEach(listener => {
            try {
                listener(snapshot, latestClone);
            } catch (error) {
                console.error('SonicMoodConductor storyboard listener error:', error);
            }
        });
    }

    getPlaybackTime() {
        const element = this.choreographer?.audioElement;
        if (element && Number.isFinite(element.currentTime)) {
            return element.currentTime;
        }
        const ctx = this.choreographer?.audioContext;
        if (ctx && Number.isFinite(ctx.currentTime)) {
            return ctx.currentTime;
        }
        return 0;
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

        let preset = null;
        let storyboardEntry = null;

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

            preset = this.trainResponsivePreset(this.activeProfile, before, after);
            if (preset) {
                this.activeProfile.responsivePreset = preset;
            }
            storyboardEntry = this.ensureStoryboardEntry(this.activeProfile, {
                envelopes: preset?.envelopes,
                manualInfluence: preset?.manualInfluence
            });
            if (storyboardEntry) {
                this.activeProfile.storyboardEntryId = storyboardEntry.id;
            }
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
                source: this.activeProfile?.source,
                storyboardEntryId: storyboardEntry?.id
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

        let preset = null;
        let storyboardEntry = null;

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

            preset = this.trainResponsivePreset(this.activeProfile, before, after);
            if (preset) {
                this.activeProfile.responsivePreset = preset;
            }
            storyboardEntry = this.ensureStoryboardEntry(this.activeProfile, {
                envelopes: preset?.envelopes,
                manualInfluence: preset?.manualInfluence
            });
            if (storyboardEntry) {
                this.activeProfile.storyboardEntryId = storyboardEntry.id;
            }
        }

        if (record) {
            this.recordSessionEntry('quick-adjust-reset', {
                parameters: this.cloneForLog(appliedValues),
                deltas: this.cloneForLog(deltas),
                profile: this.cloneForLog(this.activeProfile),
                prompt: this.activeProfile?.prompt,
                source: this.activeProfile?.source,
                storyboardEntryId: storyboardEntry?.id
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
        let beforeParams = {};
        let afterParams = {};
        let preset = null;
        let storyboardEntry = null;

        if (matrix) {
            const before = matrix.getBaseParameters();
            beforeParams = { ...before };
            const applied = matrix.setMoodProfile(normalizedProfile) || normalizedProfile;
            const after = matrix.getBaseParameters();
            afterParams = { ...after };
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
            beforeParams = { ...appliedProfile.parameters };
            afterParams = { ...appliedProfile.parameters };
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

        preset = this.trainResponsivePreset(this.activeProfile, beforeParams, afterParams);
        if (preset) {
            this.activeProfile.responsivePreset = preset;
        }
        storyboardEntry = this.ensureStoryboardEntry(this.activeProfile, {
            envelopes: preset?.envelopes,
            manualInfluence: preset?.manualInfluence
        });
        if (storyboardEntry) {
            this.activeProfile.storyboardEntryId = storyboardEntry.id;
        }

        if (record) {
            this.recordSessionEntry('mood-recall', {
                referenceId: entryId,
                prompt: appliedProfile.prompt,
                source: appliedProfile.source,
                profile: this.cloneForLog(appliedProfile),
                parameters: this.cloneForLog(appliedProfile.parameters),
                deltas: this.cloneForLog(appliedProfile.deltas),
                storyboardEntryId: storyboardEntry?.id
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
        const profile = await this.llmInterface.generateParameters(description, this.buildLLMContext());
        return this.applyProfile(profile);
    }

    getActiveProfile() {
        return this.activeProfile;
    }
}
