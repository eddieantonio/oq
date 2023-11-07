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
        editor = monaco.editor.create(element, {});
        model = monaco.editor.createModel(content, language);
        editor.setModel(model);
        cIncludeValidator(model);
        model.onDidChangeContent(() => {
            content = model.getValue();
            cIncludeValidator(model);
        });
    });
    onDestroy(() => {
        if (editor) editor.dispose();
        if (model) model.dispose();
    });
</script>

<div bind:this={element} class="editor" />

<style>
    .editor {
        width: 100vw;
        min-height: 80vh;
        outline: 1px solid #ccc;
    }
</style>
