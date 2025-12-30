# Music Visualization Project

## Overview
A real-time audio-reactive visualization built with HTML5 Canvas and Web Audio API. Plays a lofi track and generates visuals that respond to frequency content and beats.

## Architecture

### Core Modules
- **AudioEngine.js** - Web Audio API setup, frequency band extraction (bass/mids/highs)
- **BeatDetector.js** - Energy-based beat detection with rolling average comparison
- **Visualizer.js** - Canvas rendering with layered visual elements
- **Effects.js** - Post-processing (film grain, vignette, scanlines)
- **main.js** - Application orchestration and UI controls

### Visualization Layers (back to front)
1. Breathing gradient background
2. Waveform mountain silhouettes
3. Floating particles (150+)
4. Central pulsing circle with glow
5. Expanding rings on beats
6. Post-processing effects

## Key Technical Details

### Frequency Bands
```
Bass: 20-250Hz   → Beat pulses, circle scaling
Mids: 250-2000Hz → Particle velocity, waveform amplitude
Highs: 2000-16kHz → Particle shimmer, texture
```

### Audio-Visual Timing
Critical settings for tight synchronization:
```javascript
// AudioEngine.js
analyser.smoothingTimeConstant = 0.3  // Lower = tighter FFT response

// Visualizer.js - lerp factors (higher = more responsive)
smoothedBass: 0.5
smoothedMid: 0.45
smoothedHigh: 0.4
waveformHistoryLength: 2  // frames
```

### Beat Detection
- Compares current bass energy to rolling average (30 frames)
- Threshold: 1.3x local average + standard deviation
- Cooldown: 120ms between beats
- Decay rate: 0.82 (controls how fast beat intensity fades)

## Development

```bash
# Start local server
npx serve

# Open http://localhost:3000
```

## Audio Source
"Neon Noir" by Centz - CC0 Public Domain from Internet Archive (DWK312)
