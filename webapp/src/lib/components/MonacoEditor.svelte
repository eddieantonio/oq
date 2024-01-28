<script lang="ts">
    import type * as Monaco from 'monaco-editor';
    import { onDestroy, onMount } from 'svelte';

    import type { Diagnostics } from '$lib/types/diagnostics';

    // Props
    /** The text content of the editor. */
    export let content: string = '';
    /** The source code language. */
    export let language: string = '';
    /** The diagnostics to display as markers. */
    export let diagnostics: Diagnostics | null = null;
    /** Whether to remove markers (red squiglies) when the text is changed. */
    export let clearMarkersOnChange: boolean = false;
    /** A hint of the requested height of the editor. This may or may not be ignored. */
    export let editorHeightHint: number = 500;

    /** The DOM element that the editor will be mounted to. */
    let element: HTMLDivElement;

    /**
     * The monaco module. It is imported in onMount(), as Monaco can only be
     * used in the browser.
     */
    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;
    let model: Monaco.editor.ITextModel;

    // Resource management
    /**
     * These are resources that Monaco creates and need to have .dispose() called
     * on them when the current component is destroyed.
     */
    let disposables: Monaco.IDisposable[] = [];
    /**
     * Removes all event listeners when controller.abort() is called.
     */
    const controller = new AbortController();

    /**
     * Called when the diagnostics prop changes.
     */
    let onDiagnosticsChange = function (_: typeof diagnostics) {
        // Do nothing. The real handler will be installed in onMount().
    };
    $: onDiagnosticsChange(diagnostics);

    /**
     * Called when the editorHeightHint prop changes.
     */
    let onEditorSizeChange = function (_: typeof editorHeightHint) {
        // Do nothing. The real handler will be installed in onMount().
    };
    $: onEditorSizeChange(editorHeightHint);

    // This will actually import Monaco and setup the editor and all required event listeners.
    onMount(async () => {
        // Importing the monaco module MUST be done onMount, otherwise Sveltekit
        // will attempt loading the client-only library on the server which
        // makes node.js very upsetti.
        let monacoModule = await import('$lib/monaco');
        monaco = monacoModule.monaco;

        // Create the main editor instance.
        editor = monaco.editor.create(element, {
            theme: prefersDarkMode() ? 'vs-dark' : 'vs',
            minimap: {
                enabled: false
            }
        });
        disposables.push(editor);

        // Start the editor with the supplied content:
        model = monaco.editor.createModel(content, language);
        // All of our examples use LF line endings. This must be consistent so that
        // the SHA-256 hash of the source code matches!
        model.setEOL(monaco.editor.EndOfLineSequence.LF);

        editor.setModel(model);
        disposables.push(model);

        // When the diagnostics props change, update the markers in the editor:
        let { setMarkersFromDiagnostics, clearAllMarkers } = monacoModule;
        onDiagnosticsChange = (diagnostics) => {
            if (diagnostics === null) {
                clearAllMarkers();
            } else {
                setMarkersFromDiagnostics(model, diagnostics);
            }
        };

        // When the editorHeightHint prop changes, update the editor size.
        // (Ignore the editorHeightHint, and just use the maximum available space.)
        onEditorSizeChange = () => void editor.layout();

        // Listen to when the source code changes:
        model.onDidChangeContent(() => {
            // Update the content prop:
            content = model.getValue();

            if (clearMarkersOnChange) clearAllMarkers();
        });

        // Using { signal } enables controller.abort() to remove the following
        // event listeners all in one go
        const { signal } = controller;

        // Change editor theme if dark mode changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
            'change',
            (e) =>
                void editor.updateOptions({
                    theme: e.matches ? 'vs-dark' : 'vs'
                }),
            { signal }
        );

        // Update editor size when the window size changes
        window.addEventListener('resize', () => void editor.layout(), { signal });
    });

    onDestroy(() => {
        disposables.forEach((d) => d.dispose());
        controller.abort();
    });

    function prefersDarkMode(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
</script>

<div bind:this={element} style="width: 100%; height: 100%" />
