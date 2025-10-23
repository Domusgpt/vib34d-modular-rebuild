import { SonicMoodConductor } from '../../llm/SonicMoodConductor.js';

export class SonicStudioShell {
    constructor(choreographer, { isMobile = false } = {}) {
        this.choreographer = choreographer;
        this.isMobile = isMobile;

        this.elements = {};
        this.audioElement = null;
        this.animationFrame = null;
        this.currentTransportState = 'stop';
        this.moodConductor = null;
        this.moodJournalEntries = [];
        this.lastHighlightedEntryId = null;
        this.lastStoryboardEntryId = null;
        this.pendingSuggestion = null;
        this.latestCollaborations = [];
        this.collaborationPreview = null;
        this.collaborationStorageKey = 'sonic-studio-collaborations-v1';

        this.onTimeUpdate = () => this.refreshTimecode();
        this.onPlay = () => this.setTransportState('play');
        this.onPause = () => this.setTransportState('pause');
        this.onEnded = () => this.setTransportState('stop');
        this.onLoadedMetadata = () => this.updateDuration();

        this.init();
    }

    init() {
        this.cacheElements();
        this.renderCoCreativeSuggestions([]);
        this.renderSuggestionPreview(null);
        this.renderCollaborations([]);
        this.renderFeedbackStats({});
        this.renderPerformanceArcs([], {});
        this.installEventHandlers();
        this.setTransportState('stop');
        this.updateSystemPills(this.choreographer.currentSystem);
        this.updateModeDisplay();
        this.startTelemetryLoop();
        this.bindAudioElement();
        this.initializeMoodConductor().catch(error => {
            console.warn('Sonic mood conductor setup deferred:', error);
        });
    }

    cacheElements() {
        this.elements.root = document.getElementById('studio-shell');
        this.elements.systemPills = Array.from(document.querySelectorAll('.system-pill'));
        this.elements.transportButtons = Array.from(document.querySelectorAll('[data-transport]'));
        this.elements.loadButton = document.querySelector('[data-action="load-audio"]');
        this.elements.fileInput = document.getElementById('audio-file-input');
        this.elements.audioStatusTop = document.getElementById('audio-status');
        this.elements.audioStatusBottom = document.getElementById('audio-status-bottom');
        this.elements.progressBar = document.querySelector('[data-progress]');
        this.elements.timecodeCurrent = document.querySelector('[data-time="current"]');
        this.elements.timecodeDuration = document.querySelector('[data-time="duration"]');
        this.elements.metricEnergyValue = document.querySelector('[data-metric-value="energy"]');
        this.elements.metricEnergyBar = document.querySelector('[data-metric-bar="energy"]');
        this.elements.metricIntensityValue = document.querySelector('[data-metric-value="intensity"]');
        this.elements.metricIntensityBar = document.querySelector('[data-metric-bar="intensity"]');
        this.elements.padReadouts = {
            controller: document.querySelector('[data-pad-readout="controller"]'),
            canvas: document.querySelector('[data-pad-readout="canvas"]')
        };
        this.elements.padCursors = {
            controller: document.querySelector('.trajectory-cursor[data-surface="controller"]'),
            canvas: document.querySelector('.trajectory-cursor[data-surface="canvas"]')
        };
        this.elements.controllerPadZone = document.getElementById('controller-pad-zone');
        this.elements.currentSystem = document.getElementById('current-system');
        this.elements.currentMode = document.getElementById('current-mode');
        this.elements.sequenceCount = document.getElementById('sequence-count');
        this.elements.moodButton = document.querySelector('[data-action="launch-ai-mood"]');
        this.elements.moodLabel = document.getElementById('sonic-mood-label');
        this.elements.moodDescription = document.getElementById('sonic-mood-description');
        this.elements.moodEnergy = document.getElementById('sonic-mood-energy');
        this.elements.moodTemperature = document.getElementById('sonic-mood-temperature');
        this.elements.moodKeywords = document.getElementById('sonic-mood-keywords');
        this.elements.moodPrompt = document.getElementById('sonic-mood-prompt');
        this.elements.moodSource = document.getElementById('sonic-mood-source');
        this.elements.moodTimestamp = document.getElementById('sonic-mood-timestamp');
        this.elements.moodDelta = document.getElementById('sonic-mood-deltas');
        this.elements.moodExport = document.querySelector('[data-action="export-mood-log"]');
        this.elements.moodReset = document.querySelector('[data-action="reset-mood-adjust"]');
        this.elements.adjustControls = {
            energy: document.querySelector('[data-adjust="energy"]'),
            texture: document.querySelector('[data-adjust="texture"]'),
            color: document.querySelector('[data-adjust="color"]')
        };
        this.elements.adjustReadouts = {
            energy: document.querySelector('[data-adjust-readout="energy"]'),
            texture: document.querySelector('[data-adjust-readout="texture"]'),
            color: document.querySelector('[data-adjust-readout="color"]')
        };
        this.elements.moodJournalList = document.getElementById('mood-history-list');
        this.elements.moodJournalEmpty = document.getElementById('mood-history-empty');
        this.elements.storyboardList = document.getElementById('storyboard-list');
        this.elements.storyboardEmpty = document.getElementById('storyboard-empty');
        this.elements.liveContext = {
            bpm: document.querySelector('[data-live-context="bpm"]'),
            spectral: document.querySelector('[data-live-context="spectral"]'),
            genre: document.querySelector('[data-live-context="genre"]')
        };
        this.elements.coCreative = {
            list: document.getElementById('co-creative-list'),
            preview: document.getElementById('co-creative-preview'),
            summary: document.getElementById('co-creative-summary'),
            details: document.getElementById('co-creative-details'),
            status: document.getElementById('co-creative-status'),
            apply: document.querySelector('[data-action="apply-suggestion"]'),
            clear: document.querySelector('[data-action="clear-suggestion"]'),
            customInput: document.getElementById('co-creative-custom'),
            customButton: document.querySelector('[data-action="submit-custom-suggestion"]'),
            refresh: document.querySelector('[data-action="refresh-suggestions"]')
        };
        this.elements.collaboration = {
            form: document.getElementById('collaboration-ingest-form'),
            input: document.getElementById('collaboration-payload'),
            list: document.getElementById('collaboration-list'),
            empty: document.getElementById('collaboration-empty'),
            status: document.getElementById('collaboration-status')
        };
        this.elements.feedback = {
            form: document.getElementById('mood-feedback-form'),
            rating: document.getElementById('feedback-rating'),
            motion: document.getElementById('feedback-motion'),
            color: document.getElementById('feedback-color'),
            notes: document.getElementById('feedback-notes'),
            average: document.getElementById('feedback-average'),
            total: document.getElementById('feedback-total'),
            trending: document.getElementById('feedback-trending'),
            status: document.getElementById('feedback-status')
        };
        this.elements.performanceArc = {
            card: document.getElementById('performance-arc-card'),
            list: document.getElementById('performance-arc-list'),
            empty: document.getElementById('performance-arc-empty')
        };
    }

