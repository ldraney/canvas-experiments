/**
 * @fileoverview Random Walkers Demo
 * Multiple random walk trails creating abstract patterns
 *
 * LEARNING OBJECTIVES:
 * - Random walk algorithms
 * - Persistent trails without clearing canvas
 * - Emergent patterns from simple rules
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Walker {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.stepSize = MathUtils.random(2, 5);
        this.angle = Math.random() * Math.PI * 2;
        this.turnSpeed = MathUtils.random(0.1, 0.3);
    }

    update(width, height, stepSize) {
        // Random turn
        this.angle += (Math.random() - 0.5) * this.turnSpeed;

        // Move forward
        const dx = Math.cos(this.angle) * this.stepSize * stepSize;
        const dy = Math.sin(this.angle) * this.stepSize * stepSize;

        this.prevX = this.x;
        this.prevY = this.y;
        this.x += dx;
        this.y += dy;

        // Wrap around edges
        if (this.x < 0) this.x += width;
        if (this.x > width) this.x -= width;
        if (this.y < 0) this.y += height;
        if (this.y > height) this.y -= height;

        // Slowly shift hue
        this.hue = (this.hue + 0.2) % 360;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = ColorUtils.hsl(this.hue, 70, 55, 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

export class RandomWalkersDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Random Walkers',
            description: 'Multiple random walk trails creating emergent patterns',
            difficulty: 'beginner',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'walkerCount', label: 'Walkers', min: 5, max: 50, default: 20 },
            { type: 'slider', name: 'stepSize', label: 'Step Size', min: 0.5, max: 3, default: 1, step: 0.1 },
            { type: 'checkbox', name: 'fadeTrails', label: 'Fade Trails', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            walkerCount: 20,
            stepSize: 1,
            fadeTrails: true
        };
    }

    init() {
        this.walkers = [];
        this.createWalkers();

        // Initial background
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }

    createWalkers() {
        this.walkers = [];
        for (let i = 0; i < this.options.walkerCount; i++) {
            this.walkers.push(new Walker(
                this.displayWidth / 2,
                this.displayHeight / 2,
                (i / this.options.walkerCount) * 360
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'walkerCount') {
            this.createWalkers();
            this.ctx.fillStyle = '#0a0a12';
            this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        }
    }

    onClick(x, y) {
        // Reset and start from click position
        this.walkers.forEach(w => {
            w.x = x;
            w.y = y;
            w.prevX = x;
            w.prevY = y;
        });
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }

    update(deltaTime) {
        this.walkers.forEach(w => {
            w.update(this.displayWidth, this.displayHeight, this.options.stepSize);
        });
    }

    render() {
        // Fade effect
        if (this.options.fadeTrails) {
            this.ctx.fillStyle = 'rgba(10, 10, 18, 0.01)';
            this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        }

        // Draw walker trails
        this.walkers.forEach(w => w.render(this.ctx));
    }
}
