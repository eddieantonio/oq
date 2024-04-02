<script lang="ts">
    import type { RustDiagnostic, RustDiagnostics } from '$lib/types/diagnostics';
    import { AnsiUp } from 'ansi_up';

    export let diagnostics: RustDiagnostics;
    export let showDiagnosticWindow: boolean = true;
    const ansi_up = new AnsiUp();

    function getMessage(diagnostic: RustDiagnostic): string {
        const output = diagnostic.rendered ?? diagnostic.message;
        return showDiagnosticWindow ? output : firstLine(output);
    }

    function firstLine(message: string): string {
        return message.split('\n')[0];
    }
</script>

{#each diagnostics.diagnostics as diagnostic}
    <pre><code>{@html ansi_up.ansi_to_html(getMessage(diagnostic))}</code></pre>
{/each}
