# Testing Guide for Enhanced Features

## 🔍 Quick Testing Checklist

After loading `http://localhost:8765/vib34d-timeline-dev/`:

### 1. **UI Components Visibility**
- [ ] **Performance Monitor Button** (📊) - Should appear at top-left corner
- [ ] **Mode Display** - Should appear at bottom-left corner (moved from top-left to avoid overlap)
- [ ] **Control Panel** - Should appear at top-right
- [ ] **Preset Selector** - Should appear in control panel after "VISUALIZATION SYSTEM" section
- [ ] **Parameter Sliders** - Should appear before "STATUS LOG" section

### 2. **Browser Console Check**
Open DevTools Console (F12) and look for:
```
✅ Should see:
🎛️ Initializing EnhancedControls...
  📊 Creating performance display...
  🎨 Creating preset selector...
  🎛️ Creating parameter controls...
  ⏱️ Setting up update loop...
✅ EnhancedControls initialized: {...}

❌ Should NOT see:
❌ Preset selector missing! Check control panel structure
❌ Parameter sliders missing! Check control panel structure
```

### 3. **Performance Monitor Test**
- [ ] Click 📊 button in top-left
- [ ] Performance display should slide out showing:
  - FPS
  - Frame Time
  - Render Time
  - Visualizers count
  - Canvases count
  - Grade (A-F)
  - Status

### 4. **Preset Selector Test**
- [ ] Find "🎨 PRESETS" section in control panel
- [ ] Dropdown should have options:
  - "-- Select Preset --"
  - Built-in Presets group (8 presets)
  - Custom Presets group (if any saved)
- [ ] Select "EDM Drop" preset
- [ ] Visual should change to Quantum system with chaotic motion

### 5. **Parameter Sliders Test**
- [ ] Find "🎛️ PARAMETERS" section in control panel
- [ ] Should see 6 sliders:
  - Intensity (0.0-1.0)
  - Speed (0.1-5.0)
  - Chaos (0.0-1.0)
  - Grid Density (1-50)
  - Hue (0-360)
  - Saturation (0.0-1.0)
- [ ] Drag a slider - value should update in real-time
- [ ] Visual should change immediately

### 6. **Keyboard Shortcuts Test**
- [ ] Press `/` - Should show keyboard shortcuts help modal
- [ ] Press `1` - Should switch to Faceted system
- [ ] Press `2` - Should switch to Quantum system
- [ ] Press `3` - Should switch to Holographic system
- [ ] Press `↑` - Should increase intensity
- [ ] Press `↓` - Should decrease intensity
- [ ] Press `Space` - Should play/pause (if audio loaded)
- [ ] Press `P` - Should toggle performance monitor
- [ ] Press `H` - Should hide UI

## 🐛 Troubleshooting

### Issue: Preset selector not appearing
**Check:**
1. Open browser console
2. Look for error: "❌ Preset selector missing!"
3. Check if element exists: `document.getElementById('preset-selector')`

**Fix:**
- Refresh page (F5)
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Performance monitor button missing
**Check:**
1. Look at top-left corner of page
2. Button should be visible even if mode-display is there (mode-display moved to bottom-left)

**Fix:**
- Check z-index: Performance button should be z-index 199
- Mode display should be at bottom-left now

### Issue: Keyboard shortcuts not working
**Check:**
1. Make sure you're not focused in an input field
2. Click on the black canvas area
3. Try pressing `/` for help

**Fix:**
- Click on canvas area to focus
- Avoid typing in input fields

### Issue: Sliders not updating visuals
**Check:**
1. Open console
2. Try dragging intensity slider
3. Look for console log showing value change

**Fix:**
- Refresh page
- Check if choreographer is initialized: `window.choreographer`

## 📊 Expected Behavior

### On Page Load:
```
[Browser Console Output]
🎬 Initializing Choreographer...
🎛️ Initializing EnhancedControls...
  📊 Creating performance display...
  🎨 Creating preset selector...
  🎛️ Creating parameter controls...
📊 Found 6 control groups
✅ Preset selector inserted after VISUALIZATION SYSTEM
✅ Parameter controls inserted before STATUS LOG
✅ EnhancedControls initialized: {
  perfDisplay: true,
  presetSelector: true,
  intensitySlider: true,
  speedSlider: true,
  chaosSlider: true
}
```

### Performance Monitor (after clicking 📊):
```
📊 PERFORMANCE
FPS: 60
Frame Time: 16.67ms
Render Time: 8.23ms
Visualizers: 5
Canvases: 5
Grade: A
Status: excellent
```

### Preset Selection:
```
[Console when selecting "EDM Drop"]
🎨 Applying preset: edm-drop
Switching to quantum system...
✅ Switched to quantum
```

## 📸 Visual Reference

### Layout After Fixes:
```
┌─────────────────────────────────────────────────┐
│ [📊] ← Performance Button (top-left)             │
│                                                  │
│                                     ┌──────────┐│
│                                     │ CONTROL  ││
│        [BLACK CANVAS AREA]          │ PANEL    ││
│        (visualizations here)        │          ││
│                                     │ 🎨 PRESE ││
│                                     │ 🎛️ PARAM ││
│                                     │ 📊 STATUS││
│                                     └──────────┘│
│ ┌────────────┐                                  │
│ │ MODE       │ ← Mode Display (bottom-left)     │
│ │ DISPLAY    │                                  │
│ └────────────┘                                  │
└─────────────────────────────────────────────────┘
```

## ✅ Success Criteria

All enhancements are working if:
- ✅ Performance monitor button visible and clickable
- ✅ Performance display shows real FPS data
- ✅ Preset dropdown has 8+ options
- ✅ Presets change visualization when selected
- ✅ 6 parameter sliders visible and functional
- ✅ Sliders update visuals in real-time
- ✅ Keyboard shortcuts respond correctly
- ✅ `/` shows help modal
- ✅ No errors in browser console
- ✅ Mode display at bottom-left (not overlapping perf monitor)

## 🔧 Manual Console Tests

Open browser console and run:

```javascript
// Check choreographer
console.log('Choreographer:', window.choreographer);

// Check enhanced controls
console.log('Enhanced Controls:', window.enhancedControls);

// Check preset manager
console.log('Presets:', window.choreographer.presetManager.getPresetList());

// Check performance monitor
console.log('Performance:', window.choreographer.performanceMonitor.getSummary());

// Apply preset manually
window.choreographer.presetManager.applyPreset('edm-drop');

// Check keyboard controller
console.log('Shortcuts:', Object.keys(window.choreographer.keyboardController.shortcuts));
```

---

**If all tests pass, the enhancements are working correctly!**

**If tests fail, check:**
1. Browser console for error messages
2. Network tab for failed resource loads
3. Vite dev server for build errors
4. This guide's troubleshooting section
