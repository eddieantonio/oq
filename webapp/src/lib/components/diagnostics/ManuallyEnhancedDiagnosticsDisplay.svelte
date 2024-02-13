<script lang="ts">
    import type { ManuallyEnhancedDiagnostic } from '$lib/types/diagnostics';
    import Markdown from '../Markdown.svelte';

    export let diagnostics: ManuallyEnhancedDiagnostic;
</script>

<Markdown markdown={diagnostics.markdown} />
