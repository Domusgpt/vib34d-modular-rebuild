# 🔊 Audio Reactivity Research - MVEP Moiré Hypercube Analysis

**Source:** `/mnt/c/Users/millz/VISUAL-CODEX-V2/effects/mvep-moire-hypercube.html`
**Purpose:** Extract advanced audio reactivity patterns for Session 4 implementation
**Status:** Research complete, ready for integration

---

## 🎯 KEY AUDIO REACTIVITY PATTERNS

### **1. Frequency Band Separation (Bass/Mid/High)**

**JavaScript Implementation:**
```javascript
// Audio setup with Web Audio API
async initAudio() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;  // FFT size for frequency analysis
    source.connect(this.analyser);

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.audioEnabled = true;
}

// Frequency band extraction
updateAudio() {
    if (!this.audioEnabled || !this.analyser) return;

    this.analyser.getByteFrequencyData(this.frequencyData);

    // Band boundaries (% of total spectrum)
    const bassEnd = Math.floor(this.frequencyData.length * 0.1);   // 0-10%: Bass
    const midEnd = Math.floor(this.frequencyData.length * 0.4);    // 10-40%: Mids

    let bass = 0, mid = 0, high = 0;

    // Bass frequencies (20-250 Hz typical)
    for (let i = 0; i < bassEnd; i++) {
        bass += this.frequencyData[i];
    }
    bass /= (bassEnd * 255);  // Normalize to 0-1

    // Mid frequencies (250-2000 Hz typical)
    for (let i = bassEnd; i < midEnd; i++) {
        mid += this.frequencyData[i];
    }
    mid /= ((midEnd - bassEnd) * 255);

    // High frequencies (2000+ Hz typical)
    for (let i = midEnd; i < this.frequencyData.length; i++) {
        high += this.frequencyData[i];
    }
    high /= ((this.frequencyData.length - midEnd) * 255);

    this.audioData = { bass, mid, high, pitch: 0 };
}
```

**Key Insights:**
- **FFT Size 256**: Provides 128 frequency bins, good balance of resolution vs performance
- **Band Boundaries**: Bass (0-10%), Mid (10-40%), High (40-100%) of spectrum
- **Normalization**: Divide by (bin count × 255) to get 0-1 range
- **Real-time**: Called every frame in render loop

---

### **2. Audio-Reactive 4D Rotations**

**GLSL Shader Implementation:**
```glsl
// Audio uniforms passed to shader
uniform float u_audioEnabled;
uniform float u_bassLevel;    // 0-1
uniform float u_midLevel;     // 0-1
uniform float u_highLevel;    // 0-1

// Apply audio modulation to 4D rotations
void main() {
    float rotX = u_time * u_rotationSpeed * 0.3;
    float rotY = u_time * u_rotationSpeed * 0.2;
    float rotZ = u_time * u_rotationSpeed * 0.15;

    if (u_audioEnabled > 0.5) {
        rotX += u_bassLevel * 2.0;    // Bass affects XW plane
        rotY += u_midLevel * 1.5;     // Mid affects YW plane
        rotZ += u_highLevel * 1.0;    // High affects ZW plane
    }

    // Apply 4D rotation matrices
    vec4 rotated = rotateXW(rotX) * rotateYW(rotY) * rotateZW(rotZ) * pos4d;
}
```

**Key Insights:**
- **Bass → XW Rotation**: Strongest multiplier (×2.0) for powerful bass response
- **Mid → YW Rotation**: Medium multiplier (×1.5) for balanced mid frequencies
- **High → ZW Rotation**: Lower multiplier (×1.0) for subtle high frequency response
- **Additive**: Audio modulation adds to base rotation speed

---

### **3. Audio-Reactive Moiré Patterns**

**GLSL Implementation:**
```glsl
// Moiré pattern with audio modulation
float generateMoire(vec3 p, float morphFactor, float gridDensity) {
    // Create two overlapping grids with slightly different scales
    float grid1 = hypercubeLattice(p, morphFactor, gridDensity);
    float grid2 = hypercubeLattice(p, morphFactor, gridDensity * u_moireScale);

    // Interference pattern
    return abs(grid1 - grid2) * 0.5;
}

// Apply bass modulation to morph factor
if (u_audioEnabled > 0.5) {
    morphFactor += u_bassLevel * 0.5;  // Bass increases morphing
}

float moirePattern = generateMoire(p, morphFactor, u_gridDensity);
```

**Key Insights:**
- **Dual Grid System**: Two grids with scale difference create interference
- **Moiré Scale**: Typically 1.01 (1% difference) creates subtle patterns
- **Bass Morphing**: Bass frequencies increase morph factor for dramatic shifts
- **Pattern Intensity**: abs(grid1 - grid2) creates visible interference

---

