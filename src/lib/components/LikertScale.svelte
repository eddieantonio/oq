<script lang="ts">
    export let questionId: string;
</script>

<div class="input-group">
    <label for={questionId}><slot /> (1=complete beginner, 7=expert)</label><input
        type="number"
        id={questionId}
        name={questionId}
        min="1"
        max="7"
        step="1"
        value="1"
    />
</div>
