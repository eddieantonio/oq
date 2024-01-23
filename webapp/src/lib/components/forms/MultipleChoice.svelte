<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let choices: string[];
</script>

<FormGroup>
    <p class="label"><slot /></p>
    <div>
        {#each choices as choice}
            <label class="choice">
                <input type="radio" name={questionId} value={choice} class="choice__control" />
                {choice}
            </label>
        {/each}
    </div>
</FormGroup>
