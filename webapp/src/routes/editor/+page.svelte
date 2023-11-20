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
    let programOutput: string | null = null;
    let bottomTab: 'problems' | 'output' = 'problems';

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

            if (data.compilation.exitCode != 0) {
                pem = JSON.stringify(data.compilation.parsed, null, 4);
            } else {
                pem = null;
            }

            if (data.execution) {
                programOutput = data.execution.stdout;
            } else {
                programOutput = null;
            }
        } catch (error) {
            console.error(error);
        }

        if (pem !== null) {
            bottomTab = 'problems';
        } else {
            bottomTab = 'output';
        }

        enableRun = true;
    }
</script>

<div class="ide">
    <div class="editor">
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
        <Editor bind:content language="c" />
    </div>

    <div class="bottom-pane">
        <div class="bottom-tabs">
            <ul class="tabs-container unstyle">
                <li class="tab">
                    <button on:click={() => (bottomTab = 'problems')}> Problems </button>
                </li>
                <li class="tab">
                    <button on:click={() => (bottomTab = 'output')}> Output </button>
                </li>
            </ul>
        </div>
        <div class="pane-contents">
            {#if bottomTab == 'problems'}
                {#if pem == null}
                    <p>No problems!</p>
                {:else}
                    <pre class="problem"><code>{pem}</code></pre>
                {/if}
            {/if}
            {#if bottomTab == 'output'}
                {#if programOutput == null}
                    <p>Run the program to see output</p>
                {:else}
                    <pre class="output"><code>{programOutput}</code></pre>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .ide {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;

        /* stolen from vscode */
        --editor-bg: #f3f3f3;
        --tab-border-right-color: rgb(229, 229, 229);
        --tab-bg-color: white;
        --tab-border-top-color: #005fb8;
        --tab-text-color: rgb(59, 59, 59);

        background-color: var(--editor-bg);
    }
    .editor {
        height: calc(2 * 100% / 3);
    }
    .bottom-pane {
        height: calc(1 * 100% / 3);
    }

    .editor {
        display: flex;
        flex-flow: column nowrap;
        overflow: hidden;
    }

    .tabs-and-actions-container {
        margin: 0;

        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        border-bottom: 1px solid var(--nc-bg-2);
    }

    .tabs-container {
        display: flex;
    }

    .bottom-pane {
        display: flex;
        flex-flow: column nowrap;
    }

    .bottom-tabs {
        flex: 0;
    }

    .pane-contents {
        flex: 1;
        overflow: scroll;
    }

    @media (prefers-color-scheme: dark) {
        .ide {
            /* These colours, once again, stolen from VS Code's default theme. */
            --editor-bg: #252525;
            --tab-bg-color: #1e1e1e;
            --tab-border-top-color: #005fb8;
            --tab-border-inline-color: #252525;
            --tab-text-color: #ccc;
        }
    }

    /* I stole a lot of these stylings directly from VS code. */
    .tab {
        color: var(--tab-text-color);
        background-color: var(--tab-bg-color);
        border-top: 2px solid var(--tab-border-top-color);
        /* It seems like this border colour can be on either side of the tab. */
        border-right: 1px solid var(--tab-border-inline-color);

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

    .problem {
        color: red;
    }
    .success {
        color: green;
    }
</style>
