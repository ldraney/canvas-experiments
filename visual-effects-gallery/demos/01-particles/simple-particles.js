/**
 * @fileoverview Simple Particles Demo
 * Floating dust particles with gentle drift and subtle glow
 *
 * LEARNING OBJECTIVES:
 * - Basic particle system structure
 * - Animation loop with requestAnimationFrame
 * - Random motion and screen wrapping
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

/**
 * Single particle with position, velocity, and appearance
 */
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = MathUtils.random(-0.3, 0.3);
        this.vy = MathUtils.random(-0.5, -0.1);
        this.size = MathUtils.random(1, 4);
        this.opacity = MathUtils.random(0.3, 0.8);
        this.hue = options.hue || MathUtils.random(180, 280);
        this.twinkleSpeed = MathUtils.random(0.001, 0.003);
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update(deltaTime, width, height) {
        // Gentle drift
        this.x += this.vx;
        this.y += this.vy;

        // Slight random wobble
        this.x += Math.sin(Date.now() * 0.001 + this.twinklePhase) * 0.1;

        // Screen wrapping
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Twinkle effect
        this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase));
    }

    render(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 70, this.currentOpacity));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue, 70, 70, 0));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

export class SimpleParticlesDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Simple Particles',
            description: 'Floating dust particles with gentle drift and subtle glow',
            difficulty: 'beginner',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'particleCount', label: 'Particle Count', min: 50, max: 500, default: 150 },
            { type: 'slider', name: 'speed', label: 'Drift Speed', min: 0.1, max: 2, default: 1, step: 0.1 },
            { type: 'slider', name: 'hue', label: 'Base Hue', min: 0, max: 360, default: 220 }
        ];
    }

    getDefaultOptions() {
        return {
            particleCount: 150,
            speed: 1,
            hue: 220
        };
    }

    init() {
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(new Particle(
                Math.random() * this.displayWidth,
                Math.random() * this.displayHeight,
                { hue: this.options.hue + MathUtils.random(-30, 30) }
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'particleCount') {
            this.createParticles();
        }
    }

    onResize() {
        // Redistribute particles on resize
        this.particles.forEach(p => {
            if (p.x > this.displayWidth) p.x = Math.random() * this.displayWidth;
            if (p.y > this.displayHeight) p.y = Math.random() * this.displayHeight;
        });
    }

    update(deltaTime) {
        const speed = this.options.speed;
        this.particles.forEach(p => {
            p.vx = MathUtils.lerp(p.vx, MathUtils.random(-0.3, 0.3) * speed, 0.01);
            p.vy = MathUtils.lerp(p.vy, MathUtils.random(-0.5, -0.1) * speed, 0.01);
            p.update(deltaTime, this.displayWidth, this.displayHeight);
        });
    }

    render() {
        // Dark gradient background
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.displayHeight);
        bgGradient.addColorStop(0, '#0a0a15');
        bgGradient.addColorStop(1, '#15152a');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Render particles
        this.particles.forEach(p => p.render(this.ctx));
    }
}
