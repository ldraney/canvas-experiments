/**
 * Lofi Music Visualizer - Main Entry Point
 * Orchestrates audio engine, beat detection, and visualization
 */
import { AudioEngine } from './AudioEngine.js';
import { BeatDetector } from './BeatDetector.js';
import { Visualizer } from './Visualizer.js';

class LofiVisualizerApp {
    constructor() {
        // DOM elements
        this.canvas = document.getElementById('visualizer');
        this.audioElement = document.getElementById('audio');
        this.startScreen = document.getElementById('startScreen');
        this.startBtn = document.getElementById('startBtn');
        this.controls = document.getElementById('controls');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.timeDisplay = document.getElementById('timeDisplay');

        // Core components
        this.audioEngine = null;
        this.beatDetector = null;
        this.visualizer = null;

        // State
        this.isRunning = false;
        this.animationId = null;

        // Bind methods
        this.render = this.render.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Start on click anywhere on start screen
        this.startScreen.addEventListener('click', () => this.start());

        // Play/pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());

        // Volume slider
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (this.audioEngine) {
                this.audioEngine.setVolume(volume);
            }
        });

        // Audio ended - loop
        this.audioElement.addEventListener('ended', () => {
            this.audioElement.currentTime = 0;
            this.audioElement.play();
        });

        // Time update
        this.audioElement.addEventListener('timeupdate', () => {
            this.updateTimeDisplay();
        });

        // Resize handler
        window.addEventListener('resize', this.handleResize);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isRunning) {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    /**
     * Start the visualization
     */
    async start() {
        try {
            // Initialize audio engine
            this.audioEngine = new AudioEngine(this.audioElement);
            await this.audioEngine.init();

            // Initialize beat detector (tighter timing for better sync)
            this.beatDetector = new BeatDetector({
                sensitivity: 1.3,
                decayRate: 0.82,    // Faster decay = snappier response
                cooldownMs: 120     // Allow faster consecutive beats
            });

            // Initialize visualizer
            this.visualizer = new Visualizer(this.canvas);

            // Set initial volume
            this.audioEngine.setVolume(this.volumeSlider.value / 100);

            // Hide start screen, show controls
            this.startScreen.classList.add('hidden');
            this.controls.classList.remove('hidden');

            // Start playback
            await this.audioEngine.play();
            this.isRunning = true;
            this.updatePlayPauseIcon();

            // Start render loop
            this.render(performance.now());

        } catch (error) {
            console.error('Failed to start visualizer:', error);
            alert('Failed to start audio. Please try again.');
        }
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (!this.audioEngine) return;

        this.audioEngine.togglePlay();
        this.updatePlayPauseIcon();
    }

    /**
     * Update play/pause button icon
     */
    updatePlayPauseIcon() {
        if (!this.audioEngine) return;

        if (this.audioEngine.isPlaying()) {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
        } else {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
        }
    }

    /**
     * Update time display
     */
    updateTimeDisplay() {
        const current = this.formatTime(this.audioElement.currentTime);
        const duration = this.formatTime(this.audioElement.duration || 0);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    /**
     * Format seconds to mm:ss
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.visualizer) {
            this.visualizer.resize();
            this.visualizer.initParticles();
        }
    }

    /**
     * Main render loop
     */
    render(timestamp) {
        if (!this.isRunning) return;

        // Update audio data
        this.audioEngine.update();

        // Get audio data
        const audioData = {
            bass: this.audioEngine.getBandEnergy('bass'),
            mid: this.audioEngine.getBandEnergy('mid'),
            high: this.audioEngine.getBandEnergy('high'),
            overall: this.audioEngine.getOverallEnergy(),
            frequencyData: this.audioEngine.getFrequencyData()
        };

        // Update beat detector
        this.beatDetector.update(audioData.bass, timestamp);

        // Render visualization
        this.visualizer.render(audioData, this.beatDetector, timestamp);

        // Continue loop
        this.animationId = requestAnimationFrame(this.render);
    }

    /**
     * Stop visualization
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.audioEngine) {
            this.audioEngine.pause();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LofiVisualizerApp();
});
