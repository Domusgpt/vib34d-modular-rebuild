export class ResponsiveLayoutManager {
    constructor() {
        this.breakpoints = {
            wide: 1480,
            compact: 1180,
            stacked: 860
        };

        this.controlPanel = document.getElementById('control-panel');
        this.visualsPanel = document.getElementById('visuals-panel');
        this.utilityRail = document.getElementById('studio-utility-rail');
        this.deckDock = document.getElementById('deck-panel-dock');

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const layout = this.computeLayout(width);
        const orientation = width >= height ? 'landscape' : 'portrait';

        document.body.dataset.layout = layout;
        document.body.dataset.orientation = orientation;

        const targetDock = (layout === 'compact' || layout === 'stacked')
            ? this.deckDock
            : this.utilityRail;

        if (targetDock) {
            [this.controlPanel, this.visualsPanel].forEach(panel => {
                if (panel && panel.parentElement !== targetDock) {
                    targetDock.appendChild(panel);
                }
            });
        }
    }

    computeLayout(width) {
        if (width <= this.breakpoints.stacked) {
            return 'stacked';
        }
        if (width <= this.breakpoints.compact) {
            return 'compact';
        }
        if (width <= this.breakpoints.wide) {
            return 'wide';
        }
        return 'panorama';
    }
}
