/**
 * @fileoverview L-System Plants Demo
 * Rule-based procedural plant generation
 *
 * LEARNING OBJECTIVES:
 * - L-system grammar and rewriting
 * - Turtle graphics interpretation
 * - Procedural generation
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

// L-System presets
const PRESETS = {
    bush: {
        name: 'Bush',
        axiom: 'F',
        rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
        angle: 22.5,
        iterations: 4
    },
    fern: {
        name: 'Fern',
        axiom: 'X',
        rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
        angle: 25,
        iterations: 5
    },
    tree: {
        name: 'Tree',
        axiom: 'X',
        rules: { X: 'F[+X][-X]FX', F: 'FF' },
        angle: 30,
        iterations: 5
    },
    weed: {
        name: 'Weed',
        axiom: 'F',
        rules: { F: 'F[+F]F[-F]F' },
        angle: 25.7,
        iterations: 4
    },
    sticks: {
        name: 'Sticks',
        axiom: 'X',
        rules: { X: 'F[+X]F[-X]+X', F: 'FF' },
        angle: 20,
        iterations: 6
    }
};

export class LSystemPlantsDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'L-System Plants',
            description: 'Procedural plants generated with L-system grammar rules',
            difficulty: 'advanced',
            category: 'fractals'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'preset', label: 'Plant Type', min: 0, max: 4, default: 1 },
            { type: 'slider', name: 'iterations', label: 'Growth Iterations', min: 1, max: 7, default: 5 },
            { type: 'slider', name: 'angleVariation', label: 'Angle Variation', min: 0, max: 10, default: 3 },
            { type: 'checkbox', name: 'animate', label: 'Sway Animation', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            preset: 1,
            iterations: 5,
            angleVariation: 3,
            animate: true
        };
    }

    init() {
        this.presetKeys = Object.keys(PRESETS);
        this.generateString();
    }

    generateString() {
        const preset = PRESETS[this.presetKeys[this.options.preset]];
        let current = preset.axiom;

        const iterations = Math.min(this.options.iterations, preset.iterations + 1);

        for (let i = 0; i < iterations; i++) {
            let next = '';
            for (const char of current) {
                next += preset.rules[char] || char;
            }
            current = next;
        }

        this.lString = current;
        this.preset = preset;
    }

    onOptionChange(name, value) {
        if (name === 'preset' || name === 'iterations') {
            this.generateString();
        }
    }

    onResize() {
        // No need to regenerate
    }

    update(deltaTime) {
        // Animation handled in render
    }

    render() {
        // Background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.displayHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Ground
        this.ctx.fillStyle = '#1a1510';
        this.ctx.fillRect(0, this.displayHeight - 30, this.displayWidth, 30);

        // Calculate bounds for scaling
        const baseAngle = MathUtils.degToRad(this.preset.angle);
        const segmentLength = Math.min(this.displayWidth, this.displayHeight) / (this.options.iterations * 15);

        // Draw plant
        this.ctx.save();
        this.ctx.translate(this.displayWidth / 2, this.displayHeight - 30);

        const stack = [];
        let x = 0, y = 0, angle = -Math.PI / 2;
        let depth = 0;
        let maxDepth = 0;

        // First pass to get max depth
        for (const char of this.lString) {
            if (char === '[') depth++;
            if (char === ']') depth--;
            maxDepth = Math.max(maxDepth, depth);
        }

        depth = 0;

        for (let i = 0; i < this.lString.length; i++) {
            const char = this.lString[i];

            // Sway animation based on depth
            const sway = this.options.animate
                ? Math.sin(this.time * 0.001 + depth * 0.3 + i * 0.01) * 0.02 * depth
                : 0;

            // Random variation
            const variation = MathUtils.degToRad(MathUtils.random(-this.options.angleVariation, this.options.angleVariation));

            switch (char) {
                case 'F':
                    // Draw forward
                    const newX = x + Math.cos(angle + sway) * segmentLength;
                    const newY = y + Math.sin(angle + sway) * segmentLength;

                    // Color based on depth (brown -> green)
                    const depthRatio = depth / Math.max(maxDepth, 1);
                    const hue = MathUtils.lerp(30, 120, depthRatio);
                    const lightness = MathUtils.lerp(25, 45, depthRatio);
                    const thickness = MathUtils.lerp(3, 0.5, depthRatio);

                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(newX, newY);
                    this.ctx.strokeStyle = ColorUtils.hsl(hue, 50, lightness);
                    this.ctx.lineWidth = thickness;
                    this.ctx.lineCap = 'round';
                    this.ctx.stroke();

                    x = newX;
                    y = newY;
                    break;

                case '+':
                    angle += baseAngle + variation + sway;
                    break;

                case '-':
                    angle -= baseAngle + variation - sway;
                    break;

                case '[':
                    stack.push({ x, y, angle });
                    depth++;
                    break;

                case ']':
                    const state = stack.pop();
                    if (state) {
                        // Draw leaf at branch tip
                        if (depth >= maxDepth - 1) {
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, MathUtils.random(2, 4), 0, Math.PI * 2);
                            this.ctx.fillStyle = ColorUtils.hsl(MathUtils.random(100, 140), 60, 45, 0.8);
                            this.ctx.fill();
                        }

                        x = state.x;
                        y = state.y;
                        angle = state.angle;
                    }
                    depth--;
                    break;

                case 'X':
                    // Symbol for structure, no drawing
                    break;
            }
        }

        this.ctx.restore();

        // Info
        const presetName = PRESETS[this.presetKeys[this.options.preset]].name;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${presetName} | Segments: ${this.lString.length}`, 10, 20);
    }
}
