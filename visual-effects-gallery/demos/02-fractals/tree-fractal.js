/**
 * @fileoverview Tree Fractal Demo
 * Recursive branching tree with wind animation
 *
 * LEARNING OBJECTIVES:
 * - Recursive drawing
 * - Canvas save/restore for transforms
 * - Organic motion with sin waves
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class TreeFractalDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Tree Fractal',
            description: 'Recursive branching tree that sways in the wind',
            difficulty: 'beginner',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'depth', label: 'Branch Depth', min: 5, max: 12, default: 9 },
            { type: 'slider', name: 'branchAngle', label: 'Branch Angle', min: 10, max: 45, default: 25 },
            { type: 'slider', name: 'windStrength', label: 'Wind', min: 0, max: 0.1, default: 0.03, step: 0.005 },
            { type: 'slider', name: 'trunkLength', label: 'Trunk Length', min: 50, max: 200, default: 120 }
        ];
    }

    getDefaultOptions() {
        return {
            depth: 9,
            branchAngle: 25,
            windStrength: 0.03,
            trunkLength: 120
        };
    }

    init() {
        // Nothing to initialize
    }

    update(deltaTime) {
        // Wind is calculated per frame in render
    }

    drawBranch(length, depth, maxDepth) {
        if (depth === 0) return;

        const { branchAngle, windStrength } = this.options;
        const angleRad = MathUtils.degToRad(branchAngle);

        // Wind effect - more sway at higher branches
        const windOffset = Math.sin(this.time * 0.002 + depth * 0.5) * windStrength * (maxDepth - depth + 1);

        // Calculate thickness based on depth
        const thickness = depth * 1.2;

        // Branch color (brown to green gradient)
        const depthRatio = depth / maxDepth;
        const hue = MathUtils.lerp(120, 35, depthRatio); // Green to brown
        const lightness = MathUtils.lerp(35, 25, depthRatio);

        // Draw the branch
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -length);
        this.ctx.strokeStyle = ColorUtils.hsl(hue, 40, lightness);
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Move to end of branch
        this.ctx.translate(0, -length);

        // Scale down for child branches
        const scale = 0.72;
        const newLength = length * scale;

        // Left branch
        this.ctx.save();
        this.ctx.rotate(-angleRad + windOffset);
        this.drawBranch(newLength, depth - 1, maxDepth);
        this.ctx.restore();

        // Right branch
        this.ctx.save();
        this.ctx.rotate(angleRad + windOffset);
        this.drawBranch(newLength, depth - 1, maxDepth);
        this.ctx.restore();

        // Sometimes add a middle branch
        if (depth > 2 && depth < maxDepth - 1 && Math.random() > 0.5) {
            this.ctx.save();
            this.ctx.rotate(windOffset * 0.5);
            this.drawBranch(newLength * 0.8, depth - 2, maxDepth);
            this.ctx.restore();
        }

        // Draw leaves at tips
        if (depth <= 2) {
            this.drawLeaf();
        }
    }

    drawLeaf() {
        const leafSize = MathUtils.random(3, 6);
        const leafHue = MathUtils.random(90, 140);

        this.ctx.beginPath();
        this.ctx.arc(0, 0, leafSize, 0, Math.PI * 2);
        this.ctx.fillStyle = ColorUtils.hsl(leafHue, 60, 45, 0.8);
        this.ctx.fill();
    }

    render() {
        const { depth, trunkLength } = this.options;

        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.displayHeight);
        skyGradient.addColorStop(0, '#1a1a2e');
        skyGradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Ground
        this.ctx.fillStyle = '#1a1510';
        this.ctx.fillRect(0, this.displayHeight - 50, this.displayWidth, 50);

        // Position at bottom center
        this.ctx.save();
        this.ctx.translate(this.displayWidth / 2, this.displayHeight - 50);

        // Draw the tree
        this.drawBranch(trunkLength, depth, depth);

        this.ctx.restore();

        // Stars in background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i * 12345) * 0.5 + 0.5) * this.displayWidth;
            const y = (Math.cos(i * 54321) * 0.5 + 0.5) * this.displayHeight * 0.6;
            const twinkle = Math.sin(this.time * 0.003 + i) * 0.5 + 0.5;
            this.ctx.globalAlpha = twinkle * 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
}
