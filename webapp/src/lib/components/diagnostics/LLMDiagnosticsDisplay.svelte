<script lang="ts">
    import type { LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
    import DiagnosticDisplay from '../DiagnosticDisplay.svelte';
    import PythonDiagnosticsDisplay from './PythonDiagnosticsDisplay.svelte';
    import Markdown from '../Markdown.svelte';
    import RustDiagnosticsDisplay from './RustDiagnosticsDisplay.svelte';

    export let diagnostics: LLMEnhancedDiagnostics;
    $: original = diagnostics.original;
</script>

<p><strong>Error Message:</strong></p>
<blockquote>
    {#if original.format == 'parsed-python'}<!-- Show only the last line of a Python error message. -->
        <PythonDiagnosticsDisplay diagnostics={original} showTraceback={false} />
    {:else if original.format == 'rustc-json'}
        <RustDiagnosticsDisplay diagnostics={original} showDiagnosticWindow={false} />
    {:else}
        <DiagnosticDisplay diagnostics={original} />
    {/if}
</blockquote>
<p><strong>Explanation:</strong></p>
<Markdown markdown={diagnostics.markdown} />
