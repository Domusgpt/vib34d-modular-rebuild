/**
 * ColorPaletteManager.js - Advanced Color Palette System
 * 40+ curated palettes + gradient generation + audio-reactive colors
 *
 * A Paul Phillips Manifestation
 */

export class ColorPaletteManager {
    constructor() {
        this.currentPalette = 'Cyberpunk Neon';
        this.customPalettes = [];

        // Initialize palette library
        this.palettes = this.generatePalettes();

        // Color interpolation mode
        this.interpolationMode = 'rgb'; // rgb, hsv, lab

        // Audio-reactive settings
        this.audioReactive = false;
        this.audioColorMapping = 'hue-shift'; // hue-shift, palette-cycle, intensity-brightness

        this.loadCustomPalettes();
    }

    /**
     * Generate 40+ curated color palettes
     */
    generatePalettes() {
        return {
            // === NEON & CYBERPUNK (8 palettes) ===
            'Cyberpunk Neon': {
                colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
                description: 'Electric neon colors for cyberpunk aesthetics',
                tags: ['neon', 'bright', 'futuristic'],
                mood: 'energetic'
            },
            'Tokyo Nights': {
                colors: ['#E94560', '#0F3460', '#16213E', '#533483', '#F78FB3'],
                description: 'Dark cyberpunk with pink and purple highlights',
                tags: ['dark', 'neon', 'urban'],
                mood: 'mysterious'
            },
            'Matrix Green': {
                colors: ['#003B00', '#008F11', '#00FF41', '#00D800', '#39FF14'],
                description: 'Classic Matrix digital rain palette',
                tags: ['green', 'digital', 'tech'],
                mood: 'focused'
            },
            'Vaporwave': {
                colors: ['#FF71CE', '#01CDFE', '#05FFA1', '#B967FF', '#FFFB96'],
                description: 'Retro-futuristic vaporwave aesthetics',
                tags: ['pastel', 'retro', 'dreamy'],
                mood: 'nostalgic'
            },
            'Laser Grid': {
                colors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0080', '#80FF00'],
                description: 'High-contrast laser show colors',
                tags: ['neon', 'bright', 'grid'],
                mood: 'intense'
            },
            'Holographic': {
                colors: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
                description: 'Shimmering holographic gradient',
                tags: ['rainbow', 'bright', 'hologram'],
                mood: 'vibrant'
            },
            'Synthwave Sunset': {
                colors: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0'],
                description: 'Retro synthwave sunset gradient',
                tags: ['gradient', 'sunset', 'retro'],
                mood: 'nostalgic'
            },
            'Electric Dreams': {
                colors: ['#00F5FF', '#8B00FF', '#FF1493', '#FFD700', '#32CD32'],
                description: 'Vivid electric color spectrum',
                tags: ['bright', 'electric', 'rainbow'],
                mood: 'energetic'
            },

            // === DARK & MOODY (8 palettes) ===
            'Midnight': {
                colors: ['#0D1321', '#1D2D44', '#3E5C76', '#748CAB', '#F0EBD8'],
                description: 'Deep midnight blues with warm highlights',
                tags: ['dark', 'blue', 'calm'],
                mood: 'peaceful'
            },
            'Deep Ocean': {
                colors: ['#001219', '#005F73', '#0A9396', '#94D2BD', '#E9D8A6'],
                description: 'Ocean depths to sandy shores',
                tags: ['blue', 'ocean', 'gradient'],
                mood: 'calm'
            },
            'Black Hole': {
                colors: ['#000000', '#1A1A2E', '#16213E', '#0F3460', '#533483'],
                description: 'Event horizon darkness',
                tags: ['dark', 'space', 'minimal'],
                mood: 'mysterious'
            },
            'Gothic Purple': {
                colors: ['#1B0A2A', '#2D1B3D', '#4A2F60', '#7B4B94', '#A569BD'],
                description: 'Dark gothic purple spectrum',
                tags: ['purple', 'dark', 'gothic'],
                mood: 'dramatic'
            },
            'Shadow Realm': {
                colors: ['#0B0C10', '#1F2833', '#C5C6C7', '#66FCF1', '#45A29E'],
                description: 'Dark with cyan accents',
                tags: ['dark', 'cyan', 'minimal'],
                mood: 'focused'
            },
            'Volcanic': {
                colors: ['#1A1110', '#3D0814', '#630B16', '#8B0000', '#FF4500'],
                description: 'Deep volcanic reds and blacks',
                tags: ['red', 'dark', 'fire'],
                mood: 'intense'
            },
            'Void': {
                colors: ['#000000', '#0F0F0F', '#1E1E1E', '#2D2D2D', '#3C3C3C'],
                description: 'Minimalist monochrome darkness',
                tags: ['monochrome', 'minimal', 'dark'],
                mood: 'calm'
            },
            'Nebula': {
                colors: ['#0B0033', '#1A0052', '#2D0070', '#4A00B8', '#7B00FF'],
                description: 'Deep space nebula purples',
                tags: ['purple', 'space', 'gradient'],
                mood: 'mysterious'
            },

            // === NATURAL & ORGANIC (8 palettes) ===
            'Forest': {
                colors: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D'],
                description: 'Lush forest greens',
                tags: ['green', 'nature', 'organic'],
                mood: 'peaceful'
            },
            'Sunset': {
                colors: ['#03045E', '#023E8A', '#0077B6', '#FF6700', '#FF006E'],
                description: 'Dramatic sunset gradient',
                tags: ['gradient', 'sunset', 'warm'],
                mood: 'romantic'
            },
            'Desert': {
                colors: ['#D4A574', '#E9C9A6', '#F2E3DB', '#8B4513', '#CD853F'],
                description: 'Warm desert sands',
                tags: ['warm', 'earth', 'natural'],
                mood: 'calm'
            },
            'Aurora': {
                colors: ['#004643', '#00A896', '#0FA3B1', '#B5E2C8', '#F6F6F4'],
                description: 'Northern lights shimmer',
                tags: ['green', 'blue', 'natural'],
                mood: 'magical'
            },
            'Coral Reef': {
                colors: ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#3A0CA3'],
                description: 'Vibrant underwater corals',
                tags: ['pink', 'purple', 'vibrant'],
                mood: 'energetic'
            },
            'Autumn': {
                colors: ['#7B2D26', '#A84448', '#D4685B', '#E8986F', '#F2B880'],
                description: 'Fall foliage colors',
                tags: ['warm', 'orange', 'seasonal'],
                mood: 'nostalgic'
            },
            'Spring Bloom': {
                colors: ['#FFC4D6', '#FF9ECD', '#FF79C4', '#F159BB', '#D32BB2'],
                description: 'Cherry blossom pinks',
                tags: ['pink', 'spring', 'bright'],
                mood: 'happy'
            },
            'Mountain': {
                colors: ['#4A5859', '#5F6F65', '#8A9B85', '#B5C2A8', '#E5E9DC'],
                description: 'Misty mountain gradients',
                tags: ['gray', 'green', 'natural'],
                mood: 'peaceful'
            },

            // === VIBRANT & ENERGETIC (8 palettes) ===
            'Rainbow': {
                colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
                description: 'Full spectrum rainbow',
                tags: ['rainbow', 'bright', 'spectrum'],
                mood: 'energetic'
            },
            'Candy': {
                colors: ['#FF6B9D', '#FFC0CB', '#C71585', '#FFD700', '#87CEEB'],
                description: 'Sweet candy colors',
                tags: ['pink', 'bright', 'playful'],
                mood: 'happy'
            },
            'Tropical': {
                colors: ['#00CED1', '#FF6347', '#FFD700', '#32CD32', '#FF69B4'],
                description: 'Tropical paradise colors',
                tags: ['bright', 'warm', 'exotic'],
                mood: 'energetic'
            },
            'Fire': {
                colors: ['#FFDD00', '#FFA000', '#FF6F00', '#DD2C00', '#B71C1C'],
                description: 'Blazing fire gradient',
                tags: ['warm', 'fire', 'bright'],
                mood: 'intense'
            },
            'Ice': {
                colors: ['#E0F7FA', '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA'],
                description: 'Cool ice and frost',
                tags: ['blue', 'cool', 'bright'],
                mood: 'calm'
            },
            'Electric': {
                colors: ['#00FFFF', '#00BFFF', '#0080FF', '#0040FF', '#0000FF'],
                description: 'Electric blue spectrum',
                tags: ['blue', 'bright', 'electric'],
                mood: 'energetic'
            },
            'Plasma': {
                colors: ['#FF00FF', '#FF00CC', '#FF0099', '#FF0066', '#FF0033'],
                description: 'High-energy plasma pinks',
                tags: ['pink', 'bright', 'energy'],
                mood: 'intense'
            },
            'Neon Signs': {
                colors: ['#FF10F0', '#FE53BB', '#F5D300', '#08F7FE', '#09FBD3'],
                description: 'Bright neon sign colors',
                tags: ['neon', 'bright', 'urban'],
                mood: 'energetic'
            },

            // === PASTEL & SOFT (8 palettes) ===
            'Pastel Dream': {
                colors: ['#FFD1DC', '#FFABAB', '#FFC3A0', '#FF677D', '#D4A5A5'],
                description: 'Soft pastel pinks',
                tags: ['pastel', 'soft', 'pink'],
                mood: 'calm'
            },
            'Baby Blue': {
                colors: ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'],
                description: 'Gentle pastel spectrum',
                tags: ['pastel', 'soft', 'rainbow'],
                mood: 'peaceful'
            },
            'Lavender': {
                colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#BA55D3', '#9370DB'],
                description: 'Soft lavender purples',
                tags: ['purple', 'pastel', 'soft'],
                mood: 'romantic'
            },
            'Mint': {
                colors: ['#F0FFF0', '#E0FFE0', '#C0FFC0', '#A0FFA0', '#80FF80'],
                description: 'Fresh mint greens',
                tags: ['green', 'pastel', 'soft'],
                mood: 'calm'
            },
            'Peach': {
                colors: ['#FFDAB9', '#FFCCAA', '#FFBB99', '#FFAA88', '#FF9977'],
                description: 'Warm peach tones',
                tags: ['orange', 'pastel', 'warm'],
                mood: 'happy'
            },
            'Cotton Candy': {
                colors: ['#FFB6D9', '#FFC9E3', '#FFDCF0', '#FFEFFA', '#FFF5FB'],
                description: 'Ultra-soft cotton candy pink',
                tags: ['pink', 'pastel', 'soft'],
                mood: 'happy'
            },
            'Sky': {
                colors: ['#87CEEB', '#87CEFA', '#B0E0E6', '#ADD8E6', '#B0C4DE'],
                description: 'Soft sky blues',
                tags: ['blue', 'pastel', 'sky'],
                mood: 'peaceful'
            },
            'Cream': {
                colors: ['#FFFACD', '#FFF8DC', '#FAEBD7', '#FFE4B5', '#FFDEAD'],
                description: 'Warm cream and vanilla',
                tags: ['cream', 'warm', 'soft'],
                mood: 'calm'
            }
        };
    }

