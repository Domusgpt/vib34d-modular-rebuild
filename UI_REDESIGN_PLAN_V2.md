# VIB34D UI REDESIGN PLAN V2 - Multiple Collapsible Panels

**CORRECTED DESIGN** based on user feedback

---

## WHAT THE USER ACTUALLY WANTS

### 1. Multiple Collapsible Panels (NOT one unified panel)
- **MORE than 2 panels** (not less)
- Each panel is an independent collapsible/draggable unit
- Each panel contains TABS for sub-organization
- Abstract functionality into logical groups

### 2. XY Touchpad
- ✅ Keep it with dropdowns
- ✅ Give it its own expandable tab/panel
- ✅ **CRITICAL NEW FEATURE**: Canvas itself acts as invisible touchpad
  - No visible UI on canvas
  - Touch/click on visualizer = XY control
  - Follows cursor position on canvas
  - Updates parameters in real-time

### 3. Status Display
- As small as possible
- One-time display, then get out of the way
- Minimal corner badge

### 4. Keep ALL Parameters
- Don't remove ANY functionality
- Just organize better
- Make everything more elegant
- Better visual presentation

---

## NEW PANEL ARCHITECTURE

### Panel Layout (5+ Independent Collapsible Panels)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎬 VIB34D  [📁 LOAD AUDIO]  [FACETED▼] [QUANTUM] [HOLO]  │ ← Top Bar (unchanged)
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│ 🎛️ CORE PARAMS  │← Panel 1           │ 🎨 VISUAL STYLE │← Panel 2
│ [−] [↔] [⚙️]    │  (Right side)       │ [−] [↔] [⚙️]    │  (Right side)
│──────────────────│                    │──────────────────│
│ [Geometry] Shape │← Tab 1             │ [Color] Effects  │← Tab 1
│ ═══════════      │                    │ ═══════════      │
│  Geometry  [12]  │                    │  Hue      [180°] │
│  ●━━━━━○━━━━●   │                    │  ●━━━━○━━━━━●   │
│  Density   [50]  │                    │  Intensity [0.5] │
│  ●━━━━━○━━━━●   │                    │  ●━━━○━━━━━●   │
│  Morph     [1.2] │                    │  Saturation [0.8]│
│  ●━━━━○━━━━━●   │                    │  ●━━━━━○━━━●   │
└──────────────────┘                    │  [Effects] tab2  │
                                        │  Moiré    [1.01] │
┌──────────────────┐                    │  Glitch   [0.05] │
│ 🎯 XY CONTROL   │← Panel 3           │  Line     [0.02] │
│ [−] [↔] [⚙️]    │  (Expandable)       └──────────────────┘
│──────────────────│
│ X: [Speed    ▼] │                    ┌──────────────────┐
│ Y: [Density  ▼] │                    │ 🔄 TRANSFORM     │← Panel 4
│──────────────────│                    │ [−] [↔] [⚙️]    │
│                  │                    │──────────────────│
│        ●         │← Cursor            │ [4D Rotation]    │
│                  │                    │  XW  [0.00]      │
│                  │                    │  ●━━○━━━━━●     │
│ 2x tap: Cycle    │                    │  YW  [0.00]      │
└──────────────────┘                    │  ●━━○━━━━━●     │
                                        │  ZW  [0.00]      │
┌──────────────────┐                    │  ●━━○━━━━━●     │
│ 🎵 AUDIO        │← Panel 5           │ [Reset All]      │
│ [−] [↔] [⚙️]    │                    └──────────────────┘
│──────────────────│
│ [Input] Reactive │← Tab 1
│ ═══════════      │
│ 📁 song.mp3      │
│ [▶ Play]         │
│ 🔊 ON  [●━○━━]  │← Reactivity 0.5
│ ⚡ Extreme OFF   │
│ Mode: [Dynamic▼] │
└──────────────────┘

                    ┌───────────────┐
                    │ FACETED 🔊 ⚡ │← Status (corner)
                    └───────────────┘
