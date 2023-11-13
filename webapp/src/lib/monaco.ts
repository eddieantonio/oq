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
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// `self` MUST be the browser context!
self.MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
        switch (label) {
            case 'typescript':
            case 'javascript':
                return new tsWorker();
            default:
                return new editorWorker();
        }
    }
};

/**
 * A placeholder validator that creates an ERROR marker any time there's an
 * `include` in the code.
 *
 * @param model The Monaco editor model to validate
 */
export function cIncludeValidator(model: monaco.editor.ITextModel) {
    const markers = [];
    // monaco line numbers START AT 1 and also, there is no iterator for lines?!??!?!
    for (let i = 1; i < model.getLineCount() + 1; i++) {
        const range = {
            startLineNumber: i,
            startColumn: 1,
            endLineNumber: i,
            endColumn: model.getLineLength(i) + 1
        };
        const content = model.getValueInRange(range);

        const match = /\binclude\b/.exec(content);
        if (match) {
            const startColumn = match.index + 1;
            const endColumn = startColumn + match[0].length;
            markers.push({
                message: "I don't like includes >:(",
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: i,
                endLineNumber: i,
                startColumn,
                endColumn
            });
        }
    }
    // I have ABSOLUTELY NO IDEA what "owner" is, since there is no
    // documentation, but everything requires it so...
    monaco.editor.setModelMarkers(model, 'owner', markers);
}

export { monaco };