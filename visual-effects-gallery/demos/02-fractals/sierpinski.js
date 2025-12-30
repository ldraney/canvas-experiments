/**
 * @fileoverview Sierpinski Triangle Demo
 * Interactive Sierpinski triangle with iteration control
 *
 * LEARNING OBJECTIVES:
 * - Subdivision algorithms
 * - Mathematical patterns in art
 * - Interactive iteration control
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

export class SierpinskiDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Sierpinski Triangle',
            description: 'Click to increase iterations of the Sierpinski triangle fractal',
            difficulty: 'beginner',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'iterations', label: 'Iterations', min: 0, max: 8, default: 5 },
            { type: 'checkbox', name: 'colorful', label: 'Colorful Mode', default: true },
            { type: 'checkbox', name: 'animate', label: 'Animate Colors', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            iterations: 5,
            colorful: true,
            animate: true
        };
    }

    init() {
        this.triangles = [];
        this.calculateTriangles();
    }

    onClick(x, y) {
        // Cycle through iterations
        this.options.iterations = (this.options.iterations + 1) % 9;
        this.calculateTriangles();
    }

    calculateTriangles() {
        this.triangles = [];
        const padding = 40;
        const size = Math.min(this.displayWidth, this.displayHeight) - padding * 2;

        // Initial triangle vertices
        const centerX = this.displayWidth / 2;
        const height = size * Math.sqrt(3) / 2;
        const topY = (this.displayHeight - height) / 2;

        const p1 = { x: centerX, y: topY };
        const p2 = { x: centerX - size / 2, y: topY + height };
        const p3 = { x: centerX + size / 2, y: topY + height };

        this.subdivide(p1, p2, p3, this.options.iterations, 0);
    }

    subdivide(p1, p2, p3, depth, colorIndex) {
        if (depth === 0) {
            this.triangles.push({ p1, p2, p3, colorIndex });
            return;
        }

        // Calculate midpoints
        const m1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const m2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
        const m3 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 };

        // Recurse on three corners (skip the middle)
        this.subdivide(p1, m1, m3, depth - 1, colorIndex);
        this.subdivide(m1, p2, m2, depth - 1, colorIndex + 1);
        this.subdivide(m3, m2, p3, depth - 1, colorIndex + 2);
    }

    onResize() {
        this.calculateTriangles();
    }

    onOptionChange(name, value) {
        if (name === 'iterations') {
            this.calculateTriangles();
        }
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        // Background
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw triangles
        this.triangles.forEach((tri, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(tri.p1.x, tri.p1.y);
            this.ctx.lineTo(tri.p2.x, tri.p2.y);
            this.ctx.lineTo(tri.p3.x, tri.p3.y);
            this.ctx.closePath();

            if (this.options.colorful) {
                let hue = (tri.colorIndex * 40) % 360;
                if (this.options.animate) {
                    hue = (hue + this.time * 0.05) % 360;
                }
                this.ctx.fillStyle = ColorUtils.hsl(hue, 70, 50);
            } else {
                this.ctx.fillStyle = '#6366f1';
            }
            this.ctx.fill();

            // Subtle border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        });

        // Info text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `Iterations: ${this.options.iterations} | Triangles: ${this.triangles.length} | Click to iterate`,
            this.displayWidth / 2,
            this.displayHeight - 20
        );
    }
}
