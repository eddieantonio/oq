<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import type { Diagnostics } from '$lib/types/diagnostics.js';
    import type { Condition } from '$lib/types';
    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import MultipleChoice from '$lib/components/forms/MultipleChoice.svelte';

    export let data;
    const pems = data.pems;

    let choices = pems.map((_, index) => ({
        label: `Message ${indexToLetter(index)}`,
        value: formatToCondition(pems[index].format)
    }));

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
    <MultipleChoice questionId="most-helpful" {choices}>
        Which error message did you find the most helpful?
    </MultipleChoice>

    <MultipleChoice questionId="least-helpful" {choices}>
        Which error message did you find the least helpful?
    </MultipleChoice>

    <MultipleChoice questionId="easiest" {choices}>
        Which error message did you find the easiest to understand?
    </MultipleChoice>

    <MultipleChoice questionId="difficult" {choices}>
        Which error message did you find the most difficult to understand?
    </MultipleChoice>

    <MultipleChoice questionId="most-wanted" {choices}>
        If you had to see an error message in the future, which style would you <em>most</em> want to
        see?
    </MultipleChoice>

    <MultipleChoice questionId="least-wanted" {choices}>
        If you had to see an error message in the future, which style would you <em>least</em> want to
        see in the future?
    </MultipleChoice>

    <LongAnswer questionId="comparison-elaboration">
        Could you explain your answers above? (optional)
    </LongAnswer>

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
