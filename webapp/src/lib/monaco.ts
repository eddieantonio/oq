/**
 * Sets up the Monaco editor in Svelte. Note, this **MUST** be run on the client
 * side. It CANNOT be run on the server side (so no SSR).
 *
 * The appropriate place to import this module is in a page or component's
 * `onMount` function.
 *
 * Adapted from: https://www.codelantis.com/blog/sveltekit-monaco-editor
 * This is the ONLY resource I've found on how to do it properly with SvelteKit!
 */

import * as monaco from 'monaco-editor';

// The ?worker stuff is a Vite specific feature to create a Web Worker.
// See: https://v3.vitejs.dev/guide/features.html#import-with-query-suffixes
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

/**
 * The owner is a string that lets us manage markers that we create in the document.
 *
 * Fun fact about the "owner" parameter. Monaco's documentation doesn't really
 * explain what it does! You just need to infer it from function signatures.
 */
const OQ_OWNER = 'oq';

// `self` MUST be the browser context!
self.MonacoEnvironment = {
    getWorker(_workerId: string, _label: string) {
        // Monaco also bundles a VERY full-featured and heavy-weight
        // TypeScript/JavaScript worker, but it's WAYYYYY too large, so I've
        // decided to omit it here.
        return new editorWorker();
    }
};

export function setMarkersFromDiagnostics(
    model: monaco.editor.ITextModel,
    diagnostics: Diagnostics
) {
    clearAllMarkers();

    let markers: monaco.editor.IMarkerData[];
    if (diagnostics.format === 'gcc-json') {
        markers = setMarkersFromGCCDiagnostics(diagnostics);
    } else {
        // TODO: what to do with plain-text diagnostics?
        markers = [];
    }

    monaco.editor.setModelMarkers(model, OQ_OWNER, markers);
}

export function clearAllMarkers() {
    monaco.editor.removeAllMarkers(OQ_OWNER);
}

function setMarkersFromGCCDiagnostics(diagnostics: GCCDiagnostics): monaco.editor.IMarkerData[] {
    return diagnostics.diagnostics.map((diagnostic) => {
        console.assert(diagnostic.locations.length > 0);

        const start = diagnostic.locations[0].caret;
        const end = diagnostic.locations[0].finish || start;

        return {
            message: diagnostic.message,
            severity: gccKindToMonacoSeverity(diagnostic.kind),
            startLineNumber: start.line,
            endLineNumber: end.line,
            // I don't actually know which column is correct.
            // TODO: test with various multi-byte characters!
            startColumn: start.column,
            endColumn: end.column
        };
    });
}

function gccKindToMonacoSeverity(kind: GCCDiagnostic['kind']): monaco.MarkerSeverity {
    switch (kind) {
        case 'error':
            return monaco.MarkerSeverity.Error;
        case 'warning':
            return monaco.MarkerSeverity.Warning;
        case 'note':
            return monaco.MarkerSeverity.Info;
    }
}

export { monaco };
