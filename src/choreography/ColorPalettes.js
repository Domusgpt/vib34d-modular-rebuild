/**
 * Color Palette Transition Functions
 * Different modes for transitioning through color palettes
 */

export function applyColorPalette(palette, progress, beatPhase, audioData, setParameterFn) {
    const colors = palette.colors;
    if (!colors || colors.length === 0) return;

    let colorIndex = 0;

    switch (palette.transitionMode) {
        case 'beat-pulse':
            // Change color on beat
            colorIndex = Math.floor(beatPhase * colors.length) % colors.length;
            break;
        case 'smooth-fade':
            // Smoothly interpolate through colors
            const colorProgress = progress * colors.length;
            colorIndex = Math.floor(colorProgress) % colors.length;
            break;
        case 'snap-change':
            // Change at fixed intervals
            const barsPerChange = palette.barsPerChange || 4;
            colorIndex = Math.floor(progress * colors.length / barsPerChange) % colors.length;
            break;
        case 'frequency-map':
            // Map to frequency content (use bass level)
            if (audioData) {
                colorIndex = Math.floor(audioData.bass * colors.length) % colors.length;
            }
            break;
        default:
            colorIndex = 0;
    }

    const color = colors[colorIndex];
    if (color) {
        setParameterFn('hue', color.hue);
        setParameterFn('saturation', color.saturation);
        setParameterFn('intensity', color.intensity);
    }
}

/**
 * Create a color palette from an array of HSL values
 */
export function createColorPalette(colors, transitionMode = 'smooth-fade', barsPerChange = 4) {
    return {
        colors: colors.map(c => ({
            hue: c.hue || 0,
            saturation: c.saturation || 0.8,
            intensity: c.intensity || 0.5
        })),
        transitionMode,
        barsPerChange
    };
}

/**
 * Pre-defined color palettes
 */
export const PRESET_PALETTES = {
    rainbow: createColorPalette([
        { hue: 0, saturation: 0.8, intensity: 0.5 },     // Red
        { hue: 60, saturation: 0.8, intensity: 0.5 },    // Yellow
        { hue: 120, saturation: 0.8, intensity: 0.5 },   // Green
        { hue: 180, saturation: 0.8, intensity: 0.5 },   // Cyan
        { hue: 240, saturation: 0.8, intensity: 0.5 },   // Blue
        { hue: 300, saturation: 0.8, intensity: 0.5 }    // Magenta
    ]),
    fire: createColorPalette([
        { hue: 0, saturation: 1.0, intensity: 0.5 },     // Red
        { hue: 30, saturation: 1.0, intensity: 0.6 },    // Orange
        { hue: 60, saturation: 1.0, intensity: 0.7 }     // Yellow
    ]),
    ocean: createColorPalette([
        { hue: 180, saturation: 0.8, intensity: 0.4 },   // Deep cyan
        { hue: 200, saturation: 0.7, intensity: 0.5 },   // Blue
        { hue: 220, saturation: 0.6, intensity: 0.6 }    // Light blue
    ]),
    neon: createColorPalette([
        { hue: 180, saturation: 1.0, intensity: 0.8 },   // Neon cyan
        { hue: 300, saturation: 1.0, intensity: 0.8 },   // Neon magenta
        { hue: 120, saturation: 1.0, intensity: 0.8 }    // Neon green
    ])
};
