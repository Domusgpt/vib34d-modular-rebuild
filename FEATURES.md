# VIB34D Enhanced Features Guide

**Complete guide to all enhanced features in the modular rebuild**

---

## 🚀 Quick Start

1. **Load the application:** http://localhost:8765/vib34d-timeline-dev/
2. **Press `/`** to see all keyboard shortcuts
3. **Click 📊** (top-left) to view performance stats
4. **Select a preset** from the dropdown for instant configurations
5. **Use keyboard shortcuts** for power-user workflow

---

## 📊 Performance Monitoring

### Overview
Real-time performance tracking with automatic optimization suggestions.

### Features
- **Live FPS tracking** - See current and average FPS
- **Frame time monitoring** - Detect performance bottlenecks
- **Render time analysis** - Measure visualization overhead
- **Performance grading** - A-F grade based on FPS
- **Status indicators** - Excellent/Good/Poor/Critical
- **GPU stall detection** - Warns about ReadPixels operations
- **Optimization suggestions** - Automatic recommendations

### Usage
- **Toggle display:** Press `P` or click 📊 button (top-left)
- **View metrics:**
  - FPS: Current frames per second
  - Frame Time: Time per frame in milliseconds
  - Render Time: Time spent rendering visualizers
  - Active Visualizers: Number of running visualizers
  - Canvases: Number of active canvas layers
  - Grade: Overall performance grade (A-F)
  - Status: Current performance state

### Performance Grades
- **A:** 55+ FPS - Excellent performance
- **B:** 45-54 FPS - Good performance
- **C:** 35-44 FPS - Acceptable performance
- **D:** 25-34 FPS - Poor performance (optimization needed)
- **F:** < 25 FPS - Critical (reduce quality settings)

### Optimization Tips
When performance is poor:
1. Switch to **Faceted** system (lightest)
2. Reduce **Grid Density** (fewer particles)
3. Lower **Intensity** (less rendering load)
4. Disable some canvas layers
5. Reduce **Chaos** parameter

---

## 🎨 Preset System

### Overview
8 built-in presets for different music styles, plus custom preset saving.

### Built-in Presets

#### 1. **Chill Ambient**
- System: Holographic
- Mode: Flow
- Best for: Ambient, downtempo, chill electronic
- Settings: Smooth motion, low intensity, oceanic colors

#### 2. **EDM Drop**
- System: Quantum
- Mode: Chaos
- Best for: Drops, heavy bass sections, dubstep
- Settings: Intense chaos, high speed, fire colors

#### 3. **Techno Pulse**
- System: Faceted
- Mode: Pulse
- Best for: Techno, house, beat-driven music
- Settings: Rhythmic pulse, neon colors, beat-locked

#### 4. **Progressive Build**
- System: Quantum
- Mode: Build
- Best for: Buildups, crescendos, progressive tracks
- Settings: Gradually intensifying, linear sweeps

#### 5. **Glitch Experimental**
- System: Holographic
- Mode: Glitch
- Best for: IDM, glitch-hop, experimental electronic
- Settings: Stuttering, high chaos, glitchy visuals

#### 6. **Liquid DnB**
- System: Faceted
- Mode: Liquid
- Best for: Liquid drum & bass, fluid bass music
- Settings: Organic morphing, triangle/sine sweeps

#### 7. **Minimal Deep**
- System: Holographic
- Mode: Wave
- Best for: Deep house, minimal techno
- Settings: Subtle, minimalist, slow motion

#### 8. **Hard Strobe**
- System: Quantum
- Mode: Strobe
- Best for: Hard techno, industrial, aggressive EDM
- Settings: Extreme flashing, maximum intensity

### Custom Presets

#### Save Current State
1. Adjust parameters to your liking
2. Click **💾 Save Current** button
3. Enter a name for your preset
4. Preset is saved to localStorage

#### Apply Preset
1. Open preset dropdown
2. Select a preset
3. Instant configuration switch

#### Import/Export
```javascript
// Export all presets
choreographer.presetManager.exportPresets();

// Import presets from file
const file = document.querySelector('input[type="file"]').files[0];
await choreographer.presetManager.importPresets(file);
```

