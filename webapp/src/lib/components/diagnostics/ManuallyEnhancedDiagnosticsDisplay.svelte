<script lang="ts">
    import { marked } from 'marked';

    import type { ManuallyEnhancedDiagnostic } from '$lib/types/diagnostics';

    export let diagnostics: ManuallyEnhancedDiagnostic;
</script>

{@html marked.parse(diagnostics.markdown)}
