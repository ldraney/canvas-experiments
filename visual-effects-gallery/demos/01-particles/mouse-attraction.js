/**
 * @fileoverview Mouse Attraction Demo
 * Particles attracted to and repelled by the mouse cursor
 *
 * LEARNING OBJECTIVES:
 * - Mouse interaction with canvas
 * - Force-based particle movement
 * - Smooth interpolation (lerp)
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils, Vector2 } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = MathUtils.random(2, 5);
        this.hue = MathUtils.random(0, 360);
    }

    update(mouseX, mouseY, attractStrength, returnStrength) {
        // Distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attraction force (inverse square law, capped)
        if (dist < 200 && dist > 0) {
            const force = attractStrength * (200 - dist) / 200;
            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
        }

        // Return to origin force
        const returnDx = this.originX - this.x;
        const returnDy = this.originY - this.y;
        this.vx += returnDx * returnStrength;
        this.vy += returnDy * returnStrength;

        // Apply velocity with friction
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;

        // Update color based on velocity
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.hue = (this.hue + speed * 0.5) % 360;
    }

    render(ctx) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const alpha = MathUtils.clamp(0.4 + speed * 0.1, 0.4, 1);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + speed * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 70, 60, alpha);
        ctx.fill();
    }
}

export class MouseAttractionDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Mouse Attraction',
            description: 'Particles attracted to your cursor with physics-based movement',
            difficulty: 'beginner',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'particleCount', label: 'Particles', min: 100, max: 1000, default: 400 },
            { type: 'slider', name: 'attractStrength', label: 'Attraction', min: 0, max: 2, default: 0.8, step: 0.1 },
            { type: 'slider', name: 'returnStrength', label: 'Return Force', min: 0.001, max: 0.05, default: 0.02, step: 0.001 },
            { type: 'checkbox', name: 'repel', label: 'Repel Mode', default: false }
        ];
    }

    getDefaultOptions() {
        return {
            particleCount: 400,
            attractStrength: 0.8,
            returnStrength: 0.02,
            repel: false
        };
    }

    init() {
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const cols = Math.ceil(Math.sqrt(this.options.particleCount * this.displayWidth / this.displayHeight));
        const rows = Math.ceil(this.options.particleCount / cols);
        const spacingX = this.displayWidth / (cols + 1);
        const spacingY = this.displayHeight / (rows + 1);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (this.particles.length >= this.options.particleCount) break;
                const x = spacingX * (i + 1);
                const y = spacingY * (j + 1);
                this.particles.push(new Particle(x, y));
            }
        }
    }

    onOptionChange(name, value) {
        if (name === 'particleCount') {
            this.createParticles();
        }
    }

    onResize() {
        this.createParticles();
    }

    update(deltaTime) {
        const strength = this.options.repel ? -this.options.attractStrength : this.options.attractStrength;
        this.particles.forEach(p => {
            p.update(this.mouse.x, this.mouse.y, strength, this.options.returnStrength);
        });
    }

    render() {
        // Semi-transparent background for trail effect
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw particles
        this.particles.forEach(p => p.render(this.ctx));

        // Draw mouse indicator
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 10, 0, Math.PI * 2);
        this.ctx.strokeStyle = this.options.repel ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 200, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}
