/**
 * Visualizer - Main canvas rendering with multiple visual layers
 * Creates a lofi aesthetic visualization responding to audio
 */
import { FilmGrain, Vignette, Scanlines, ChromaticShift } from './Effects.js';

// Color palette - warm lofi sunset theme
const PALETTE = {
    background: ['#0f0a1a', '#1a1028', '#2d1b3d'],
    accent: ['#ff6b6b', '#feca57', '#ff9ff3', '#b4a7d6'],
    particles: ['#ffffff', '#ffeaa7', '#fab1a0', '#dfe6e9', '#b4a7d6'],
    waveform: ['#ff6b6b', '#ff9ff3'],
    glow: '#ff6b6b'
};

/**
 * Particle class for floating dust/stars
 */
class Particle {
    constructor(width, height) {
        this.reset(width, height, true);
    }

    reset(width, height, randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : height + 10;
        this.baseSize = 1 + Math.random() * 2.5;
        this.size = this.baseSize;
        this.opacity = 0.2 + Math.random() * 0.5;
        this.drift = (Math.random() - 0.5) * 0.4;
        this.speed = 0.2 + Math.random() * 0.4;
        this.color = PALETTE.particles[Math.floor(Math.random() * PALETTE.particles.length)];
        this.phase = Math.random() * Math.PI * 2; // For sine wave movement
    }

