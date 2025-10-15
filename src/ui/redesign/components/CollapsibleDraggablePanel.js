/**
 * CollapsibleDraggablePanel - Base component for all UI panels
 * Features:
 * - Collapsible (click header to collapse/expand)
 * - Draggable (drag by header to move)
 * - localStorage persistence (position, size, collapsed state)
 * - Tab support (optional tabs within panel)
 * - Responsive positioning (smart defaults for screen size)
 */

export class CollapsibleDraggablePanel {
    constructor({
        id,                  // Unique panel ID
        title,               // Panel header text
        icon = '🎛️',        // Panel icon
        defaultPosition,     // { x, y } or 'auto'
        defaultSize,         // { width, height } or 'auto'
        defaultCollapsed = false, // Start collapsed?
        collapsible = true,  // Allow collapsing?
        draggable = true,    // Allow dragging?
        resizable = false,   // Allow resizing?
        tabs = [],           // Array of { id, label, content }
        zIndex = 1000        // Base z-index
    }) {
        this.id = id;
        this.title = title;
        this.icon = icon;
        this.defaultPosition = defaultPosition;
        this.defaultSize = defaultSize;
        this.defaultCollapsed = defaultCollapsed;
        this.collapsible = collapsible;
        this.draggable = draggable;
        this.resizable = resizable;
        this.tabs = tabs;
        this.zIndex = zIndex;

        this.isCollapsed = defaultCollapsed;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.currentTab = 0;

        this.element = null;
        this.headerElement = null;
        this.contentElement = null;

        this.init();
    }

    init() {
        this.createElement();
        this.restoreState();
        this.attachEventListeners();
        this.applySystemTheme();
    }

    createElement() {
        // Create panel structure
        this.element = document.createElement('div');
        this.element.className = 'vib-panel';
        this.element.id = `panel-${this.id}`;
        this.element.style.zIndex = this.zIndex;

        // Panel header
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'panel-header';
        this.headerElement.innerHTML = `
            <span class="panel-title">${this.icon} ${this.title}</span>
            <div class="panel-controls">
                ${this.collapsible ? '<button class="btn-collapse" title="Collapse/Expand">−</button>' : ''}
                <button class="btn-settings" title="Settings">⚙️</button>
            </div>
        `;
        this.element.appendChild(this.headerElement);

        // Tab bar (if tabs exist)
        if (this.tabs.length > 0) {
            const tabBar = document.createElement('div');
            tabBar.className = 'panel-tabs';
            this.tabs.forEach((tab, index) => {
                const tabBtn = document.createElement('button');
                tabBtn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
                tabBtn.dataset.tabIndex = index;
                tabBtn.textContent = tab.label;
                tabBar.appendChild(tabBtn);
            });
            this.element.appendChild(tabBar);
        }

        // Panel content
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'panel-content';

        // Add tab contents
        if (this.tabs.length > 0) {
            this.tabs.forEach((tab, index) => {
                const tabContent = document.createElement('div');
                tabContent.className = `tab-content ${index === 0 ? 'active' : ''}`;
                tabContent.dataset.tabIndex = index;
                tabContent.innerHTML = tab.content;
                this.contentElement.appendChild(tabContent);
            });
        }

        this.element.appendChild(this.contentElement);

        // Append to body
        document.body.appendChild(this.element);

        // Apply collapsed state
        if (this.isCollapsed) {
            this.element.classList.add('collapsed');
        }

        // Position panel
        this.positionPanel();
    }

    positionPanel() {
        const position = this.defaultPosition;

        if (position === 'auto') {
            // Smart responsive positioning
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (viewportWidth < 768) {
                // Mobile: bottom-right
                this.element.style.bottom = '20px';
                this.element.style.right = '20px';
                this.element.style.top = 'auto';
                this.element.style.left = 'auto';
            } else {
                // Desktop/tablet: right side, stacked
                // Each panel gets offset based on order
                const panelIndex = document.querySelectorAll('.vib-panel').length - 1;
                const offsetY = 60 + (panelIndex * 50); // Stack with 50px gaps

                this.element.style.top = `${offsetY}px`;
                this.element.style.right = '20px';
                this.element.style.bottom = 'auto';
                this.element.style.left = 'auto';
            }
        } else if (typeof position === 'object') {
            // Explicit position
            if (position.x !== undefined) this.element.style.left = `${position.x}px`;
            if (position.y !== undefined) this.element.style.top = `${position.y}px`;
        }

        // Size
        if (this.defaultSize && this.defaultSize !== 'auto') {
            if (this.defaultSize.width) {
                this.element.style.width = `${this.defaultSize.width}px`;
            }
            if (this.defaultSize.height) {
                this.element.style.height = `${this.defaultSize.height}px`;
            }
        }
    }

