<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let choices: string[];

    $: normalizedChoices = choices.map((choice) => {
        return {
            label: choice,
            value: choice
        };
    });
</script>

<FormGroup>
    <p class="label"><slot /></p>
    <div>
        {#each normalizedChoices as { label, value }}
            <label class="choice">
                <input type="radio" name={questionId} {value} class="choice__control" />
                {label}
            </label>
        {/each}
    </div>
</FormGroup>
