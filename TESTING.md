# VIB34D Modular Rebuild - Testing Guide

## 🧪 Smart 5-Layer Canvas Management System

### What's Been Implemented

The system now includes a **smart 5-layer canvas management system** that properly handles:

1. **Dynamic Canvas Creation** - 5 canvases per visualization system
2. **Proper Canvas IDs** - System-specific naming (faceted, quantum-*, holo-*)
3. **Smart Destruction** - WebGL context cleanup to prevent memory leaks
4. **System Switching** - Clean transitions between visualization systems

### Test The System

#### Open the Application

```bash
cd /mnt/c/Users/millz/vib34d-modular-rebuild
npm run dev
```

Visit: **http://localhost:8766/vib34d-modular-rebuild/**

---

## ✅ Test Checklist

### 1. Initial Load Test

**What to check:**
- [ ] Application loads without errors
- [ ] "Choreographer ready!" message appears in status log
- [ ] 5 canvases created for faceted system (check browser DevTools Elements tab)
- [ ] Canvas IDs are correct:
  - `background-canvas`
  - `shadow-canvas`
  - `content-canvas`
  - `highlight-canvas`
  - `accent-canvas`
- [ ] Test visualizers rendering animated patterns (geometric lines)

**Expected:** Faceted system initializes with 5 canvases showing animated geometric lines

---

### 2. System Switching Test

**Steps:**
1. Click **QUANTUM** pill in control panel
2. Wait for system switch
3. Check browser DevTools Elements tab

**What to check:**
- [ ] Old faceted canvases destroyed (no longer in DOM)
- [ ] 5 new quantum canvases created with correct IDs:
  - `quantum-background-canvas`
  - `quantum-shadow-canvas`
  - `quantum-content-canvas`
  - `quantum-highlight-canvas`
  - `quantum-accent-canvas`
- [ ] Test visualizers rendering particle dots
- [ ] No WebGL context errors in console
- [ ] Memory usage stable (check browser Task Manager)

**Expected:** Clean switch from faceted to quantum with no memory leaks

---

### 3. Multiple System Switches Test

**Steps:**
1. Switch: Faceted → Quantum
2. Wait 2 seconds
3. Switch: Quantum → Holographic
4. Wait 2 seconds
5. Switch: Holographic → Faceted
6. Wait 2 seconds
7. Repeat 3-5 times