    installEventHandlers() {
        this.elements.systemPills.forEach(button => {
            button.addEventListener('click', () => this.handleSystemSwitch(button));
        });

        this.elements.transportButtons.forEach(button => {
            button.addEventListener('click', () => this.handleTransport(button.dataset.transport));
        });

        if (this.elements.loadButton && this.elements.fileInput) {
            this.elements.loadButton.addEventListener('click', () => this.elements.fileInput.click());
            this.elements.fileInput.addEventListener('change', (event) => {
                const file = event.target.files?.[0];
                if (file) {
                    this.handleAudioFile(file);
                }
            });
        }

        if (this.elements.moodButton) {
            this.elements.moodButton.addEventListener('click', () => this.launchMoodDesigner());
        }

        if (this.elements.moodExport) {
            this.elements.moodExport.addEventListener('click', () => this.handleExportMoodLog());
        }

        if (this.elements.moodReset) {
            this.elements.moodReset.addEventListener('click', () => this.handleQuickAdjustReset());
        }

        if (this.elements.adjustControls) {
            Object.entries(this.elements.adjustControls).forEach(([key, input]) => {
                if (!input) return;
                input.addEventListener('input', () => this.handleQuickAdjustChange(false));
                input.addEventListener('change', () => this.handleQuickAdjustChange(true));
            });
        }

        if (this.elements.moodJournalList) {
            this.elements.moodJournalList.addEventListener('click', (event) => this.handleMoodJournalClick(event));
        }

        if (this.elements.storyboardList) {
            this.elements.storyboardList.addEventListener('click', (event) => this.handleStoryboardClick(event));
        }

        if (this.elements.coCreative?.list) {
            this.elements.coCreative.list.addEventListener('click', (event) => this.handleSuggestionClick(event));
        }
        if (this.elements.coCreative?.apply) {
            this.elements.coCreative.apply.addEventListener('click', () => this.handleApplySuggestion());
        }
        if (this.elements.coCreative?.clear) {
            this.elements.coCreative.clear.addEventListener('click', () => this.handleClearSuggestion());
        }
        if (this.elements.coCreative?.customButton) {
            this.elements.coCreative.customButton.addEventListener('click', () => this.handleCustomSuggestion());
        }
        if (this.elements.coCreative?.refresh) {
            this.elements.coCreative.refresh.addEventListener('click', () => this.refreshCoCreativeTemplates());
        }

        if (this.elements.collaboration?.form) {
            this.elements.collaboration.form.addEventListener('submit', (event) => this.handleCollaborationSubmit(event));
        }
        if (this.elements.collaboration?.list) {
            this.elements.collaboration.list.addEventListener('click', (event) => this.handleCollaborationClick(event));
        }

        if (this.elements.feedback?.form) {
            this.elements.feedback.form.addEventListener('submit', (event) => this.handleFeedbackSubmit(event));
        }

        if (this.elements.performanceArc?.list) {
            this.elements.performanceArc.list.addEventListener('click', (event) => this.handlePerformanceArcClick(event));
        }
    }

    async handleSystemSwitch(button) {
        const systemName = button?.dataset?.system;
        if (!systemName || systemName === this.choreographer.currentSystem) {
            return;
        }

        this.updateSystemPills(systemName);
        try {
            await this.choreographer.switchSystem(systemName);
            this.updateSystemLabels();
        } catch (error) {
            console.error('Failed to switch system:', error);
        }
    }

    updateSystemPills(activeSystem) {
        this.elements.systemPills.forEach(button => {
            const isActive = button.dataset.system === activeSystem;
            button.classList.toggle('active', isActive);
        });
        this.updateSystemLabels();
    }

    updateSystemLabels() {
        if (this.elements.currentSystem) {
            this.elements.currentSystem.textContent = (this.choreographer.currentSystem || '—').toUpperCase();
        }
    }

    updateModeDisplay() {
        if (this.elements.currentMode) {
            this.elements.currentMode.textContent = (this.choreographer.choreographyMode || 'IDLE').toUpperCase();
        }
        if (this.elements.sequenceCount) {
            const count = Array.isArray(this.choreographer.sequences) ? this.choreographer.sequences.length : 0;
            this.elements.sequenceCount.textContent = count.toString();
        }
    }

    handleTransport(action) {
        switch (action) {
            case 'play':
                this.choreographer.play();
                this.setTransportState('play');
                break;
            case 'pause':
                this.choreographer.pause();
                this.setTransportState('pause');
                break;
            case 'stop':
                this.choreographer.stop();
                this.setTransportState('stop');
                break;
            default:
                break;
        }
    }

    setTransportState(state) {
        this.currentTransportState = state;
        this.elements.transportButtons.forEach(button => {
            const isActive = button.dataset.transport === state;
            button.setAttribute('data-state', isActive ? 'active' : 'idle');
        });
    }

    async handleAudioFile(file) {
        this.updateAudioStatus(`Loading ${file.name}`);
        try {
            await this.choreographer.loadAudioFile(file);
            this.updateAudioStatus(`Loaded ${file.name}`);
            this.bindAudioElement(true);
        } catch (error) {
            console.error('Failed to load audio file:', error);
            this.updateAudioStatus('Audio load failed');
        }
    }

    updateAudioStatus(message) {
        if (this.elements.audioStatusTop) {
            this.elements.audioStatusTop.textContent = message;
        }
        if (this.elements.audioStatusBottom) {
            this.elements.audioStatusBottom.textContent = message;
        }
    }

    bindAudioElement(force = false) {
        const element = this.choreographer.audioElement;
        if (!element) {
            if (force) {
                // try again after audio pipeline finishes attaching
                setTimeout(() => this.bindAudioElement(false), 50);
            }
            return;
        }

        if (this.audioElement === element) {
            return;
        }

        this.detachAudioElement();
        this.audioElement = element;
        this.audioElement.addEventListener('timeupdate', this.onTimeUpdate);
        this.audioElement.addEventListener('play', this.onPlay);
        this.audioElement.addEventListener('pause', this.onPause);
        this.audioElement.addEventListener('ended', this.onEnded);
        this.audioElement.addEventListener('loadedmetadata', this.onLoadedMetadata, { once: true });
        this.updateDuration();
        this.refreshTimecode();
    }

    detachAudioElement() {
        if (!this.audioElement) return;
        this.audioElement.removeEventListener('timeupdate', this.onTimeUpdate);
        this.audioElement.removeEventListener('play', this.onPlay);
        this.audioElement.removeEventListener('pause', this.onPause);
        this.audioElement.removeEventListener('ended', this.onEnded);
        this.audioElement.removeEventListener('loadedmetadata', this.onLoadedMetadata);
        this.audioElement = null;
    }

    async initializeMoodConductor() {
        if (this.moodConductor) {
            return this.moodConductor;
        }

        try {
            this.moodConductor = new SonicMoodConductor(this.choreographer);
            this.moodConductor.onProfileApplied((profile) => this.updateMoodProfile(profile));
            this.moodConductor.onLogEntry((entries) => this.renderMoodJournal(entries));
            this.moodConductor.onStoryboardUpdate((entries) => this.renderStoryboard(entries));
            this.moodConductor.onCollaborationUpdate((sessions) => {
                this.renderCollaborations(sessions);
                this.persistCollaborations(sessions);
            });
            this.moodConductor.onFeedbackUpdate((stats) => this.renderFeedbackStats(stats));
            this.moodConductor.onPerformanceArcUpdate((arcs, state) => this.renderPerformanceArcs(arcs, state));
            await this.moodConductor.initialize();
            this.restorePersistedCollaborations();
            const activeProfile = this.moodConductor.getActiveProfile();
            if (activeProfile) {
                this.updateMoodProfile(activeProfile);
            }
            this.renderMoodJournal(this.moodConductor.getSessionLog());
            this.renderStoryboard(this.moodConductor.getStoryboard());
            this.syncQuickAdjustUI(activeProfile?.quickAdjust);
            this.renderCoCreativeSuggestions(this.moodConductor.getCoCreativeTemplates());
            this.renderCollaborations(this.moodConductor.getCollaborations());
            this.renderFeedbackStats(this.moodConductor.getFeedbackStats());
            this.renderPerformanceArcs(this.moodConductor.getPerformanceArcs(), this.moodConductor.getPerformanceArcState());
        } catch (error) {
            console.warn('Failed to initialize SonicMoodConductor:', error);
        }

        return this.moodConductor;
    }

    launchMoodDesigner() {
        if (!this.moodConductor) {
            this.initializeMoodConductor().then(() => {
                this.moodConductor?.openDesigner();
            }).catch(error => console.warn('Unable to launch mood designer:', error));
            return;
        }

        this.moodConductor.openDesigner();
    }

    handleQuickAdjustChange(record) {
        const values = this.getAdjustValues();
        Object.entries(values).forEach(([key, value]) => this.updateAdjustReadout(key, value));

        if (!this.moodConductor) {
            this.initializeMoodConductor();
            return;
        }

        this.moodConductor.applyQuickAdjustments(values, { record });
    }

    handleQuickAdjustReset() {
        this.syncQuickAdjustUI({ energy: 0, texture: 0, color: 0 });
        if (!this.moodConductor) {
            this.initializeMoodConductor();
            return;
        }
        this.moodConductor.resetQuickAdjustments({ record: true });
    }

    handleExportMoodLog() {
        if (!this.moodConductor) {
            this.initializeMoodConductor().then(() => {
                this.moodConductor?.exportSessionLog();
            });
            return;
        }
        this.moodConductor.exportSessionLog();
    }

    getAdjustValues() {
        const normalize = (value) => {
            const numeric = parseFloat(value);
            if (!Number.isFinite(numeric)) return 0;
            return Math.max(-1, Math.min(1, numeric / 100));
        };

        return {
            energy: normalize(this.elements.adjustControls?.energy?.value ?? 0),
            texture: normalize(this.elements.adjustControls?.texture?.value ?? 0),
            color: normalize(this.elements.adjustControls?.color?.value ?? 0)
        };
    }

