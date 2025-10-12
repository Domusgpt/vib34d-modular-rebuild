/**
 * CollapsibleSection - Reusable collapsible panel component
 * Remembers state in localStorage, smooth animations
 */

export class CollapsibleSection {
    constructor(id, title, content, defaultExpanded = false) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.isExpanded = this.loadState(defaultExpanded);
        this.element = null;
    }

    loadState(defaultValue) {
        const stored = localStorage.getItem(`collapse-${this.id}`);
        return stored !== null ? stored === 'true' : defaultValue;
    }

    saveState() {
        localStorage.setItem(`collapse-${this.id}`, this.isExpanded);
    }

    render() {
        const arrow = this.isExpanded ? '▼' : '▶';
        const contentDisplay = this.isExpanded ? 'block' : 'none';

        return `
            <div class="collapsible-section" data-section-id="${this.id}">
                <div class="section-header" data-header="${this.id}">
                    <span class="section-title">${this.title}</span>
                    <span class="section-arrow">${arrow}</span>
                </div>
                <div class="section-content" data-content="${this.id}" style="display: ${contentDisplay};">
                    ${this.content}
                </div>
            </div>
        `;
    }

    attachListeners(container) {
        const header = container.querySelector(`[data-header="${this.id}"]`);
        const content = container.querySelector(`[data-content="${this.id}"]`);
        const arrow = header.querySelector('.section-arrow');

        header.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;
            this.saveState();

            arrow.textContent = this.isExpanded ? '▼' : '▶';
            content.style.display = this.isExpanded ? 'block' : 'none';
        });
    }
}
