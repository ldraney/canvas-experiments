# Canvas Visual Effects Gallery

A comprehensive showcase of HTML Canvas capabilities through 36 interactive demos, organized by category and difficulty level.

## Project Structure

```
visual-effects-gallery/
├── index.html                    # Gallery page with filters
├── style.css                     # Dark theme styling
├── CLAUDE.md                     # This file
├── js/
│   ├── core/
│   │   ├── BaseDemo.js           # Abstract base class for demos
│   │   ├── DemoRunner.js         # Demo lifecycle management
│   │   └── CanvasUtils.js        # Shared canvas utilities
│   ├── utils/
│   │   ├── MathUtils.js          # Vector math, easing functions
│   │   ├── ColorUtils.js         # Color manipulation, palettes
│   │   ├── ParticleSystem.js     # Reusable particle engine
│   │   └── NoiseGenerator.js     # Perlin noise implementation
│   └── gallery.js                # Navigation & demo loading
└── demos/
    ├── 01-particles/             # Particle system demos
    ├── 02-fractals/              # Fractal & mathematical art
    ├── 03-generative/            # Procedural/generative art
    ├── 04-gradients/             # Gradient & color effects
    ├── 05-animation/             # Animation techniques
    └── 06-physics/               # Physics simulations
```

## Demo Roadmap

### Category 1: Particles (01-particles/)
| File | Difficulty | Description |
|------|------------|-------------|
| simple-particles.js | Beginner | Floating dust particles with gentle drift |
| mouse-attraction.js | Beginner | Particles attracted to cursor |
| particle-connections.js | Intermediate | Network nodes connected by lines |
| fireworks.js | Intermediate | Click-to-launch exploding fireworks |
| particle-text.js | Advanced | Text rendered as scattering particles |
| galaxy-spiral.js | Advanced | Thousands of stars in spiral arms |

### Category 2: Fractals (02-fractals/)
| File | Difficulty | Description |
|------|------------|-------------|
| tree-fractal.js | Beginner | Recursive branching tree |
| sierpinski.js | Beginner | Interactive Sierpinski triangle |
| mandelbrot.js | Intermediate | Zoomable Mandelbrot set |
| julia-set.js | Intermediate | Animated Julia set variations |
| l-system-plants.js | Advanced | L-system grammar vegetation |
| fractal-landscape.js | Advanced | Procedural terrain generation |

### Category 3: Generative (03-generative/)
| File | Difficulty | Description |
|------|------------|-------------|
| random-walkers.js | Beginner | Random walk trail patterns |
| flow-field.js | Beginner | Perlin noise vector field |
| circle-packing.js | Intermediate | Space-filling circles |
| voronoi-cells.js | Intermediate | Interactive Voronoi diagram |
| generative-art.js | Advanced | Abstract compositions |
| organic-growth.js | Advanced | Differential growth simulation |

### Category 4: Gradients (04-gradients/)
| File | Difficulty | Description |
|------|------------|-------------|
| gradient-basics.js | Beginner | Interactive gradient editor |
| color-cycling.js | Beginner | Animated color palette shifts |
| plasma-effect.js | Intermediate | Classic demoscene plasma |
| aurora-borealis.js | Intermediate | Northern lights effect |
| liquid-gradient.js | Advanced | Morphing blob gradients |
| fire-effect.js | Advanced | Procedural realistic flames |

### Category 5: Animation (05-animation/)
| File | Difficulty | Description |
|------|------------|-------------|
| easing-demo.js | Beginner | Visual easing function comparison |
| spring-physics.js | Beginner | Bouncy spring animations |
| wave-interference.js | Intermediate | Overlapping wave patterns |
| morphing-shapes.js | Intermediate | Smooth shape interpolation |
| 3d-starfield.js | Advanced | Perspective starfield flythrough |
| tunnel-effect.js | Advanced | Hypnotic infinite tunnel |

### Category 6: Physics (06-physics/)
| File | Difficulty | Description |
|------|------------|-------------|
| bouncing-balls.js | Beginner | Ball collision physics |
| pendulum.js | Beginner | Simple and double pendulum |
| cloth-simulation.js | Intermediate | Draggable fabric mesh |
| fluid-simulation.js | Intermediate | Simple fluid dynamics |
| gravity-sim.js | Advanced | N-body gravitational orbits |
| metaballs.js | Advanced | Blobby merging shapes |

## Architecture

### BaseDemo Class
All demos extend `BaseDemo` which provides:
- Canvas setup with device pixel ratio handling
- Animation loop via `requestAnimationFrame`
- Mouse/touch event tracking
- Resize handling
- Standard lifecycle: `init()`, `update(deltaTime)`, `render()`

### Demo Metadata
Each demo exports static metadata:
```javascript
static getMetadata() {
    return {
        name: 'Demo Name',
        description: 'What it does',
        difficulty: 'beginner' | 'intermediate' | 'advanced',
        category: 'particles' | 'fractals' | 'generative' | 'gradients' | 'animation' | 'physics'
    };
}

static getControls() {
    return [
        { type: 'slider', name: 'speed', label: 'Speed', min: 0, max: 10, default: 5 },
        { type: 'checkbox', name: 'showTrails', label: 'Show Trails', default: false },
        { type: 'color', name: 'particleColor', label: 'Color', default: '#ffffff' }
    ];
}
```

## Technical Patterns

### Animation Loop
```javascript
render(time) {
    this.deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update(this.deltaTime);
    this.draw();

    if (this.isRunning) {
        requestAnimationFrame(this.render.bind(this));
    }
}
```

### High-DPI Canvas
```javascript
resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;
}
```

### Color Utilities
- `ColorUtils.hsl(h, s, l, a)` - HSL color string
- `ColorUtils.lerpColor(c1, c2, t)` - Interpolate colors
- `ColorUtils.fromPalette(palette, t)` - Sample from palette

### Math Utilities
- `MathUtils.lerp(a, b, t)` - Linear interpolation
- `MathUtils.map(val, inMin, inMax, outMin, outMax)` - Range mapping
- `MathUtils.distance(x1, y1, x2, y2)` - Euclidean distance
- `MathUtils.easing.*` - Easing functions

## Running Locally

1. Serve the directory with any HTTP server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

2. Open `http://localhost:8000` (or appropriate port)

3. Click any demo card to view full-screen

## No Dependencies
This project uses only vanilla JavaScript and the HTML5 Canvas API. No build tools or external libraries required.
