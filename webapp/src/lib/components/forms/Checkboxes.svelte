<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let options: string[];
</script>

<FormGroup>
    <p class="label"><slot /></p>
    <div>
        {#each options as option}
            <label class="choice">
                <input type="checkbox" name={questionId} value={option} class="choice__control" />
                {option}
            </label>
        {/each}
    </div>
</FormGroup>

<style>
    .choice {
        outline: 1px solid rosybrown;
    }
</style>