---

## ⌨️ Keyboard Shortcuts

### Playback Controls
| Key | Action |
|-----|--------|
| `Space` | Play/Pause audio |
| `S` | Stop playback |

### System Switching
| Key | Action |
|-----|--------|
| `1` | Switch to Faceted system |
| `2` | Switch to Quantum system |
| `3` | Switch to Holographic system |

### Choreography Modes
| Key | Action |
|-----|--------|
| `Shift+1` | Chaos mode |
| `Shift+2` | Pulse mode |
| `Shift+3` | Wave mode |
| `Shift+4` | Flow mode |
| `Shift+5` | Dynamic mode |

### Parameter Adjustments
| Key | Action |
|-----|--------|
| `↑` | Increase intensity |
| `↓` | Decrease intensity |
| `→` | Increase speed |
| `←` | Decrease speed |
| `]` | Increase grid density |
| `[` | Decrease grid density |
| `=` or `+` | Increase chaos |
| `-` | Decrease chaos |

### Audio Reactivity
| Key | Action |
|-----|--------|
| `R` | Toggle audio reactivity on/off |
| `Shift+R` | Increase reactivity strength |
| `Ctrl+R` | Decrease reactivity strength |

### Export/Recording
| Key | Action |
|-----|--------|
| `E` | Start/Stop export (when implemented) |
| `Shift+E` | Take screenshot |

### View Controls
| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `H` | Toggle UI visibility |
| `P` | Toggle performance monitor |

### Utility
| Key | Action |
|-----|--------|
| `Ctrl+S` | Save current state as preset |
| `Ctrl+Z` | Undo last change (when implemented) |
| `Esc` | Cancel/Close dialogs |
| `/` or `?` | Show keyboard shortcuts help |

---

## 🎛️ Parameter Controls

### Real-time Sliders

#### Intensity (0.0 - 1.0)
- Controls overall visual brightness/presence
- Higher = more vibrant, lower = subtle
- Keyboard: `↑` `↓`

#### Speed (0.1 - 5.0)
- Animation speed multiplier
- Higher = faster motion, lower = slower
- Keyboard: `→` `←`

#### Chaos (0.0 - 1.0)
- Randomness and unpredictability
- Higher = more chaotic, lower = ordered
- Keyboard: `+` `-`

#### Grid Density (1 - 50)
- Number of particles/elements
- Higher = more detail (slower), lower = simpler (faster)
- Keyboard: `]` `[`

#### Hue (0 - 360)
- Base color hue value
- Full spectrum of colors
- Direct slider control only

#### Saturation (0.0 - 1.0)
- Color saturation intensity
- Higher = vivid colors, lower = muted
- Direct slider control only

### How to Use
1. **Mouse:** Drag sliders left/right
2. **Keyboard:** Use shortcuts for quick adjustments
3. **Precision:** Use sliders for exact values
4. **Real-time:** Changes apply immediately

---

## 🌐 System Features

### Faceted System (VIB34DIntegratedEngine)
- **Performance:** Lightest (best for lower-end hardware)
- **Style:** Geometric, faceted, crystalline
- **Layers:** 5-layer holographic rendering
- **Best For:** Precise geometric visuals, performance

### Quantum System (QuantumEngine)
- **Performance:** Medium (balanced)
- **Style:** Particle lattice, quantum effects
- **Layers:** 5-layer particle system
- **Best For:** Particle effects, glowing visuals

### Holographic System (RealHolographicSystem)
- **Performance:** Heaviest (requires good GPU)
- **Style:** Volumetric, holographic, 3D depth
- **Layers:** 5-layer volumetric rendering
- **Best For:** Cinematic visuals, depth

### 5-Layer Architecture
Each system uses 5 layered canvases:
1. **Background** - Base layer (reactivity: 0.4-0.5)
2. **Shadow** - Shadow effects (reactivity: 0.6-0.7)
3. **Content** - Main rendering (reactivity: 0.9-1.0)
4. **Highlight** - Bright highlights (reactivity: 1.1-1.3)
5. **Accent** - Top accents (reactivity: 1.5-1.6)

---

