/**
 * @fileoverview Flow Field Demo
 * Particles following a Perlin noise vector field
 *
 * LEARNING OBJECTIVES:
 * - Noise-based vector fields
 * - Particles following field directions
 * - Creating organic motion
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

// Simple noise function (value noise)
function noise2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function smoothNoise(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;

    // Smooth interpolation
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const n00 = noise2D(x0, y0);
    const n10 = noise2D(x0 + 1, y0);
    const n01 = noise2D(x0, y0 + 1);
    const n11 = noise2D(x0 + 1, y0 + 1);

    const nx0 = n00 * (1 - sx) + n10 * sx;
    const nx1 = n01 * (1 - sx) + n11 * sx;

    return nx0 * (1 - sy) + nx1 * sy;
}

class FlowParticle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.hue = hue;
        this.speed = MathUtils.random(1, 3);
        this.life = MathUtils.random(100, 300);
        this.maxLife = this.life;
    }

    update(width, height, scale, noiseZ, speed) {
        this.prevX = this.x;
        this.prevY = this.y;

        // Get flow angle from noise
        const noiseValue = smoothNoise(this.x * scale, this.y * scale + noiseZ);
        const angle = noiseValue * Math.PI * 4;

        // Move in flow direction
        this.x += Math.cos(angle) * this.speed * speed;
        this.y += Math.sin(angle) * this.speed * speed;

        this.life--;

        // Reset if out of bounds or dead
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life <= 0) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.prevX = this.x;
            this.prevY = this.y;
            this.life = this.maxLife;
        }
    }

    render(ctx) {
        const lifeRatio = this.life / this.maxLife;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = ColorUtils.hsl(this.hue, 70, 55, lifeRatio * 0.5);
        ctx.lineWidth = lifeRatio * 2;
        ctx.stroke();
    }
}

export class FlowFieldDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Flow Field',
            description: 'Particles flowing through a noise-based vector field',
            difficulty: 'beginner',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'particleCount', label: 'Particles', min: 500, max: 5000, default: 2000 },
            { type: 'slider', name: 'scale', label: 'Field Scale', min: 0.001, max: 0.02, default: 0.005, step: 0.001 },
            { type: 'slider', name: 'speed', label: 'Flow Speed', min: 0.5, max: 3, default: 1.5, step: 0.1 },
            { type: 'slider', name: 'hue', label: 'Base Hue', min: 0, max: 360, default: 200 }
        ];
    }

    getDefaultOptions() {
        return {
            particleCount: 2000,
            scale: 0.005,
            speed: 1.5,
            hue: 200
        };
    }

    init() {
        this.particles = [];
        this.noiseZ = 0;
        this.createParticles();

        // Dark background
        this.ctx.fillStyle = '#050508';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            const hue = this.options.hue + MathUtils.random(-30, 30);
            this.particles.push(new FlowParticle(
                Math.random() * this.displayWidth,
                Math.random() * this.displayHeight,
                hue
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'particleCount') {
            this.createParticles();
        }
    }

    onClick(x, y) {
        // Reset
        this.ctx.fillStyle = '#050508';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        this.createParticles();
    }

    update(deltaTime) {
        this.noiseZ += 0.001;

        this.particles.forEach(p => {
            p.update(
                this.displayWidth,
                this.displayHeight,
                this.options.scale,
                this.noiseZ,
                this.options.speed
            );
        });
    }

    render() {
        // Subtle fade
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.02)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw particles
        this.particles.forEach(p => p.render(this.ctx));
    }
}
