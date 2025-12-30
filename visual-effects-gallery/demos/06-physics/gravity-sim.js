/**
 * @fileoverview Gravity Simulation Demo
 * N-body gravitational simulation
 *
 * LEARNING OBJECTIVES:
 * - Gravitational physics
 * - N-body simulation
 * - Orbital mechanics
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Body {
    constructor(x, y, mass, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.vx = vx;
        this.vy = vy;
        this.radius = Math.pow(mass, 1/3) * 3;
        this.hue = Math.random() * 360;
        this.trail = [];
        this.maxTrail = 100;
    }

    update() {
        // Store trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx, showTrails) {
        // Draw trail
        if (showTrails && this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = ColorUtils.hsl(this.hue, 60, 50, 0.3);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 70));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue, 70, 30));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, this.radius,
            this.x, this.y, this.radius * 2
        );
        glowGradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 50, 0.3));
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class GravitySimDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'N-Body Gravity',
            description: 'Gravitational orbital simulation - click to add bodies',
            difficulty: 'advanced',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'gravity', label: 'Gravity Strength', min: 0.1, max: 2, default: 0.5, step: 0.1 },
            { type: 'slider', name: 'softening', label: 'Softening', min: 10, max: 100, default: 50 },
            { type: 'checkbox', name: 'showTrails', label: 'Show Trails', default: true },
            { type: 'checkbox', name: 'merge', label: 'Merge on Collision', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            gravity: 0.5,
            softening: 50,
            showTrails: true,
            merge: true
        };
    }

    init() {
        this.bodies = [];
        this.createInitialSystem();
    }

    createInitialSystem() {
        this.bodies = [];

        // Central massive body
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        const centralBody = new Body(centerX, centerY, 500);
        centralBody.hue = 45; // Yellow/orange
        this.bodies.push(centralBody);

        // Orbiting bodies
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 100 + i * 40;
            const orbitSpeed = Math.sqrt(500 * 0.5 / distance) * 0.8;

            const body = new Body(
                centerX + Math.cos(angle) * distance,
                centerY + Math.sin(angle) * distance,
                MathUtils.random(10, 30),
                -Math.sin(angle) * orbitSpeed,
                Math.cos(angle) * orbitSpeed
            );
            this.bodies.push(body);
        }
    }

    onClick(x, y) {
        // Add new body with velocity perpendicular to center
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Calculate orbital velocity
        let totalMass = 0;
        for (const body of this.bodies) {
            totalMass += body.mass;
        }
        const orbitalSpeed = Math.sqrt(totalMass * this.options.gravity / Math.max(dist, 50)) * 0.3;

        const newBody = new Body(
            x, y,
            MathUtils.random(10, 50),
            -dy / dist * orbitalSpeed,
            dx / dist * orbitalSpeed
        );
        this.bodies.push(newBody);

        // Limit bodies
        if (this.bodies.length > 30) {
            // Remove smallest non-central body
            let smallestIndex = 1;
            for (let i = 2; i < this.bodies.length; i++) {
                if (this.bodies[i].mass < this.bodies[smallestIndex].mass) {
                    smallestIndex = i;
                }
            }
            this.bodies.splice(smallestIndex, 1);
        }
    }

    update(deltaTime) {
        const { gravity, softening, merge } = this.options;
        const G = gravity;

        // Calculate gravitational forces
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            let ax = 0;
            let ay = 0;

            for (let j = 0; j < this.bodies.length; j++) {
                if (i === j) continue;

                const other = this.bodies[j];
                const dx = other.x - body.x;
                const dy = other.y - body.y;
                const distSq = dx * dx + dy * dy + softening * softening;
                const dist = Math.sqrt(distSq);

                // F = G * m1 * m2 / r^2
                const force = G * other.mass / distSq;
                ax += (dx / dist) * force;
                ay += (dy / dist) * force;
            }

            body.vx += ax;
            body.vy += ay;
        }

        // Update positions
        for (const body of this.bodies) {
            body.update();
        }

        // Handle merging collisions
        if (merge) {
            for (let i = this.bodies.length - 1; i >= 0; i--) {
                for (let j = i - 1; j >= 0; j--) {
                    const b1 = this.bodies[i];
                    const b2 = this.bodies[j];
                    if (!b1 || !b2) continue;

                    const dx = b2.x - b1.x;
                    const dy = b2.y - b1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < b1.radius + b2.radius) {
                        // Merge into larger body
                        const totalMass = b1.mass + b2.mass;
                        b2.x = (b1.x * b1.mass + b2.x * b2.mass) / totalMass;
                        b2.y = (b1.y * b1.mass + b2.y * b2.mass) / totalMass;
                        b2.vx = (b1.vx * b1.mass + b2.vx * b2.mass) / totalMass;
                        b2.vy = (b1.vy * b1.mass + b2.vy * b2.mass) / totalMass;
                        b2.mass = totalMass;
                        b2.radius = Math.pow(totalMass, 1/3) * 3;

                        this.bodies.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // Keep bodies in bounds (soft boundary)
        const margin = 100;
        for (const body of this.bodies) {
            if (body.x < -margin) body.x = this.displayWidth + margin;
            if (body.x > this.displayWidth + margin) body.x = -margin;
            if (body.y < -margin) body.y = this.displayHeight + margin;
            if (body.y > this.displayHeight + margin) body.y = -margin;
        }
    }

    render() {
        const { showTrails } = this.options;

        // Fade background for trails
        this.ctx.fillStyle = 'rgba(5, 5, 15, 0.3)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw bodies
        for (const body of this.bodies) {
            body.render(this.ctx, showTrails);
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Bodies: ${this.bodies.length} | Click to add orbiting body`, 10, 20);
    }
}
