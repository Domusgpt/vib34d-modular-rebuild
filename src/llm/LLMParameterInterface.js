import { clamp } from '../utils/math.js';

/**
 * LLM Parameter Interface for VIB34D
 * Converts natural language descriptions to sonic mood profiles.
 */
export class LLMParameterInterface {
    constructor() {
        // Try Firebase Function first, fallback to direct API
        this.useFirebase = true;
        this.firebaseUrl = 'https://us-central1-vib34d-llm-engine.cloudfunctions.net/generateVIB34DParameters';

        this.apiKey = localStorage.getItem('vib34d-gemini-api-key') || null;
        this.baseApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.parameterCallback = null;

        this.parameterRanges = {
            geometry: { min: 0, max: 7, type: 'int', default: 1 },
            hue: { min: 0, max: 360, type: 'int', default: 200 },
            intensity: { min: 0, max: 1, type: 'float', default: 0.55 },
            saturation: { min: 0, max: 1, type: 'float', default: 0.7 },
            speed: { min: 0.1, max: 3, type: 'float', default: 1.2 },
            chaos: { min: 0, max: 1, type: 'float', default: 0.35 },
            morphFactor: { min: 0, max: 2, type: 'float', default: 1 },
            gridDensity: { min: 5, max: 100, type: 'int', default: 22 },
            rot4dXW: { min: -6.28, max: 6.28, type: 'float', default: 0 },
            rot4dYW: { min: -6.28, max: 6.28, type: 'float', default: 0 },
            rot4dZW: { min: -6.28, max: 6.28, type: 'float', default: 0 },
            glitchIntensity: { min: 0, max: 0.2, type: 'float', default: 0.05 },
            moireScale: { min: 0.95, max: 1.05, type: 'float', default: 1 },
            lineThickness: { min: 0.01, max: 0.1, type: 'float', default: 0.02 }
        };

        this.systemPrompt = `You are a synesthetic AI that translates human experience into holographic sonic moods for the VIB34D stage.

You control these parameters (return values within the ranges):
- geometry (0-7 integers)
- hue (0-360 degrees)
- intensity, saturation (0-1)
- speed (0.1-3), chaos (0-1), morphFactor (0-2), gridDensity (5-100)
- rot4dXW, rot4dYW, rot4dZW (-6.28 to 6.28)
- glitchIntensity (0-0.2), moireScale (0.95-1.05), lineThickness (0.01-0.1)

Respond ONLY with JSON in the following format:
{
  "mood": {
    "label": "Two or three word poetic title",
    "description": "One sentence describing the vibe",
    "keywords": ["keyword", "..."],
    "energy": 0-1,
    "colorTemperature": "warm|cool|electric|ambient"
  },
  "parameterTargets": { ... parameter values ... },
  "reactivity": {
    "global": 0.6-1.6,
    "color": 0.5-1.6,
    "motion": 0.5-1.7,
    "geometry": 0.5-1.7,
    "texture": 0.5-1.7
  },
  "palette": {
    "primaryHue": 0-360,
    "accentHue": 0-360,
    "saturation": 0-1,
    "intensity": 0-1,
    "narrative": "brief color story"
  }
}

Blend mood, color, and motion so the visuals feel emotionally true to the description.`;
    }

    async initialize() {
        const storedKey = localStorage.getItem('vib34d-gemini-api-key');
        if (storedKey) {
            this.apiKey = storedKey;
            console.log('🔑 Gemini API key loaded from storage');
            return true;
        }

        console.log('📝 Gemini API key will be requested on first use');
        return false;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('vib34d-gemini-api-key', apiKey);
        console.log('🔑 Gemini API key saved');
    }

    setParameterCallback(callback) {
        this.parameterCallback = callback;
    }

    async generateParameters(description, context = null, options = {}) {
        if (!description || !description.trim()) {
            throw new Error('Description is required');
        }

        const trimmed = description.trim();
        const decorated = this.decorateDescription(trimmed, context, options);
        const rawProfile = await this.fetchRawProfile(decorated.promptText, decorated.requestBody);
        const profile = this.composeProfile(rawProfile, trimmed);

        if (this.parameterCallback) {
            this.parameterCallback(profile, context, {
                originalPrompt: trimmed,
                decoratedPrompt: decorated,
                options
            });
        }

        return profile;
    }

    async fetchRawProfile(description, bodyExtras = null) {
        let lastError = null;

        if (this.useFirebase) {
            try {
                return await this.generateViaFirebase(description, bodyExtras);
            } catch (error) {
                lastError = error;
                console.warn('🔥 Firebase Function failed, falling back to direct API:', error.message);
                this.useFirebase = false;
            }
        }

        try {
            return await this.generateViaDirect(description, bodyExtras);
        } catch (error) {
            if (lastError) {
                throw error;
            }
            throw error;
        }
    }

