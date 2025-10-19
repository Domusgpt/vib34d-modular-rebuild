import { LLMParameterInterface } from './LLMParameterInterface.js';
import { LLMParameterUI } from './LLMParameterUI.js';

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
        this.activeProfile = null;

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

    notifyListeners(profile) {
        this.listeners.forEach(listener => {
            try {
                listener(profile);
            } catch (error) {
                console.error('SonicMoodConductor listener error:', error);
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
        this.activeProfile = normalized;

        if (this.choreographer?.sonicMatrix) {
            this.choreographer.sonicMatrix.setMoodProfile(normalized);
        }

        this.notifyListeners(normalized);
        return normalized;
    }

    async generateFromPrompt(description) {
        const profile = await this.llmInterface.generateParameters(description);
        return this.applyProfile(profile);
    }

    getActiveProfile() {
        return this.activeProfile;
    }
}
