<script lang="ts">
    import type { Diagnostics } from '$lib/types/diagnostics';
    import GCCDiagnosticsDisplay from './diagnostics/GCCDiagnosticsDisplay.svelte';
    import LLMDiagnosticsDisplay from './diagnostics/LLMDiagnosticsDisplay.svelte';
    import ManuallyEnhancedDiagnosticsDisplay from './diagnostics/ManuallyEnhancedDiagnosticsDisplay.svelte';

    /**
     * The diagnostics object returned by the code execution server.
     */
    export let diagnostics: Diagnostics;
</script>

{#if diagnostics.format === 'gcc-json'}
    <GCCDiagnosticsDisplay {diagnostics} />
{:else if diagnostics.format === 'llm-enhanced'}
    <LLMDiagnosticsDisplay {diagnostics} />
{:else if diagnostics.format === 'manually-enhanced'}
    <ManuallyEnhancedDiagnosticsDisplay {diagnostics} />
{:else if diagnostics.format === 'preformatted'}
    <pre><code class="problem">{diagnostics.plainText}</code></pre>
{/if}

<style>
    .problem {
        color: red;
    }
</style>
