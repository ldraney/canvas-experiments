/**
 * @fileoverview Fluid Simulation Demo
 * Simple particle-based fluid dynamics
 *
 * LEARNING OBJECTIVES:
 * - Particle-based fluid simulation
 * - Density and pressure calculations
 * - Interactive fluid dynamics
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class FluidParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.density = 0;
        this.pressure = 0;
    }
}

export class FluidSimulationDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Fluid Simulation',
            description: 'Simple particle-based fluid - click to add particles',
            difficulty: 'intermediate',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'gravity', label: 'Gravity', min: 0, max: 0.5, default: 0.15, step: 0.01 },
            { type: 'slider', name: 'viscosity', label: 'Viscosity', min: 0.01, max: 0.2, default: 0.05, step: 0.01 },
            { type: 'slider', name: 'smoothingRadius', label: 'Smoothing', min: 20, max: 60, default: 35 },
            { type: 'checkbox', name: 'showPressure', label: 'Show Pressure', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            gravity: 0.15,
            viscosity: 0.05,
            smoothingRadius: 35,
            showPressure: true
        };
    }

    init() {
        this.particles = [];
        this.restDensity = 1;
        this.pressureMultiplier = 50;

        // Create initial particles
        this.createParticles(100, this.displayWidth / 2, this.displayHeight / 3);
    }

    createParticles(count, centerX, centerY) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 50;
            this.particles.push(new FluidParticle(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            ));
        }
    }

    onClick(x, y) {
        this.createParticles(30, x, y);

        // Limit total particles
        if (this.particles.length > 500) {
            this.particles.splice(0, 50);
        }
    }

    smoothingKernel(dist, radius) {
        if (dist >= radius) return 0;
        const volume = Math.PI * Math.pow(radius, 4) / 6;
        return (radius - dist) * (radius - dist) / volume;
    }

    smoothingKernelDerivative(dist, radius) {
        if (dist >= radius) return 0;
        const scale = 12 / (Math.PI * Math.pow(radius, 4));
        return (dist - radius) * scale;
    }

    update(deltaTime) {
        const { gravity, viscosity, smoothingRadius } = this.options;
        const h = smoothingRadius;
        const width = this.displayWidth;
        const height = this.displayHeight;

        // Calculate densities
        for (const p of this.particles) {
            p.density = 0;
            for (const other of this.particles) {
                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                p.density += this.smoothingKernel(dist, h);
            }
            p.pressure = this.pressureMultiplier * (p.density - this.restDensity);
        }

        // Calculate forces and update velocities
        for (const p of this.particles) {
            let fx = 0;
            let fy = gravity;

            for (const other of this.particles) {
                if (p === other) continue;

                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0 && dist < h) {
                    // Pressure force
                    const pressureForce = -this.smoothingKernelDerivative(dist, h) *
                        (p.pressure + other.pressure) / (2 * other.density);
                    fx += (dx / dist) * pressureForce;
                    fy += (dy / dist) * pressureForce;

                    // Viscosity
                    const viscForce = viscosity * this.smoothingKernel(dist, h) / other.density;
                    fx += (other.vx - p.vx) * viscForce;
                    fy += (other.vy - p.vy) * viscForce;
                }
            }

            p.vx += fx;
            p.vy += fy;

            // Mouse interaction
            if (this.mouse.isDown) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100 && dist > 0) {
                    const force = (100 - dist) / 100;
                    p.vx += (dx / dist) * force * 2;
                    p.vy += (dy / dist) * force * 2;
                }
            }
        }

        // Update positions
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Boundary collisions
            if (p.x < 10) { p.x = 10; p.vx *= -0.5; }
            if (p.x > width - 10) { p.x = width - 10; p.vx *= -0.5; }
            if (p.y < 10) { p.y = 10; p.vy *= -0.5; }
            if (p.y > height - 10) { p.y = height - 10; p.vy *= -0.5; }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;
        }
    }

    render() {
        const { showPressure } = this.options;

        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw particles
        for (const p of this.particles) {
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const size = 6 + speed * 0.5;

            let hue;
            if (showPressure) {
                // Color by pressure
                hue = MathUtils.clamp(200 - p.pressure * 5, 0, 240);
            } else {
                // Color by velocity
                hue = 200 + speed * 10;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
            gradient.addColorStop(0, ColorUtils.hsl(hue, 80, 60, 0.8));
            gradient.addColorStop(1, ColorUtils.hsl(hue, 80, 40, 0.3));
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Mouse indicator
        if (this.mouse.isDown) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 100, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Particles: ${this.particles.length} | Click to add, drag to stir`, 10, 20);
    }
}
