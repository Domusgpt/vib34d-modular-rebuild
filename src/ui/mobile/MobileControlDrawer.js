/**
 * MobileControlDrawer - Touch-friendly bottom drawer UI
 * Replaces desktop panel system for mobile devices
 *
 * Features:
 * - Swipe-up bottom drawer
 * - Large touch targets (48px minimum)
 * - Tabbed interface
 * - Gesture-based controls
 * - Full-screen takeover option
 */

export class MobileControlDrawer {
    constructor(choreographer) {
        this.choreographer = choreographer;
        this.isOpen = false;
        this.isFullscreen = false;
        this.activeTab = 'quick';
        this.startY = 0;
        this.currentY = 0;

        this.init();
    }

    init() {
        // Create drawer HTML
        this.createDrawer();

        // Setup touch gestures
        this.setupGestures();

        // Setup quick controls
        this.setupQuickControls();
    }

    createDrawer() {
        const drawer = document.createElement('div');
        drawer.id = 'mobile-control-drawer';
        drawer.className = 'mobile-drawer closed';
        drawer.innerHTML = `
            <!-- Drawer Handle -->
            <div class="drawer-handle" id="drawer-handle">
                <div class="handle-bar"></div>
                <div class="handle-label">Controls</div>
            </div>

            <!-- Tab Navigation -->
            <div class="drawer-tabs">
                <button class="tab-button active" data-tab="quick">⚡ Quick</button>
                <button class="tab-button" data-tab="geometry">🔮 Geometry</button>
                <button class="tab-button" data-tab="rotation">🔄 Rotation</button>
                <button class="tab-button" data-tab="style">🎨 Style</button>
            </div>

            <!-- Tab Content Container -->
            <div class="drawer-content">
                <!-- Quick Controls Tab -->
                <div class="tab-content active" data-tab="quick">
                    <div class="quick-grid">
                        <!-- Polytope Core Selector -->
                        <div class="control-group">
                            <label>🔮 Polytope Core</label>
                            <div class="button-group">
                                <button class="toggle-button active" data-param="polytopeCore" data-value="0">Hypercube</button>
                                <button class="toggle-button" data-param="polytopeCore" data-value="1">Hypersphere</button>
                                <button class="toggle-button" data-param="polytopeCore" data-value="2">Hypertetra</button>
                            </div>
                        </div>

                        <!-- Geometry Style Selector -->
                        <div class="control-group">
                            <label>🎨 Geometry Style</label>
                            <div class="button-grid">
                                <button class="toggle-button active" data-param="geometryStyle" data-value="0">Tetra</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="1">Cube</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="2">Sphere</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="3">Torus</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="4">Klein</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="5">Fractal</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="6">Wave</button>
                                <button class="toggle-button" data-param="geometryStyle" data-value="7">Crystal</button>
                            </div>
                        </div>

                        <!-- Quick Sliders -->
                        <div class="control-group">
                            <label>Grid Density</label>
                            <input type="range" class="mobile-slider" data-param="gridDensity" min="1" max="100" value="15">
                            <span class="slider-value">15</span>
                        </div>

                        <div class="control-group">
                            <label>Speed</label>
                            <input type="range" class="mobile-slider" data-param="speed" min="0.1" max="10" step="0.1" value="1.0">
                            <span class="slider-value">1.0</span>
                        </div>

                        <div class="control-group">
                            <label>Chaos</label>
                            <input type="range" class="mobile-slider" data-param="chaos" min="0" max="3" step="0.01" value="0.2">
                            <span class="slider-value">0.2</span>
                        </div>
                    </div>
                </div>

                <!-- Geometry Tab -->
                <div class="tab-content" data-tab="geometry">
                    <div class="control-group">
                        <label>Morph Factor</label>
                        <input type="range" class="mobile-slider" data-param="morphFactor" min="0" max="5" step="0.01" value="1.0">
                        <span class="slider-value">1.0</span>
                    </div>

                    <div class="control-group">
                        <label>Line Thickness</label>
                        <input type="range" class="mobile-slider" data-param="lineThickness" min="0.01" max="0.1" step="0.005" value="0.02">
                        <span class="slider-value">0.02</span>
                    </div>
                </div>

                <!-- Rotation Tab -->
                <div class="tab-content" data-tab="rotation">
                    <div class="rotation-grid">
                        <div class="control-group">
                            <label>XY Rotation</label>
                            <input type="range" class="mobile-slider" data-param="rot4dXY" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <div class="control-group">
                            <label>XZ Rotation</label>
                            <input type="range" class="mobile-slider" data-param="rot4dXZ" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <div class="control-group">
                            <label>YZ Rotation</label>
                            <input type="range" class="mobile-slider" data-param="rot4dYZ" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <div class="control-group">
                            <label>XW Rotation (4D) ⭐</label>
                            <input type="range" class="mobile-slider" data-param="rot4dXW" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <div class="control-group">
                            <label>YW Rotation (4D) ⭐</label>
                            <input type="range" class="mobile-slider" data-param="rot4dYW" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <div class="control-group">
                            <label>ZW Rotation (4D) ⭐</label>
                            <input type="range" class="mobile-slider" data-param="rot4dZW" min="-3.14" max="3.14" step="0.01" value="0">
                            <span class="slider-value">0°</span>
                        </div>

                        <button class="reset-button" id="reset-rotations">Reset All Rotations</button>
                    </div>
                </div>

                <!-- Style Tab -->
                <div class="tab-content" data-tab="style">
                    <div class="control-group">
                        <label>Hue</label>
                        <input type="range" class="mobile-slider" data-param="hue" min="0" max="360" step="1" value="200">
                        <span class="slider-value">200</span>
                    </div>

                    <div class="control-group">
                        <label>Intensity</label>
                        <input type="range" class="mobile-slider" data-param="intensity" min="0" max="1" step="0.01" value="0.5">
                        <span class="slider-value">0.5</span>
                    </div>

                    <div class="control-group">
                        <label>Saturation</label>
                        <input type="range" class="mobile-slider" data-param="saturation" min="0" max="1" step="0.01" value="0.8">
                        <span class="slider-value">0.8</span>
                    </div>
                </div>
            </div>

            <!-- Fullscreen Toggle -->
            <button class="fullscreen-toggle" id="fullscreen-toggle">
                <span class="expand-icon">▲</span>
                <span class="collapse-icon">▼</span>
            </button>
        `;

        document.body.appendChild(drawer);
        this.drawer = drawer;
    }

