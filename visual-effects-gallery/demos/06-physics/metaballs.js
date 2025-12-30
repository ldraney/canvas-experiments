/**
 * @fileoverview Metaballs Demo
 * Blobby organic shapes that merge together
 *
 * LEARNING OBJECTIVES:
 * - Isosurface rendering
 * - Marching squares algorithm
 * - Organic motion
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Metaball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = MathUtils.random(-2, 2);
        this.vy = MathUtils.random(-2, 2);
        this.phase = Math.random() * Math.PI * 2;
    }

    update(width, height, speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce off walls
        if (this.x < this.radius || this.x > width - this.radius) {
            this.vx *= -1;
        }
        if (this.y < this.radius || this.y > height - this.radius) {
            this.vy *= -1;
        }

        this.x = MathUtils.clamp(this.x, this.radius, width - this.radius);
        this.y = MathUtils.clamp(this.y, this.radius, height - this.radius);
    }

    // Field contribution at a point
    field(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        const distSq = dx * dx + dy * dy;
        return (this.radius * this.radius) / distSq;
    }
}

export class MetaballsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Metaballs',
            description: 'Organic blobby shapes that merge and split',
            difficulty: 'advanced',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'ballCount', label: 'Balls', min: 3, max: 10, default: 6 },
            { type: 'slider', name: 'threshold', label: 'Threshold', min: 0.5, max: 2, default: 1, step: 0.05 },
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.2, max: 2, default: 1, step: 0.1 },
            { type: 'checkbox', name: 'colorful', label: 'Colorful', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            ballCount: 6,
            threshold: 1,
            speed: 1,
            colorful: true
        };
    }

    init() {
        this.balls = [];
        this.createBalls();
        this.imageData = null;
    }

    createBalls() {
        this.balls = [];
        for (let i = 0; i < this.options.ballCount; i++) {
            this.balls.push(new Metaball(
                MathUtils.random(100, this.displayWidth - 100),
                MathUtils.random(100, this.displayHeight - 100),
                MathUtils.random(40, 80)
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'ballCount') {
            this.createBalls();
        }
    }

    onResize() {
        this.imageData = null;
    }

    update(deltaTime) {
        const { speed } = this.options;
        this.balls.forEach(ball => {
            ball.update(this.displayWidth, this.displayHeight, speed);
        });

        // Mouse interaction
        if (this.mouse.x > 0) {
            // Add temporary metaball at mouse position
            this.mouseInfluence = {
                x: this.mouse.x,
                y: this.mouse.y,
                radius: this.mouse.isDown ? 80 : 50
            };
        }
    }

    calculateField(px, py) {
        let total = 0;
        for (const ball of this.balls) {
            total += ball.field(px, py);
        }

        // Add mouse influence
        if (this.mouseInfluence) {
            const dx = px - this.mouseInfluence.x;
            const dy = py - this.mouseInfluence.y;
            const distSq = dx * dx + dy * dy;
            total += (this.mouseInfluence.radius * this.mouseInfluence.radius) / distSq;
        }

        return total;
    }

    render() {
        const { threshold, colorful } = this.options;
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);
        const step = 4; // Resolution

        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;

        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                const field = this.calculateField(px, py);

                let r, g, b;

                if (field > threshold) {
                    if (colorful) {
                        // Color based on field strength
                        const intensity = Math.min((field - threshold) / threshold, 1);
                        const hue = (this.time * 0.02 + field * 50) % 360;
                        const rgb = ColorUtils.hslToRgb(hue, 80, 50 + intensity * 20);
                        r = rgb.r;
                        g = rgb.g;
                        b = rgb.b;
                    } else {
                        // Grayscale
                        const brightness = Math.min(150 + (field - threshold) * 50, 255);
                        r = g = b = brightness;
                    }
                } else {
                    // Background
                    r = 10;
                    g = 10;
                    b = 20;
                }

                // Fill block of pixels
                for (let dy = 0; dy < step && py + dy < height; dy++) {
                    for (let dx = 0; dx < step && px + dx < width; dx++) {
                        const pixelIndex = ((py + dy) * width + (px + dx)) * 4;
                        data[pixelIndex] = r;
                        data[pixelIndex + 1] = g;
                        data[pixelIndex + 2] = b;
                        data[pixelIndex + 3] = 255;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Draw ball centers (subtle)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (const ball of this.balls) {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Move mouse to interact, click for larger influence', 10, 20);
    }
}
