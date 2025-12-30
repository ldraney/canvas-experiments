/**
 * @fileoverview Demo lifecycle management and registry
 * Handles loading, starting, stopping, and switching between demos
 */

/**
 * DemoRunner - Manages demo instances and lifecycle
 */
export class DemoRunner {
    constructor() {
        /** @type {Map<string, typeof import('./BaseDemo.js').BaseDemo>} */
        this.registry = new Map();

        /** @type {import('./BaseDemo.js').BaseDemo|null} */
        this.currentDemo = null;

        /** @type {HTMLCanvasElement|null} */
        this.canvas = null;

        /** @type {Object} */
        this.currentOptions = {};
    }

    /**
     * Set the canvas element to use for demos
     * @param {HTMLCanvasElement} canvas
     */
    setCanvas(canvas) {
        this.canvas = canvas;
    }

    /**
     * Register a demo class
     * @param {string} id - Unique identifier for the demo
     * @param {typeof import('./BaseDemo.js').BaseDemo} DemoClass
     */
    register(id, DemoClass) {
        this.registry.set(id, DemoClass);
    }

    /**
     * Register multiple demos at once
     * @param {Object<string, typeof import('./BaseDemo.js').BaseDemo>} demos
     */
    registerAll(demos) {
        Object.entries(demos).forEach(([id, DemoClass]) => {
            this.register(id, DemoClass);
        });
    }

    /**
     * Get all registered demo metadata
     * @returns {Array<{id: string, metadata: Object}>}
     */
    getAllMetadata() {
        const result = [];
        this.registry.forEach((DemoClass, id) => {
            result.push({
                id,
                metadata: DemoClass.getMetadata()
            });
        });
        return result;
    }

    /**
     * Get metadata for a specific demo
     * @param {string} id
     * @returns {Object|null}
     */
    getMetadata(id) {
        const DemoClass = this.registry.get(id);
        if (!DemoClass) return null;
        return DemoClass.getMetadata();
    }

    /**
     * Get controls for a specific demo
     * @param {string} id
     * @returns {Array}
     */
    getControls(id) {
        const DemoClass = this.registry.get(id);
        if (!DemoClass) return [];
        return DemoClass.getControls();
    }

    /**
     * Load and start a demo
     * @param {string} id - Demo identifier
     * @param {Object} options - Override options
     * @returns {boolean} Success
     */
    load(id, options = {}) {
        if (!this.canvas) {
            console.error('DemoRunner: No canvas set');
            return false;
        }

        const DemoClass = this.registry.get(id);
        if (!DemoClass) {
            console.error(`DemoRunner: Demo "${id}" not found`);
            return false;
        }

        // Stop current demo if running
        this.stop();

        // Create and start new demo
        this.currentOptions = options;
        this.currentDemo = new DemoClass(this.canvas, options);
        this.currentDemo.start();

        return true;
    }

    /**
     * Stop the current demo
     */
    stop() {
        if (this.currentDemo) {
            this.currentDemo.destroy();
            this.currentDemo = null;
        }
    }

    /**
     * Pause the current demo
     */
    pause() {
        if (this.currentDemo) {
            this.currentDemo.stop();
        }
    }

    /**
     * Resume the current demo
     */
    resume() {
        if (this.currentDemo && !this.currentDemo.isRunning) {
            this.currentDemo.start();
        }
    }

    /**
     * Update a demo option
     * @param {string} name
     * @param {*} value
     */
    setOption(name, value) {
        if (this.currentDemo) {
            this.currentDemo.setOption(name, value);
            this.currentOptions[name] = value;
        }
    }

    /**
     * Get current demo options
     * @returns {Object}
     */
    getOptions() {
        return { ...this.currentOptions };
    }

    /**
     * Check if a demo is currently running
     * @returns {boolean}
     */
    isRunning() {
        return this.currentDemo?.isRunning ?? false;
    }

    /**
     * Get the current demo instance
     * @returns {import('./BaseDemo.js').BaseDemo|null}
     */
    getCurrent() {
        return this.currentDemo;
    }

    /**
     * Filter demos by category
     * @param {string} category
     * @returns {Array<{id: string, metadata: Object}>}
     */
    filterByCategory(category) {
        return this.getAllMetadata().filter(
            demo => demo.metadata.category === category
        );
    }

    /**
     * Filter demos by difficulty
     * @param {string} difficulty
     * @returns {Array<{id: string, metadata: Object}>}
     */
    filterByDifficulty(difficulty) {
        return this.getAllMetadata().filter(
            demo => demo.metadata.difficulty === difficulty
        );
    }

    /**
     * Get demos matching filters
     * @param {Object} filters
     * @param {string} filters.category
     * @param {string[]} filters.difficulties
     * @returns {Array<{id: string, metadata: Object}>}
     */
    filter({ category = 'all', difficulties = ['beginner', 'intermediate', 'advanced'] } = {}) {
        return this.getAllMetadata().filter(demo => {
            const categoryMatch = category === 'all' || demo.metadata.category === category;
            const difficultyMatch = difficulties.includes(demo.metadata.difficulty);
            return categoryMatch && difficultyMatch;
        });
    }
}

// Export singleton instance
export const demoRunner = new DemoRunner();