**What to check:**
- [ ] Each switch cleans up old canvases
- [ ] Each switch creates new canvases with correct IDs
- [ ] No canvas duplication in DOM
- [ ] No WebGL context warnings in console
- [ ] Memory usage remains stable (doesn't grow continuously)
- [ ] Animations remain smooth throughout

**Expected:** Stable system switching with proper cleanup

---

### 4. Browser DevTools Inspection

#### Elements Tab

**Check canvas structure:**
```html
<div id="stage-container">
  <div id="facetedLayers" class="canvas-layer-system">
    <canvas id="background-canvas"></canvas>
    <canvas id="shadow-canvas"></canvas>
    <canvas id="content-canvas"></canvas>
    <canvas id="highlight-canvas"></canvas>
    <canvas id="accent-canvas"></canvas>
  </div>
</div>
```

**For quantum system:**
```html
<div id="quantumLayers" class="canvas-layer-system">
  <canvas id="quantum-background-canvas"></canvas>
  <!-- ... 4 more quantum canvases -->
</div>
```

**For holographic system:**
```html
<div id="holographicLayers" class="canvas-layer-system">
  <canvas id="holo-background-canvas"></canvas>
  <!-- ... 4 more holo canvases -->
</div>
```

#### Console Tab

**Look for these messages:**

**On initial load:**
```
🎬 Initializing Choreographer...
✅ Canvas layer manager initialized
🔧 Creating faceted system...
✅ Created layer 1/5: background-canvas (background)
✅ Created layer 2/5: shadow-canvas (shadow)
✅ Created layer 3/5: content-canvas (content)
✅ Created layer 4/5: highlight-canvas (highlight)
✅ Created layer 5/5: accent-canvas (accent)
🎨 Created 5-layer system for: faceted
🎯 VIB34DIntegratedEngine stub created
✅ Test visualizer 1 started on canvas: background-canvas
[... more visualizers ...]
✅ Choreographer ready!
```

**On system switch:**
```
🔄 Switching from faceted to quantum...
🗑️ Destroying faceted system...
🧹 Destroying 5 layers for: faceted
🧹 Lost WebGL context for layer 1
[... more context losses ...]
✅ Destroyed all layers for: faceted
✅ faceted destroyed with proper WebGL context cleanup
🔧 Creating quantum system...
[... quantum creation ...]
✅ Switched from faceted to quantum with proper layer cleanup
```

**NO errors like:**
- ❌ "WebGL context lost"
- ❌ "Failed to create WebGL context"
- ❌ "Canvas not found"
- ❌ "Too many active WebGL contexts"

---

### 5. Memory Leak Test

**Steps:**
1. Open browser Task Manager (Chrome: Shift+Esc)
2. Find the VIB34D tab
3. Note initial memory usage
4. Switch systems 20 times: Faceted → Quantum → Holo → repeat
5. Check final memory usage

**What to check:**
- [ ] Memory usage increases initially (expected)
- [ ] Memory usage stabilizes after first few switches
- [ ] Memory doesn't continuously grow with each switch
- [ ] No "Out of memory" errors

**Expected:** Memory usage stabilizes around 100-200MB and doesn't continuously grow

---

### 6. Audio Integration Test (Future)

**Steps:**
1. Load an audio file
2. Play audio
3. Switch systems during playback

**What to check:**
- [ ] Audio continues playing during system switch
- [ ] Visualizers respond to audio after switch
- [ ] No audio context errors

**Status:** Audio integration pending (audio file upload works, but not yet driving visualizers)

---

## 🐛 Known Issues to Verify Fixed

### Memory Leaks (FIXED ✅)
- **Before:** WebGL contexts accumulated when switching systems
- **After:** Contexts properly lost with `WEBGL_lose_context` extension
- **Test:** Switch systems 20 times, check memory stability

### Canvas Duplication (FIXED ✅)
- **Before:** Old canvases remained in DOM when switching
- **After:** CanvasLayerManager removes old canvases before creating new ones
- **Test:** Inspect DOM after switching, verify only 5 canvases exist

### Incorrect Canvas IDs (FIXED ✅)
- **Before:** Generic canvas IDs caused engine initialization failures
- **After:** System-specific IDs (faceted, quantum-*, holo-*)
- **Test:** Check canvas IDs in Elements tab for each system

---

## 📊 Performance Benchmarks

### Target Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Initial Load | < 3s | DevTools Network tab |
| System Switch | < 500ms | Console timestamps |
| FPS (idle) | 60 fps | Browser DevTools Performance tab |
| Memory Stable | < 250MB | Browser Task Manager after 20 switches |
| WebGL Contexts | ≤ 5 active | No "too many contexts" errors |

---

## 🔍 Debug Commands

### Browser Console

```javascript
// Check current canvas manager state
window.choreographer.canvasManager

// Check active layers
window.choreographer.canvasManager.activeLayers

// Check current system
window.choreographer.currentSystem

// Check system engines
window.choreographer.systems.faceted
window.choreographer.systems.quantum
window.choreographer.systems.holographic

// Force system switch
await window.choreographer.switchSystem('quantum')

// Check canvas count in DOM
document.querySelectorAll('canvas').length  // Should be 5
```

---

## 🚀 Next Steps

After verifying all tests pass:

1. **Integrate Real Engines** - Replace stub engines with actual VIB34DIntegratedEngine, QuantumEngine, RealHolographicSystem
2. **Audio Reactivity** - Connect AudioAnalyzer to drive visualizer parameters
3. **AI Choreography** - Implement full AI sequence generation
4. **Video Export** - Connect RecordingEngine with canvas capture

---

## 📝 Report Issues

If you encounter issues:

1. **Capture console output** (all errors and warnings)
2. **Take screenshots** of DevTools Elements tab showing canvas structure
3. **Note memory usage** before and after system switches
4. **List reproduction steps**

---

**Test completed:** _______________
**Tester:** _______________
**Pass/Fail:** _______________
**Notes:** _______________

---

🌟 **A Paul Phillips Manifestation**
**Send Love, Hate, or Opportunity to:** Paul@clearseassolutions.com
**Join The Exoditical Moral Architecture Movement today:** [Parserator.com](https://parserator.com)

> *"The Revolution Will Not be in a Structured Format"*

© 2025 Paul Phillips - Clear Seas Solutions LLC
All Rights Reserved - Proprietary Technology
