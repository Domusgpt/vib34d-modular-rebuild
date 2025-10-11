/**
 * VariationControls.js - 200 Variation Management UI
 * 60 Default + 140 Custom Variations with Categories
 *
 * A Paul Phillips Manifestation
 */

import { VariationManager } from '../../variations/VariationManager.js';

export class VariationControls {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.variationManager = new VariationManager(choreographer);
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.showCustomOnly = false;

        this.init();
    }

    init() {
        this.createVariationControls();
        this.setupEventListeners();
        console.log('✅ VariationControls initialized (200 variations)');
    }

    createVariationControls() {
        const container = document.getElementById('control-panel');
        if (!container) {
            console.warn('⚠️ Control panel not found');
            return;
        }

        const variationGroup = document.createElement('div');
        variationGroup.className = 'control-group variation-controls';
        variationGroup.id = 'variation-controls-section';
        variationGroup.innerHTML = `
            <label>🎨 VARIATION SYSTEM 2.0</label>

            <div style="margin-bottom: 10px; display: flex; gap: 5px; align-items: center;">
                <button id="var-prev" style="flex: 1; padding: 8px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 14px; cursor: pointer;">◀</button>
                <div id="var-current-display" style="flex: 3; padding: 8px; background: rgba(0,255,255,0.2); border: 1px solid #0ff; color: #0ff; text-align: center; font-size: 10px; font-weight: bold;">
                    VAR 0: ${this.variationManager.getVariationName(0)}
                </div>
                <button id="var-next" style="flex: 1; padding: 8px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 14px; cursor: pointer;">▶</button>
            </div>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Quick Jump</label>
                <input type="number" id="var-jump-input" min="0" max="199" value="0"
                    style="width: calc(100% - 70px); padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                <button id="var-jump-btn" style="width: 60px; padding: 5px; background: rgba(0,255,255,0.2); border: 1px solid #0ff; color: #0ff; font-size: 10px; cursor: pointer; margin-left: 5px;">GO</button>
            </div>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Search Variations</label>
                <input type="text" id="var-search" placeholder="Type to search..."
                    style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
            </div>

            <div style="margin-bottom: 10px;">
                <label style="font-size: 9px; opacity: 0.7;">Category Filter</label>
                <select id="var-category" style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                    <option value="all">All Variations (200)</option>
                    <option value="minimal">Minimal (22)</option>
                    <option value="balanced">Balanced (22)</option>
                    <option value="intense">Intense (4)</option>
                    <option value="extreme">Extreme (4)</option>
                    <option value="genre">Genre Presets (8)</option>
                    <option value="mood">Mood Presets (8)</option>
                    <option value="custom">Custom Only (0-140)</option>
                </select>
            </div>

            <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                <button id="var-random" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">🎲 Random</button>
                <button id="var-random-cat" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">🎯 Random Cat</button>
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Custom Variations</label>

                <div style="margin-top: 5px; margin-bottom: 10px;">
                    <button id="var-save-current" style="width: 100%; padding: 8px; background: rgba(0,255,0,0.2); border: 1px solid #0f0; color: #0f0; font-size: 10px; cursor: pointer; font-weight: bold;">
                        💾 SAVE CURRENT AS CUSTOM
                    </button>
                </div>

                <div style="margin-bottom: 10px;">
                    <label style="font-size: 9px;">Custom Name (Optional)</label>
                    <input type="text" id="var-custom-name" placeholder="e.g., My Epic Variation"
                        style="width: 100%; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 10px;">
                </div>

                <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                    <button id="var-delete-current" style="flex: 1; padding: 5px; background: rgba(255,0,0,0.1); border: 1px solid #f00; color: #f00; font-size: 9px; cursor: pointer;">🗑️ Delete</button>
                    <button id="var-clear-all" style="flex: 1; padding: 5px; background: rgba(255,0,0,0.1); border: 1px solid #f00; color: #f00; font-size: 9px; cursor: pointer;">⚠️ Clear All</button>
                </div>

                <div style="margin-bottom: 10px; display: flex; gap: 5px;">
                    <button id="var-export" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">📤 Export</button>
                    <button id="var-import" style="flex: 1; padding: 5px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; color: #0ff; font-size: 9px; cursor: pointer;">📥 Import</button>
                </div>
                <input type="file" id="var-import-file" accept=".json" style="display: none;">
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0,255,255,0.2);">
                <label style="font-size: 9px; opacity: 0.7;">Statistics</label>
                <div id="var-stats" style="margin-top: 5px; font-size: 8px; opacity: 0.6; line-height: 1.4;">
                    Loading statistics...
                </div>
            </div>

            <div id="var-search-results" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,255,255,0.1); border: 1px solid #0ff; max-height: 200px; overflow-y: auto;">
                <label style="font-size: 9px; opacity: 0.7; margin-bottom: 5px; display: block;">Search Results:</label>
                <div id="var-results-list" style="font-size: 9px;"></div>
            </div>

            <div style="margin-top: 10px; font-size: 8px; opacity: 0.5; text-align: center;">
                200 Total Variations | 60 Default + 140 Custom
            </div>
        `;

        // Insert at top of control panel
        const firstGroup = container.querySelector('.control-group');
        if (firstGroup) {
            firstGroup.before(variationGroup);
        } else {
            container.appendChild(variationGroup);
        }

        this.updateStatistics();
        console.log('✅ VariationControls UI created');
    }

    setupEventListeners() {
        // Previous variation
        const prevBtn = document.getElementById('var-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const prev = this.variationManager.getPreviousVariation();
                this.applyAndUpdate(prev);
            });
        }

        // Next variation
        const nextBtn = document.getElementById('var-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const next = this.variationManager.getNextVariation();
                this.applyAndUpdate(next);
            });
        }

        // Quick jump
        const jumpBtn = document.getElementById('var-jump-btn');
        const jumpInput = document.getElementById('var-jump-input');
        if (jumpBtn && jumpInput) {
            jumpBtn.addEventListener('click', () => {
                const index = parseInt(jumpInput.value);
                if (index >= 0 && index < 200) {
                    this.applyAndUpdate(index);
                }
            });
            jumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') jumpBtn.click();
            });
        }

        // Search
        const searchInput = document.getElementById('var-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.performSearch();
            });
        }

        // Category filter
        const categorySelect = document.getElementById('var-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.updateCategoryDisplay();
            });
        }

        // Random variation
        const randomBtn = document.getElementById('var-random');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                const random = Math.floor(Math.random() * 200);
                this.applyAndUpdate(random);
            });
        }

        // Random from category
        const randomCatBtn = document.getElementById('var-random-cat');
        if (randomCatBtn) {
            randomCatBtn.addEventListener('click', () => {
                if (this.currentCategory === 'all') {
                    const random = Math.floor(Math.random() * 200);
                    this.applyAndUpdate(random);
                } else if (this.currentCategory === 'custom') {
                    const customVars = this.variationManager.customVariations
                        .map((v, i) => v ? i + 60 : null)
                        .filter(i => i !== null);
                    if (customVars.length > 0) {
                        const random = customVars[Math.floor(Math.random() * customVars.length)];
                        this.applyAndUpdate(random);
                    }
                } else {
                    const random = this.variationManager.getRandomFromCategory(this.currentCategory);
                    if (random !== -1) this.applyAndUpdate(random);
                }
            });
        }

        // Save current as custom
        const saveBtn = document.getElementById('var-save-current');
        const nameInput = document.getElementById('var-custom-name');
        if (saveBtn && nameInput) {
            saveBtn.addEventListener('click', () => {
                const name = nameInput.value.trim() || null;
                const index = this.variationManager.saveCurrentAsCustom(name);
                if (index !== -1) {
                    nameInput.value = '';
                    this.updateStatistics();
                    this.showToast(`✅ Saved as variation ${index}`);
                } else {
                    this.showToast('⚠️ No empty slots available');
                }
            });
        }

        // Delete current custom
        const deleteBtn = document.getElementById('var-delete-current');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const current = this.variationManager.currentVariation;
                if (current >= 60) {
                    const customIndex = current - 60;
                    if (confirm(`Delete variation ${current}?`)) {
                        this.variationManager.deleteCustomVariation(customIndex);
                        this.updateStatistics();
                        this.showToast(`🗑️ Deleted variation ${current}`);
                    }
                } else {
                    this.showToast('⚠️ Cannot delete default variations');
                }
            });
        }

        // Clear all custom
        const clearBtn = document.getElementById('var-clear-all');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('⚠️ DELETE ALL CUSTOM VARIATIONS?\n\nThis cannot be undone!')) {
                    if (confirm('Are you ABSOLUTELY SURE? This will delete all 140 custom slots!')) {
                        this.variationManager.customVariations = new Array(140).fill(null);
                        this.variationManager.saveCustomVariations();
                        this.updateStatistics();
                        this.showToast('⚠️ All custom variations cleared');
                    }
                }
            });
        }

        // Export
        const exportBtn = document.getElementById('var-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.variationManager.exportCustomVariations();
                this.showToast('📤 Variations exported');
            });
        }

        // Import
        const importBtn = document.getElementById('var-import');
        const importFile = document.getElementById('var-import-file');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const count = await this.variationManager.importCustomVariations(file);
                    this.updateStatistics();
                    this.showToast(`📥 Imported ${count} variations`);
                    importFile.value = '';
                }
            });
        }

        console.log('✅ VariationControls event listeners setup');
    }

    applyAndUpdate(index) {
        if (this.variationManager.applyVariation(index)) {
            this.updateCurrentDisplay();
            const jumpInput = document.getElementById('var-jump-input');
            if (jumpInput) jumpInput.value = index;
        }
    }

    updateCurrentDisplay() {
        const display = document.getElementById('var-current-display');
        if (display) {
            const current = this.variationManager.currentVariation;
            const name = this.variationManager.getVariationName(current);
            const isCustom = current >= 60 ? ' [CUSTOM]' : '';
            display.textContent = `VAR ${current}: ${name}${isCustom}`;
        }
    }

    updateStatistics() {
        const stats = this.variationManager.getStatistics();
        const statsDiv = document.getElementById('var-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                Total: ${stats.totalVariations} variations<br>
                Default: ${stats.defaultVariations} | Custom: ${stats.customVariations}<br>
                Empty Slots: ${stats.emptySlots}<br>
                Current: VAR ${stats.currentVariation} ${stats.isCustom ? '[CUSTOM]' : '[DEFAULT]'}
            `;
        }
    }

    updateCategoryDisplay() {
        // Future enhancement: filter variation list display
        console.log(`Category filter: ${this.currentCategory}`);
    }

    performSearch() {
        const resultsContainer = document.getElementById('var-search-results');
        const resultsList = document.getElementById('var-results-list');

        if (!resultsContainer || !resultsList) return;

        if (this.searchQuery.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        const results = this.variationManager.searchVariations(this.searchQuery);

        if (results.length === 0) {
            resultsContainer.style.display = 'block';
            resultsList.innerHTML = '<div style="opacity: 0.5;">No results found</div>';
            return;
        }

        resultsContainer.style.display = 'block';
        resultsList.innerHTML = results.map(r => `
            <div style="padding: 5px; margin: 2px 0; background: rgba(0,255,255,0.1); cursor: pointer; border: 1px solid rgba(0,255,255,0.3);"
                 onclick="window.variationControls?.applyAndUpdate(${r.index})">
                VAR ${r.index}: ${r.name} ${r.isCustom ? '[CUSTOM]' : ''}
            </div>
        `).join('');
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
    setVariation(index) {
        this.applyAndUpdate(index);
    }

    getCurrentVariation() {
        return this.variationManager.currentVariation;
    }

    getVariationName(index) {
        return this.variationManager.getVariationName(index);
    }
}

/**
 * A Paul Phillips Manifestation
 * Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 */
