/**
 * @fileoverview Generative Art Demo
 * Abstract compositions using multiple techniques
 *
 * LEARNING OBJECTIVES:
 * - Combining multiple generative techniques
 * - Compositional balance
 * - Procedural aesthetics
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils } from '../../js/utils/MathUtils.js';
import { ColorUtils, Palettes } from '../../js/utils/ColorUtils.js';

export class GenerativeArtDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Generative Art',
            description: 'Unique abstract compositions - click to regenerate',
            difficulty: 'advanced',
            category: 'generative'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'complexity', label: 'Complexity', min: 1, max: 10, default: 5 },
            { type: 'slider', name: 'palette', label: 'Color Palette', min: 0, max: 5, default: 0 },
            { type: 'checkbox', name: 'animate', label: 'Animate', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            complexity: 5,
            palette: 0,
            animate: true
        };
    }

    init() {
        this.elements = [];
        this.palettes = [
            Palettes.sunset,
            Palettes.ocean,
            Palettes.neon,
            Palettes.cyberpunk,
            Palettes.forest,
            Palettes.candy
        ];
        this.generate();
    }

    onClick(x, y) {
        this.generate();
    }

    generate() {
        this.elements = [];
        const { complexity } = this.options;
        const palette = this.palettes[this.options.palette];

        // Generate different element types
        const elementCount = complexity * 10;

        for (let i = 0; i < elementCount; i++) {
            const type = MathUtils.randomInt(0, 4);
            const color = palette[MathUtils.randomInt(0, palette.length - 1)];

            const element = {
                type,
                x: Math.random() * this.displayWidth,
                y: Math.random() * this.displayHeight,
                size: MathUtils.random(20, 100 + complexity * 20),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: MathUtils.random(-0.01, 0.01),
                color,
                opacity: MathUtils.random(0.1, 0.6),
                phase: Math.random() * Math.PI * 2,
                frequency: MathUtils.random(0.001, 0.003)
            };

            this.elements.push(element);
        }

        // Sort by size for depth
        this.elements.sort((a, b) => b.size - a.size);
    }

    onOptionChange(name, value) {
        if (name === 'complexity' || name === 'palette') {
            this.generate();
        }
    }

    update(deltaTime) {
        if (this.options.animate) {
            this.elements.forEach(el => {
                el.rotation += el.rotationSpeed;
            });
        }
    }

    drawElement(el) {
        const ctx = this.ctx;
        const { animate } = this.options;

        const pulse = animate ? Math.sin(this.time * el.frequency + el.phase) * 0.1 + 1 : 1;
        const size = el.size * pulse;

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.globalAlpha = el.opacity;

        switch (el.type) {
            case 0: // Circle
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = el.color;
                ctx.fill();
                break;

            case 1: // Ring
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.strokeStyle = el.color;
                ctx.lineWidth = size * 0.1;
                ctx.stroke();
                break;

            case 2: // Rectangle
                ctx.fillStyle = el.color;
                ctx.fillRect(-size / 2, -size / 4, size, size / 2);
                break;

            case 3: // Triangle
                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.closePath();
                ctx.fillStyle = el.color;
                ctx.fill();
                break;

            case 4: // Arc
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 1.5);
                ctx.strokeStyle = el.color;
                ctx.lineWidth = size * 0.15;
                ctx.lineCap = 'round';
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    render() {
        // Background
        const bgHue = (this.time * 0.01) % 360;
        this.ctx.fillStyle = this.options.animate
            ? ColorUtils.hsl(bgHue, 10, 5)
            : '#0a0a12';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Draw elements
        this.elements.forEach(el => this.drawElement(el));

        // Overlay gradient for depth
        const gradient = this.ctx.createRadialGradient(
            this.displayWidth / 2, this.displayHeight / 2, 0,
            this.displayWidth / 2, this.displayHeight / 2, this.displayWidth / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

        // Info
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Click to regenerate', 10, 20);
    }
}
