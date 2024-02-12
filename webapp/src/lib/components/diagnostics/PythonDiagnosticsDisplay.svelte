<script lang="ts">
    import type { PythonDiagnostics } from '$lib/types/diagnostics';

    /** Diagnostics emitted by GCC's `--diagnostics-format=json` */
    export let diagnostics: PythonDiagnostics;
    $: error = diagnostics.diagnostics;

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

<pre><code
        >{#each error.frames as frame}{'  '}File "{frame.filename}", line {frame.startLineNumber ??
                '???'}{#if frame.name != null}, in {frame.name}{/if}
{#if frame.line != null}{'    '}{frame.line}{/if}
{#if frame.marker != null}{'    '}{frame.marker}{/if}{'\n'}{/each}<span
            class="exception">{error.exception}</span
        >: {error.message}</code
    ></pre>

<style>
    .exception {
        color: red;
    }
</style>
