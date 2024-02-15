<script lang="ts">
    import type { RustDiagnostics } from '$lib/types/diagnostics';
    import { AnsiUp } from 'ansi_up';

    export let diagnostics: RustDiagnostics;
    const ansi_up = new AnsiUp();
</script>

{#each diagnostics.diagnostics as diagnostic}
    {#if diagnostic.rendered != null}
        <pre><code>{@html ansi_up.ansi_to_html(diagnostic.rendered)}</code></pre>
    {:else}
        <pre><code>{@html ansi_up.ansi_to_html(diagnostic.message)}</code></pre>
    {/if}
{/each}
