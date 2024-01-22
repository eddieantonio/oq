<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import type { Diagnostics } from '$lib/types/diagnostics.js';
    import type { Condition } from '$lib/types';

    export let data;
    const pems = data.pems;

    /** Turns 0, 1, 2, ... to A, B, C, ... */
    function indexToLetter(index: number): string {
        return String.fromCharCode('A'.charCodeAt(0) + index);
    }

    function formatToCondition(format: Diagnostics['format']): Condition {
        switch (format) {
            case 'gcc-json':
                return 'control';
            case 'manually-enhanced':
                return 'enhanced';
            case 'llm-enhanced':
                return 'llm-enhanced';
        }
    }
</script>

<h1>How do all three error message compare against each other?</h1>

<h2>You just saw these three error messages:</h2>

{#each pems as pem, index}
    <h3>Message {indexToLetter(index)}</h3>
    <blockquote>
        <DiagnosticDisplay diagnostics={pem} />
    </blockquote>
{/each}

<form method="post">
    <div class="input-group">
        <h2>Which error message did you find the most helpful?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="most-helpful" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <div class="input-group">
        <h2>Which error message did you find the least helpful?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="least-helpful" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <div class="input-group">
        <h2>Which error message did you find the easiest to understand?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="easiest" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <div class="input-group">
        <h2>Which error message did you find the most difficult to understand?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="difficult" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <div class="input-group">
        <h2>Which type of error message would you most want to see in the future?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="most-wanted" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <div class="input-group">
        <h2>Which type of error message would you most least to see in the future?</h2>

        {#each pems as pem, index}
            <label>
                <input type="radio" name="least-wanted" value={formatToCondition(pem.format)} />
                Message {indexToLetter(index)}
            </label>
        {/each}
    </div>

    <ActionBar>
        <button type="submit">Submit</button>
    </ActionBar>
</form>

{#if dev}
    <p>
        <small>
            (<a href="/_debug/answers">See the answers</a>)
        </small>
    </p>
{/if}

<style>
    .input-group > label {
        display: block;
    }
</style>
