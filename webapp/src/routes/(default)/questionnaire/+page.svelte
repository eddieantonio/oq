<script lang="ts">
    import { dev } from '$app/environment';
    import ActionBar from '$lib/components/forms/ActionBar.svelte';
    import Gender from '$lib/components/forms/Gender.svelte';

    import MultipleChoice from '$lib/components/forms/MultipleChoice.svelte';
</script>

<h1>Demographics</h1>

<form method="post">
    <MultipleChoice
        questionId="programming-experience"
        choices={[
            'None',
            'Very little (0-3 months)',
            'Some (3-6 months)',
            'A good deal (6-12 months)',
            'A lot (1-2 years)',
            'Extensive (2+ years)'
        ]}
    >
        Before this module, how much prior programming experience did you have?
    </MultipleChoice>

    <Gender>What is your gender?</Gender>

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
