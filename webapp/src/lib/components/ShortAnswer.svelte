<script lang="ts">
    export let questionId: string;
</script>

<div class="input-group">
    <label for={questionId}><slot /></label>
    <input type="text" id={questionId} name={questionId} value="" />
</div>

<style>
    .input-group {
        display: flex;
        margin-block-end: 0.5rem;
    }
    .input-group > label {
        flex: 2;
    }
    .input-group > input {
        flex: 1;
    }
</style>
