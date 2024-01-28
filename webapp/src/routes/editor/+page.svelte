<script lang="ts">
    import Ide from '$lib/components/IDE.svelte';

    export let data: import('./$types').PageData;
    const { language, initialDiagnostics, timeout, skipTimeout } = data;
    let content = data.initialSourceCode;
</script>

<Ide
    enabled={!!data.participantId}
    {language}
    {content}
    {initialDiagnostics}
    {timeout}
    {skipTimeout}
/>
