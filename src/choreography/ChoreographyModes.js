/**
 * Choreography Modes - 10 Different Audio-Reactive Behaviors
 * Each mode creates a distinct visual response to music
 */

export const CHOREOGRAPHY_MODES = {
    CHAOS: 'chaos',
    PULSE: 'pulse',
    WAVE: 'wave',
    FLOW: 'flow',
    DYNAMIC: 'dynamic',
    STROBE: 'strobe',
    GLITCH: 'glitch',
    BUILD: 'build',
    BREAKDOWN: 'breakdown',
    LIQUID: 'liquid'
};

/**
 * Apply choreography based on selected mode
 */
export function applyChoreographyMode(mode, audio, setParam, strength, baseParams) {
    switch (mode) {
        case 'chaos':
            applyChaosFlow(audio, setParam, strength, baseParams);
            break;
        case 'pulse':
            applyPulseFlow(audio, setParam, strength, baseParams);
            break;
        case 'wave':
            applyWaveFlow(audio, setParam, strength, baseParams);
            break;
        case 'flow':
            applyFlowMode(audio, setParam, strength, baseParams);
            break;
        case 'dynamic':
            applyDynamicFlow(audio, setParam, strength, baseParams);
            break;
        case 'strobe':
            applyStrobeMode(audio, setParam, strength, baseParams);
            break;
        case 'glitch':
            applyGlitchMode(audio, setParam, strength, baseParams);
            break;
        case 'build':
            applyBuildMode(audio, setParam, strength, baseParams);
            break;
        case 'breakdown':
            applyBreakdownMode(audio, setParam, strength, baseParams);
            break;
        case 'liquid':
            applyLiquidMode(audio, setParam, strength, baseParams);
            break;
        default:
            applyDynamicFlow(audio, setParam, strength, baseParams);
    }
}

/**
 * CHAOS MODE: Intense, unpredictable, multi-parameter modulation
 * Perfect for drops, heavy sections, EDM breakdowns
 */
