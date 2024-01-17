<script lang="ts">
    import * as marked from 'marked';

    import type { LLMEnhancedDiagnostics } from '$lib/types/diagnostics';
    import DiagnosticDisplay from '../DiagnosticDisplay.svelte';

    export let diagnostics: LLMEnhancedDiagnostics;
</script>

<blockquote>
    <DiagnosticDisplay diagnostics={diagnostics.original} />
</blockquote>
{@html marked.parse(diagnostics.markdown)}
