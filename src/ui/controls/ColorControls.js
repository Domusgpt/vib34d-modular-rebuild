/**
 * ColorControls.js - Advanced Color Control UI
 * 40+ palettes + gradient editor + audio-reactive colors
 *
 * A Paul Phillips Manifestation
 */

import { ColorPaletteManager } from '../../colors/ColorPaletteManager.js';

export class ColorControls {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.paletteManager = new ColorPaletteManager();
        this.currentFilter = 'all'; // all, tag, mood

        this.init();
    }

    init() {
        this.createColorControls();
        this.setupEventListeners();
        console.log('✅ ColorControls initialized (40 palettes)');
    }

    createColorControls() {
        const container = document.getElementById('control-panel');
        if (!container) {
            console.warn('⚠️ Control panel not found');
            return;
        }

        const colorGroup = document.createElement('div');
        colorGroup.className = 'control-group color-controls';
        colorGroup.id = 'color-controls-section';
        colorGroup.innerHTML = `
            <label>🎨 COLOR PALETTE SYSTEM</label>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Current Palette</label>
                <select id="color-palette-select" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                    ${this.createPaletteOptions()}
                </select>
            </div>

            <div id="color-preview" style="margin-bottom: 10px; height: 40px; border-radius: 5px; border: 1px solid rgba(0,255,255,0.3); display: flex; overflow: hidden;">
                <!-- Color swatches will be inserted here -->
            </div>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Search Palettes</label>
                <input type="text" id="color-search" placeholder="Type to search..."
                    style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
            </div>

            <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                <div style="flex: 1;">
                    <label style="font-size: 9px; opacity: 0.7;">Filter by Tag</label>
                    <select id="color-tag-filter" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="all">All Tags</option>
                        ${this.createTagOptions()}
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 9px; opacity: 0.7;">Filter by Mood</label>
                    <select id="color-mood-filter" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                        <option value="all">All Moods</option>
                        ${this.createMoodOptions()}
                    </select>
                </div>
            </div>

            <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                <button id="color-random" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">🎲 Random</button>
                <button id="color-random-filtered" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">🎯 Random Filtered</button>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Color Parameters</label>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Hue: <span id="color-hue-val">180</span>°</label>
                    <input type="range" id="color-hue" min="0" max="360" step="1" value="180" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Saturation: <span id="color-sat-val">0.7</span></label>
                    <input type="range" id="color-saturation" min="0" max="1" step="0.01" value="0.7" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Brightness: <span id="color-bright-val">0.8</span></label>
                    <input type="range" id="color-brightness" min="0" max="1" step="0.01" value="0.8" style="width: 100%;">
                </div>

                <div style="margin-top: 5px;">
                    <label style="font-size: 9px;">Intensity: <span id="color-intensity-val">0.7</span></label>
                    <input type="range" id="color-intensity" min="0" max="1" step="0.01" value="0.7" style="width: 100%;">
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Gradient Settings</label>

                <div style="margin-top: 5px;">
                    <input type="checkbox" id="color-gradient-enable" style="margin-right: 5px;">
                    <label for="color-gradient-enable" style="font-size: 10px; display: inline;">Enable Gradient</label>
                </div>

                <div id="color-gradient-controls" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); border-radius: 3px;">
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 9px;">Gradient Speed: <span id="color-gradient-speed-val">1.0</span></label>
                        <input type="range" id="color-gradient-speed" min="0.1" max="5" step="0.1" value="1.0" style="width: 100%;">
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 9px;">Gradient Mode</label>
                        <select id="color-gradient-mode" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                            <option value="angular">Angular</option>
                            <option value="spiral">Spiral</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <input type="checkbox" id="color-gradient-cycle" checked style="margin-right: 5px;">
                        <label for="color-gradient-cycle" style="font-size: 10px; display: inline;">Auto-Cycle</label>
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Audio Reactivity</label>

                <div style="margin-top: 5px;">
                    <input type="checkbox" id="color-audio-reactive" style="margin-right: 5px;">
                    <label for="color-audio-reactive" style="font-size: 10px; display: inline;">Audio-Reactive Colors</label>
                </div>

                <div id="color-audio-controls" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); border-radius: 3px;">
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 9px;">Mapping Mode</label>
                        <select id="color-audio-mapping" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                            <option value="hue-shift">Hue Shift (Frequency)</option>
                            <option value="palette-cycle">Palette Cycle</option>
                            <option value="intensity-brightness">Intensity to Brightness</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 9px;">Reactivity: <span id="color-audio-react-val">0.5</span></label>
                        <input type="range" id="color-audio-reactivity" min="0" max="1" step="0.01" value="0.5" style="width: 100%;">
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Custom Palettes</label>

                <div style="margin-top: 5px; margin-bottom: 10px;">
                    <button id="color-save-custom" style="width: 100%; padding: 8px; background: rgba(0,255,0,0.2); border: 1px solid #0f0; color: #0f0; font-size: 10px; cursor: pointer; font-weight: bold;">
                        💾 SAVE CURRENT AS CUSTOM
                    </button>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Custom Palette Name</label>
                    <input type="text" id="color-custom-name" placeholder="e.g., My Custom Palette"
                        style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                </div>

                <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                    <button id="color-export" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">📤 Export</button>
                    <button id="color-import" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">📥 Import</button>
                </div>
                <input type="file" id="color-import-file" accept=".json" style="display: none;">
            </div>

            <div style="margin-top: 10px; font-size: 8px; opacity: 0.5; text-align: center;">
                40 Palettes | 5 Categories | Audio-Reactive
            </div>
        `;

        // Insert near top of control panel
        const firstGroup = container.querySelector('.control-group');
        if (firstGroup) {
            firstGroup.before(colorGroup);
        } else {
            container.appendChild(colorGroup);
        }

        this.updateColorPreview();
        console.log('✅ ColorControls UI created');
    }

    createPaletteOptions() {
        return this.paletteManager.getPaletteNames().map(name => {
            const selected = name === this.paletteManager.currentPalette ? 'selected' : '';
            return `<option value="${name}" ${selected}>${name}</option>`;
        }).join('');
    }

    createTagOptions() {
        return this.paletteManager.getAllTags().map(tag =>
            `<option value="${tag}">${tag}</option>`
        ).join('');
    }

    createMoodOptions() {
        return this.paletteManager.getAllMoods().map(mood =>
            `<option value="${mood}">${mood}</option>`
        ).join('');
    }

    setupEventListeners() {
        // Palette selection
        const paletteSelect = document.getElementById('color-palette-select');
        if (paletteSelect) {
            paletteSelect.addEventListener('change', (e) => {
                this.paletteManager.currentPalette = e.target.value;
                this.updateColorPreview();
                this.applyPalette();
            });
        }

        // Search
        const searchInput = document.getElementById('color-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
        }

        // Tag filter
        const tagFilter = document.getElementById('color-tag-filter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                this.filterByTag(e.target.value);
            });
        }

        // Mood filter
        const moodFilter = document.getElementById('color-mood-filter');
        if (moodFilter) {
            moodFilter.addEventListener('change', (e) => {
                this.filterByMood(e.target.value);
            });
        }

        // Random buttons
        const randomBtn = document.getElementById('color-random');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                const names = this.paletteManager.getPaletteNames();
                const random = names[Math.floor(Math.random() * names.length)];
                this.selectPalette(random);
            });
        }

        const randomFilteredBtn = document.getElementById('color-random-filtered');
        if (randomFilteredBtn) {
            randomFilteredBtn.addEventListener('click', () => {
                this.selectRandomFiltered();
            });
        }

        // Color parameters
        this.setupColorParameter('hue', 'color-hue', 'color-hue-val', (v) => `${v}°`);
        this.setupColorParameter('saturation', 'color-saturation', 'color-sat-val', (v) => v.toFixed(2));
        this.setupColorParameter('brightness', 'color-brightness', 'color-bright-val', (v) => v.toFixed(2));
        this.setupColorParameter('intensity', 'color-intensity', 'color-intensity-val', (v) => v.toFixed(2));

        // Gradient controls
        const gradientEnable = document.getElementById('color-gradient-enable');
        const gradientControls = document.getElementById('color-gradient-controls');
        if (gradientEnable && gradientControls) {
            gradientEnable.addEventListener('change', (e) => {
                gradientControls.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Audio reactive
        const audioReactive = document.getElementById('color-audio-reactive');
        const audioControls = document.getElementById('color-audio-controls');
        if (audioReactive && audioControls) {
            audioReactive.addEventListener('change', (e) => {
                this.paletteManager.audioReactive = e.target.checked;
                audioControls.style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Audio mapping
        const audioMapping = document.getElementById('color-audio-mapping');
        if (audioMapping) {
            audioMapping.addEventListener('change', (e) => {
                this.paletteManager.audioColorMapping = e.target.value;
            });
        }

        // Save custom
        const saveCustomBtn = document.getElementById('color-save-custom');
        const customNameInput = document.getElementById('color-custom-name');
        if (saveCustomBtn && customNameInput) {
            saveCustomBtn.addEventListener('click', () => {
                const name = customNameInput.value.trim() || 'Custom Palette ' + (this.paletteManager.customPalettes.length + 1);
                const palette = this.paletteManager.getPalette(this.paletteManager.currentPalette);
                this.paletteManager.saveCustomPalette(name, palette.colors, 'User-created palette', ['custom']);
                this.showToast(`✅ Saved "${name}"`);
                customNameInput.value = '';
            });
        }

        console.log('✅ ColorControls event listeners setup');
    }

    setupColorParameter(param, sliderId, valueId, formatFn) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = formatFn(value);
                this.choreographer.setParameter(param, value);
            });
        }
    }

    updateColorPreview() {
        const preview = document.getElementById('color-preview');
        if (!preview) return;

        const palette = this.paletteManager.getPalette(this.paletteManager.currentPalette);
        preview.innerHTML = palette.colors.map(color =>
            `<div style="flex: 1; background: ${color}; transition: all 0.3s;"></div>`
        ).join('');
    }

    applyPalette() {
        const palette = this.paletteManager.getPalette(this.paletteManager.currentPalette);
        // Apply first color as base hue
        const rgb = this.paletteManager.hexToRgb(palette.colors[0]);
        const hue = this.rgbToHue(rgb.r, rgb.g, rgb.b);
        this.choreographer.setParameter('hue', hue);

        console.log(`🎨 Applied palette: ${this.paletteManager.currentPalette}`);
    }

    rgbToHue(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        if (delta === 0) return 0;

        let hue;
        if (max === r) {
            hue = ((g - b) / delta) % 6;
        } else if (max === g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }

        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
        return hue;
    }

    selectPalette(name) {
        this.paletteManager.currentPalette = name;
        const select = document.getElementById('color-palette-select');
        if (select) select.value = name;
        this.updateColorPreview();
        this.applyPalette();
    }

    filterByTag(tag) {
        if (tag === 'all') {
            this.repopulatePaletteList(this.paletteManager.getPaletteNames());
        } else {
            const filtered = this.paletteManager.getPalettesByTag(tag);
            this.repopulatePaletteList(filtered.map(p => p.name));
        }
    }

    filterByMood(mood) {
        if (mood === 'all') {
            this.repopulatePaletteList(this.paletteManager.getPaletteNames());
        } else {
            const filtered = this.paletteManager.getPalettesByMood(mood);
            this.repopulatePaletteList(filtered.map(p => p.name));
        }
    }

    performSearch(query) {
        if (query.length < 2) {
            this.repopulatePaletteList(this.paletteManager.getPaletteNames());
            return;
        }

        const results = this.paletteManager.searchPalettes(query);
        this.repopulatePaletteList(results.map(p => p.name));
    }

    repopulatePaletteList(names) {
        const select = document.getElementById('color-palette-select');
        if (!select) return;

        select.innerHTML = names.map(name =>
            `<option value="${name}">${name}</option>`
        ).join('');

        if (names.length > 0) {
            this.selectPalette(names[0]);
        }
    }

    selectRandomFiltered() {
        const select = document.getElementById('color-palette-select');
        if (!select) return;

        const options = Array.from(select.options).map(opt => opt.value);
        if (options.length > 0) {
            const random = options[Math.floor(Math.random() * options.length)];
            this.selectPalette(random);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,255,255,0.9);
            color: #000;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            font-size: 12px;
            box-shadow: 0 0 20px rgba(0,255,255,0.5);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Public API
    setPalette(name) {
        this.selectPalette(name);
    }

    getCurrentPalette() {
        return this.paletteManager.currentPalette;
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 */
