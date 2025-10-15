# VIB34D System Architecture - Complete Technical Documentation

**CRITICAL: This documentation is the complete blueprint for the UI redesign. Every connection, data flow, event handler, and dependency is documented here. Do NOT change anything without understanding its impact on this entire system.**

---

## 1. INITIALIZATION FLOW

### Complete Startup Sequence:

```
1. Browser loads index.html
2. DOMContentLoaded event fires
3. index.html inline script imports main.js modules
4. index.html creates: choreographer = new Choreographer()
5. index.html calls: await choreographer.init()
6. Choreographer.init() executes initialization sequence
7. UI components are initialized and connected
8. System starts rendering
```

### Choreographer.init() Detailed Steps:

```javascript
// /src/core/Choreographer.js lines 90-113

async init() {
    // STEP 1: Initialize enhanced systems
    this.performanceMonitor = new PerformanceMonitor();
    this.presetManager = new PresetManager(this);
    this.keyboardController = new KeyboardController(this);

    // STEP 2: Initialize canvas system (CRITICAL)
    await this.initCanvases();

    // STEP 3: Initialize ONLY the active system (faceted by default)
    await this.initCurrentSystem();

    // STEP 4: Start performance monitoring
    this.performanceMonitor.start();

    // STEP 5: Setup audio context and analyser
    this.setupAudio();

    // STEP 6: Setup UI (placeholder - UI setup happens in index.html)
    this.setupUI();

    // STEP 7: Initialize recording engine
    this.recordingEngine = new RecordingEngine(this);

    // STEP 8: Initialize audio analyzer
    this.audioAnalyzer = new AudioAnalyzer(this);
}
```

### Canvas Initialization (CRITICAL):

```javascript
// /src/core/Choreographer.js lines 115-124

async initCanvases() {
    // Get the stage container from DOM
    const stageContainer = document.getElementById('stage-container');
    if (!stageContainer) {
        throw new Error('stage-container element not found');
    }

    // Create CanvasLayerManager instance
    this.canvasManager = new CanvasLayerManager(stageContainer);
    console.log('✅ Canvas layer manager initialized');
}
```

### System Creation Flow:

```javascript
// /src/core/Choreographer.js lines 131-207

async createSystem(systemName) {
    // STEP 1: Destroy existing engine if present
    if (sys.engine) {
        await this.destroySystem(systemName);
    }

    // STEP 2: Create 5-layer canvas system using CanvasLayerManager
    const { canvases, layerSpecs } = this.canvasManager.createLayers(systemName);
    sys.canvases = canvases;

    // STEP 3: Wait for canvases to be fully laid out (2 RAF)
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    // STEP 4: Create engine instance
    if (systemName === 'faceted') {
        sys.engine = new VIB34DIntegratedEngine();
    } else if (systemName === 'quantum') {
        sys.engine = new QuantumEngine();
    } else if (systemName === 'holographic') {
        sys.engine = new RealHolographicSystem();
        // Disable holographic built-in audio
        sys.engine.audioEnabled = false;
        sys.engine.audioContext = null;
        sys.engine.analyser = null;
    }

    // STEP 5: Update system parameters
    this.updateSystemParameters(sys.engine);

    // STEP 6: Set engine as active
    if (sys.engine && sys.engine.setActive) {
        sys.engine.setActive(true);
    }
}
```

### Order of Initialization (CRITICAL):

1. **Choreographer constructor** - creates empty systems object, initializes baseParams
2. **Choreographer.init()** - initializes sub-systems
3. **CanvasLayerManager** - creates canvas management system
4. **createSystem('faceted')** - creates faceted engine + 5 canvases
5. **PerformanceMonitor.start()** - begins performance tracking
6. **setupAudio()** - creates AudioContext + analyser node
7. **RecordingEngine** - initializes video recording system
8. **AudioAnalyzer** - initializes audio analysis system
9. **UI Components** (from index.html):
   - IntegratedControlsCollapsible
   - VisualsMenu
   - XYTouchpad
   - VisualizerXYPad

### Global Variables Created (CRITICAL):

```javascript
// From index.html and main.js initialization:
window.choreographer = choreographer;           // Main orchestrator
window.integratedControls = IntegratedControlsCollapsible;
window.visualsMenu = VisualsMenu;
window.xyTouchpad = XYTouchpad;
window.visualizerXYPad = VisualizerXYPad;
window.VIB34D_MODULES = MODULES_LOADED;        // Module status
window.audioReactive = undefined;              // Set by AudioAnalyzer
window.audioEnabled = undefined;               // Set by UI toggles
window.mobileDebug = undefined;                // Set by mobile debug system
```

---

## 2. CHOREOGRAPHER API (CRITICAL)

### Core Properties:

```javascript
// /src/core/Choreographer.js lines 21-88

class Choreographer {
    // System State
    currentSystem: string = 'faceted'  // 'faceted' | 'quantum' | 'holographic'
    systemSwitchInProgress: boolean = false

    // Canvas Management (CRITICAL)
    canvasManager: CanvasLayerManager = null

    // Systems Registry
    systems: {
        faceted: { engine: VIB34DIntegratedEngine | null, canvases: Canvas[], active: boolean },
        quantum: { engine: QuantumEngine | null, canvases: Canvas[], active: boolean },
        holographic: { engine: RealHolographicSystem | null, canvases: Canvas[], active: boolean }
    }

    // Base Parameters - NEVER modified by audio (audio applies on top)
    baseParams: {
        // Geometry (1-24 = different 4D polytopes)
        geometry: number = 1,

        // Grid and morphing
        gridDensity: number = 15,      // 1-100
        morphFactor: number = 1.0,     // 0-5
        chaos: number = 0.2,           // 0-3
        speed: number = 1.0,           // 0.1-10

        // Color
        hue: number = 200,             // 0-360
        intensity: number = 0.5,       // 0-1
        saturation: number = 0.8,      // 0-1

        // 4D Rotations (hyperspace rotation angles)
        rot4dXW: number = 0.0,         // -π to +π
        rot4dYW: number = 0.0,         // -π to +π
        rot4dZW: number = 0.0,         // -π to +π

        // MVEP-style enhancements
        moireScale: number = 1.01,     // 0.95-1.05
        glitchIntensity: number = 0.05,// 0-0.2
        lineThickness: number = 0.02   // 0.01-0.1
    }

    // Audio System
    audioContext: AudioContext = null
    audioElement: HTMLAudioElement = null
    mediaSource: MediaElementSourceNode = null  // CRITICAL: Created once, reused
    analyser: AnalyserNode = null               // CRITICAL: Used by AudioAnalyzer
    audioReactive: boolean = true
    reactivityStrength: number = 0.5            // 0-1
    extremeMode: boolean = false                // 5x audio multiplier

    // Timeline & Choreography
    sequences: Array = []
    currentTime: number = 0
    duration: number = 0
    isPlaying: boolean = false
    choreographyMode: string = 'dynamic'        // 'dynamic' | 'smooth' | 'aggressive' | 'minimal'

    // Sub-systems
    recordingEngine: RecordingEngine = null
    audioAnalyzer: AudioAnalyzer = null
    performanceMonitor: PerformanceMonitor = null
    presetManager: PresetManager = null
    keyboardController: KeyboardController = null
}
```

### CRITICAL Methods (Parameter Control):

#### setParameter(param, value)

**This is the MAIN parameter update method. All UI parameter changes MUST go through this.**

```javascript
// /src/core/Choreographer.js lines 281-309

setParameter(param, value) {
    // STEP 1: Update base parameter (stored value)
    this.baseParams[param] = value;

    // STEP 2: Update ALL systems (not just active)
    Object.values(this.systems).forEach(sys => {
        if (!sys.engine) return;

        // Method 1: ParameterManager (VIB34DIntegratedEngine, QuantumEngine)
        if (sys.engine.parameterManager && sys.engine.parameterManager.setParameter) {
            sys.engine.parameterManager.setParameter(param, value);
            if (sys.engine.updateVisualizers) {
                sys.engine.updateVisualizers();
            }
        }

        // Method 2: Direct visualizer update (all engines)
        if (sys.engine.visualizers && Array.isArray(sys.engine.visualizers)) {
            const params = this.baseParams;
            sys.engine.visualizers.forEach(visualizer => {
                if (visualizer.updateParameters) {
                    visualizer.updateParameters(params);
                }
            });
        }

        // Method 3: Direct updateParameter method (RealHolographicSystem)
        if (sys.engine.updateParameter) {
            sys.engine.updateParameter(param, value);
        }
    });
}
```

