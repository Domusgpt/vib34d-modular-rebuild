import { clamp } from '../utils/math.js';

export class SonicMoodStoryboard {
    constructor() {
        this.entries = [];
        this.liveContext = null;
    }

    setLiveContext(context = null) {
        this.liveContext = context ? { ...context } : null;
    }

    getEntries() {
        return this.entries.map(entry => ({
            ...entry,
            envelopes: this.cloneEnvelopes(entry.envelopes)
        }));
    }

    getSummary(maxEntries = 6) {
        return this.getEntries()
            .slice(0, maxEntries)
            .map(entry => ({
                id: entry.id,
                label: entry.label,
                startTime: entry.startTime,
                duration: entry.duration,
                manualInfluence: entry.manualInfluence,
                profileId: entry.profileId
            }));
    }

    findEntryByProfileId(profileId) {
        if (!profileId) return null;
        return this.entries.find(entry => entry.profileId === profileId) || null;
    }

    getEntry(entryId) {
        if (!entryId) return null;
        const entry = this.entries.find(item => item.id === entryId);
        if (!entry) return null;
        const snapshot = entry.profileSnapshot || null;
        return {
            ...entry,
            envelopes: this.cloneEnvelopes(entry.envelopes),
            profileSnapshot: snapshot
                ? {
                    mood: snapshot.mood ? { ...snapshot.mood } : null,
                    palette: snapshot.palette ? { ...snapshot.palette } : null,
                    parameters: snapshot.parameters ? { ...snapshot.parameters } : null
                }
                : null
        };
    }

    addOrUpdate(profile, options = {}) {
        if (!profile) return null;

        const profileId = profile.id || profile.profileId;
        const existing = this.findEntryByProfileId(profileId);

        if (existing) {
            this.applyPatch(existing, profile, options);
            this.sortEntries();
            return { ...existing, envelopes: this.cloneEnvelopes(existing.envelopes) };
        }

        const entry = this.composeEntry(profile, options);
        this.entries.push(entry);
        this.sortEntries();
        return { ...entry, envelopes: this.cloneEnvelopes(entry.envelopes) };
    }

    applyPatch(entry, profile, options = {}) {
        entry.label = profile?.mood?.label || entry.label;
        entry.prompt = profile?.prompt || entry.prompt;
        entry.profileSnapshot = this.captureProfileSnapshot(profile);
        if (options.envelopes) {
            entry.envelopes = this.cloneEnvelopes(options.envelopes);
        }
        if (Number.isFinite(options.manualInfluence)) {
            entry.manualInfluence = clamp(options.manualInfluence, 0, 1);
        }
        if (Number.isFinite(options.startTime)) {
            entry.startTime = Math.max(0, options.startTime);
        }
        if (Number.isFinite(options.duration)) {
            entry.duration = Math.max(0.5, options.duration);
        }
    }

    composeEntry(profile, options = {}) {
        const profileId = profile.id || profile.profileId || `profile-${Date.now().toString(36)}`;
        const id = options.id || `story-${profileId}-${Math.random().toString(16).slice(2, 8)}`;
        const startTime = Number.isFinite(options.startTime)
            ? Math.max(0, options.startTime)
            : this.nextAutoStart();
        const duration = this.estimateDuration(profile, options);

        return {
            id,
            profileId,
            label: profile?.mood?.label || 'Sonic Mood',
            prompt: profile?.prompt || '',
            startTime,
            duration,
            createdAt: Date.now(),
            profileSnapshot: this.captureProfileSnapshot(profile),
            envelopes: this.cloneEnvelopes(options.envelopes),
            manualInfluence: clamp(options.manualInfluence ?? 0, 0, 1)
        };
    }

    captureProfileSnapshot(profile) {
        if (!profile) return null;
        return {
            mood: profile.mood ? { ...profile.mood } : null,
            palette: profile.palette ? { ...profile.palette } : null,
            parameters: profile.parameters ? { ...profile.parameters } : null
        };
    }

    cloneEnvelopes(envelopes = {}) {
        const clone = {};
        Object.entries(envelopes || {}).forEach(([param, info]) => {
            clone[param] = { ...info };
        });
        return clone;
    }

    sortEntries() {
        this.entries.sort((a, b) => a.startTime - b.startTime);
    }

    nextAutoStart() {
        if (!this.entries.length) {
            return 0;
        }
        return this.entries.reduce((max, entry) => Math.max(max, entry.startTime + entry.duration), 0);
    }

    estimateDuration(profile, options = {}) {
        if (Number.isFinite(options.duration)) {
            return Math.max(0.5, options.duration);
        }

        const bpm = options.bpm || this.liveContext?.bpm || 0;
        const energy = profile?.mood?.energy ?? profile?.metrics?.energy ?? 0.5;
        const bars = clamp(Math.round(12 - energy * 6), 6, 16);

        if (bpm > 0) {
            return Math.max(0.5, (bars * 60) / bpm);
        }

        return Math.max(0.5, 12 + (1 - energy) * 18);
    }
}
