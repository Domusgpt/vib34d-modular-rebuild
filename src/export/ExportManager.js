/**
 * Export Manager Stub
 * Manages variation export/import and card generation
 */

export class ExportManager {
    constructor(engine) {
        this.engine = engine;
    }

    exportCurrent() {
        console.log('💾 ExportManager: Export stub');
    }

    importVariation(data) {
        console.log('📥 ExportManager: Import stub');
    }
}
