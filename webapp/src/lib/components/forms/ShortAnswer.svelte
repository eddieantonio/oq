<script lang="ts">
    import FormGroup from './FormGroup.svelte';

    export let questionId: string;
</script>

<FormGroup>
    <label for={questionId} class="label"><slot /><span class="required">*</span></label>
    <input
        type="text"
        id={questionId}
        name={questionId}
        required
        value=""
        class="input"
        placeholder="Type your answer here"
    />
</FormGroup>