    attachEventListeners() {
        // Collapse button
        const collapseBtn = this.element.querySelector('.btn-collapse');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCollapse();
            });
        }

        // Double-click header to collapse
        if (this.collapsible) {
            this.headerElement.addEventListener('dblclick', () => {
                this.toggleCollapse();
            });
        }

        // Draggable header
        if (this.draggable) {
            this.headerElement.addEventListener('mousedown', (e) => this.startDrag(e));
            document.addEventListener('mousemove', (e) => this.drag(e));
            document.addEventListener('mouseup', () => this.endDrag());
        }

        // Tab switching
        if (this.tabs.length > 0) {
            const tabButtons = this.element.querySelectorAll('.tab-btn');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.switchTab(parseInt(btn.dataset.tabIndex));
                });
            });
        }

        // Settings button
        const settingsBtn = this.element.querySelector('.btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openSettings();
            });
        }

        // Bring to front on click
        this.element.addEventListener('mousedown', () => {
            this.bringToFront();
        });
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.element.classList.add('collapsed');
            const collapseBtn = this.element.querySelector('.btn-collapse');
            if (collapseBtn) collapseBtn.textContent = '+';
        } else {
            this.element.classList.remove('collapsed');
            const collapseBtn = this.element.querySelector('.btn-collapse');
            if (collapseBtn) collapseBtn.textContent = '−';
        }

        this.saveState();
    }

    startDrag(e) {
        // Don't drag if clicking buttons
        if (e.target.tagName === 'BUTTON') return;

        this.isDragging = true;
        this.element.classList.add('dragging');

        const rect = this.element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.bringToFront();
    }

    drag(e) {
        if (!this.isDragging) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;

        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));

        this.element.style.left = `${constrainedX}px`;
        this.element.style.top = `${constrainedY}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.classList.remove('dragging');
            this.saveState();
        }
    }

    switchTab(tabIndex) {
        if (tabIndex < 0 || tabIndex >= this.tabs.length) return;

        this.currentTab = tabIndex;

        // Update tab buttons
        const tabButtons = this.element.querySelectorAll('.tab-btn');
        tabButtons.forEach((btn, index) => {
            if (index === tabIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update tab contents
        const tabContents = this.element.querySelectorAll('.tab-content');
        tabContents.forEach((content, index) => {
            if (index === tabIndex) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        this.saveState();
    }

    bringToFront() {
        // Get highest z-index
        const panels = document.querySelectorAll('.vib-panel');
        let maxZ = 1000;
        panels.forEach(panel => {
            const z = parseInt(window.getComputedStyle(panel).zIndex);
            if (z > maxZ) maxZ = z;
        });
        this.element.style.zIndex = maxZ + 1;
    }

    openSettings() {
        // TODO: Open settings modal for this panel
        console.log(`Settings for ${this.id}`);
    }

    saveState() {
        const state = {
            position: {
                left: this.element.style.left,
                top: this.element.style.top
            },
            collapsed: this.isCollapsed,
            currentTab: this.currentTab,
            zIndex: this.element.style.zIndex
        };

        localStorage.setItem(`panel_${this.id}`, JSON.stringify(state));
    }

    restoreState() {
        const savedState = localStorage.getItem(`panel_${this.id}`);
        if (!savedState) return;

        try {
            const state = JSON.parse(savedState);

            // Restore position (if saved explicitly)
            if (state.position && state.position.left && state.position.top) {
                this.element.style.left = state.position.left;
                this.element.style.top = state.position.top;
                this.element.style.right = 'auto';
                this.element.style.bottom = 'auto';
            }

            // Restore collapsed state
            if (state.collapsed !== undefined) {
                this.isCollapsed = state.collapsed;
                if (this.isCollapsed) {
                    this.element.classList.add('collapsed');
                    const collapseBtn = this.element.querySelector('.btn-collapse');
                    if (collapseBtn) collapseBtn.textContent = '+';
                }
            }

            // Restore active tab
            if (state.currentTab !== undefined && this.tabs.length > 0) {
                this.switchTab(state.currentTab);
            }

            // Restore z-index
            if (state.zIndex) {
                this.element.style.zIndex = state.zIndex;
            }
        } catch (e) {
            console.warn(`Failed to restore state for panel ${this.id}:`, e);
        }
    }

    applySystemTheme() {
        // Apply theme based on current system
        if (window.choreographer && window.choreographer.currentSystem) {
            const system = window.choreographer.currentSystem;
            this.element.classList.remove('system-faceted', 'system-quantum', 'system-holographic');
            this.element.classList.add(`system-${system.toLowerCase()}`);
        }
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }

    destroy() {
        this.element.remove();
    }

    // Public API for adding content programmatically
    setContent(html) {
        this.contentElement.innerHTML = html;
    }

    getContentElement() {
        return this.contentElement;
    }

    addTab(label, content) {
        this.tabs.push({ label, content });
        // TODO: Rebuild tab bar
    }
}
