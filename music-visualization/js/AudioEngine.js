/**
 * AudioEngine - Manages Web Audio API for audio analysis
 * Handles audio loading, playback, and frequency data extraction
 */
export class AudioEngine {
    constructor(audioElement) {
        this.audioElement = audioElement;
        this.context = null;
        this.source = null;
        this.analyser = null;
        this.gainNode = null;
        this.isInitialized = false;

        // Frequency data buffers (reused to avoid garbage collection)
        this.frequencyData = null;
        this.timeData = null;

        // Frequency band configuration
        // With FFT size 2048 and 44100Hz sample rate, each bin = ~21.5Hz
        this.bands = {
            bass: { min: 20, max: 250 },      // Kick drums, bass
            lowMid: { min: 250, max: 500 },   // Warmth
            mid: { min: 500, max: 2000 },     // Melody
            highMid: { min: 2000, max: 4000 },// Presence
            high: { min: 4000, max: 16000 }   // Texture, hi-hats
        };

        this.bandIndices = null;
    }

    /**
     * Initialize the Web Audio API context
     * Must be called after a user gesture (click/touch)
     */
    async init() {
        if (this.isInitialized) return;

        // Create audio context
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        // Create analyser node
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8; // Smooth for lofi feel
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;

        // Create gain node for volume control
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 0.7; // Default 70% volume

        // Connect audio element to Web Audio graph
        this.source = this.context.createMediaElementSource(this.audioElement);
        this.source.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        // Initialize data buffers
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.fftSize);

        // Pre-calculate band indices
        this.bandIndices = this.calculateBandIndices();

        this.isInitialized = true;
    }

    /**
     * Calculate the FFT bin indices for each frequency band
     */
    calculateBandIndices() {
        const sampleRate = this.context.sampleRate;
        const nyquist = sampleRate / 2;
        const binWidth = nyquist / this.analyser.frequencyBinCount;

        const indices = {};
        for (const [band, range] of Object.entries(this.bands)) {
            indices[band] = {
                start: Math.floor(range.min / binWidth),
                end: Math.min(Math.floor(range.max / binWidth), this.analyser.frequencyBinCount - 1)
            };
        }
        return indices;
    }

    /**
     * Update frequency and time domain data from analyser
     * Call this once per animation frame
     */
    update() {
        if (!this.isInitialized) return;
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeData);
    }

    /**
     * Get the energy level for a specific frequency band (0-1)
     */
    getBandEnergy(bandName) {
        if (!this.bandIndices || !this.bandIndices[bandName]) return 0;

        const { start, end } = this.bandIndices[bandName];
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += this.frequencyData[i];
        }
        return (sum / (end - start + 1)) / 255;
    }

    /**
     * Get overall audio energy (0-1)
     */
    getOverallEnergy() {
        let sum = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
        }
        return (sum / this.frequencyData.length) / 255;
    }

    /**
     * Get raw frequency data array
     */
    getFrequencyData() {
        return this.frequencyData;
    }

    /**
     * Get raw time domain (waveform) data
     */
    getTimeData() {
        return this.timeData;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * Play audio
     */
    play() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.audioElement.play();
    }

    /**
     * Pause audio
     */
    pause() {
        this.audioElement.pause();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.audioElement.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    /**
     * Check if audio is playing
     */
    isPlaying() {
        return !this.audioElement.paused;
    }

    /**
     * Get current playback time
     */
    getCurrentTime() {
        return this.audioElement.currentTime;
    }

    /**
     * Get total duration
     */
    getDuration() {
        return this.audioElement.duration || 0;
    }
}
