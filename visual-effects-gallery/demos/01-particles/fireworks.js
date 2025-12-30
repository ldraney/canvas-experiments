/**
 * @fileoverview Fireworks Demo
 * Click to launch fireworks that burst into colorful sparks
 *
 * LEARNING OBJECTIVES:
 * - Particle emitters and explosions
 * - Gravity simulation
 * - Particle lifecycle management
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

class Spark {
    constructor(x, y, angle, speed, hue) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.hue = hue;
        this.life = 1;
        this.decay = MathUtils.random(0.015, 0.025);
        this.size = MathUtils.random(2, 4);
        this.trail = [];
        this.maxTrail = 5;
    }

    update(gravity) {
        // Store trail position
        this.trail.push({ x: this.x, y: this.y, life: this.life });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        // Apply physics
        this.vy += gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Decay
        this.life -= this.decay;
    }

    render(ctx) {
        // Draw trail
        this.trail.forEach((point, i) => {
            const trailLife = (i / this.trail.length) * point.life;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * trailLife * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = ColorUtils.hsl(this.hue, 80, 60, trailLife * 0.5);
            ctx.fill();
        });

        // Draw spark
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 80, 70, this.life);
        ctx.fill();
    }

    get isDead() {
        return this.life <= 0;
    }
}

class Rocket {
    constructor(x, targetY, hue) {
        this.x = x;
        this.y = window.innerHeight;
        this.targetY = targetY;
        this.vy = -MathUtils.random(12, 16);
        this.hue = hue;
        this.exploded = false;
        this.trail = [];
        this.maxTrail = 8;
    }

    update() {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        this.y += this.vy;
        this.vy += 0.2; // Gravity slows it down

        // Explode when velocity reverses or reaches target
        if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
        }
    }

    render(ctx) {
        // Draw trail
        this.trail.forEach((point, i) => {
            const alpha = i / this.trail.length;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = ColorUtils.hsl(this.hue, 80, 70, alpha * 0.5);
            ctx.fill();
        });

        // Draw rocket
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 80, 80);
        ctx.fill();
    }

    explode() {
        const sparks = [];
        const sparkCount = MathUtils.randomInt(50, 100);

        for (let i = 0; i < sparkCount; i++) {
            const angle = (Math.PI * 2 * i) / sparkCount + MathUtils.random(-0.2, 0.2);
            const speed = MathUtils.random(2, 8);
            sparks.push(new Spark(this.x, this.y, angle, speed, this.hue + MathUtils.random(-20, 20)));
        }

        return sparks;
    }
}

export class FireworksDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Fireworks',
            description: 'Click anywhere to launch colorful fireworks',
            difficulty: 'intermediate',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'gravity', label: 'Gravity', min: 0.02, max: 0.2, default: 0.08, step: 0.01 },
            { type: 'slider', name: 'autoLaunchRate', label: 'Auto Launch Rate', min: 0, max: 5, default: 2 },
            { type: 'checkbox', name: 'rainbow', label: 'Rainbow Mode', default: false }
        ];
    }

    getDefaultOptions() {
        return {
            gravity: 0.08,
            autoLaunchRate: 2,
            rainbow: false
        };
    }

    init() {
        this.rockets = [];
        this.sparks = [];
        this.lastAutoLaunch = 0;
        this.hueCounter = 0;
    }

    onClick(x, y) {
        this.launchRocket(x, y);
    }

    launchRocket(x, targetY) {
        const hue = this.options.rainbow ? (this.hueCounter += 30) % 360 : MathUtils.random(0, 360);
        this.rockets.push(new Rocket(x, targetY, hue));
    }

    update(deltaTime) {
        // Auto-launch rockets
        if (this.options.autoLaunchRate > 0) {
            this.lastAutoLaunch += deltaTime;
            if (this.lastAutoLaunch > 1000 / this.options.autoLaunchRate) {
                this.launchRocket(
                    MathUtils.random(this.displayWidth * 0.1, this.displayWidth * 0.9),
                    MathUtils.random(this.displayHeight * 0.1, this.displayHeight * 0.4)
                );
                this.lastAutoLaunch = 0;
            }
        }

        // Update rockets
        this.rockets.forEach(rocket => {
            rocket.update();
            if (rocket.exploded) {
                this.sparks.push(...rocket.explode());
            }
        });
        this.rockets = this.rockets.filter(r => !r.exploded);

        // Update sparks
        this.sparks.forEach(spark => spark.update(this.options.gravity));
        this.sparks = this.sparks.filter(s => !s.isDead);
    }

    render() {
        // Fade effect for trails
        this.ctx.fillStyle = 'rgba(5, 5, 15, 0.15)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw rockets
        this.rockets.forEach(rocket => rocket.render(this.ctx));

        // Draw sparks
        this.sparks.forEach(spark => spark.render(this.ctx));

        // Instructions
        if (this.rockets.length === 0 && this.sparks.length === 0 && this.options.autoLaunchRate === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '16px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click anywhere to launch fireworks', this.displayWidth / 2, this.displayHeight / 2);
        }
    }
}
