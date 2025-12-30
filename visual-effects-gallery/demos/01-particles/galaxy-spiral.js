/**
 * @fileoverview Galaxy Spiral Demo
 * Thousands of stars forming rotating spiral arms
 *
 * LEARNING OBJECTIVES:
 * - Logarithmic spiral mathematics
 * - Large-scale particle systems
 * - Depth simulation with size and opacity
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

class Star {
    constructor(armIndex, distanceRatio, totalArms) {
        const armAngle = (armIndex / totalArms) * Math.PI * 2;
        const spiralTightness = 0.4;

        // Logarithmic spiral position
        this.baseAngle = armAngle + distanceRatio * spiralTightness * 8;
        this.distance = distanceRatio * 300 + MathUtils.random(-30, 30);

        // Add some randomization for natural look
        this.angleOffset = MathUtils.random(-0.3, 0.3);
        this.baseAngle += this.angleOffset;

        // Depth (z) for parallax effect
        this.z = Math.random();

        // Visual properties
        this.baseSize = MathUtils.random(0.5, 2.5);
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = MathUtils.random(0.002, 0.005);

        // Color based on distance from center
        if (distanceRatio < 0.3) {
            // Core: warm colors
            this.color = ColorUtils.hsl(MathUtils.random(30, 60), 80, 80);
        } else if (distanceRatio < 0.6) {
            // Middle: white/blue
            this.color = ColorUtils.hsl(MathUtils.random(200, 240), 60, 85);
        } else {
            // Outer: blue/purple
            this.color = ColorUtils.hsl(MathUtils.random(220, 280), 50, 70);
        }
    }

    update(time, rotationSpeed) {
        // Rotate based on distance (inner stars rotate faster)
        const speedMultiplier = 1 - this.z * 0.5;
        this.currentAngle = this.baseAngle + time * rotationSpeed * speedMultiplier;
    }

    render(ctx, centerX, centerY, time) {
        const x = centerX + Math.cos(this.currentAngle) * this.distance;
        const y = centerY + Math.sin(this.currentAngle) * this.distance * 0.4; // Ellipse for tilt

        // Twinkle
        const twinkle = 0.6 + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.4;

        // Size based on depth and twinkle
        const size = this.baseSize * (1 - this.z * 0.5) * twinkle;

        // Alpha based on depth
        const alpha = (1 - this.z * 0.6) * twinkle;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        ctx.fill();
    }
}

class NebulaCloud {
    constructor(centerX, centerY, radius) {
        this.x = centerX + MathUtils.random(-radius * 0.5, radius * 0.5);
        this.y = centerY + MathUtils.random(-radius * 0.3, radius * 0.3);
        this.radius = MathUtils.random(50, 150);
        this.hue = MathUtils.random(200, 300);
        this.opacity = MathUtils.random(0.02, 0.06);
        this.phase = Math.random() * Math.PI * 2;
    }

    render(ctx, time) {
        const pulse = 1 + Math.sin(time * 0.0005 + this.phase) * 0.1;
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * pulse
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 60, 50, this.opacity));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue, 60, 50, 0));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class GalaxySpiralDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Galaxy Spiral',
            description: 'A rotating galaxy with thousands of stars in spiral arms',
            difficulty: 'advanced',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'starCount', label: 'Stars', min: 500, max: 5000, default: 2500, step: 100 },
            { type: 'slider', name: 'armCount', label: 'Spiral Arms', min: 2, max: 6, default: 4 },
            { type: 'slider', name: 'rotationSpeed', label: 'Rotation', min: 0.00005, max: 0.0005, default: 0.0002, step: 0.00001 },
            { type: 'checkbox', name: 'showNebula', label: 'Show Nebula', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            starCount: 2500,
            armCount: 4,
            rotationSpeed: 0.0002,
            showNebula: true
        };
    }

    init() {
        this.stars = [];
        this.nebulaClouds = [];
        this.createGalaxy();
    }

    createGalaxy() {
        this.stars = [];
        const { starCount, armCount } = this.options;

        for (let i = 0; i < starCount; i++) {
            const armIndex = i % armCount;
            const distanceRatio = Math.pow(Math.random(), 0.5); // More stars toward center
            this.stars.push(new Star(armIndex, distanceRatio, armCount));
        }

        // Sort by depth for proper rendering
        this.stars.sort((a, b) => b.z - a.z);

        // Create nebula clouds
        this.nebulaClouds = [];
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        for (let i = 0; i < 15; i++) {
            this.nebulaClouds.push(new NebulaCloud(centerX, centerY, 250));
        }
    }

    onOptionChange(name, value) {
        if (name === 'starCount' || name === 'armCount') {
            this.createGalaxy();
        }
    }

    onResize() {
        this.createGalaxy();
    }

    update(deltaTime) {
        const { rotationSpeed } = this.options;
        this.stars.forEach(star => {
            star.update(this.time, rotationSpeed);
        });
    }

    render() {
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        // Deep space background
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Nebula clouds
        if (this.options.showNebula) {
            this.nebulaClouds.forEach(cloud => cloud.render(this.ctx, this.time));
        }

        // Central glow
        const coreGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 150
        );
        coreGradient.addColorStop(0, 'rgba(255, 220, 180, 0.3)');
        coreGradient.addColorStop(0.3, 'rgba(255, 180, 120, 0.1)');
        coreGradient.addColorStop(1, 'rgba(255, 150, 100, 0)');
        this.ctx.fillStyle = coreGradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw stars
        this.stars.forEach(star => {
            star.render(this.ctx, centerX, centerY, this.time);
        });

        // Bright core
        const brightCore = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 30
        );
        brightCore.addColorStop(0, 'rgba(255, 255, 240, 0.8)');
        brightCore.addColorStop(1, 'rgba(255, 255, 200, 0)');
        this.ctx.fillStyle = brightCore;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
