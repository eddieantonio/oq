<script lang="ts">
    /**
     * The diagnostics object returned by the RCE server.
     */
    export let diagnostics: Diagnostics;

    // This code is ugly af because <pre> is sensitive to whitespace and
    // Prettier does not care about my indenting preferences.
</script>

{#if diagnostics.format === 'gcc-json'}
    <pre><code
            >{#each diagnostics.diagnostics as d}{@const location = d.locations[0].caret}<b
                    >{location.file}</b
                >:<b>{location.line}</b>:{#if location.column > 0}<b>{location.column}</b>:{/if} <b
                    style="color: {d.kind == 'error' ? 'red' : 'orange'}">{d.kind}:</b
                > {d.message}{'\n'}{/each}</code
        ></pre>
{:else}
    <pre class="problem"><code>{JSON.stringify(diagnostics, null, 4)}</code></pre>
{/if}

<style>
    .problem {
        color: red;
    }
</style>
