<script lang="ts">
    import Ide from '$lib/components/IDE.svelte';
    import type { RunnableProgram } from '$lib/types';
    import type { ClientSideRunResult } from '$lib/types/client-side-run-results';

    export let data: import('./$types').PageData;
    const { language, filename, initialDiagnostics, initialSourceCode } = data;
    let content = initialSourceCode;

    async function runCodeOnServer({
        language,
        filename,
        sourceCode
    }: RunnableProgram): Promise<ClientSideRunResult> {
        const body = new FormData();
        body.append('DEBUG', '1');
        body.append('language', language);
        body.append('filename', filename);
        body.append('sourceCode', sourceCode);
        const res = await fetch('/api/run', {
            method: 'POST',
            body
        });
        return await res.json();
    }
</script>

<Ide {filename} {language} bind:content {initialDiagnostics} {runCodeOnServer} />