```

---

## PANEL BREAKDOWN

### Panel 1: CORE PARAMETERS 🎛️
**Location:** Right side, top
**Collapsible:** Yes
**Draggable:** Yes (by header)
**localStorage:** Position, size, collapsed state

#### Tabs:
**Tab 1: [Geometry]**
- Geometry Type (1-24) - Dropdown with names
- Grid Density (1-100)
- Morph Factor (0-5)
- Line Thickness (0.01-0.1)

**Tab 2: [Motion]**
- Speed (0.1-10)
- Chaos (0-3)

---

### Panel 2: VISUAL STYLE 🎨
**Location:** Right side, below Panel 1
**Collapsible:** Yes
**Draggable:** Yes

#### Tabs:
**Tab 1: [Color]**
- Hue (0-360) with color wheel preview
- Intensity (0-1)
- Saturation (0-1)

**Tab 2: [Effects]**
- Moiré Scale (0.95-1.05)
- Glitch Intensity (0-0.2)

---

### Panel 3: XY CONTROL 🎯
**Location:** Right side OR floating
**Collapsible:** Yes (collapses to small tab)
**Draggable:** Yes

#### Content:
- X-axis parameter dropdown (14 options)
- Y-axis parameter dropdown (14 options)
- 240px × 240px touch surface
- Cursor indicator
- "2x tap: Cycle Geometry" hint

---

### Panel 4: TRANSFORM 🔄
**Location:** Right side, below Panel 2
**Collapsible:** Yes
**Draggable:** Yes

#### Tabs:
**Tab 1: [4D Rotation]**
- XW Plane (-π to π)
- YW Plane (-π to π)
- ZW Plane (-π to π)
- [Reset All Rotations] button

---

### Panel 5: AUDIO 🎵
**Location:** Right side OR left side
**Collapsible:** Yes
**Draggable:** Yes

#### Tabs:
**Tab 1: [Input]**
- Current file display
- [📁 Load Audio] button
- [▶ Play] / [⏸ Pause] button

**Tab 2: [Reactive]**
- Audio Reactive toggle (ON/OFF)
- Reactivity Strength (0-1) slider
- Extreme Mode toggle
- Choreography Mode dropdown

**Tab 3: [Status]**
- Last 5 status messages (scrollable)

---

### Panel 6: ADVANCED (Optional - User can add more)
**Location:** Anywhere user drags it
**Could contain:**
- Universal sliders (if user wants them)
- Preset system
- Export/import controls
- Performance monitor

---

## CRITICAL NEW FEATURE: Canvas Touch Control

### Invisible Canvas Touchpad
**What it does:** The main visualizer canvas acts as a touch/mouse control

#### Implementation:
```javascript
// In main.js or new CanvasTouchControl.js

class CanvasTouchControl {
  constructor(canvasElement, choreographer, xyTouchpad) {
    this.canvas = canvasElement;
    this.choreographer = choreographer;
    this.xyTouchpad = xyTouchpad; // Reference to XY touchpad for parameter mapping
    this.enabled = true; // Can be toggled

    this.attachListeners();
  }

  attachListeners() {
    // Mouse/Touch move on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;  // 0-1
      const y = 1 - ((e.clientY - rect.top) / rect.height); // 0-1 (inverted)

      this.updateParameters(x, y);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.enabled) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = 1 - ((touch.clientY - rect.top) / rect.height);

