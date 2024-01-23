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
                <input type="radio" name={questionId} value={choice} />
                {choice}
            </label>
        {/each}
    </div>
</FormGroup>

<style>
    .choice {
        box-sizing: border-box;
        outline: 1px solid goldenrod;
        display: block;
        padding-inline-start: 1rem;
        width: 100%;
        line-height: 1.5;
        cursor: pointer;
    }

    .choice input {
        margin-inline-end: 0.5em;
    }

    .choice:hover {
        background-color: var(--nc-bg-2);
    }
</style>
