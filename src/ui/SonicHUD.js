export class SonicHUD {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.root = document.getElementById('sonic-hud');
        this.bars = {};
        this.assignments = {};
        this.padDisplays = {};
        this.modeEl = null;
        this.holdIndicators = {};
        this.energyEl = null;
        this.provenanceEls = {};
        this.init();
    }

    init() {
        if (!this.root) {
            console.warn('⚠️ SonicHUD element not found');
            return;
        }

        this.modeEl = this.root.querySelector('[data-hud="mode"]');
        this.energyEl = this.root.querySelector('[data-hud="intensity"]');

        ['bass', 'mid', 'high', 'energy'].forEach(channel => {
            const bar = this.root.querySelector(`[data-channel="${channel}"] span`);
            if (bar) {
                this.bars[channel] = bar;
            }
        });

        this.assignments.controllerX = this.root.querySelector('[data-assignment="controller-x"]');
        this.assignments.controllerY = this.root.querySelector('[data-assignment="controller-y"]');
        this.assignments.canvasX = this.root.querySelector('[data-assignment="canvas-x"]');
        this.assignments.canvasY = this.root.querySelector('[data-assignment="canvas-y"]');

        this.padDisplays.controller = this.root.querySelector('[data-pad="controller"]');
        this.padDisplays.canvas = this.root.querySelector('[data-pad="canvas"]');

        this.holdIndicators.canvas = this.root.querySelector('[data-hold="canvas"]');
        this.holdIndicators.controller = this.root.querySelector('[data-hold="controller"]');

        this.provenanceEls = {
            label: this.root.querySelector('[data-hud="mood-label"]'),
            prompt: this.root.querySelector('[data-hud="prompt"]'),
            source: this.root.querySelector('[data-hud="source"]'),
            timestamp: this.root.querySelector('[data-hud="timestamp"]'),
            delta: this.root.querySelector('[data-hud="delta"]'),
            energy: this.root.querySelector('[data-hud="mood-energy"]')
        };
    }

    update(frame) {
        if (!this.root || !frame) return;

        const { audio, surfaces, assignments, finalParams } = frame;

        if (this.modeEl) {
            this.modeEl.textContent = this.choreographer.choreographyMode.toUpperCase();
        }

        if (this.energyEl && finalParams?.intensity !== undefined) {
            this.energyEl.textContent = `${(finalParams.intensity * 100).toFixed(0)}%`;
        }

        Object.entries(this.bars).forEach(([channel, el]) => {
            const value = (audio && audio[channel]) ? audio[channel] : 0;
            el.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
        });

        if (this.padDisplays.controller && surfaces?.controller) {
            const { position, hold } = surfaces.controller;
            this.padDisplays.controller.textContent = `${Math.round(position.x * 100)}%, ${Math.round(position.y * 100)}%`;
            if (this.holdIndicators.controller) {
                this.holdIndicators.controller.textContent = hold ? 'HOLD' : 'LIVE';
                this.holdIndicators.controller.classList.toggle('is-active', hold);
            }
        }

        if (this.padDisplays.canvas && surfaces?.canvas) {
            const { position, hold } = surfaces.canvas;
            this.padDisplays.canvas.textContent = `${Math.round(position.x * 100)}%, ${Math.round(position.y * 100)}%`;
            if (this.holdIndicators.canvas) {
                this.holdIndicators.canvas.textContent = hold ? 'HOLD' : 'LIVE';
                this.holdIndicators.canvas.classList.toggle('is-active', hold);
            }
        }

        if (assignments) {
            const controllerX = Array.isArray(assignments.controller?.x)
                ? assignments.controller.x.join(', ')
                : assignments.controller?.x;
            const controllerY = Array.isArray(assignments.controller?.y)
                ? assignments.controller.y.join(', ')
                : assignments.controller?.y;
            const canvasX = Array.isArray(assignments.canvas?.x)
                ? assignments.canvas.x.join(', ')
                : assignments.canvas?.x;
            const canvasY = Array.isArray(assignments.canvas?.y)
                ? assignments.canvas.y.join(', ')
                : assignments.canvas?.y;

            if (this.assignments.controllerX) this.assignments.controllerX.textContent = controllerX || '—';
            if (this.assignments.controllerY) this.assignments.controllerY.textContent = controllerY || '—';
            if (this.assignments.canvasX) this.assignments.canvasX.textContent = canvasX || '—';
            if (this.assignments.canvasY) this.assignments.canvasY.textContent = canvasY || '—';
        }

        if (surfaces?.canvas) {
            document.body.classList.toggle('canvas-pad-hold', !!surfaces.canvas.hold);
        }
    }

    updateMoodProvenance({ label, prompt, source, timestamp, energy, deltas } = {}) {
        if (!this.root) return;

        if (this.provenanceEls.label) {
            this.provenanceEls.label.textContent = label || 'Custom Sculpt';
        }

        if (this.provenanceEls.prompt) {
            this.provenanceEls.prompt.textContent = prompt ? `“${prompt}”` : 'Promptless mood';
        }

        if (this.provenanceEls.source) {
            const displaySource = source ? source.replace(/[-_]/g, ' ') : 'manual';
            this.provenanceEls.source.textContent = displaySource;
        }

        if (this.provenanceEls.timestamp) {
            if (timestamp) {
                const date = new Date(timestamp);
                const text = Number.isNaN(date.getTime())
                    ? '--:--'
                    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                this.provenanceEls.timestamp.textContent = text;
                this.provenanceEls.timestamp.dateTime = Number.isNaN(date.getTime()) ? '' : date.toISOString();
            } else {
                this.provenanceEls.timestamp.textContent = '--:--';
                this.provenanceEls.timestamp.dateTime = '';
            }
        }

        if (this.provenanceEls.energy) {
            if (typeof energy === 'number') {
                this.provenanceEls.energy.textContent = `${Math.round(energy * 100)}%`;
            } else {
                this.provenanceEls.energy.textContent = '—';
            }
        }

        if (this.provenanceEls.delta) {
            this.provenanceEls.delta.textContent = this.formatDeltaSummary(deltas);
        }
    }

    formatDeltaSummary(deltas = {}) {
        if (!deltas || typeof deltas !== 'object') {
            return 'Δ —';
        }

        const entries = Object.entries(deltas)
            .filter(([, info]) => info && Number.isFinite(info.delta) && Math.abs(info.delta) > 1e-3)
            .sort((a, b) => Math.abs(b[1].delta) - Math.abs(a[1].delta))
            .slice(0, 2);

        if (!entries.length) {
            return 'Δ subtle';
        }

        const unit = (param) => (param.toLowerCase().includes('hue') ? '°' : '');
        const formatParam = (param) => param
            .replace(/([A-Z])/g, ' $1')
            .replace(/^rot4d/, 'rot4d ')
            .trim();

        return entries
            .map(([param, info]) => {
                const magnitude = Math.abs(info.delta);
                const decimals = magnitude >= 10 ? 0 : magnitude >= 1 ? 1 : 2;
                const formatted = info.delta.toFixed(decimals);
                return `${formatParam(param)} ${info.delta > 0 ? '+' : ''}${formatted}${unit(param)}`;
            })
            .join(' · ');
    }
}
