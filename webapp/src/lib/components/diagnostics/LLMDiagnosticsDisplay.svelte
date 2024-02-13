<script lang="ts">
    import * as marked from 'marked';

    import type { LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
    import DiagnosticDisplay from '../DiagnosticDisplay.svelte';
    import PythonDiagnosticsDisplay from './PythonDiagnosticsDisplay.svelte';

    export let diagnostics: LLMEnhancedDiagnostics;
    $: original = diagnostics.original;
</script>

<p><strong>Error Message:</strong></p>
<blockquote>
    {#if original.format == 'parsed-python'}<!-- Show only the last line of a Python error message. -->
        <PythonDiagnosticsDisplay diagnostics={original} showTraceback={false} />
    {:else}
        <DiagnosticDisplay diagnostics={original} />
    {/if}
</blockquote>
<p><strong>Explanation:</strong></p>
{@html marked.parse(diagnostics.markdown)}
