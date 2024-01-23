<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
</script>

<FormGroup>
    <label for={questionId} class="label"><slot /></label>
    <input type="text" id={questionId} name={questionId} value="" class="input" />
</FormGroup>
