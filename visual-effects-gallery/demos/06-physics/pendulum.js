/**
 * @fileoverview Pendulum Demo
 * Simple and double pendulum simulation
 *
 * LEARNING OBJECTIVES:
 * - Trigonometric motion
 * - Angular physics
 * - Chaotic systems (double pendulum)
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class PendulumDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Pendulum',
            description: 'Simple and double pendulum physics - click to reset',
            difficulty: 'beginner',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'type', label: 'Type (0=Simple, 1=Double)', min: 0, max: 1, default: 1 },
            { type: 'slider', name: 'length1', label: 'Length 1', min: 50, max: 200, default: 120 },
            { type: 'slider', name: 'length2', label: 'Length 2', min: 50, max: 200, default: 100 },
            { type: 'slider', name: 'damping', label: 'Damping', min: 0.99, max: 1, default: 0.9995, step: 0.0001 },
            { type: 'checkbox', name: 'showTrail', label: 'Show Trail', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            type: 1,
            length1: 120,
            length2: 100,
            damping: 0.9995,
            showTrail: true
        };
    }

    init() {
        this.reset();
    }

    reset() {
        // Pendulum 1
        this.angle1 = Math.PI / 2;
        this.velocity1 = 0;

        // Pendulum 2 (for double pendulum)
        this.angle2 = Math.PI / 2;
        this.velocity2 = 0;

        // Trail
        this.trail = [];
        this.maxTrail = 500;

        this.gravity = 0.5;
    }

    onClick(x, y) {
        this.reset();
        // Set initial angle based on click
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight * 0.3;
        this.angle1 = Math.atan2(x - centerX, y - centerY);
        this.angle2 = this.angle1;
    }

    update(deltaTime) {
        const { type, length1, length2, damping } = this.options;
        const g = this.gravity;
        const m1 = 10;
        const m2 = 10;
        const l1 = length1;
        const l2 = length2;

        if (type === 0) {
            // Simple pendulum
            const acceleration = -g / l1 * Math.sin(this.angle1);
            this.velocity1 += acceleration;
            this.velocity1 *= damping;
            this.angle1 += this.velocity1;
        } else {
            // Double pendulum (using Lagrangian mechanics)
            const num1 = -g * (2 * m1 + m2) * Math.sin(this.angle1);
            const num2 = -m2 * g * Math.sin(this.angle1 - 2 * this.angle2);
            const num3 = -2 * Math.sin(this.angle1 - this.angle2) * m2;
            const num4 = this.velocity2 * this.velocity2 * l2 +
                         this.velocity1 * this.velocity1 * l1 * Math.cos(this.angle1 - this.angle2);
            const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * this.angle1 - 2 * this.angle2));

            const acceleration1 = (num1 + num2 + num3 * num4) / den;

            const num5 = 2 * Math.sin(this.angle1 - this.angle2);
            const num6 = this.velocity1 * this.velocity1 * l1 * (m1 + m2);
            const num7 = g * (m1 + m2) * Math.cos(this.angle1);
            const num8 = this.velocity2 * this.velocity2 * l2 * m2 * Math.cos(this.angle1 - this.angle2);
            const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * this.angle1 - 2 * this.angle2));

            const acceleration2 = (num5 * (num6 + num7 + num8)) / den2;

            this.velocity1 += acceleration1;
            this.velocity2 += acceleration2;
            this.velocity1 *= damping;
            this.velocity2 *= damping;
            this.angle1 += this.velocity1;
            this.angle2 += this.velocity2;
        }

        // Store trail position (end of last pendulum)
        if (this.options.showTrail) {
            const centerX = this.displayWidth / 2;
            const centerY = this.displayHeight * 0.3;
            const x1 = centerX + l1 * Math.sin(this.angle1);
            const y1 = centerY + l1 * Math.cos(this.angle1);

            let endX, endY;
            if (type === 0) {
                endX = x1;
                endY = y1;
            } else {
                endX = x1 + l2 * Math.sin(this.angle2);
                endY = y1 + l2 * Math.cos(this.angle2);
            }

            this.trail.push({ x: endX, y: endY });
            if (this.trail.length > this.maxTrail) {
                this.trail.shift();
            }
        }
    }

    render() {
        const { type, length1, length2, showTrail } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;

        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height * 0.3;

        // Calculate positions
        const x1 = centerX + length1 * Math.sin(this.angle1);
        const y1 = centerY + length1 * Math.cos(this.angle1);

        let x2, y2;
        if (type === 1) {
            x2 = x1 + length2 * Math.sin(this.angle2);
            y2 = y1 + length2 * Math.cos(this.angle2);
        }

        // Draw trail
        if (showTrail && this.trail.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);

            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }

            this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw pivot
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#555';
        this.ctx.fill();

        // Draw first rod
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Draw first bob
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 20, 0, Math.PI * 2);
        const gradient1 = this.ctx.createRadialGradient(x1 - 5, y1 - 5, 0, x1, y1, 20);
        gradient1.addColorStop(0, '#ff8866');
        gradient1.addColorStop(1, '#cc4422');
        this.ctx.fillStyle = gradient1;
        this.ctx.fill();

        // Draw second pendulum (if double)
        if (type === 1) {
            // Second rod
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = '#888';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            // Second bob
            this.ctx.beginPath();
            this.ctx.arc(x2, y2, 16, 0, Math.PI * 2);
            const gradient2 = this.ctx.createRadialGradient(x2 - 4, y2 - 4, 0, x2, y2, 16);
            gradient2.addColorStop(0, '#66aaff');
            gradient2.addColorStop(1, '#2266cc');
            this.ctx.fillStyle = gradient2;
            this.ctx.fill();
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        const typeLabel = type === 0 ? 'Simple Pendulum' : 'Double Pendulum';
        this.ctx.fillText(`${typeLabel} | Click to reset with new angle`, 10, 20);
    }
}
