<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let choices: (string | { label: string; value: string })[];

    $: normalizedChoices = choices.map((choice) => {
        return typeof choice === 'string'
            ? {
                  label: choice,
                  value: choice
              }
            : choice;
    });
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
