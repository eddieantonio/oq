<script lang="ts">
    import { dev } from '$app/environment';

    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import DiagnosticDisplay from '$lib/components/DiagnosticDisplay.svelte';
    import LongAnswer from '$lib/components/forms/LongAnswer.svelte';
    import MultipleChoice from '$lib/components/forms/MultipleChoice.svelte';

    export let data;
    const { styles } = data;

    let choices = styles.map(({ condition }, index) => ({
        label: `Style ${indexToLetter(index)}`,
        value: condition
    }));

    /** Turns 0, 1, 2, ... → A, B, C, ... */
    function indexToLetter(index: number): string {
        return String.fromCharCode('A'.charCodeAt(0) + index);
    }
</script>

<h1>How do all three error message explanation styles compare against each other?</h1>

<h2>You just saw these <strong>three styles</strong> of error message and explanations:</h2>

<div class="breakout">
    <div class="style-side-by-side">
        {#each styles as style, index}
            <div class="style">
                <h3 class="style__header">Style {indexToLetter(index)}</h3>
                <div class="diagnostic-preview">
                    {#each style.pems as pem, index}
                        <h4 class="diagnostic__header">Message {index + 1}</h4>
                        <DiagnosticDisplay diagnostics={pem} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<form method="post">
    <MultipleChoice questionId="most-helpful" {choices}>
        Which error message did you find the most helpful?
    </MultipleChoice>

    <MultipleChoice questionId="least-helpful" {choices}>
        Which error message did you find the least helpful?
    </MultipleChoice>

    <MultipleChoice questionId="easiest" {choices}>
        Which error message did you find the <em>easiest</em> to understand?
    </MultipleChoice>

    <MultipleChoice questionId="difficult" {choices}>
        Which error message did you find the most <em>difficult</em> to understand?
    </MultipleChoice>

    <MultipleChoice questionId="most-wanted" {choices}>
        If you had to see an unfamiliar error message in the future, which style would you <em
            >most</em
        > want to see?
    </MultipleChoice>

    <MultipleChoice questionId="least-wanted" {choices}>
        If you had to see an unfamiliar error message in the future, which style would you <em
            >least</em
        > want to see in the future?
    </MultipleChoice>

    <LongAnswer questionId="comparison-elaboration" optional>
        Could you explain your answers above?
    </LongAnswer>

    <!-- We scramble the styles, but the participant my say "I like style A the
    most" and then we have to figure out what they meant by that. This will send
    the styles in the order that the participant saw them in order for us to
    unscramble later. -->
    <input
        type="hidden"
        name="_conditions"
        value={styles.map(({ condition }) => condition).join(',')}
    />

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
    /* https://stackoverflow.com/a/37964247/6626414 */
    .breakout {
        margin-inline: calc(50% - 50vw);
        background-color: var(--nc-bg-2);
        box-shadow: 0 4px 8px var(--nc-bg-3);
    }

    .style {
        flex: 1;
        width: calc(100% / 3 - 3rem);
    }

    .style__header {
        text-align: center;
    }

    .style-side-by-side {
        display: flex;
        margin-block: 1rem 2rem;
        margin-inline: 1.5rem;
        padding-block: 1rem;
        flex-flow: row nowrap;
        justify-content: space-between;
        overflow: hidden;
        gap: 2rem;
    }

    .diagnostic-preview {
        overflow-y: scroll;
        max-height: 450px;
    }

    /* Hack to add a little space between the error messages: */
    .diagnostic__header:not(:first-child) {
        margin-block-start: 2em;
    }

    /* Add a line under the header */
    .diagnostic__header::after {
        content: '';
        display: block;
        border-bottom: 1px solid var(--nc-bg-3);
        margin-block: 0.5rem;
    }
</style>