    update(width, height, audioData, time) {
        const { mid, high, beatIntensity } = audioData;

        // Upward movement with mid-frequency influence
        this.y -= this.speed + mid * 0.5;

        // Horizontal drift with sine wave
        this.x += this.drift + Math.sin(time * 0.001 + this.phase) * 0.3;

        // Size pulse on beats
        this.size = this.baseSize * (1 + beatIntensity * 0.8);

        // Opacity shimmer from highs
        const shimmer = Math.sin(time * 0.003 + this.phase) * 0.15;
        this.currentOpacity = Math.min(1, this.opacity + high * 0.3 + shimmer);

        // Wrap around screen
        if (this.y < -10) this.reset(width, height, false);
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.currentOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * Expanding ring on beats
 */
class Ring {
    constructor(x, y, intensity) {
        this.x = x;
        this.y = y;
        this.radius = 80;
        this.opacity = 0.6 * intensity;
        this.speed = 2 + intensity * 4;
        this.lineWidth = 2 + intensity * 2;
    }

    update() {
        this.radius += this.speed;
        this.opacity *= 0.96;
        this.lineWidth *= 0.98;
        return this.opacity > 0.01;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTE.glow;
        ctx.lineWidth = this.lineWidth;
        ctx.globalAlpha = this.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

/**
 * Main Visualizer class
 */
export class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // State
        this.particles = [];
        this.rings = [];
        this.time = 0;
        this.smoothedEnergy = 0;
        this.smoothedBass = 0;
        this.smoothedMid = 0;
        this.smoothedHigh = 0;

        // Waveform history for smoothing
        this.waveformHistory = [];
        this.waveformHistoryLength = 3;

        // Effects
        this.filmGrain = new FilmGrain(0.035);
        this.vignette = new Vignette(0.4);
        this.scanlines = new Scanlines({ opacity: 0.05 });
        this.chromaticShift = new ChromaticShift();

        // Background gradient animation
        this.bgOffset = { x: 0, y: 0 };

        // Initialize
        this.resize();
        this.initParticles();
    }

    /**
     * Handle canvas resize
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.ctx.scale(dpr, dpr);

        // Reinitialize grain canvas
        this.filmGrain.init(rect.width, rect.height);

        // Reset display dimensions
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    /**
     * Initialize particle system
     */
    initParticles() {
        this.particles = [];
        const count = Math.min(180, Math.floor((this.displayWidth * this.displayHeight) / 6000));

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.displayWidth, this.displayHeight));
        }
    }

    /**
     * Main render loop
     */
    render(audioData, beatDetector, timestamp) {
        this.time = timestamp;

        // Smooth audio values
        this.smoothedBass = this.lerp(this.smoothedBass, audioData.bass, 0.15);
        this.smoothedMid = this.lerp(this.smoothedMid, audioData.mid, 0.12);
        this.smoothedHigh = this.lerp(this.smoothedHigh, audioData.high, 0.1);
        this.smoothedEnergy = this.lerp(this.smoothedEnergy, audioData.overall, 0.1);

        const smoothedData = {
            bass: this.smoothedBass,
            mid: this.smoothedMid,
            high: this.smoothedHigh,
            overall: this.smoothedEnergy,
            beatIntensity: beatDetector.getBeatIntensity(),
            frequencyData: audioData.frequencyData
        };

        // Spawn ring on beat
        if (beatDetector.isBeat()) {
            this.rings.push(new Ring(
                this.displayWidth / 2,
                this.displayHeight / 2,
                beatDetector.getBeatIntensity()
            ));
        }

        // Draw layers
        this.drawBackground(smoothedData);
        this.drawWaveformMountains(audioData.frequencyData, smoothedData);
        this.drawParticles(smoothedData);
        this.drawCentralCircle(smoothedData);
        this.drawRings();

        // Apply effects
        this.filmGrain.apply(this.ctx, this.displayWidth, this.displayHeight, timestamp);
        this.scanlines.apply(this.ctx, this.displayWidth, this.displayHeight, timestamp);
        this.vignette.apply(this.ctx, this.displayWidth, this.displayHeight);

        // Chromatic shift on strong beats
        if (smoothedData.beatIntensity > 0.3) {
            this.chromaticShift.apply(this.ctx, this.displayWidth, this.displayHeight, smoothedData.beatIntensity);
        }
    }

    /**
     * Draw breathing gradient background
     */
    drawBackground(audioData) {
        const { overall, beatIntensity } = audioData;

        // Animate gradient center
        this.bgOffset.x = Math.sin(this.time * 0.0003) * 100;
        this.bgOffset.y = Math.cos(this.time * 0.0002) * 60;

        const centerX = this.displayWidth / 2 + this.bgOffset.x;
        const centerY = this.displayHeight / 2 + this.bgOffset.y;

        // Expand radius on beats
        const baseRadius = Math.max(this.displayWidth, this.displayHeight) * 0.8;
        const radius = baseRadius * (1 + beatIntensity * 0.15 + overall * 0.1);

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );

        // Slightly brighter on beats
        const brightness = 1 + beatIntensity * 0.1;
        gradient.addColorStop(0, this.adjustBrightness(PALETTE.background[2], brightness));
        gradient.addColorStop(0.5, this.adjustBrightness(PALETTE.background[1], brightness));
        gradient.addColorStop(1, PALETTE.background[0]);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }

    /**
     * Draw waveform as mountain silhouettes
     */
    drawWaveformMountains(frequencyData, audioData) {
        if (!frequencyData || frequencyData.length === 0) return;

        const { beatIntensity, mid } = audioData;

        // Smooth frequency data
        const smoothed = this.smoothFrequencyData(frequencyData);

        // Store in history for additional smoothing
        this.waveformHistory.push([...smoothed]);
        if (this.waveformHistory.length > this.waveformHistoryLength) {
            this.waveformHistory.shift();
        }

        // Average across history
        const averaged = this.averageWaveformHistory();

        // Draw multiple mountain layers
        this.drawMountainLayer(averaged, 0.6, 0.35, PALETTE.waveform[1], 0.2, beatIntensity);
        this.drawMountainLayer(averaged, 0.75, 0.25, PALETTE.waveform[0], 0.35, beatIntensity);
    }

    /**
     * Draw a single mountain layer
     */
    drawMountainLayer(data, baseY, maxHeight, color, opacity, beatIntensity) {
        const points = 64;
        const sliceWidth = this.displayWidth / (points - 1);

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.displayHeight);

        for (let i = 0; i < points; i++) {
            // Sample from frequency data
            const dataIndex = Math.floor(i * (data.length / points));
            const value = data[dataIndex] / 255;

            const x = i * sliceWidth;
            const heightMult = maxHeight * (1 + beatIntensity * 0.2);
            const y = this.displayHeight * baseY - value * this.displayHeight * heightMult;

            if (i === 0) {
                this.ctx.lineTo(x, y);
            } else {
                // Quadratic curve for smoothness
                const prevX = (i - 1) * sliceWidth;
                const cpX = (prevX + x) / 2;
                this.ctx.quadraticCurveTo(prevX, this.prevY, cpX, (this.prevY + y) / 2);
            }

            this.prevY = y;
        }

        this.ctx.lineTo(this.displayWidth, this.displayHeight);
        this.ctx.closePath();

        // Gradient fill
        const gradient = this.ctx.createLinearGradient(
            0, this.displayHeight * (baseY - maxHeight),
            0, this.displayHeight
        );
        gradient.addColorStop(0, this.hexToRgba(color, opacity * 0.8));
        gradient.addColorStop(1, this.hexToRgba(color, 0.05));

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    /**
     * Smooth frequency data to reduce jitter
     */
    smoothFrequencyData(data) {
        const smoothed = new Array(data.length);
        const windowSize = 5;

        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            let count = 0;

            for (let j = -windowSize; j <= windowSize; j++) {
                const idx = i + j;
                if (idx >= 0 && idx < data.length) {
                    sum += data[idx];
                    count++;
                }
            }

            smoothed[i] = sum / count;
        }

        return smoothed;
    }

    /**
     * Average waveform across history frames
     */
    averageWaveformHistory() {
        if (this.waveformHistory.length === 0) return [];

        const length = this.waveformHistory[0].length;
        const averaged = new Array(length).fill(0);

        for (const frame of this.waveformHistory) {
            for (let i = 0; i < length; i++) {
                averaged[i] += frame[i];
            }
        }

        for (let i = 0; i < length; i++) {
            averaged[i] /= this.waveformHistory.length;
        }

        return averaged;
    }

    /**
     * Draw and update particles
     */
    drawParticles(audioData) {
        for (const particle of this.particles) {
            particle.update(this.displayWidth, this.displayHeight, audioData, this.time);
            particle.draw(this.ctx);
        }
    }

    /**
     * Draw central pulsing circle
     */
    drawCentralCircle(audioData) {
        const { bass, beatIntensity, overall } = audioData;
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        // Base radius scales with canvas size
        const baseRadius = Math.min(this.displayWidth, this.displayHeight) * 0.12;

        // Animate radius with bass and beats
        const radius = baseRadius * (0.8 + bass * 0.4 + beatIntensity * 0.3);

        // Outer glow
        const glowRadius = radius * 2;
        const glowGradient = this.ctx.createRadialGradient(
            centerX, centerY, radius,
            centerX, centerY, glowRadius
        );

        const glowOpacity = 0.2 + beatIntensity * 0.3;
        glowGradient.addColorStop(0, this.hexToRgba(PALETTE.glow, glowOpacity));
        glowGradient.addColorStop(1, this.hexToRgba(PALETTE.glow, 0));

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();

        // Inner fill with gradient
        const innerGradient = this.ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );

        innerGradient.addColorStop(0, PALETTE.accent[0]);
        innerGradient.addColorStop(1, PALETTE.accent[3]);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = innerGradient;
        this.ctx.globalAlpha = 0.6 + beatIntensity * 0.3;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // Outer ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2 + beatIntensity * 2;
        this.ctx.globalAlpha = 0.4 + beatIntensity * 0.4;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw and update expanding rings
     */
    drawRings() {
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const ring = this.rings[i];
            ring.draw(this.ctx);

            if (!ring.update()) {
                this.rings.splice(i, 1);
            }
        }
    }

    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Convert hex color to rgba string
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Adjust brightness of hex color
     */
    adjustBrightness(hex, factor) {
        const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor));
        const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor));
        const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
}
