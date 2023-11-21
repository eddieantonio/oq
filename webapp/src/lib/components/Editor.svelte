<script lang="ts">
    import type * as Monaco from 'monaco-editor';

    import { onDestroy, onMount } from 'svelte';

    // Props
    export let content: string = '';
    export let language: string = '';
    export let diagnostics: Diagnostics | null = null;

    /** The DOM element that the editor will be mounted to. */
    let element: HTMLDivElement;

    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;
    let model: Monaco.editor.ITextModel;

    // Resource management
    /**
     * These are things that Monaco creates and need to have .dispose() called
     * on them when the current component is destroyed.
     */
    let disposables: Monaco.IDisposable[] = [];
    /**
     * Removes all event listeners when controller.abort() is called.
     */
    const controller = new AbortController();

    let onDiagnosticsChange = function (_: typeof diagnostics) {
        // Do nothing. The real handler will be installed in onMount().
    };

    onMount(async () => {
        // Importing the monaco module MUST be done onMount, otherwise Sveltekit
        // will attempt loading the client-only library on the server which
        // would make node upsetti.
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
        editor.setModel(model);
        disposables.push(model);

        // Listen to when the text changes:
        model.onDidChangeContent(() => {
            // Update the content prop:
            content = model.getValue();
        });

        // When the diagnostics props change, update the markers in the editor:
        let { setMarkersFromDiagnostics, clearAllMarkers } = monacoModule;
        onDiagnosticsChange = (diagnostics) => {
            if (diagnostics === null) {
                clearAllMarkers();
            } else {
                setMarkersFromDiagnostics(model, diagnostics);
            }
        };

        // Using { signal } enables controller.abort() to remove all the event listeners in one go
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

    $: onDiagnosticsChange(diagnostics);

    function prefersDarkMode(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
</script>

<div bind:this={element} class="editor" />

<style>
    .editor {
        width: 100%;
        height: 100%;
    }
</style>
