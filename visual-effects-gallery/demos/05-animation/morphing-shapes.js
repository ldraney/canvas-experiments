/**
 * @fileoverview Morphing Shapes Demo
 * Smooth transitions between geometric shapes
 *
 * LEARNING OBJECTIVES:
 * - Vertex interpolation
 * - Shape representation
 * - Smooth transitions
 */

import { BaseDemo } from '../../js/core/BaseDemo.js';
import { MathUtils, Easing } from '../../js/utils/MathUtils.js';
import { ColorUtils } from '../../js/utils/ColorUtils.js';

// Shape definitions as arrays of angles (for uniform vertex count)
function createShape(type, vertexCount = 64) {
    const vertices = [];

    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        let radius;

        switch (type) {
            case 'circle':
                radius = 1;
                break;

            case 'square':
                // Superellipse formula for square
                const n = 20; // Higher = sharper corners
                radius = 1 / Math.pow(
                    Math.pow(Math.abs(Math.cos(angle)), n) +
                    Math.pow(Math.abs(Math.sin(angle)), n),
                    1 / n
                );
                break;

            case 'triangle':
                // Triangle using modular arithmetic
                const triAngle = angle + Math.PI / 2;
                const triPhase = ((triAngle % (Math.PI * 2 / 3)) / (Math.PI * 2 / 3)) * 2 - 1;
                radius = 1 / (1 + Math.abs(triPhase) * 0.5);
                break;

            case 'star':
                // 5-pointed star
                const starPoints = 5;
                const starAngle = angle * starPoints;
                radius = 0.5 + 0.5 * Math.cos(starAngle);
                break;

            case 'heart':
                // Heart shape
                const t = angle;
                const heartX = 16 * Math.pow(Math.sin(t), 3);
                const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                radius = Math.sqrt(heartX * heartX + heartY * heartY) / 17;
                break;

            case 'flower':
                // Flower shape
                const petals = 6;
                radius = 0.5 + 0.5 * Math.abs(Math.cos(angle * petals / 2));
                break;

            default:
                radius = 1;
        }

        vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        });
    }

    return vertices;
}

const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'flower'];

export class MorphingShapesDemo extends BaseDemo {
    static getMetadata() {
        return {
            name: 'Morphing Shapes',
            description: 'Smooth transitions between geometric shapes',
            difficulty: 'intermediate',
            category: 'animation'
        };
    }

    static getControls() {
        return [
            { type: 'slider', name: 'morphSpeed', label: 'Morph Speed', min: 0.5, max: 3, default: 1, step: 0.1 },
            { type: 'slider', name: 'size', label: 'Size', min: 50, max: 200, default: 120 },
            { type: 'checkbox', name: 'autoRotate', label: 'Auto Rotate', default: true },
            { type: 'checkbox', name: 'showLabels', label: 'Show Labels', default: true }
        ];
    }

    getDefaultOptions() {
        return {
            morphSpeed: 1,
            size: 120,
            autoRotate: true,
            showLabels: true
        };
    }

    init() {
        this.shapes = SHAPES.map(name => ({
            name,
            vertices: createShape(name)
        }));

        this.currentShapeIndex = 0;
        this.nextShapeIndex = 1;
        this.morphProgress = 0;
        this.rotation = 0;
    }

    onClick(x, y) {
        // Skip to next shape
        this.morphProgress = 0;
        this.currentShapeIndex = this.nextShapeIndex;
        this.nextShapeIndex = (this.nextShapeIndex + 1) % this.shapes.length;
    }

    update(deltaTime) {
        const { morphSpeed, autoRotate } = this.options;

        // Update morph progress
        this.morphProgress += deltaTime * 0.0005 * morphSpeed;

        if (this.morphProgress >= 1) {
            this.morphProgress = 0;
            this.currentShapeIndex = this.nextShapeIndex;
            this.nextShapeIndex = (this.nextShapeIndex + 1) % this.shapes.length;
        }

        // Rotation
        if (autoRotate) {
            this.rotation += deltaTime * 0.0005;
        }
    }

    render() {
        const { size, showLabels } = this.options;
        const width = this.displayWidth;
        const height = this.displayHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, width, height);

        const currentShape = this.shapes[this.currentShapeIndex];
        const nextShape = this.shapes[this.nextShapeIndex];

        // Ease the morph progress
        const easedProgress = Easing.easeInOutCubic(this.morphProgress);

        // Interpolate vertices
        const morphedVertices = currentShape.vertices.map((v, i) => {
            const nv = nextShape.vertices[i];
            return {
                x: MathUtils.lerp(v.x, nv.x, easedProgress),
                y: MathUtils.lerp(v.y, nv.y, easedProgress)
            };
        });

        // Draw shape
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);

        // Glow effect
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
        const hue = (this.currentShapeIndex / this.shapes.length + easedProgress / this.shapes.length) * 360;
        gradient.addColorStop(0, ColorUtils.hsl(hue, 70, 50, 0.3));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-size * 1.5, -size * 1.5, size * 3, size * 3);

        // Draw morphed shape
        this.ctx.beginPath();
        morphedVertices.forEach((v, i) => {
            const x = v.x * size;
            const y = v.y * size;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.closePath();

        // Fill
        this.ctx.fillStyle = ColorUtils.hsl(hue, 60, 45);
        this.ctx.fill();

        // Stroke
        this.ctx.strokeStyle = ColorUtils.hsl(hue, 70, 65);
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.restore();

        // Labels
        if (showLabels) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '16px sans-serif';
            this.ctx.textAlign = 'center';

            const arrowWidth = 50;
            const labelY = centerY + size + 50;

            // Current shape
            this.ctx.fillText(currentShape.name, centerX - 80, labelY);

            // Arrow
            this.ctx.fillText('→', centerX, labelY);

            // Next shape
            this.ctx.fillText(nextShape.name, centerX + 80, labelY);

            // Progress bar
            const barWidth = 200;
            const barHeight = 6;
            const barY = labelY + 20;

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);

            this.ctx.fillStyle = ColorUtils.hsl(hue, 70, 60);
            this.ctx.fillRect(centerX - barWidth / 2, barY, barWidth * easedProgress, barHeight);
        }

        // Click hint
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Click to skip to next shape', 10, 20);
    }
}
