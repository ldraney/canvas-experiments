/**
 * @fileoverview Color Cycling Demo
 * Animated color palette cycling
 *
 * LEARNING OBJECTIVES:
 * - HSL color space
 * - Smooth color transitions
 * - Color palette design
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

export class ColorCyclingDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Color Cycling',
            description: 'Smooth cycling through color palettes',
            difficulty: 'beginner',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'speed', label: 'Cycle Speed', min: 0.1, max: 3, default: 1, step: 0.1 },
            { type: 'slider', name: 'bands', label: 'Color Bands', min: 3, max: 20, default: 8 },
            { type: 'slider', name: 'pattern', label: 'Pattern', min: 0, max: 3, default: 0 },
            { type: 'checkbox', name: 'rainbow', label: 'Rainbow Mode', default: false }
        ];
    }

    getDefaultOptions() {
        return {
            speed: 1,
            bands: 8,
            pattern: 0,
            rainbow: false
        };
    }

    init() {
        this.offset = 0;
    }

    update(deltaTime) {
        this.offset += deltaTime * 0.001 * this.options.speed;
    }

    render() {
        const { bands, pattern, rainbow } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;

        for (let i = 0; i < bands; i++) {
            const t = (i / bands + this.offset) % 1;

            let color;
            if (rainbow) {
                color = ColorUtils.hsl(t * 360, 70, 50);
            } else {
                // Multi-color palette cycling
                const paletteIndex = Math.floor(t * 6);
                const localT = (t * 6) % 1;
                const palettes = [
                    Palettes.sunset,
                    Palettes.ocean,
                    Palettes.forest,
                    Palettes.neon,
                    Palettes.candy,
                    Palettes.cyberpunk
                ];
                const palette = palettes[paletteIndex % palettes.length];
                color = ColorUtils.fromPalette(palette, localT);
            }

            switch (pattern) {
                case 0: // Horizontal bands
                    const y = (i / bands) * height;
                    const bandHeight = height / bands;
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(0, y, width, bandHeight + 1);
                    break;

                case 1: // Vertical bands
                    const x = (i / bands) * width;
                    const bandWidth = width / bands;
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x, 0, bandWidth + 1, height);
                    break;

                case 2: // Concentric circles
                    const maxRadius = Math.max(width, height) * 0.8;
                    const radius = ((bands - i) / bands) * maxRadius;
                    this.ctx.beginPath();
                    this.ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = color;
                    this.ctx.fill();
                    break;

                case 3: // Diagonal bands
                    const angle = Math.PI / 4;
                    const diagWidth = (width + height) / bands;
                    const startX = i * diagWidth - height;

                    this.ctx.save();
                    this.ctx.translate(startX, 0);
                    this.ctx.rotate(angle);
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(0, -height, diagWidth + 2, height * 3);
                    this.ctx.restore();
                    break;
            }
        }

        // Pattern name overlay
        const patternNames = ['Horizontal', 'Vertical', 'Concentric', 'Diagonal'];
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 120, 30);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(patternNames[pattern], 20, 30);
    }
}
