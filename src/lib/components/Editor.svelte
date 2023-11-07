<script lang="ts">
    import type * as Monaco from 'monaco-editor';

    import { onDestroy, onMount } from 'svelte';

    export let content: string = '';
    export let language: string = '';

    let monaco: typeof Monaco;
    let editor: Monaco.editor.IStandaloneCodeEditor;
    let element: HTMLDivElement;

    onMount(async () => {
        monaco = (await import('$lib/monaco')).monaco;
        editor = monaco.editor.create(element, {});
        const model = monaco.editor.createModel(content, language);
        editor.setModel(model);
    });
    onDestroy(() => {
        if (editor) editor.dispose();
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
