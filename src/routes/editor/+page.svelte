<script lang="ts">
    import Editor from '$lib/components/Editor.svelte';

    /* a C hello world program */
    let content = [
        '#include <stdio.h>',
        'int main() {',
        '   printf("Hello, World!");',
        '   return 0;',
        '}'
    ].join('\n');
</script>

<div class="ide">
    <div class="tabs-and-actions-container">
        <ul class="tabs-container unstyle">
            <li class="tab">main.c</li>
        </ul>
        <ul class="actions-container unstyle">
            <li><button type="submit">Pass</button></li>
            <li><button type="submit">Submit</button></li>
            <li class="more-space"><button type="submit">Run</button></li>
        </ul>
    </div>
    <div class="editor">
        <Editor {content} language="c" />
    </div>
</div>

<style>
    .ide {
        display: flex;

        flex-flow: column nowrap;

        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;

        --editor-bg: #f3f3f3; /* stolen from vscode */
        background-color: var(--editor-bg);
    }
    .tabs-and-actions-container {
        flex: 0;
    }
    .editor {
        flex: 1;
    }

    .editor {
        border-top: 1px solid var(--nc-bg-2);
    }

    .tabs-and-actions-container {
        margin: 0;

        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }

    .tabs-container {
        display: flex;
    }

    /* I stole a lot of these stylings directly from VS code. */
    .tab {
        border-right: 1px solid rgb(229, 229, 229);
        background-color: white;
        --tab-border-bottom-color: #f8f8f8;
        --tab-border-top-color: #005fb8;
        color: rgb(59, 59, 59);
        border-top: 2px solid var(--tab-border-top-color);

        width: 120px;
        padding-left: 10px;
        min-width: fit-content;
        white-space: nowrap;
        cursor: pointer;

        font-size: 13px;
        line-height: 2;
    }

    .unstyle {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .unstyle > li {
        display: inline-block;
    }

    .actions-container {
        display: flex;
        padding-inline: 8px;
        gap: 4px;
    }
    .more-space {
        margin-inline-start: 16px;
    }
</style>
