<script lang="ts">
    import type * as Monaco from 'monaco-editor';

    import { onDestroy, onMount } from 'svelte';

    export let content: string = '';
    export let language: string = '';

    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;
    let element: HTMLDivElement;
    let model: Monaco.editor.ITextModel;
    /**
     * These are things that Monaco creates and need to have .dispose() called
     * on them when the current component is destroyed.
     */
    let disposables: Monaco.IDisposable[] = [];

    onMount(async () => {
        // Importing the monaco module MUST be done onMount, otherwise Sveltekit
        // will attempt loading the client-only library on the server which
        // would make node upsetti.
        let monacoModule = await import('$lib/monaco');
        monaco = monacoModule.monaco;

        let { cIncludeValidator } = monacoModule;

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
        disposables.push(model);

        editor.setModel(model);

        // Listen to when the text changes:
        cIncludeValidator(model);
        model.onDidChangeContent(() => {
            // Update the content prop:
            content = model.getValue();
            // Add error messages:
            cIncludeValidator(model);
        });

        /* Change editor theme if dark mode changes */
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            editor.updateOptions({
                theme: e.matches ? 'vs-dark' : 'vs'
            });
        });

        /* Update editor size when the window size changes */
        window.addEventListener('resize', () => {
            editor.layout();
        });
        /* TODO: clean up event listeners and disposables. */
    });

    onDestroy(() => {
        disposables.forEach((d) => d.dispose());
    });

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
