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

export { monaco };
