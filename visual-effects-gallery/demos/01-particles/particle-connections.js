/**
 * @fileoverview Particle Connections Demo
 * Network of floating nodes connected by lines when close
 *
 * LEARNING OBJECTIVES:
 * - Distance-based interactions between particles
 * - Line drawing with variable opacity
 * - Network/graph visualization basics
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

class Node {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = MathUtils.random(-0.5, 0.5);
        this.vy = MathUtils.random(-0.5, 0.5);
        this.size = MathUtils.random(2, 4);
    }

    update(speed) {
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Bounce off walls
        if (this.x < 0 || this.x > this.width) {
            this.vx *= -1;
            this.x = MathUtils.clamp(this.x, 0, this.width);
        }
        if (this.y < 0 || this.y > this.height) {
            this.vy *= -1;
            this.y = MathUtils.clamp(this.y, 0, this.height);
        }
    }

    render(ctx, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
}

export class ParticleConnectionsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Particle Connections',
            description: 'Network nodes that connect with lines when nearby',
            difficulty: 'intermediate',
            category: 'particles'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'nodeCount', label: 'Nodes', min: 20, max: 200, default: 80 },
            { type: 'slider', name: 'connectionDistance', label: 'Connection Range', min: 50, max: 250, default: 120 },
            { type: 'slider', name: 'speed', label: 'Speed', min: 0.1, max: 2, default: 1, step: 0.1 },
            { type: 'color', name: 'nodeColor', label: 'Node Color', default: '#6366f1' },
            { type: 'checkbox', name: 'mouseConnect', label: 'Connect to Mouse', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            nodeCount: 80,
            connectionDistance: 120,
            speed: 1,
            nodeColor: '#6366f1',
            mouseConnect: true
        };
    }

    init() {
        this.nodes = [];
        this.createNodes();
    }

    createNodes() {
        this.nodes = [];
        for (let i = 0; i < this.options.nodeCount; i++) {
            this.nodes.push(new Node(
                Math.random() * this.displayWidth,
                Math.random() * this.displayHeight,
                this.displayWidth,
                this.displayHeight
            ));
        }
    }

    onOptionChange(name, value) {
        if (name === 'nodeCount') {
            this.createNodes();
        }
    }

    onResize() {
        this.nodes.forEach(node => {
            node.width = this.displayWidth;
            node.height = this.displayHeight;
            node.x = MathUtils.clamp(node.x, 0, this.displayWidth);
            node.y = MathUtils.clamp(node.y, 0, this.displayHeight);
        });
    }

    update(deltaTime) {
        this.nodes.forEach(node => node.update(this.options.speed));
    }

    render() {
        // Clear background
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        const maxDist = this.options.connectionDistance;
        const color = ColorUtils.hexToRgb(this.options.nodeColor);

        // Draw connections between nodes
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dist = MathUtils.distance(
                    this.nodes[i].x, this.nodes[i].y,
                    this.nodes[j].x, this.nodes[j].y
                );

                if (dist < maxDist) {
                    const opacity = 1 - (dist / maxDist);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    this.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`;
                    this.ctx.lineWidth = opacity * 2;
                    this.ctx.stroke();
                }
            }

            // Connect to mouse if enabled
            if (this.options.mouseConnect) {
                const mouseDist = MathUtils.distance(
                    this.nodes[i].x, this.nodes[i].y,
                    this.mouse.x, this.mouse.y
                );

                if (mouseDist < maxDist * 1.5) {
                    const opacity = 1 - (mouseDist / (maxDist * 1.5));
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                    this.ctx.lineWidth = opacity * 2;
                    this.ctx.stroke();
                }
            }
        }

        // Draw nodes
        this.nodes.forEach(node => node.render(this.ctx, this.options.nodeColor));

        // Draw mouse indicator
        if (this.options.mouseConnect) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        }
    }
}
