<script lang="ts">
    import * as marked from 'marked';

    import type { LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
    import DiagnosticDisplay from '../DiagnosticDisplay.svelte';

    export let diagnostics: LLMEnhancedDiagnostics;
</script>

<p><strong>Error Message:</strong></p>
<blockquote>
    <DiagnosticDisplay diagnostics={diagnostics.original} />
</blockquote>
<p><strong>Explanation:</strong></p>
{@html marked.parse(diagnostics.markdown)}