### **4. Audio-Reactive Color Splitting (Glitch Effect)**

**GLSL Implementation:**
```glsl
// RGB channel offset for glitch effect
vec3 applyColorSplitting(vec2 uv, vec3 baseColor) {
    float glitchAmount = u_glitchIntensity;

    // Modulate glitch by high frequencies
    if (u_audioEnabled > 0.5) {
        glitchAmount += u_highLevel * 0.1;
    }

    // Offset each RGB channel differently
    vec2 rOffset = vec2(glitchAmount, glitchAmount * 0.5);
    vec2 gOffset = vec2(-glitchAmount * 0.3, glitchAmount * 0.2);
    vec2 bOffset = vec2(glitchAmount * 0.1, -glitchAmount * 0.4);

    // Sample each channel at different positions
    float r = samplePattern(uv + rOffset).r;
    float g = samplePattern(uv + gOffset).g;
    float b = samplePattern(uv + bOffset).b;

    return vec3(r, g, b);
}
```

**Key Insights:**
- **High Frequency Trigger**: High frequencies increase glitch intensity
- **Channel Separation**: Each RGB channel offset in different directions
- **Chromatic Aberration**: Creates holographic color fringing effect
- **Dynamic Intensity**: Base glitch + audio-reactive component

---

### **5. Audio-Reactive Brightness Modulation**

**GLSL Implementation:**
```glsl
// Overall brightness boost from audio
if (u_audioEnabled > 0.5) {
    finalColor *= (0.8 + u_bassLevel * 0.4 + u_midLevel * 0.3);
}

// Breakdown:
// Base: 0.8 (80% minimum brightness)
// Bass boost: +0.4 max (140% peak)
// Mid boost: +0.3 max (170% peak with both)
```

**Key Insights:**
- **Never Goes Dark**: Minimum 80% brightness maintained
- **Bass Dominance**: Bass contributes more to brightness (40% vs 30%)
- **Additive Boost**: Both frequencies can stack for maximum impact
- **Visual Impact**: Creates pulsing, breathing visual effect

---

## 🎨 INTEGRATION PATTERNS FOR SESSION 4

### **Pattern 1: Sonic Event Detection**

**Concept:** Detect sudden amplitude spikes for triggering visual events
```javascript
updateAudio() {
    // ... existing frequency analysis ...

    // Detect bass hits (sudden increases)
    const bassThreshold = 0.7;
    const bassHit = this.audioData.bass > bassThreshold &&
                    this.audioData.bass > this.prevBass * 1.5;

    if (bassHit) {
        this.triggerBassEvent();  // Flash, pulse, geometry switch
    }

    this.prevBass = this.audioData.bass;
}
```

### **Pattern 2: Extreme Mode Audio Reactivity**

**Concept:** Multiply all audio effects for dramatic visualization
```glsl
// Normal mode
rotX += u_bassLevel * 2.0;

// Extreme mode (user setting)
if (u_extremeMode > 0.5) {
    rotX += u_bassLevel * 10.0;  // 5x multiplier
    morphFactor += u_bassLevel * 2.5;
    glitchAmount += u_highLevel * 0.5;
}
```

### **Pattern 3: Line Thickness Modulation**

**Concept:** Make grid lines pulse with audio (not in MVEP, but suggested)
```glsl
// Line thickness based on mid frequencies
float lineThickness = 0.02 + u_midLevel * 0.1;

// Apply to grid rendering
float gridPattern = smoothstep(lineThickness, lineThickness + 0.01, distanceToGrid);
```

### **Pattern 4: Grid Density Modulation**

**Concept:** Change grid complexity based on audio intensity
```javascript
// JavaScript side parameter control
updateParameters() {
    if (this.audioReactive && this.extremeMode) {
        const avgIntensity = (this.audioData.bass + this.audioData.mid + this.audioData.high) / 3;
        this.baseParams.gridDensity = 12 + avgIntensity * 20;  // 12-32 range
    }
}
```

### **Pattern 5: Moiré Scale Oscillation**

**Concept:** Oscillate moiré scale with mid frequencies for breathing patterns
```javascript
updateParameters() {
    if (this.audioReactive) {
        // Oscillate moiré scale based on mid frequencies
        this.moireScale = 1.01 + Math.sin(this.time + this.audioData.mid * Math.PI) * 0.02;
    }
}
```

---

## 🔧 RECOMMENDED SESSION 4 IMPLEMENTATION PLAN

### **Phase 1: Basic Audio Reactivity Enhancement** ✅ EXISTS
Current choreographer already has:
- Web Audio API integration
- Basic frequency analysis
- Audio-reactive parameters

