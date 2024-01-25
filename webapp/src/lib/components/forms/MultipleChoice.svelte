<script lang="ts">
    import { shuffled } from '$lib/random';
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let choices: (string | { label: string; value: string })[];
    export let randomized: boolean = false;

    $: normalizedChoices = possiblyRandomizeChoices().map(normalize);

    function possiblyRandomizeChoices() {
        if (randomized) return shuffled(choices);
        return choices;
    }

    function normalize(choice: string | { label: string; value: string }) {
        return typeof choice === 'string'
            ? {
                  label: choice,
                  value: choice
              }
            : choice;
    }
</script>

<FormGroup>
    <p class="label"><slot /><span class="required">*</span></p>
    <div>
        {#each normalizedChoices as { label, value }}
            <label class="choice">
                <input type="radio" name={questionId} required {value} class="choice__control" />
                {label}
            </label>
        {/each}
    </div>
</FormGroup>
