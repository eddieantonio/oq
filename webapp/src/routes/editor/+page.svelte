<script lang="ts">
    import Ide from '$lib/components/IDE.svelte';

    export let data: import('./$types').PageData;
    const { language, condition, initialDiagnostics, timeout } = data;
    let content = data.initialSourceCode;
</script>

<Ide
    enabled={!!data.participantId}
    {language}
    {content}
    {condition}
    {initialDiagnostics}
    {timeout}
/>