### **Phase 2: Advanced Frequency Separation** 🎯 NEW
Add MVEP-style bass/mid/high separation:
```javascript
// In Choreographer.js
updateAudioData() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.frequencyData);

    // MVEP pattern: 0-10%, 10-40%, 40-100%
    const bassEnd = Math.floor(this.frequencyData.length * 0.1);
    const midEnd = Math.floor(this.frequencyData.length * 0.4);

    let bass = 0, mid = 0, high = 0;

    for (let i = 0; i < bassEnd; i++) bass += this.frequencyData[i];
    bass /= (bassEnd * 255);

    for (let i = bassEnd; i < midEnd; i++) mid += this.frequencyData[i];
    mid /= ((midEnd - bassEnd) * 255);

    for (let i = midEnd; i < this.frequencyData.length; i++) high += this.frequencyData[i];
    high /= ((this.frequencyData.length - midEnd) * 255);

    this.audioData = { bass, mid, high };
}
```

### **Phase 3: Audio-Reactive 4D Rotations** 🎯 NEW
Add to all three visualizers (Faceted, Quantum, Holographic):
```glsl
// In fragment shaders
uniform float u_bassLevel;
uniform float u_midLevel;
uniform float u_highLevel;

// Apply to 4D rotations
if (u_audioEnabled > 0.5) {
    rot4dXW += u_bassLevel * 2.0;
    rot4dYW += u_midLevel * 1.5;
    rot4dZW += u_highLevel * 1.0;
}
```

### **Phase 4: Moiré Pattern System** 🎯 NEW
Add moiré parameter to UI and shader:
```javascript
// VisualsMenu.js - Add moiré scale control
this.baseParams.moireScale = 1.01;

// Add to renderColorControls():
<div class="control-group">
    <label>Moiré Scale</label>
    <div class="slider-row">
        <input type="range" id="visual-moire" min="0.95" max="1.05" step="0.001" value="1.01">
        <span id="visual-moire-val">1.010</span>
    </div>
</div>
```

### **Phase 5: Glitch/Color Splitting** 🎯 NEW
Add RGB channel offset for holographic effects:
```glsl
// Post-processing pass with color splitting
vec3 applyColorSplit(vec2 uv, vec3 color) {
    float glitch = u_glitchIntensity;
    if (u_audioEnabled > 0.5) {
        glitch += u_highLevel * 0.1;
    }

    vec2 rOff = vec2(glitch, glitch * 0.5);
    vec2 gOff = vec2(-glitch * 0.3, glitch * 0.2);
    vec2 bOff = vec2(glitch * 0.1, -glitch * 0.4);

    // Apply offsets and return split color
    return vec3(r, g, b);
}
```

### **Phase 6: Extreme Mode Toggle** 🎯 NEW
Add UI control for extreme reactivity:
```html
<!-- In Audio Reactivity section -->
<div class="control-group">
    <button id="toggle-extreme-mode" style="width: 100%; margin-top: 5px;">
        EXTREME MODE: OFF
    </button>
</div>
```

---

## 📊 AUDIO REACTIVITY COMPARISON

### **Current System (Choreographer)**
- ✅ Basic frequency analysis (overall amplitude)
- ✅ Parameter modulation (speed, chaos, morph)
- ✅ Choreography modes (dynamic, smooth, aggressive)
- ❌ No bass/mid/high separation
- ❌ No audio-reactive 4D rotations
- ❌ No moiré patterns
- ❌ No glitch effects

### **MVEP System (Target)**
- ✅ Advanced frequency separation (bass/mid/high)
- ✅ Audio-reactive 4D rotations (specific planes)
- ✅ Moiré pattern modulation
- ✅ Color splitting glitch effects
- ✅ Brightness pulsing
- ✅ Real-time microphone input

### **Session 4 Goal**
Integrate MVEP patterns into existing choreographer while maintaining:
- Current UI organization
- Existing choreography modes
- File-based audio (not just microphone)
- Multiple visualizer support

---

## 🎯 SUCCESS CRITERIA FOR SESSION 4

1. **Frequency Separation**: Bass/mid/high analysis implemented
2. **4D Audio Rotation**: Each frequency band affects different 4D plane
3. **Moiré Control**: User-adjustable moiré scale with audio modulation
4. **Glitch Effects**: RGB color splitting triggered by high frequencies
5. **Extreme Mode**: Toggle for 5x multiplier on all audio effects
6. **Line Thickness**: Grid lines pulse with mid frequencies
7. **Sonic Events**: Bass hit detection for sudden visual changes
8. **UI Integration**: All controls in Audio Reactivity section

---

**🌟 A Paul Phillips Manifestation**

**Research Source:** VISUAL-CODEX-V2 MVEP Moiré Hypercube
**Status:** ✅ Analysis Complete - Ready for Session 4 Implementation
**Dev Server:** http://localhost:8766/vib34d-modular-rebuild/
**Branch:** `ui-refinement-polish`
