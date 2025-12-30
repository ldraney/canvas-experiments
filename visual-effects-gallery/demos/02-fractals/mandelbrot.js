/**
 * @fileoverview Mandelbrot Set Demo
 * Zoomable Mandelbrot set with smooth coloring
 *
 * LEARNING OBJECTIVES:
 * - Complex number mathematics
 * - Escape-time algorithm
 * - Image data manipulation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

export class MandelbrotDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Mandelbrot Set',
            description: 'Click to zoom into the infinite fractal. Right-click to zoom out.',
            difficulty: 'intermediate',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'maxIterations', label: 'Max Iterations', min: 50, max: 500, default: 150 },
            { type: 'slider', name: 'colorSpeed', label: 'Color Speed', min: 1, max: 20, default: 8 },
            { type: 'checkbox', name: 'animateColors', label: 'Animate Colors', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            maxIterations: 150,
            colorSpeed: 8,
            animateColors: true
        };
    }

    init() {
        // View bounds
        this.centerX = -0.5;
        this.centerY = 0;
        this.zoom = 1;

        this.needsRedraw = true;
        this.imageData = null;
    }

    onClick(x, y) {
        // Zoom in on click location
        const { realMin, realMax, imagMin, imagMax } = this.getBounds();

        const clickReal = realMin + (x / this.displayWidth) * (realMax - realMin);
        const clickImag = imagMin + (y / this.displayHeight) * (imagMax - imagMin);

        this.centerX = clickReal;
        this.centerY = clickImag;
        this.zoom *= 2;
        this.needsRedraw = true;
    }

    onMouseDown(x, y, button) {
        if (button === 2) { // Right click
            this.zoom = Math.max(1, this.zoom / 2);
            this.needsRedraw = true;
        }
    }

    getBounds() {
        const aspect = this.displayWidth / this.displayHeight;
        const range = 3 / this.zoom;

        return {
            realMin: this.centerX - range * aspect / 2,
            realMax: this.centerX + range * aspect / 2,
            imagMin: this.centerY - range / 2,
            imagMax: this.centerY + range / 2
        };
    }

    onResize() {
        this.needsRedraw = true;
        this.imageData = null;
    }

    onOptionChange(name, value) {
        if (name === 'maxIterations') {
            this.needsRedraw = true;
        }
    }

    calculateMandelbrot() {
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const { maxIterations } = this.options;
        const { realMin, realMax, imagMin, imagMax } = this.getBounds();

        this.iterationData = new Float32Array(width * height);

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const x0 = realMin + (px / width) * (realMax - realMin);
                const y0 = imagMin + (py / height) * (imagMax - imagMin);

                let x = 0;
                let y = 0;
                let iteration = 0;

                while (x * x + y * y <= 4 && iteration < maxIterations) {
                    const xtemp = x * x - y * y + x0;
                    y = 2 * x * y + y0;
                    x = xtemp;
                    iteration++;
                }

                // Smooth coloring
                if (iteration < maxIterations) {
                    const log_zn = Math.log(x * x + y * y) / 2;
                    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
                    iteration = iteration + 1 - nu;
                }

                this.iterationData[py * width + px] = iteration;
            }
        }

        this.needsRedraw = false;
    }

    update(deltaTime) {
        if (this.needsRedraw) {
            this.calculateMandelbrot();
        }
    }

    render() {
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const { maxIterations, colorSpeed, animateColors } = this.options;

        if (!this.iterationData) {
            this.calculateMandelbrot();
        }

        // Create image data if needed
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const colorOffset = animateColors ? this.time * 0.02 : 0;

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const index = py * width + px;
                const iteration = this.iterationData[index];
                const pixelIndex = index * 4;

                if (iteration >= maxIterations) {
                    // Inside the set - black
                    data[pixelIndex] = 0;
                    data[pixelIndex + 1] = 0;
                    data[pixelIndex + 2] = 0;
                } else {
                    // Outside - colorful
                    const hue = (iteration * colorSpeed + colorOffset) % 360;
                    const saturation = 80;
                    const lightness = 50;

                    const rgb = ColorUtils.hslToRgb(hue, saturation, lightness);
                    data[pixelIndex] = rgb.r;
                    data[pixelIndex + 1] = rgb.g;
                    data[pixelIndex + 2] = rgb.b;
                }
                data[pixelIndex + 3] = 255;
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Zoom indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Zoom: ${this.zoom.toFixed(1)}x | Click to zoom in, right-click to zoom out`, 10, 20);
        this.ctx.fillText(`Center: ${this.centerX.toFixed(10)}, ${this.centerY.toFixed(10)}i`, 10, 36);
    }
}
