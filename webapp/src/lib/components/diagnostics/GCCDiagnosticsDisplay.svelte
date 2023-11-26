<script lang="ts">
    import type { GCCDiagnostics } from '$lib/types/diagnostics';

    /** Diagnostics emitted by GCC's `--diagnostics-format=json` */
    export let diagnostics: GCCDiagnostics;

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

<pre><code
        >{#each diagnostics.diagnostics as d}{@const location = d.locations[0].caret}<b
                >{location.file}</b
            >:<b>{location.line}</b>:{#if location.column > 0}<b>{location.column}</b>:{/if} <b
                style="color: {d.kind == 'error' ? 'red' : 'orange'}">{d.kind}:</b
            > {d.message}{'\n'}{/each}</code
    ></pre>
