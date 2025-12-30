/**
 * Effects - Post-processing effects for lofi aesthetic
 * Includes film grain, vignette, and scanlines
 */

/**
 * Film grain overlay effect
 * Creates animated noise for that vintage look
 */
export class FilmGrain {
    constructor(intensity = 0.04) {
        this.intensity = intensity;
        this.grainCanvas = null;
        this.grainCtx = null;
        this.lastUpdate = 0;
        this.updateInterval = 50; // Update grain every 50ms
    }

    /**
     * Initialize offscreen grain canvas
     */
    init(width, height) {
        this.grainCanvas = document.createElement('canvas');
        this.grainCanvas.width = Math.ceil(width / 4); // Lower res for performance
        this.grainCanvas.height = Math.ceil(height / 4);
        this.grainCtx = this.grainCanvas.getContext('2d');
        this.generateGrain();
    }

    /**
     * Generate random noise pattern
     */
    generateGrain() {
        const imageData = this.grainCtx.createImageData(
            this.grainCanvas.width,
            this.grainCanvas.height
        );
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.random() * 255;
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            data[i + 3] = 255;  // A
        }

        this.grainCtx.putImageData(imageData, 0, 0);
    }

    /**
     * Apply grain effect to canvas
     */
    apply(ctx, width, height, time) {
        // Regenerate grain periodically for animation
        if (time - this.lastUpdate > this.updateInterval) {
            this.generateGrain();
            this.lastUpdate = time;
        }

        ctx.save();
        ctx.globalAlpha = this.intensity;
        ctx.globalCompositeOperation = 'overlay';

        // Draw scaled-up grain
        ctx.drawImage(this.grainCanvas, 0, 0, width, height);

        ctx.restore();
    }
}

/**
 * Vignette effect - darkened edges
 */
export class Vignette {
    constructor(intensity = 0.35) {
        this.intensity = intensity;
        this.gradient = null;
        this.lastWidth = 0;
        this.lastHeight = 0;
    }

    /**
     * Apply vignette effect
     */
    apply(ctx, width, height) {
        // Cache gradient if dimensions unchanged
        if (width !== this.lastWidth || height !== this.lastHeight) {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.hypot(centerX, centerY);

            this.gradient = ctx.createRadialGradient(
                centerX, centerY, radius * 0.3,  // Inner circle
                centerX, centerY, radius         // Outer circle
            );

            this.gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            this.gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
            this.gradient.addColorStop(1, `rgba(0, 0, 0, ${this.intensity})`);

            this.lastWidth = width;
            this.lastHeight = height;
        }

        ctx.save();
        ctx.fillStyle = this.gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}

/**
 * Scanlines effect - CRT monitor look
 */
export class Scanlines {
    constructor(options = {}) {
        this.opacity = options.opacity || 0.06;
        this.lineHeight = options.lineHeight || 2;
        this.gap = options.gap || 4;
        this.animated = options.animated !== false;
    }

    /**
     * Apply scanlines effect
     */
    apply(ctx, width, height, time) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;

        // Slight movement for CRT flicker effect
        const offset = this.animated ? (time * 0.02) % this.gap : 0;

        for (let y = offset; y < height; y += this.gap) {
            ctx.fillRect(0, y, width, this.lineHeight);
        }

        ctx.restore();
    }
}

/**
 * Glow effect - adds bloom around bright areas
 */
export class Glow {
    constructor(intensity = 0.3) {
        this.intensity = intensity;
    }

    /**
     * Apply glow by drawing with blur and additive blending
     * Note: This is expensive - use sparingly
     */
    apply(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = this.intensity;
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = 'blur(20px)';

        // Draw a copy of the canvas with blur
        ctx.drawImage(ctx.canvas, 0, 0);

        ctx.filter = 'none';
        ctx.restore();
    }
}

/**
 * Color shift effect - subtle chromatic aberration on beats
 */
export class ChromaticShift {
    constructor() {
        this.offset = 0;
    }

    /**
     * Apply chromatic aberration
     * @param {number} beatIntensity - Current beat intensity (0-1)
     */
    apply(ctx, width, height, beatIntensity) {
        if (beatIntensity < 0.1) return;

        this.offset = beatIntensity * 3;

        // This is simplified - true chromatic aberration requires
        // pixel manipulation or WebGL. Here we just shift the hue slightly
        ctx.save();
        ctx.globalAlpha = beatIntensity * 0.15;
        ctx.globalCompositeOperation = 'hue';
        ctx.fillStyle = '#ff0066';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}
