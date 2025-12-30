/**
 * @fileoverview Color utilities for canvas effects
 * Provides color conversion, interpolation, and pre-defined palettes
 */

/**
 * Color utilities object
 */
export const ColorUtils = {
    /**
     * Convert hex color to RGBA string
     * @param {string} hex - Hex color (#RGB or #RRGGBB)
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} RGBA color string
     */
    hexToRgba: (hex, alpha = 1) => {
        let r, g, b;
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Convert hex to RGB object
     * @param {string} hex
     * @returns {{r: number, g: number, b: number}}
     */
    hexToRgb: (hex) => {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    },

    /**
     * Convert RGB to hex
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {string}
     */
    rgbToHex: (r, g, b) => {
        return '#' + [r, g, b]
            .map(x => Math.round(x).toString(16).padStart(2, '0'))
            .join('');
    },

    /**
     * Create HSL color string
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @param {number} a - Alpha (0-1)
     * @returns {string}
     */
    hsl: (h, s, l, a = 1) => {
        if (a === 1) return `hsl(${h}, ${s}%, ${l}%)`;
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    },

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {{r: number, g: number, b: number}}
     */
    hslToRgb: (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    },

    /**
     * Convert RGB to HSL
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @returns {{h: number, s: number, l: number}}
     */
    rgbToHsl: (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    /**
     * Interpolate between two colors
     * @param {string} color1 - Hex color
     * @param {string} color2 - Hex color
     * @param {number} t - Progress (0-1)
     * @returns {string} Hex color
     */
    lerpColor: (color1, color2, t) => {
        const c1 = ColorUtils.hexToRgb(color1);
        const c2 = ColorUtils.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return ColorUtils.rgbToHex(r, g, b);
    },

    /**
     * Get color from palette by progress
     * @param {string[]} palette - Array of hex colors
     * @param {number} t - Progress (0-1)
     * @returns {string} Interpolated hex color
     */
    fromPalette: (palette, t) => {
        if (palette.length === 0) return '#ffffff';
        if (palette.length === 1) return palette[0];

        t = Math.max(0, Math.min(1, t));
        const scaledT = t * (palette.length - 1);
        const index = Math.floor(scaledT);
        const localT = scaledT - index;

        if (index >= palette.length - 1) return palette[palette.length - 1];

        return ColorUtils.lerpColor(palette[index], palette[index + 1], localT);
    },

    /**
     * Create RGBA string from components
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     * @returns {string}
     */
    rgba: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,

    /**
     * Add alpha to a hex color
     * @param {string} hex
     * @param {number} alpha
     * @returns {string} RGBA string
     */
    withAlpha: (hex, alpha) => ColorUtils.hexToRgba(hex, alpha),

    /**
     * Generate a random color
     * @returns {string} Hex color
     */
    random: () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    },

    /**
     * Generate a random HSL color with control over parameters
     * @param {Object} options
     * @param {number[]} options.hue - [min, max] for hue (0-360)
     * @param {number[]} options.saturation - [min, max] for saturation (0-100)
     * @param {number[]} options.lightness - [min, max] for lightness (0-100)
     * @returns {string} HSL color string
     */
    randomHsl: (options = {}) => {
        const hue = options.hue || [0, 360];
        const sat = options.saturation || [50, 80];
        const lit = options.lightness || [40, 60];

        const h = hue[0] + Math.random() * (hue[1] - hue[0]);
        const s = sat[0] + Math.random() * (sat[1] - sat[0]);
        const l = lit[0] + Math.random() * (lit[1] - lit[0]);

        return ColorUtils.hsl(h, s, l);
    }
};

/**
 * Pre-defined color palettes
 */
export const Palettes = {
    // Warm palettes
    sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#48dbfb', '#ff9f43'],
    fire: ['#fff200', '#ff9500', '#ff5500', '#ff0000', '#990000'],
    autumn: ['#d35400', '#e74c3c', '#c0392b', '#922b21', '#641e16'],

    // Cool palettes
    ocean: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#48cae4'],
    night: ['#0f0a1a', '#1a1028', '#2d1b4e', '#4a2c7a', '#6b3fa0'],
    ice: ['#a8d8ea', '#aa96da', '#fcbad3', '#ffffd2', '#b8f3ff'],

    // Nature palettes
    forest: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d'],
    earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90'],
    spring: ['#70e000', '#9ef01a', '#ccff33', '#d4ff50', '#ddff6e'],

    // Vibrant palettes
    neon: ['#ff00ff', '#00ffff', '#ff00aa', '#00ff88', '#ffff00'],
    rainbow: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'],
    candy: ['#ff6b9d', '#c44d89', '#9b4dca', '#6c5ce7', '#74b9ff'],

    // Monochrome palettes
    grayscale: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff'],
    blues: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
    purples: ['#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd'],

    // Special palettes
    cyberpunk: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0'],
    retro: ['#f4a261', '#e76f51', '#2a9d8f', '#264653', '#e9c46a'],
    pastel: ['#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff', '#cdb4db']
};

/**
 * Create a gradient color stop array for canvas gradients
 * @param {string[]} colors - Array of hex colors
 * @returns {Array<{offset: number, color: string}>}
 */
export function createGradientStops(colors) {
    return colors.map((color, i) => ({
        offset: i / (colors.length - 1),
        color
    }));
}

/**
 * Apply gradient stops to a canvas gradient
 * @param {CanvasGradient} gradient
 * @param {Array<{offset: number, color: string}>} stops
 */
export function applyGradientStops(gradient, stops) {
    stops.forEach(stop => {
        gradient.addColorStop(stop.offset, stop.color);
    });
}
