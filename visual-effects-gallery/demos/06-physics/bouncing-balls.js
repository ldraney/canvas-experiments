/**
 * @fileoverview Bouncing Balls Demo
 * Ball physics with gravity and collisions
 *
 * LEARNING OBJECTIVES:
 * - Basic physics simulation
 * - Collision detection and response
 * - Energy conservation (bouncing)
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Ball {
    constructor(x, y, radius, hue) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = MathUtils.random(-5, 5);
        this.vy = MathUtils.random(-5, 5);
        this.hue = hue;
        this.mass = radius * radius; // Mass proportional to area
    }

    update(gravity, friction, width, height) {
        // Apply gravity
        this.vy += gravity;

        // Apply friction
        this.vx *= friction;
        this.vy *= friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.8;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -0.8;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.8;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -0.8;
        }
    }

    collideWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.radius + other.radius;

        if (dist < minDist && dist > 0) {
            // Normalize collision vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Relative velocity
            const dvx = this.vx - other.vx;
            const dvy = this.vy - other.vy;

            // Relative velocity in collision normal direction
            const dvn = dvx * nx + dvy * ny;

            // Don't resolve if velocities are separating
            if (dvn > 0) return;

            // Collision impulse (elastic collision)
            const restitution = 0.9;
            const impulse = (-(1 + restitution) * dvn) / (1 / this.mass + 1 / other.mass);

            // Apply impulse
            this.vx += impulse * nx / this.mass;
            this.vy += impulse * ny / this.mass;
            other.vx -= impulse * nx / other.mass;
            other.vy -= impulse * ny / other.mass;

            // Separate overlapping balls
            const overlap = minDist - dist;
            const separationX = (overlap / 2) * nx;
            const separationY = (overlap / 2) * ny;
            this.x -= separationX;
            this.y -= separationY;
            other.x += separationX;
            other.y += separationY;
        }
    }

    render(ctx) {
        // Shadow
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 3, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // Ball
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 70));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue, 70, 40));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

export class BouncingBallsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Bouncing Balls',
            description: 'Physics simulation with gravity and ball collisions',
            difficulty: 'beginner',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'ballCount', label: 'Balls', min: 5, max: 50, default: 15 },
            { type: 'slider', name: 'gravity', label: 'Gravity', min: 0, max: 1, default: 0.3, step: 0.05 },
            { type: 'slider', name: 'friction', label: 'Friction', min: 0.95, max: 1, default: 0.995, step: 0.001 },
            { type: 'checkbox', name: 'mouseRepel', label: 'Mouse Repels', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            ballCount: 15,
            gravity: 0.3,
            friction: 0.995,
            mouseRepel: true
        };
    }

    init() {
        this.balls = [];
        this.createBalls();
    }

    createBalls() {
        this.balls = [];
        for (let i = 0; i < this.options.ballCount; i++) {
            const radius = MathUtils.random(15, 40);
            this.balls.push(new Ball(
                MathUtils.random(radius, this.displayWidth - radius),
                MathUtils.random(radius, this.displayHeight - radius),
                radius,
                (i / this.options.ballCount) * 360
            ));
        }
    }

    onClick(x, y) {
        // Add a new ball at click position
        const radius = MathUtils.random(15, 40);
        this.balls.push(new Ball(x, y, radius, Math.random() * 360));

        // Remove oldest if too many
        if (this.balls.length > 50) {
            this.balls.shift();
        }
    }

    onOptionChange(name, value) {
        if (name === 'ballCount') {
            this.createBalls();
        }
    }

    update(deltaTime) {
        const { gravity, friction, mouseRepel } = this.options;

        // Update physics
        this.balls.forEach(ball => {
            ball.update(gravity, friction, this.displayWidth, this.displayHeight);

            // Mouse repulsion
            if (mouseRepel && this.mouse.x > 0) {
                const dx = ball.x - this.mouse.x;
                const dy = ball.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100 && dist > 0) {
                    const force = (100 - dist) / 100 * 2;
                    ball.vx += (dx / dist) * force;
                    ball.vy += (dy / dist) * force;
                }
            }
        });

        // Ball-ball collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.balls[i].collideWith(this.balls[j]);
            }
        }
    }

    render() {
        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw balls
        this.balls.forEach(ball => ball.render(this.ctx));

        // Mouse indicator
        if (this.options.mouseRepel && this.mouse.x > 0) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 100, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Balls: ${this.balls.length} | Click to add`, 10, 20);
    }
}
