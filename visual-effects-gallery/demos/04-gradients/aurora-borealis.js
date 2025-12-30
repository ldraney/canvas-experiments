/**
 * @fileoverview Aurora Borealis Demo
 * Shimmering northern lights effect
 *
 * LEARNING OBJECTIVES:
 * - Layered gradient effects
 * - Wave-based animation
 * - Natural phenomena simulation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class AuroraBorealisDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Aurora Borealis',
            description: 'Shimmering northern lights dancing across the sky',
            difficulty: 'intermediate',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'speed', label: 'Animation Speed', min: 0.2, max: 2, default: 1, step: 0.1 },
            { type: 'slider', name: 'intensity', label: 'Intensity', min: 0.3, max: 1, default: 0.7, step: 0.05 },
            { type: 'slider', name: 'layers', label: 'Layers', min: 3, max: 8, default: 5 },
            { type: 'checkbox', name: 'showStars', label: 'Show Stars', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            speed: 1,
            intensity: 0.7,
            layers: 5,
            showStars: true
        };
    }

    init() {
        // Generate stars
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.7,
                size: MathUtils.random(0.5, 2),
                twinkleSpeed: MathUtils.random(0.002, 0.005),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        const { speed, intensity, layers, showStars } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;
        const time = this.time * 0.001 * speed;

        // Night sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, height);
        skyGradient.addColorStop(0, '#000510');
        skyGradient.addColorStop(0.5, '#051025');
        skyGradient.addColorStop(1, '#0a1a30');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, width, height);

        // Draw stars
        if (showStars) {
            this.stars.forEach(star => {
                const twinkle = Math.sin(this.time * star.twinkleSpeed + star.phase) * 0.5 + 0.5;
                this.ctx.beginPath();
                this.ctx.arc(
                    star.x * width,
                    star.y * height,
                    star.size * twinkle,
                    0, Math.PI * 2
                );
                this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
                this.ctx.fill();
            });
        }

        // Aurora layers
        for (let layer = 0; layer < layers; layer++) {
            const layerOffset = layer / layers;
            const baseY = height * (0.15 + layerOffset * 0.25);

            this.ctx.beginPath();

            // Create wavy curtain shape
            const points = [];
            for (let x = 0; x <= width; x += 5) {
                const xNorm = x / width;

                // Multiple wave frequencies
                let y = baseY;
                y += Math.sin(xNorm * 8 + time * 2 + layer) * 30;
                y += Math.sin(xNorm * 4 + time * 1.5 + layer * 0.5) * 50;
                y += Math.sin(xNorm * 12 + time * 3 + layer * 2) * 15;

                // Curtain drooping effect
                const curtainDroop = Math.sin(xNorm * Math.PI) * 50;
                y += curtainDroop;

                points.push({ x, y });
            }

            // Draw aurora curtain
            this.ctx.moveTo(0, height);
            this.ctx.lineTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }

            this.ctx.lineTo(width, height);
            this.ctx.closePath();

            // Aurora gradient
            const hue = 120 + layer * 30 + Math.sin(time + layer) * 20; // Green to cyan
            const gradient = this.ctx.createLinearGradient(0, baseY - 80, 0, height);

            const layerIntensity = intensity * (1 - layerOffset * 0.3);
            gradient.addColorStop(0, ColorUtils.hsl(hue, 80, 60, layerIntensity * 0.8));
            gradient.addColorStop(0.3, ColorUtils.hsl(hue + 20, 70, 50, layerIntensity * 0.5));
            gradient.addColorStop(0.6, ColorUtils.hsl(hue + 40, 60, 40, layerIntensity * 0.2));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Bright edge at top
            this.ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                if (i === 0) {
                    this.ctx.moveTo(points[i].x, points[i].y);
                } else {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
            }

            this.ctx.strokeStyle = ColorUtils.hsl(hue, 90, 70, layerIntensity * 0.6);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Subtle glow overlay
        const glowGradient = this.ctx.createRadialGradient(
            width / 2, height * 0.3, 0,
            width / 2, height * 0.3, width * 0.6
        );
        glowGradient.addColorStop(0, `rgba(100, 255, 180, ${intensity * 0.1})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, width, height);

        // Ground silhouette
        this.ctx.fillStyle = '#020408';
        this.ctx.beginPath();
        this.ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 20) {
            const hillHeight = 20 + Math.sin(x * 0.02) * 10 + Math.sin(x * 0.005) * 30;
            this.ctx.lineTo(x, height - hillHeight);
        }

        this.ctx.lineTo(width, height);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