    /**
     * Get palette by name
     */
    getPalette(name) {
        return this.palettes[name] || this.palettes['Cyberpunk Neon'];
    }

    /**
     * Get all palette names
     */
    getPaletteNames() {
        return Object.keys(this.palettes);
    }

    /**
     * Get palettes by tag
     */
    getPalettesByTag(tag) {
        return Object.entries(this.palettes)
            .filter(([name, palette]) => palette.tags.includes(tag))
            .map(([name, palette]) => ({ name, ...palette }));
    }

    /**
     * Get palettes by mood
     */
    getPalettesByMood(mood) {
        return Object.entries(this.palettes)
            .filter(([name, palette]) => palette.mood === mood)
            .map(([name, palette]) => ({ name, ...palette }));
    }

    /**
     * Generate gradient between colors in palette
     * @param {string} paletteName
     * @param {number} steps
     */
    generateGradient(paletteName, steps = 100) {
        const palette = this.getPalette(paletteName);
        const colors = palette.colors;
        const gradient = [];

        for (let i = 0; i < steps; i++) {
            const position = i / (steps - 1);
            const color = this.interpolateColors(colors, position);
            gradient.push(color);
        }

        return gradient;
    }

    /**
     * Interpolate between multiple colors
     * @param {Array} colors - Array of hex color strings
     * @param {number} position - Position 0-1
     */
    interpolateColors(colors, position) {
        if (colors.length === 1) return colors[0];

        const segmentSize = 1 / (colors.length - 1);
        const segment = Math.floor(position / segmentSize);
        const localPosition = (position % segmentSize) / segmentSize;

        if (segment >= colors.length - 1) return colors[colors.length - 1];

        const color1 = this.hexToRgb(colors[segment]);
        const color2 = this.hexToRgb(colors[segment + 1]);

        return this.rgbToHex(
            Math.round(color1.r + (color2.r - color1.r) * localPosition),
            Math.round(color1.g + (color2.g - color1.g) * localPosition),
            Math.round(color1.b + (color2.b - color1.b) * localPosition)
        );
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    /**
     * Get color at position in current palette
     * @param {number} position - 0-1
     */
    getColorAtPosition(position) {
        const palette = this.getPalette(this.currentPalette);
        return this.interpolateColors(palette.colors, position);
    }

    /**
     * Map audio frequency to color
     * @param {number} frequency - 0-1 (bass to treble)
     * @param {number} intensity - 0-1 (volume)
     */
    audioToColor(frequency, intensity) {
        if (!this.audioReactive) {
            return this.getColorAtPosition(0.5);
        }

        const palette = this.getPalette(this.currentPalette);

        switch (this.audioColorMapping) {
            case 'hue-shift':
                return this.getColorAtPosition(frequency);

            case 'palette-cycle':
                const cyclePosition = (frequency + intensity) % 1;
                return this.getColorAtPosition(cyclePosition);

            case 'intensity-brightness':
                const baseColor = this.getColorAtPosition(frequency);
                return this.adjustBrightness(baseColor, intensity);

            default:
                return this.getColorAtPosition(frequency);
        }
    }

    /**
     * Adjust color brightness
     */
    adjustBrightness(hexColor, factor) {
        const rgb = this.hexToRgb(hexColor);
        return this.rgbToHex(
            Math.min(255, Math.round(rgb.r * factor)),
            Math.min(255, Math.round(rgb.g * factor)),
            Math.min(255, Math.round(rgb.b * factor))
        );
    }

    /**
     * Save custom palette
     */
    saveCustomPalette(name, colors, description = '', tags = []) {
        const customPalette = {
            name,
            colors,
            description,
            tags,
            mood: 'custom',
            timestamp: new Date().toISOString()
        };

        this.customPalettes.push(customPalette);
        this.saveCustomPalettes();

        return customPalette;
    }

    /**
     * Load custom palettes from localStorage
     */
    loadCustomPalettes() {
        try {
            const stored = localStorage.getItem('vib34d-custom-palettes');
            if (stored) {
                this.customPalettes = JSON.parse(stored);
                console.log(`✅ Loaded ${this.customPalettes.length} custom palettes`);
            }
        } catch (error) {
            console.warn('Failed to load custom palettes:', error);
        }
    }

    /**
     * Save custom palettes to localStorage
     */
    saveCustomPalettes() {
        try {
            localStorage.setItem('vib34d-custom-palettes', JSON.stringify(this.customPalettes));
        } catch (error) {
            console.warn('Failed to save custom palettes:', error);
        }
    }

    /**
     * Get all available tags
     */
    getAllTags() {
        const tags = new Set();
        Object.values(this.palettes).forEach(palette => {
            palette.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }

    /**
     * Get all available moods
     */
    getAllMoods() {
        const moods = new Set();
        Object.values(this.palettes).forEach(palette => {
            moods.add(palette.mood);
        });
        return Array.from(moods).sort();
    }

    /**
     * Search palettes by query
     */
    searchPalettes(query) {
        const lowerQuery = query.toLowerCase();
        return Object.entries(this.palettes)
            .filter(([name, palette]) =>
                name.toLowerCase().includes(lowerQuery) ||
                palette.description.toLowerCase().includes(lowerQuery) ||
                palette.tags.some(tag => tag.includes(lowerQuery))
            )
            .map(([name, palette]) => ({ name, ...palette }));
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 */
