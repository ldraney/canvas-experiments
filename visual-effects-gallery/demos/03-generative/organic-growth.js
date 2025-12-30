/**
 * @fileoverview Organic Growth Demo
 * Differential growth simulation creating organic shapes
 *
 * LEARNING OBJECTIVES:
 * - Differential growth algorithm
 * - Path subdivision
 * - Force-directed layouts
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils, Vector2 } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }
}

export class OrganicGrowthDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Organic Growth',
            description: 'Differential growth simulation - watch the shape evolve',
            difficulty: 'advanced',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'repulsionForce', label: 'Repulsion', min: 0.5, max: 3, default: 1.5, step: 0.1 },
            { type: 'slider', name: 'attractionForce', label: 'Attraction', min: 0.1, max: 1, default: 0.3, step: 0.05 },
            { type: 'slider', name: 'maxNodes', label: 'Max Nodes', min: 200, max: 2000, default: 800 },
            { type: 'slider', name: 'splitDistance', label: 'Split Threshold', min: 5, max: 20, default: 10 }
        ];
    }

    getDefaultOptions() {
        return {
            repulsionForce: 1.5,
            attractionForce: 0.3,
            maxNodes: 800,
            splitDistance: 10
        };
    }

    init() {
        this.nodes = [];
        this.createInitialShape();
        this.hue = Math.random() * 360;
    }

    createInitialShape() {
        this.nodes = [];
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        const radius = 50;
        const nodeCount = 30;

        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            this.nodes.push(new Node(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            ));
        }
    }

    onClick(x, y) {
        this.createInitialShape();
        this.hue = Math.random() * 360;
    }

    update(deltaTime) {
        const { repulsionForce, attractionForce, maxNodes, splitDistance } = this.options;
        const minDistance = 5;

        // Apply forces
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            node.vx = 0;
            node.vy = 0;

            // Repulsion from all other nodes
            for (let j = 0; j < this.nodes.length; j++) {
                if (i === j) continue;
                const other = this.nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 30 && dist > 0) {
                    const force = repulsionForce * (30 - dist) / 30;
                    node.vx += (dx / dist) * force;
                    node.vy += (dy / dist) * force;
                }
            }

            // Attraction to neighbors (keep the path smooth)
            const prev = this.nodes[(i - 1 + this.nodes.length) % this.nodes.length];
            const next = this.nodes[(i + 1) % this.nodes.length];

            // Pull toward midpoint of neighbors
            const midX = (prev.x + next.x) / 2;
            const midY = (prev.y + next.y) / 2;
            node.vx += (midX - node.x) * attractionForce;
            node.vy += (midY - node.y) * attractionForce;
        }

        // Apply velocities with damping
        for (const node of this.nodes) {
            node.x += node.vx * 0.5;
            node.y += node.vy * 0.5;

            // Keep in bounds
            node.x = MathUtils.clamp(node.x, 20, this.displayWidth - 20);
            node.y = MathUtils.clamp(node.y, 20, this.displayHeight - 20);
        }

        // Subdivision: add nodes between distant neighbors
        if (this.nodes.length < maxNodes) {
            const newNodes = [];

            for (let i = 0; i < this.nodes.length; i++) {
                newNodes.push(this.nodes[i]);

                const next = this.nodes[(i + 1) % this.nodes.length];
                const dist = MathUtils.distance(this.nodes[i].x, this.nodes[i].y, next.x, next.y);

                if (dist > splitDistance) {
                    // Add node at midpoint with small random offset
                    const midX = (this.nodes[i].x + next.x) / 2 + MathUtils.random(-2, 2);
                    const midY = (this.nodes[i].y + next.y) / 2 + MathUtils.random(-2, 2);
                    newNodes.push(new Node(midX, midY));
                }
            }

            this.nodes = newNodes;
        }

        // Slowly shift hue
        this.hue = (this.hue + 0.1) % 360;
    }

    render() {
        // Fade background
        this.ctx.fillStyle = 'rgba(8, 8, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        if (this.nodes.length < 3) return;

        // Draw filled shape with gradient
        this.ctx.beginPath();
        this.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

        for (let i = 1; i < this.nodes.length; i++) {
            this.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
        }
        this.ctx.closePath();

        // Fill
        const centerX = this.nodes.reduce((sum, n) => sum + n.x, 0) / this.nodes.length;
        const centerY = this.nodes.reduce((sum, n) => sum + n.y, 0) / this.nodes.length;

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 200
        );
        gradient.addColorStop(0, ColorUtils.hsl(this.hue, 70, 50, 0.3));
        gradient.addColorStop(1, ColorUtils.hsl(this.hue + 60, 60, 30, 0.1));

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Stroke
        this.ctx.strokeStyle = ColorUtils.hsl(this.hue, 70, 60, 0.8);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Nodes: ${this.nodes.length} | Click to restart`, 10, 20);
    }
}
