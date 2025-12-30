/**
 * @fileoverview Fire Effect Demo
 * Procedural realistic flames
 *
 * LEARNING OBJECTIVES:
 * - Fire simulation algorithms
 * - Palette mapping
 * - Noise-based animation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class FireEffectDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Fire Effect',
            description: 'Procedural realistic flame simulation',
            difficulty: 'advanced',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'intensity', label: 'Intensity', min: 0.3, max: 1, default: 0.7, step: 0.05 },
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.5, max: 3, default: 1.5, step: 0.1 },
            { type: 'slider', name: 'spread', label: 'Spread', min: 0.3, max: 1, default: 0.6, step: 0.05 },
            { type: 'checkbox', name: 'mouseControl', label: 'Mouse Control', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            intensity: 0.7,
            speed: 1.5,
            spread: 0.6,
            mouseControl: true
        };
    }

    init() {
        // Fire buffer at lower resolution for performance
        this.fireWidth = Math.floor(this.displayWidth / 4);
        this.fireHeight = Math.floor(this.displayHeight / 4);
        this.fireBuffer = new Float32Array(this.fireWidth * this.fireHeight);

        // Fire palette (black -> red -> yellow -> white)
        this.palette = [];
        for (let i = 0; i < 256; i++) {
            if (i < 64) {
                // Black to dark red
                this.palette.push({
                    r: i * 2,
                    g: 0,
                    b: 0
                });
            } else if (i < 128) {
                // Dark red to orange
                this.palette.push({
                    r: 128 + (i - 64),
                    g: (i - 64) * 2,
                    b: 0
                });
            } else if (i < 192) {
                // Orange to yellow
                this.palette.push({
                    r: 192 + (i - 128),
                    g: 128 + (i - 128) * 2,
                    b: 0
                });
            } else {
                // Yellow to white
                this.palette.push({
                    r: 255,
                    g: 255,
                    b: (i - 192) * 4
                });
            }
        }

        this.imageData = null;
    }

    onResize() {
        this.fireWidth = Math.floor(this.displayWidth / 4);
        this.fireHeight = Math.floor(this.displayHeight / 4);
        this.fireBuffer = new Float32Array(this.fireWidth * this.fireHeight);
        this.imageData = null;
    }

    update(deltaTime) {
        const { intensity, speed, spread, mouseControl } = this.options;
        const width = this.fireWidth;
        const height = this.fireHeight;

        // Set bottom row (fire source)
        for (let x = 0; x < width; x++) {
            // Random fire intensity at bottom
            let fireValue = Math.random() * 255 * intensity;

            // Mouse creates more intense fire
            if (mouseControl && this.mouse.x > 0) {
                const mouseX = Math.floor((this.mouse.x / this.displayWidth) * width);
                const dist = Math.abs(x - mouseX);
                const mouseInfluence = Math.max(0, 1 - dist / (width * 0.2));
                fireValue += mouseInfluence * 255 * 0.5;
            }

            this.fireBuffer[(height - 1) * width + x] = Math.min(255, fireValue);
        }

        // Propagate fire upward (bottom to top, skip last row)
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width; x++) {
                // Sample from below with spread
                const spreadRange = Math.floor(spread * 2) + 1;
                let sum = 0;
                let count = 0;

                for (let dx = -spreadRange; dx <= spreadRange; dx++) {
                    const sx = x + dx;
                    if (sx >= 0 && sx < width) {
                        // Sample from row below
                        sum += this.fireBuffer[(y + 1) * width + sx];
                        count++;
                    }
                }

                // Average and decay
                const avg = sum / count;
                const decay = 1.2 + Math.random() * 0.5 * speed;
                this.fireBuffer[y * width + x] = Math.max(0, avg - decay);
            }
        }
    }

    render() {
        const width = this.displayWidth;
        const height = this.displayHeight;

        // Create image data if needed
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const scaleX = this.fireWidth / width;
        const scaleY = this.fireHeight / height;

        // Render fire buffer to image data with upscaling
        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                // Bilinear interpolation for smooth upscaling
                const fx = px * scaleX;
                const fy = py * scaleY;
                const x0 = Math.floor(fx);
                const y0 = Math.floor(fy);
                const x1 = Math.min(x0 + 1, this.fireWidth - 1);
                const y1 = Math.min(y0 + 1, this.fireHeight - 1);
                const xf = fx - x0;
                const yf = fy - y0;

                const v00 = this.fireBuffer[y0 * this.fireWidth + x0];
                const v10 = this.fireBuffer[y0 * this.fireWidth + x1];
                const v01 = this.fireBuffer[y1 * this.fireWidth + x0];
                const v11 = this.fireBuffer[y1 * this.fireWidth + x1];

                const value = Math.floor(
                    v00 * (1 - xf) * (1 - yf) +
                    v10 * xf * (1 - yf) +
                    v01 * (1 - xf) * yf +
                    v11 * xf * yf
                );

                const colorIndex = MathUtils.clamp(value, 0, 255);
                const color = this.palette[colorIndex];

                const pixelIndex = (py * width + px) * 4;
                data[pixelIndex] = color.r;
                data[pixelIndex + 1] = color.g;
                data[pixelIndex + 2] = color.b;
                data[pixelIndex + 3] = 255;
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Add glow effect
        this.ctx.globalCompositeOperation = 'lighter';
        const glowGradient = this.ctx.createRadialGradient(
            width / 2, height, 0,
            width / 2, height, height * 0.5
        );
        glowGradient.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.globalCompositeOperation = 'source-over';

        // Info
        if (this.options.mouseControl) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Move mouse to control flame source', 10, 20);
        }
    }
}
