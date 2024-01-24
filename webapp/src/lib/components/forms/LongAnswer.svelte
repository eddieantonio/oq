<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
    export let optional: boolean = false;
    $: required = !optional;
</script>

<FormGroup>
    <label for={questionId} class="label"
        ><slot />{#if required}<span class="required">*</span>{:else}{' '}(optional){/if}</label
    >
    <textarea id={questionId} name={questionId} {required} value="" class="input" />
</FormGroup>

<style>
    textarea {
        /* Only allow vertical resizing */
        resize: vertical;
        /* Stole this from Bootstrap: */
        min-height: calc(1.5em + (0.75rem + 2px));
    }
</style>
