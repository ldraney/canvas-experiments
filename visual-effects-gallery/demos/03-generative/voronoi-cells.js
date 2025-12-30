/**
 * @fileoverview Voronoi Cells Demo
 * Interactive Voronoi diagram with colored cells
 *
 * LEARNING OBJECTIVES:
 * - Voronoi diagram generation
 * - Distance-based partitioning
 * - Interactive point manipulation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class VoronoiPoint {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.vx = MathUtils.random(-0.5, 0.5);
        this.vy = MathUtils.random(-0.5, 0.5);
        this.hue = hue;
    }

    update(width, height, speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.x = MathUtils.clamp(this.x, 0, width);
        this.y = MathUtils.clamp(this.y, 0, height);
    }
}

export class VoronoiCellsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Voronoi Cells',
            description: 'Interactive Voronoi diagram - click to add points',
            difficulty: 'intermediate',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'pointCount', label: 'Points', min: 5, max: 50, default: 20 },
            { type: 'slider', name: 'speed', label: 'Movement', min: 0, max: 2, default: 0.5, step: 0.1 },
            { type: 'checkbox', name: 'showPoints', label: 'Show Points', default: true },
            { type: 'checkbox', name: 'showEdges', label: 'Show Edges', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            pointCount: 20,
            speed: 0.5,
            showPoints: true,
            showEdges: true
        };
    }

    init() {
        this.points = [];
        this.createPoints();
        this.imageData = null;
    }

    createPoints() {
        this.points = [];
        for (let i = 0; i < this.options.pointCount; i++) {
            this.points.push(new VoronoiPoint(
                MathUtils.random(50, this.displayWidth - 50),
                MathUtils.random(50, this.displayHeight - 50),
                (i / this.options.pointCount) * 360
            ));
        }
    }

    onClick(x, y) {
        // Add new point
        const hue = Math.random() * 360;
        this.points.push(new VoronoiPoint(x, y, hue));
    }

    onOptionChange(name, value) {
        if (name === 'pointCount') {
            this.createPoints();
        }
    }

    onResize() {
        this.imageData = null;
    }

    update(deltaTime) {
        if (this.options.speed > 0) {
            this.points.forEach(p => {
                p.update(this.displayWidth, this.displayHeight, this.options.speed);
            });
        }
    }

    findClosestPoint(x, y) {
        let minDist = Infinity;
        let closestIndex = 0;

        for (let i = 0; i < this.points.length; i++) {
            const dist = MathUtils.distance(x, y, this.points[i].x, this.points[i].y);
            if (dist < minDist) {
                minDist = dist;
                closestIndex = i;
            }
        }

        return { index: closestIndex, distance: minDist };
    }

    render() {
        const width = Math.floor(this.displayWidth);
        const height = Math.floor(this.displayHeight);

        // Create image data for pixel-by-pixel rendering
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.imageData = this.ctx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const step = 2; // Render every nth pixel for performance

        // Clear to black first
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 10;
            data[i + 1] = 10;
            data[i + 2] = 18;
            data[i + 3] = 255;
        }

        // Fill cells
        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                const { index, distance } = this.findClosestPoint(px, py);
                const point = this.points[index];

                const rgb = ColorUtils.hslToRgb(point.hue, 60, 40);

                // Fill block of pixels
                for (let dy = 0; dy < step && py + dy < height; dy++) {
                    for (let dx = 0; dx < step && px + dx < width; dx++) {
                        const pixelIndex = ((py + dy) * width + (px + dx)) * 4;
                        data[pixelIndex] = rgb.r;
                        data[pixelIndex + 1] = rgb.g;
                        data[pixelIndex + 2] = rgb.b;
                    }
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        // Draw edges (approximate by checking adjacent pixels with different closest points)
        if (this.options.showEdges) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;

            const edgeStep = 4;
            for (let py = 0; py < height; py += edgeStep) {
                for (let px = 0; px < width; px += edgeStep) {
                    const current = this.findClosestPoint(px, py).index;
                    const right = this.findClosestPoint(px + edgeStep, py).index;
                    const down = this.findClosestPoint(px, py + edgeStep).index;

                    if (current !== right || current !== down) {
                        this.ctx.beginPath();
                        this.ctx.arc(px, py, 1, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
            }
        }

        // Draw points
        if (this.options.showPoints) {
            this.points.forEach((point, i) => {
                // Point glow
                const gradient = this.ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, 15
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(point.x - 15, point.y - 15, 30, 30);

                // Point
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();
            });
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Points: ${this.points.length} | Click to add`, 10, 20);
    }
}
