<script lang="ts">
    import Editor from '$lib/components/Editor.svelte';

    /* A C hello world program with an error in it! */
    let content = [
        'include <stdio.h>',
        'int main() {',
        '   printf("Hello, World!");',
        '   return 0;',
        '}'
    ].join('\n');

    let enableRun = true;
    let pem: string | null = null;

    /**
     * Post content to the server to be compiled and run.
     */
    async function runCode() {
        /* Prepare FormData for the post including the contents */
        const formData = new FormData();
        formData.append('sourceCode', content);

        enableRun = false;
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            pem = JSON.stringify(data.gccError, null, 4);
        } catch (error) {
            console.error(error);
        }
        enableRun = true;
    }
</script>

<div class="ide">
    <div class="tabs-and-actions-container">
        <ul class="tabs-container unstyle">
            <li class="tab">main.c</li>
        </ul>
        <ul class="actions-container unstyle">
            <li><button type="submit" disabled>Pass</button></li>
            <li><button type="submit" disabled>Submit</button></li>
            <li class="more-space">
                <button type="submit" on:click={runCode} disabled={!enableRun}>Run</button>
            </li>
        </ul>
    </div>
    <div class="editor">
        <Editor bind:content language="c" />
    </div>
    <div class="problems-pane">
        {#if pem}
            <pre><code>{pem}</code></pre>
        {/if}
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
    .problems-pane {
        /* flex with at least a height of 100px */
        flex: 0 1 100px;
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
