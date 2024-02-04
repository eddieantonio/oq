<script lang="ts">
    import { onMount } from 'svelte';
    import { Pane, Splitpanes } from 'svelte-splitpanes';

    // <SplitPanes> requires this CSS to be loaded.
    import './splitpanes-vscode-theme.css';

    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import Editor from '$lib/components/MonacoEditor.svelte';
    import type { Diagnostics } from '$lib/types/diagnostics';
    import type { ClientSideRunResult } from '$lib/types/client-side-run-results';
    import { createTimer, type CancelableTimer } from '$lib/cancelable-timer';

    import cLogo from '$lib/assets/c-logo.svg';

    /** Whether the editor is enabled at all. */
    export let enabled: boolean = true;

    /** The source code content in the editor. */
    export let content: string;
    /** The programming language of the content. */
    export let language: string;
    /** The filename that is currently being modified. */
    export let filename: string = 'main.c';

    /** When to timeout the attempt (in milliseconds). */
    export let timeout: number;

    /** When to allow skipping the attempt (in milliseconds). */
    export let skipTimeout: number;

    /** The initial diagnostics that are displayed. */
    export let initialDiagnostics: Diagnostics | null = null;

    let enableRun = true;
    let pem: Diagnostics | null = initialDiagnostics;
    let programOutput: string | null = null;
    let bottomTab: 'problems' | 'output' = 'problems';
    let okayToContinue = false;
    let enableSkip = false;
    let editorHeightHint = 0;

    // Setup timers, compiles the code for the first time (if the initial
    // diagnostics are not provided)
    onMount(() => {
        if (!enabled) {
            console.warn('Tried to start exercise attempt when not logged in.');
            return;
        }

        indicateExerciseStarted();
        const timeoutTimer = startTimeout();
        const skipTimer = startSkipTimer();

        // Compile the code when the page first loads
        // BUT only if there are no initial diagnostics!
        if (!initialDiagnostics) {
            runCode();
        }

        // When the IDE is no longer in mounted, cancel the timers.
        // Otherwise, they WILL run in the background :/
        return () => {
            timeoutTimer.cancel();
            skipTimer.cancel();
        };
    });

    /** Tell the backend that we're ready to go! */
    async function indicateExerciseStarted() {
        const res = await fetch('/api/start-exercise', { method: 'POST' });
        const json = await res.json();
        if (!json.success) {
            console.error(json);
        }
    }

    /** Start a timeout to automatically submit the attempt. */
    function startTimeout(): CancelableTimer {
        return createTimer(timeout, function onTimeout() {
            if (okayToContinue) {
                // No need to timeout if the participant has already fixed the code.
                return;
            }

            fetch('?/submit', {
                method: 'POST',
                keepalive: true,
                body: new URLSearchParams({
                    reason: 'timed-out'
                })
            });
            // Ew, an old-school alert!
            alert("Time's up! Continuing to the survey now...");
            window.location.href = '/post-exercise-questionnaire';
        });
    }

    function startSkipTimer(): CancelableTimer {
        return createTimer(skipTimeout, function onTimeout() {
            enableSkip = true;
        });
    }

    /**
     * Post content to the server to be compiled and run.
     */
    async function runCode() {
        if (!enabled) {
            console.warn('Tried to run code when not logged in.');
            return;
        }

        /* Prepare FormData for the post including the contents */
        let response;
        enableRun = false;
        try {
            response = await runCodeOnServer(content);
        } catch (error) {
            // TODO: show some sort of application error message
            console.error(error);
            return;
        } finally {
            enableRun = true;
        }

        okayToContinue = response.success;
        pem = response.diagnostics || null;
        programOutput = response.output || null;

        if (pem) {
            bottomTab = 'problems';
        } else {
            bottomTab = 'output';
        }
    }

    async function runCodeOnServer(sourceCode: string): Promise<ClientSideRunResult> {
        const formData = new FormData();
        formData.append('language', language);
        formData.append('filename', filename);
        formData.append('sourceCode', sourceCode);

        const res = await fetch('/api/run', {
            method: 'POST',
            body: formData
        });
        return await res.json();
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
                        <li>
                            <form method="POST" action="?/submit">
                                <button
                                    class="btn btn--skip"
                                    type="submit"
                                    name="reason"
                                    value="skipped"
                                    disabled={!(enabled && enableSkip)}>Skip</button
                                >
                            </form>
                        </li>
                        <li>
                            <form method="POST" action="?/submit">
                                <button
                                    class="btn btn--submit"
                                    type="submit"
                                    name="reason"
                                    value="submitted"
                                    disabled={!(enabled && okayToContinue)}>Submit</button
                                >
                            </form>
                        </li>
                        <li class="more-space">
                            <button
                                class="btn btn--run"
                                type="submit"
                                on:click={runCode}
                                disabled={!(enabled && enableRun)}>Run</button
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
                            {#if enableSkip}
                                <p class="report-skip">
                                    If you're stuck, you can press “Skip” to continue.
                                </p>
                            {/if}
                        {/if}
                    {:else if bottomTab == 'output'}
                        {#if !programOutput && pem}
                            <p>Fix the errors, then run the program to see output.</p>
                        {:else if !programOutput}
                            <p>Run the program to see output</p>
                        {:else}
                            <pre class="output"><code>{programOutput}</code></pre>
                            <p class="report-success">
                                Code ran successfully. Press submit to continue.
                            </p>
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

    .btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #fff;
        color: #333;
        font-size: 1rem;
        line-height: 1.5;
        cursor: pointer;
    }

    .btn[disabled] {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .btn--run {
        /* make it a nice "green" play button kind of vibe */
        background-color: #28a745;
        color: #fff;
        border-color: #28a745;
    }
    .btn--run:hover {
        background-color: #218838;
        border-color: #1e7e34;
    }

    .btn--submit {
        /* make it a nice "blue" submit button kind of vibe */
        background-color: #007bff;
        color: #fff;
        border-color: #007bff;
    }
    .btn--submit:hover:not([disabled]) {
        background-color: #0069d9;
        border-color: #0062cc;
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

    .report-skip {
        color: #444;
        font-style: italic;
    }
    @media (prefers-color-scheme: dark) {
        .report-skip {
            color: #ccc;
        }
    }
</style>
