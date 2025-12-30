/**
 * @fileoverview Easing Demo
 * Visual comparison of easing functions
 *
 * LEARNING OBJECTIVES:
 * - Easing function types
 * - Animation timing
 * - Visual comparison techniques
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils, Easing } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

const EASING_FUNCTIONS = [
    { name: 'linear', fn: Easing.linear },
    { name: 'easeInQuad', fn: Easing.easeInQuad },
    { name: 'easeOutQuad', fn: Easing.easeOutQuad },
    { name: 'easeInOutQuad', fn: Easing.easeInOutQuad },
    { name: 'easeInCubic', fn: Easing.easeInCubic },
    { name: 'easeOutCubic', fn: Easing.easeOutCubic },
    { name: 'easeInOutCubic', fn: Easing.easeInOutCubic },
    { name: 'easeOutElastic', fn: Easing.easeOutElastic },
    { name: 'easeOutBounce', fn: Easing.easeOutBounce },
    { name: 'easeInOutBack', fn: Easing.easeInOutBack }
];

export class EasingDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Easing Functions',
            description: 'Visual comparison of different easing functions',
            difficulty: 'beginner',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'duration', label: 'Duration (s)', min: 0.5, max: 4, default: 2, step: 0.25 },
            { type: 'checkbox', name: 'showCurves', label: 'Show Curves', default: true },
            { type: 'checkbox', name: 'showBalls', label: 'Show Balls', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            duration: 2,
            showCurves: true,
            showBalls: true
        };
    }

    init() {
        this.progress = 0;
        this.direction = 1;
    }

    update(deltaTime) {
        const duration = this.options.duration * 1000;
        this.progress += (deltaTime / duration) * this.direction;

        if (this.progress >= 1) {
            this.progress = 1;
            this.direction = -1;
        } else if (this.progress <= 0) {
            this.progress = 0;
            this.direction = 1;
        }
    }

    render() {
        const { showCurves, showBalls } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;

        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, width, height);

        const rowCount = EASING_FUNCTIONS.length;
        const rowHeight = height / rowCount;
        const padding = 20;
        const curveWidth = width * 0.3;
        const ballTrackWidth = width * 0.5;

        EASING_FUNCTIONS.forEach((easing, index) => {
            const y = index * rowHeight;
            const centerY = y + rowHeight / 2;

            // Row separator
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(easing.name, padding, centerY + 4);

            const curveStartX = padding + 120;

            // Draw curve
            if (showCurves) {
                const curveHeight = rowHeight - 20;

                this.ctx.beginPath();
                for (let x = 0; x <= curveWidth; x++) {
                    const t = x / curveWidth;
                    const easedT = easing.fn(t);
                    const px = curveStartX + x;
                    const py = centerY + curveHeight / 2 - easedT * curveHeight;

                    if (x === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }

                const hue = (index / rowCount) * 360;
                this.ctx.strokeStyle = ColorUtils.hsl(hue, 70, 60);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Progress indicator on curve
                const easedProgress = easing.fn(this.progress);
                const indicatorX = curveStartX + this.progress * curveWidth;
                const indicatorY = centerY + curveHeight / 2 - easedProgress * curveHeight;

                this.ctx.beginPath();
                this.ctx.arc(indicatorX, indicatorY, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();
            }

            // Draw ball
            if (showBalls) {
                const ballStartX = curveStartX + curveWidth + 50;
                const easedProgress = easing.fn(this.progress);
                const ballX = ballStartX + easedProgress * ballTrackWidth;

                // Track
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(ballStartX, centerY);
                this.ctx.lineTo(ballStartX + ballTrackWidth, centerY);
                this.ctx.stroke();

                // Ball
                const hue = (index / rowCount) * 360;
                this.ctx.beginPath();
                this.ctx.arc(ballX, centerY, 8, 0, Math.PI * 2);
                this.ctx.fillStyle = ColorUtils.hsl(hue, 70, 60);
                this.ctx.fill();
            }
        });

        // Progress bar at bottom
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(padding, height - 30, width - padding * 2, 10);

        this.ctx.fillStyle = '#6366f1';
        this.ctx.fillRect(padding, height - 30, (width - padding * 2) * this.progress, 10);

        // Direction indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            this.direction > 0 ? '→ Forward' : '← Reverse',
            width / 2,
            height - 8
        );
    }
}
