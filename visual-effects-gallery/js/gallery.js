/**
 * @fileoverview Gallery navigation and demo management
 * Handles demo loading, filtering, and UI interactions
 */

import { demoRunner } from './core/DemoRunner.js';

// Import all demos
import { SimpleParticlesDemo } from '../demos/01-particles/simple-particles.js';
import { MouseAttractionDemo } from '../demos/01-particles/mouse-attraction.js';
import { ParticleConnectionsDemo } from '../demos/01-particles/particle-connections.js';
import { FireworksDemo } from '../demos/01-particles/fireworks.js';
import { ParticleTextDemo } from '../demos/01-particles/particle-text.js';
import { GalaxySpiralDemo } from '../demos/01-particles/galaxy-spiral.js';

import { TreeFractalDemo } from '../demos/02-fractals/tree-fractal.js';
import { SierpinskiDemo } from '../demos/02-fractals/sierpinski.js';
import { MandelbrotDemo } from '../demos/02-fractals/mandelbrot.js';
import { JuliaSetDemo } from '../demos/02-fractals/julia-set.js';
import { LSystemPlantsDemo } from '../demos/02-fractals/l-system-plants.js';
import { FractalLandscapeDemo } from '../demos/02-fractals/fractal-landscape.js';

import { RandomWalkersDemo } from '../demos/03-generative/random-walkers.js';
import { FlowFieldDemo } from '../demos/03-generative/flow-field.js';
import { CirclePackingDemo } from '../demos/03-generative/circle-packing.js';
import { VoronoiCellsDemo } from '../demos/03-generative/voronoi-cells.js';
import { GenerativeArtDemo } from '../demos/03-generative/generative-art.js';
import { OrganicGrowthDemo } from '../demos/03-generative/organic-growth.js';

import { GradientBasicsDemo } from '../demos/04-gradients/gradient-basics.js';
import { ColorCyclingDemo } from '../demos/04-gradients/color-cycling.js';
import { PlasmaEffectDemo } from '../demos/04-gradients/plasma-effect.js';
import { AuroraBorealisDemo } from '../demos/04-gradients/aurora-borealis.js';
import { LiquidGradientDemo } from '../demos/04-gradients/liquid-gradient.js';
import { FireEffectDemo } from '../demos/04-gradients/fire-effect.js';

import { EasingDemo } from '../demos/05-animation/easing-demo.js';
import { SpringPhysicsDemo } from '../demos/05-animation/spring-physics.js';
import { WaveInterferenceDemo } from '../demos/05-animation/wave-interference.js';
import { MorphingShapesDemo } from '../demos/05-animation/morphing-shapes.js';
import { StarfieldDemo } from '../demos/05-animation/3d-starfield.js';
import { TunnelEffectDemo } from '../demos/05-animation/tunnel-effect.js';

import { BouncingBallsDemo } from '../demos/06-physics/bouncing-balls.js';
import { PendulumDemo } from '../demos/06-physics/pendulum.js';
import { ClothSimulationDemo } from '../demos/06-physics/cloth-simulation.js';
import { FluidSimulationDemo } from '../demos/06-physics/fluid-simulation.js';
import { GravitySimDemo } from '../demos/06-physics/gravity-sim.js';
import { MetaballsDemo } from '../demos/06-physics/metaballs.js';

