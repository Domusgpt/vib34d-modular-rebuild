/**
 * Parameter Sweep Functions
 * Algorithmic parameter animations over time
 */

export function applyParameterSweeps(sweeps, progress, duration, setParameterFn) {
    Object.entries(sweeps).forEach(([param, sweep]) => {
        let value = 0;
        const phase = progress * 2 * Math.PI; // 0 to 2π over sequence duration

        switch (sweep.function) {
            case 'sine-wave':
                value = sweep.offset + sweep.amplitude * Math.sin(phase * (sweep.frequency || 1));
                break;
            case 'sawtooth':
                const sawPhase = (progress * (sweep.frequency || 1)) % 1;
                value = sweep.min + (sweep.max - sweep.min) * sawPhase;
                break;
            case 'triangle':
                const triPhase = (progress * (sweep.frequency || 1)) % 1;
                value = sweep.min + (sweep.max - sweep.min) * (triPhase < 0.5 ? triPhase * 2 : (1 - triPhase) * 2);
                break;
            case 'pulse-train':
                value = Math.sin(phase * (sweep.frequency || 4)) > 0 ? sweep.max : sweep.min;
                break;
            case 'exponential-decay':
                value = sweep.max - (sweep.max - sweep.min) * (1 - Math.exp(-progress * 3));
                break;
            case 'linear-sweep':
                value = sweep.min + (sweep.max - sweep.min) * progress;
                break;
            default:
                value = sweep.offset || 0;
        }

        setParameterFn(param, value);
    });
}

/**
 * Create a sine wave sweep
 */
export function createSineWaveSweep(param, { min = 0, max = 1, frequency = 1, offset = 0.5, amplitude = 0.5 }) {
    return {
        [param]: {
            function: 'sine-wave',
            offset,
            amplitude,
            frequency
        }
    };
}

/**
 * Create a linear sweep
 */
export function createLinearSweep(param, { min = 0, max = 1 }) {
    return {
        [param]: {
            function: 'linear-sweep',
            min,
            max
        }
    };
}

/**
 * Create a pulse train sweep
 */
export function createPulseTrainSweep(param, { min = 0, max = 1, frequency = 4 }) {
    return {
        [param]: {
            function: 'pulse-train',
            min,
            max,
            frequency
        }
    };
}