**CRITICAL: This method updates ALL systems, not just the active one. This ensures parameters are synchronized when switching systems.**

#### getCurrentParameters()

```javascript
// /src/core/Choreographer.js lines 311-313

getCurrentParameters() {
    return { ...this.baseParams };  // Returns a copy
}
```

#### switchSystem(systemName)

```javascript
// /src/core/Choreographer.js lines 209-228

async switchSystem(systemName) {
    if (systemName === this.currentSystem) return;

    console.log(`🔄 Switching from ${this.currentSystem} to ${systemName}`);

    // CRITICAL: Proper cleanup order
    const oldSystem = this.currentSystem;

    // STEP 1: Destroy old system (engine + canvases)
    await this.destroySystem(oldSystem);

    // STEP 2: Update current system pointer
    this.currentSystem = systemName;

    // STEP 3: Create new system (engine + canvases)
    await this.createSystem(systemName);

    // STEP 4: Update UI
    document.querySelectorAll('.system-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.system === systemName);
    });

    console.log(`✅ Switched from ${oldSystem} to ${systemName} with proper layer cleanup`);
}
```

### Audio System Methods:

#### setupAudio()

```javascript
// /src/core/Choreographer.js lines 315-324

setupAudio() {
    // Create AudioContext
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // CREATE THE ANALYSER NODE - CRITICAL FOR AUDIO!
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    console.log('✅ Audio system initialized with analyser node');
}
```

#### loadAudioFile(file)

```javascript
// /src/core/Choreographer.js lines 326-379

async loadAudioFile(file) {
    if (!file) return;

    const url = URL.createObjectURL(file);

    // Resume AudioContext if suspended
    if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
    }

    // CRITICAL: Reuse existing audio element and source
    if (this.audioElement && this.mediaSource) {
        // Reuse existing setup
        console.log('🔄 Reusing existing audio element and source');
        this.audioElement.pause();
        this.audioElement.src = url;
        this.audioElement.load();
    } else {
        // First time setup
        console.log('🎵 Creating new audio element and Web Audio connection');

        this.audioElement = new Audio(url);
        this.audioElement.crossOrigin = 'anonymous';

        // Create MediaElementSource ONCE and store it
        this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
        this.mediaSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        console.log('✅ Web Audio API connected - mediaSource stored');
    }

    // Start audio analysis loop
    if (this.audioAnalyzer) {
        this.audioAnalyzer.startAnalysisLoop();
    }

    // Setup event listeners
    this.audioElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioElement.duration;
        console.log(`🎵 Audio loaded: ${this.duration.toFixed(2)}s`);
    });
}
```

**CRITICAL: The mediaSource is created ONCE and reused. Creating multiple MediaElementSourceNodes causes errors.**

#### play()

```javascript
// /src/core/Choreographer.js lines 631-650

async play() {
    if (!this.audioElement) {
        console.warn('⚠️ No audio file loaded');
        return;
    }

    if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
    }

    await this.audioElement.play();
    this.isPlaying = true;

    // Start audio analysis loop
    if (this.audioAnalyzer) {
        this.audioAnalyzer.startAnalysisLoop();
    }

    console.log('✅ Playback started');
}
```

### Choreography Methods:

#### applyAdvancedChoreography(audioData)

```javascript
// /src/core/Choreographer.js lines 381-396

applyAdvancedChoreography(audioData) {
    const strength = this.reactivityStrength;
    const sys = this.systems[this.currentSystem];
    if (!sys.engine) return;

    // Helper function to set parameters
    const setParam = (param, value) => {
        if (sys.engine.parameterManager && sys.engine.parameterManager.setParameter) {
            sys.engine.parameterManager.setParameter(param, value);
        } else if (sys.engine.updateParameter) {
            sys.engine.updateParameter(param, value);
        }
    };

    // Use ChoreographyModes module
    applyChoreographyMode(this.choreographyMode, audioData, setParam, strength, this.baseParams);
}
```

**This is called by AudioAnalyzer on every frame when audio is playing.**

---

## 3. ENGINE CONNECTIONS

### VIB34DIntegratedEngine (Faceted System)

**File:** `/src/systems/VIB34DIntegratedEngine.js`

#### Initialization:

```javascript
// Constructor - lines 16-47
constructor() {
    this.visualizers = [];
    this.parameterManager = new ParameterManager();
    this.variationManager = new VariationManager(this);
    this.gallerySystem = new GallerySystem(this);
    this.exportManager = new ExportManager(this);
    this.statusManager = new StatusManager();

    this.isActive = false;
    this.currentVariation = 0;
    this.totalVariations = 100;

    // Mouse interaction state
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.mouseIntensity = 0.0;
    this.clickIntensity = 0.0;

    // Animation state
    this.time = 0;
    this.animationId = null;

    this.init();
}
```

**Constructor takes NO parameters. Canvas IDs are hardcoded in createVisualizers().**

#### Canvas Requirements:

```javascript
// lines 74-94
createVisualizers() {
    const layers = [
        { id: 'background-canvas', role: 'background', reactivity: 0.5 },
        { id: 'shadow-canvas', role: 'shadow', reactivity: 0.7 },
        { id: 'content-canvas', role: 'content', reactivity: 0.9 },
        { id: 'highlight-canvas', role: 'highlight', reactivity: 1.1 },
        { id: 'accent-canvas', role: 'accent', reactivity: 1.5 }
    ];

    layers.forEach(layer => {
        const visualizer = new IntegratedHolographicVisualizer(
            layer.id,           // Canvas ID (must exist in DOM)
            layer.role,         // Layer role
            layer.reactivity,   // Reactivity multiplier
            this.currentVariation  // Starting variation
        );
        this.visualizers.push(visualizer);
    });
}
```

**CRITICAL: These canvas IDs MUST exist in DOM before engine is created.**

#### Parameter Updates:

**Method 1: ParameterManager (preferred)**

```javascript
// Choreographer calls this:
engine.parameterManager.setParameter(param, value);
if (engine.updateVisualizers) {
    engine.updateVisualizers();
}
```

**Method 2: Direct visualizer update**

```javascript
// lines 197-216
updateVisualizers() {
    const params = this.parameterManager.getAllParameters();

    // Add interaction state
    params.mouseX = this.mouseX;
    params.mouseY = this.mouseY;
    params.mouseIntensity = this.mouseIntensity;
    params.clickIntensity = this.clickIntensity;
    params.time = this.time;

    this.visualizers.forEach(visualizer => {
        visualizer.updateParameters(params);
        visualizer.render();
    });

    // Decay interaction intensities
    this.mouseIntensity *= 0.95;
    this.clickIntensity *= 0.92;
}
```

#### Render Loop:

```javascript
// lines 172-193
startRenderLoop() {
    const render = () => {
        this.time += 0.016; // ~60fps

        // Audio reactivity handled directly in visualizer render loops

        this.updateVisualizers();
        this.animationId = requestAnimationFrame(render);
    };
    render();
}
```

**CRITICAL: Each engine has its own render loop that runs continuously.**

#### Public Methods:

```javascript
// Lifecycle
setActive(active) - Enable/disable rendering
destroy() - Clean up resources

// Parameter control
parameterManager.setParameter(param, value) - Set parameter
updateVisualizers() - Force visualizer update

// Variations
setVariation(index) - Set variation (0-99)
nextVariation() - Next variation
previousVariation() - Previous variation
randomVariation() - Random variation

// Interaction (called by ReactivityManager)
updateInteraction(x, y, intensity) - Mouse/touch movement
triggerClick(intensity) - Click effect
updateScroll(velocity) - Scroll effect

// Audio reactivity
applyAudioReactivityGrid(audioData) - Apply audio modulation
```

### QuantumEngine

**File:** `/src/systems/QuantumEngine.js`

#### Initialization:

