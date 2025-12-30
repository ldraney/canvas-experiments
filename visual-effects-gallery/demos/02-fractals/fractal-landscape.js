/**
 * @fileoverview Fractal Landscape Demo
 * Procedural terrain using midpoint displacement
 *
 * LEARNING OBJECTIVES:
 * - Midpoint displacement algorithm
 * - Terrain generation
 * - Perspective and layering
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class FractalLandscapeDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Fractal Landscape',
            description: 'Procedural terrain with multiple layers of mountains',
            difficulty: 'advanced',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'roughness', label: 'Roughness', min: 0.3, max: 0.8, default: 0.5, step: 0.05 },
            { type: 'slider', name: 'layers', label: 'Mountain Layers', min: 3, max: 8, default: 5 },
            { type: 'slider', name: 'detail', label: 'Detail Level', min: 5, max: 9, default: 7 },
            { type: 'checkbox', name: 'showSun', label: 'Show Sun', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            roughness: 0.5,
            layers: 5,
            detail: 7,
            showSun: true
        };
    }

    init() {
        this.terrainLayers = [];
        this.generateTerrain();
    }

    generateTerrain() {
        this.terrainLayers = [];
        const { layers, roughness, detail } = this.options;

        for (let layer = 0; layer < layers; layer++) {
            const heightMap = this.generateHeightMap(detail, roughness);
            this.terrainLayers.push({
                heights: heightMap,
                depth: layer / layers // 0 = back, 1 = front
            });
        }
    }

    generateHeightMap(iterations, roughness) {
        const size = Math.pow(2, iterations) + 1;
        const heights = new Float32Array(size);

        // Initialize endpoints
        heights[0] = Math.random() * 0.5 + 0.25;
        heights[size - 1] = Math.random() * 0.5 + 0.25;

        let step = size - 1;
        let scale = roughness;

        while (step > 1) {
            const halfStep = step / 2;

            for (let i = halfStep; i < size - 1; i += step) {
                const left = heights[i - halfStep];
                const right = heights[i + halfStep];
                heights[i] = (left + right) / 2 + (Math.random() - 0.5) * scale;
            }

            step = halfStep;
            scale *= roughness;
        }

        // Clamp values
        for (let i = 0; i < size; i++) {
            heights[i] = MathUtils.clamp(heights[i], 0.1, 0.9);
        }

        return heights;
    }

    onResize() {
        // Terrain scales automatically
    }

    onOptionChange(name, value) {
        this.generateTerrain();
    }

    onClick(x, y) {
        this.generateTerrain();
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        const { showSun, layers } = this.options;

        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.displayHeight * 0.7);
        skyGradient.addColorStop(0, '#0a0a15');
        skyGradient.addColorStop(0.5, '#1a1a35');
        skyGradient.addColorStop(1, '#3d2555');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Sun/moon
        if (showSun) {
            const sunX = this.displayWidth * 0.75;
            const sunY = this.displayHeight * 0.2;
            const sunRadius = 40;

            // Glow
            const glowGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 4);
            glowGradient.addColorStop(0, 'rgba(255, 200, 150, 0.3)');
            glowGradient.addColorStop(0.5, 'rgba(255, 150, 100, 0.1)');
            glowGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
            this.ctx.fillStyle = glowGradient;
            this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

            // Sun body
            const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
            sunGradient.addColorStop(0, '#fff8e0');
            sunGradient.addColorStop(0.7, '#ffcc80');
            sunGradient.addColorStop(1, '#ff9040');
            this.ctx.fillStyle = sunGradient;
            this.ctx.beginPath();
            this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 12345.6) * 0.5 + 0.5) * this.displayWidth;
            const y = (Math.cos(i * 54321.6) * 0.5 + 0.5) * this.displayHeight * 0.4;
            const twinkle = Math.sin(this.time * 0.002 + i * 0.5) * 0.5 + 0.5;
            this.ctx.globalAlpha = twinkle * 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        // Draw terrain layers (back to front)
        this.terrainLayers.forEach((layer, layerIndex) => {
            const depth = layer.depth;
            const heights = layer.heights;

            // Calculate layer properties based on depth
            const baseY = this.displayHeight * (0.3 + depth * 0.4);
            const heightScale = this.displayHeight * (0.1 + depth * 0.25);
            const parallaxOffset = Math.sin(this.time * 0.0001 * (layers - layerIndex)) * (10 - layerIndex * 2);

            // Color based on depth (farther = bluer, closer = darker)
            const hue = MathUtils.lerp(280, 260, depth);
            const saturation = MathUtils.lerp(30, 50, depth);
            const lightness = MathUtils.lerp(30, 8, depth);

            this.ctx.beginPath();
            this.ctx.moveTo(-10, this.displayHeight + 10);

            // Draw mountain silhouette
            for (let i = 0; i < heights.length; i++) {
                const x = (i / (heights.length - 1)) * (this.displayWidth + 20) - 10 + parallaxOffset;
                const y = baseY - heights[i] * heightScale;
                this.ctx.lineTo(x, y);
            }

            this.ctx.lineTo(this.displayWidth + 10, this.displayHeight + 10);
            this.ctx.closePath();

            // Fill with gradient
            const mountainGradient = this.ctx.createLinearGradient(0, baseY - heightScale, 0, this.displayHeight);
            mountainGradient.addColorStop(0, ColorUtils.hsl(hue, saturation, lightness));
            mountainGradient.addColorStop(1, ColorUtils.hsl(hue, saturation - 10, lightness - 3));
            this.ctx.fillStyle = mountainGradient;
            this.ctx.fill();
        });

        // Fog at bottom
        const fogGradient = this.ctx.createLinearGradient(0, this.displayHeight * 0.7, 0, this.displayHeight);
        fogGradient.addColorStop(0, 'rgba(20, 15, 30, 0)');
        fogGradient.addColorStop(1, 'rgba(20, 15, 30, 0.8)');
        this.ctx.fillStyle = fogGradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Click to regenerate terrain', 10, 20);
    }
}
