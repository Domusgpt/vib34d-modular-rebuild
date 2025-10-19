export class ResponsiveLayoutManager {
    constructor() {
        this.breakpoints = {
            compact: 1024,
            stacked: 768
        };
        this.controlPanel = document.getElementById('control-panel');
        this.topBar = document.getElementById('top-bar');
        this.stage = document.getElementById('stage-container');
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const body = document.body;

        body.classList.toggle('layout-compact', width <= this.breakpoints.compact);
        body.classList.toggle('layout-stacked', width <= this.breakpoints.stacked);
        body.classList.toggle('layout-portrait', height > width);

        if (this.controlPanel) {
            if (width <= this.breakpoints.compact) {
                this.controlPanel.classList.add('is-floating');
            } else {
                this.controlPanel.classList.remove('is-floating');
            }

            if (width <= this.breakpoints.stacked || height < 540) {
                this.controlPanel.classList.add('auto-collapsed');
            } else {
                this.controlPanel.classList.remove('auto-collapsed');
            }
        }

        if (this.topBar) {
            this.topBar.classList.toggle('is-compact', width <= this.breakpoints.compact);
        }
    }
}
