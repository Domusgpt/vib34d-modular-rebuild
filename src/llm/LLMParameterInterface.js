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

    async generateParameters(description, context = {}) {
        if (!description || !description.trim()) {
            throw new Error('Description is required');
        }

        const trimmed = description.trim();
        const rawProfile = await this.fetchRawProfile(trimmed, context);
        const profile = this.composeProfile(rawProfile, trimmed, context);

        if (this.parameterCallback) {
            this.parameterCallback(profile);
        }

        return profile;
    }

    async previewParameters(description, context = {}) {
        if (!description || !description.trim()) {
            throw new Error('Description is required');
        }

        const trimmed = description.trim();
        const rawProfile = await this.fetchRawProfile(trimmed, context);
        return this.composeProfile(rawProfile, trimmed, context);
    }

    async fetchRawProfile(description, context = {}) {
        let lastError = null;

        if (this.useFirebase) {
            try {
                return await this.generateViaFirebase(description, context);
            } catch (error) {
                lastError = error;
                console.warn('🔥 Firebase Function failed, falling back to direct API:', error.message);
                this.useFirebase = false;
            }
        }

        try {
            return await this.generateViaDirect(description, context);
        } catch (error) {
            if (lastError) {
                throw error;
            }
            throw error;
        }
    }

    async generateViaDirect(description, context = {}) {
        console.log('🔍 Using direct Gemini API approach...');
        console.log('🔍 Checking API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');

        const hasValidKey = this.apiKey && this.apiKey.startsWith('AIza') && this.apiKey.length > 30;
        console.log('🔍 API key valid:', hasValidKey);

        if (!hasValidKey) {
            throw new Error('No API key set. Please enter your Gemini API key to use AI generation.');
        }

        const apiUrl = `${this.baseApiUrl}?key=${this.apiKey}`;
        console.log('🤖 Making API request to:', apiUrl);

        const userPrompt = this.composeUserPrompt(description, context);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.65,
                    maxOutputTokens: 600,
                    topP: 0.85,
                    topK: 40
                }
            })
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

    async generateViaFirebase(description, context = {}) {
        const response = await fetch(this.firebaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description.trim(),
                context: this.sanitizeContext(context)
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

    composeUserPrompt(description, context = {}) {
        const contextText = this.describeContext(context);
        return `${this.systemPrompt}\n\nLive context:\n${contextText}\n\nUser description: "${description}"\n\nReturn JSON:`;
    }

    describeContext(context = {}) {
        const lines = [];
        if (Number.isFinite(context.bpm) && context.bpm > 0) {
            lines.push(`- Tempo around ${Math.round(context.bpm)} BPM.`);
        }
        if (Number.isFinite(context.energy)) {
            lines.push(`- Overall energy near ${(context.energy * 100).toFixed(0)}%.`);
        }
        if (context.spectralBalance) {
            const balance = context.spectralBalance;
            const bass = Math.round((balance.bass ?? 0) * 100);
            const mid = Math.round((balance.mid ?? 0) * 100);
            const high = Math.round((balance.high ?? 0) * 100);
            const signature = balance.signature || context.spectralSignature || 'balanced';
            lines.push(`- Spectral mix ${signature}: bass ${bass}%, mid ${mid}%, high ${high}%.`);
        } else if (context.spectralSignature) {
            lines.push(`- Spectral mix ${context.spectralSignature}.`);
        }
        if (context.genre) {
            lines.push(`- Detected vibe leans toward ${String(context.genre)}.`);
        }
        if (Array.isArray(context.timeline) && context.timeline.length) {
            lines.push('- Storyboard plan:');
            context.timeline.slice(-4).forEach(entry => {
                const start = Math.round(entry.startTime ?? 0);
                const duration = Math.max(1, Math.round(entry.duration ?? 0));
                const label = entry.label ? String(entry.label).trim() : 'Unnamed mood';
                const manual = Math.round((entry.manualInfluence ?? 0) * 100);
                lines.push(`  • ${label} @${start}s for ${duration}s (manual blend ${manual}%).`);
            });
        }
        if (!lines.length) {
            lines.push('- React directly to the performer prompt while keeping visuals musical.');
        }
        return lines.join('\n');
    }

    sanitizeContext(context = {}) {
        if (!context || typeof context !== 'object') {
            return {};
        }

        const sanitized = {};
        if (Number.isFinite(context.bpm)) {
            sanitized.bpm = context.bpm;
        }
        if (Number.isFinite(context.energy)) {
            sanitized.energy = clamp(context.energy, 0, 1);
        }
        if (context.genre) {
            sanitized.genre = String(context.genre);
        }
        if (context.spectralBalance) {
            sanitized.spectralBalance = {
                bass: clamp(Number(context.spectralBalance.bass) || 0, 0, 1),
                mid: clamp(Number(context.spectralBalance.mid) || 0, 0, 1),
                high: clamp(Number(context.spectralBalance.high) || 0, 0, 1),
                signature: context.spectralBalance.signature || context.spectralSignature || undefined
            };
        }
        if (Array.isArray(context.timeline)) {
            sanitized.timeline = context.timeline.slice(-8).map(entry => ({
                id: entry.id,
                label: entry.label,
                startTime: Number.isFinite(entry.startTime) ? entry.startTime : 0,
                duration: Number.isFinite(entry.duration) ? entry.duration : 0,
                manualInfluence: clamp(entry.manualInfluence ?? 0, 0, 1)
            }));
        }

        return sanitized;
    }

    composeProfile(raw, description, context = {}) {
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
                rawResponse: rawObject,
                liveContext: this.sanitizeContext(context)
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