```javascript
// Constructor - lines 11-38
constructor() {
    this.visualizers = [];
    this.parameters = new ParameterManager();
    this.isActive = false;

    // Initialize with quantum-enhanced defaults
    this.parameters.setParameter('hue', 280);        // Purple-blue
    this.parameters.setParameter('intensity', 0.7);
    this.parameters.setParameter('saturation', 0.9);
    this.parameters.setParameter('gridDensity', 20);
    this.parameters.setParameter('morphFactor', 1.0);

    this.init();
}
```

#### Canvas Requirements:

```javascript
// lines 44-75
createVisualizers() {
    const layers = [
        { id: 'quantum-background-canvas', role: 'background', reactivity: 0.4 },
        { id: 'quantum-shadow-canvas', role: 'shadow', reactivity: 0.6 },
        { id: 'quantum-content-canvas', role: 'content', reactivity: 1.0 },
        { id: 'quantum-highlight-canvas', role: 'highlight', reactivity: 1.3 },
        { id: 'quantum-accent-canvas', role: 'accent', reactivity: 1.6 }
    ];

    layers.forEach(layer => {
        const canvas = document.getElementById(layer.id);
        if (!canvas) {
            console.warn(`⚠️ Canvas ${layer.id} not found in DOM - skipping`);
            return;
        }

        const visualizer = new QuantumHolographicVisualizer(layer.id, layer.role, layer.reactivity, 0);
        if (visualizer.gl) {
            this.visualizers.push(visualizer);
        }
    });
}
```

#### Parameter Updates:

```javascript
// lines 163-194
updateParameter(param, value) {
    // Update internal parameter manager
    this.parameters.setParameter(param, value);

    // CRITICAL: Apply to all quantum visualizers with immediate render
    this.visualizers.forEach(visualizer => {
        if (visualizer.updateParameters) {
            const params = {};
            params[param] = value;
            visualizer.updateParameters(params);
        } else {
            // Fallback: direct parameter update with manual render
            if (visualizer.params) {
                visualizer.params[param] = value;
                if (visualizer.render) {
                    visualizer.render();
                }
            }
        }
    });
}

updateParameters(params) {
    Object.keys(params).forEach(param => {
        this.updateParameter(param, params[param]);
    });
}
```

#### Render Loop:

```javascript
// lines 226-267
startRenderLoop() {
    const render = () => {
        if (this.isActive) {
            // Get current parameters
            const currentParams = this.parameters.getAllParameters();

            this.visualizers.forEach(visualizer => {
                if (visualizer.updateParameters && visualizer.render) {
                    visualizer.updateParameters(currentParams);
                    visualizer.render();
                }
            });
        }

        requestAnimationFrame(render);
    };

    render();
}
```

**CRITICAL: Quantum engine only renders when isActive = true.**

### RealHolographicSystem

**File:** `/src/systems/RealHolographicSystem.js`

#### Initialization:

```javascript
// Constructor - lines 9-46
constructor() {
    this.visualizers = [];
    this.currentVariant = 0;
    this.baseVariants = 30;
    this.totalVariants = 30;
    this.isActive = false;

    // Audio reactivity system
    this.audioEnabled = false;
    this.audioContext = null;
    this.analyser = null;
    this.frequencyData = null;
    this.audioData = { bass: 0, mid: 0, high: 0 };

    // Variant names (30 variations)
    this.variantNames = [
        'TETRAHEDRON LATTICE', 'TETRAHEDRON FIELD', ...
    ];

    this.initialize();
}
```

#### Canvas Requirements:

```javascript
// lines 57-96
createVisualizers() {
    const layers = [
        { id: 'holo-background-canvas', role: 'background', reactivity: 0.5 },
        { id: 'holo-shadow-canvas', role: 'shadow', reactivity: 0.7 },
        { id: 'holo-content-canvas', role: 'content', reactivity: 0.9 },
        { id: 'holo-highlight-canvas', role: 'highlight', reactivity: 1.1 },
        { id: 'holo-accent-canvas', role: 'accent', reactivity: 1.5 }
    ];

    layers.forEach(layer => {
        const canvas = document.getElementById(layer.id);
        if (!canvas) {
            console.error(`❌ Canvas not found: ${layer.id}`);
            return;
        }

        const visualizer = new HolographicVisualizer(layer.id, layer.role, layer.reactivity, this.currentVariant);

        if (visualizer.gl) {
            this.visualizers.push(visualizer);
        }
    });
}
```

#### Parameter Updates:

```javascript
// lines 151-192
updateParameter(param, value) {
    // Store custom parameter overrides
    if (!this.customParams) {
        this.customParams = {};
    }
    this.customParams[param] = value;

    // CRITICAL FIX: Call updateParameters method on ALL visualizers
    this.visualizers.forEach((visualizer, index) => {
        try {
            if (visualizer.updateParameters) {
                // Use new updateParameters method
                const params = {};
                params[param] = value;
                visualizer.updateParameters(params);
            } else {
                // Fallback for older method
                if (visualizer.variantParams) {
                    visualizer.variantParams[param] = value;

                    if (param === 'geometryType') {
                        visualizer.roleParams = visualizer.generateRoleParams(visualizer.role);
                    }

                    if (visualizer.render) {
                        visualizer.render();
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Failed to update holographic layer ${index}:`, error);
        }
    });
}
```

#### Render Loop:

```javascript
// lines 686-702
startRenderLoop() {
    const render = () => {
        if (this.isActive) {
            // Update audio reactivity
            this.updateAudio();

            // Render all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.render();
            });
        }

        requestAnimationFrame(render);
    };

    render();
}
```

**CRITICAL: Holographic system has its own audio processing via updateAudio().**

---

## 4. CANVAS MANAGER

**File:** `/src/systems/CanvasLayerManager.js`

### Responsibilities:

1. **Canvas creation** - Creates 5-layer canvas systems for each visualization
2. **Canvas destruction** - Properly cleans up WebGL contexts
3. **System switching** - Manages canvas visibility and lifecycle
4. **Resource management** - Prevents memory leaks

### Canvas Layer Specifications:

```javascript
// lines 20-43
this.layerDefinitions = {
    faceted: [
        { id: 'background-canvas', role: 'background', reactivity: 0.5 },
        { id: 'shadow-canvas', role: 'shadow', reactivity: 0.7 },
        { id: 'content-canvas', role: 'content', reactivity: 0.9 },
        { id: 'highlight-canvas', role: 'highlight', reactivity: 1.1 },
        { id: 'accent-canvas', role: 'accent', reactivity: 1.5 }
    ],
    quantum: [
        { id: 'quantum-background-canvas', role: 'background', reactivity: 0.4 },
        { id: 'quantum-shadow-canvas', role: 'shadow', reactivity: 0.6 },
        { id: 'quantum-content-canvas', role: 'content', reactivity: 1.0 },
        { id: 'quantum-highlight-canvas', role: 'highlight', reactivity: 1.3 },
        { id: 'quantum-accent-canvas', role: 'accent', reactivity: 1.6 }
    ],
    holographic: [
        { id: 'holo-background-canvas', role: 'background', reactivity: 0.5 },
        { id: 'holo-shadow-canvas', role: 'shadow', reactivity: 0.7 },
        { id: 'holo-content-canvas', role: 'content', reactivity: 0.9 },
        { id: 'holo-highlight-canvas', role: 'highlight', reactivity: 1.1 },
        { id: 'holo-accent-canvas', role: 'accent', reactivity: 1.5 }
    ]
};
```

### createLayers(systemName)

```javascript
// lines 50-121
createLayers(systemName) {
    // Check if layers already exist
    if (this.activeLayers.has(systemName)) {
        this.destroyLayers(systemName);
    }

    // Get layer specifications
    const specs = this.layerDefinitions[systemName];

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.id = `${systemName}Layers`;
    wrapper.className = 'canvas-layer-system';
    wrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    `;

    const canvases = [];
    const layerSpecs = [];

    // Create each canvas
    specs.forEach((spec, index) => {
        const canvas = document.createElement('canvas');
        canvas.id = spec.id;
        canvas.className = `layer-${spec.role}`;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${index + 1};
            pointer-events: none;
        `;

        wrapper.appendChild(canvas);
        canvases.push(canvas);
        layerSpecs.push({
            canvas,
            id: spec.id,
            role: spec.role,
            reactivity: spec.reactivity,
            index
        });
    });

    // Add wrapper to container
    this.container.appendChild(wrapper);

    // Store reference
    this.activeLayers.set(systemName, {
        canvases,
        layerSpecs,
        wrapper
    });

    return { canvases, layerSpecs };
}
```

### destroyLayers(systemName)

```javascript
// lines 127-169
destroyLayers(systemName) {
    const system = this.activeLayers.get(systemName);
    if (!system) return;

    // Clean up each canvas
    system.canvases.forEach((canvas, index) => {
        // CRITICAL: Lose WebGL context before removing
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        if (gl) {
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) {
                loseContext.loseContext();
            }
        }

        // Clear 2D context if present
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Remove canvas from DOM
        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    });

    // Remove wrapper from DOM
    if (system.wrapper && system.wrapper.parentNode) {
        system.wrapper.parentNode.removeChild(system.wrapper);
    }

    // Remove from active layers
    this.activeLayers.delete(systemName);
}
```

**CRITICAL: WebGL contexts MUST be lost before removing canvases to prevent memory leaks.**

---

## 5. AUDIO SYSTEM

### Audio Input Flow:

```
1. User clicks "LOAD AUDIO" button in top bar
2. File input dialog opens
3. User selects audio file
4. index.html file input change event fires
5. choreographer.loadAudioFile(file) called
6. AudioContext resumed if suspended
7. Audio element created (or reused)
8. MediaElementSourceNode created ONCE
9. Source connected: mediaSource → analyser → destination
10. audioAnalyzer.startAnalysisLoop() called
11. Audio is ready to play
```

### Audio Data Structure:

**Global:** `window.audioReactive` (set by AudioAnalyzer)

```javascript
// Created by AudioAnalyzer.getAudioData()
// /src/core/AudioAnalyzer.js lines 40-50 and 182-199

