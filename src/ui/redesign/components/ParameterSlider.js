/**
 * ParameterSlider - Reusable parameter control component
 * Features:
 * - Combined slider + numeric display
 * - Modified indicator (shows if value != default)
 * - Audio-reactive indicator (pulses if parameter is audio-modulated)
 * - Real-time sync with choreographer
 */

export class ParameterSlider {
    constructor({
        name,           // Parameter name (e.g., 'gridDensity')
        label,          // Display label (e.g., 'Grid Density')
        min,            // Min value
        max,            // Max value
        step,           // Step size
        defaultValue,   // Default value
        unit = '',      // Unit symbol (e.g., '°', '%')
        decimals = 0,   // Decimal places for display
        onChange        // Callback: (name, value) => {}
    }) {
        this.name = name;
        this.label = label;
        this.min = min;
        this.max = max;
        this.step = step;
        this.defaultValue = defaultValue;
        this.unit = unit;
        this.decimals = decimals;
        this.onChange = onChange;

        this.currentValue = defaultValue;
        this.isAudioReactive = false;

        this.element = null;
        this.sliderElement = null;
        this.valueElement = null;

        this.createElement();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'parameter-slider';
        this.element.dataset.param = this.name;

        const isModified = this.currentValue !== this.defaultValue;

        this.element.innerHTML = `
            <div class="slider-header">
                <label class="slider-label ${isModified ? 'modified' : ''}">
                    ${isModified ? '● ' : ''}${this.label}
                </label>
                <span class="slider-value" id="value-${this.name}">
                    ${this.formatValue(this.currentValue)}
                </span>
            </div>
            <div class="slider-track">
                <input
                    type="range"
                    class="slider-input"
                    id="slider-${this.name}"
                    min="${this.min}"
                    max="${this.max}"
                    step="${this.step}"
                    value="${this.currentValue}"
                >
            </div>
        `;

        this.sliderElement = this.element.querySelector('.slider-input');
        this.valueElement = this.element.querySelector('.slider-value');
        const labelElement = this.element.querySelector('.slider-label');

        // Add event listener
        this.sliderElement.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.setValue(value);
            if (this.onChange) {
                this.onChange(this.name, value);
            }
        });

        // Update modified indicator on input
        this.sliderElement.addEventListener('input', () => {
            this.updateModifiedIndicator();
        });
    }

    setValue(value) {
        this.currentValue = value;
        this.sliderElement.value = value;
        this.valueElement.textContent = this.formatValue(value);
        this.updateModifiedIndicator();
    }

    getValue() {
        return this.currentValue;
    }

    formatValue(value) {
        if (this.decimals === 0) {
            return `${Math.round(value)}${this.unit}`;
        } else {
            return `${value.toFixed(this.decimals)}${this.unit}`;
        }
    }

    updateModifiedIndicator() {
        const labelElement = this.element.querySelector('.slider-label');
        const isModified = parseFloat(this.sliderElement.value) !== this.defaultValue;

        if (isModified) {
            labelElement.classList.add('modified');
            if (!labelElement.textContent.startsWith('● ')) {
                labelElement.textContent = '● ' + this.label;
            }
        } else {
            labelElement.classList.remove('modified');
            labelElement.textContent = this.label;
        }
    }

    setAudioReactive(active) {
        this.isAudioReactive = active;

        if (active) {
            this.element.classList.add('audio-reactive');
        } else {
            this.element.classList.remove('audio-reactive');
        }
    }

    getElement() {
        return this.element;
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
