<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
</script>

<FormGroup>
    <label for={questionId} class="label"><slot /></label>
    <textarea id={questionId} name={questionId} value="" class="input" />
</FormGroup>

<style>
    textarea {
        /* Only allow vertical resizing */
        resize: vertical;
        /* Stole this from Bootstrap: */
        min-height: calc(1.5em + (0.75rem + 2px));
    }
</style>
