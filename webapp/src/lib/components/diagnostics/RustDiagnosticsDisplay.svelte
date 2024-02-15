<script lang="ts">
    import type { RustDiagnostics } from '$lib/types/diagnostics';

    export let diagnostics: RustDiagnostics;
</script>

{#each diagnostics.diagnostics as diagnostic}
    <pre><code>{diagnostic.rendered}</code></pre>
{/each}
