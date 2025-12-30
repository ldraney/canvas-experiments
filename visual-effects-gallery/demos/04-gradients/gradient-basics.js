/**
 * @fileoverview Gradient Basics Demo
 * Interactive exploration of canvas gradient types
 *
 * LEARNING OBJECTIVES:
 * - Linear, radial, and conic gradients
 * - Gradient color stops
 * - Interactive gradient manipulation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

export class GradientBasicsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Gradient Basics',
            description: 'Explore linear, radial, and conic gradients - move mouse to interact',
            difficulty: 'beginner',
            category: 'gradients'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'type', label: 'Gradient Type', min: 0, max: 2, default: 0 },
            { type: 'slider', name: 'hue1', label: 'Color 1 Hue', min: 0, max: 360, default: 200 },
            { type: 'slider', name: 'hue2', label: 'Color 2 Hue', min: 0, max: 360, default: 320 },
            { type: 'checkbox', name: 'animate', label: 'Animate', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            type: 0, // 0: linear, 1: radial, 2: conic
            hue1: 200,
            hue2: 320,
            animate: true
        };
    }

    init() {
        // Nothing to initialize
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        const { type, hue1, hue2, animate } = this.options;
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;

        // Animate hue offset
        const hueOffset = animate ? (this.time * 0.02) % 360 : 0;
        const h1 = (hue1 + hueOffset) % 360;
        const h2 = (hue2 + hueOffset) % 360;

        const color1 = ColorUtils.hsl(h1, 70, 50);
        const color2 = ColorUtils.hsl(h2, 70, 50);
        const color3 = ColorUtils.hsl((h1 + h2) / 2, 70, 50);

        let gradient;
        let typeName;

        switch (type) {
            case 0: // Linear
                typeName = 'Linear Gradient';
                // Use mouse position to control gradient direction
                const angle = Math.atan2(
                    this.mouse.y - centerY,
                    this.mouse.x - centerX
                );
                const length = this.displayWidth * 0.6;
                gradient = this.ctx.createLinearGradient(
                    centerX - Math.cos(angle) * length,
                    centerY - Math.sin(angle) * length,
                    centerX + Math.cos(angle) * length,
                    centerY + Math.sin(angle) * length
                );
                gradient.addColorStop(0, color1);
                gradient.addColorStop(0.5, color3);
                gradient.addColorStop(1, color2);
                break;

            case 1: // Radial
                typeName = 'Radial Gradient';
                const radius = MathUtils.distance(this.mouse.x, this.mouse.y, centerX, centerY);
                gradient = this.ctx.createRadialGradient(
                    this.mouse.x, this.mouse.y, 0,
                    this.mouse.x, this.mouse.y, Math.max(radius, 100)
                );
                gradient.addColorStop(0, color1);
                gradient.addColorStop(0.5, color3);
                gradient.addColorStop(1, color2);
                break;

            case 2: // Conic
                typeName = 'Conic Gradient';
                const startAngle = animate ? this.time * 0.001 : 0;
                gradient = this.ctx.createConicGradient(
                    startAngle,
                    this.mouse.x || centerX,
                    this.mouse.y || centerY
                );
                gradient.addColorStop(0, color1);
                gradient.addColorStop(0.25, color3);
                gradient.addColorStop(0.5, color2);
                gradient.addColorStop(0.75, color3);
                gradient.addColorStop(1, color1);
                break;
        }

        // Fill background with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Overlay with info
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 200, 60);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(typeName, 20, 30);

        this.ctx.font = '12px sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Move mouse to interact', 20, 50);
        this.ctx.fillText('Change Type slider for different gradients', 20, 65);
    }
}
