<script lang="ts">
    import { Pane, Splitpanes } from 'svelte-splitpanes';

    // <SplitPanes> requires this CSS to be loaded.
    import './splitpanes-vscode-theme.css';
    import './button.css';

    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import Editor from '$lib/components/MonacoEditor.svelte';
    import type { Diagnostics } from '$lib/types/diagnostics';

    import cLogo from '$lib/assets/c-logo.svg';
    import type { ProgrammingLanguage, RunnableProgram } from '$lib/types';
    import type { ClientSideRunResult } from '$lib/types/client-side-run-results';

    /** The source code content in the editor. */
    export let content: string;
    /** The programming language of the content. */
    export let language: ProgrammingLanguage;
    /** The filename that is currently being modified. */
    export let filename: string;

    /** The initial diagnostics that are displayed. */
    export let initialDiagnostics: Diagnostics | null = null;

    /** Function to call to run code on the server. */
    export let runCodeOnServer: (p: RunnableProgram) => Promise<ClientSideRunResult>;

    /** Whether the run button should be enabled. */
    let enableRun: boolean = true;
    let pem: Diagnostics | null = initialDiagnostics;
    let programOutput: string | null = null;
    let bottomTab: 'problems' | 'output' = 'problems';
    /** Whether the program has run and/or has errors. */
    let status: 'unknown' | 'has-errors' | 'successful' = 'unknown';

    /* Used for a hack to pass into the Editor. */
    let editorHeightHint = 0;

    /**
     * Post content to the server to be compiled and run.
     */
    async function runCode() {
        let response;
        enableRun = false;
        try {
            response = await runCodeOnServer({
                language,
                filename,
                sourceCode: content
            });
        } catch (error) {
            // TODO: show some sort of application error message
            console.error(error);
            return;
        } finally {
            enableRun = true;
        }

        pem = response.diagnostics ?? null;
        programOutput = response.output ?? null;
        status = response.success ? 'successful' : 'has-errors';

        if (pem) {
            bottomTab = 'problems';
        } else {
            bottomTab = 'output';
        }
    }
</script>

<div class="ide">
    <Splitpanes
        horizontal={true}
        theme="vscode-theme"
        on:resize={(e) => (editorHeightHint = e.detail[0].size)}
    >
        <Pane minSize={20}>
            <div class="editor">
                <div class="tabs-and-actions-container">
                    <ul class="tabs-container unstyle">
                        <li class="tab tab-active">
                            <img src={cLogo} alt="" role="presentation" class="icon" />
                            {filename}
                        </li>
                    </ul>
                    <ul class="actions-container unstyle">
                        <slot name="buttons" />
                        <li class="more-space">
                            <button
                                class="btn btn--run"
                                type="submit"
                                on:click={runCode}
                                disabled={!enableRun}>Run</button
                            >
                        </li>
                    </ul>
                </div>
                <Editor
                    bind:content
                    diagnostics={pem}
                    {language}
                    clearMarkersOnChange={true}
                    {editorHeightHint}
                />
            </div>
        </Pane>

        <Pane minSize={10}>
            <div class="bottom-pane">
                <div class="bottom-tabs">
                    <ul class="tabs-container unstyle">
                        <li class="tab" class:tab-active={bottomTab == 'problems'}>
                            <button
                                class="unbutton tab-button"
                                on:click={() => (bottomTab = 'problems')}
                            >
                                Problems
                            </button>
                        </li>
                        <li class="tab" class:tab-active={bottomTab == 'output'}>
                            <button
                                class="unbutton tab-button"
                                on:click={() => (bottomTab = 'output')}
                            >
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
                            <slot name="annotate-problems" />
                        {/if}
                    {:else if bottomTab == 'output'}
                        {#if status == 'unknown'}
                            <p>Run the program to see output</p>
                        {:else}
                            <pre class="output"><code>{programOutput}</code></pre>
                        {/if}
                        {#if status == 'successful'}
                            <p class="report-success">
                                Code ran successfully. Press submit to continue.
                            </p>
                        {:else if status == 'has-errors'}
                            <p>Fix the errors, then run the program to see output.</p>
                        {/if}
                    {/if}
                </div>
            </div>
        </Pane>
    </Splitpanes>
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

    .editor,
    .bottom-pane {
        height: 100%;
    }

    /* Editor is a container for Monaco and the top tab bar. */
    .editor {
        display: flex;
        flex-flow: column nowrap;
        overflow: hidden;
        background-color: var(--editor-bg);
    }

    .tabs-and-actions-container {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: flex-end;

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
        margin: 2px 8px;
        gap: 4px;
    }

    .more-space {
        margin-inline-start: 16px;
    }

    .pane-contents {
        padding: 4px 16px;
    }

    .report-success {
        color: #28a745;
        font-style: italic;
    }

    .icon {
        height: 10px;
        height: 0.4lh;
        aspect-ratio: 1;
        margin-inline: 0.6ch;
    }
</style>