{
    // Smoothed momentum values (for choreography)
    bass: number,              // 0-1
    mid: number,               // 0-1
    high: number,              // 0-1

    // Peak values (for extreme effects)
    bassPeak: number,          // 0-1
    midPeak: number,           // 0-1
    highPeak: number,          // 0-1

    // Combined metrics
    energy: number,            // 0-1, bass-weighted
    beatPhase: number,         // 0-1, tempo-synced phase
    rhythmicPulse: number,     // 0-1, sine wave at tempo
    isBeat: boolean            // true if beat detected in last 100ms
}
```

### Audio Processing Loop:

```javascript
// /src/core/AudioAnalyzer.js lines 66-175

startAnalysisLoop() {
    const analyser = this.choreographer.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const loop = () => {
        requestAnimationFrame(loop);

        if (!this.choreographer.audioReactive || !analyser) return;

        // Get frequency data
        analyser.getByteFrequencyData(dataArray);

        // ADVANCED MULTI-BAND FREQUENCY ANALYSIS
        const bass = this.getFrequencyRange(dataArray, 0, 100) / 255;
        const lowMid = this.getFrequencyRange(dataArray, 100, 250) / 255;
        const mid = this.getFrequencyRange(dataArray, 250, 500) / 255;
        const highMid = this.getFrequencyRange(dataArray, 500, 800) / 255;
        const high = this.getFrequencyRange(dataArray, 800, 1024) / 255;
        const energy = (bass * 2 + lowMid + mid + highMid + high) / 6;

        // BEAT DETECTION
        const beatThreshold = this.peakDetector.bass * 0.7 + 0.3;
        let isBeat = false;
        if (bass > beatThreshold && (now - this.lastBeatTime) > 250) {
            isBeat = true;
            this.lastBeatTime = now;
            this.beatHistory.push(now);

            // Calculate tempo
            if (this.beatHistory.length >= 4) {
                const intervals = [];
                for (let i = 1; i < this.beatHistory.length; i++) {
                    intervals.push(this.beatHistory[i] - this.beatHistory[i-1]);
                }
                this.avgBeatInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
            }
        }

        // RHYTHMIC PULSE (tempo-synced animation phase)
        if (this.avgBeatInterval > 0) {
            const timeSinceLastBeat = now - this.lastBeatTime;
            this.beatPhase = (timeSinceLastBeat / this.avgBeatInterval) % 1;
            this.rhythmicPulse = Math.sin(this.beatPhase * Math.PI * 2) * 0.5 + 0.5;
        }

        // PEAK DETECTION (smooth decay for adaptive thresholds)
        this.peakDetector.bass = Math.max(this.peakDetector.bass * 0.99, bass);
        this.peakDetector.mid = Math.max(this.peakDetector.mid * 0.99, mid);
        this.peakDetector.high = Math.max(this.peakDetector.high * 0.99, high);
        this.peakDetector.energy = Math.max(this.peakDetector.energy * 0.99, energy);

        // MOMENTUM (smooth acceleration/deceleration)
        this.energyMomentum.bass += (bass - this.energyMomentum.bass) * 0.15;
        this.energyMomentum.mid += (mid - this.energyMomentum.mid) * 0.12;
        this.energyMomentum.high += (high - this.energyMomentum.high) * 0.18;

        // Apply choreography with audio data
        this.choreographer.applyAdvancedChoreography({
            bass, lowMid, mid, highMid, high, energy,
            isBeat,
            beatPhase: this.beatPhase,
            rhythmicPulse: this.rhythmicPulse,
            momentum: this.energyMomentum,
            peaks: this.peakDetector,
            dt
        });
    };

    loop();
}
```

### Extreme Mode:

**Location:** `choreographer.extremeMode` (boolean)

**Effect:** When enabled, audio reactivity multiplier is 5x

**Applied in:** ChoreographyModes module (imported by Choreographer)

```javascript
// The reactivityStrength is multiplied by 5 if extremeMode is true
const effectiveStrength = choreographer.extremeMode
    ? choreographer.reactivityStrength * 5
    : choreographer.reactivityStrength;
```

---

## 6. PARAMETER DATA FLOW (CRITICAL)

### Example 1: gridDensity slider changed in VisualsMenu

```
1. User moves slider: #visual-gridDensity
   Location: VisualsMenu.js, rendered HTML

2. Event listener fires: input event
   Location: VisualsMenu.js line 264-272

3. Event handler executes:
   - Reads value: parseFloat(e.target.value)
   - Updates display: valueDisplay.textContent = value
   - Calls: this.choreographer.setParameter('gridDensity', value)

4. Choreographer.setParameter() executes:
   Location: Choreographer.js line 281-309
   - Updates: this.baseParams.gridDensity = value
   - Loops through ALL systems

5. For each system engine:

   A. VIB34DIntegratedEngine (Faceted):
      - Calls: engine.parameterManager.setParameter('gridDensity', value)
      - ParameterManager stores value
      - Calls: engine.updateVisualizers()
      - Visualizers receive: params.gridDensity = value
      - Visualizers re-render with new value

   B. QuantumEngine:
      - Calls: engine.updateParameter('gridDensity', value)
      - Engine updates: this.parameters.setParameter('gridDensity', value)
      - Visualizers receive: updateParameters({ gridDensity: value })
      - Visualizers re-render with new value

   C. RealHolographicSystem:
      - Calls: engine.updateParameter('gridDensity', value)
      - Engine stores: this.customParams.gridDensity = value
      - Visualizers receive: updateParameters({ gridDensity: value })
      - Visualizers re-render with new value

6. Render loop continues:
   - Each engine's render loop reads updated parameters
   - WebGL shaders receive new uniform values
   - Visual output reflects new gridDensity
```

### Example 2: rot4dXW slider changed in IntegratedControlsCollapsible

```
1. User moves slider: #param-rot4dXW
   Location: IntegratedControlsCollapsible.js, rendered HTML

2. Event listener fires: input event
   Location: IntegratedControlsCollapsible.js line 273-283

3. Event handler executes:
   - Reads value: parseFloat(e.target.value)
   - Updates display: valueDisplay.textContent = value.toFixed(2)
   - Calls: this.choreographer.setParameter('rot4dXW', value)

4. [Same as Example 1, steps 4-6]
```

### Example 3: System switching (Faceted → Quantum)

```
1. User clicks "QUANTUM" tab in top bar
   Location: index.html, .viz-tab button

