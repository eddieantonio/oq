<script lang="ts">
    import { createTimer, type CancelableTimer } from '$lib/cancelable-timer';
    import Ide from '$lib/components/IDE.svelte';
    import type { RunnableProgram } from '$lib/types';
    import type { ClientSideRunResult } from '$lib/types/client-side-run-results';
    import { onMount } from 'svelte';

    export let data: import('./$types').PageData;
    const { language, filename, initialDiagnostics, timeout, skipTimeout } = data;
    let content = data.initialSourceCode;

    let okayToContinue = false;
    let enableSkip = false;

    // Setup timers, compiles the code for the first time (if the initial
    // diagnostics are not provided)
    onMount(() => {
        indicateExerciseStarted();
        const timeoutTimer = startTimeout();
        const skipTimer = startSkipTimer();

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

    async function runCodeOnServer({
        language,
        filename,
        sourceCode
    }: RunnableProgram): Promise<ClientSideRunResult> {
        const formData = new FormData();
        formData.append('language', language);
        formData.append('filename', filename);
        formData.append('sourceCode', sourceCode);

        const res = await fetch('/api/run', {
            method: 'POST',
            body: formData
        });
        const response = (await res.json()) as ClientSideRunResult;
        okayToContinue = response.success;
        return response;
    }
</script>

<Ide {language} {filename} bind:content {initialDiagnostics} {runCodeOnServer}>
    <svelte:fragment slot="buttons">
        <li>
            <form method="POST" action="?/submit">
                <button
                    class="btn btn--skip"
                    type="submit"
                    name="reason"
                    value="skipped"
                    disabled={!enableSkip}>Skip</button
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
                    disabled={!okayToContinue}>Submit</button
                >
            </form>
        </li>
    </svelte:fragment>

    <svelte:fragment slot="annotate-problems">
        {#if enableSkip}
            <p class="report-skip">If you're stuck, you can press “Skip” to continue.</p>
        {/if}
    </svelte:fragment>
</Ide>

<style>
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
