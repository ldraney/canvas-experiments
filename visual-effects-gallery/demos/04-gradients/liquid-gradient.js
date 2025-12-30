/**
 * @fileoverview Liquid Gradient Demo
 * Morphing blob-like gradients
 *
 * LEARNING OBJECTIVES:
 * - Organic motion
 * - Gradient blending
 * - Metaball-like effects
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

class Blob {
    constructor(x, y, radius, hue) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.hue = hue;
        this.vx = MathUtils.random(-1, 1);
        this.vy = MathUtils.random(-1, 1);
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = MathUtils.random(0.001, 0.003);
    }

    update(width, height, speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce with some randomness
        if (this.x < this.radius || this.x > width - this.radius) {
            this.vx *= -1;
            this.vy += MathUtils.random(-0.3, 0.3);
        }
        if (this.y < this.radius || this.y > height - this.radius) {
            this.vy *= -1;
            this.vx += MathUtils.random(-0.3, 0.3);
        }

        // Limit velocity
        const speed2 = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed2 > 2) {
            this.vx = (this.vx / speed2) * 2;
            this.vy = (this.vy / speed2) * 2;
        }

        this.x = MathUtils.clamp(this.x, this.radius, width - this.radius);
        this.y = MathUtils.clamp(this.y, this.radius, height - this.radius);
    }

    getCurrentRadius(time) {
        return this.radius * (1 + Math.sin(time * this.pulseSpeed + this.phase) * 0.2);
    }
}

export class LiquidGradientDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Liquid Gradient',
            description: 'Morphing blob-like gradients that flow and merge',
            difficulty: 'advanced',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'blobCount', label: 'Blobs', min: 3, max: 8, default: 5 },
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.2, max: 2, default: 1, step: 0.1 },
            { type: 'slider', name: 'blur', label: 'Softness', min: 1, max: 3, default: 2, step: 0.1 },
            { type: 'checkbox', name: 'mouseInteract', label: 'Mouse Interaction', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            blobCount: 5,
            speed: 1,
            blur: 2,
            mouseInteract: true
        };
    }

    init() {
        this.blobs = [];
        this.createBlobs();
        this.imageData = null;
    }

    createBlobs() {
        this.blobs = [];
        const palette = Palettes.cyberpunk;

        for (let i = 0; i < this.options.blobCount; i++) {
            const hue = (i / this.options.blobCount) * 360;
            this.blobs.push(new Blob(
                MathUtils.random(100, this.displayWidth - 100),
                MathUtils.random(100, this.displayHeight - 100),
                MathUtils.random(100, 200),
                hue
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'blobCount') {
            this.createBlobs();
        }
    }

    onResize() {
        this.imageData = null;
    }

    update(deltaTime) {
        const { speed, mouseInteract } = this.options;

        this.blobs.forEach(blob => {
            blob.update(this.displayWidth, this.displayHeight, speed);

            // Mouse attraction/repulsion
            if (mouseInteract && this.mouse.x > 0) {
                const dx = this.mouse.x - blob.x;
                const dy = this.mouse.y - blob.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 300 && dist > 0) {
                    const force = (300 - dist) / 300 * 0.1;
                    if (this.mouse.isDown) {
                        // Attract
                        blob.vx += (dx / dist) * force;
                        blob.vy += (dy / dist) * force;
                    } else {
                        // Repel
                        blob.vx -= (dx / dist) * force * 0.5;
                        blob.vy -= (dy / dist) * force * 0.5;
                    }
                }
            }
        });
    }

    render() {
        const { blur } = this.options;
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const step = 3; // Resolution reduction

        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;

        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                // Calculate metaball-like field value
                let totalR = 0, totalG = 0, totalB = 0;
                let totalWeight = 0;

                for (const blob of this.blobs) {
                    const radius = blob.getCurrentRadius(this.time);
                    const dx = px - blob.x;
                    const dy = py - blob.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Smooth falloff
                    const influence = Math.pow(radius / (dist + radius * 0.1), blur);

                    if (influence > 0.01) {
                        const rgb = ColorUtils.hslToRgb(blob.hue, 80, 55);
                        totalR += rgb.r * influence;
                        totalG += rgb.g * influence;
                        totalB += rgb.b * influence;
                        totalWeight += influence;
                    }
                }

                // Normalize and apply
                if (totalWeight > 0) {
                    totalR = Math.min(255, totalR / totalWeight);
                    totalG = Math.min(255, totalG / totalWeight);
                    totalB = Math.min(255, totalB / totalWeight);
                } else {
                    totalR = totalG = totalB = 10;
                }

                // Fill block of pixels
                for (let dy = 0; dy < step && py + dy < height; dy++) {
                    for (let dx = 0; dx < step && px + dx < width; dx++) {
                        const pixelIndex = ((py + dy) * width + (px + dx)) * 4;
                        data[pixelIndex] = totalR;
                        data[pixelIndex + 1] = totalG;
                        data[pixelIndex + 2] = totalB;
                        data[pixelIndex + 3] = 255;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Info
        if (this.options.mouseInteract) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '12px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('Click and drag to attract blobs', 10, 20);
        }
    }
}
