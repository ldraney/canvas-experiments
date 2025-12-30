/**
 * @fileoverview Particle Text Demo
 * Text rendered as particles that scatter and reform
 *
 * LEARNING OBJECTIVES:
 * - Reading pixel data from canvas
 * - Text measurement and positioning
 * - Complex particle target positions
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class TextParticle {
    constructor(x, y, targetX, targetY, hue) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = 0;
        this.vy = 0;
        this.hue = hue;
        this.size = MathUtils.random(1.5, 3);
    }

    update(mouseX, mouseY, mouseRadius, returnForce) {
        // Distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repel from mouse
        if (dist < mouseRadius) {
            const force = (mouseRadius - dist) / mouseRadius;
            this.vx -= (dx / dist) * force * 5;
            this.vy -= (dy / dist) * force * 5;
        }

        // Return to target
        const returnDx = this.targetX - this.x;
        const returnDy = this.targetY - this.y;
        this.vx += returnDx * returnForce;
        this.vy += returnDy * returnForce;

        // Apply velocity with friction
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.9;
        this.vy *= 0.9;
    }

    render(ctx) {
        const distToTarget = MathUtils.distance(this.x, this.y, this.targetX, this.targetY);
        const alpha = MathUtils.clamp(1 - distToTarget * 0.002, 0.3, 1);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 70, 60, alpha);
        ctx.fill();
    }
}

export class ParticleTextDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Particle Text',
            description: 'Text made of particles that scatter when you hover',
            difficulty: 'advanced',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'mouseRadius', label: 'Mouse Radius', min: 50, max: 200, default: 100 },
            { type: 'slider', name: 'returnForce', label: 'Return Force', min: 0.01, max: 0.2, default: 0.05, step: 0.01 },
            { type: 'slider', name: 'hue', label: 'Base Hue', min: 0, max: 360, default: 280 }
        ];
    }

    getDefaultOptions() {
        return {
            mouseRadius: 100,
            returnForce: 0.05,
            hue: 280,
            text: 'CANVAS'
        };
    }

    init() {
        this.particles = [];
        this.createTextParticles();
    }

    createTextParticles() {
        this.particles = [];

        // Create offscreen canvas to render text
        const offscreen = document.createElement('canvas');
        const ctx = offscreen.getContext('2d');

        const text = this.options.text;
        const fontSize = Math.min(this.displayWidth * 0.15, 150);

        // Set up text
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        offscreen.width = textWidth + 20;
        offscreen.height = textHeight + 20;

        // Draw text
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(text, 10, 10);

        // Sample pixels
        const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imageData.data;
        const gap = 4; // Sample every 4 pixels

        const offsetX = (this.displayWidth - textWidth) / 2;
        const offsetY = (this.displayHeight - textHeight) / 2;

        for (let y = 0; y < offscreen.height; y += gap) {
            for (let x = 0; x < offscreen.width; x += gap) {
                const index = (y * offscreen.width + x) * 4;
                const alpha = data[index + 3];

                if (alpha > 128) {
                    const targetX = x + offsetX;
                    const targetY = y + offsetY;

                    // Start from random position
                    const startX = Math.random() * this.displayWidth;
                    const startY = Math.random() * this.displayHeight;

                    const hue = this.options.hue + MathUtils.random(-30, 30);
                    this.particles.push(new TextParticle(startX, startY, targetX, targetY, hue));
                }
            }
        }
    }

    onResize() {
        this.createTextParticles();
    }

    onOptionChange(name, value) {
        if (name === 'hue') {
            this.particles.forEach(p => {
                p.hue = value + MathUtils.random(-30, 30);
            });
        }
    }

    update(deltaTime) {
        this.particles.forEach(p => {
            p.update(
                this.mouse.x,
                this.mouse.y,
                this.options.mouseRadius,
                this.options.returnForce
            );
        });
    }

    render() {
        // Clear with slight fade for subtle trails
        this.ctx.fillStyle = 'rgba(8, 8, 16, 0.3)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw particles
        this.particles.forEach(p => p.render(this.ctx));

        // Draw mouse influence area (subtle)
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, this.options.mouseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.stroke();
    }
}