2. Event listener fires: click event
   Location: index.html line 1200-1225

3. Event handler executes:
   - Reads system: tab.dataset.system (= 'quantum')
   - Calls: await choreographer.switchSystem('quantum')

4. Choreographer.switchSystem() executes:
   Location: Choreographer.js line 209-228

   A. Destroy old system ('faceted'):
      - Calls: choreographer.destroySystem('faceted')
      - Engine: sys.engine.setActive(false)
      - Visualizers: Stop rendering, lose WebGL contexts
      - Canvases: canvasManager.destroyLayers('faceted')
      - DOM: Remove all faceted canvas elements

   B. Update system pointer:
      - Set: this.currentSystem = 'quantum'

   C. Create new system ('quantum'):
      - Calls: choreographer.createSystem('quantum')
      - Canvases: canvasManager.createLayers('quantum')
      - DOM: Create 5 new canvas elements with IDs:
        * quantum-background-canvas
        * quantum-shadow-canvas
        * quantum-content-canvas
        * quantum-highlight-canvas
        * quantum-accent-canvas
      - Engine: new QuantumEngine()
      - Visualizers: Create 5 QuantumHolographicVisualizer instances
      - Parameters: Apply all baseParams to new engine
      - Start: engine.setActive(true)

   D. Update UI:
      - Toggle 'active' class on all .viz-tab buttons
      - Toggle 'active' class on all .system-pill elements

5. Quantum engine render loop:
   - Now renders at 60fps
   - Reads parameters from engine.parameters
   - Applies to quantum visualizers
```

### Example 4: Audio reactivity modulating parameters

```
1. Audio is playing:
   - audioElement.play() active
   - AudioAnalyzer loop running

2. AudioAnalyzer processes audio:
   Location: AudioAnalyzer.js line 66-175
   - Analyzes frequency data
   - Detects beats
   - Calculates energy, momentum, peaks
   - Creates audioData object

3. AudioAnalyzer calls choreography:
   - Calls: choreographer.applyAdvancedChoreography(audioData)

4. Choreographer applies audio modulation:
   Location: Choreographer.js line 381-396
   - Gets current system engine
   - Gets reactivity strength
   - Applies extreme mode multiplier if enabled
   - Calls: applyChoreographyMode(mode, audioData, setParam, strength, baseParams)

5. ChoreographyMode modulates parameters:
   Location: /src/choreography/ChoreographyModes.js
   - Reads audioData (bass, mid, high, energy, etc.)
   - Calculates modulation amount based on mode
   - Calls setParam() for each affected parameter

   Example modulations:
   - gridDensity += bass * strength * 30
   - morphFactor = 1.0 + energy * strength * 2
   - hue += mid * strength * 50
   - rot4dXW += bass * strength * 0.05

6. setParam() updates engine:
   - For each modulated parameter:
     * Does NOT update baseParams (audio is temporary)
     * Directly calls engine.parameterManager.setParameter()
     * Engine visualizers render with modulated value

7. When audio stops:
   - Audio modulation ceases
   - baseParams remain unchanged
   - Parameters return to base values
