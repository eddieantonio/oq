<script lang="ts">
    import type { Diagnostics } from '$lib/types/diagnostics';
    import GCCDiagnosticsDisplay from './diagnostics/GCCDiagnosticsDisplay.svelte';
    import LLMDiagnosticsDisplay from './diagnostics/LLMDiagnosticsDisplay.svelte';

    /**
     * The diagnostics object returned by the RCE server.
     */
    export let diagnostics: Diagnostics;

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

{#if diagnostics.format === 'gcc-json'}
    <GCCDiagnosticsDisplay {diagnostics} />
{:else if diagnostics.format === 'llm-enhanced'}
    <LLMDiagnosticsDisplay {diagnostics} />
{:else}
    <pre class="problem"><code>{JSON.stringify(diagnostics, null, 4)}</code></pre>
{/if}

<style>
    .problem {
        color: red;
    }
</style>
