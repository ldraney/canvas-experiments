/**
 * @fileoverview Mathematical utilities for canvas effects
 * Provides vector operations, easing functions, and common math helpers
 */

/**
 * Math utilities object
 */
export const MathUtils = {
    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Progress (0-1)
     * @returns {number}
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Clamp value between min and max
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),

    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range min
     * @param {number} inMax - Input range max
     * @param {number} outMin - Output range min
     * @param {number} outMax - Output range max
     * @returns {number}
     */
    map: (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @returns {number}
     */
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),

    /**
     * Random float between min and max
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    random: (min, max) => Math.random() * (max - min) + min,

    /**
     * Random integer between min and max (inclusive)
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number}
     */
    degToRad: (degrees) => (degrees * Math.PI) / 180,

    /**
     * Convert radians to degrees
     * @param {number} radians
     * @returns {number}
     */
    radToDeg: (radians) => (radians * 180) / Math.PI,

    /**
     * Normalize angle to 0-2PI range
     * @param {number} angle - Angle in radians
     * @returns {number}
     */
    normalizeAngle: (angle) => {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
};

/**
 * 2D Vector operations
 */
export const Vector2 = {
    /**
     * Create a new vector
     * @param {number} x
     * @param {number} y
     * @returns {{x: number, y: number}}
     */
    create: (x = 0, y = 0) => ({ x, y }),

    /**
     * Add two vectors
     * @param {{x: number, y: number}} v1
     * @param {{x: number, y: number}} v2
     * @returns {{x: number, y: number}}
     */
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),

    /**
     * Subtract v2 from v1
     * @param {{x: number, y: number}} v1
     * @param {{x: number, y: number}} v2
     * @returns {{x: number, y: number}}
     */
    sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),

    /**
     * Scale vector by scalar
     * @param {{x: number, y: number}} v
     * @param {number} s
     * @returns {{x: number, y: number}}
     */
    scale: (v, s) => ({ x: v.x * s, y: v.y * s }),

    /**
     * Get vector magnitude
     * @param {{x: number, y: number}} v
     * @returns {number}
     */
    magnitude: (v) => Math.hypot(v.x, v.y),

    /**
     * Normalize vector to unit length
     * @param {{x: number, y: number}} v
     * @returns {{x: number, y: number}}
     */
    normalize: (v) => {
        const mag = Math.hypot(v.x, v.y);
        if (mag === 0) return { x: 0, y: 0 };
        return { x: v.x / mag, y: v.y / mag };
    },

    /**
     * Dot product of two vectors
     * @param {{x: number, y: number}} v1
     * @param {{x: number, y: number}} v2
     * @returns {number}
     */
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y,

    /**
     * Get angle of vector in radians
     * @param {{x: number, y: number}} v
     * @returns {number}
     */
    angle: (v) => Math.atan2(v.y, v.x),

    /**
     * Create vector from angle and magnitude
     * @param {number} angle - Angle in radians
     * @param {number} magnitude
     * @returns {{x: number, y: number}}
     */
    fromAngle: (angle, magnitude = 1) => ({
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude
    }),

    /**
     * Linear interpolation between two vectors
     * @param {{x: number, y: number}} v1
     * @param {{x: number, y: number}} v2
     * @param {number} t - Progress (0-1)
     * @returns {{x: number, y: number}}
     */
    lerp: (v1, v2, t) => ({
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t
    }),

    /**
     * Distance between two vectors
     * @param {{x: number, y: number}} v1
     * @param {{x: number, y: number}} v2
     * @returns {number}
     */
    distance: (v1, v2) => Math.hypot(v2.x - v1.x, v2.y - v1.y),

    /**
     * Rotate vector by angle
     * @param {{x: number, y: number}} v
     * @param {number} angle - Angle in radians
     * @returns {{x: number, y: number}}
     */
    rotate: (v, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    }
};

/**
 * Easing functions for smooth animations
 * All functions take t (0-1) and return eased value (0-1)
 */
export const Easing = {
    // Linear
    linear: (t) => t,

    // Quadratic
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Quartic
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

    // Quintic
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + --t * t * t * t * t,
    easeInOutQuint: (t) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

    // Sinusoidal
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    // Exponential
    easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    // Circular
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - --t * t),
    easeInOutCirc: (t) =>
        t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

    // Elastic
    easeInElastic: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
    },
    easeOutElastic: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
    easeInOutElastic: (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (t < 0.5) {
            return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2;
        }
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1;
    },

    // Back (overshoot)
    easeInBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },

    // Bounce
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeInBounce: (t) => 1 - Easing.easeOutBounce(1 - t),
    easeInOutBounce: (t) =>
        t < 0.5
            ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Easing.easeOutBounce(2 * t - 1)) / 2
};
