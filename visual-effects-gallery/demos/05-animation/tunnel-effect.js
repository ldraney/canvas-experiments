/**
 * @fileoverview Tunnel Effect Demo
 * Hypnotic infinite tunnel animation
 *
 * LEARNING OBJECTIVES:
 * - Radial patterns
 * - Perspective illusion
 * - Hypnotic animation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class TunnelEffectDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Tunnel Effect',
            description: 'Hypnotic infinite tunnel - move mouse to look around',
            difficulty: 'advanced',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.5, max: 5, default: 2, step: 0.1 },
            { type: 'slider', name: 'segments', label: 'Segments', min: 6, max: 24, default: 12 },
            { type: 'slider', name: 'rings', label: 'Rings', min: 10, max: 40, default: 20 },
            { type: 'checkbox', name: 'twist', label: 'Twist', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            speed: 2,
            segments: 12,
            rings: 20,
            twist: true
        };
    }

    init() {
        this.offset = 0;
        this.lookX = 0;
        this.lookY = 0;
    }

    update(deltaTime) {
        const { speed } = this.options;
        this.offset += deltaTime * 0.001 * speed;

        // Smooth camera movement toward mouse
        const targetX = (this.mouse.x - this.displayWidth / 2) * 0.3;
        const targetY = (this.mouse.y - this.displayHeight / 2) * 0.3;
        this.lookX = MathUtils.lerp(this.lookX, targetX, 0.05);
        this.lookY = MathUtils.lerp(this.lookY, targetY, 0.05);
    }

    render() {
        const { segments, rings, twist } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;
        const centerX = width / 2 + this.lookX;
        const centerY = height / 2 + this.lookY;
        const maxRadius = Math.max(width, height);

        // Black background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);

        // Draw rings from outside to inside
        for (let r = rings; r >= 0; r--) {
            const depth = (r / rings + this.offset) % 1;
            const radius = Math.pow(depth, 1.5) * maxRadius;

            if (radius < 5) continue;

            const twistAngle = twist ? depth * Math.PI * 2 : 0;
            const segmentAngle = (Math.PI * 2) / segments;

            // Draw alternating segments
            for (let s = 0; s < segments; s++) {
                const startAngle = s * segmentAngle + twistAngle;
                const endAngle = startAngle + segmentAngle;

                // Checkerboard pattern
                const isLight = (s + Math.floor((r + this.offset * rings) % 2)) % 2 === 0;

                // Color based on depth
                const hue = (depth * 360 + this.offset * 100) % 360;
                const lightness = isLight ? 50 : 20;
                const saturation = 70 - depth * 40;

                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                this.ctx.closePath();

                this.ctx.fillStyle = ColorUtils.hsl(hue, saturation, lightness, 1 - depth * 0.5);
                this.ctx.fill();
            }

            // Ring edge
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - depth)})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        // Central glow
        const glowGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 100
        );
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
        this.ctx.fill();

        // Vignette
        const vignetteGradient = this.ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, maxRadius * 0.7
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, width, height);
    }
}
