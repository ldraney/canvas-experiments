/**
 * @fileoverview Wave Interference Demo
 * Multiple wave sources creating interference patterns
 *
 * LEARNING OBJECTIVES:
 * - Wave physics
 * - Superposition principle
 * - Interactive wave sources
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class WaveSource {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frequency = MathUtils.random(0.03, 0.06);
        this.amplitude = 1;
        this.phase = 0;
    }

    getValue(px, py, time) {
        const dist = MathUtils.distance(px, py, this.x, this.y);
        const wave = Math.sin(dist * this.frequency - time * 0.005 + this.phase);
        // Amplitude decreases with distance
        const falloff = 1 / (1 + dist * 0.01);
        return wave * this.amplitude * falloff;
    }
}

export class WaveInterferenceDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Wave Interference',
            description: 'Click to add wave sources and see interference patterns',
            difficulty: 'intermediate',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'waveSpeed', label: 'Wave Speed', min: 1, max: 10, default: 5 },
            { type: 'slider', name: 'frequency', label: 'Frequency', min: 0.02, max: 0.1, default: 0.05, step: 0.005 },
            { type: 'checkbox', name: 'colorMode', label: 'Color Mode', default: true },
            { type: 'checkbox', name: 'showSources', label: 'Show Sources', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            waveSpeed: 5,
            frequency: 0.05,
            colorMode: true,
            showSources: true
        };
    }

    init() {
        this.sources = [];
        this.imageData = null;

        // Create initial sources
        this.sources.push(new WaveSource(this.displayWidth * 0.3, this.displayHeight * 0.5));
        this.sources.push(new WaveSource(this.displayWidth * 0.7, this.displayHeight * 0.5));
    }

    onClick(x, y) {
        const source = new WaveSource(x, y);
        source.frequency = this.options.frequency;
        this.sources.push(source);

        // Limit to 10 sources
        if (this.sources.length > 10) {
            this.sources.shift();
        }
    }

    onOptionChange(name, value) {
        if (name === 'frequency') {
            this.sources.forEach(s => s.frequency = value);
        }
    }

    onResize() {
        this.imageData = null;
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        const { waveSpeed, colorMode, showSources } = this.options;
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const time = this.time * waveSpeed * 0.1;

        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const step = 2;

        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                // Sum waves from all sources (superposition)
                let totalValue = 0;

                for (const source of this.sources) {
                    totalValue += source.getValue(px, py, time);
                }

                // Normalize to 0-1
                const normalized = (totalValue / Math.max(this.sources.length, 1) + 1) / 2;

                let r, g, b;

                if (colorMode) {
                    // Color based on wave value
                    const hue = normalized * 240; // Blue to red
                    const rgb = ColorUtils.hslToRgb(hue, 80, 50);
                    r = rgb.r;
                    g = rgb.g;
                    b = rgb.b;
                } else {
                    // Grayscale
                    const brightness = Math.floor(normalized * 255);
                    r = g = b = brightness;
                }

                // Fill block of pixels
                for (let dy = 0; dy < step && py + dy < height; dy++) {
                    for (let dx = 0; dx < step && px + dx < width; dx++) {
                        const pixelIndex = ((py + dy) * width + (px + dx)) * 4;
                        data[pixelIndex] = r;
                        data[pixelIndex + 1] = g;
                        data[pixelIndex + 2] = b;
                        data[pixelIndex + 3] = 255;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Draw source indicators
        if (showSources) {
            this.sources.forEach((source, index) => {
                // Pulsing ring
                const pulse = Math.sin(this.time * 0.01) * 0.3 + 0.7;

                this.ctx.beginPath();
                this.ctx.arc(source.x, source.y, 15 * pulse, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(source.x, source.y, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();

                // Number
                this.ctx.fillStyle = '#000';
                this.ctx.font = 'bold 10px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText((index + 1).toString(), source.x, source.y + 3);
            });
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Sources: ${this.sources.length} | Click to add more`, 10, 20);
    }
}