    syncQuickAdjustUI(quickAdjust = {}) {
        const applyValue = (key, value) => {
            const slider = this.elements.adjustControls?.[key];
            if (slider) {
                slider.value = Math.round((value ?? 0) * 100);
            }
            this.updateAdjustReadout(key, value ?? 0);
        };

        applyValue('energy', quickAdjust?.energy ?? 0);
        applyValue('texture', quickAdjust?.texture ?? 0);
        applyValue('color', quickAdjust?.color ?? 0);
    }

    updateAdjustReadout(key, value) {
        const readout = this.elements.adjustReadouts?.[key];
        if (!readout) return;
        const display = this.formatAdjustDisplay(value ?? 0);
        readout.textContent = display;
    }

    formatAdjustDisplay(value) {
        const percent = Math.round((value ?? 0) * 100);
        if (percent === 0) {
            return '0%';
        }
        return `${percent > 0 ? '+' : ''}${percent}%`;
    }

    renderMoodJournal(entries = []) {
        this.moodJournalEntries = Array.isArray(entries) ? entries : [];
        const list = this.elements.moodJournalList;
        const emptyState = this.elements.moodJournalEmpty;
        if (!list) return;

        if (!Array.isArray(entries) || entries.length === 0) {
            list.innerHTML = '';
            if (emptyState) {
                emptyState.hidden = false;
            }
            return;
        }

        if (emptyState) {
            emptyState.hidden = true;
        }

        const recent = entries.slice(-10).reverse();
        const typeMap = {
            'ai-profile': 'AI Mood',
            'quick-adjust': 'Adjust',
            'quick-adjust-reset': 'Reset',
            'storyboard-activate': 'Storyboard',
            'mood-recall': 'Recall',
            'co-creative-suggestion': 'Nudge Preview',
            'co-creative-apply': 'Nudge Apply',
            'collaboration-received': 'Remote Mood',
            'collaboration-apply': 'Remote Apply',
            'collaboration-apply-meta': 'Remote Apply',
            'feedback': 'Feedback',
            'performance-arc-activate': 'Arc Start',
            'performance-arc': 'Arc Stage',
            'performance-arc-loop': 'Arc Loop',
            'performance-arc-stop': 'Arc Stop',
            'performance-arc-complete': 'Arc Complete'
        };

        const html = recent.map(entry => {
            const typeLabel = typeMap[entry.type] || 'Adjust';
            const hasProfile = Boolean(entry.profile);
            const label = entry.profile?.mood?.label
                || entry.collaborator
                || entry.prompt
                || (hasProfile ? 'Custom Sculpt' : typeLabel);
            const prompt = entry.prompt
                || entry.profile?.prompt
                || entry.notes
                || '';
            const deltas = this.formatDeltaSummary(entry.deltas);
            const time = this.formatTimestampShort(entry.timestamp);
            const safeType = this.escapeHtml(typeLabel);
            const safeLabel = this.escapeHtml(label);
            const safePrompt = prompt ? `“${this.escapeHtml(prompt)}”` : '—';
            const isoTime = entry.timestamp ? new Date(entry.timestamp).toISOString() : '';
            const disabledAttr = hasProfile ? '' : 'data-disabled="true"';
            return `
                <li class="mood-history-item${hasProfile ? '' : ' mood-history-item--passive'}" data-entry-id="${this.escapeHtml(entry.id || '')}" data-entry-type="${this.escapeHtml(entry.type || 'ai-profile')}" ${entry.referenceId ? `data-reference-id="${this.escapeHtml(entry.referenceId)}"` : ''} ${disabledAttr}>
                    <header>
                        <span class="mood-history-type">${safeType}</span>
                        <time datetime="${isoTime}">${time}</time>
                    </header>
                    <div class="mood-history-label">${safeLabel}</div>
                    <div class="mood-history-prompt">${safePrompt}</div>
                    <div class="mood-history-delta">${this.escapeHtml(deltas)}</div>
                </li>
            `;
        }).join('');

        list.innerHTML = html;

        if (this.lastHighlightedEntryId) {
            this.highlightJournalEntry(this.lastHighlightedEntryId, { persistOnly: true });
        }
    }

    renderStoryboard(entries = []) {
        const list = this.elements.storyboardList;
        const empty = this.elements.storyboardEmpty;
        if (!list) {
            return;
        }

        if (!Array.isArray(entries) || entries.length === 0) {
            list.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
            return;
        }

        if (empty) {
            empty.hidden = true;
        }

        const html = entries.map(entry => {
            const weight = Math.max(entry.duration || 0, 1);
            const startSeconds = Math.max(0, Math.round(entry.startTime || 0));
            const durationSeconds = Math.max(1, Math.round(entry.duration || 0));
            const energy = entry.profileSnapshot?.mood?.energy ?? 0.5;
            const manual = Math.round((entry.manualInfluence ?? 0) * 100);
            const label = this.escapeHtml(entry.label || 'Mood');
            const prompt = entry.prompt ? this.escapeHtml(entry.prompt) : '—';
            const energyText = `${Math.round((energy ?? 0.5) * 100)}%`;
            return `
                <li class="storyboard-entry" data-entry-id="${this.escapeHtml(entry.id)}" data-profile-id="${this.escapeHtml(entry.profileId || '')}" style="flex: ${weight} 0 auto;">
                    <div class="storyboard-entry-header">
                        <span class="storyboard-entry-label">${label}</span>
                        <span class="storyboard-entry-time">${startSeconds}s • ${durationSeconds}s</span>
                    </div>
                    <div class="storyboard-entry-meta">
                        <span>Energy ${energyText}</span>
                        <span>Manual ${manual}%</span>
                    </div>
                    <div class="storyboard-entry-prompt">${prompt}</div>
                </li>
            `;
        }).join('');

        list.innerHTML = html;
        this.highlightStoryboardEntry(this.lastStoryboardEntryId, { persistOnly: true });
    }

    handleMoodJournalClick(event) {
        if (!this.moodConductor) {
            return;
        }

        const item = event.target.closest('.mood-history-item');
        if (!item || !item.dataset.entryId) {
            return;
        }

        const { entryId } = item.dataset;
        if (item.dataset.disabled === 'true') {
            this.highlightJournalEntry(entryId);
            return;
        }
        this.moodConductor.recallSessionEntry(entryId, { record: true });
        this.highlightJournalEntry(entryId);
    }

    handleStoryboardClick(event) {
        if (!this.moodConductor) {
            return;
        }

        const item = event.target.closest('.storyboard-entry');
        if (!item || !item.dataset.entryId) {
            return;
        }

        const { entryId } = item.dataset;
        this.moodConductor.activateStoryboardEntry(entryId, { record: true });
        this.highlightStoryboardEntry(entryId);
    }

    refreshCoCreativeTemplates() {
        if (!this.moodConductor) {
            this.initializeMoodConductor();
            return;
        }
        this.renderCoCreativeSuggestions(this.moodConductor.getCoCreativeTemplates());
        this.pendingSuggestion = null;
        this.renderSuggestionPreview(null);
        this.showSuggestionStatus('Nudge palette refreshed.');
    }

    async handleSuggestionClick(event) {
        const target = event.target.closest('[data-suggestion-id]');
        if (!target) {
            return;
        }
        const suggestionId = target.dataset.suggestionId;
        await this.requestSuggestion({ templateId: suggestionId });
    }

    async requestSuggestion({ templateId = null, customText = null } = {}) {
        if (!this.moodConductor) {
            await this.initializeMoodConductor();
        }
        if (!this.moodConductor) {
            this.showSuggestionStatus('Sonic conductor unavailable.', { error: true });
            return;
        }

        this.setSuggestionLoading(true);
        try {
            const suggestion = await this.moodConductor.requestCoCreativeSuggestion(templateId, { customText });
            this.pendingSuggestion = suggestion;
            this.renderSuggestionPreview(suggestion);
            this.showSuggestionStatus('Suggestion ready to apply.');
        } catch (error) {
            console.error('Failed to fetch co-creative suggestion:', error);
            this.showSuggestionStatus('Unable to generate suggestion.', { error: true });
        } finally {
            this.setSuggestionLoading(false);
        }
    }