      this.updateParameters(x, y);
    });

    // Double-tap for geometry cycling
    let lastTap = 0;
    this.canvas.addEventListener('click', (e) => {
      const now = performance.now();
      if (now - lastTap < 300) {
        this.cycleGeometry();
      }
      lastTap = now;
    });
  }

  updateParameters(x, y) {
    // Get current X/Y parameter assignments from XY touchpad
    const xParam = this.xyTouchpad.xParam; // e.g., 'speed'
    const yParam = this.xyTouchpad.yParam; // e.g., 'gridDensity'

    // Get parameter configs for range mapping
    const xConfig = this.xyTouchpad.paramConfigs[xParam];
    const yConfig = this.xyTouchpad.paramConfigs[yParam];

    // Map 0-1 normalized values to parameter ranges
    const xValue = xConfig.min + (x * (xConfig.max - xConfig.min));
    const yValue = yConfig.min + (y * (yConfig.max - yConfig.min));

    // Round if integer parameter
    const xFinal = xConfig.step >= 1 ? Math.round(xValue) : xValue;
    const yFinal = yConfig.step >= 1 ? Math.round(yValue) : yValue;

    // Update choreographer
    this.choreographer.setParameter(xParam, xFinal);
    this.choreographer.setParameter(yParam, yFinal);

    // OPTIONAL: Show subtle visual feedback on canvas
    // Could draw a small cursor dot that fades quickly
    this.showCursorFeedback(x, y);
  }

  showCursorFeedback(x, y) {
    // Optional: Draw small cyan dot at cursor position that fades
    // This would need canvas 2D context overlay
    // OR use a floating div that follows cursor
  }

  cycleGeometry() {
    const current = this.choreographer.baseParams.geometry;
    const next = (current % 24) + 1;
    this.choreographer.setParameter('geometry', next);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Initialize in main.js:
const canvasTouchControl = new CanvasTouchControl(
  document.querySelector('.canvas-layer'), // Any of the 5 canvases
  choreographer,
  xyTouchpad
);

// Add toggle button somewhere (optional):
// "Canvas Touch: [ON]" button that calls canvasTouchControl.toggle()
```

#### Visual Feedback Options:
**Option A: No Visible Feedback** (Pure invisible control)
- Just updates parameters
- User sees changes in visualization itself

**Option B: Subtle Cursor Indicator**
- Small cyan dot (10px) that follows cursor on canvas
- Fades to 50% opacity when not moving
- Disappears after 2 seconds of no movement

**Option C: Crosshair Overlay**
- Thin cyan lines (1px) showing X/Y position
- Only visible when canvas is being touched/moved
- Fades out immediately when cursor leaves

**User Preference?** Which feedback option do you want?

---

## PANEL COMPONENT ARCHITECTURE

### Base Panel Component:
```javascript
class CollapsibleDraggablePanel {
  constructor({
    id,              // Unique panel ID
    title,           // Panel header text
    icon,            // Panel icon
    defaultPosition, // { x, y }
    defaultSize,     // { width, height }
    tabs,            // Array of tab configs
    collapsible,     // true/false
    draggable        // true/false
  }) {
    this.id = id;
    this.title = title;
    this.icon = icon;
    this.tabs = tabs;

    // Create panel structure
    this.createPanel();

    // Add functionality
    if (collapsible) this.makeCollapsible();
    if (draggable) this.makeDraggable();

    // Restore state from localStorage
    this.restoreState();
  }

  createPanel() {
    // Generate HTML structure:
    // <div class="vib-panel" id="panel-{id}">
    //   <div class="panel-header">
    //     <span>{icon} {title}</span>
    //     <div class="panel-controls">
    //       <button class="btn-collapse">−</button>
    //       <button class="btn-settings">⚙️</button>
    //     </div>
    //   </div>
    //   <div class="panel-tabs">
    //     {tabs}
    //   </div>
    //   <div class="panel-content">
    //     {tab contents}
    //   </div>
    // </div>
  }

  makeCollapsible() {
    // Click header or [−] button to collapse
    // Panel shrinks to just header bar
    // Click again to expand
    // Save state to localStorage
  }

  makeDraggable() {
    // Drag by header to move panel anywhere
    // Constrain to viewport bounds
    // Snap to edges (optional)
    // Save position to localStorage
  }

  restoreState() {
    // Load from localStorage:
    // - position
    // - size
    // - collapsed state
    // - active tab
  }

  saveState() {
    // Save to localStorage whenever state changes
  }
}
```

### Tab Component:
```javascript
class TabSystem {
  constructor(panelId, tabs) {
    // tabs = [{ id, label, icon, content }]
    this.panelId = panelId;
    this.tabs = tabs;
    this.activeTab = 0;

    this.createTabs();
    this.restoreActiveTab();
  }

  createTabs() {
    // Generate tab bar + content areas
  }

  switchTab(tabIndex) {
    // Hide all tab contents
    // Show selected tab content
    // Update active tab button styling
    // Save to localStorage
  }
}
```

---

## VISUAL DESIGN (SAME AS BEFORE)

### Color Palette:
```css
:root {
  --vib-cyan: #00ffff;
  --vib-magenta: #ff00ff;
  --vib-purple: #8800ff;

  --faceted-color: #00ffff;
  --quantum-color: #8800ff;
  --holographic-color: #ff00ff;

  --bg-panel: rgba(10, 10, 20, 0.9);
  --border-default: 1px solid rgba(0, 255, 255, 0.3);
  --glow-small: 0 0 5px rgba(0, 255, 255, 0.5);
}
```

### Panel Styling:
```css
.vib-panel {
  background: var(--bg-panel);
  border: var(--border-default);
  box-shadow: var(--glow-small);
  border-radius: 8px;
  backdrop-filter: blur(10px);

  /* Draggable */
  position: absolute;
  z-index: 1000;

  /* Transitions */
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.vib-panel.collapsed {
  height: 40px;
  overflow: hidden;
}

.vib-panel.system-faceted {
  border-top: 2px solid var(--faceted-color);
}

.panel-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  cursor: move; /* Draggable indicator */
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 8px 0 8px;
  background: rgba(0, 0, 0, 0.3);
}

.tab-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(0, 255, 255, 0.2);
  border-color: var(--vib-cyan);
  color: var(--vib-cyan);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.panel-content {
  padding: 12px;
  max-height: 600px;
  overflow-y: auto;
}
```

---

## STATUS DISPLAY (Minimal Corner Badge)

```
┌───────────────────┐
│ FACETED 🔊 ⚡     │ ← System name, Audio ON, Extreme ON
└───────────────────┘

Position: Bottom-right, 20px from edges
Size: Auto-width × 32px height
Opacity: 0.8 (1.0 on hover)
```

**Contents:**
- Current system name (FACETED/QUANTUM/HOLO)
- 🔊 icon if audio reactive ON
- ⚡ icon if extreme mode ON
- Changes color based on current system

**Click behavior:** Expands to show last 5 status messages (optional)

---

## IMPLEMENTATION PLAN

### Phase 1: Component Library (1.5 hours)
1. **CollapsibleDraggablePanel.js** - Base panel component
2. **TabSystem.js** - Tab switching logic
3. **ParameterSlider.js** - Reusable slider component
4. **CanvasTouchControl.js** - NEW: Invisible canvas touch control
5. **StatusBadge.js** - Minimal corner status display

### Phase 2: Panel Implementations (1.5 hours)
1. **CoreParametersPanel.js** - Geometry + Motion tabs
2. **VisualStylePanel.js** - Color + Effects tabs
3. **XYControlPanel.js** - XY touchpad with dropdowns
4. **TransformPanel.js** - 4D rotations
5. **AudioPanel.js** - Input + Reactive + Status tabs

### Phase 3: Integration (1 hour)
1. Update **main.js** to initialize all panels
2. Wire all panels to **choreographer.setParameter()**
3. Initialize **CanvasTouchControl** on main canvas
4. Test all parameter flows
5. Test canvas touch control

### Phase 4: Polish & Deploy (1 hour)
1. Add panel dragging constraints (keep in viewport)
2. Add localStorage for all panel states
3. Mobile responsive adjustments
4. Test on mobile with touch events
5. Build and deploy

**Total Time:** 5 hours

---

## FILES TO CREATE

```
src/ui/redesign/
├── components/
│   ├── CollapsibleDraggablePanel.js  ← Base panel
│   ├── TabSystem.js                  ← Tab logic
│   ├── ParameterSlider.js            ← Reusable slider
│   ├── CanvasTouchControl.js         ← NEW: Canvas touch
│   └── StatusBadge.js                ← Corner status
├── panels/
│   ├── CoreParametersPanel.js        ← Geometry + Motion
│   ├── VisualStylePanel.js           ← Color + Effects
│   ├── XYControlPanel.js             ← XY touchpad
│   ├── TransformPanel.js             ← 4D rotations
│   └── AudioPanel.js                 ← Audio controls
└── PanelManager.js                   ← Orchestrates all panels
```

---

## WHAT STAYS THE SAME

- **Choreographer.js** - NO CHANGES
- **All engine files** - NO CHANGES
- **Canvas system** - NO CHANGES (just add touch listeners)
- **Audio system** - NO CHANGES
- **Parameter ranges** - NO CHANGES
- **All 14+ parameters** - KEPT

---

## WHAT GETS BETTER

✅ **Multiple panels** instead of 2 monolithic ones
✅ **Tabs within panels** for better organization
✅ **Draggable everywhere** - arrange your own layout
✅ **Collapsible everything** - hide what you don't need
✅ **Canvas touch control** - interact directly with visualization
✅ **Minimal status** - out of the way
✅ **All functionality preserved** - nothing removed
✅ **More elegant** - better organized, better styled

---

## CANVAS TOUCH CONTROL OPTIONS

**How should canvas touch feedback work?**

A. **No visible feedback** - Pure invisible control
   - User just sees visualization respond
   - Most minimal

B. **Subtle cursor dot** - Small cyan indicator
   - 10px cyan circle follows cursor
   - Fades to 50% when not moving
   - Disappears after 2s

C. **Crosshair overlay** - Thin lines
   - 1px cyan lines showing X/Y position
   - Only visible during touch/movement
   - Instant fade out

D. **Ring pulse** - Circular indicator
   - Small ring (20px) at touch point
   - Pulses once then fades
   - Shows you touched

**Which do you prefer: A, B, C, or D?**

---

## APPROVAL QUESTIONS

1. **Approve multiple panel design?** (5+ independent panels vs unified)
2. **Approve tabs within panels?** (Geometry/Motion in one panel, etc.)
3. **Approve canvas touch control?** (Invisible touchpad on visualizer)
4. **Which canvas feedback?** (A: none, B: dot, C: crosshair, D: ring)
5. **Approve minimal status badge?** (Bottom-right corner, small)

**Reply "APPROVED V2" to start implementation with this design**

---

🌟 A Paul Phillips Manifestation
