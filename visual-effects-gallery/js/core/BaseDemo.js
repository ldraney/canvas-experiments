/**
 * @fileoverview Abstract base class for all visual effect demos
 * Provides common canvas setup, animation loop, and event handling
 */

/**
 * BaseDemo - Foundation class for canvas demos
 * All demos should extend this class and implement init(), update(), render()
 */
export class BaseDemo {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     * @param {Object} options - Demo-specific options
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Merge default options with provided options
        this.options = { ...this.getDefaultOptions(), ...options };

        // Animation state
        this.isRunning = false;
        this.time = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;

        // Display dimensions (CSS pixels)
        this.displayWidth = 0;
        this.displayHeight = 0;

        // Mouse/touch state
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            button: 0
        };

        // Bound methods for event listeners
        this._boundRender = this._render.bind(this);
        this._boundResize = this._resize.bind(this);
        this._boundMouseMove = this._onMouseMove.bind(this);
        this._boundMouseDown = this._onMouseDown.bind(this);
        this._boundMouseUp = this._onMouseUp.bind(this);
        this._boundTouchStart = this._onTouchStart.bind(this);
        this._boundTouchMove = this._onTouchMove.bind(this);
        this._boundTouchEnd = this._onTouchEnd.bind(this);
        this._boundClick = this._onClick.bind(this);

        // Initialize
        this._setupEventListeners();
        this._resize();
    }

    /**
     * Get default options for this demo
     * Override in subclass to provide demo-specific defaults
     * @returns {Object}
     */
    getDefaultOptions() {
        return {};
    }

    /**
     * Initialize demo state
     * Override in subclass
     */
    init() {}

    /**
     * Update demo state each frame
     * Override in subclass
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {}

    /**
     * Render demo to canvas
     * Override in subclass
     */
    render() {}

    /**
     * Called when canvas is resized
     * Override in subclass if needed
     */
    onResize() {}

    /**
     * Called when mouse/touch moves
     * Override in subclass if needed
     * @param {number} x
     * @param {number} y
     */
    onMouseMove(x, y) {}

    /**
     * Called when mouse/touch starts
     * Override in subclass if needed
     * @param {number} x
     * @param {number} y
     * @param {number} button
     */
    onMouseDown(x, y, button) {}

    /**
     * Called when mouse/touch ends
     * Override in subclass if needed
     * @param {number} x
     * @param {number} y
     */
    onMouseUp(x, y) {}

    /**
     * Called on click/tap
     * Override in subclass if needed
     * @param {number} x
     * @param {number} y
     */
    onClick(x, y) {}

    /**
     * Get demo metadata for gallery display
     * Override in subclass
     * @returns {Object}
     */
    static getMetadata() {
        return {
            name: 'Unnamed Demo',
            description: '',
            difficulty: 'beginner',
            category: 'uncategorized'
        };
    }

    /**
     * Get control definitions for UI
     * Override in subclass
     * @returns {Array}
     */
    static getControls() {
        return [];
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.init();
        requestAnimationFrame(this._boundRender);
    }

    /**
     * Stop the animation loop
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Update an option value
     * @param {string} name
     * @param {*} value
     */
    setOption(name, value) {
        this.options[name] = value;
        this.onOptionChange(name, value);
    }

    /**
     * Called when an option changes
     * Override in subclass if needed
     * @param {string} name
     * @param {*} value
     */
    onOptionChange(name, value) {}

    /**
     * Clean up resources
     */
    destroy() {
        this.stop();
        this._removeEventListeners();
    }

    /**
     * Clear the canvas
     * @param {string} color - Optional background color
     */
    clear(color = null) {
        if (color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        } else {
            this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        }
    }

    // ============ Private Methods ============

    /**
     * Internal render loop
     * @param {number} time
     * @private
     */
    _render(time) {
        if (!this.isRunning) return;

        this.deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.time = time;
        this.frameCount++;

        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame(this._boundRender);
    }

    /**
     * Handle canvas resize with device pixel ratio
     * @private
     */
    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        // Set display size
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;

        // Set actual size in memory (scaled for retina)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale context to match CSS pixels
        this.ctx.scale(dpr, dpr);

        this.onResize();
    }

    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners() {
        window.addEventListener('resize', this._boundResize);

        this.canvas.addEventListener('mousemove', this._boundMouseMove);
        this.canvas.addEventListener('mousedown', this._boundMouseDown);
        this.canvas.addEventListener('mouseup', this._boundMouseUp);
        this.canvas.addEventListener('mouseleave', this._boundMouseUp);
        this.canvas.addEventListener('click', this._boundClick);

        this.canvas.addEventListener('touchstart', this._boundTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this._boundTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this._boundTouchEnd);
    }

    /**
     * Remove event listeners
     * @private
     */
    _removeEventListeners() {
        window.removeEventListener('resize', this._boundResize);

        this.canvas.removeEventListener('mousemove', this._boundMouseMove);
        this.canvas.removeEventListener('mousedown', this._boundMouseDown);
        this.canvas.removeEventListener('mouseup', this._boundMouseUp);
        this.canvas.removeEventListener('mouseleave', this._boundMouseUp);
        this.canvas.removeEventListener('click', this._boundClick);

        this.canvas.removeEventListener('touchstart', this._boundTouchStart);
        this.canvas.removeEventListener('touchmove', this._boundTouchMove);
        this.canvas.removeEventListener('touchend', this._boundTouchEnd);
    }

    /**
     * Get canvas-relative coordinates from event
     * @param {MouseEvent|Touch} event
     * @returns {{x: number, y: number}}
     * @private
     */
    _getEventCoords(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    /**
     * @private
     */
    _onMouseMove(e) {
        const coords = this._getEventCoords(e);
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        this.onMouseMove(coords.x, coords.y);
    }

    /**
     * @private
     */
    _onMouseDown(e) {
        const coords = this._getEventCoords(e);
        this.mouse.isDown = true;
        this.mouse.button = e.button;
        this.onMouseDown(coords.x, coords.y, e.button);
    }

    /**
     * @private
     */
    _onMouseUp(e) {
        const coords = this._getEventCoords(e);
        this.mouse.isDown = false;
        this.onMouseUp(coords.x, coords.y);
    }

    /**
     * @private
     */
    _onClick(e) {
        const coords = this._getEventCoords(e);
        this.onClick(coords.x, coords.y);
    }

    /**
     * @private
     */
    _onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const coords = this._getEventCoords(e.touches[0]);
            this.mouse.x = coords.x;
            this.mouse.y = coords.y;
            this.mouse.isDown = true;
            this.onMouseDown(coords.x, coords.y, 0);
        }
    }

    /**
     * @private
     */
    _onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const coords = this._getEventCoords(e.touches[0]);
            this.mouse.x = coords.x;
            this.mouse.y = coords.y;
            this.onMouseMove(coords.x, coords.y);
        }
    }

    /**
     * @private
     */
    _onTouchEnd(e) {
        this.mouse.isDown = false;
        this.onMouseUp(this.mouse.x, this.mouse.y);
        // Trigger click on touch end
        this.onClick(this.mouse.x, this.mouse.y);
    }
}
