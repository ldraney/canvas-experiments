/**
 * @fileoverview Plasma Effect Demo
 * Classic demoscene plasma with sine waves
 *
 * LEARNING OBJECTIVES:
 * - Mathematical patterns
 * - Image data manipulation
 * - Classic demo effects
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class PlasmaEffectDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Plasma Effect',
            description: 'Classic demoscene plasma with overlapping sine waves',
            difficulty: 'intermediate',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'scale', label: 'Scale', min: 10, max: 100, default: 40 },
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.5, max: 5, default: 2, step: 0.1 },
            { type: 'slider', name: 'complexity', label: 'Complexity', min: 1, max: 5, default: 3 },
            { type: 'checkbox', name: 'rainbow', label: 'Rainbow Mode', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            scale: 40,
            speed: 2,
            complexity: 3,
            rainbow: true
        };
    }

    init() {
        this.imageData = null;
        this.sinTable = [];
        this.cosTable = [];

        // Pre-calculate sin/cos tables for performance
        for (let i = 0; i < 256; i++) {
            this.sinTable[i] = Math.sin(i * Math.PI * 2 / 256);
            this.cosTable[i] = Math.cos(i * Math.PI * 2 / 256);
        }
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        const { scale, speed, complexity, rainbow } = this.options;
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);

        // Create image data if needed
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const time = this.time * 0.001 * speed;

        // Resolution reduction for performance
        const step = 2;

        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                // Calculate plasma value using multiple sine waves
                let value = 0;

                // Base patterns
                const x = px / scale;
                const y = py / scale;

                // Pattern 1: Horizontal waves
                value += Math.sin(x + time);

                // Pattern 2: Vertical waves
                value += Math.sin(y + time * 0.7);

                // Pattern 3: Diagonal waves
                if (complexity >= 2) {
                    value += Math.sin((x + y) * 0.5 + time * 1.3);
                }

                // Pattern 4: Circular waves
                if (complexity >= 3) {
                    const cx = width / 2 / scale;
                    const cy = height / 2 / scale;
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    value += Math.sin(dist - time);
                }

                // Pattern 5: Complex interference
                if (complexity >= 4) {
                    value += Math.sin(x * Math.cos(time * 0.3) + y * Math.sin(time * 0.4));
                }

                // Pattern 6: Spiral
                if (complexity >= 5) {
                    const cx = width / 2 / scale;
                    const cy = height / 2 / scale;
                    const angle = Math.atan2(y - cy, x - cx);
                    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    value += Math.sin(angle * 3 + dist * 0.5 - time * 2);
                }

                // Normalize to 0-1
                value = (value / complexity + 1) / 2;

                // Color mapping
                let r, g, b;

                if (rainbow) {
                    // Rainbow palette
                    const hue = (value * 360 + time * 50) % 360;
                    const rgb = ColorUtils.hslToRgb(hue, 80, 50);
                    r = rgb.r;
                    g = rgb.g;
                    b = rgb.b;
                } else {
                    // Classic plasma colors
                    r = Math.floor((Math.sin(value * Math.PI * 2) * 0.5 + 0.5) * 255);
                    g = Math.floor((Math.sin(value * Math.PI * 2 + Math.PI * 2 / 3) * 0.5 + 0.5) * 255);
                    b = Math.floor((Math.sin(value * Math.PI * 2 + Math.PI * 4 / 3) * 0.5 + 0.5) * 255);
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
    }
}
