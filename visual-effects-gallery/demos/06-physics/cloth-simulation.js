/**
 * @fileoverview Cloth Simulation Demo
 * Verlet integration cloth physics
 *
 * LEARNING OBJECTIVES:
 * - Verlet integration
 * - Constraint-based physics
 * - Mesh deformation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Point {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
    }

    update(gravity, friction) {
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * friction;
        const vy = (this.y - this.oldY) * friction;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy + gravity;
    }

    constrain(width, height) {
        if (this.pinned) return;

        if (this.x < 0) {
            this.x = 0;
            this.oldX = this.x;
        }
        if (this.x > width) {
            this.x = width;
            this.oldX = this.x;
        }
        if (this.y < 0) {
            this.y = 0;
            this.oldY = this.y;
        }
        if (this.y > height) {
            this.y = height;
            this.oldY = this.y;
        }
    }
}

class Stick {
    constructor(p1, p2, length) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = length;
    }

    update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const diff = this.length - dist;
        const percent = diff / dist / 2;

        const offsetX = dx * percent;
        const offsetY = dy * percent;

        if (!this.p1.pinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }
        if (!this.p2.pinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }
}

export class ClothSimulationDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Cloth Simulation',
            description: 'Drag the cloth with your mouse',
            difficulty: 'intermediate',
            category: 'physics'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'gravity', label: 'Gravity', min: 0.1, max: 1, default: 0.5, step: 0.05 },
            { type: 'slider', name: 'stiffness', label: 'Stiffness', min: 1, max: 10, default: 5 },
            { type: 'slider', name: 'friction', label: 'Friction', min: 0.95, max: 1, default: 0.98, step: 0.005 },
            { type: 'checkbox', name: 'tear', label: 'Can Tear', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            gravity: 0.5,
            stiffness: 5,
            friction: 0.98,
            tear: true
        };
    }

    init() {
        this.points = [];
        this.sticks = [];
        this.dragPoint = null;
        this.createCloth();
    }

    createCloth() {
        this.points = [];
        this.sticks = [];

        const cols = 20;
        const rows = 15;
        const spacing = 20;
        const startX = (this.displayWidth - cols * spacing) / 2;
        const startY = 50;

        // Create points
        const grid = [];
        for (let y = 0; y < rows; y++) {
            grid[y] = [];
            for (let x = 0; x < cols; x++) {
                const pinned = y === 0 && (x === 0 || x === cols - 1 || x === Math.floor(cols / 2));
                const point = new Point(
                    startX + x * spacing,
                    startY + y * spacing,
                    pinned
                );
                grid[y][x] = point;
                this.points.push(point);
            }
        }

        // Create sticks
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (x < cols - 1) {
                    this.sticks.push(new Stick(grid[y][x], grid[y][x + 1], spacing));
                }
                if (y < rows - 1) {
                    this.sticks.push(new Stick(grid[y][x], grid[y + 1][x], spacing));
                }
            }
        }
    }

    onResize() {
        this.createCloth();
    }

    onMouseDown(x, y) {
        // Find closest point
        let closestDist = Infinity;
        for (const point of this.points) {
            if (point.pinned) continue;
            const dist = MathUtils.distance(x, y, point.x, point.y);
            if (dist < closestDist && dist < 50) {
                closestDist = dist;
                this.dragPoint = point;
            }
        }
    }

    onMouseUp() {
        this.dragPoint = null;
    }

    update(deltaTime) {
        const { gravity, stiffness, friction, tear } = this.options;

        // Drag point follows mouse
        if (this.dragPoint) {
            this.dragPoint.x = this.mouse.x;
            this.dragPoint.y = this.mouse.y;
        }

        // Update points
        for (const point of this.points) {
            point.update(gravity, friction);
            point.constrain(this.displayWidth, this.displayHeight);
        }

        // Update sticks multiple times for stiffness
        for (let i = 0; i < stiffness; i++) {
            for (let j = this.sticks.length - 1; j >= 0; j--) {
                const stick = this.sticks[j];
                stick.update();

                // Check for tearing
                if (tear) {
                    const dx = stick.p2.x - stick.p1.x;
                    const dy = stick.p2.y - stick.p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > stick.length * 2) {
                        this.sticks.splice(j, 1);
                    }
                }
            }
        }
    }

    render() {
        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw sticks
        this.ctx.strokeStyle = 'rgba(150, 180, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        for (const stick of this.sticks) {
            this.ctx.moveTo(stick.p1.x, stick.p1.y);
            this.ctx.lineTo(stick.p2.x, stick.p2.y);
        }
        this.ctx.stroke();

        // Draw points
        for (const point of this.points) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.pinned ? 6 : 3, 0, Math.PI * 2);
            this.ctx.fillStyle = point.pinned ? '#ff6666' : '#88aaff';
            this.ctx.fill();
        }

        // Draw drag indicator
        if (this.dragPoint) {
            this.ctx.beginPath();
            this.ctx.arc(this.dragPoint.x, this.dragPoint.y, 10, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Drag to interact with cloth', 10, 20);
    }
}
