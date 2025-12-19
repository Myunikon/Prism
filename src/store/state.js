import { reactive } from 'vue';
import { get, set } from 'idb-keyval';

const STORAGE_KEY = 'qrops_state';
const HISTORY_KEY = 'qrops_history';

export const store = reactive({
    // UI State
    currentTab: 'cam',
    isScanning: false,
    isSidebarOpen: false,
    isGuideOpen: false,
    lastResult: null,
    isLoaded: false, // Flag to check if state is restored

    // Config with defaults (will be merged with saved)
    config: {
        autoScan: true,
        vibration: true,
        vtProxyUrl: '',
        darkMode: false,
        language: 'en',
        fontSize: 'medium',
        animations: true,
        // Log Retention Policy
        logRetentionDays: 30, // 0 = never, 7, 14, 30, 90
        logMaxEntries: 100, // 50, 100, 200, 500
        facingMode: 'environment', // Store camera preference
        cameraId: null // Store specific camera device ID
    },

    // History
    history: [],

    // Actions
    setTab(tab) {
        this.currentTab = tab;
        this.persistState();
    },

    setConfig(key, value) {
        this.config[key] = value;
        this.persistState();
        
        // Apply settings immediately
        if (key === 'fontSize') {
            this.applyFontSize(value);
        }
        if (key === 'darkMode') {
            this.applyDarkMode(value);
        }
        // Apply retention policy when changed
        if (key === 'logRetentionDays' || key === 'logMaxEntries') {
            this.applyRetentionPolicy();
        }
    },

    applyFontSize(size) {
        const sizes = { small: '14px', medium: '16px', large: '18px' };
        document.documentElement.style.fontSize = sizes[size] || '16px';
    },

    applyDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    },

    // Apply log retention policy
    applyRetentionPolicy() {
        const now = Date.now();
        const retentionDays = this.config.logRetentionDays;
        const maxEntries = this.config.logMaxEntries;
        
        let filtered = [...this.history];
        
        // Filter by retention days (if not 0 = never delete)
        if (retentionDays > 0) {
            const cutoff = now - (retentionDays * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(entry => entry.timestamp >= cutoff);
        }
        
        // Limit by max entries (keep most recent)
        if (filtered.length > maxEntries) {
            filtered = filtered.slice(-maxEntries);
        }
        
        // Only update if changed
        if (filtered.length !== this.history.length) {
            this.history = filtered;
            this.persistHistory();
        }
    },

    async persistState() {
        try {
            // Clone to avoid DataCloneError with Vue Proxy
            const configClone = JSON.parse(JSON.stringify(this.config));
            const stateToSave = {
                config: configClone,
                currentTab: this.currentTab
            };
            await set(STORAGE_KEY, stateToSave);
        } catch (e) { console.error('Failed to save state', e); }
    },

    addHistory(type, value, metadata = null) {
        // Avoid duplicate consecutive entries
        const lastEntry = this.history[this.history.length - 1];
        if (lastEntry && lastEntry.value === value && Date.now() - lastEntry.timestamp < 5000) {
            return; // Skip duplicate within 5 seconds
        }
        
        this.history.push({ type, value, metadata, timestamp: Date.now() });
        
        // Apply retention policy on add
        this.applyRetentionPolicy();
        
        this.persistHistory();
    },

    clearHistory() {
        this.history = [];
        this.persistHistory();
    },

    async persistHistory() {
        try {
            await set(HISTORY_KEY, JSON.parse(JSON.stringify(this.history))); // Cloning to avoid proxy issues with IDB
        } catch (e) { console.error('Failed to save history', e); }
    },

    // Clear all junk data (History + Cases) but KEEP Config
    async clearJunkData() {
        try {
            // 1. Clear History
            this.history = [];
            await set(HISTORY_KEY, []);

            // 2. Clear Cases (Direct IDB access as useCase might not be active)
            // We use 'set' to empty it or 'del' to remove. Empty array is safer for reactivity if loaded.
            await set('prism_cases', []);

            // 3. Clear any other temp keys if they existed (none currently)
            
            console.log("Junk data cleared");
            return true;
        } catch (e) {
            console.error("Failed to clear junk", e);
            throw e;
        }
    },

    setScanResult(text, metadata = null) {
        this.lastResult = { text, metadata };
    },

    // Initialize all settings on app load
    async init() {
        try {
            // Load Config & State
            const savedState = await get(STORAGE_KEY);
            if (savedState) {
                if (savedState.config) {
                    this.config = { ...this.config, ...savedState.config };
                }
                if (savedState.currentTab) {
                    this.currentTab = savedState.currentTab;
                }
            }

            // Load History
            const savedHistory = await get(HISTORY_KEY);
            if (savedHistory && Array.isArray(savedHistory)) {
                this.history = savedHistory;
            }

            // Apply loaded settings
            this.applyFontSize(this.config.fontSize);
            this.applyDarkMode(this.config.darkMode);
            this.applyRetentionPolicy();
            
            this.isLoaded = true;
        } catch (e) {
            console.error('Failed to initialize store', e);
        }
    }
});

// Initialize on module load
store.init();