```

---

## 7. EVENT HANDLERS MAP

| UI Element | Element ID | Event Type | Handler Location | What It Calls | Final Effect |
|------------|-----------|------------|------------------|---------------|--------------|
| **Top Bar** |
| Smart Audio Button | `#smart-audio-btn` | click | index.html line 1139 | choreographer.play() / .pause() | Start/pause audio playback |
| Audio File Input | `#audio-file-input-top` | change | index.html line 1174 | choreographer.loadAudioFile(file) | Load audio file |
| Faceted Tab | `.viz-tab[data-system="faceted"]` | click | index.html line 1200 | choreographer.switchSystem('faceted') | Switch to faceted system |
| Quantum Tab | `.viz-tab[data-system="quantum"]` | click | index.html line 1200 | choreographer.switchSystem('quantum') | Switch to quantum system |
| Holographic Tab | `.viz-tab[data-system="holographic"]` | click | index.html line 1200 | choreographer.switchSystem('holographic') | Switch to holographic system |
| **Control Panel (IntegratedControlsCollapsible)** |
| Geometry Slider | `#param-geometry` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('geometry', value) | Updates geometry for all systems |
| Grid Density Slider | `#param-gridDensity` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('gridDensity', value) | Updates grid density for all systems |
| Morph Factor Slider | `#param-morphFactor` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('morphFactor', value) | Updates morph factor for all systems |
| Chaos Slider | `#param-chaos` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('chaos', value) | Updates chaos for all systems |
| Speed Slider | `#param-speed` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('speed', value) | Updates speed for all systems |
| XW Rotation Slider | `#param-rot4dXW` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('rot4dXW', value) | Updates 4D rotation for all systems |
| YW Rotation Slider | `#param-rot4dYW` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('rot4dYW', value) | Updates 4D rotation for all systems |
| ZW Rotation Slider | `#param-rot4dZW` | input | IntegratedControlsCollapsible.js line 273 | choreographer.setParameter('rot4dZW', value) | Updates 4D rotation for all systems |
| Universal Slider 1-4 | `.universal-slider[data-slider-index]` | input | IntegratedControlsCollapsible.js line 392 | choreographer.setParameter(param, value) | Updates assigned parameter |
| Universal Slider Dropdown | `.universal-param-select` | change | IntegratedControlsCollapsible.js line 358 | Reassigns slider to new parameter | Updates slider configuration |
| Audio Reactive Toggle | `#toggle-audio-reactive` | click | IntegratedControlsCollapsible.js line 302 | choreographer.audioReactive = !value | Toggles audio reactivity |
| Reactivity Strength | `#reactivity-strength` | input | IntegratedControlsCollapsible.js line 311 | choreographer.reactivityStrength = value | Updates audio strength |
| Choreography Mode | `#choreography-mode` | change | IntegratedControlsCollapsible.js line 320 | choreographer.choreographyMode = value | Changes choreography mode |
| Extreme Mode Toggle | `#toggle-extreme-mode` | click | IntegratedControlsCollapsible.js line 328 | choreographer.extremeMode = !value | Toggles 5x audio multiplier |
| System Pills | `.system-pill` | click | IntegratedControlsCollapsible.js line 288 | choreographer.switchSystem(system) | Switch visualization system |
| **Visuals Panel (VisualsMenu)** |
| Geometry Slider | `#visual-geometry` | input | VisualsMenu.js line 264 | choreographer.setParameter('geometry', value) | Updates geometry |
| 4D Rotation XW | `#visual-rot4dXW` | input | VisualsMenu.js line 264 | choreographer.setParameter('rot4dXW', value) | Updates 4D rotation |
| 4D Rotation YW | `#visual-rot4dYW` | input | VisualsMenu.js line 264 | choreographer.setParameter('rot4dYW', value) | Updates 4D rotation |
| 4D Rotation ZW | `#visual-rot4dZW` | input | VisualsMenu.js line 264 | choreographer.setParameter('rot4dZW', value) | Updates 4D rotation |
| Grid Density | `#visual-gridDensity` | input | VisualsMenu.js line 264 | choreographer.setParameter('gridDensity', value) | Updates grid density |
| Morph Factor | `#visual-morphFactor` | input | VisualsMenu.js line 264 | choreographer.setParameter('morphFactor', value) | Updates morph factor |
| Chaos | `#visual-chaos` | input | VisualsMenu.js line 264 | choreographer.setParameter('chaos', value) | Updates chaos |
| Speed | `#visual-speed` | input | VisualsMenu.js line 264 | choreographer.setParameter('speed', value) | Updates speed |
| Hue | `#visual-hue` | input | VisualsMenu.js line 264 | choreographer.setParameter('hue', value) | Updates hue |
| Intensity | `#visual-intensity` | input | VisualsMenu.js line 264 | choreographer.setParameter('intensity', value) | Updates intensity |
| Saturation | `#visual-saturation` | input | VisualsMenu.js line 264 | choreographer.setParameter('saturation', value) | Updates saturation |
| Moiré Scale | `#visual-moire` | input | VisualsMenu.js line 264 | choreographer.setParameter('moireScale', value) | Updates moiré effect |
| Glitch Intensity | `#visual-glitch` | input | VisualsMenu.js line 264 | choreographer.setParameter('glitchIntensity', value) | Updates glitch effect |
| Line Thickness | `#visual-line` | input | VisualsMenu.js line 264 | choreographer.setParameter('lineThickness', value) | Updates line rendering |
| System Pills | `.system-pill-vis` | click | VisualsMenu.js line 277 | choreographer.switchSystem(system) | Switch visualization system |
| **Panel Collapse** |
| Control Panel Collapse | `.panel-collapse-btn` (in #control-panel) | click | IntegratedControlsCollapsible.js line 70 | Toggles panel collapsed state | Collapses/expands panel |
| Visuals Panel Collapse | `.panel-collapse-btn` (in #visuals-panel) | click | VisualsMenu.js line 70 | Toggles panel collapsed state | Collapses/expands panel |
| **Collapsible Sections** |
| Section Headers | `.section-header` | click | CollapsibleSection.js | Toggles section open/closed | Expands/collapses section |

---

## 8. CRITICAL DEPENDENCIES

### Constructor Dependencies:

**MUST exist before Choreographer is created:**

1. **DOM Elements:**
   - `#stage-container` - Container for canvas layers
   - All UI elements in index.html (panels, buttons, sliders)

2. **No external dependencies** - Choreographer creates everything internally

**MUST exist before engines are created:**

1. **Canvas elements** - Created by CanvasLayerManager BEFORE engine constructor
2. **No other dependencies** - Engines create their own visualizers

### Method Call Order:

**CRITICAL: These methods MUST be called in this order:**

```javascript
// 1. Create Choreographer
const choreographer = new Choreographer();

// 2. Initialize (MUST be awaited)
await choreographer.init();

// 3. Load audio (optional, but required for audio features)
await choreographer.loadAudioFile(file);

// 4. Play audio
await choreographer.play();
```

**What breaks if you call them out of order:**

- **play() before loadAudioFile()** - Error: No audio element
- **setParameter() before init()** - Error: No engines exist
- **switchSystem() before init()** - Error: Canvas manager not initialized

### Timing Dependencies:

**Async Operations:**

1. **choreographer.init()** - Returns Promise, MUST be awaited
2. **choreographer.switchSystem()** - Returns Promise, MUST be awaited
3. **choreographer.loadAudioFile()** - Returns Promise, MUST be awaited
4. **choreographer.play()** - Returns Promise, MUST be awaited

**DOM Ready:**

```javascript
// MUST wait for DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    const choreographer = new Choreographer();
    await choreographer.init();
});
```

**Canvas Size Calculations:**

```javascript
// CanvasLayerManager waits 2 RAF before creating engines
await new Promise(resolve => requestAnimationFrame(resolve));
await new Promise(resolve => requestAnimationFrame(resolve));
```

**This ensures canvases have proper dimensions before WebGL initialization.**

---

## 9. LOCALSTORAGE / STATE PERSISTENCE

### Keys Used:

```javascript
// IntegratedControlsCollapsible
'universalSliderAssignments'     // JSON array of 4 parameter names
'controlPanelCollapsed'          // 'true' | 'false'

// VisualsMenu
'visualsPanelCollapsed'          // 'true' | 'false'

// Other systems may use additional keys
```

### Data Format:

**Universal Slider Assignments:**

```javascript
// Default:
["morphFactor", "chaos", "speed", "hue"]

// Saved as JSON string:
localStorage.setItem('universalSliderAssignments', JSON.stringify(assignments));

// Loaded and parsed:
const assignments = JSON.parse(localStorage.getItem('universalSliderAssignments') || '["morphFactor", "chaos", "speed", "hue"]');
```

**Panel Collapsed State:**

```javascript
// Saved:
localStorage.setItem('controlPanelCollapsed', 'true');

// Loaded:
const savedState = localStorage.getItem('controlPanelCollapsed');
if (savedState === 'true') {
    panel.classList.add('collapsed');
}
```

### When Saved:

- **Universal slider reassignment** - Immediately on dropdown change
- **Panel collapse** - Immediately on collapse button click

### When Loaded:

- **Universal sliders** - On IntegratedControlsCollapsible initialization
- **Panel state** - On panel initialization

### What Happens if Missing:

- **Universal sliders** - Falls back to default assignments
- **Panel state** - Desktop: expanded, Mobile portrait: collapsed

---

## 10. GLOBAL VARIABLES / WINDOW PROPERTIES

### Created by main.js / index.html:

```javascript
window.choreographer = choreographer;
// Who creates: index.html initChoreographer()
// Who reads: All UI components, debugging
// Who modifies: Never modified, only replaced on re-init

window.integratedControls = IntegratedControlsCollapsible instance;
// Who creates: index.html initChoreographer()
// Who reads: Debugging
// Who modifies: Never

window.visualsMenu = VisualsMenu instance;
// Who creates: index.html initChoreographer()
// Who reads: Debugging
// Who modifies: Never

window.xyTouchpad = XYTouchpad instance;
// Who creates: index.html initChoreographer()
// Who reads: Debugging
// Who modifies: Never

window.visualizerXYPad = VisualizerXYPad instance;
// Who creates: index.html initChoreographer()
// Who reads: Debugging
// Who modifies: Never

window.VIB34D_MODULES = MODULES_LOADED object;
// Who creates: main.js
// Who reads: Debugging
// Who modifies: Never
```

### Created by engines:

```javascript
window.engine = VIB34DIntegratedEngine instance;
// Who creates: CanvasManager when creating faceted system
// Who reads: Legacy code, debugging
// Who modifies: Replaced on system switch

window.quantumEngine = QuantumEngine instance;
// Who creates: CanvasManager when creating quantum system
// Who reads: Legacy code, debugging
// Who modifies: Replaced on system switch

window.holographicSystem = RealHolographicSystem instance;
// Who creates: CanvasManager when creating holographic system
// Who reads: Legacy code, debugging
// Who modifies: Replaced on system switch
```

### Audio-related (used internally):

```javascript
window.audioReactive = AudioAnalyzer.getAudioData() result;
// Who creates: AudioAnalyzer (if set, but not currently)
// Who reads: Potentially engines
// Who modifies: AudioAnalyzer on every frame

window.audioEnabled = boolean;
// Who creates: UI toggles
// Who reads: Engines, AudioAnalyzer
// Who modifies: UI toggle handlers
```

### Mobile debugging:

```javascript
window.mobileDebug = MobileDebug instance;
// Who creates: Mobile debug system (if enabled)
// Who reads: Engines, system code
// Who modifies: Mobile debug system
```

---

## 11. CSS CLASSES / STYLING DEPENDENCIES

### Critical Classes Toggled by JavaScript:

**System switching:**

```css
.system-pill.active
.viz-tab.active
/* Applied when system is active */
/* Controls: background, color, border */
```

**Panel collapse:**

```css
#control-panel.collapsed
#visuals-panel.collapsed
/* Applied when panel is collapsed */
/* Controls: width, height, padding, display */
```

**Section collapse:**

```css
.collapsible-section.open
/* Applied when section is expanded */
/* Controls: section content visibility */
```

**Loading state:**

```css
#loading-indicator.hidden
/* Applied when loading is complete */
/* Controls: display: none */
```

**Audio button states:**

```css
.smart-audio-btn[data-state="load"]
.smart-audio-btn[data-state="play"]
.smart-audio-btn[data-state="pause"]
.smart-audio-btn[data-state="playing"]
/* Applied based on audio playback state */
/* Controls: background, color, animation */
```

### Position/Layout Dependencies:

**Z-index layers (CRITICAL):**

```css
#stage-container         { z-index: 1 }    /* Canvas layers */
#mode-display            { z-index: 100 }  /* Status overlay */
#visuals-panel           { z-index: 99 }   /* Visuals controls */
#control-panel           { z-index: 100 }  /* Main controls */
#top-bar                 { z-index: 200 }  /* Top bar */
.panel-collapse-btn      { z-index: 201 }  /* Collapse buttons */

/* Canvas layers within systems: */
.layer-background        { z-index: 1 }
.layer-shadow            { z-index: 2 }
.layer-content           { z-index: 3 }
.layer-highlight         { z-index: 4 }
.layer-accent            { z-index: 5 }
```

**CRITICAL: Do not change z-index order or UI elements will overlap incorrectly.**

### Mobile Responsive Classes:

```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) and (orientation: portrait) { /* Mobile portrait */ }
```

**Mobile-specific behaviors:**

- Panels default to collapsed
- Smaller font sizes
- Touch-friendly control sizes (min-height: 40px)
- Adjusted positioning

---

## 12. PARAMETER VALIDATION

### Where Validation Occurs:

**No explicit validation in Choreographer.setParameter()**

- Values are passed directly to engines
- Each engine may have its own validation

**Validation in UI:**

```html
<!-- HTML5 input validation -->
<input type="range"
       id="visual-gridDensity"
       min="1"
       max="100"
       step="1"
       value="15">
```

**Browser enforces:**

- min/max constraints
- step increments
- number type

**JavaScript validation:**

```javascript
// parseFloat ensures number type
const value = parseFloat(e.target.value);

// If NaN, value is not set (silent failure)
```

### Parameter Ranges (UI Constraints):

```javascript
// From VisualsMenu.js and IntegratedControlsCollapsible.js

geometry:        min: 1,    max: 24,   step: 1
gridDensity:     min: 1,    max: 100,  step: 1
morphFactor:     min: 0,    max: 5,    step: 0.01
chaos:           min: 0,    max: 3,    step: 0.01
speed:           min: 0.1,  max: 10,   step: 0.1
hue:             min: 0,    max: 360,  step: 1
intensity:       min: 0,    max: 1,    step: 0.01
saturation:      min: 0,    max: 1,    step: 0.01
rot4dXW:         min: -3.14159, max: 3.14159, step: 0.01
rot4dYW:         min: -3.14159, max: 3.14159, step: 0.01
rot4dZW:         min: -3.14159, max: 3.14159, step: 0.01
moireScale:      min: 0.95, max: 1.05, step: 0.001
glitchIntensity: min: 0,    max: 0.2,  step: 0.01
lineThickness:   min: 0.01, max: 0.1,  step: 0.005
```

### What Happens with Invalid Values:

**If value is outside range:**

- HTML input clamps to min/max automatically
- Engine receives clamped value

**If value is NaN:**

- parseFloat returns NaN
- setParameter() is called with NaN
- Engine behavior is undefined (likely visual glitches)

**CRITICAL: Always use HTML5 validation attributes to prevent invalid values.**

---

## 13. ERROR HANDLING

### Try-Catch Blocks:

**Choreographer.init():**

```javascript
// index.html line 1094-1131
try {
    choreographer = new Choreographer();
    await choreographer.init();
    // Success: Hide loading indicator
} catch (error) {
    addStatus(`Initialization error: ${error.message}`, 'error');
    console.error('Choreographer init failed:', error);
}
```

**Choreographer.createSystem():**

```javascript
// Choreographer.js line 170-206
try {
    if (systemName === 'faceted') {
        sys.engine = new VIB34DIntegratedEngine();
    } else if (systemName === 'quantum') {
        sys.engine = new QuantumEngine();
    } else if (systemName === 'holographic') {
        sys.engine = new RealHolographicSystem();
    }
    // Success: Engine created
} catch (error) {
    console.error(`❌ Failed to create ${systemName}:`, error);
    console.error('Error details:', error.stack);
}
```

**Audio loading:**

```javascript
// index.html line 1179-1196
try {
    await choreographer.loadAudioFile(file);
    addStatus('Audio loaded successfully', 'success');
    // Enable controls
} catch (error) {
    addStatus(`Audio load error: ${error.message}`, 'error');
}
```

**System switching:**

```javascript
// index.html line 1205-1223
try {
    await choreographer.switchSystem(system);
    // Update UI
    addStatus(`Switched to ${system}`, 'success');
} catch (error) {
    addStatus(`System switch error: ${error.message}`, 'error');
}
```

### Expected Errors:

1. **"stage-container element not found"**
   - Cause: DOM not ready
   - Solution: Wait for DOMContentLoaded

2. **"No audio file loaded"**
   - Cause: play() called before loadAudioFile()
   - Solution: Load audio first

3. **"CanvasLayerManager not initialized"**
   - Cause: createSystem() called before init()
   - Solution: Await init() completion

4. **"No WebGL context"**
   - Cause: Browser doesn't support WebGL
   - Solution: Show error message to user

### Fallbacks:

**No fallbacks are implemented.** Errors are logged and operation fails.

**Recommended additions:**

- Fallback to 2D canvas if WebGL unavailable
- Default parameters if localStorage corrupt
- Silent parameter clamping instead of errors

---

## 14. MOBILE / RESPONSIVE BEHAVIOR

### Detection:

```javascript
// IntegratedControlsCollapsible.js line 80-85
const savedState = localStorage.getItem('controlPanelCollapsed');
const isMobile = window.innerWidth <= 480 && window.matchMedia('(orientation: portrait)').matches;

if (savedState === 'true' || (savedState === null && isMobile)) {
    panel.classList.add('collapsed');
    collapseBtn.textContent = '+';
}
```

**Mobile criteria:**

- Width ≤ 480px
- Portrait orientation

### Mobile-Specific Changes:

**Panel defaults:**

- Desktop: Panels expanded by default
- Mobile portrait: Panels collapsed by default

**Control sizes:**

```css
@media (max-width: 480px) and (orientation: portrait) {
    button {
        min-height: 40px;  /* Touch-friendly */
        font-size: 10px;
    }

    input[type="range"] {
        height: 30px;      /* Easier to grab */
    }

    .section-header {
        padding: 10px;
        min-height: 40px;  /* Touch-friendly */
    }
}
```

**Layout adjustments:**

```css
@media (max-width: 480px) and (orientation: portrait) {
    #control-panel {
        top: 42px;
        right: 0;
        width: calc(100vw - 50px);
        max-height: calc(55vh - 42px);
    }

    #visuals-panel {
        bottom: 0;
        left: 0;
        width: calc(100vw - 50px);
        max-height: calc(35vh - 10px);
    }
}
```

**Top bar:**

```css
@media (max-width: 480px) and (orientation: portrait) {
    #top-bar {
        height: 38px;
        padding: 4px 6px;
        gap: 4px;
    }

    #top-bar button {
        padding: 6px 8px;
        font-size: 9px;
        height: 30px;
    }
}
```

### Touch Event Handling:

**No special touch event handling in core system.**

Touch events are handled by:

- XYTouchpad (touch movement, touchend)
- VisualizerXYPad (touch movement, touchend)
- Standard HTML controls (browser handles touch)

### Different Initialization:

**No different initialization for mobile.**

Same code path for desktop and mobile.

---

## 15. COMPLETE PARAMETER REFERENCE

### All baseParams Parameters:

```javascript
{
    // Geometry
    geometry: {
        type: 'number',
        range: [1, 24],
        default: 1,
        description: '4D polytope selection',
        affects: 'Shape structure',
        uiElements: ['#param-geometry', '#visual-geometry']
    },

    // Grid and Morphing
    gridDensity: {
        type: 'number',
        range: [1, 100],
        default: 15,
        description: 'Vertex grid resolution',
        affects: 'Visual complexity',
        uiElements: ['#param-gridDensity', '#visual-gridDensity']
    },

    morphFactor: {
        type: 'number',
        range: [0, 5],
        default: 1.0,
        description: 'Shape morphing amount',
        affects: 'Geometric transformation',
        uiElements: ['#param-morphFactor', '#visual-morphFactor']
    },

    chaos: {
        type: 'number',
        range: [0, 3],
        default: 0.2,
        description: 'Randomization intensity',
        affects: 'Vertex displacement',
        uiElements: ['#param-chaos', '#visual-chaos']
    },

    speed: {
        type: 'number',
        range: [0.1, 10],
        default: 1.0,
        description: 'Animation speed',
        affects: 'Time multiplier',
        uiElements: ['#param-speed', '#visual-speed']
    },

    // Color
    hue: {
        type: 'number',
        range: [0, 360],
        default: 200,
        description: 'Color hue (degrees)',
        affects: 'Base color',
        uiElements: ['#visual-hue']
    },

    intensity: {
        type: 'number',
        range: [0, 1],
        default: 0.5,
        description: 'Color brightness',
        affects: 'Light intensity',
        uiElements: ['#visual-intensity']
    },

    saturation: {
        type: 'number',
        range: [0, 1],
        default: 0.8,
        description: 'Color saturation',
        affects: 'Color vividness',
        uiElements: ['#visual-saturation']
    },

    // 4D Rotations
    rot4dXW: {
        type: 'number',
        range: [-Math.PI, Math.PI],
        default: 0.0,
        description: 'XW plane rotation',
        affects: '4D hyperspace rotation',
        uiElements: ['#param-rot4dXW', '#visual-rot4dXW']
    },

    rot4dYW: {
        type: 'number',
        range: [-Math.PI, Math.PI],
        default: 0.0,
        description: 'YW plane rotation',
        affects: '4D hyperspace rotation',
        uiElements: ['#param-rot4dYW', '#visual-rot4dYW']
    },

    rot4dZW: {
        type: 'number',
        range: [-Math.PI, Math.PI],
        default: 0.0,
        description: 'ZW plane rotation',
        affects: '4D hyperspace rotation',
        uiElements: ['#param-rot4dZW', '#visual-rot4dZW']
    },

    // MVEP-Style Enhancements
    moireScale: {
        type: 'number',
        range: [0.95, 1.05],
        default: 1.01,
        description: 'Moiré interference pattern',
        affects: 'Visual interference',
        uiElements: ['#visual-moire']
    },

    glitchIntensity: {
        type: 'number',
        range: [0, 0.2],
        default: 0.05,
        description: 'RGB color splitting',
        affects: 'Chromatic aberration',
        uiElements: ['#visual-glitch']
    },

    lineThickness: {
        type: 'number',
        range: [0.01, 0.1],
        default: 0.02,
        description: 'Grid line width',
        affects: 'Edge rendering',
        uiElements: ['#visual-line']
    }
}
```

---

## 16. SYSTEM ARCHITECTURE DIAGRAMS

### High-Level System Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│  - DOM structure                                            │
│  - CSS styling                                              │
│  - Event listeners                                          │
│  - Initialization script                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ creates
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Choreographer                          │
│  - Main orchestrator                                        │
│  - baseParams storage                                       │
│  - System registry                                          │
│  - Audio management                                         │
└──┬──────┬──────┬──────────────────────────────────┬────────┘
   │      │      │                                   │
   │      │      │                                   │
   ▼      ▼      ▼                                   ▼
┌──────┐ ┌──────┐ ┌──────┐                    ┌────────────┐
│Faceted│ │Quantum│ │Holo  │                    │AudioAnalyzer│
│Engine │ │Engine │ │System│                    │- FFT analysis│
│       │ │       │ │      │                    │- Beat detection│
└───┬───┘ └───┬───┘ └───┬──┘                    │- Choreography │
    │         │         │                       └────────────┘
    │         │         │
    │         │         │
    ▼         ▼         ▼
┌───────────────────────────────────┐
│    CanvasLayerManager             │
│  - 5-layer canvas creation        │
│  - WebGL context management       │
│  - System switching               │
└───────────────┬───────────────────┘
                │
                │ creates
                ▼
┌───────────────────────────────────┐
│         Canvas Layers             │
│  - background-canvas              │
│  - shadow-canvas                  │
│  - content-canvas                 │
│  - highlight-canvas               │
│  - accent-canvas                  │
└───────────────────────────────────┘
```

### Parameter Flow Diagram:

```
┌──────────────────────────────────────────────────────────────┐
│                       UI CONTROLS                            │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  IntegratedControls │  │   VisualsMenu      │            │
│  │  Collapsible        │  │   - Geometry        │            │
│  │  - Universal sliders│  │   - 4D rotations    │            │
│  │  - Core params      │  │   - Color controls  │            │
│  │  - Audio controls   │  │   - System selection│            │
│  └──────────┬──────────┘  └─────────┬───────────┘            │
│             │                       │                        │
│             └───────────┬───────────┘                        │
│                         │                                    │
│                         │ calls setParameter(param, value)   │
│                         ▼                                    │
└────────────────────────────────────────────────────────────-─┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Choreographer.setParameter()                │
│                                                              │
│  1. Update: this.baseParams[param] = value                  │
│  2. Loop through ALL systems                                │
│  3. Update each engine's parameter                          │
└──────────┬──────────────┬──────────────┬─────────────────────┘
           │              │              │
           ▼              ▼              ▼
     ┌─────────┐    ┌─────────┐    ┌─────────┐
     │ Faceted │    │ Quantum │    │  Holo   │
     │  Engine │    │  Engine │    │ System  │
     └────┬────┘    └────┬────┘    └────┬────┘
          │              │              │
          │              │              │
          ▼              ▼              ▼
     parameterManager  parameters     customParams
          │              │              │
          ▼              ▼              ▼
     ┌─────────────────────────────────────┐
     │        updateVisualizers()          │
     │  - Update all visualizer params     │
     │  - Trigger re-render                │
     └─────────────────────────────────────┘
                     │
                     ▼
     ┌─────────────────────────────────────┐
     │         WebGL Shaders               │
     │  - Receive new uniform values       │
     │  - Render with updated parameters   │
     └─────────────────────────────────────┘
```

### System Switching Flow:

```
User clicks "QUANTUM" tab
         │
         ▼
┌────────────────────────────────────┐
│  choreographer.switchSystem()      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  1. destroySystem('faceted')       │
│     ├─ engine.setActive(false)     │
│     ├─ Stop rendering              │
│     ├─ Lose WebGL contexts         │
│     └─ Remove canvases from DOM    │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  2. Update system pointer          │
│     currentSystem = 'quantum'      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  3. createSystem('quantum')        │
│     ├─ Create 5 canvas elements    │
│     ├─ new QuantumEngine()         │
│     ├─ Apply all baseParams        │
│     └─ engine.setActive(true)      │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  4. Update UI                      │
│     ├─ Toggle .active on tabs      │
│     └─ Toggle .active on pills     │
└────────────────────────────────────┘
         │
         ▼
    Quantum system rendering
```

---

## CRITICAL NOTES FOR UI REDESIGN

### What CANNOT be changed:

1. **Choreographer.setParameter() signature** - All UI depends on this
2. **baseParams property names** - Used throughout system
3. **Engine constructor signatures** - Canvas IDs are hardcoded
4. **System names** - 'faceted', 'quantum', 'holographic' are used everywhere
5. **Canvas ID patterns** - Engines expect specific IDs
6. **CanvasLayerManager initialization order** - Must happen before engines
7. **Audio system flow** - MediaElementSourceNode created once
8. **Global variable names** - window.choreographer, window.engine, etc.

### What CAN be changed:

1. **UI component placement** - As long as event handlers stay connected
2. **CSS styling** - Visual appearance only
3. **UI element IDs** - If you update all references
4. **Panel layouts** - Internal structure of controls
5. **Event handler location** - Can move to different files
6. **Display value formatting** - How numbers are shown
7. **Collapsible section structure** - Internal organization

### Testing checklist for UI redesign:

- [ ] All sliders update choreographer.baseParams
- [ ] System switching doesn't break rendering
- [ ] Audio loading creates MediaElementSourceNode only once
- [ ] Parameters persist across system switches
- [ ] Canvas layers are properly layered (z-index)
- [ ] Mobile responsive behavior works
- [ ] Panel collapse/expand preserves state
- [ ] localStorage saves/loads correctly
- [ ] All event listeners are attached
- [ ] No console errors on initialization
- [ ] Audio reactivity works in all systems
- [ ] Extreme mode multiplies audio correctly
- [ ] WebGL contexts are properly cleaned up on system switch

---

**END OF DOCUMENTATION**

**This documentation represents the complete technical architecture of the VIB34D system as of the current codebase. Any UI redesign MUST respect these connections and dependencies to avoid breaking the system.**

---

## 🌟 A Paul Phillips Manifestation

**Send Love, Hate, or Opportunity to:** Paul@clearseassolutions.com
**Join The Exoditical Moral Architecture Movement today:** [Parserator.com](https://parserator.com)

> *"The Revolution Will Not be in a Structured Format"*

---

**© 2025 Paul Phillips - Clear Seas Solutions LLC**
**All Rights Reserved - Proprietary Technology**
