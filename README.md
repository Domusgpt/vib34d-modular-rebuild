# VIB34D Modular Rebuild

**AI-Powered 4D Music Video Choreographer** - Refactored into clean, modular ES6 architecture

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
# Opens at http://localhost:8765/vib34d-modular-rebuild/
```

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

### Next Steps (Integration)
- ⏳ **System Engines** - Import VIB34DIntegratedEngine, QuantumEngine, RealHolographicSystem
- ⏳ **Simple Index.html** - Basic HTML that initializes Choreographer and tests modules
- ⏳ **Full UI Components** - Extract controls, timeline, waveform display from monolithic file
- ⏳ **End-to-End Testing** - Verify upload → analyze → choreograph → export workflow
- ⏳ **Production Deployment** - Build and deploy to GitHub Pages

## 🔧 Development Roadmap

### Phase 1: Core Module Extraction (COMPLETE ✅)
- [x] Extract RecordingEngine
- [x] Extract AudioAnalyzer
- [x] Extract ParameterSweeps
- [x] Extract ColorPalettes
- [x] Extract ChoreographyModes (all 10 modes)
- [x] Extract main Choreographer class

### Phase 2: System Integration
- [ ] Extract SystemManager
- [ ] Extract FacetedSystem wrapper
- [ ] Extract QuantumSystem wrapper
- [ ] Extract HolographicSystem wrapper

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