    async handleApplySuggestion() {
        if (!this.moodConductor) {
            await this.initializeMoodConductor();
        }
        if (!this.moodConductor) {
            this.showSuggestionStatus('Conductor not ready.', { error: true });
            return;
        }

        const applyButton = this.elements.coCreative?.apply;
        const mode = applyButton?.dataset.mode || 'suggestion';

        try {
            this.setSuggestionLoading(true);
            if (mode === 'collaboration' && applyButton?.dataset?.collaborationId) {
                await this.moodConductor.applyCollaboratorEntry(
                    applyButton.dataset.collaborationId,
                    applyButton.dataset.entryId,
                    { record: true }
                );
                this.showSuggestionStatus('Remote revision applied.');
            } else if (this.pendingSuggestion) {
                const applied = await this.moodConductor.applyCoCreativeSuggestion(this.pendingSuggestion, { record: true });
                if (applied) {
                    this.updateMoodProfile(applied);
                }
                this.showSuggestionStatus('Co-creative nudge applied.');
            }
        } catch (error) {
            console.error('Failed to apply suggestion:', error);
            this.showSuggestionStatus('Suggestion failed to apply.', { error: true });
        } finally {
            this.pendingSuggestion = null;
            this.renderSuggestionPreview(null);
            this.setSuggestionLoading(false);
        }
    }

    handleClearSuggestion() {
        this.pendingSuggestion = null;
        this.renderSuggestionPreview(null);
        this.showSuggestionStatus('Suggestion cleared.');
    }

    handleCustomSuggestion() {
        const input = this.elements.coCreative?.customInput;
        if (!input) {
            return;
        }
        const cue = input.value.trim();
        if (!cue) {
            this.showSuggestionStatus('Describe a vibe to generate a nudge.', { error: true });
            return;
        }
        this.requestSuggestion({ customText: cue });
    }

    setSuggestionLoading(isLoading) {
        const preview = this.elements.coCreative?.preview;
        if (preview) {
            preview.dataset.loading = isLoading ? 'true' : 'false';
        }
        if (this.elements.coCreative?.apply) {
            this.elements.coCreative.apply.disabled = isLoading || !this.pendingSuggestion;
        }
    }

    renderCoCreativeSuggestions(templates = []) {
        const container = this.elements.coCreative?.list;
        if (!container) {
            return;
        }

        if (!Array.isArray(templates) || !templates.length) {
            container.innerHTML = '<div class="suggestion-empty">Generate a mood to unlock co-creative nudges.</div>';
            return;
        }

        const html = templates.map(template => `
            <button type="button" class="suggestion-chip" data-suggestion-id="${this.escapeHtml(template.id)}" title="${this.escapeHtml(template.description)}">
                <span class="suggestion-chip-label">${this.escapeHtml(template.label)}</span>
                <span class="suggestion-chip-desc">${this.escapeHtml(template.description)}</span>
            </button>
        `).join('');
        container.innerHTML = html;
    }

    renderSuggestionPreview(suggestion = null) {
        const summaryEl = this.elements.coCreative?.summary;
        const detailsEl = this.elements.coCreative?.details;
        const applyBtn = this.elements.coCreative?.apply;
        const clearBtn = this.elements.coCreative?.clear;

        if (!summaryEl) {
            return;
        }

        if (!suggestion) {
            summaryEl.textContent = 'Pick a nudge to preview parameter shifts.';
            if (detailsEl) {
                detailsEl.innerHTML = '';
            }
            if (applyBtn) {
                applyBtn.disabled = true;
                applyBtn.dataset.mode = 'suggestion';
                applyBtn.dataset.collaborationId = '';
                applyBtn.dataset.entryId = '';
            }
            if (clearBtn) {
                clearBtn.disabled = true;
            }
            return;
        }

        summaryEl.textContent = `${suggestion.label} • ${suggestion.summary || 'Subtle change'}`;
        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.dataset.mode = suggestion.source === 'collaboration' ? 'collaboration' : 'suggestion';
            applyBtn.dataset.collaborationId = suggestion.collaborationId || '';
            applyBtn.dataset.entryId = suggestion.entryId || '';
        }
        if (clearBtn) {
            clearBtn.disabled = false;
        }

