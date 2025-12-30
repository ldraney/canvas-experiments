/**
 * @fileoverview Spring Physics Demo
 * Bouncy spring animations following the mouse
 *
 * LEARNING OBJECTIVES:
 * - Spring physics (Hooke's law)
 * - Damping and oscillation
 * - Physics-based animation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class SpringPoint {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.hue = hue;
        this.trail = [];
        this.maxTrail = 20;
    }

    update(stiffness, damping) {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        // Spring force (Hooke's law)
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        // Acceleration = force (assuming mass = 1)
        const ax = dx * stiffness;
        const ay = dy * stiffness;

        // Apply acceleration
        this.vx += ax;
        this.vy += ay;

        // Apply damping (friction)
        this.vx *= damping;
        this.vy *= damping;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx, showTrail) {
        // Draw trail
        if (showTrail && this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);

            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }

            ctx.strokeStyle = ColorUtils.hsl(this.hue, 70, 50, 0.3);
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Draw point
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 70, 55);
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 3, 4, 0, Math.PI * 2);
        ctx.fillStyle = ColorUtils.hsl(this.hue, 70, 80, 0.5);
        ctx.fill();
    }
}

export class SpringPhysicsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Spring Physics',
            description: 'Bouncy spring animations that follow your mouse',
            difficulty: 'beginner',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'stiffness', label: 'Stiffness', min: 0.01, max: 0.3, default: 0.08, step: 0.01 },
            { type: 'slider', name: 'damping', label: 'Damping', min: 0.8, max: 0.99, default: 0.92, step: 0.01 },
            { type: 'slider', name: 'pointCount', label: 'Points', min: 1, max: 10, default: 5 },
            { type: 'checkbox', name: 'showTrail', label: 'Show Trails', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            stiffness: 0.08,
            damping: 0.92,
            pointCount: 5,
            showTrail: true
        };
    }

    init() {
        this.points = [];
        this.createPoints();
    }

    createPoints() {
        this.points = [];
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        for (let i = 0; i < this.options.pointCount; i++) {
            const hue = (i / this.options.pointCount) * 360;
            const point = new SpringPoint(centerX, centerY, hue);
            this.points.push(point);
        }
    }

    onOptionChange(name, value) {
        if (name === 'pointCount') {
            this.createPoints();
        }
    }

    update(deltaTime) {
        const { stiffness, damping } = this.options;

        // Each point follows the previous one (or mouse for first)
        this.points.forEach((point, index) => {
            if (index === 0) {
                point.targetX = this.mouse.x || this.displayWidth / 2;
                point.targetY = this.mouse.y || this.displayHeight / 2;
            } else {
                point.targetX = this.points[index - 1].x;
                point.targetY = this.points[index - 1].y;
            }

            // Decrease stiffness for trailing points
            const pointStiffness = stiffness * (1 - index * 0.1);
            point.update(pointStiffness, damping);
        });
    }

    render() {
        // Fade background
        this.ctx.fillStyle = 'rgba(10, 10, 18, 0.15)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw lines connecting points
        if (this.points.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouse.x || this.displayWidth / 2, this.mouse.y || this.displayHeight / 2);

            for (const point of this.points) {
                this.ctx.lineTo(point.x, point.y);
            }

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw points (reverse order so first is on top)
        for (let i = this.points.length - 1; i >= 0; i--) {
            this.points[i].render(this.ctx, this.options.showTrail);
        }

        // Mouse target indicator
        this.ctx.beginPath();
        this.ctx.arc(
            this.mouse.x || this.displayWidth / 2,
            this.mouse.y || this.displayHeight / 2,
            8, 0, Math.PI * 2
        );
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Move mouse to lead the chain', 10, 20);
    }
}
