<script lang="ts">
    import type * as Monaco from 'monaco-editor';

    import { onDestroy, onMount } from 'svelte';

    export let content: string = '';
    export let language: string = '';

    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;
    let element: HTMLDivElement;
    let model: Monaco.editor.ITextModel;

    onMount(async () => {
        let monacoModule = await import('$lib/monaco');
        monaco = monacoModule.monaco;
        let { cIncludeValidator } = monacoModule;
        editor = monaco.editor.create(element, {
            theme: prefersDarkMode() ? 'vs-dark' : 'vs'
        });
        model = monaco.editor.createModel(content, language);
        editor.setModel(model);
        cIncludeValidator(model);
        model.onDidChangeContent(() => {
            content = model.getValue();
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
        if (editor) editor.dispose();
        if (model) model.dispose();
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
