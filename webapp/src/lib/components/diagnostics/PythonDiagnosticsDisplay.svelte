<script lang="ts">
    import type { PythonDiagnostics } from '$lib/types/diagnostics';

    /** Diagnostics emitted by GCC's `--diagnostics-format=json` */
    export let diagnostics: PythonDiagnostics;
    $: error = diagnostics.diagnostics;

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

<pre><code class="text"
        ><span class="traceback-header">Traceback (most recent call last):</span
        >{'\n'}{#each error.frames as frame}{'  '}File <span class="filename"
                >"{frame.filename}"</span
            >, line <span class="number">{frame.startLineNumber ?? '???'}</span
            >{#if frame.name != null}, in <span class="name">{frame.name}</span
                >{/if}
{#if frame.line != null}{'    '}<span class="code">{frame.line}</span
                >{/if}
{#if frame.marker != null}{'    '}<span class="squiggles">{frame.marker}</span
                >{/if}{'\n'}{/each}<span class="exception">{error.exception}</span
        >: {error.message}</code
    ></pre>

<style>
    .text {
        color: #3f7eb4;
    }
    .filename,
    .number,
    .name {
        color: #006400;
    }
    .exception,
    .code {
        color: #8d0908;
    }
    .squiggles {
        color: red;
    }

    .exception {
        font-weight: bold;
    }

    @media (prefers-color-scheme: dark) {
        .text {
            color: #74b3ea;
        }
        .filename,
        .number,
        .name {
            color: #46c746;
        }
        .code {
            color: #ffa0b0;
        }
        .exception,
        .squiggles {
            color: red;
        }
    }
</style>
