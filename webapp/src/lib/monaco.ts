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

import type { Diagnostics, GCCDiagnostic, GCCDiagnostics } from './types/diagnostics';
import type { JsonMarkerData } from './types';

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

/**
 * Places markers (red squiggly lines) in the editor based on the diagnostics provided.
 *
 * @param model The current editor model
 * @param diagnostics the main diagnostics object
 */
export function setMarkersFromDiagnostics(
    model: monaco.editor.ITextModel,
    diagnostics: Diagnostics
) {
    clearAllMarkers();
    // TODO: ensure that the diagnostics are ACTUALLY for the current model
    // TODO: looks like this can be done using the `uri` field of the model
    // and IMarkerData.code:
    // See: https://github.com/microsoft/vscode/blob/578ad35313f41c4aeff777ab25bd3265c645ab34/src/vs/platform/markers/common/markers.ts#L86-L101
    const markers = extractMarkersFromDiagnostics(diagnostics);
    monaco.editor.setModelMarkers(model, OQ_OWNER, markers);
}

/**
 * Removes all markers from the editor.
 */
export function clearAllMarkers() {
    monaco.editor.removeAllMarkers(OQ_OWNER);
}

/**
 * Extracts markers appropriate for the given diagnostics.
 */
function extractMarkersFromDiagnostics(diagnostics: Diagnostics): monaco.editor.IMarkerData[] {
    switch (diagnostics.format) {
        case 'gcc-json':
            return extractMarkersFromGCCDiagnostics(diagnostics);
        case 'llm-enhanced':
            // Defer to the original diagnostics.
            return extractMarkersFromDiagnostics(diagnostics.original);
        case 'manually-enhanced':
            // Currently no markers for manually enhanced diagnostics.
            return convertMarkersFromJsonMarkers(diagnostics.markers);
        case 'preformatted':
            // There are no markers for preformatted diagnostics.
            return [];
    }
}

function extractMarkersFromGCCDiagnostics(
    diagnostics: GCCDiagnostics
): monaco.editor.IMarkerData[] {
    const markers = [];

    for (const diagnostic of diagnostics.diagnostics) {
        // If there's no location, then we don't know where to put the marker.
        // So just skip it.
        if (diagnostic.locations.length === 0) {
            continue;
        }

        // GCC might tell us whether column numbering starts at 0 or 1:
        if (diagnostic['column-origin']) {
            console.assert(diagnostic['column-origin'] === 1, 'assuming 1-based indexing');
        }
        // ...either way, assume 1-based indexing.

        const start = diagnostic.locations[0].caret;
        const end = diagnostic.locations[0].finish || start;
        markers.push({
            message: diagnostic.message,
            severity: gccKindToMonacoSeverity(diagnostic.kind),
            startLineNumber: start.line,
            endLineNumber: end.line,
            // I don't actually know which column is correct.
            // TODO: test with various multi-byte characters!
            startColumn: start.column,
            endColumn: end.column
        });
    }

    return markers;
}

function convertMarkersFromJsonMarkers(markers: JsonMarkerData[]): monaco.editor.IMarkerData[] {
    return markers.map((marker) => ({
        ...marker,
        severity: severityStringToMonacoSeverity(marker.severity)
    }));
}

function gccKindToMonacoSeverity(kind: GCCDiagnostic['kind']): monaco.MarkerSeverity {
    return {
        error: monaco.MarkerSeverity.Error,
        warning: monaco.MarkerSeverity.Warning,
        note: monaco.MarkerSeverity.Info
    }[kind];
}

function severityStringToMonacoSeverity(
    severity: JsonMarkerData['severity']
): monaco.MarkerSeverity {
    return {
        error: monaco.MarkerSeverity.Error,
        warning: monaco.MarkerSeverity.Warning,
        info: monaco.MarkerSeverity.Info,
        hint: monaco.MarkerSeverity.Hint
    }[severity];
}

export { monaco };
