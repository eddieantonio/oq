<script lang="ts">
    import * as marked from 'marked';
    import { onMount } from 'svelte';

    // Add a data-lang attribute to all code blocks with a language annotation
    marked.use({
        renderer: {
            code(code: string, lang: string | undefined, escaped: boolean) {
                const attr = lang ? ` data-lang="${lang}"` : '';
                return `<pre><code${attr}>${code}</code></pre>`;
            }
        }
    });

    export let markdown: string;
    let component: HTMLElement | undefined;

    onMount(async () => {
        const monacoModule = await import('$lib/monaco');
        const monaco = monacoModule.monaco;

        if (component) {
            // Get all [data-lang] elements and render them
            const elements = component.querySelectorAll<HTMLElement>('[data-lang]');
            elements.forEach(
                (element) =>
                    void monaco.editor.colorizeElement(element, {
                        theme: prefersDarkMode() ? 'vs-dark' : 'vs'
                    })
            );
        }
    });

    function prefersDarkMode(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
</script>

<div bind:this={component} class="markdown">
    {@html marked.parse(markdown)}
</div>