// ============ Register All Demos ============
demoRunner.registerAll({
    // Particles
    'simple-particles': SimpleParticlesDemo,
    'mouse-attraction': MouseAttractionDemo,
    'particle-connections': ParticleConnectionsDemo,
    'fireworks': FireworksDemo,
    'particle-text': ParticleTextDemo,
    'galaxy-spiral': GalaxySpiralDemo,

    // Fractals
    'tree-fractal': TreeFractalDemo,
    'sierpinski': SierpinskiDemo,
    'mandelbrot': MandelbrotDemo,
    'julia-set': JuliaSetDemo,
    'l-system-plants': LSystemPlantsDemo,
    'fractal-landscape': FractalLandscapeDemo,

    // Generative
    'random-walkers': RandomWalkersDemo,
    'flow-field': FlowFieldDemo,
    'circle-packing': CirclePackingDemo,
    'voronoi-cells': VoronoiCellsDemo,
    'generative-art': GenerativeArtDemo,
    'organic-growth': OrganicGrowthDemo,

    // Gradients
    'gradient-basics': GradientBasicsDemo,
    'color-cycling': ColorCyclingDemo,
    'plasma-effect': PlasmaEffectDemo,
    'aurora-borealis': AuroraBorealisDemo,
    'liquid-gradient': LiquidGradientDemo,
    'fire-effect': FireEffectDemo,

    // Animation
    'easing-demo': EasingDemo,
    'spring-physics': SpringPhysicsDemo,
    'wave-interference': WaveInterferenceDemo,
    'morphing-shapes': MorphingShapesDemo,
    '3d-starfield': StarfieldDemo,
    'tunnel-effect': TunnelEffectDemo,

    // Physics
    'bouncing-balls': BouncingBallsDemo,
    'pendulum': PendulumDemo,
    'cloth-simulation': ClothSimulationDemo,
    'fluid-simulation': FluidSimulationDemo,
    'gravity-sim': GravitySimDemo,
    'metaballs': MetaballsDemo
});

// ============ DOM Elements ============
const demoGrid = document.getElementById('demo-grid');
const demoViewer = document.getElementById('demo-viewer');
const demoCanvas = document.getElementById('demo-canvas');
const closeBtn = document.getElementById('close-demo');
const sidebarTitle = document.getElementById('sidebar-title');
const sidebarDescription = document.getElementById('sidebar-description');
const sidebarDifficulty = document.getElementById('sidebar-difficulty');
const sidebarCategory = document.getElementById('sidebar-category');
const controlsContainer = document.getElementById('controls-container');
const codeSnippet = document.getElementById('code-snippet');
const categoryNav = document.querySelector('.category-nav');
const difficultyFilters = document.querySelector('.difficulty-filters');

// ============ State ============
let currentCategory = 'all';
let currentDifficulties = ['beginner', 'intermediate', 'advanced'];
let currentDemoId = null;

// ============ Gallery Functions ============

/**
 * Create a demo card element
 * @param {string} id
 * @param {Object} metadata
 * @returns {HTMLElement}
 */
function createDemoCard(id, metadata) {
    const card = document.createElement('div');
    card.className = 'demo-card';
    card.dataset.demoId = id;

    card.innerHTML = `
        <div class="card-preview">
            <canvas data-demo-id="${id}"></canvas>
        </div>
        <div class="card-content">
            <div class="card-header">
                <span class="card-title">${metadata.name}</span>
                <span class="card-difficulty ${metadata.difficulty}">${metadata.difficulty}</span>
            </div>
            <p class="card-description">${metadata.description}</p>
            <span class="card-category">${metadata.category}</span>
        </div>
    `;

    card.addEventListener('click', () => openDemo(id));

    return card;
}

/**
 * Render the demo grid based on current filters
 */
