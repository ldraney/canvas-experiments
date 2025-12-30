/**
 * @fileoverview Julia Set Demo
 * Animated Julia set with varying constant parameter
 *
 * LEARNING OBJECTIVES:
 * - Julia set mathematics
 * - Animation through parameter space
 * - Complex plane visualization
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class JuliaSetDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Julia Set',
            description: 'Animated Julia set - move mouse to change the fractal pattern',
            difficulty: 'intermediate',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'maxIterations', label: 'Max Iterations', min: 30, max: 200, default: 80 },
            { type: 'slider', name: 'animationSpeed', label: 'Auto Animation Speed', min: 0, max: 0.002, default: 0.0005, step: 0.0001 },
            { type: 'checkbox', name: 'mouseControl', label: 'Mouse Control', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            maxIterations: 80,
            animationSpeed: 0.0005,
            mouseControl: true
        };
    }

    init() {
        this.cReal = -0.7;
        this.cImag = 0.27015;
        this.zoom = 1.5;
    }

    update(deltaTime) {
        if (this.options.mouseControl && this.mouse.x > 0) {
            // Map mouse position to interesting parameter range
            this.cReal = MathUtils.map(this.mouse.x, 0, this.displayWidth, -1, 1);
            this.cImag = MathUtils.map(this.mouse.y, 0, this.displayHeight, -1, 1);
        } else {
            // Animate through parameter space
            const t = this.time * this.options.animationSpeed;
            this.cReal = Math.sin(t) * 0.7885;
            this.cImag = Math.cos(t * 1.3) * 0.7885;
        }
    }

    render() {
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const { maxIterations } = this.options;

        const imageData = this.ctx.createImageData(width, height);
        const data = imageData.data;

        const aspect = width / height;
        const range = 3 / this.zoom;

        const realMin = -range * aspect / 2;
        const realMax = range * aspect / 2;
        const imagMin = -range / 2;
        const imagMax = range / 2;

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                let x = realMin + (px / width) * (realMax - realMin);
                let y = imagMin + (py / height) * (imagMax - imagMin);

                let iteration = 0;

                while (x * x + y * y <= 4 && iteration < maxIterations) {
                    const xtemp = x * x - y * y + this.cReal;
                    y = 2 * x * y + this.cImag;
                    x = xtemp;
                    iteration++;
                }

                const pixelIndex = (py * width + px) * 4;

                if (iteration === maxIterations) {
                    data[pixelIndex] = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                } else {
                    // Smooth coloring
                    const smooth = iteration + 1 - Math.log2(Math.log2(x * x + y * y));
                    const hue = (smooth * 10) % 360;
                    const rgb = ColorUtils.hslToRgb(hue, 85, 55);
                    data[pixelIndex] = rgb.r;
                    data[pixelIndex + 1] = rgb.g;
                    data[pixelIndex + 2] = rgb.b;
                }
                data[pixelIndex + 3] = 255;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        // Parameter display
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`c = ${this.cReal.toFixed(4)} + ${this.cImag.toFixed(4)}i`, 10, 20);

        if (this.options.mouseControl) {
            this.ctx.fillText('Move mouse to explore Julia sets', 10, 36);
        }
    }
}
