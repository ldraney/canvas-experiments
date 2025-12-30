/**
 * @fileoverview 3D Starfield Demo
 * Flying through a field of stars with perspective
 *
 * LEARNING OBJECTIVES:
 * - Perspective projection
 * - Z-depth simulation
 * - Speed lines effect
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Star {
    constructor(width, height, depth) {
        this.reset(width, height, depth, true);
    }

    reset(width, height, depth, randomZ = false) {
        this.x = MathUtils.random(-width / 2, width / 2);
        this.y = MathUtils.random(-height / 2, height / 2);
        this.z = randomZ ? MathUtils.random(1, depth) : depth;
        this.prevZ = this.z;
    }

    update(speed, width, height, depth) {
        this.prevZ = this.z;
        this.z -= speed;

        if (this.z <= 0) {
            this.reset(width, height, depth);
        }
    }

    project(width, height, fov) {
        const factor = fov / this.z;
        const prevFactor = fov / this.prevZ;

        return {
            x: this.x * factor + width / 2,
            y: this.y * factor + height / 2,
            prevX: this.x * prevFactor + width / 2,
            prevY: this.y * prevFactor + height / 2,
            size: Math.max(0, (1 - this.z / 1000) * 3),
            alpha: Math.max(0, 1 - this.z / 1000)
        };
    }
}

export class StarfieldDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: '3D Starfield',
            description: 'Flying through space at warp speed',
            difficulty: 'advanced',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'speed', label: 'Speed', min: 1, max: 30, default: 10 },
            { type: 'slider', name: 'starCount', label: 'Stars', min: 100, max: 1000, default: 500 },
            { type: 'slider', name: 'fov', label: 'Field of View', min: 100, max: 500, default: 250 },
            { type: 'checkbox', name: 'trails', label: 'Speed Lines', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            speed: 10,
            starCount: 500,
            fov: 250,
            trails: true
        };
    }

    init() {
        this.stars = [];
        this.depth = 1000;
        this.createStars();
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.options.starCount; i++) {
            this.stars.push(new Star(this.displayWidth, this.displayHeight, this.depth));
        }
    }

    onOptionChange(name, value) {
        if (name === 'starCount') {
            this.createStars();
        }
    }

    onResize() {
        // Stars will naturally adapt
    }

    update(deltaTime) {
        const { speed } = this.options;
        const normalizedSpeed = speed * deltaTime * 0.05;

        this.stars.forEach(star => {
            star.update(normalizedSpeed, this.displayWidth, this.displayHeight, this.depth);
        });
    }

    render() {
        const { fov, trails } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;

        // Black background with subtle blue tint
        const gradient = this.ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, width / 2
        );
        gradient.addColorStop(0, '#05050a');
        gradient.addColorStop(1, '#000005');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Sort stars by depth (far to near)
        const sortedStars = [...this.stars].sort((a, b) => b.z - a.z);

        // Draw stars
        sortedStars.forEach(star => {
            const projected = star.project(width, height, fov);

            // Skip if outside viewport
            if (projected.x < -50 || projected.x > width + 50 ||
                projected.y < -50 || projected.y > height + 50) {
                return;
            }

            if (trails && projected.size > 0.5) {
                // Draw speed line
                this.ctx.beginPath();
                this.ctx.moveTo(projected.prevX, projected.prevY);
                this.ctx.lineTo(projected.x, projected.y);

                const gradient = this.ctx.createLinearGradient(
                    projected.prevX, projected.prevY,
                    projected.x, projected.y
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                gradient.addColorStop(1, `rgba(255, 255, 255, ${projected.alpha})`);

                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = projected.size;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }

            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);

            // Color varies slightly
            const hue = (star.x + star.y) % 60 - 30 + 220; // Blue-ish white
            this.ctx.fillStyle = ColorUtils.hsl(hue, 20, 90, projected.alpha);
            this.ctx.fill();
        });

        // Center crosshair (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2 - 20, height / 2);
        this.ctx.lineTo(width / 2 + 20, height / 2);
        this.ctx.moveTo(width / 2, height / 2 - 20);
        this.ctx.lineTo(width / 2, height / 2 + 20);
        this.ctx.stroke();

        // Speed indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`WARP ${this.options.speed.toFixed(1)}`, 10, 20);
    }
}