        if (detailsEl) {
            const deltas = this.computeParameterDiff(suggestion.parameters);
            const deltaSummary = this.formatDeltaSummary(deltas) || 'Subtle shift';
            const paletteSummary = this.renderPaletteDiff(suggestion.palette);
            const energyText = Number.isFinite(suggestion.moodEnergy)
                ? `${Math.round(suggestion.moodEnergy * 100)}%`
                : '—';

            detailsEl.innerHTML = `
                <div class="suggestion-detail">
                    <strong>Parameters</strong>
                    <span>${this.escapeHtml(deltaSummary)}</span>
                </div>
                <div class="suggestion-detail">
                    <strong>Palette</strong>
                    <span>${paletteSummary}</span>
                </div>
                <div class="suggestion-detail">
                    <strong>Energy</strong>
                    <span>${energyText}</span>
                </div>
            `;
        }
    }

    computeParameterDiff(parameters = {}) {
        const matrix = this.choreographer?.sonicMatrix;
        const base = matrix?.getBaseParameters?.() || {};
        const deltas = {};
        Object.entries(parameters || {}).forEach(([param, value]) => {
            if (!Number.isFinite(value)) {
                return;
            }
            const prev = Number(base[param]);
            if (!Number.isFinite(prev)) {
                return;
            }
            const delta = value - prev;
            if (Math.abs(delta) < 1e-3) {
                return;
            }
            deltas[param] = { from: prev, to: value, delta };
        });
        return deltas;
    }

    renderPaletteDiff(palette = {}) {
        if (!palette || typeof palette !== 'object') {
            return '—';
        }
        const parts = [];
        if (palette.primaryHue !== undefined) {
            parts.push(`Hue ${Math.round(this.normalizeHue(palette.primaryHue))}°`);
        }
        if (palette.accentHue !== undefined) {
            parts.push(`Accent ${Math.round(this.normalizeHue(palette.accentHue))}°`);
        }
        if (palette.saturation !== undefined) {
            parts.push(`Sat ${Math.round(palette.saturation * 100)}%`);
        }
        if (palette.intensity !== undefined) {
            parts.push(`Glow ${Math.round(palette.intensity * 100)}%`);
        }
        return parts.length ? this.escapeHtml(parts.join(' · ')) : '—';
    }

    normalizeHue(value) {
        if (!Number.isFinite(value)) {
            return 0;
        }
        const wrapped = value % 360;
        return wrapped < 0 ? wrapped + 360 : wrapped;
    }

    showSuggestionStatus(message, { error = false } = {}) {
        const statusEl = this.elements.coCreative?.status;
        if (!statusEl) {
            return;
        }
        statusEl.textContent = message;
        statusEl.dataset.state = error ? 'error' : 'ok';
    }

    renderCollaborations(sessions = []) {
        const container = this.elements.collaboration?.list;
        const empty = this.elements.collaboration?.empty;
        if (!container) {
            return;
        }

        this.latestCollaborations = Array.isArray(sessions) ? sessions : [];
        this.persistCollaborations();

        if (!this.latestCollaborations.length) {
            container.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
            return;
        }

        if (empty) {
            empty.hidden = true;
        }

        const html = this.latestCollaborations.map(session => this.renderCollaborationSession(session)).join('');
        container.innerHTML = html;
    }

    renderCollaborationSession(session) {
        const entries = Array.isArray(session.entries) ? session.entries.slice().reverse() : [];
        const average = Number.isFinite(session.averageRating)
            ? `${Math.round(session.averageRating * 100)}%`
            : '—';
        const headerMeta = `${entries.length} revisions · fav ${average}`;
        const entriesHtml = entries.map(entry => {
            const isPreview = this.collaborationPreview
                && this.collaborationPreview.collaborationId === session.id
                && this.collaborationPreview.entryId === entry.id;
            const time = entry.timestamp ? this.formatTimestampShort(entry.timestamp) : '--';
            const deltas = this.computeParameterDiff(entry.profile?.parameters || {});
            const deltaSummary = this.formatDeltaSummary(deltas) || 'Subtle shift';
            const classes = [
                'collaboration-entry',
                entry.id === session.lastAppliedEntryId ? 'collaboration-entry--active' : '',
                isPreview ? 'collaboration-entry--preview' : ''
            ].filter(Boolean).join(' ');
            const previewHtml = isPreview
                ? `<div class="collaboration-preview">${this.renderCollaborationPreviewDetails(entry)}</div>`
                : '';
            const prompt = entry.prompt || entry.profile?.mood?.label || 'Revision';
            return `
                <div class="${classes}" data-collab-id="${this.escapeHtml(session.id)}" data-entry-id="${this.escapeHtml(entry.id)}">
                    <header>
                        <span>${this.escapeHtml(prompt)}</span>
                        <time>${time}</time>
                    </header>
                    <div class="collaboration-deltas">Δ ${this.escapeHtml(deltaSummary)}</div>
                    <div class="collaboration-actions">
                        <button type="button" data-action="apply-collaboration">Apply</button>
                        <button type="button" data-action="preview-collaboration">${isPreview ? 'Hide' : 'Compare'}</button>
                    </div>
                    ${previewHtml}
                </div>
            `;
        }).join('');

        return `
            <section class="collaboration-session" data-collaboration="${this.escapeHtml(session.id)}">
                <header>
                    <span class="collaboration-name">${this.escapeHtml(session.name || 'Remote Artist')}</span>
                    <span class="collaboration-meta">${this.escapeHtml(headerMeta)}</span>
                </header>
                <div class="collaboration-entries">${entriesHtml}</div>
            </section>
        `;
    }

    renderPerformanceArcs(arcs = [], state = {}) {
        const container = this.elements.performanceArc?.list;
        const empty = this.elements.performanceArc?.empty;
        const card = this.elements.performanceArc?.card;
        if (!container) {
            return;
        }

        const list = Array.isArray(arcs) ? arcs : [];
        const activeId = state?.activeArcId || null;

        if (!list.length) {
            container.innerHTML = '';
            if (empty) {
                empty.hidden = false;
            }
            if (card) {
                card.removeAttribute('data-active');
            }
            return;
        }

        if (empty) {
            empty.hidden = true;
        }
        if (card) {
            if (activeId) {
                card.setAttribute('data-active', 'true');
            } else {
                card.removeAttribute('data-active');
            }
        }

        const html = list.map((arc) => {
            const stageCount = arc.stageCount ?? (Array.isArray(arc.stages) ? arc.stages.length : 0);
            const totalDuration = arc.totalDuration ?? this.calculateArcTotalDuration(arc);
            const tempoScale = arc.tempoScale && arc.tempoScale > 0 ? arc.tempoScale : 1;
            const isActive = arc.id === activeId;
            const activeStageIndex = isActive ? state?.stageIndex ?? 0 : -1;
            const stageProgress = isActive ? state?.stageProgress ?? 0 : 0;
            const overallProgress = isActive ? state?.overallProgress ?? 0 : 0;
            const loopCount = isActive ? (state?.loopCount ?? 0) : 0;
            const overallPercent = Math.round(overallProgress * 100);
            const loopLabel = arc.loop ? 'Loop' : 'One-shot';
            const tempoLabel = `×${tempoScale.toFixed(2)}`;
            const loopCountLabel = isActive ? `Loop ${loopCount + 1}` : '';

            const stagesHtml = (arc.stages || []).map((stage, index) => {
                const stageActive = index === activeStageIndex;
                const stagePercent = stageActive ? Math.round(stageProgress * 100) : 0;
                const width = stageActive ? Math.max(stagePercent, stagePercent > 0 ? 6 : 0) : 0;
                return `
                    <li class="arc-stage${stageActive ? ' arc-stage--active' : ''}">
                        <div class="arc-stage-label">
                            <span>${this.escapeHtml(stage.label || `Stage ${index + 1}`)}</span>
                            <span>${this.formatDurationSeconds(stage.duration)}</span>
                        </div>
                        <div class="arc-stage-progress"><span style="width:${width}%"></span></div>
                    </li>
                `;
            }).join('');

            const buttonLabel = isActive ? 'Stop Arc' : 'Start Arc';
            const buttonState = isActive ? 'active' : 'idle';

            return `
                <section class="performance-arc${isActive ? ' performance-arc--active' : ''}" data-arc-id="${this.escapeHtml(arc.id)}">
                    <header class="performance-arc-header">
                        <div>
                            <h3>${this.escapeHtml(arc.label || 'Performance Arc')}</h3>
                            <p>${this.escapeHtml(arc.description || 'Automate storyboard moods into a performance journey.')}</p>
                        </div>
                        <button type="button" class="ghost" data-action="arc-toggle" data-arc-id="${this.escapeHtml(arc.id)}" data-state="${buttonState}">
                            ${buttonLabel}
                        </button>
                    </header>
                    <div class="performance-arc-meta">
                        <span>${stageCount} stages</span>
                        <span>${this.formatDurationSeconds(totalDuration)}</span>
                        <span>${tempoLabel}</span>
                        <span>${loopLabel}</span>
                        ${loopCountLabel ? `<span>${this.escapeHtml(loopCountLabel)}</span>` : ''}
                    </div>
                    <div class="performance-arc-overall">
                        <div class="performance-arc-progress"><span style="width:${overallPercent}%"></span></div>
                        <span class="performance-arc-progress-label">${overallPercent}%</span>
                    </div>
                    <ol class="arc-stage-list">
                        ${stagesHtml}
                    </ol>
                </section>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderCollaborationPreviewDetails(entry) {
        const paletteSummary = this.renderPaletteDiff(entry.profile?.palette);
        const energy = entry.profile?.mood?.energy;
        const energyText = Number.isFinite(energy) ? `${Math.round(energy * 100)}%` : '—';
        const keywords = (entry.profile?.mood?.keywords || []).slice(0, 4).map(keyword => `<span>${this.escapeHtml(keyword)}</span>`).join('');
        const deltas = this.computeParameterDiff(entry.profile?.parameters || {});
        const deltaSummary = this.formatDeltaSummary(deltas) || 'Subtle shift';

        return `
            <div class="collaboration-preview-grid">
                <div>
                    <strong>Parameters</strong>
                    <span>${this.escapeHtml(deltaSummary)}</span>
                </div>
                <div>
                    <strong>Palette</strong>
                    <span>${paletteSummary}</span>
                </div>
                <div>
                    <strong>Energy</strong>
                    <span>${energyText}</span>
                </div>
                <div class="collaboration-keywords">${keywords || '<span>—</span>'}</div>
            </div>
        `;
    }

    handleCollaborationSubmit(event) {
        event.preventDefault();
        if (!this.elements.collaboration?.input) {
            return;
        }

        const raw = this.elements.collaboration.input.value.trim();
        if (!raw) {
            this.showCollaborationStatus('Paste collaborator JSON to ingest.', { error: true });
            return;
        }

        if (!this.moodConductor) {
            this.initializeMoodConductor();
        }
        if (!this.moodConductor) {
            this.showCollaborationStatus('Unable to record collaboration.', { error: true });
            return;
        }

        try {
            const payload = this.parseCollaborationPayload(raw);
            this.moodConductor.registerCollaboratorContribution(payload);
            this.elements.collaboration.input.value = '';
            this.showCollaborationStatus('Remote mood added.');
        } catch (error) {
            console.error('Failed to ingest collaboration payload:', error);
            this.showCollaborationStatus(error?.message || 'Invalid collaboration payload.', { error: true });
        }
    }

    handleCollaborationClick(event) {
        const applyButton = event.target.closest('[data-action="apply-collaboration"]');
        if (applyButton) {
            const entryNode = applyButton.closest('[data-collab-id]');
            if (!entryNode) return;
            const collabId = entryNode.dataset.collabId;
            const entryId = entryNode.dataset.entryId;
            this.applyCollaborationEntry(collabId, entryId);
            return;
        }

        const previewButton = event.target.closest('[data-action="preview-collaboration"]');
        if (previewButton) {
            const entryNode = previewButton.closest('[data-collab-id]');
            if (!entryNode) return;
            const collabId = entryNode.dataset.collabId;
            const entryId = entryNode.dataset.entryId;
            if (this.collaborationPreview && this.collaborationPreview.collaborationId === collabId && this.collaborationPreview.entryId === entryId) {
                this.collaborationPreview = null;
            } else {
                this.collaborationPreview = { collaborationId: collabId, entryId };
            }
            this.renderCollaborations(this.latestCollaborations);
        }
    }

    handlePerformanceArcClick(event) {
        const toggleButton = event.target.closest('[data-action="arc-toggle"]');
        if (!toggleButton) {
            return;
        }
        const arcId = toggleButton.dataset.arcId;
        if (!arcId) {
            return;
        }
        const isActive = toggleButton.dataset.state === 'active';

        if (!this.moodConductor) {
            this.initializeMoodConductor().then(() => {
                this.togglePerformanceArc(arcId, isActive);
            });
            return;
        }

        this.togglePerformanceArc(arcId, isActive);
    }

    togglePerformanceArc(arcId, isActive) {
        if (!this.moodConductor) {
            return;
        }
        if (isActive) {
            this.moodConductor.deactivatePerformanceArc({ reason: 'manual-stop' });
        } else {
            this.moodConductor.activatePerformanceArc(arcId);
        }
    }

    applyCollaborationEntry(collabId, entryId) {
        if (!this.moodConductor) {
            this.initializeMoodConductor();
            return;
        }
        try {
            this.moodConductor.applyCollaboratorEntry(collabId, entryId, { record: true });
            this.showCollaborationStatus('Remote revision applied.');
        } catch (error) {
            console.error('Failed to apply collaboration entry:', error);
            this.showCollaborationStatus('Failed to apply remote revision.', { error: true });
        }
    }

    showCollaborationStatus(message, { error = false } = {}) {
        const status = this.elements.collaboration?.status;
        if (!status) {
            return;
        }
        status.textContent = message;
        status.dataset.state = error ? 'error' : 'ok';
    }

    parseCollaborationPayload(raw) {
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            throw new Error('Payload must be valid JSON.');
        }
        const sanitized = this.sanitizeCollaborationPayload(parsed);
        if (!sanitized) {
            throw new Error('Collaboration payload did not include any usable entries.');
        }
        return sanitized;
    }

    sanitizeCollaborationPayload(payload) {
        if (Array.isArray(payload)) {
            const sanitizedArray = payload
                .map(item => this.sanitizeCollaborationPayload(item))
                .filter(Boolean);
            if (!sanitizedArray.length) {
                throw new Error('No valid collaboration entries were provided.');
            }
            return sanitizedArray;
        }

        if (!payload || typeof payload !== 'object') {
            throw new Error('Collaboration entry must be an object or array of objects.');
        }

        const entry = { ...payload };

        if (entry.profile) {
            entry.profile = this.sanitizeCollaboratorProfile(entry.profile);
        }
        if (entry.palette) {
            entry.palette = this.sanitizePalette(entry.palette);
        }
        if (entry.parameters) {
            entry.parameters = this.sanitizeNumberDictionary(entry.parameters);
        }
        if (entry.reactivity) {
            entry.reactivity = this.sanitizeNumberDictionary(entry.reactivity, { clampMin: 0, clampMax: 4 });
        }
        if (entry.mood) {
            entry.mood = this.sanitizeMood(entry.mood);
        }

        if (entry.prompt) {
            entry.prompt = this.truncateText(entry.prompt, 280);
        }
        if (entry.notes) {
            entry.notes = this.truncateText(entry.notes, 280);
        }
        if (entry.collaboratorName) {
            entry.collaboratorName = this.truncateText(entry.collaboratorName, 80);
        }

        const hasContent = Boolean(
            entry.profile
            || (entry.parameters && Object.keys(entry.parameters).length)
            || (entry.mood && Object.keys(entry.mood).length)
            || entry.prompt
            || (entry.palette && Object.keys(entry.palette).length)
        );

        if (!hasContent) {
            throw new Error('Collaboration entry must include parameters, a mood, or a prompt.');
        }

        return entry;
    }

    sanitizeCollaboratorProfile(profile) {
        if (!profile || typeof profile !== 'object') {
            return null;
        }

        const parameters = this.sanitizeNumberDictionary(profile.parameters || profile.parameterTargets || {});
        const reactivity = this.sanitizeNumberDictionary(profile.reactivity || {}, { clampMin: 0, clampMax: 4 });
        const palette = this.sanitizePalette(profile.palette);
        const mood = this.sanitizeMood(profile.mood);
        const metrics = this.sanitizeNumberDictionary(profile.metrics || {}, { clampMin: -9999, clampMax: 9999 });
        const keywords = Array.isArray(profile.keywords)
            ? profile.keywords
                .map(keyword => this.truncateText(keyword, 40))
                .filter(Boolean)
                .slice(0, 12)
            : [];

        const sanitized = {
            id: typeof profile.id === 'string' ? profile.id : undefined,
            prompt: profile.prompt ? this.truncateText(profile.prompt, 280) : '',
            source: profile.source ? this.truncateText(profile.source, 80) : undefined,
            timestamp: Number.isFinite(profile.timestamp) ? profile.timestamp : Date.now(),
            parameters: Object.keys(parameters).length ? parameters : undefined,
            reactivity: Object.keys(reactivity).length ? reactivity : undefined,
            palette,
            mood,
            metrics: Object.keys(metrics).length ? metrics : undefined,
            keywords,
            metadata: profile.metadata && typeof profile.metadata === 'object' ? { ...profile.metadata } : undefined
        };

        if (sanitized.palette && !Object.keys(sanitized.palette).length) {
            delete sanitized.palette;
        }
        if (sanitized.mood && !Object.keys(sanitized.mood).length) {
            delete sanitized.mood;
        }
        if (sanitized.metadata && !Object.keys(sanitized.metadata).length) {
            delete sanitized.metadata;
        }
        if (!sanitized.prompt) {
            delete sanitized.prompt;
        }
        if (!keywords.length) {
            delete sanitized.keywords;
        }

        const hasData = sanitized.parameters
            || sanitized.reactivity
            || sanitized.palette
            || sanitized.mood
            || keywords.length
            || sanitized.metrics;

        return hasData ? sanitized : null;
    }

    sanitizePalette(palette) {
        if (!palette || typeof palette !== 'object') {
            return null;
        }
        const sanitized = {};
        if (palette.primaryHue !== undefined) {
            sanitized.primaryHue = this.normalizeHue(Number(palette.primaryHue));
        }
        if (palette.accentHue !== undefined) {
            sanitized.accentHue = this.normalizeHue(Number(palette.accentHue));
        }
        if (palette.saturation !== undefined) {
            sanitized.saturation = this.clampNumber(palette.saturation, 0, 1);
        }
        if (palette.intensity !== undefined) {
            sanitized.intensity = this.clampNumber(palette.intensity, 0, 1.5);
        }
        if (palette.narrative) {
            sanitized.narrative = this.truncateText(palette.narrative, 160);
        }
        return Object.keys(sanitized).length ? sanitized : null;
    }

    sanitizeMood(mood) {
        if (!mood || typeof mood !== 'object') {
            return null;
        }
        const sanitized = {};
        if (mood.label) {
            sanitized.label = this.truncateText(mood.label, 160);
        }
        if (mood.description) {
            sanitized.description = this.truncateText(mood.description, 360);
        }
        if (mood.energy !== undefined) {
            sanitized.energy = this.clampNumber(mood.energy, 0, 1);
        }
        if (mood.colorTemperature) {
            sanitized.colorTemperature = this.truncateText(mood.colorTemperature, 80);
        }
        if (Array.isArray(mood.keywords) && mood.keywords.length) {
            sanitized.keywords = mood.keywords
                .map(keyword => this.truncateText(keyword, 40))
                .filter(Boolean)
                .slice(0, 12);
        }
        return Object.keys(sanitized).length ? sanitized : null;
    }

    sanitizeNumberDictionary(source, { clampMin = -Infinity, clampMax = Infinity } = {}) {
        if (!source || typeof source !== 'object') {
            return {};
        }
        const result = {};
        Object.entries(source).forEach(([key, value]) => {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) {
                return;
            }
            const clamped = Math.max(clampMin, Math.min(clampMax, numeric));
            result[key] = clamped;
        });
        return result;
    }

    truncateText(text, limit = 120) {
        if (text === undefined || text === null) {
            return '';
        }
        const value = String(text).trim();
        if (!value) {
            return '';
        }
        if (value.length <= limit) {
            return value;
        }
        return `${value.slice(0, limit - 1)}…`;
    }

    clampNumber(value, min, max) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return undefined;
        }
        return Math.max(min, Math.min(max, numeric));
    }

    canPersistCollaborations() {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    }

    persistCollaborations(sessions = null) {
        if (!this.canPersistCollaborations()) {
            return;
        }

        const snapshot = this.prepareCollaborationsForPersistence(sessions || this.latestCollaborations || []);
        try {
            if (!snapshot.length) {
                window.localStorage.removeItem(this.collaborationStorageKey);
                return;
            }
            const payload = JSON.stringify({ version: 1, savedAt: Date.now(), sessions: snapshot });
            window.localStorage.setItem(this.collaborationStorageKey, payload);
        } catch (error) {
            console.warn('Unable to persist collaboration sessions:', error);
        }
    }

    prepareCollaborationsForPersistence(sessions) {
        if (!Array.isArray(sessions)) {
            return [];
        }
        return sessions
            .map(session => this.prepareCollaborationSessionForPersistence(session))
            .filter(Boolean);
    }

    prepareCollaborationSessionForPersistence(session) {
        if (!session || typeof session !== 'object') {
            return null;
        }
        const entries = Array.isArray(session.entries)
            ? session.entries
                .map(entry => this.prepareCollaborationEntryForPersistence(entry))
                .filter(Boolean)
            : [];
        if (!entries.length) {
            return null;
        }
        return {
            id: session.id || null,
            name: session.name || 'Remote Artist',
            color: session.color || null,
            averageRating: Number.isFinite(session.averageRating) ? session.averageRating : null,
            lastAppliedEntryId: session.lastAppliedEntryId || null,
            lastAppliedProfileId: session.lastAppliedProfileId || null,
            entries
        };
    }

    prepareCollaborationEntryForPersistence(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }
        const profile = this.sanitizeCollaboratorProfile(entry.profile);
        if (!profile) {
            return null;
        }
        return {
            id: entry.id || null,
            profileId: entry.profileId || profile.id || null,
            prompt: entry.prompt ? this.truncateText(entry.prompt, 280) : '',
            notes: entry.notes ? this.truncateText(entry.notes, 280) : '',
            timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now(),
            revision: Number.isFinite(entry.revision) ? entry.revision : null,
            lastAppliedAt: Number.isFinite(entry.lastAppliedAt) ? entry.lastAppliedAt : null,
            profile
        };
    }

    restorePersistedCollaborations() {
        if (!this.canPersistCollaborations() || !this.moodConductor) {
            return;
        }
        let raw;
        try {
            raw = window.localStorage.getItem(this.collaborationStorageKey);
        } catch (error) {
            console.warn('Unable to access persisted collaborations:', error);
            return;
        }
        if (!raw) {
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            const sessions = this.sanitizePersistedSessions(parsed?.sessions);
            if (!sessions.length) {
                return;
            }
            this.moodConductor.ingestCollaborationsSnapshot(sessions);
        } catch (error) {
            console.warn('Failed to restore collaboration sessions:', error);
        }
    }

    sanitizePersistedSessions(sessions) {
        if (!Array.isArray(sessions)) {
            return [];
        }
        return sessions
            .map(session => this.sanitizePersistedSession(session))
            .filter(Boolean);
    }

    sanitizePersistedSession(session) {
        if (!session || typeof session !== 'object') {
            return null;
        }
        const entries = Array.isArray(session.entries)
            ? session.entries
                .map(entry => this.sanitizePersistedEntry(entry))
                .filter(Boolean)
            : [];
        if (!entries.length) {
            return null;
        }
        return {
            id: session.id || null,
            name: session.name ? this.truncateText(session.name, 120) : undefined,
            color: session.color || undefined,
            averageRating: Number.isFinite(session.averageRating) ? session.averageRating : null,
            lastAppliedEntryId: session.lastAppliedEntryId || null,
            lastAppliedProfileId: session.lastAppliedProfileId || null,
            entries
        };
    }

    sanitizePersistedEntry(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }
        const profile = this.sanitizeCollaboratorProfile(entry.profile);
        if (!profile) {
            return null;
        }
        return {
            id: entry.id || null,
            profileId: entry.profileId || profile.id || null,
            prompt: entry.prompt ? this.truncateText(entry.prompt, 280) : '',
            notes: entry.notes ? this.truncateText(entry.notes, 280) : '',
            timestamp: Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now(),
            revision: Number.isFinite(entry.revision) ? entry.revision : null,
            lastAppliedAt: Number.isFinite(entry.lastAppliedAt) ? entry.lastAppliedAt : null,
            profile
        };
    }

    renderFeedbackStats(stats = {}) {
        const averageEl = this.elements.feedback?.average;
        const totalEl = this.elements.feedback?.total;
        const trendingEl = this.elements.feedback?.trending;
        if (averageEl) {
            averageEl.textContent = Number.isFinite(stats.average) ? `${Math.round(stats.average * 100)}%` : '--';
        }
        if (totalEl) {
            totalEl.textContent = stats.total ?? 0;
        }
        if (trendingEl) {
            const trending = Array.isArray(stats.trending) ? stats.trending.slice(0, 4) : [];
            trendingEl.innerHTML = trending.length
                ? trending.map(item => `<span>${this.escapeHtml(item.keyword)}</span>`).join('')
                : '<span>No feedback yet</span>';
        }
    }

    handleFeedbackSubmit(event) {
        event.preventDefault();
        if (!this.moodConductor) {
            this.initializeMoodConductor();
            return;
        }
        if (!this.moodConductor) {
            this.showFeedbackStatus('Feedback channel unavailable.', { error: true });
            return;
        }

        const ratingValue = Number(this.elements.feedback?.rating?.value ?? 50) / 100;
        const motionValue = Number(this.elements.feedback?.motion?.value ?? 50) / 100;
        const colorValue = Number(this.elements.feedback?.color?.value ?? 50) / 100;
        const notesValue = this.elements.feedback?.notes?.value?.trim() || '';
        const profileId = this.moodConductor.getActiveProfile()?.id;

        try {
            this.moodConductor.recordMoodFeedback({
                rating: ratingValue,
                motionBias: motionValue,
                colorBias: colorValue,
                notes: notesValue,
                profileId
            });
            this.showFeedbackStatus('Feedback captured. Thank you!');
            if (this.elements.feedback?.rating) this.elements.feedback.rating.value = 50;
            if (this.elements.feedback?.motion) this.elements.feedback.motion.value = 50;
            if (this.elements.feedback?.color) this.elements.feedback.color.value = 50;
            if (this.elements.feedback?.notes) this.elements.feedback.notes.value = '';
        } catch (error) {
            console.error('Failed to record feedback:', error);
            this.showFeedbackStatus('Feedback could not be saved.', { error: true });
        }
    }

    showFeedbackStatus(message, { error = false } = {}) {
        const status = this.elements.feedback?.status;
        if (!status) {
            return;
        }
        status.textContent = message;
        status.dataset.state = error ? 'error' : 'ok';
    }

    highlightJournalEntry(entryId, { persistOnly = false } = {}) {
        if (!this.elements.moodJournalList) {
            return;
        }
        if (!persistOnly) {
            this.lastHighlightedEntryId = entryId;
        }
        const activeId = persistOnly ? this.lastHighlightedEntryId : entryId;
        const items = this.elements.moodJournalList.querySelectorAll('.mood-history-item');
        items.forEach(node => {
            node.classList.toggle('is-active', !!activeId && node.dataset.entryId === activeId);
        });
    }

    highlightStoryboardEntry(entryId, { persistOnly = false } = {}) {
        const list = this.elements.storyboardList;
        if (!list) {
            return;
        }
        if (!persistOnly) {
            this.lastStoryboardEntryId = entryId;
        }
        const activeId = persistOnly ? this.lastStoryboardEntryId : entryId;
        const items = list.querySelectorAll('.storyboard-entry');
        items.forEach(node => {
            node.classList.toggle('is-active', !!activeId && node.dataset.entryId === activeId);
        });
    }

    formatDeltaSummary(deltas = {}) {
        if (!deltas || typeof deltas !== 'object') {
            return 'Δ subtle';
        }

        const entries = Object.entries(deltas)
            .filter(([, info]) => info && Number.isFinite(info.delta) && Math.abs(info.delta) > 1e-3)
            .map(([param, info]) => ({
                param,
                delta: info.delta
            }))
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
            .slice(0, 3);

        if (!entries.length) {
            return 'Δ subtle';
        }

        const formatParam = (param) => param
            .replace(/([A-Z])/g, ' $1')
            .replace(/^rot4d/, 'rot4d ')
            .trim();

        const unit = (param) => (param.toLowerCase().includes('hue') ? '°' : '');

        const formatValue = (param, value) => {
            const magnitude = Math.abs(value);
            const decimals = magnitude >= 10 ? 0 : magnitude >= 1 ? 1 : 2;
            const formatted = value.toFixed(decimals);
            return `${value > 0 ? '+' : ''}${formatted}${unit(param)}`;
        };

        return entries
            .map(({ param, delta }) => `${formatParam(param)} ${formatValue(param, delta)}`)
            .join(' · ');
    }

    formatTimestampShort(timestamp) {
        if (!timestamp) {
            return '--:--';
        }
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            return '--:--';
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    calculateArcTotalDuration(arc) {
        if (!arc || !Array.isArray(arc.stages)) {
            return 0;
        }
        return arc.stages.reduce((sum, stage) => {
            const duration = Number.isFinite(stage?.duration) ? stage.duration : 0;
            return sum + Math.max(0, duration);
        }, 0);
    }

    formatDurationSeconds(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
            return '—';
        }
        if (seconds < 60) {
            return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds - minutes * 60;
        const rounded = Math.round(remaining);
        const padded = rounded.toString().padStart(2, '0');
        return `${minutes}:${padded}`;
    }

    escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    updateMoodProfile(profile) {
        if (!profile || !profile.mood) {
            return;
        }

        this.activeProfileId = profile.id;

        if (this.elements.moodLabel) {
            this.elements.moodLabel.textContent = profile.mood.label || 'Custom Sculpt';
        }

        if (this.elements.moodDescription) {
            this.elements.moodDescription.textContent = profile.mood.description || 'Describe a feeling to sculpt the stage.';
        }

        if (this.elements.moodEnergy) {
            const energy = typeof profile.mood.energy === 'number'
                ? Math.round(profile.mood.energy * 100)
                : Math.round((profile.metrics?.energy ?? 0.5) * 100);
            this.elements.moodEnergy.textContent = `${energy}% ENERGY`;
        }

        if (this.elements.moodTemperature) {
            const temp = profile.mood.colorTemperature || 'ambient';
            this.elements.moodTemperature.textContent = temp.toUpperCase();
            this.elements.moodTemperature.dataset.temperature = temp.toLowerCase();
        }

        if (this.elements.moodKeywords) {
            const keywords = Array.isArray(profile.mood.keywords) ? profile.mood.keywords : [];
            if (keywords.length) {
                this.elements.moodKeywords.innerHTML = keywords
                    .slice(0, 4)
                    .map(keyword => `<span>${keyword}</span>`)
                    .join('');
            } else {
                this.elements.moodKeywords.innerHTML = '<span>adaptive</span><span>audio-linked</span>';
            }
        }

        if (this.elements.moodPrompt) {
            this.elements.moodPrompt.textContent = profile.prompt ? `“${profile.prompt}”` : 'Promptless mood';
        }

        if (this.elements.moodSource) {
            const source = profile.source || 'manual';
            this.elements.moodSource.textContent = source.replace(/[-_]/g, ' ');
        }

        if (this.elements.moodTimestamp) {
            const ts = profile.timestamp || Date.now();
            const timeText = this.formatTimestampShort(ts);
            this.elements.moodTimestamp.textContent = timeText;
            this.elements.moodTimestamp.dateTime = new Date(ts).toISOString();
        }

        if (this.elements.moodDelta) {
            this.elements.moodDelta.textContent = this.formatDeltaSummary(profile.deltas);
        }

        if (this.elements.audioStatusBottom) {
            this.elements.audioStatusBottom.textContent = `Sonic mood: ${profile.mood.label || 'Custom Sculpt'}`;
        }

        this.syncQuickAdjustUI(profile.quickAdjust);
        if (profile.storyboardEntryId) {
            this.highlightStoryboardEntry(profile.storyboardEntryId);
        }

        if (this.choreographer?.sonicHUD?.updateMoodProvenance) {
            this.choreographer.sonicHUD.updateMoodProvenance({
                label: profile.mood?.label,
                prompt: profile.prompt,
                source: profile.source,
                timestamp: profile.timestamp,
                energy: profile.mood?.energy ?? profile.metrics?.energy,
                deltas: profile.deltas
            });
        }
    }

    updateDuration() {
        if (!this.audioElement || !this.elements.timecodeDuration) return;
        const duration = Number.isFinite(this.audioElement.duration) ? this.audioElement.duration : this.choreographer.duration;
        if (!duration || !Number.isFinite(duration)) {
            this.elements.timecodeDuration.textContent = '--:--';
            return;
        }
        this.elements.timecodeDuration.textContent = this.formatTime(duration);
    }

    refreshTimecode() {
        if (!this.audioElement) return;
        const current = this.audioElement.currentTime || 0;
        const duration = Number.isFinite(this.audioElement.duration) ? this.audioElement.duration : this.choreographer.duration;
        if (this.elements.timecodeCurrent) {
            this.elements.timecodeCurrent.textContent = this.formatTime(current);
        }
        if (duration && Number.isFinite(duration) && this.elements.progressBar) {
            const progress = Math.max(0, Math.min(1, current / duration));
            this.elements.progressBar.style.transform = `scaleX(${progress})`;
        }
    }

    formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return '--:--';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    startTelemetryLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const loop = () => {
            this.animationFrame = requestAnimationFrame(loop);
            const matrix = this.choreographer?.sonicMatrix;
            if (!matrix) return;
            const frame = matrix.getLastFrameInfo();
            if (!frame) return;
            this.renderFrame(frame);
        };

        loop();
    }

    stopTelemetryLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    renderFrame(frame) {
        const audio = frame.audio || {};
        const finalParams = frame.finalParams || {};
        const surfaces = frame.surfaces || {};

        this.updateMetric(this.elements.metricEnergyValue, this.elements.metricEnergyBar, audio.energy || 0, 100, '%');
        this.updateMetric(this.elements.metricIntensityValue, this.elements.metricIntensityBar, finalParams.intensity || 0, 100, '%');

        this.updatePadTelemetry('controller', surfaces.controller);
        this.updatePadTelemetry('canvas', surfaces.canvas);

        this.updateModeDisplay();
        if (this.moodConductor) {
            this.moodConductor.updateLiveContext(frame);
            const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
                ? performance.now()
                : Date.now();
            this.moodConductor.advancePerformanceArc(now);
        }
        this.updateLiveContextDisplay(audio.context || {}, audio);
    }

    updateLiveContextDisplay(context = {}, audio = {}) {
        const bpmEl = this.elements.liveContext?.bpm;
        if (bpmEl) {
            const bpmValue = Number.isFinite(context.bpm) && context.bpm > 0
                ? Math.round(context.bpm)
                : '—';
            bpmEl.textContent = bpmValue === '—' ? '—' : `${bpmValue}`;
        }

        const spectralEl = this.elements.liveContext?.spectral;
        if (spectralEl) {
            const balance = context.spectralBalance || {};
            if (balance && Object.keys(balance).length) {
                const parts = [
                    `B${Math.round((balance.bass ?? 0) * 100)}`,
                    `M${Math.round((balance.mid ?? 0) * 100)}`,
                    `H${Math.round((balance.high ?? 0) * 100)}`
                ];
                const signature = context.spectralSignature || balance.signature || 'balanced';
                spectralEl.textContent = `${signature.toUpperCase()} · ${parts.join('/')}`;
            } else {
                spectralEl.textContent = 'BALANCED';
            }
        }

        const genreEl = this.elements.liveContext?.genre;
        if (genreEl) {
            const genre = context.estimatedGenre || context.genre || 'ambient';
            genreEl.textContent = genre.toUpperCase();
        }
    }

    updateMetric(valueElement, barElement, rawValue, scale, suffix) {
        if (valueElement) {
            const percent = Math.max(0, Math.min(1, rawValue));
            valueElement.textContent = `${Math.round(percent * scale)}${suffix}`;
        }
        if (barElement) {
            const clamped = Math.max(0, Math.min(1, rawValue));
            barElement.style.transform = `scaleX(${clamped})`;
        }
    }

    updatePadTelemetry(surfaceId, surfaceData = {}) {
        const position = surfaceData.position || { x: 0.5, y: 0.5 };
        const readout = this.elements.padReadouts?.[surfaceId];
        if (readout) {
            const x = Math.round(position.x * 100);
            const y = Math.round(position.y * 100);
            readout.textContent = `${x} · ${y}`;
        }
        const cursor = this.elements.padCursors?.[surfaceId];
        if (cursor) {
            cursor.style.left = `${position.x * 100}%`;
            cursor.style.top = `${(1 - position.y) * 100}%`;
        }
    }
}
