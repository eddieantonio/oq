<script lang="ts">
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { onMount } from 'svelte';

    /* A C hello world program with an error in it! */
    let content = [
        'include <stdio.h>',
        'int main() {',
        '   printf("Hello, World!\\n");',
        '   return 0;',
        '}'
    ].join('\n');

    let enableRun = true;
    let pem: Diagnostics | null = null;
    let programOutput: string | null = null;
    let bottomTab: 'problems' | 'output' = 'problems';
    let okayToContinue = false;

    // It's okay to continue if there are no errors.
    $: okayToContinue = pem === null;

    // Compile the code when the page first loads.
    // This should initialize the diagnostics.
    onMount(() => void runCode());

    /**
     * Post content to the server to be compiled and run.
     */
    async function runCode() {
        /* Prepare FormData for the post including the contents */
        const formData = new FormData();
        formData.append('sourceCode', content);

        let data;
        enableRun = false;
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                body: formData
            });
            data = await res.json();
        } catch (error) {
            // TODO: show some sort of application error message
            console.error(error);
            return;
        } finally {
            enableRun = true;
        }

        if (data.compilation.exitCode != 0) {
            pem = parseDiagnostics(data.compilation);
        } else {
            pem = null;
        }

        if (data.execution) {
            programOutput = data.execution.stdout;
        } else {
            programOutput = null;
        }

        if (pem !== null) {
            bottomTab = 'problems';
        } else {
            bottomTab = 'output';
        }

        enableRun = true;
    }

    /**
     * This is a really awful function that "parses" whatever the web hook gave us.
     * @param compilation
     */
    function parseDiagnostics(compilation: any): Diagnostics {
        if (compilation?.parsed?.format == 'gcc-json') {
            return compilation.parsed as GCCDiagnostics;
        } else {
            return {
                format: 'plain-text',
                diagnostics: [compilation.stderr]
            };
        }
    }
</script>

<div class="ide">
    <div class="editor">
        <div class="tabs-and-actions-container">
            <ul class="tabs-container unstyle">
                <li class="tab tab-active">main.c</li>
            </ul>
            <ul class="actions-container unstyle">
                <li><button type="submit" disabled>Pass</button></li>
                <li>
                    <form method="POST" action="?/submit">
                        <button type="submit" disabled={!okayToContinue}>Submit</button>
                    </form>
                </li>
                <li class="more-space">
                    <button type="submit" on:click={runCode} disabled={!enableRun}>Run</button>
                </li>
            </ul>
        </div>
        <Editor bind:content diagnostics={pem} language="c" clearMarkersOnChange={true} />
    </div>

    <div class="bottom-pane">
        <div class="bottom-tabs">
            <ul class="tabs-container unstyle">
                <li class="tab" class:tab-active={bottomTab == 'problems'}>
                    <button class="unbutton tab-button" on:click={() => (bottomTab = 'problems')}>
                        Problems
                    </button>
                </li>
                <li class="tab" class:tab-active={bottomTab == 'output'}>
                    <button class="unbutton tab-button" on:click={() => (bottomTab = 'output')}>
                        Output
                    </button>
                </li>
            </ul>
        </div>

        <div class="pane-contents">
            {#if bottomTab == 'problems'}
                {#if pem == null}
                    <p>No problems have been detected in the code.</p>
                {:else}
                    <DiagnosticDisplay diagnostics={pem} />
                {/if}
            {:else if bottomTab == 'output'}
                {#if pem != null}
                    <p>Fix the errors, then run the program to see output.</p>
                {:else if programOutput == null}
                    <p>Run the program to see output</p>
                {:else}
                    <pre class="output"><code>{programOutput}</code></pre>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    /* Full IDE styles */
    .ide {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;

        /* Styles stolen from VS Code: */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI',
            'HelveticaNeue-Light', system-ui, 'Ubuntu', 'Droid Sans', sans-serif;
        --nc-font-mono: 'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', 'Liberation Mono',
            'DejaVu Sans Mono', 'Courier New', monospace;

        --editor-bg: #f3f3f3;
        --tab-border-right-color: rgb(229, 229, 229);
        --tab-bg-color: white;
        --tab-border-active-color: #005fb8;
        --tab-text-color: rgb(59, 59, 59);
        --separator-color: #e5e5e5;
        --bottom-pane-color: #f8f8f8;

        background-color: var(--editor-bg);
    }

    @media (prefers-color-scheme: dark) {
        .ide {
            /* These colours, once again, stolen from VS Code's default theme. */
            --editor-bg: #181818;
            --tab-border-right-color: #2b2b2b;
            --tab-bg-color: #1e1e1e;
            --tab-border-active-color: #005fb8;
            --tab-border-inline-color: #252525;
            --tab-text-color: #ccc;
            --separator-color: #2b2b2b;
            --bottom-pane-color: #181818;

            color: #ccc;
        }
    }

    .unstyle {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .unstyle > li {
        display: inline-block;
    }

    .unbutton {
        display: inline-block;
        border: 0;
        background: none;
        color: inherit;
        padding: 0;
        margin: 0;
    }

    .editor {
        height: calc(2 * 100% / 3);
    }
    .bottom-pane {
        height: calc(1 * 100% / 3);
    }

    /* Editor is a container for Monaco and the top tab bar. */
    .editor {
        display: flex;
        flex-flow: column nowrap;
        overflow: hidden;
    }

    .tabs-and-actions-container {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;

        margin: 0;
        border-bottom: 1px solid var(--separator-color);
    }

    .tabs-container {
        display: flex;
    }

    /* The bottom panel shows "Problems" and "Output" */
    .bottom-pane {
        display: flex;
        flex-flow: column nowrap;
        background-color: var(--bottom-pane-color);
        border-top: 1px solid var(--separator-color);
    }
    .bottom-tabs {
        flex: 0;
    }
    .bottom-tabs .tab-button {
        text-transform: lowercase;
        font-variant: small-caps;
    }

    .pane-contents {
        flex: 1;
    }

    .pane-contents {
        overflow: scroll;
    }

    /* I stole a lot of these stylings directly from VS code. */
    .tab {
        min-width: fit-content;
        white-space: nowrap;
        cursor: pointer;

        font-size: 13px;
        line-height: 2;

        --tab-highlight: transparent;
    }

    .tab-active {
        --tab-highlight: var(--tab-border-active-color);
    }

    .tabs-and-actions-container .tab {
        color: var(--tab-text-color);
        background-color: var(--tab-bg-color);
        border-top: 2px solid var(--tab-highlight);
        /* It seems like this border colour can be on either side of the tab. */
        border-right: 1px solid var(--tab-border-inline-color);

        min-width: 120px;
        padding-left: 10px;
    }

    .bottom-tabs .tab {
        border-bottom: 1px solid var(--tab-highlight);
    }

    .tab-button {
        width: 100%;
        height: 100%;
        padding-inline: 1rem;
        cursor: pointer;
    }

    .actions-container {
        display: flex;
        padding-inline: 8px;
        gap: 4px;
    }

    .more-space {
        margin-inline-start: 16px;
    }

    .pane-contents {
        padding: 4px 16px;
    }
</style>
