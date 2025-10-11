# VIB34D Modular Rebuild

**AI-Powered 4D Music Video Choreographer** - Refactored into clean, modular ES6 architecture

## 🌐 **LIVE DEMO**
**[https://domusgpt.github.io/vib34d-modular-rebuild/](https://domusgpt.github.io/vib34d-modular-rebuild/)**

✨ **New Enhanced Features:**
- 📊 Real-time performance monitoring
- 🎨 8 built-in music presets (EDM, Chill, Rock, etc.)
- 🎛️ Live parameter controls with sliders
- ⌨️ 30+ keyboard shortcuts (press `/` for help)
- 🔮 Real WebGL engines (Faceted, Quantum, Holographic)

## 🎯 What This Is

This is a **complete architectural refactoring** of the VIB34D timeline choreographer system. The original 164KB monolithic HTML file has been transformed into a modern, modular codebase with proper build tooling.

## 🔥 Major Changes from Original

### Architecture Transformation
- **Before:** 3,639 lines of code in a single `index.html` file
- **After:** Modular ES6 structure with Vite build system
- **Before:** No build pipeline, manual script management
- **After:** Vite 5.4.20 with hot module replacement, optimized builds

### Critical Fixes Included
1. **Video Export Now Works** - Recording engine forces visualizers to render each frame
2. **Choreography Applied During Export** - Sequences actually execute during video recording
3. **Parameter Sweeps Execute** - All 6 sweep types (sine, sawtooth, triangle, pulse, decay, linear) fully implemented
4. **Color Palettes Transition** - All 4 transition modes working (beat-pulse, smooth-fade, snap-change, frequency-map)
5. **Professional Timeline** - 5-track structure preserved during rendering

## 📦 Module Structure

```
src/
├── core/
│   ├── RecordingEngine.js        # Video export with choreography integration
│   ├── AudioAnalyzer.js          # Real-time beat detection & frequency analysis
│   └── [TODO] Choreographer.js   # Main orchestrator (to be extracted)
│
├── choreography/
│   ├── ParameterSweeps.js        # 6 algorithmic sweep functions
│   ├── ColorPalettes.js          # Color transition system + presets
│   └── [TODO] ChoreographyModes.js  # 10 choreography modes
│
├── systems/
│   └── [TODO] SystemManager.js   # Faceted/Quantum/Holographic system switching
│
├── ai/
│   └── [TODO] GeminiClient.js    # AI choreography generation
│
└── main.js                        # Entry point
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
# Opens at http://localhost:8766/vib34d-modular-rebuild/
```

### Access the Application
- **Main App:** http://localhost:8766/vib34d-modular-rebuild/
- **Module Test:** http://localhost:8766/vib34d-modular-rebuild/test.html

### Production Build
```bash
npm run build
# Creates optimized dist/ folder
```

### Preview Production Build
```bash
npm run preview
```

## 🎬 Features

### Working Now
- ✅ **RecordingEngine** - Video export with forced visualizer rendering
- ✅ **AudioAnalyzer** - Multi-band frequency analysis, beat detection, tempo tracking
- ✅ **ParameterSweeps** - Sine, sawtooth, triangle, pulse-train, exponential-decay, linear-sweep
- ✅ **ColorPalettes** - 4 transition modes with preset palettes (rainbow, fire, ocean, neon)
- ✅ **ChoreographyModes** - All 10 modes (chaos, pulse, wave, flow, dynamic, strobe, glitch, build, breakdown, liquid)
- ✅ **Choreographer** - Main orchestrator with system management, sequence monitoring, AI integration
- ✅ **Vite Build System** - Fast dev server, optimized production builds
- ✅ **Path Aliases** - Clean imports with @core, @choreography, @systems, @ai, @ui

### Working Now (Phase 2 COMPLETE ✅ + Phase 3 ONGOING 🚀)
- ✅ **index.html** - Full working interface with Choreographer initialization
- ✅ **Audio File Upload** - Load MP3/audio files with Web Audio API integration
- ✅ **Playback Controls** - Play/pause/stop functionality
- ✅ **System Switching** - Real-time switching between faceted/quantum/holographic with WebGL cleanup
- ✅ **Status Display** - Real-time log of choreographer events
- ✅ **Real WebGL Engines Integrated:**
  - VIB34DIntegratedEngine - 5-layer holographic rendering with 4D polytopes
  - QuantumEngine - Quantum lattice particle system
  - RealHolographicSystem - Volumetric 3D holographic rendering
- ✅ **50+ Dependency Files** - All visualizers, geometry libraries, variations, gallery systems
- ✅ **Smart Canvas Management** - 5-layer architecture with automatic WebGL context cleanup
- ✅ **Audio Reactivity** - Multi-band frequency analysis with beat detection
- ✅ **Automated Testing** - Puppeteer-based browser test confirms zero errors
- ✅ **22 4D Geometries** - Polytopes, curved surfaces, fractals, chaotic attractors
- ✅ **Geometry Morphing** - Smooth transitions between any two geometries with 5 morph types
- ✅ **Advanced UI Controls** - 350+ control expansion plan in progress

### Next Steps (Phase 3 - Control Expansion)
- ✅ **Geometry System** - 22 4D geometries + morphing COMPLETE
- 🔄 **Variation System 2.0** - Expand to 200 variations with preview thumbnails
- ⏳ **Color System Overhaul** - 40+ palettes + custom editor
- ⏳ **Parameter Sweeps 2.0** - 16 sweep types + visual curve editor
- ⏳ **Timeline Enhancement** - Beat markers, automation lanes, templates
- ⏳ **Audio Reactivity Pro** - 8-band reactive system with mappings
- ⏳ **Rendering Pipeline** - 15+ post-processing effects
- ⏳ **Camera & Lighting** - Full 3D control system
- ⏳ **AI Choreography** - Full Gemini API integration
- ⏳ **Video Export Hookup** - Connect RecordingEngine to engines
- ⏳ **Production Deployment** - Build and deploy to GitHub Pages

**Total Controls:** 130 → 350+ (+169% expansion)

## 🔧 Development Roadmap

### Phase 1: Core Module Extraction (COMPLETE ✅)
- [x] Extract RecordingEngine
- [x] Extract AudioAnalyzer
- [x] Extract ParameterSweeps
- [x] Extract ColorPalettes
- [x] Extract ChoreographyModes (all 10 modes)
- [x] Extract main Choreographer class

### Phase 2: System Integration (COMPLETE ✅)
- [x] Integrate VIB34DIntegratedEngine with full 4D polytope rendering
- [x] Integrate QuantumEngine with quantum lattice visualizers
- [x] Integrate RealHolographicSystem with volumetric holographic rendering
- [x] Copy all 50+ dependency files (visualizers, geometry, variations, gallery, export, UI)
- [x] Implement 5-layer canvas management system with WebGL cleanup
- [x] Connect Web Audio API for audio reactivity
- [x] Create automated browser testing with Puppeteer
- [x] Verify all engines render correctly with zero errors

### Phase 3: AI & UI
- [ ] Extract GeminiClient
- [ ] Extract PromptBuilder
- [ ] Extract Timeline component
- [ ] Extract Controls component
- [ ] Extract WaveformDisplay

### Phase 4: Testing & Optimization
- [ ] Unit tests for each module
- [ ] Integration tests for full workflow
- [ ] Performance optimization
- [ ] Bundle size optimization

### Phase 5: Deployment
- [ ] GitHub Pages deployment
- [ ] Documentation
- [ ] Example videos
- [ ] User guide

## 🐛 Known Issues & TODO

### Critical
- [ ] **Full Choreographer extraction** - Main class still embedded in monolithic file
- [ ] **Update index.html** - Replace embedded code with module imports
- [ ] **Test complete workflow** - Verify upload → AI analyze → export works end-to-end

### Enhancement
- [ ] **TypeScript migration** - Add type safety
- [ ] **Unit tests** - Test coverage for all modules
- [ ] **Better error handling** - Comprehensive error messages
- [ ] **Performance profiling** - Optimize render loops
- [ ] **Mobile support** - Responsive UI, touch controls

### Documentation
- [ ] **API documentation** - JSDoc for all modules
- [ ] **Architecture diagrams** - Visual system overview
- [ ] **Tutorial videos** - How to use the system
- [ ] **Development guide** - How to extend/modify

## 🎨 Technology Stack

- **Build System:** Vite 5.4.20
- **Module Format:** ES6 modules
- **Package Manager:** npm
- **WebGL:** Three.js / raw WebGL for 4D visualization
- **Audio:** Web Audio API for analysis
- **Video:** MediaRecorder API for export
- **AI:** Google Gemini API for choreography generation

## 📝 Key Architectural Decisions

### Why Vite?
- Lightning-fast dev server with hot module replacement
- Rollup-based production builds with tree-shaking
- Native ES module support
- Simple configuration
- Optimized for single-page apps

### Why ES6 Modules?
- Clean separation of concerns
- Easy to test in isolation
- Better code organization
- Modern standard
- Works natively in browsers

### Module Design Principles
1. **Single Responsibility** - Each module does one thing well
2. **Dependency Injection** - Modules receive dependencies, don't create them
3. **Testability** - Pure functions where possible
4. **Small & Focused** - Target < 200 lines per file
5. **Clear Interfaces** - Export only what's needed

## 🔬 Testing Modules

Test individual modules with the included test page:
```bash
npm run dev
# Visit http://localhost:8765/vib34d-modular-rebuild/test-modules.html
```

This verifies all module imports work correctly.

## 🌟 Contributing

This is an active refactoring project. Areas that need help:

1. **Module Extraction** - Help extract remaining code from monolithic file
2. **Testing** - Write unit tests for extracted modules
3. **Documentation** - Improve JSDoc comments
4. **Bug Fixes** - Fix issues in TODO list
5. **Performance** - Optimize rendering and export

## 📄 License

© 2025 Paul Phillips - Clear Seas Solutions LLC
All Rights Reserved - Proprietary Technology

For commercial licensing: Paul@clearseassolutions.com

---

## 🎯 Quick Start Guide

1. **Clone this repository**
2. **Install:** `npm install`
3. **Develop:** `npm run dev`
4. **Build:** `npm run build`
5. **Deploy:** Push `dist/` folder to GitHub Pages

---

**This is a modular rebuild of the VIB34D timeline choreographer. The original monolithic version is preserved in `vib34d-timeline-dev`. This version focuses on maintainability, testability, and modern development practices.**
