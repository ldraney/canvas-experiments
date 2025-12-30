/**
 * @fileoverview Circle Packing Demo
 * Space-filling algorithm with non-overlapping circles
 *
 * LEARNING OBJECTIVES:
 * - Collision detection
 * - Growth algorithms
 * - Packing optimization
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class GrowingCircle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.growing = true;
        this.hue = hue;
        this.targetRadius = 0;
    }

    grow(speed) {
        if (this.growing) {
            this.radius += speed;
        }
    }

    edges(width, height) {
        return (
            this.x - this.radius < 0 ||
            this.x + this.radius > width ||
            this.y - this.radius < 0 ||
            this.y + this.radius > height
        );
    }

    overlaps(other) {
        const dist = MathUtils.distance(this.x, this.y, other.x, other.y);
        return dist < this.radius + other.radius + 2; // 2px buffer
    }

    render(ctx, animate, time) {
        const pulseScale = animate ? 1 + Math.sin(time * 0.003 + this.x * 0.01) * 0.02 : 1;
        const r = this.radius * pulseScale;

        // Gradient fill
        const gradient = ctx.createRadialGradient(
            this.x - r * 0.3, this.y - r * 0.3, 0,
            this.x, this.y, r
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 60));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue, 60, 40));

        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle border
        ctx.strokeStyle = ColorUtils.hsl(this.hue, 50, 70, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

export class CirclePackingDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Circle Packing',
            description: 'Space-filling circles that grow until they touch',
            difficulty: 'intermediate',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'growthSpeed', label: 'Growth Speed', min: 0.2, max: 2, default: 0.5, step: 0.1 },
            { type: 'slider', name: 'maxCircles', label: 'Max Circles', min: 100, max: 1000, default: 500 },
            { type: 'slider', name: 'newPerFrame', label: 'New Per Frame', min: 1, max: 10, default: 3 },
            { type: 'checkbox', name: 'animate', label: 'Pulse Animation', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            growthSpeed: 0.5,
            maxCircles: 500,
            newPerFrame: 3,
            animate: true
        };
    }

    init() {
        this.circles = [];
        this.attempts = 0;
        this.maxAttempts = 500;
        this.complete = false;
        this.hueOffset = Math.random() * 360;
    }

    onClick(x, y) {
        // Restart packing
        this.circles = [];
        this.attempts = 0;
        this.complete = false;
        this.hueOffset = Math.random() * 360;
    }

    tryAddCircle() {
        // Random position
        const x = Math.random() * this.displayWidth;
        const y = Math.random() * this.displayHeight;

        // Check if position is valid
        let valid = true;
        for (const circle of this.circles) {
            const dist = MathUtils.distance(x, y, circle.x, circle.y);
            if (dist < circle.radius + 5) {
                valid = false;
                break;
            }
        }

        if (valid) {
            const hue = (this.hueOffset + this.circles.length * 0.5) % 360;
            this.circles.push(new GrowingCircle(x, y, hue));
            this.attempts = 0;
            return true;
        }

        this.attempts++;
        return false;
    }

    update(deltaTime) {
        if (this.complete) return;

        const { growthSpeed, maxCircles, newPerFrame } = this.options;

        // Try to add new circles
        if (this.circles.length < maxCircles && this.attempts < this.maxAttempts) {
            for (let i = 0; i < newPerFrame; i++) {
                this.tryAddCircle();
            }
        }

        // Check if packing is complete
        if (this.attempts >= this.maxAttempts && this.circles.every(c => !c.growing)) {
            this.complete = true;
        }

        // Grow circles
        for (const circle of this.circles) {
            if (circle.growing) {
                circle.grow(growthSpeed);

                // Stop at edges
                if (circle.edges(this.displayWidth, this.displayHeight)) {
                    circle.growing = false;
                }

                // Stop if touching another circle
                for (const other of this.circles) {
                    if (circle !== other && circle.overlaps(other)) {
                        circle.growing = false;
                        break;
                    }
                }
            }
        }
    }

    render() {
        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw circles
        for (const circle of this.circles) {
            circle.render(this.ctx, this.options.animate, this.time);
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        const status = this.complete ? 'Complete!' : 'Packing...';
        this.ctx.fillText(`Circles: ${this.circles.length} | ${status} | Click to restart`, 10, 20);
    }
}
