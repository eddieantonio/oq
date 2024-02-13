<script lang="ts">
    import type { PythonDiagnostics } from '$lib/types/diagnostics';

    /** Diagnostics parsed from a Python traceback. */
    export let diagnostics: PythonDiagnostics;
    $: error = diagnostics.diagnostics;

    /**
     * If given a /path/to/file.ext, returns just file.ext
     */
    function filenameOnly(path: string): string {
        const components = path.split('/');
        return components[components.length - 1] ?? path;
    }

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

<pre><code class="text"
        >{#if error.hasTraceback}<span class="traceback-header"
                >Traceback (most recent call last):</span
            >{'\n'}{/if}{#each error.frames as frame}{'  '}<span class="frame-header"
                >File <span class="filename">"{filenameOnly(frame.filename)}"</span>, line <span
                    class="line-number">{frame.startLineNumber ?? '???'}</span
                >{#if frame.name != null}, in <span class="name">{frame.name}</span>{/if}</span
            >
{#if frame.line != null}{'    '}<span class="code">{frame.line}</span
                >{/if}
{#if frame.marker != null}{'    '}<span class="squiggles">{frame.marker}</span
                >{/if}{'\n'}{/each}<span class="exception">{error.exception}</span
        >: {error.message}</code
    ></pre>

<style>
    /* Styles that are sort of inpsired by IPython/Jupyter's colours. */
    /* Surprisingly, they work both in dark and light modes. */
    :root {
        --ansi-cyan-fg: #60c6c8;
        --ansi-green-fg: #00a250;
        --ansi-red-fg: #e75c58;
    }

    .frame-header {
        color: var(--ansi-cyan-fg);
    }

    .filename,
    .line-number,
    .name {
        color: var(--ansi-green-fg);
    }

    .squiggles,
    .exception {
        color: var(--ansi-red-fg);
    }

    .exception {
        /* This isn't part of IPython/Jupyter's colours, but it SHOULD BE! */
        font-weight: bold;
    }
</style>