## 🎵 Choreography Modes

### 1. Chaos
- **Use:** Drops, breakdowns, heavy sections
- **Behavior:** Intense, unpredictable multi-parameter modulation
- **Audio Response:** Maximum reactivity to all frequencies

### 2. Pulse
- **Use:** House, techno, strong beats
- **Behavior:** Rhythmic beat-locked pumping motion
- **Audio Response:** Beat-synced intensity changes

### 3. Wave
- **Use:** Ambient, chill, progressive builds
- **Behavior:** Smooth flowing oceanic motion
- **Audio Response:** Gentle wave-like modulation

### 4. Flow
- **Use:** Quiet sections, intros, ambience
- **Behavior:** Gentle meditative minimal reactivity
- **Audio Response:** Subtle, continuous movement

### 5. Dynamic (Default)
- **Use:** General use, unknown sections
- **Behavior:** Balanced responsive musical adaptation
- **Audio Response:** Adaptive to music energy

### 6. Strobe
- **Use:** Aggressive EDM, hard techno
- **Behavior:** Extreme beat-locked flashing and snapping
- **Audio Response:** Sharp, strobing intensity changes

### 7. Glitch
- **Use:** Experimental, glitch-hop, IDM
- **Behavior:** Intentional artifacts and stuttering
- **Audio Response:** Erratic, glitchy parameter jumps

### 8. Build
- **Use:** Pre-drop buildups, crescendos
- **Behavior:** Progressive intensity increase
- **Audio Response:** Gradually increasing energy

### 9. Breakdown
- **Use:** Filter sweeps, ambient interludes
- **Behavior:** Post-drop atmospheric calm
- **Audio Response:** Decreasing energy, relaxation

### 10. Liquid
- **Use:** Liquid DnB, fluid bass
- **Behavior:** Fluid organic morphing textures
- **Audio Response:** Smooth, flowing transitions

---

## 💾 State Management

### Auto-Save
- Custom presets auto-save to localStorage
- Survives browser refresh
- Per-domain storage

### Export/Import
```javascript
// Export current configuration
choreographer.presetManager.exportPresets();
// Downloads JSON file

// Import configuration
// Use file input to load JSON
```

### Browser Console Access
```javascript
// Access choreographer
window.choreographer

// Access enhanced controls
window.enhancedControls

// Get performance stats
window.choreographer.performanceMonitor.getReport()

// Apply preset programmatically
window.choreographer.presetManager.applyPreset('edm-drop')

// Get current parameters
window.choreographer.baseParams
```

---

## 🐛 Troubleshooting

### Low FPS
1. Check performance monitor (Press `P`)
2. Switch to Faceted system (Press `1`)
3. Reduce grid density (Press `[` multiple times)
4. Lower intensity (Press `↓` multiple times)

### UI Not Responding
1. Check browser console for errors
2. Refresh page (F5)
3. Clear localStorage: `localStorage.clear()`

### Keyboard Shortcuts Not Working
1. Make sure you're not focused in an input field
2. Click on the canvas area
3. Refresh page

### Presets Not Saving
1. Check localStorage is enabled
2. Browser may be in private/incognito mode
3. Clear space: `localStorage.clear()`

---

## 🌟 Tips & Tricks

### Power User Workflow
1. Use `Space` for instant play/pause
2. Press `/` to learn all shortcuts
3. Use number keys `1-3` to quickly switch systems
4. Adjust parameters with arrow keys for precision
5. Press `H` to hide UI for clean visuals
6. Press `F` for fullscreen immersion

### Best Performance
1. Start with **Faceted** system
2. Keep grid density **< 20**
3. Reduce chaos to **< 0.3**
4. Monitor with `P` key
5. Target **Grade B** or better

### Creative Tips
1. Try **Glitch Experimental** for unique visuals
2. Use **Liquid DnB** for smooth flowing effects
3. **Hard Strobe** creates intense club vibes
4. Mix manual parameter control with presets
5. Save your favorite configurations

---

**🌟 A Paul Phillips Manifestation**

For questions or feature requests: Paul@clearseassolutions.com

© 2025 Paul Phillips - Clear Seas Solutions LLC