    async generateViaDirect(description, bodyExtras = null) {
        console.log('🔍 Using direct Gemini API approach...');
        console.log('🔍 Checking API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');

        const hasValidKey = this.apiKey && this.apiKey.startsWith('AIza') && this.apiKey.length > 30;
        console.log('🔍 API key valid:', hasValidKey);

        if (!hasValidKey) {
            throw new Error('No API key set. Please enter your Gemini API key to use AI generation.');
        }

        const apiUrl = `${this.baseApiUrl}?key=${this.apiKey}`;
        console.log('🤖 Making API request to:', apiUrl);

        const requestBody = {
            contents: [{
                parts: [{
                    text: `${this.systemPrompt}\n\n${description}`
                }]
            }],
            generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 600,
                topP: 0.85,
                topK: 40
            }
        };

        if (bodyExtras && typeof bodyExtras === 'object') {
            requestBody.clientContext = bodyExtras;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('🤖 API response status:', response.status);
        console.log('🤖 API response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('🤖 API request failed:', response.status, errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('🤖 API response data:', data);
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('Gemini response did not include text');
        }

        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Gemini response did not include JSON');
        }

        try {
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Failed to parse Gemini JSON:', error);
            throw new Error('Failed to parse Gemini response JSON');
        }
    }

    async generateViaFirebase(description, bodyExtras = null) {
        const response = await fetch(this.firebaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description.trim(),
                context: bodyExtras || undefined
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Firebase Function error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || (!data.profile && !data.parameters)) {
            throw new Error('Invalid response from Firebase Function');
        }

        return data.profile || data.parameters;
    }

    decorateDescription(description, context = null, options = {}) {
        const contextSummary = this.formatContextSummary(context);
        const decoratedPrompt = contextSummary
            ? `Context:\n${contextSummary}\n\nUser description: "${description}"\n\nReturn JSON:`
            : `User description: "${description}"\n\nReturn JSON:`;

        const requestBody = context ? {
            telemetry: context.telemetry || null,
            storyboard: context.storyboard || null,
            presets: context.presets || null,
            mode: context.mode || null,
            timestamp: Date.now(),
            options
        } : null;

        return {
            promptText: decoratedPrompt,
            requestBody,
            summary: contextSummary
        };
    }

    formatContextSummary(context) {
        if (!context) {
            return '';
        }

        const sections = [];
        if (context.telemetry) {
            const { bpm, spectralBalance, genre, genreConfidence, energy } = context.telemetry;
            const toPercent = (value) => Number.isFinite(value) ? Math.round(value * 100) : '—';
            const tempo = bpm ? `BPM ${bpm}` : 'BPM unknown';
            const spectral = spectralBalance
                ? `Spectral ${toPercent(spectralBalance.low)}L/${toPercent(spectralBalance.mid)}M/${toPercent(spectralBalance.high)}H`
                : 'Spectral balance pending';
            const genreLine = genre ? `Genre ${genre}${genreConfidence ? ` (${Math.round(genreConfidence * 100)}% conf)` : ''}` : null;
            const energyLine = Number.isFinite(energy) ? `Energy ${(energy * 100).toFixed(0)}%` : null;
            sections.push(['Audio', tempo, spectral, genreLine, energyLine].filter(Boolean).join(' · '));
        }

        if (Array.isArray(context.storyboard) && context.storyboard.length) {
            const recent = context.storyboard.slice(-3).map(segment => {
                const label = segment.label || 'Untitled';
                const startTime = Number.isFinite(segment.startTime)
                    ? `@${segment.startTime.toFixed(1)}s`
                    : '@0s';
                const duration = Number.isFinite(segment.duration)
                    ? `${segment.duration.toFixed(1)}s`
                    : 'open';
                return `${label} ${startTime} (${duration})`;
            });
            sections.push(`Storyboard: ${recent.join(' | ')}`);
        }

        if (context.presets?.active) {
            const preset = context.presets.active;
            const weights = preset.weights
                ? `weights m${Math.round(preset.weights.mood * 100)} / p${Math.round(preset.weights.pad * 100)} / k${Math.round(preset.weights.keyboard * 100)}`
                : null;
            sections.push(`Responsive preset: ${preset.label}${weights ? ` (${weights})` : ''}`);
        }

        if (context.mode) {
            sections.push(`Studio mode: ${context.mode}`);
        }

        return sections.join('\n');
    }

    composeProfile(raw, description) {
        const rawObject = this.ensureObject(raw);
        const baseParameters = rawObject.parameterTargets || rawObject.parameters || rawObject.params || rawObject;
        let parameters = this.validateParameters(baseParameters || {});

        if (Object.keys(parameters).length === 0) {
            parameters = this.createDefaultParameters();
        }

        const metrics = this.deriveMetrics(parameters);
        const palette = this.composePalette(rawObject.palette, parameters);
        const mood = this.composeMood(rawObject.mood, rawObject, description, metrics, palette);
        const reactivity = this.composeReactivity(rawObject.reactivity || rawObject.reactivityBias, metrics);
        const keywords = Array.isArray(rawObject.keywords)
            ? rawObject.keywords
            : mood.keywords;

        return {
            prompt: description,
            source: rawObject.source || (this.useFirebase ? 'firebase-llm' : 'gemini-direct'),
            timestamp: Date.now(),
            parameters,
            palette,
            mood,
            reactivity,
            metrics,
            keywords,
            metadata: {
                ...(rawObject.metadata || {}),
                rawResponse: rawObject
            }
        };
    }

    ensureObject(raw) {
        if (!raw) return {};
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            } catch (error) {
                console.warn('Failed to parse raw LLM string, falling back to empty object');
                return {};
            }
        }
        if (Array.isArray(raw)) {
            return raw[0] || {};
        }
        if (typeof raw === 'object') {
            return raw;
        }
        return {};
    }

    createDefaultParameters() {
        const defaults = {};
        Object.entries(this.parameterRanges).forEach(([param, range]) => {
            if (range.default !== undefined) {
                defaults[param] = range.default;
            }
        });
        return defaults;
    }

    composeMood(mood, rawObject, description, metrics, palette) {
        const label = (mood && mood.label)
            || rawObject.moodLabel
            || this.generateLabelFromDescription(description);

        const descriptionText = (mood && mood.description)
            || rawObject.moodDescription
            || `Sonic interpretation of ${description}`;

        const energy = this.coerceNumber(
            mood?.energy ?? rawObject.energy,
            0,
            1,
            metrics.energy
        );

        const colorTemperature = (mood && mood.colorTemperature)
            || rawObject.colorTemperature
            || this.estimateColorTemperature(palette.primaryHue, palette.saturation);

        const keywords = Array.isArray(mood?.keywords)
            ? mood.keywords
            : this.extractKeywords(description);

        return {
            label,
            description: descriptionText,
            energy,
            colorTemperature,
            keywords,
            emotions: mood?.emotions || rawObject.emotions || [],
            narrative: mood?.narrative || rawObject.narrative || palette.narrative
        };
    }

    composePalette(rawPalette, parameters) {
        const hue = this.coerceNumber(parameters.hue, 0, 360, 200);
        const saturation = this.coerceNumber(parameters.saturation, 0, 1, 0.7);
        const intensity = this.coerceNumber(parameters.intensity, 0, 1, 0.55);

        if (rawPalette && typeof rawPalette === 'object') {
            return {
                primaryHue: this.wrapHue(this.coerceNumber(rawPalette.primaryHue, 0, 360, hue)),
                accentHue: this.wrapHue(this.coerceNumber(rawPalette.accentHue, 0, 360, (hue + 120) % 360)),
                saturation: this.coerceNumber(rawPalette.saturation, 0, 1, saturation),
                intensity: this.coerceNumber(rawPalette.intensity, 0, 1, intensity),
                narrative: rawPalette.narrative || rawPalette.description || 'AI composed chroma story'
            };
        }

        return {
            primaryHue: this.wrapHue(hue),
            accentHue: this.wrapHue((hue + 140) % 360),
            saturation,
            intensity,
            narrative: 'Auto-derived from mood parameters'
        };
    }

    composeReactivity(rawReactivity, metrics) {
        if (rawReactivity && typeof rawReactivity === 'object') {
            const normalized = {};
            Object.entries(rawReactivity).forEach(([key, value]) => {
                const numeric = parseFloat(value);
                if (!Number.isFinite(numeric)) return;
                normalized[key] = clamp(numeric, 0.5, 1.8);
            });
            if (!('global' in normalized)) {
                normalized.global = clamp(0.75 + (metrics.energy ?? 0.5) * 0.45, 0.6, 1.6);
            }
            return normalized;
        }

        return {
            global: clamp(0.75 + (metrics.energy ?? 0.5) * 0.45, 0.6, 1.6),
            color: clamp(0.7 + (metrics.brightness ?? 0.5) * 0.55, 0.5, 1.6),
            motion: clamp(0.7 + (metrics.motion ?? 0.5) * 0.6, 0.5, 1.7),
            geometry: clamp(0.65 + (metrics.complexity ?? 0.5) * 0.6, 0.5, 1.7),
            texture: clamp(0.65 + (metrics.texture ?? 0.5) * 0.6, 0.5, 1.7)
        };
    }

    deriveMetrics(parameters) {
        const energy = this.average([
            this.normalizeParameterValue('speed', parameters.speed),
            this.normalizeParameterValue('chaos', parameters.chaos),
            this.normalizeParameterValue('intensity', parameters.intensity)
        ]);

        const brightness = this.average([
            this.normalizeParameterValue('intensity', parameters.intensity),
            this.normalizeParameterValue('saturation', parameters.saturation)
        ]);

        const motion = this.average([
            this.normalizeParameterValue('speed', parameters.speed),
            Math.abs(parameters.rot4dXW || 0) / this.parameterRanges.rot4dXW.max,
            Math.abs(parameters.rot4dYW || 0) / this.parameterRanges.rot4dYW.max,
            Math.abs(parameters.rot4dZW || 0) / this.parameterRanges.rot4dZW.max
        ]);

        const complexity = this.average([
            this.normalizeParameterValue('geometry', parameters.geometry),
            this.normalizeParameterValue('gridDensity', parameters.gridDensity),
            this.normalizeParameterValue('morphFactor', parameters.morphFactor)
        ]);

        const texture = this.average([
            this.normalizeParameterValue('chaos', parameters.chaos),
            this.normalizeParameterValue('glitchIntensity', parameters.glitchIntensity),
            this.normalizeParameterValue('lineThickness', parameters.lineThickness)
        ]);

        return {
            energy,
            brightness,
            motion,
            complexity,
            texture
        };
    }

    normalizeParameterValue(param, value) {
        const range = this.parameterRanges[param];
        if (!range) return 0;
        const numeric = parseFloat(value);
        const fallback = range.default !== undefined
            ? (range.default - range.min) / (range.max - range.min)
            : 0.5;

        if (!Number.isFinite(numeric)) {
            return clamp(fallback, 0, 1);
        }

        if (range.max === range.min) {
            return 0;
        }

        const normalized = (numeric - range.min) / (range.max - range.min);
        return clamp(normalized, 0, 1);
    }

    coerceNumber(value, min, max, fallback = null) {
        const numeric = parseFloat(value);
        if (Number.isFinite(numeric)) {
            return clamp(numeric, min, max);
        }
        if (fallback !== null && fallback !== undefined) {
            return clamp(fallback, min, max);
        }
        return clamp((min + max) / 2, min, max);
    }

    generateLabelFromDescription(description) {
        if (!description) return 'Custom Sculpt';
        const words = description
            .split(/[^a-zA-Z0-9]+/)
            .filter(Boolean)
            .map(word => word.trim())
            .filter(word => word.length > 2)
            .slice(0, 3)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

        if (!words.length) {
            return 'Custom Sculpt';
        }

        return words.join(' ');
    }

    extractKeywords(description) {
        if (!description) return [];
        return description
            .toLowerCase()
            .split(/[^a-z0-9]+/)
            .filter(word => word.length > 2)
            .slice(0, 5);
    }

    estimateColorTemperature(hue, saturation = 0.6) {
        if (!Number.isFinite(hue)) {
            return 'ambient';
        }

        const wrapped = this.wrapHue(hue);

        if (wrapped >= 330 || wrapped < 45) {
            return saturation > 0.6 ? 'volcanic' : 'warm';
        }
        if (wrapped < 120) {
            return 'sunrise';
        }
        if (wrapped < 210) {
            return 'cool';
        }
        if (wrapped < 285) {
            return saturation > 0.6 ? 'electric' : 'violet';
        }
        return saturation > 0.6 ? 'neon' : 'magenta';
    }

    wrapHue(hue) {
        if (!Number.isFinite(hue)) {
            return 0;
        }
        const wrapped = hue % 360;
        return wrapped < 0 ? wrapped + 360 : wrapped;
    }

    average(values) {
        const valid = values
            .map(value => (Number.isFinite(value) ? value : 0))
            .filter(value => Number.isFinite(value));

        if (!valid.length) {
            return 0.5;
        }

        const sum = valid.reduce((acc, value) => acc + value, 0);
        return clamp(sum / valid.length, 0, 1);
    }

    validateParameters(params) {
        const validated = {};

        Object.entries(this.parameterRanges).forEach(([param, range]) => {
            if (params.hasOwnProperty(param)) {
                let value = parseFloat(params[param]);
                if (!Number.isFinite(value)) return;
                value = clamp(value, range.min, range.max);
                if (range.type === 'int') {
                    value = Math.round(value);
                }
                validated[param] = value;
            }
        });

        return validated;
    }
}