    setupGestures() {
        const handle = document.getElementById('drawer-handle');
        const fullscreenToggle = document.getElementById('fullscreen-toggle');

        // Swipe gestures on handle
        handle.addEventListener('touchstart', (e) => {
            this.startY = e.touches[0].clientY;
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            this.currentY = e.touches[0].clientY;
            const deltaY = this.startY - this.currentY;

            // Visual feedback during drag
            if (deltaY > 0) {
                this.drawer.style.transform = `translateY(-${Math.min(deltaY, 300)}px)`;
            }
        }, { passive: true });

        handle.addEventListener('touchend', (e) => {
            const deltaY = this.startY - this.currentY;
            this.drawer.style.transform = '';

            // Open if swiped up > 50px
            if (deltaY > 50) {
                this.open();
            } else if (deltaY < -50) {
                this.close();
            }
        });

        // Click to toggle
        handle.addEventListener('click', () => {
            this.toggle();
        });

        // Fullscreen toggle
        fullscreenToggle.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Tab switching
        const tabButtons = this.drawer.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    setupQuickControls() {
        // Setup all sliders
        const sliders = this.drawer.querySelectorAll('.mobile-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const param = e.target.dataset.param;
                let value = parseFloat(e.target.value);

                // Update value display
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
                    // Convert radians to degrees for rotation display
                    if (param.startsWith('rot4d')) {
                        valueDisplay.textContent = Math.round((value * 180) / Math.PI) + '°';
                    } else {
                        valueDisplay.textContent = value.toFixed(2);
                    }
                }

                // Update choreographer
                this.choreographer.setParameter(param, value);
            });
        });

        // Setup button groups (polytope core + geometry style)
        const toggleButtons = this.drawer.querySelectorAll('.toggle-button');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const param = button.dataset.param;
                const value = parseInt(button.dataset.value);

                // Update active state within group
                const group = button.closest('.button-group, .button-grid');
                group.querySelectorAll('.toggle-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');

                // Calculate geometry type based on polytope core + style
                if (param === 'polytopeCore' || param === 'geometryStyle') {
                    // Find the quick controls container
                    const quickTab = this.drawer.querySelector('[data-tab="quick"]');
                    const coreButton = quickTab.querySelector('[data-param="polytopeCore"].active');
                    const styleButton = quickTab.querySelector('[data-param="geometryStyle"].active');

                    if (coreButton && styleButton) {
                        const coreIndex = parseInt(coreButton.dataset.value);
                        const styleIndex = parseInt(styleButton.dataset.value);
                        const geometryType = styleIndex + (coreIndex * 8);

                        this.choreographer.setParameter('geometry', geometryType);
                        console.log(`Mobile: Set geometry to ${geometryType} (core=${coreIndex}, style=${styleIndex})`);
                    }
                }
            });
        });

        // Reset rotations button
        const resetButton = document.getElementById('reset-rotations');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                const rotationParams = ['rot4dXY', 'rot4dXZ', 'rot4dYZ', 'rot4dXW', 'rot4dYW', 'rot4dZW'];
                rotationParams.forEach(param => {
                    this.choreographer.setParameter(param, 0);
                    // Reset sliders
                    const slider = this.drawer.querySelector(`[data-param="${param}"]`);
                    if (slider) {
                        slider.value = 0;
                        const valueDisplay = slider.nextElementSibling;
                        if (valueDisplay) valueDisplay.textContent = '0°';
                    }
                });
            });
        }
    }

    open() {
        this.isOpen = true;
        this.drawer.classList.remove('closed');
        this.drawer.classList.add('open');
    }

    close() {
        this.isOpen = false;
        this.isFullscreen = false;
        this.drawer.classList.remove('open', 'fullscreen');
        this.drawer.classList.add('closed');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            this.drawer.classList.add('fullscreen');
        } else {
            this.drawer.classList.remove('fullscreen');
        }
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update tab buttons
        const tabButtons = this.drawer.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update tab content
        const tabContents = this.drawer.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.dataset.tab === tabName) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }

    destroy() {
        if (this.drawer) {
            this.drawer.remove();
        }
    }
}