export function applyChaosFlow(audio, setParam, strength, baseParams) {
    // Beat-synced chaos bursts
    const chaosBurst = audio.isBeat ? 1.0 : audio.momentum.bass;
    const density = baseParams.gridDensity + (audio.bass * 60 * strength) + (chaosBurst * 20);

    // Rapid hue cycling on high frequencies
    const hueShift = audio.high * 180 * strength + audio.rhythmicPulse * 60;
    const hue = (baseParams.hue + hueShift) % 360;

    // Morphing driven by mid-range with exponential scaling
    const morph = baseParams.morphFactor + (Math.pow(audio.mid, 2) * 1.5 * strength);

    // Chaos parameter maxed out with beat reinforcement
    const chaos = baseParams.chaos + (audio.energy * 0.8 * strength) + (audio.isBeat ? 0.2 : 0);

    // Speed bursts on beats, sustained by energy
    const speed = baseParams.speed * (1 + audio.energy * 2 * strength) * (audio.isBeat ? 1.5 : 1);

    // Intensity pulses with rhythm
    const intensity = Math.min(1, baseParams.intensity * (0.6 + audio.peaks.energy * 0.8 * strength));

    // Saturation follows high-frequency energy
    const saturation = Math.min(1, baseParams.saturation * (0.8 + audio.high * 0.5 * strength));

    // 4D ROTATION CHAOS: Each axis gets independent frequency-driven rotation
    const rot4dXW = baseParams.rot4dXW + (audio.bass * 4 * strength) + (audio.isBeat ? 1.5 : 0);
    const rot4dYW = baseParams.rot4dYW + (audio.mid * 5 * strength) - (audio.lowMid * 2 * strength);
    const rot4dZW = baseParams.rot4dZW + (audio.high * 6 * strength) + (audio.rhythmicPulse * 2);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * PULSE MODE: Rhythmic, beat-locked, pumping motion
 * Perfect for house, techno, hip-hop with strong beats
 */
export function applyPulseFlow(audio, setParam, strength, baseParams) {
    // Density expands/contracts with rhythm
    const pulseFactor = 0.7 + audio.rhythmicPulse * 0.6; // 0.7-1.3 range
    const density = baseParams.gridDensity * pulseFactor + (audio.bass * 40 * strength);

    // Hue locked to beat phase (creates strobing color changes)
    const beatHueShift = Math.floor(audio.beatPhase * 4) * 90; // Snaps to 0, 90, 180, 270
    const hue = (baseParams.hue + beatHueShift + audio.lowMid * 30 * strength) % 360;

    // Morph pulses in sync with tempo
    const morph = baseParams.morphFactor * (0.8 + audio.rhythmicPulse * 0.4);

    // Sharp intensity spikes on beats
    const beatIntensity = audio.isBeat ? 1.0 : (0.6 + audio.momentum.bass * 0.4);
    const intensity = Math.min(1, baseParams.intensity * beatIntensity);

    // Speed modulated by rhythm
    const speed = baseParams.speed * (0.9 + audio.rhythmicPulse * 0.3 * strength);

    // Saturation breathes with mid-range
    const saturation = Math.min(1, baseParams.saturation * (0.85 + audio.mid * 0.3 * strength));

    // 4D ROTATION PULSE: Tempo-locked rotations creating rhythmic 4D tumbling
    const rot4dXW = baseParams.rot4dXW + (audio.rhythmicPulse * 3 * strength);
    const rot4dYW = baseParams.rot4dYW + (Math.sin(audio.beatPhase * Math.PI) * 2 * strength);
    const rot4dZW = baseParams.rot4dZW + (audio.isBeat ? 0.8 : 0) + (audio.bass * 1.5 * strength);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('intensity', intensity);
    setParam('speed', Math.min(3, speed));
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * WAVE MODE: Smooth, flowing, oceanic motion
 * Perfect for ambient, chill, progressive builds
 */
export function applyWaveFlow(audio, setParam, strength, baseParams) {
    // Gentle density waves
    const wavePhase = performance.now() * 0.0003; // Slow wave
    const waveModulation = Math.sin(wavePhase) * 0.3 + Math.sin(wavePhase * 1.7) * 0.2;
    const density = baseParams.gridDensity + (audio.momentum.bass * 25 * strength) + (waveModulation * 15);

    // Smooth hue rotation with audio influence
    const hueWave = Math.sin(wavePhase * 0.8) * 45;
    const hue = (baseParams.hue + hueWave + audio.mid * 20 * strength) % 360;

    // Morph follows energy with momentum smoothing
    const morph = baseParams.morphFactor + (audio.momentum.mid * 0.8 * strength);

    // Chaos creates organic variation
    const chaos = baseParams.chaos + (Math.sin(wavePhase * 2.3) * 0.2 + 0.2) * (audio.energy * strength);

    // Smooth speed variation
    const speed = baseParams.speed * (0.9 + audio.momentum.high * 0.4 * strength);

    // Intensity ebbs and flows
    const intensity = Math.min(1, baseParams.intensity * (0.75 + audio.momentum.mid * 0.4 * strength + Math.sin(wavePhase * 1.5) * 0.15));

    // 4D ROTATION WAVE: Smooth sinusoidal tumbling through 4D space
    const rot4dXW = baseParams.rot4dXW + (Math.sin(wavePhase * 1.2) * 1.5 * strength) + (audio.momentum.bass * 0.5);
    const rot4dYW = baseParams.rot4dYW + (Math.cos(wavePhase * 0.9) * 1.8 * strength) + (audio.momentum.mid * 0.6);
    const rot4dZW = baseParams.rot4dZW + (Math.sin(wavePhase * 1.5 + Math.PI/3) * 1.2 * strength) + (audio.momentum.high * 0.4);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * FLOW MODE: Gentle, meditative, minimal reactivity
 * Perfect for quiet sections, intros, ambient passages
 */
export function applyFlowMode(audio, setParam, strength, baseParams) {
    // Minimal density changes
    const density = baseParams.gridDensity + (audio.bass * 10 * strength);

    // Slow hue drift
    const hue = (baseParams.hue + audio.lowMid * 15 * strength) % 360;

    // Subtle morphing
    const morph = baseParams.morphFactor + (audio.mid * 0.3 * strength);

    // Low chaos for calm visuals
    const chaos = baseParams.chaos * (0.5 + audio.energy * 0.3 * strength);

    // Consistent slow speed
    const speed = baseParams.speed * (0.85 + audio.high * 0.2 * strength);

    // Gentle intensity variation
    const intensity = Math.min(1, baseParams.intensity * (0.8 + audio.energy * 0.25 * strength));

    // High saturation for rich colors
    const saturation = Math.min(1, baseParams.saturation * (0.9 + audio.mid * 0.15 * strength));

    // 4D ROTATION FLOW: Slow, meditative drift through hyperspace
    const flowPhase = performance.now() * 0.0001; // Very slow
    const rot4dXW = baseParams.rot4dXW + (Math.sin(flowPhase) * 0.5 * strength) + (audio.bass * 0.2);
    const rot4dYW = baseParams.rot4dYW + (Math.cos(flowPhase * 1.3) * 0.6 * strength) + (audio.mid * 0.15);
    const rot4dZW = baseParams.rot4dZW + (Math.sin(flowPhase * 0.7) * 0.4 * strength) + (audio.high * 0.1);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * DYNAMIC MODE: Balanced, responsive, musical
 * Automatically balances all parameters based on frequency content
 */
export function applyDynamicFlow(audio, setParam, strength, baseParams) {
    // Bass creates density, mid creates detail
    const density = baseParams.gridDensity + (audio.bass * 35 * strength) + (audio.mid * 15 * strength);

    // Multi-band hue modulation
    const bassHue = audio.bass * 30;
    const midHue = audio.mid * 45;
    const highHue = audio.high * 60;
    const hue = (baseParams.hue + bassHue + midHue + highHue * strength) % 360;

    // Morph responds to mid-range with beat reinforcement
    const morph = baseParams.morphFactor + (audio.mid * 1.0 * strength) + (audio.isBeat ? 0.3 : 0);

    // Chaos from high frequencies and energy variance
    const chaos = baseParams.chaos + (audio.highMid * 0.6 * strength) + (audio.peaks.energy - audio.energy) * 0.3;

    // Speed modulated by rhythm and high energy
    const speed = baseParams.speed * (1 + audio.high * 1.2 * strength) * (audio.isBeat ? 1.2 : 1);

    // Intensity follows overall energy with momentum
    const intensity = Math.min(1, baseParams.intensity * (0.7 + audio.momentum.mid * 0.5 * strength + audio.energy * 0.3));

    // Saturation enhances on high energy
    const saturation = Math.min(1, baseParams.saturation * (0.85 + audio.energy * 0.3 * strength));

    // 4D ROTATION DYNAMIC: Each frequency band controls independent axis
    const rot4dXW = baseParams.rot4dXW + (audio.bass * 2.5 * strength) + (audio.momentum.bass * 1.0);
    const rot4dYW = baseParams.rot4dYW + (audio.mid * 3.0 * strength) + (audio.isBeat ? 0.5 : 0);
    const rot4dZW = baseParams.rot4dZW + (audio.high * 3.5 * strength) + (audio.momentum.high * 0.8);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * STROBE MODE: Rapid flashing, staccato motion
 * Perfect for breakcore, glitch hop, intense moments
 */
export function applyStrobeMode(audio, setParam, strength, baseParams) {
    // Rapid density jumps creating visual stutter
    const strobePhase = Math.floor(performance.now() / 100) % 2; // 10Hz strobe
    const beatStrobe = audio.isBeat ? 1.5 : strobePhase;
    const density = baseParams.gridDensity + (audio.bass * 50 * strength * beatStrobe);

    // Hue jumps in discrete steps
    const strobeHue = Math.floor(audio.beatPhase * 8) * 45; // 8 discrete hues
    const hue = (baseParams.hue + strobeHue + audio.high * 90 * strength) % 360;

    // Morph snaps between extremes
    const morphSnap = audio.isBeat ? 2.0 : (strobePhase ? 1.5 : 0.5);
    const morph = morphSnap * strength;

    // Chaos toggling
    const chaos = strobePhase ? (baseParams.chaos + 0.5 * strength) : baseParams.chaos;

    // Speed spikes
    const speed = baseParams.speed * (1 + audio.isBeat ? 2.0 : (strobePhase * 1.5 * strength));

    // Intensity flashes
    const intensity = strobePhase ? (baseParams.intensity + audio.bass * strength) : (baseParams.intensity * 0.3);

    // Saturation pulses
    const saturation = Math.min(1, strobePhase ? 1.0 : 0.5);

    // 4D ROTATION STROBE: Discrete rotation jumps
    const rot4dXW = baseParams.rot4dXW + (strobePhase ? (audio.bass * 4 * strength) : 0);
    const rot4dYW = baseParams.rot4dYW + (audio.isBeat ? 2.0 : (strobePhase * 1.5 * strength));
    const rot4dZW = baseParams.rot4dZW + (audio.high * 5 * strength * strobePhase);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', Math.min(1, intensity));
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * GLITCH MODE: Digital corruption, error aesthetics
 * Perfect for experimental, noise, industrial
 */
export function applyGlitchMode(audio, setParam, strength, baseParams) {
    // Random glitch triggers based on high-frequency content
    const glitchTrigger = audio.high > 0.7 || (Math.random() < 0.05);

    // Density glitches - sudden extreme changes
    const densityGlitch = glitchTrigger ? (Math.random() * 80 - 40) : 0;
    const density = baseParams.gridDensity + (audio.mid * 30 * strength) + densityGlitch;

    // Hue corruption - random color shifts
    const hueGlitch = glitchTrigger ? (Math.random() * 360) : 0;
    const hue = (baseParams.hue + audio.bass * 45 + hueGlitch) % 360;

    // Morph stuttering
    const morphGlitch = glitchTrigger ? (Math.random() * 1.5) : (audio.mid * strength);
    const morph = baseParams.morphFactor + morphGlitch;

    // Chaos spikes
    const chaos = baseParams.chaos + (audio.highMid * 0.8 * strength) + (glitchTrigger ? 0.4 : 0);

    // Speed corruption
    const speedGlitch = glitchTrigger ? (Math.random() * 2) : 1;
    const speed = baseParams.speed * speedGlitch * (1 + audio.energy * strength);

    // Intensity errors - sudden drops and spikes
    const intensityGlitch = glitchTrigger ? (Math.random() < 0.5 ? 0.1 : 1.0) : (0.7 + audio.momentum.bass * 0.4);
    const intensity = Math.min(1, baseParams.intensity * intensityGlitch);

    // Saturation corruption
    const saturation = glitchTrigger ? (Math.random()) : (baseParams.saturation * (0.8 + audio.mid * 0.3));

    // 4D ROTATION GLITCH: Random axis jumps
    const rot4dXW = baseParams.rot4dXW + (glitchTrigger ? (Math.random() * 6 - 3) : (audio.bass * 2 * strength));
    const rot4dYW = baseParams.rot4dYW + (glitchTrigger ? (Math.random() * 6 - 3) : (audio.mid * 2.5 * strength));
    const rot4dZW = baseParams.rot4dZW + (glitchTrigger ? (Math.random() * 6 - 3) : (audio.high * 3 * strength));

    setParam('gridDensity', Math.floor(Math.max(5, Math.min(100, density))));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, Math.max(0, morph)));
    setParam('chaos', Math.min(1, Math.max(0, chaos)));
    setParam('speed', Math.min(3, Math.max(0.1, speed)));
    setParam('intensity', Math.min(1, Math.max(0, intensity)));
    setParam('saturation', Math.min(1, Math.max(0, saturation)));
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * BUILD MODE: Progressive escalation, rising tension
 * Perfect for buildups, crescendos, rising energy sections
 */
export function applyBuildMode(audio, setParam, strength, baseParams) {
    // Track energy accumulation over time
    const buildPhase = (performance.now() % 30000) / 30000; // 30 second cycle

    // Density grows progressively
    const buildFactor = Math.pow(buildPhase, 1.5); // Exponential growth
    const density = baseParams.gridDensity + (buildFactor * 40) + (audio.bass * 30 * strength);

    // Hue shifts progressively through spectrum
    const hue = (baseParams.hue + buildPhase * 180 + audio.mid * 20 * strength) % 360;

    // Morph increases with build
    const morph = baseParams.morphFactor + (buildFactor * 1.2) + (audio.momentum.mid * 0.5 * strength);

    // Chaos rises
    const chaos = baseParams.chaos + (buildFactor * 0.6) + (audio.energy * 0.3 * strength);

    // Speed accelerates
    const speed = baseParams.speed * (1 + buildFactor * 1.5) * (1 + audio.high * 0.5 * strength);

    // Intensity builds
    const intensity = Math.min(1, baseParams.intensity * (0.5 + buildFactor * 0.7) + audio.energy * 0.3);

    // Saturation intensifies
    const saturation = Math.min(1, baseParams.saturation * (0.7 + buildFactor * 0.4));

    // 4D ROTATION BUILD: Progressive acceleration
    const rot4dXW = baseParams.rot4dXW + (buildFactor * 2 * strength) + (audio.bass * 1.5);
    const rot4dYW = baseParams.rot4dYW + (buildFactor * 2.5 * strength) + (audio.mid * 2);
    const rot4dZW = baseParams.rot4dZW + (buildFactor * 3 * strength) + (audio.high * 2.5);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * BREAKDOWN MODE: Energy release, sparse motion
 * Perfect for drops that strip back, minimal sections after buildups
 */
export function applyBreakdownMode(audio, setParam, strength, baseParams) {
    // Minimal density - emphasis on space
    const density = Math.max(5, baseParams.gridDensity * 0.5 + audio.bass * 15 * strength);

    // Hue simplicity - less modulation
    const hue = (baseParams.hue + audio.lowMid * 10 * strength) % 360;

    // Minimal morph
    const morph = baseParams.morphFactor * 0.6 + (audio.momentum.bass * 0.3 * strength);

    // Low chaos for clarity
    const chaos = baseParams.chaos * 0.3 + (audio.mid * 0.2 * strength);

    // Slow, deliberate speed
    const speed = baseParams.speed * (0.6 + audio.momentum.mid * 0.3 * strength);

    // Reduced intensity - breathing room
    const intensity = Math.min(1, baseParams.intensity * (0.5 + audio.energy * 0.4 * strength));

    // Rich saturation despite minimal motion
    const saturation = Math.min(1, baseParams.saturation * (0.9 + audio.mid * 0.15 * strength));

    // 4D ROTATION BREAKDOWN: Sparse, impactful movements
    const rot4dXW = baseParams.rot4dXW + (audio.isBeat ? (audio.bass * 2 * strength) : 0);
    const rot4dYW = baseParams.rot4dYW + (audio.momentum.bass * 0.5 * strength);
    const rot4dZW = baseParams.rot4dZW + (audio.momentum.mid * 0.6 * strength);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}

/**
 * LIQUID MODE: Fluid, organic, viscous motion
 * Perfect for downtempo, trip-hop, psychedelic sections
 */
export function applyLiquidMode(audio, setParam, strength, baseParams) {
    // Liquid phase - slow, organic undulation
    const liquidPhase = performance.now() * 0.0002;
    const liquidFlow = Math.sin(liquidPhase) * Math.cos(liquidPhase * 1.7);

    // Density flows like thick liquid
    const density = baseParams.gridDensity + (audio.momentum.bass * 30 * strength) + (liquidFlow * 12);

    // Hue shifts like oil on water
    const hueFlow = Math.sin(liquidPhase * 1.3) * 35 + Math.cos(liquidPhase * 0.7) * 25;
    const hue = (baseParams.hue + hueFlow + audio.mid * 15 * strength) % 360;

    // Viscous morphing
    const morph = baseParams.morphFactor + (liquidFlow * 0.4) + (audio.momentum.mid * 0.7 * strength);

    // Organic chaos
    const chaos = baseParams.chaos + (Math.abs(liquidFlow) * 0.3) + (audio.momentum.high * 0.4 * strength);

    // Flowing speed variation
    const speed = baseParams.speed * (0.85 + Math.abs(liquidFlow) * 0.3) * (1 + audio.momentum.bass * 0.3 * strength);

    // Gentle intensity waves
    const intensity = Math.min(1, baseParams.intensity * (0.7 + audio.momentum.mid * 0.4 * strength + liquidFlow * 0.2));

    // Rich, saturated colors
    const saturation = Math.min(1, baseParams.saturation * (0.9 + audio.mid * 0.2 * strength));

    // 4D ROTATION LIQUID: Smooth, flowing tumbles
    const rot4dXW = baseParams.rot4dXW + (Math.sin(liquidPhase * 1.1) * 1.2 * strength) + (audio.momentum.bass * 0.6);
    const rot4dYW = baseParams.rot4dYW + (Math.cos(liquidPhase * 0.9) * 1.5 * strength) + (audio.momentum.mid * 0.7);
    const rot4dZW = baseParams.rot4dZW + (Math.sin(liquidPhase * 1.4 + Math.PI/4) * 1.0 * strength) + (audio.momentum.high * 0.5);

    setParam('gridDensity', Math.floor(density));
    setParam('hue', Math.floor(hue));
    setParam('morphFactor', Math.min(2, morph));
    setParam('chaos', Math.min(1, chaos));
    setParam('speed', Math.min(3, speed));
    setParam('intensity', intensity);
    setParam('saturation', saturation);
    setParam('rot4dXW', Math.max(-6.28, Math.min(6.28, rot4dXW)));
    setParam('rot4dYW', Math.max(-6.28, Math.min(6.28, rot4dYW)));
    setParam('rot4dZW', Math.max(-6.28, Math.min(6.28, rot4dZW)));
}