function renderGrid() {
    const demos = demoRunner.filter({
        category: currentCategory,
        difficulties: currentDifficulties
    });

    demoGrid.innerHTML = '';

    if (demos.length === 0) {
        demoGrid.innerHTML = `
            <div class="empty-state">
                <h2>No demos found</h2>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    demos.forEach(({ id, metadata }) => {
        const card = createDemoCard(id, metadata);
        demoGrid.appendChild(card);
    });

    // Start thumbnail previews (low FPS)
    startThumbnailPreviews();
}

/**
 * Mini demo instances for thumbnails
 */
const thumbnailDemos = new Map();

/**
 * Start thumbnail preview animations
 */
function startThumbnailPreviews() {
    // Stop existing thumbnails
    thumbnailDemos.forEach(demo => demo.destroy());
    thumbnailDemos.clear();

    // Start new thumbnails
    const canvases = demoGrid.querySelectorAll('.card-preview canvas');
    canvases.forEach(canvas => {
        const id = canvas.dataset.demoId;
        const DemoClass = demoRunner.registry.get(id);
        if (DemoClass) {
            try {
                const demo = new DemoClass(canvas, {});
                demo.start();
                thumbnailDemos.set(id, demo);
            } catch (e) {
                console.warn(`Failed to start thumbnail for ${id}:`, e);
            }
        }
    });
}

/**
 * Stop all thumbnail previews
 */
function stopThumbnailPreviews() {
    thumbnailDemos.forEach(demo => demo.destroy());
    thumbnailDemos.clear();
}

/**
 * Open a demo in full-screen viewer
 * @param {string} id
 */
function openDemo(id) {
    currentDemoId = id;
    const metadata = demoRunner.getMetadata(id);
    const controls = demoRunner.getControls(id);

    // Update sidebar
    sidebarTitle.textContent = metadata.name;
    sidebarDescription.textContent = metadata.description;
    sidebarDifficulty.textContent = metadata.difficulty;
    sidebarDifficulty.className = `card-difficulty ${metadata.difficulty}`;
    sidebarCategory.textContent = metadata.category;

    // Build controls
    buildControls(controls);

    // Show viewer
    demoViewer.classList.remove('hidden');

    // Stop thumbnails to save resources
    stopThumbnailPreviews();

    // Start demo
    demoRunner.setCanvas(demoCanvas);
    demoRunner.load(id);

    // Set code snippet
    codeSnippet.textContent = `// ${metadata.name}\n// Category: ${metadata.category}\n// Difficulty: ${metadata.difficulty}\n\n// See demos folder for full source code`;
}

/**
 * Close the demo viewer
 */
function closeDemo() {
    demoRunner.stop();
    demoViewer.classList.add('hidden');
    currentDemoId = null;

    // Restart thumbnails
    startThumbnailPreviews();
}

/**
 * Build control elements for current demo
 * @param {Array} controls
 */
function buildControls(controls) {
    // Clear existing controls (keep the h3)
    const h3 = controlsContainer.querySelector('h3');
    controlsContainer.innerHTML = '';
    controlsContainer.appendChild(h3);

    if (controls.length === 0) {
        const noControls = document.createElement('p');
        noControls.style.color = 'var(--text-muted)';
        noControls.style.fontSize = '0.9rem';
        noControls.textContent = 'No adjustable parameters';
        controlsContainer.appendChild(noControls);
        return;
    }

    controls.forEach(control => {
        const group = document.createElement('div');
        group.className = 'control-group';

        switch (control.type) {
            case 'slider':
                group.innerHTML = `
                    <div class="control-label">
                        <span>${control.label}</span>
                        <span class="control-value">${control.default}</span>
                    </div>
                    <input type="range"
                           data-control="${control.name}"
                           min="${control.min}"
                           max="${control.max}"
                           value="${control.default}"
                           step="${control.step || 1}">
                `;
                const slider = group.querySelector('input');
                const valueDisplay = group.querySelector('.control-value');
                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value;
                    demoRunner.setOption(control.name, value);
                });
                break;

            case 'checkbox':
                group.innerHTML = `
                    <label class="checkbox-control">
                        <input type="checkbox"
                               data-control="${control.name}"
                               ${control.default ? 'checked' : ''}>
                        <span>${control.label}</span>
                    </label>
                `;
                const checkbox = group.querySelector('input');
                checkbox.addEventListener('change', (e) => {
                    demoRunner.setOption(control.name, e.target.checked);
                });
                break;

            case 'color':
                group.innerHTML = `
                    <div class="control-label">
                        <span>${control.label}</span>
                    </div>
                    <input type="color"
                           data-control="${control.name}"
                           value="${control.default}">
                `;
                const colorPicker = group.querySelector('input');
                colorPicker.addEventListener('input', (e) => {
                    demoRunner.setOption(control.name, e.target.value);
                });
                break;
        }

        controlsContainer.appendChild(group);
    });
}

// ============ Event Listeners ============

// Category navigation
categoryNav.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;

    categoryNav.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    currentCategory = e.target.dataset.category;
    renderGrid();
});

// Difficulty filters
difficultyFilters.addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;

    currentDifficulties = Array.from(
        difficultyFilters.querySelectorAll('input:checked')
    ).map(input => input.value);

    renderGrid();
});

// Close demo
closeBtn.addEventListener('click', closeDemo);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentDemoId) {
        closeDemo();
    }
});

// Handle window resize for demo canvas
window.addEventListener('resize', () => {
    if (currentDemoId && demoRunner.currentDemo) {
        demoRunner.currentDemo._resize();
    }
});

// ============ Initialize ============
renderGrid();
