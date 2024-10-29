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

import type {
    Diagnostics,
    GCCDiagnostic,
    GCCDiagnostics,
    PythonTraceback,
    RootRustDiagnostic,
    RustDiagnostic
} from './types/diagnostics';
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
    const sourceCode = model.getValue();
    const markers = extractMarkersFromDiagnostics(diagnostics, sourceCode);
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
function extractMarkersFromDiagnostics(
    diagnostics: Diagnostics,
    sourceCode: string
): monaco.editor.IMarkerData[] {
    switch (diagnostics.format) {
        case 'gcc-json':
            return extractMarkersFromGCCDiagnostics(diagnostics);
        case 'parsed-python':
            return extractMarkersFromPythonTraceback(diagnostics.diagnostics, sourceCode);
        case 'rustc-json':
            return extractMarkersFromRustDiagnostics(diagnostics.diagnostics);
        case 'llm-enhanced':
            // Defer to the original diagnostics.
            return extractMarkersFromDiagnostics(diagnostics.original, sourceCode);
        case 'manually-enhanced':
            // Currently no markers for manually enhanced diagnostics.
            return convertMarkersFromJsonMarkers(diagnostics.markers);
        case 'preformatted':
        case 'markdown':
            // There are no markers for preformatted or markdown (finetuned) diagnostics.
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

function extractMarkersFromPythonTraceback(
    pythonError: PythonTraceback,
    sourceCode: string
): monaco.editor.IMarkerData[] {
    // TODO: check that the error occurred in the same file

    const numberOfFrames = pythonError.frames.length;
    if (numberOfFrames == 0) return [];

    const lastFrame = pythonError.frames[numberOfFrames - 1];

    // The marker is literally the text squiggles:
    // e.g, in the following:
    //  Traceback (most recent call last):
    //    File "/private/tmp/herp.py", line 1, in <module>
    //      "hello" / 0
    //      ~~~~~~~~^~~
    //  TypeError: unsupported operand type(s) for /: 'str' and 'int'
    //
    // It would be `~~~~~~~~^~~`
    const marker = lastFrame.marker;
    if (marker == null) return [];

    // Figure out how many spaces come before it:
    // This is annoying... we need to figure out where
    // TODO: support tabs
    const lines = sourceCode.split('\n');
    const line = lines[lastFrame.startLineNumber - 1];
    // Bail: Something weird happened:
    if (line == null) return [];
    const lineWhitespace = line.match(/^ */);
    const adjustment = lineWhitespace?.[0].length ?? 0;

    const markerWhitespace = marker.match(/^ */);
    const markerStart = markerWhitespace?.[0].length ?? 0;

    const { exception, message } = pythonError;
    return [
        {
            // It's always an *error* message:
            severity: monaco.MarkerSeverity.Error,
            message: `${exception}: ${message}`,
            startLineNumber: lastFrame.startLineNumber,
            endLineNumber: lastFrame.startLineNumber,
            // Adjust columns from zero-indexing to one-indexing:
            startColumn: 1 + adjustment + markerStart,
            endColumn: 1 + adjustment + marker.length
        }
    ];
}

function extractMarkersFromRustDiagnostics(
    diagnostics: RootRustDiagnostic[]
): monaco.editor.IMarkerData[] {
    const markers = [];

    for (const diagnostic of diagnostics) {
        // If there's no location, then we don't know where to put the marker.
        // So just skip it.
        if (diagnostic.spans.length === 0) {
            continue;
        }

        // TODO: This needs a lot more work. Rust's diagnostics are very RICH!
        const span = diagnostic.spans[0];
        const start = span;
        const end = span;
        markers.push({
            message: diagnostic.message,
            severity: rustLevelToMonacoSeverity(diagnostic.level),
            startLineNumber: start.line_start,
            endLineNumber: end.line_end,
            startColumn: start.column_start,
            endColumn: end.column_end
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

function rustLevelToMonacoSeverity(level: RustDiagnostic['level']): monaco.MarkerSeverity {
    return {
        error: monaco.MarkerSeverity.Error,
        warning: monaco.MarkerSeverity.Warning,
        note: monaco.MarkerSeverity.Info,
        help: monaco.MarkerSeverity.Hint,
        'failure-note': monaco.MarkerSeverity.Info,
        'error: internal compiler error': monaco.MarkerSeverity.Error
    }[level];
}

export { monaco };
